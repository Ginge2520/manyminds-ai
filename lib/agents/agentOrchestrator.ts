import { agentProfiles, defaultAgentIds, type AgentId, type AgentMessageType, type AgentProfile, isAgentId } from "./agentProfiles";
import { runOllamaChat, type AiChatMessage } from "@/lib/ai/providers/ollamaProvider";
import { runOpenAIResponse } from "@/lib/ai/providers/openaiProvider";

export type AgentRunMode = "standard" | "debate" | "finalise";
export type AgentProvider = "ollama" | "openai";

export interface AgentRunPlan {
  id: string;
  debateMode: boolean;
  maxAgents: number | null;
  provider: AgentProvider;
  defaultModel: string;
}

export interface AgentTeamMessage {
  id: string;
  agentId: AgentId;
  agentName: string;
  role: string;
  avatarEmoji: string;
  content: string;
  messageType: AgentMessageType;
  confidence: number;
  assumptions: string[];
  evidenceNeeded: string[];
  nextAction: string;
  timestamp: string;
}

export interface RunAgentTeamInput {
  userTask: string;
  selectedAgentIds?: string[];
  mode?: AgentRunMode;
  provider?: AgentProvider;
  plan: AgentRunPlan;
}

interface ModelMessagePayload {
  content?: string;
  messageType?: AgentMessageType;
  confidence?: number;
  assumptions?: string[];
  evidenceNeeded?: string[];
  nextAction?: string;
}

export class AgentOrchestratorError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AgentOrchestratorError";
    this.code = code;
  }
}

const messageTypes: AgentMessageType[] = ["idea", "evidence", "challenge", "decision", "action", "summary", "risk"];

export async function runAgentTeam({ userTask, selectedAgentIds, mode = "standard", provider, plan }: RunAgentTeamInput) {
  const task = userTask.trim();
  if (!task) {
    throw new AgentOrchestratorError("Add a task for the agents to work on.", "empty_task");
  }

  if (mode === "debate" && !plan.debateMode) {
    throw new AgentOrchestratorError("Debate Mode is not available on the current plan.", "upgrade_required");
  }

  const agentIds = resolveAgentIds(selectedAgentIds, mode, plan.maxAgents);
  const activeProvider = provider || plan.provider;

  if (mode === "debate") {
    return runDebateMode(task, activeProvider, plan);
  }

  if (mode === "finalise") {
    return runFinaliseMode(task, activeProvider, plan);
  }

  return runStandardMode(task, agentIds, activeProvider, plan);
}

function resolveAgentIds(selectedAgentIds: string[] | undefined, mode: AgentRunMode, maxAgents: number | null) {
  const ids = (selectedAgentIds?.length ? selectedAgentIds : defaultAgentIds).filter(isAgentId);
  const uniqueIds = Array.from(new Set(ids));
  const resolved = uniqueIds.length ? uniqueIds : defaultAgentIds;

  if (mode === "debate") {
    return ["researcher", "critic", "compliance", "strategist"] satisfies AgentId[];
  }

  if (mode === "finalise") {
    return ["builder", "critic", "strategist"] satisfies AgentId[];
  }

  return maxAgents === null ? resolved : resolved.slice(0, maxAgents);
}

async function runStandardMode(task: string, agentIds: AgentId[], provider: AgentProvider, plan: AgentRunPlan) {
  const messages: AgentTeamMessage[] = [];

  for (const agentId of agentIds) {
    messages.push(await askAgent(agentProfiles[agentId], task, messages, provider, plan, "standard"));
  }

  return messages;
}

async function runDebateMode(task: string, provider: AgentProvider, plan: AgentRunPlan) {
  const debateOrder: AgentId[] = ["researcher", "critic", "compliance", "strategist"];
  const messages: AgentTeamMessage[] = [];

  for (const agentId of debateOrder) {
    const instruction =
      agentId === "critic"
        ? "Challenge the strongest assumption in the team's direction. Be sharp, but not rude."
        : agentId === "researcher"
          ? "Request the most important evidence needed before choosing a direction."
          : agentId === "compliance"
            ? "Flag privacy, safety, unclear claim, or operational risks."
            : "Summarise the final decision and explain why it is the most sensible next move.";

    messages.push(await askAgent(agentProfiles[agentId], `${task}\n\nDebate instruction: ${instruction}`, messages, provider, plan, "debate"));
  }

  return messages;
}

async function runFinaliseMode(task: string, provider: AgentProvider, plan: AgentRunPlan) {
  const finaliseOrder: AgentId[] = ["builder", "critic", "strategist"];
  const messages: AgentTeamMessage[] = [];

  for (const agentId of finaliseOrder) {
    const instruction =
      agentId === "builder"
        ? "Create the structured final output with sections, bullets, and practical next steps."
        : agentId === "critic"
          ? "Review the output for weak claims, missing detail, unclear scope, and quality gaps."
          : "Create the final summary and recommended next action for the user.";

    messages.push(await askAgent(agentProfiles[agentId], `${task}\n\nFinalise instruction: ${instruction}`, messages, provider, plan, "finalise"));
  }

  return messages;
}

async function askAgent(
  agent: AgentProfile,
  task: string,
  previousMessages: AgentTeamMessage[],
  provider: AgentProvider,
  plan: AgentRunPlan,
  mode: AgentRunMode,
) {
  const jsonInstruction = [
    "Return only valid JSON with these fields:",
    "{",
    '  "content": "short useful message",',
    '  "messageType": "idea | evidence | challenge | decision | action | summary | risk",',
    '  "confidence": 0.0,',
    '  "assumptions": ["short assumption"],',
    '  "evidenceNeeded": ["short evidence need"],',
    '  "nextAction": "short next action"',
    "}",
    "Keep the answer concise. Include light professional wit only when it helps clarity.",
  ].join("\n");

  const context = previousMessages.length
    ? previousMessages.map((message) => `${message.agentName} (${message.role}): ${message.content}`).join("\n\n")
    : "No previous agent messages yet.";

  const userPrompt = [
    `Original user task: ${task}`,
    `Mode: ${mode}`,
    "Previous visible agent messages:",
    context,
    jsonInstruction,
  ].join("\n\n");

  const content =
    provider === "openai"
      ? await runOpenAIResponse({
          model: plan.defaultModel,
          instructions: agent.systemPrompt,
          input: userPrompt,
        })
      : await runOllamaChat({
          model: agent.defaultModel || plan.defaultModel,
          messages: [
            { role: "system", content: agent.systemPrompt },
            { role: "user", content: userPrompt },
          ] satisfies AiChatMessage[],
        });

  return buildMessage(agent, parseModelMessage(content), mode);
}

function parseModelMessage(raw: string): ModelMessagePayload {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as ModelMessagePayload;
    return parsed;
  } catch {
    return {
      content: raw.trim(),
      messageType: "idea",
      confidence: 0.6,
      assumptions: [],
      evidenceNeeded: ["Model returned plain text, so evidence needs were not structured."],
      nextAction: "Review this response and run again if a stricter structured answer is needed.",
    };
  }
}

function buildMessage(agent: AgentProfile, payload: ModelMessagePayload, mode: AgentRunMode): AgentTeamMessage {
  const messageType = payload.messageType && messageTypes.includes(payload.messageType) ? payload.messageType : fallbackMessageType(agent, mode);

  return {
    id: crypto.randomUUID(),
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
    avatarEmoji: agent.avatarEmoji,
    content: payload.content?.trim() || "I need a little more context before I can give a useful answer.",
    messageType,
    confidence: clampConfidence(payload.confidence),
    assumptions: normaliseStringList(payload.assumptions),
    evidenceNeeded: normaliseStringList(payload.evidenceNeeded),
    nextAction: payload.nextAction?.trim() || "Continue the team run.",
    timestamp: new Date().toISOString(),
  };
}

function fallbackMessageType(agent: AgentProfile, mode: AgentRunMode): AgentMessageType {
  if (mode === "finalise" && agent.id === "strategist") return "summary";
  if (mode === "debate" && agent.id === "strategist") return "decision";
  return agent.messageTypes[0] || "idea";
}

function clampConfidence(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(number)) return 0.6;
  return Math.max(0, Math.min(1, number));
}

function normaliseStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 5);
}
