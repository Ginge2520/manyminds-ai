import { getPlan } from "./plans";
import type { User } from "./types";

export function usageRemaining(user: Pick<User, "plan" | "usageThisMonth">) {
  const plan = getPlan(user.plan);
  if (plan.runsPerMonth === null) return null;
  return Math.max(plan.runsPerMonth - user.usageThisMonth, 0);
}

export function canRunAgents(user: Pick<User, "plan" | "usageThisMonth">, agentsRequested: number) {
  const plan = getPlan(user.plan);
  const remaining = usageRemaining(user);
  const underRunLimit = remaining === null || remaining > 0;
  const underAgentLimit = plan.maxAgents === null || agentsRequested <= plan.maxAgents;
  return {
    allowed: underRunLimit && underAgentLimit,
    remaining,
    plan,
    reason: !underRunLimit
      ? "monthly_runs_exceeded"
      : !underAgentLimit
      ? "agent_limit_exceeded"
      : null,
  };
}
