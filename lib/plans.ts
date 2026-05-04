import type { AgentRunMode } from "./agents/agentOrchestrator";

export type PlanId = "free" | "starter" | "pro" | "power" | "enterprise";

export type ProviderId = "ollama" | "openai_standard" | "openai_premium" | "multi_model" | "custom";

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: string;
  strapline: string;
  runsPerMonth: number | null;
  maxAgents: number | null;
  debateMode: boolean;
  modes: AgentRunMode[];
  provider: ProviderId;
  queue: string;
  history: string;
  features: string[];
}

export const planConfig: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: "£0/month",
    strapline: "Try the room before inviting the whole team.",
    runsPerMonth: 10,
    maxAgents: 3,
    debateMode: false,
    modes: ["standard"],
    provider: "ollama",
    queue: "Slower speed",
    history: "Limited history",
    features: ["10 agent runs/month", "3 agents max", "Free account", "No payment details required"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: "£15/month",
    strapline: "More room for regular AI team runs.",
    runsPerMonth: 75,
    maxAgents: 4,
    debateMode: false,
    modes: ["standard"],
    provider: "openai_standard",
    queue: "Standard queue",
    history: "Basic history",
    features: ["75 agent runs/month", "4 agents", "Standard AI models", "Product brief export"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "£39/month",
    strapline: "The full agent team for serious product work.",
    runsPerMonth: 250,
    maxAgents: 6,
    debateMode: true,
    modes: ["standard", "debate", "developer"],
    provider: "openai_premium",
    queue: "Priority queue",
    history: "Full output history",
    features: ["250 agent runs/month", "Full agent team", "Debate Mode", "Developer Mode", "Export outputs"],
  },
  power: {
    id: "power",
    name: "Power",
    price: "£79/month",
    strapline: "Higher limits and deeper workflows.",
    runsPerMonth: 1000,
    maxAgents: 8,
    debateMode: true,
    modes: ["standard", "debate", "developer"],
    provider: "multi_model",
    queue: "Priority processing",
    history: "Longer memory/history",
    features: ["High usage limits", "Multi-model agents", "Advanced workflows", "Developer Mode"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    strapline: "Custom teams, governance, and API access.",
    runsPerMonth: null,
    maxAgents: null,
    debateMode: true,
    modes: ["standard", "debate", "developer"],
    provider: "custom",
    queue: "Custom",
    history: "Custom",
    features: ["Team accounts", "Custom agents", "Admin dashboard", "API access", "Developer Mode"],
  },
};

export function formatLimit(value: number | null, suffix = "") {
  return value === null ? "Custom" : `${value.toLocaleString()}${suffix}`;
}

export function getPlan(plan: PlanId) {
  return planConfig[plan] || planConfig.free;
}
