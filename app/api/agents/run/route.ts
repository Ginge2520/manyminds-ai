import { NextResponse } from "next/server";
import { runAgentTeam, AgentOrchestratorError, type AgentRunMode } from "@/lib/agents/agentOrchestrator";
import { defaultAgentIds, isAgentId } from "@/lib/agents/agentProfiles";

export const runtime = "nodejs";

interface AgentRunRequest {
  task?: string;
  selectedAgents?: string[];
  mode?: string;
}

const mockUser = {
  id: "demo-user",
  plan: "free",
  usageThisMonth: 0,
};

const freePlan = {
  id: "free",
  debateMode: false,
  maxAgents: 3,
  provider: "ollama" as const,
  defaultModel: process.env.OLLAMA_DEFAULT_MODEL || "llama3.1",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AgentRunRequest;
    const task = body.task?.trim();
    const mode = normaliseMode(body.mode);

    if (!task) {
      return NextResponse.json({ ok: false, error: "Add a task for the agents to work on.", code: "empty_task" }, { status: 400 });
    }

    const selectedAgents = normaliseSelectedAgents(body.selectedAgents);

    if (mockUser.plan === "free" && selectedAgents.length > freePlan.maxAgents) {
      return NextResponse.json(
        {
          ok: false,
          error: "Free accounts can test up to 3 agents at once.",
          code: "upgrade_required",
        },
        { status: 403 },
      );
    }

    if (mockUser.plan === "free" && mode === "debate") {
      return NextResponse.json(
        {
          ok: false,
          error: "Debate Mode is reserved for future paid plans. Standard and finalise modes are available for free testing.",
          code: "upgrade_required",
        },
        { status: 403 },
      );
    }

    const messages = await runAgentTeam({
      userTask: task,
      selectedAgentIds: selectedAgents,
      mode,
      provider: "ollama",
      plan: freePlan,
    });

    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    if (error instanceof AgentOrchestratorError) {
      return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "The agents could not complete the run.";
    return NextResponse.json({ ok: false, error: message, code: "agent_run_failed" }, { status: 500 });
  }
}

function normaliseSelectedAgents(selectedAgents: string[] | undefined) {
  const validAgents = selectedAgents?.filter(isAgentId) || [];
  if (!validAgents.length) return defaultAgentIds;
  return Array.from(new Set(validAgents)).slice(0, 6);
}

function normaliseMode(mode: string | undefined): AgentRunMode {
  return mode === "debate" || mode === "finalise" || mode === "standard" ? mode : "standard";
}
