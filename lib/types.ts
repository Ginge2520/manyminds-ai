import type { PlanId, ProviderId } from "./plans";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanId;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  usageThisMonth: number;
  usageResetDate: string;
  onboarded: boolean;
  createdAt: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export interface AgentRun {
  id: string;
  userId: string;
  planAtTime: PlanId;
  agentsUsed: number;
  providerUsed: ProviderId;
  tokensEstimated: number;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  plan: PlanId;
  onboarded: boolean;
}
