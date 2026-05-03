import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { PlanId } from "@/lib/plans";
import { stripeClient } from "@/lib/stripe";
import { updateUserPlan } from "@/lib/users";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const stripe = stripeClient();
  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    const plan = checkout.metadata?.plan as PlanId | undefined;
    const userId = checkout.metadata?.userId;
    if (plan && userId) {
      updateUserPlan(userId, plan, {
        stripeCustomerId: String(checkout.customer || ""),
        stripeSubscriptionId: String(checkout.subscription || ""),
      });
    }
  }

  return NextResponse.json({ received: true });
}
