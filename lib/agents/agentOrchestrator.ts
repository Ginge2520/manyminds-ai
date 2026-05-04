import { agentProfiles, defaultAgentIds, type AgentId, type AgentMessageType, type AgentProfile, isAgentId } from "./agentProfiles";
import { runOllamaChat, type AiChatMessage } from "@/lib/ai/providers/ollamaProvider";
import { runOpenAIResponse } from "@/lib/ai/providers/openaiProvider";

export type AgentRunMode = "standard" | "debate" | "developer";
export type AgentProvider = "ollama" | "openai";

export interface AgentRunPlan {
  id: string;
  debateMode: boolean;
  modes?: AgentRunMode[];
  maxAgents: number | null;
  provider: AgentProvider;
  defaultModel: string;
  developerDemoMode?: boolean;
}

export interface AgentTeamMessage {
  id: string;
  agentId: AgentId;
  agentName: string;
  role: string;
  avatarEmoji: string;
  replyToAgentId?: AgentId;
  content: string;
  messageType: AgentMessageType;
  confidence: number;
  assumptions: string[];
  evidenceNeeded: string[];
  reasoningSummary?: string;
  evidenceUsed?: string[];
  evidenceGaps?: string[];
  tradeOffs?: string[];
  decisionLog?: string[];
  risks?: string[];
  implementationSteps?: string[];
  testsOrChecks?: string[];
  sourceLinks?: string[];
  toolActionsTaken?: string[];
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
  reasoningSummary?: string;
  evidenceUsed?: string[];
  evidenceGaps?: string[];
  tradeOffs?: string[];
  decisionLog?: string[];
  risks?: string[];
  implementationSteps?: string[];
  testsOrChecks?: string[];
  sourceLinks?: string[];
  toolActionsTaken?: string[];
  nextAction?: string;
}

type ConversationIntent = "lead" | "internal" | "final";

interface DeveloperMockContent {
  content: string;
  reasoningSummary: string;
  evidenceUsed: string[];
  evidenceGaps: string[];
  assumptions: string[];
  tradeOffs: string[];
  decisionLog: string[];
  risks: string[];
  implementationSteps: string[];
  testsOrChecks: string[];
  sourceLinks: string[];
  toolActionsTaken: string[];
  nextAction: string;
  messageType: AgentMessageType;
  confidence: number;
}

export class AgentOrchestratorError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AgentOrchestratorError";
    this.code = code;
  }
}

const messageTypes: AgentMessageType[] = ["idea", "evidence", "challenge", "decision", "action", "summary", "risk", "funny", "analysis", "architecture", "implementation", "test"];

export async function runAgentTeam({ userTask, selectedAgentIds, mode = "standard", provider, plan }: RunAgentTeamInput) {
  const task = userTask.trim();
  if (!task) {
    throw new AgentOrchestratorError("Add a task for the agents to work on.", "empty_task");
  }

  if (mode === "debate" && !plan.debateMode) {
    throw new AgentOrchestratorError("Debate Mode is not available on the current plan.", "upgrade_required");
  }

  if (mode === "developer" && !plan.modes?.includes("developer")) {
    throw new AgentOrchestratorError("Developer Mode is available on Pro and above.", "upgrade_required");
  }

  const agentIds = resolveAgentIds(selectedAgentIds, mode, plan.maxAgents);
  const activeProvider = provider || plan.provider;

  if (mode === "debate") {
    return runDebateMode(task, activeProvider, plan);
  }

  if (mode === "developer") {
    return runDeveloperMode(task, activeProvider, plan);
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

  if (mode === "developer") {
    return ["strategist", "researcher", "designer", "builder", "critic", "compliance"] satisfies AgentId[];
  }

  return maxAgents === null ? resolved : resolved.slice(0, maxAgents);
}

async function runStandardMode(task: string, agentIds: AgentId[], provider: AgentProvider, plan: AgentRunPlan) {
  const messages: AgentTeamMessage[] = [];
  const teamList = agentIds.map((agentId) => `${agentProfiles[agentId].nickname} (${agentProfiles[agentId].role})`).join(", ");
  const leadAgent = chooseLeadAgent(task, agentIds);
  const supportAgents = agentIds.filter((agentId) => agentId !== leadAgent);

  const upfrontQuestion = upfrontClarificationQuestion(task);
  if (upfrontQuestion) {
    return [createClarificationMessage(agentProfiles[leadAgent], upfrontQuestion)];
  }

  messages.push(
    await askAgent(
      agentProfiles[leadAgent],
      task,
      messages,
      provider,
      plan,
      "standard",
      [
        `Phase: lead reply. Your team is ${teamList}.`,
        "You are the best lead agent for this task. Reply directly to the user first.",
        taskDeliverableInstruction(task),
        "Do actual work immediately. Give the first useful version of the answer, draft, plan, list, structure, or build outline the user can use.",
        "Do not open with a generic question unless the task is impossible without one.",
        supportAgents.length
          ? `Invite the support agents to help by mentioning one or two of them with @nickname. Available support: ${supportAgents.map((agentId) => `@${agentProfiles[agentId].nickname}`).join(", ")}.`
          : "If you are alone, move directly toward the answer.",
      ].join("\n"),
      "lead",
    ),
  );
  if (isClarificationRequest(messages[messages.length - 1].content)) return messages;

  for (const agentId of supportAgents) {
    const otherAgents = agentIds
      .filter((id) => id !== agentId)
      .map((id) => agentProfiles[id].nickname)
      .join(" or ");

    messages.push(
      await askAgent(
        agentProfiles[agentId],
        task,
        messages,
        provider,
        plan,
        "standard",
        [
          `Phase: support chat. Your team is ${teamList}.`,
          `Do not address the user directly unless you need clarification. Talk to the other agents as a team member.`,
          "Directly answer, challenge, or build on the most recent teammate message. Mention a specific detail they said so it feels like a real reply, not a standalone speech.",
          "Do not start with 'Here is our refined...' or 'Here is the concept...' unless you are the final lead answer. In teammate chat, respond like a person in a group chat.",
          otherAgents ? `Reply to or question one named teammate using @${otherAgents.split(" or ")[0]}.` : "If you are alone, move directly toward the answer.",
          taskDeliverableInstruction(task),
          "Do not say what you would do. Actually add useful material: draft text, feature decisions, build steps, UX improvements, evidence checks, risks, or a better answer.",
          "If a teammate made a weak point, challenge it directly and replace it with a stronger one.",
        ].join("\n"),
        "internal",
      ),
    );
    if (isClarificationRequest(messages[messages.length - 1].content)) return messages;
  }

  if (supportAgents.length) {
    messages.push(createFunnyReply(task, agentIds, messages));
  }

  for (const agentId of supportAgents) {
    messages.push(
      await askAgent(
        agentProfiles[agentId],
        task,
        messages,
        provider,
        plan,
        "standard",
        [
          "Phase: internal collaboration. Read the previous team messages closely.",
          "Keep chatting with the other agents, not the user, unless a clarification is genuinely needed.",
          "Answer any question aimed at you. Challenge, improve, or build on a teammate's point by naming them with their @nickname, such as @Chat, @Gem, @Cloud, @Pilot, @Rok, or @Peri.",
          "Make the first sentence a real reply to the latest useful teammate comment. Use phrases like 'Yes, and...', 'I disagree with...', 'That misses...', or 'Good point, but...'.",
          "Do not reply to the Funny aside. Reply to the latest useful work message.",
          taskDeliverableInstruction(task),
          "Help the lead agent reach a concrete answer by adding usable deliverable content. If information is missing, say exactly what clarification the lead should ask the user.",
          "Avoid status updates. Every message must move the task forward.",
          "Keep it conversational, as if this is a live group chat.",
        ].join("\n"),
        "internal",
      ),
    );
    if (isClarificationRequest(messages[messages.length - 1].content)) return messages;
  }

  const finalMessage = await askAgent(
    agentProfiles[leadAgent],
    task,
    messages,
    provider,
    plan,
    "standard",
    [
      "Phase: close or clarify.",
      "You are the lead agent. Reply directly to the user.",
      taskDeliverableInstruction(task),
      "Create the team's best final answer now, using the useful points from the internal discussion. Include a concrete deliverable, not a description of a process.",
      "For final answers, write at least 5 useful bullets or short sections. A title alone is a failed answer.",
      "Prefer headings, bullets, steps, examples, or task lists when they make the answer more usable.",
      "If the task cannot be completed without more user input, ask exactly one clear clarification question instead of pretending to finish.",
      "Make it obvious whether this is a completed answer or a user clarification request.",
    ].join("\n"),
    "final",
  );
  messages.push(ensureFinalDeliverable(finalMessage, task, messages));

  return messages;
}

function ensureFinalDeliverable(message: AgentTeamMessage, task: string, previousMessages: AgentTeamMessage[]) {
  if (isClarificationRequest(message.content)) return message;
  if (!isThinFinalAnswer(message.content, task)) return message;

  return {
    ...message,
    content: buildFallbackDeliverable(task, previousMessages),
    messageType: "summary" as const,
    confidence: Math.max(message.confidence, 0.86),
    assumptions: [...message.assumptions, "The model returned a thin summary, so ManyMinds created a usable structured draft."].slice(0, 5),
  };
}

function isThinFinalAnswer(content: string, task: string) {
  const cleaned = content.replace(/^final answer:\s*/i, "").trim();
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  const hasStructure = /(\n-|\n\d+\.|core loop|mechanic|feature|task|roadmap|step|persona|risk|decision)/i.test(cleaned);
  const lowerTask = task.toLowerCase();

  if (/(game|flappy|mobile game|flappy birds)/.test(lowerTask)) {
    const requiredSignals = ["core loop", "mechanic", "progression", "first build", "tasks", "controls"];
    const signalCount = requiredSignals.filter((signal) => cleaned.toLowerCase().includes(signal)).length;
    return wordCount < 130 || signalCount < 4;
  }

  if (/(app|website|product|saas|platform|startup|mvp)/.test(lowerTask)) {
    const requiredSignals = ["user", "feature", "mvp", "roadmap", "build", "next"];
    const signalCount = requiredSignals.filter((signal) => cleaned.toLowerCase().includes(signal)).length;
    return wordCount < 110 || signalCount < 3;
  }

  return wordCount < 55 || !hasStructure;
}

function buildFallbackDeliverable(task: string, previousMessages: AgentTeamMessage[]) {
  const lowerTask = task.toLowerCase();

  if (/(game|flappy|mobile game|flappy birds)/.test(lowerTask)) {
    return [
      "Final answer: here is a usable game concept draft the team can build from.",
      "",
      "Core concept: a one-touch survival game inspired by Flappy Birds, but with a distinct hook: short runs, tight timing, and one evolving mechanic that changes every 20-30 seconds so it feels familiar without being a clone.",
      "",
      "Core loop:",
      "- Tap to keep the character airborne.",
      "- Thread through moving obstacles.",
      "- Collect small streak bonuses for clean passes.",
      "- Fail fast, restart instantly, and chase a better score.",
      "",
      "Key mechanics:",
      "- Simple tap control with slightly forgiving physics.",
      "- Score multiplier for long clean runs.",
      "- Rotating obstacle patterns: narrow gates, drifting gates, split gates, and fake-out gaps.",
      "- One power-up only for MVP: a short slow-motion save, limited to avoid making the game too easy.",
      "",
      "First build tasks:",
      "- Build tap-to-fly movement and gravity.",
      "- Generate obstacle pairs on a timer.",
      "- Add collision, scoring, restart, and best-score storage.",
      "- Add three obstacle pattern types.",
      "- Create a basic menu, game-over screen, and retry button.",
      "",
      "Decision: start with a tiny polished MVP rather than a big feature list. The magic is instant retry, readable timing, and one clever twist. Pilot can build the first prototype from this without another planning meeting trying to become sentient.",
    ].join("\n");
  }

  const usefulPoints = previousMessages
    .filter((message) => message.messageType !== "funny")
    .map((message) => message.content.replace(/@[A-Za-z][A-Za-z0-9_-]*/g, "").trim())
    .filter(Boolean)
    .slice(-4);

  return [
    "Final answer: here is a structured draft based on the team discussion.",
    "",
    "Recommended direction:",
    `- ${usefulPoints[0] || "Create a focused first version with one clear user outcome."}`,
    "",
    "What to create first:",
    `- ${usefulPoints[1] || "Define the smallest useful version before adding advanced features."}`,
    "- Turn the idea into a clear user flow.",
    "- List the first build tasks and the decision points still open.",
    "",
    "Risks to watch:",
    `- ${usefulPoints[2] || "Avoid broad claims until the team has evidence or user feedback."}`,
    "",
    "Next action:",
    `- ${usefulPoints[3] || "Build or mock the first version, then review it with the agents."}`,
  ].join("\n");
}

function createFunnyReply(task: string, agentIds: AgentId[], previousMessages: AgentTeamMessage[]): AgentTeamMessage {
  const lastMessage = previousMessages[previousMessages.length - 1];
  const speaker = chooseFunnySpeaker(agentIds, lastMessage?.agentId);
  const target = lastMessage ? agentProfiles[lastMessage.agentId].nickname : "Chat";
  const agent = agentProfiles[speaker];
  const taskNoun = inferTaskNoun(task);
  const aside = funnyReplyForAgent(speaker, target, taskNoun);

  return {
    id: crypto.randomUUID(),
    agentId: speaker,
    agentName: agent.name,
    role: agent.role,
    avatarEmoji: agent.avatarEmoji,
    replyToAgentId: lastMessage?.agentId,
    content: aside,
    messageType: "funny",
    confidence: 0.82,
    assumptions: ["Humour should support momentum, not replace the work."],
    evidenceNeeded: [],
    nextAction: "Keep the useful team discussion moving.",
    timestamp: new Date().toISOString(),
  };
}

function chooseFunnySpeaker(agentIds: AgentId[], lastAgentId?: AgentId) {
  const preferred: AgentId[] = ["critic", "compliance", "strategist", "designer", "researcher", "builder"];
  return preferred.find((agentId) => agentIds.includes(agentId) && agentId !== lastAgentId) || agentIds.find((agentId) => agentId !== lastAgentId) || agentIds[0];
}

function inferTaskNoun(task: string) {
  const lowerTask = task.toLowerCase();
  if (/(game|flappy|mobile game)/.test(lowerTask)) return "game";
  if (/(app|product|saas|platform)/.test(lowerTask)) return "product";
  if (/(website|landing)/.test(lowerTask)) return "page";
  if (/(pitch|deck)/.test(lowerTask)) return "pitch";
  return "answer";
}

function funnyReplyForAgent(agentId: AgentId, target: string, taskNoun: string) {
  const replies: Record<AgentId, string> = {
    strategist: `@${target} Good direction. Tiny warning: if we spend any longer admiring the strategy, the ${taskNoun} will file a missing-person report. Let's lock one decision and move.`,
    researcher: `@${target} I like it, but I am legally required by my own spreadsheet energy to ask for one proof point before the confidence score starts wearing sunglasses.`,
    designer: `@${target} Useful, but please do not let the interface become a settings drawer wearing a trench coat. The ${taskNoun} needs one obvious next action.`,
    builder: `@${target} Sensible. I can turn that into tasks before the planning meeting has a chance to reproduce itself.`,
    critic: `@${target} Fair point, but that assumption is wobbling like an AI demo on hotel Wi-Fi. Tighten it into one testable decision.`,
    compliance: `@${target} Approved with a cautious eyebrow. Also, if anyone promises 'effortless magic', I am replacing it with 'tested workflow' and sleeping better.`,
  };

  return replies[agentId];
}

function chooseLeadAgent(task: string, agentIds: AgentId[]) {
  const lowerTask = task.toLowerCase();
  const preferences: AgentId[] = [];

  if (/(build|code|technical|task|mvp|roadmap|feature|app|server|api|game|website)/.test(lowerTask)) preferences.push("builder");
  if (/(design|ui|ux|screen|brand|layout|journey|interface)/.test(lowerTask)) preferences.push("designer");
  if (/(research|market|competitor|evidence|data|source|trend)/.test(lowerTask)) preferences.push("researcher");
  if (/(risk|legal|privacy|compliance|policy|safety|claim)/.test(lowerTask)) preferences.push("compliance");
  if (/(critique|weak|problem|challenge|assumption|review)/.test(lowerTask)) preferences.push("critic");
  preferences.push("strategist", "builder", "researcher");

  return preferences.find((agentId) => agentIds.includes(agentId)) || agentIds[0];
}

function taskDeliverableInstruction(task: string) {
  const lowerTask = task.toLowerCase();

  if (/(game|flappy|mobile game|level|player|score)/.test(lowerTask)) {
    return "Deliverable target: create game concept material the user can act on, such as core loop, mechanics, controls, progression, art style, monetisation notes, and first build tasks.";
  }

  if (/(app|website|product|saas|platform|startup|mvp)/.test(lowerTask)) {
    return "Deliverable target: create product material the user can act on, such as positioning, user flow, feature list, MVP scope, roadmap, and first build tasks.";
  }

  if (/(copy|landing|pitch|deck|marketing|brand)/.test(lowerTask)) {
    return "Deliverable target: create usable copy, positioning, messaging, sections, headlines, objections, and calls to action.";
  }

  if (/(code|api|database|server|bug|technical|build)/.test(lowerTask)) {
    return "Deliverable target: create practical technical material, such as architecture, implementation steps, files to create, edge cases, and test checks.";
  }

  return "Deliverable target: create a useful answer with concrete decisions, examples, next steps, and any clarification needed.";
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

    const collaborationInstruction = [
      `Debate instruction: ${instruction}`,
      agentId === "researcher"
        ? "Open the debate with a short evidence-led viewpoint. Give the current best assumption and the single strongest evidence gap."
        : "Reply directly to the previous agent. Use their @nickname and respond to one specific point they made.",
      agentId === "strategist"
        ? "Close the debate with a concrete decision, why it wins, the main trade-off, and what the user should do next."
        : "Keep it short, human, and useful. Do not produce a standalone essay.",
      "Do not say you are debating. Actually debate the decision.",
    ].join("\n");

    messages.push(await askAgent(agentProfiles[agentId], task, messages, provider, plan, "debate", collaborationInstruction, agentId === "strategist" ? "final" : "internal"));
    if (isClarificationRequest(messages[messages.length - 1].content)) return messages;
  }

  return messages;
}

async function runDeveloperMode(task: string, provider: AgentProvider, plan: AgentRunPlan) {
  const developerOrder: AgentId[] = ["strategist", "researcher", "designer", "builder", "critic", "compliance", "strategist"];

  if (plan.developerDemoMode) {
    const messages: AgentTeamMessage[] = [];
    developerOrder.forEach((agentId, index) => {
      messages.push(createMockDeveloperMessage(agentProfiles[agentId], task, index === developerOrder.length - 1, messages));
    });
    return messages;
  }

  if (provider !== "openai") {
    throw new AgentOrchestratorError("Developer Mode needs a paid provider. Enable demo mode or configure a Pro provider.", "provider_unavailable");
  }

  const messages: AgentTeamMessage[] = [];

  for (const [index, agentId] of developerOrder.entries()) {
    const isFinal = index === developerOrder.length - 1;
    const instruction = developerInstruction(agentId, isFinal);
    messages.push(await askDeveloperAgent(agentProfiles[agentId], task, messages, plan, instruction, isFinal));
  }

  return messages;
}

async function askDeveloperAgent(agent: AgentProfile, task: string, previousMessages: AgentTeamMessage[], plan: AgentRunPlan, developerInstruction: string, isFinal: boolean) {
  const context = previousMessages.length
    ? previousMessages.map((message) => `${agentProfiles[message.agentId].nickname} (${message.role}): ${message.content}`).join("\n\n")
    : "No previous developer messages yet.";

  const input = [
    `Original user task: ${task}`,
    `Developer Mode instruction: ${developerInstruction}`,
    "Previous visible developer messages:",
    context,
    "Return only valid JSON. Do not reveal hidden chain-of-thought. Show only concise reasoningSummary and safe working notes.",
    "Use this exact shape:",
    "{",
    '  "content": "short visible message",',
    '  "reasoningSummary": "safe summary of why this matters",',
    '  "evidenceUsed": ["verified fact or input used"],',
    '  "evidenceGaps": ["missing evidence"],',
    '  "assumptions": ["assumption"],',
    '  "tradeOffs": ["trade-off"],',
    '  "decisionLog": ["decision"],',
    '  "risks": ["risk"],',
    '  "implementationSteps": ["step"],',
    '  "testsOrChecks": ["test or check"],',
    '  "sourceLinks": ["source placeholder or URL"],',
    '  "toolActionsTaken": ["model/tool action"],',
    `  "messageType": "${isFinal ? "summary" : "analysis | evidence | architecture | implementation | risk | decision | test"}",`,
    '  "confidence": 0.0,',
    '  "nextAction": "short next action"',
    "}",
  ].join("\n");

  const content = await runOpenAIResponse({
    model: plan.defaultModel,
    instructions: `${agent.systemPrompt} You are now operating in Developer Mode. Provide safe, structured working notes, not hidden chain-of-thought.`,
    input,
  });

  return buildMessage(agent, parseModelMessage(content), "developer", isFinal ? "final" : "internal", previousMessages);
}

function developerInstruction(agentId: AgentId, isFinal: boolean) {
  if (isFinal) return "Produce the final developer summary with decision log, trade-offs, implementation plan, risks, tests, confidence, and source placeholders.";

  const instructions: Record<AgentId, string> = {
    strategist: "Explain the objective, define success criteria, identify constraints, and create a decision framework.",
    researcher: "List evidence, separate verified facts from assumptions, highlight missing data, and add source placeholders.",
    designer: "Explain UX logic, map user flows, identify friction points, and suggest UI improvements.",
    builder: "Create the technical implementation plan, break work into tasks, suggest architecture, add pseudocode where useful, and list dependencies.",
    critic: "Challenge weak assumptions, identify failure modes, flag unclear logic, and suggest improvements.",
    compliance: "Check privacy, safety, user trust, billing, data handling, app-store risks, and claims that need evidence.",
  };

  return instructions[agentId];
}

function createMockDeveloperMessage(agent: AgentProfile, task: string, isFinal: boolean, previousMessages: AgentTeamMessage[]): AgentTeamMessage {
  const base = developerMockContent(agent.id, task, isFinal);
  return {
    id: crypto.randomUUID(),
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
    avatarEmoji: agent.avatarEmoji,
    replyToAgentId: isFinal ? undefined : chooseReplyTargetAgentId(agent, previousMessages),
    content: base.content,
    reasoningSummary: base.reasoningSummary,
    evidenceUsed: base.evidenceUsed,
    evidenceGaps: base.evidenceGaps,
    assumptions: base.assumptions,
    tradeOffs: base.tradeOffs,
    decisionLog: base.decisionLog,
    risks: base.risks,
    implementationSteps: base.implementationSteps,
    testsOrChecks: base.testsOrChecks,
    sourceLinks: base.sourceLinks,
    toolActionsTaken: base.toolActionsTaken,
    evidenceNeeded: base.evidenceGaps,
    nextAction: base.nextAction,
    messageType: base.messageType,
    confidence: base.confidence,
    timestamp: new Date().toISOString(),
  };
}

function developerMockContent(agentId: AgentId, task: string, isFinal: boolean): DeveloperMockContent {
  if (isFinal) {
    return {
      content: `Final developer summary: the team should implement "${task}" as a scoped, testable build with clear user value, explicit assumptions, and a decision log before any production release.`,
      reasoningSummary: "This summary turns the agent discussion into safe visible working notes and an implementation-ready plan.",
      evidenceUsed: ["User task", "Selected agent roles", "Current ManyMinds prototype constraints"],
      evidenceGaps: ["Live market/source validation", "Real user testing", "Production provider configuration"],
      assumptions: ["The user wants a practical product/build plan, not hidden reasoning."],
      tradeOffs: ["More detail improves build quality but makes the chat denser.", "Provider quality affects depth and reliability."],
      decisionLog: ["Use Developer Mode only for Pro and above.", "Show structured working summaries, not hidden chain-of-thought.", "Expose risks, tests, and evidence gaps in collapsible UI."],
      risks: ["Users may mistake assumptions for verified facts.", "Provider failures need clear errors.", "Sensitive data should not be sent to external providers without consent."],
      implementationSteps: ["Add mode access checks.", "Return structured developer fields.", "Render collapsible developer sections.", "Add copy/export placeholders.", "Add provider-unavailable errors."],
      testsOrChecks: ["Free user sees locked Developer Mode.", "API blocks Free/Starter Developer Mode.", "Demo mode returns mock developer output.", "No hidden chain-of-thought labels appear."],
      sourceLinks: ["Source placeholder: internal plan config", "Source placeholder: provider docs", "Source placeholder: app-store/billing policy review"],
      toolActionsTaken: ["Generated structured developer report from mock demo mode."],
      nextAction: "Upgrade or enable demo mode to run Developer Mode.",
      messageType: "summary",
      confidence: 0.88,
    };
  }

  const byAgent: Record<AgentId, Partial<DeveloperMockContent>> = {
    strategist: {
      content: "Objective: define the requested outcome, success criteria, and constraints before the team starts building.",
      messageType: "analysis",
      reasoningSummary: "A clear objective keeps the agents from producing vague output.",
      decisionLog: ["Success means the user gets a usable plan, not a thin summary."],
      implementationSteps: ["Define objective", "List success criteria", "Capture constraints"],
    },
    researcher: {
      content: "Evidence pass: separate what we know from what we are assuming, then mark missing sources clearly.",
      messageType: "evidence",
      reasoningSummary: "Evidence tracking prevents confident nonsense from looking like verified work.",
      evidenceUsed: ["User prompt", "Visible app behavior"],
      evidenceGaps: ["External validation", "User interviews", "Provider capability tests"],
    },
    designer: {
      content: "UX pass: Developer Mode should feel like a focused technical workspace, not a wall of receipts.",
      messageType: "analysis",
      reasoningSummary: "Collapsible sections keep depth available without burying the chat.",
      tradeOffs: ["Dense professional UI vs. fast casual chat"],
      implementationSteps: ["Add collapsible sections", "Use badges", "Keep top message readable"],
    },
    builder: {
      content: "Implementation plan: add access control, developer fields, mock demo output, and technical report UI.",
      messageType: "implementation",
      reasoningSummary: "Backend enforcement matters because frontend locks alone are easy to bypass.",
      implementationSteps: ["Extend AgentRunMode", "Add plan modes", "Block unauthorized API calls", "Render developer details"],
      testsOrChecks: ["API returns upgrade_required for Free", "Developer sections render"],
    },
    critic: {
      content: "Challenge: if Developer Mode only shows longer messages, it is just Standard Mode in a lab coat.",
      messageType: "risk",
      reasoningSummary: "The paid value must come from structure, evidence, tests, and decisions.",
      risks: ["Mode feels cosmetic", "No provider configured", "Outputs still too generic"],
      tradeOffs: ["Strict templates improve reliability but can feel less conversational."],
    },
    compliance: {
      content: "Trust check: do not expose hidden chain-of-thought; show safe summaries, evidence gaps, and tool actions instead.",
      messageType: "risk",
      reasoningSummary: "User trust improves when the app explains decisions without leaking unsafe internal reasoning.",
      risks: ["Misleading claims", "Privacy/data handling gaps", "Billing mode confusion"],
      testsOrChecks: ["No chain-of-thought wording", "Upgrade copy is clear", "Data handling is disclosed"],
    },
  };

  const partial = byAgent[agentId];
  return {
    content: partial.content || "Developer Mode working note.",
    reasoningSummary: partial.reasoningSummary || "Safe visible working summary.",
    evidenceUsed: partial.evidenceUsed || ["User task"],
    evidenceGaps: partial.evidenceGaps || ["External validation"],
    assumptions: ["Demo mode uses structured placeholder data."],
    tradeOffs: partial.tradeOffs || ["Depth vs. speed"],
    decisionLog: partial.decisionLog || ["Keep Developer Mode structured and paid-tier only."],
    risks: partial.risks || ["Incomplete evidence"],
    implementationSteps: partial.implementationSteps || ["Review plan", "Implement scoped changes"],
    testsOrChecks: partial.testsOrChecks || ["Check output structure"],
    sourceLinks: ["Source placeholder: add verified URL later"],
    toolActionsTaken: ["Generated mock Developer Mode section."],
    nextAction: "Continue developer analysis.",
    messageType: partial.messageType || "analysis",
    confidence: 0.82,
  };
}

async function askAgent(
  agent: AgentProfile,
  task: string,
  previousMessages: AgentTeamMessage[],
  provider: AgentProvider,
  plan: AgentRunPlan,
  mode: AgentRunMode,
  collaborationInstruction = "",
  intent: ConversationIntent = "lead",
) {
  const jsonInstruction = [
    "Return only valid JSON. Do not add markdown, code fences, labels, or commentary before or after the JSON.",
    "Use this exact shape:",
    "{",
    '  "content": "useful message. For final answers, include bullets or short sections inside this string.",',
    '  "messageType": "idea | evidence | challenge | decision | action | summary | risk | funny",',
    '  "confidence": 0.0,',
    '  "assumptions": ["short assumption"],',
    '  "evidenceNeeded": ["short evidence need"],',
    '  "nextAction": "short next action"',
    "}",
    "Keep the answer concise. Include light professional wit only when it helps clarity.",
    "For normal conversation, avoid saying you are returning JSON. The JSON is only for the app.",
    "Your content must be useful by itself. Never only say you will analyze, research, create, or consider something.",
    "Forbidden weak phrases: \"let's start with the basics\", \"we should consider\", \"I will analyze\", \"next I would\", \"research existing studies\" unless you also provide the actual analysis, decision, or artifact now.",
    "If you suggest evidence is needed, also state the current best assumption and what the team can safely do before that evidence arrives.",
    "If budget, timeline, target user, platform, location, or skill level is required to give a useful answer, ask one clear clarification question directly to the user before continuing. Do not discuss missing budget as if the user had already supplied one.",
    "For teammate replies, respond to the previous message as if you read it. Do not just place @Name at the start of an unrelated answer.",
    "For internal teammate replies, sound natural. Avoid nested quote references like 'building on \"Yes, building on...\"'.",
    "You may include one short professional joke about AI agents being slow, overthinking, or missing details, but only if the rest of the message still advances the task.",
  ].join("\n");

  const context = previousMessages.length
    ? previousMessages.map((message) => `${agentProfiles[message.agentId].nickname} (${message.role}): ${message.content}`).join("\n\n")
    : "No previous agent messages yet.";

  const userPrompt = [
    `Original user task: ${task}`,
    `Mode: ${mode}`,
    collaborationInstruction ? `Collaboration instruction:\n${collaborationInstruction}` : "",
    "Previous visible agent messages:",
    context,
    jsonInstruction,
  ].filter(Boolean).join("\n\n");

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

  return buildMessage(agent, parseModelMessage(content), mode, intent, previousMessages);
}

function parseModelMessage(raw: string): ModelMessagePayload {
  const cleaned = stripJsonWrapping(raw);

  try {
    return normaliseParsedPayload(JSON.parse(cleaned) as ModelMessagePayload);
  } catch {
    const extractedContent = extractContentFromBrokenJson(raw);

    return {
      content: sanitizeModelContent(extractedContent || plainTextFromModel(raw)),
      messageType: "idea",
      confidence: 0.6,
      assumptions: [],
      evidenceNeeded: [],
      nextAction: "Continue the discussion.",
    };
  }
}

function normaliseParsedPayload(parsed: ModelMessagePayload): ModelMessagePayload {
  if (typeof parsed.content === "string" && looksLikeJson(parsed.content)) {
    try {
      const nested = JSON.parse(stripJsonWrapping(parsed.content)) as ModelMessagePayload;
      return normaliseParsedPayload(nested);
    } catch {
      return { ...parsed, content: sanitizeModelContent(extractContentFromBrokenJson(parsed.content) || parsed.content) };
    }
  }

  return {
    ...parsed,
    content: sanitizeModelContent(typeof parsed.content === "string" ? parsed.content : JSON.stringify(parsed.content ?? "")),
    nextAction: typeof parsed.nextAction === "string" ? parsed.nextAction : "Continue the team run.",
  };
}

function looksLikeJson(value: string) {
  const trimmed = value.trim().replace(/^Final answer:\s*/i, "");
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function stripJsonWrapping(raw: string) {
  const withoutFences = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return withoutFences.slice(firstBrace, lastBrace + 1).trim();
  }

  return withoutFences;
}

function plainTextFromModel(raw: string) {
  return raw
    .trim()
    .replace(/^final answer:\s*/i, "")
    .replace(/^here(?:'|’)s a json response:\s*/i, "")
    .replace(/^json response:\s*/i, "")
    .replace(/^response:\s*/i, "")
    .trim();
}

function sanitizeModelContent(raw: string) {
  const cleaned = plainTextFromModel(raw)
    .replace(/^final answer:\s*(?=\{)/i, "")
    .trim();

  if (looksLikeJson(cleaned)) {
    try {
      const parsed = JSON.parse(stripJsonWrapping(cleaned)) as ModelMessagePayload;
      return sanitizeModelContent(String(parsed.content || ""));
    } catch {
      const extracted = extractContentFromBrokenJson(cleaned);
      if (extracted) return sanitizeModelContent(extracted);
    }
  }

  if (/^\{[\s\S]*"messageType"\s*:/.test(cleaned)) {
    const extracted = extractContentFromBrokenJson(cleaned);
    if (extracted) return sanitizeModelContent(extracted);
  }

  return cleaned
    .replace(/^["']?content["']?\s*:\s*/i, "")
    .replace(/,\s*"messageType"\s*:\s*"[^"]+"[\s\S]*$/i, "")
    .trim();
}

function extractContentFromBrokenJson(raw: string) {
  const cleaned = raw.trim().replace(/^final answer:\s*/i, "");
  const contentMatch = cleaned.match(/"content"\s*:\s*"((?:\\.|[^"\\])*)"/s);

  if (!contentMatch) return "";

  return contentMatch[1]
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\\\/g, "\\")
    .trim();
}

function buildMessage(
  agent: AgentProfile,
  payload: ModelMessagePayload,
  mode: AgentRunMode,
  intent: ConversationIntent,
  previousMessages: AgentTeamMessage[],
): AgentTeamMessage {
  const messageType = payload.messageType && messageTypes.includes(payload.messageType) ? payload.messageType : fallbackMessageType(agent, mode);
  const content = formatContentForIntent(agent, payload.content?.trim() || "I need a little more context before I can give a useful answer.", intent, previousMessages);

  return {
    id: crypto.randomUUID(),
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
    avatarEmoji: agent.avatarEmoji,
    replyToAgentId: intent === "internal" ? chooseReplyTargetAgentId(agent, previousMessages) : undefined,
    content,
    messageType,
    confidence: clampConfidence(payload.confidence),
    assumptions: normaliseStringList(payload.assumptions),
    evidenceNeeded: normaliseStringList(payload.evidenceNeeded),
    reasoningSummary: payload.reasoningSummary?.trim(),
    evidenceUsed: normaliseStringList(payload.evidenceUsed),
    evidenceGaps: normaliseStringList(payload.evidenceGaps),
    tradeOffs: normaliseStringList(payload.tradeOffs),
    decisionLog: normaliseStringList(payload.decisionLog),
    risks: normaliseStringList(payload.risks),
    implementationSteps: normaliseStringList(payload.implementationSteps),
    testsOrChecks: normaliseStringList(payload.testsOrChecks),
    sourceLinks: normaliseStringList(payload.sourceLinks),
    toolActionsTaken: normaliseStringList(payload.toolActionsTaken),
    nextAction: payload.nextAction?.trim() || "Continue the team run.",
    timestamp: new Date().toISOString(),
  };
}

function formatContentForIntent(agent: AgentProfile, content: string, intent: ConversationIntent, previousMessages: AgentTeamMessage[]) {
  const cleaned = sanitizeModelContent(content)
    .replace(/^final answer:\s*(?=\{)/i, "")
    .replace(/^@(?:Chat|Gem|Cloud|Pilot|Rok|Peri)\s*/i, "")
    .trim();

  if (intent === "internal") {
    const target = chooseMentionTarget(agent, previousMessages);
    const humanReply = cleanHumanReply(cleaned);
    return limitAgentMentions(`@${target} ${isWeakInternalReply(humanReply) ? fallbackInternalContribution(agent, previousMessages) : humanReply}`);
  }

  if (intent === "final" && !/^(\*\*Final|Final|Here|Completed|Clarifying question)/i.test(cleaned)) {
    return `Final answer: ${cleaned}`;
  }

  return cleaned;
}

function cleanHumanReply(content: string) {
  return sanitizeModelContent(content)
    .replace(/^final answer:\s*/i, "")
    .replace(/^here(?:'|’)s (?:our|a|the)\s+(?:refined\s+)?(?:concept|answer|plan|draft)[^:]*:\s*/i, "")
    .replace(/^here(?:'|’)s what I(?:'|’)d add:\s*/i, "")
    .replace(/^(yes,\s*)?(and\s*)?to make\s+"[^"]+"\s+buildable:\s*/i, "")
    .replace(/^yes,\s*building on\s+"[^"]+":\s*/i, "")
    .replace(/^yes,\s*building on\s+/i, "")
    .replace(/^good point on\s+"[^"]+",\s*but\s*/i, "")
    .replace(/^building on\s+@?(?:Chat|Gem|Cloud|Pilot|Rok|Peri)'?s?\s+/i, "")
    .replace(/^@?(?:Chat|Gem|Cloud|Pilot|Rok|Peri),?\s*/i, "")
    .replace(/^['’]s\s+/i, "Your ")
    .trim();
}

function limitAgentMentions(content: string) {
  const seen = new Set<string>();
  return content.replace(/@(?:Chat|Gem|Cloud|Pilot|Rok|Peri)\b/g, (mention) => {
    const key = mention.toLowerCase();
    if (seen.has(key)) return mention.slice(1);
    seen.add(key);
    return mention;
  });
}

function isWeakInternalReply(content: string) {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const weakOpeners = /^(let(?:'|’)s|we should|i will|next i would|i can|i(?:'|’)d|consider|analyze|research)\b/i.test(content);
  const hasConcreteSignal = /(feature|task|step|decision|risk|test|flow|screen|copy|mechanic|build|implement|measure|ship|user|evidence)/i.test(content);
  return wordCount < 18 || (weakOpeners && !hasConcreteSignal);
}

function fallbackInternalContribution(agent: AgentProfile, previousMessages: AgentTeamMessage[]) {
  const previous = [...previousMessages].reverse().find((message) => message.agentId !== agent.id && message.messageType !== "funny");
  const previousPoint = previous ? summarisePreviousPoint(previous.content) : "the current direction";

  const replies: Record<AgentId, string> = {
    strategist: `Good direction, but we need to turn ${previousPoint} into one clear decision. My vote: define the target user, the first outcome, and the smallest version we can test this week.`,
    researcher: `I can work with ${previousPoint}, but we should label it as an assumption until tested. The useful evidence check is: who has this problem, how often, and what they use instead today?`,
    designer: `That helps, but the user journey still needs tightening. I would make the next screen show one obvious action, one short explanation, and no extra controls until the user asks for depth.`,
    builder: `Buildable version: take ${previousPoint}, split it into setup, core action, result, and retry. That gives us a first task list instead of another elegant cloud of opinions.`,
    critic: `I see the logic, but the weak spot is ${previousPoint}. Make it testable: what would prove this is useful, and what would make us cut it?`,
    compliance: `Reasonable, but mark any claim around ${previousPoint} as unverified. Keep the wording precise, avoid magic promises, and log what data the user would need to share.`,
  };

  return replies[agent.id];
}

function summarisePreviousPoint(content: string) {
  const cleaned = sanitizeModelContent(content)
    .replace(/@[A-Za-z][A-Za-z0-9_-]*/g, "")
    .replace(/\*\*/g, "")
    .trim();
  const firstSentence = cleaned.split(/[.!?]\s/)[0]?.trim();
  const summary = firstSentence || "the current direction";
  return summary.length > 90 ? `${summary.slice(0, 87).trim()}...` : summary;
}

function isClarificationRequest(content: string) {
  const cleaned = content.trim();
  return /^clarifying question/i.test(cleaned) || (/(\?|more context|need clarification|need you to clarify)/i.test(cleaned) && cleaned.split(/\s+/).length < 90);
}

function upfrontClarificationQuestion(task: string) {
  const lowerTask = task.toLowerCase();
  const asksForBusinessIdea = /\b(what|which|best|good|profitable|start|launch|create)\b[\s\S]*\b(business|company|startup|side hustle|shop|store)\b/.test(lowerTask);
  const hasBudget = /\b(£|\$|budget|spend|capital|invest|investment|under\s+\d+|\d+\s*(k|grand|pounds|dollars))\b/.test(lowerTask);
  const hasLocation = /\b(uk|usa|united states|england|scotland|wales|london|local|online|remote)\b/.test(lowerTask);
  const hasSkills = /\b(skill|experience|background|i can|i know|developer|designer|sales|marketing|trade)\b/.test(lowerTask);

  if (asksForBusinessIdea && !hasBudget) {
    return "What budget range are you comfortable starting with, and do you want an online business, local business, or either?";
  }

  if (asksForBusinessIdea && !hasLocation && !hasSkills) {
    return "What country or market should we aim at, and what skills or experience do you already have?";
  }

  return "";
}

function createClarificationMessage(agent: AgentProfile, question: string): AgentTeamMessage {
  return {
    id: crypto.randomUUID(),
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
    avatarEmoji: agent.avatarEmoji,
    content: `Clarifying question: ${question}`,
    messageType: "challenge",
    confidence: 0.94,
    assumptions: ["The request is broad enough that a direct answer would risk guessing important constraints."],
    evidenceNeeded: ["User budget, market, or personal constraints before recommending a direction."],
    nextAction: "Wait for the user to answer the clarification question.",
    timestamp: new Date().toISOString(),
  };
}

function chooseMentionTarget(agent: AgentProfile, previousMessages: AgentTeamMessage[]) {
  const target = chooseReplyTargetAgentId(agent, previousMessages);
  return target ? agentProfiles[target].nickname : "Chat";
}

function chooseReplyTargetAgentId(agent: AgentProfile, previousMessages: AgentTeamMessage[]) {
  return [...previousMessages].reverse().find((message) => message.agentId !== agent.id && message.messageType !== "funny")?.agentId;
}

function fallbackMessageType(agent: AgentProfile, mode: AgentRunMode): AgentMessageType {
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
