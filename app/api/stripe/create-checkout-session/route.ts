import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import type { PlanId } from "@/lib/plans";
import { paidPlanIds } from "@/lib/plans";
import { stripeClient, stripePriceIdForPlan } from "@/lib/stripe";

export async function GET(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") as PlanId | null;
  if (!plan || !paidPlanIds.includes(plan)) {
    return NextResponse.json({ error: "Invalid paid plan." }, { status: 400 });
  }

  const price = stripePriceIdForPlan(plan);
  if (!price) {
    return NextResponse.json({ error: `Stripe price ID is missing for ${plan}.` }, { status: 500 });
  }

  const stripe = stripeClient();
  const appUrl = process.env.APP_URL || url.origin;
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.email,
    line_items: [{ price, quantity: 1 }],
    metadata: {
      userId: session.id,
      plan,
    },
    success_url: `${appUrl}/account/billing?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
  });

  return NextResponse.redirect(checkout.url || `${appUrl}/pricing`);
}
