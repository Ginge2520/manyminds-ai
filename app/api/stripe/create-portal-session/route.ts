import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { stripeClient } from "@/lib/stripe";

export async function GET(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  const user = getUserById(session.id);
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer is attached to this user yet." }, { status: 400 });
  }

  const stripe = stripeClient();
  const appUrl = process.env.APP_URL || new URL(request.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/account/billing`,
  });

  return NextResponse.redirect(portal.url);
}
