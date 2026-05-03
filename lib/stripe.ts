import Stripe from "stripe";
import type { PlanId } from "./plans";
import { getPlan } from "./plans";

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(key, { apiVersion: "2024-10-28.acacia" });
}

export function stripePriceIdForPlan(planId: PlanId) {
  const plan = getPlan(planId);
  if (!plan.stripePriceEnv) return null;
  return process.env[plan.stripePriceEnv] || null;
}
