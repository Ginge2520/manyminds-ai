export type PlanId = "free";

export type ProviderId = "ollama";

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: string;
  strapline: string;
  runsPerMonth: number | null;
  maxAgents: number | null;
  debateMode: boolean;
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
    provider: "ollama",
    queue: "Slower speed",
    history: "Limited history",
    features: ["10 agent runs/month", "3 agents max", "Free account", "No payment details required"],
  },
};

export function formatLimit(value: number | null, suffix = "") {
  return value === null ? "Custom" : `${value.toLocaleString()}${suffix}`;
}

export function getPlan(plan: PlanId) {
  return planConfig[plan] || planConfig.free;
}
