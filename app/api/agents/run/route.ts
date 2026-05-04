import { NextResponse } from "next/server";
import { runAgentTeam, AgentOrchestratorError, type AgentRunMode } from "@/lib/agents/agentOrchestrator";
import { defaultAgentIds, isAgentId } from "@/lib/agents/agentProfiles";
import { getPlan, type PlanId } from "@/lib/plans";

export const runtime = "nodejs";

interface AgentRunRequest {
  task?: string;
  selectedAgents?: string[];
  mode?: string;
}

const mockUser = {
  id: "demo-user",
  plan: (process.env.MOCK_USER_PLAN || "free") as PlanId,
  usageThisMonth: 0,
};

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const prototypeUnlocked = process.env.PROTOTYPE_UNLOCK_ALL !== "false";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AgentRunRequest;
    const task = body.task?.trim();
    const mode = normaliseMode(body.mode);

    if (!task) {
      return NextResponse.json({ ok: false, error: "Add a task for the agents to work on.", code: "empty_task" }, { status: 400 });
    }

    const selectedAgents = normaliseSelectedAgents(body.selectedAgents);
    const planConfig = getPlan(mockUser.plan);
    const modeAccess = prototypeUnlocked || planConfig.modes.includes(mode);

    if (!modeAccess && mode === "developer") {
      return NextResponse.json(
        {
          ok: false,
          code: "upgrade_required",
          message: "Developer Mode is available on Pro and above.",
          error: "Developer Mode is available on Pro and above.",
        },
        { status: 403 },
      );
    }

    if (!modeAccess) {
      return NextResponse.json(
        {
          ok: false,
          code: "upgrade_required",
          message: `${modeLabel(mode)} is not available on the current plan.`,
          error: `${modeLabel(mode)} is not available on the current plan.`,
        },
        { status: 403 },
      );
    }

    if (!prototypeUnlocked && mockUser.usageThisMonth >= (planConfig.runsPerMonth ?? Number.POSITIVE_INFINITY)) {
      return NextResponse.json(
        {
          ok: false,
          error: "This account has reached its monthly agent run limit.",
          code: "usage_limit_reached",
        },
        { status: 403 },
      );
    }

    if (!prototypeUnlocked && planConfig.maxAgents !== null && selectedAgents.length > planConfig.maxAgents) {
      return NextResponse.json(
        {
          ok: false,
          error: `${planConfig.name} accounts can use up to ${planConfig.maxAgents} agents at once.`,
          code: "upgrade_required",
        },
        { status: 403 },
      );
    }

    const provider = resolveProvider(mode, mockUser.plan);

    if (mode === "developer" && provider !== "openai" && !demoMode && !prototypeUnlocked) {
      return NextResponse.json(
        {
          ok: false,
          code: "provider_unavailable",
          error: "Developer Mode needs a paid AI provider. Configure OPENAI_API_KEY or enable NEXT_PUBLIC_DEMO_MODE=true.",
        },
        { status: 503 },
      );
    }

    const messages = await runAgentTeam({
      userTask: task,
      selectedAgentIds: selectedAgents,
      mode,
      provider,
      plan: {
        id: planConfig.id,
        debateMode: prototypeUnlocked || planConfig.debateMode,
        modes: prototypeUnlocked ? ["standard", "debate", "developer"] : planConfig.modes,
        maxAgents: prototypeUnlocked ? null : planConfig.maxAgents,
        provider,
        defaultModel: provider === "openai" ? process.env.OPENAI_DEFAULT_MODEL || "gpt-5.5" : process.env.OLLAMA_DEFAULT_MODEL || "llama3.1",
        developerDemoMode: demoMode || (prototypeUnlocked && mode === "developer" && !process.env.OPENAI_API_KEY),
      },
    });

    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    if (error instanceof AgentOrchestratorError) {
      return NextResponse.json({ ok: false, error: error.message, message: error.message, code: error.code }, { status: error.code === "upgrade_required" ? 403 : 400 });
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
  return mode === "debate" || mode === "developer" || mode === "standard" ? mode : "standard";
}

function resolveProvider(mode: AgentRunMode, plan: PlanId) {
  if (mode === "developer" && (plan === "pro" || plan === "power" || plan === "enterprise") && process.env.OPENAI_API_KEY) {
    return "openai" as const;
  }

  return "ollama" as const;
}

function modeLabel(mode: AgentRunMode) {
  const labels: Record<AgentRunMode, string> = {
    standard: "Team Build",
    debate: "Debate Mode",
    developer: "Developer Mode",
  };
  return labels[mode];
}
