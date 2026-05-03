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
  provider: ProviderId;
  queue: string;
  history: string;
  features: string[];
  stripePriceEnv?: "STRIPE_STARTER_PRICE_ID" | "STRIPE_PRO_PRICE_ID" | "STRIPE_POWER_PRICE_ID";
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
    features: ["10 agent runs/month", "3 agents max", "Ollama/local model only", "No payment details required"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: "£15/month",
    strapline: "For early product work and sharper briefs.",
    runsPerMonth: 75,
    maxAgents: 4,
    debateMode: false,
    provider: "openai_standard",
    queue: "Standard queue",
    history: "Basic history",
    features: ["75 agent runs/month", "4 agents", "Standard AI models", "Product brief export", "Basic history"],
    stripePriceEnv: "STRIPE_STARTER_PRICE_ID",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "£39/month",
    strapline: "Your AI product team, properly caffeinated.",
    runsPerMonth: 250,
    maxAgents: 6,
    debateMode: true,
    provider: "openai_premium",
    queue: "Priority queue",
    history: "Full export history",
    features: ["250 agent runs/month", "Full agent team", "Debate Mode", "Better AI models", "Export outputs", "Priority queue"],
    stripePriceEnv: "STRIPE_PRO_PRICE_ID",
  },
  power: {
    id: "power",
    name: "Power",
    price: "£79/month",
    strapline: "For founders running several ideas at once.",
    runsPerMonth: 1000,
    maxAgents: 8,
    debateMode: true,
    provider: "multi_model",
    queue: "Priority processing",
    history: "Longer memory/history",
    features: ["High usage limits", "Multi-model agents", "Priority processing", "Advanced workflows", "Longer memory/history"],
    stripePriceEnv: "STRIPE_POWER_PRICE_ID",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    strapline: "For teams that need controls before cleverness.",
    runsPerMonth: null,
    maxAgents: null,
    debateMode: true,
    provider: "custom",
    queue: "Dedicated options",
    history: "Custom retention",
    features: ["Team accounts", "Custom agents", "Admin dashboard", "API access", "Custom usage limits"],
  },
};

export const paidPlanIds: PlanId[] = ["starter", "pro", "power"];

export function formatLimit(value: number | null, suffix = "") {
  return value === null ? "Custom" : `${value.toLocaleString()}${suffix}`;
}

export function getPlan(plan: PlanId) {
  return planConfig[plan] || planConfig.free;
}
