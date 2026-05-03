import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { canRunAgents } from "@/lib/usage";
import { getUserById, incrementUsage } from "@/lib/users";

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const form = await request.formData();
  const agentsRequested = Number(form.get("agentsRequested") || 1);
  const user = getUserById(session.id);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const gate = canRunAgents(user, agentsRequested);
  if (!gate.allowed) {
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (acceptsHtml) {
      return NextResponse.redirect(new URL(`/dashboard?limit=${gate.reason}`, request.url));
    }
    return NextResponse.json(
      {
        ok: false,
        reason: gate.reason,
        limitModal: {
          title: "Your AI team has used this month's free runs",
          text: "Free accounts currently include 10 agent runs each month while we test the product with early users.",
          primary: "View account",
          secondary: "Close",
        },
      },
      { status: 402 }
    );
  }

  const updated = incrementUsage(user.id);
  return NextResponse.json({
    ok: true,
    run: {
      id: crypto.randomUUID(),
      userId: user.id,
      planAtTime: user.plan,
      agentsUsed: agentsRequested,
      providerUsed: gate.plan.provider,
      tokensEstimated: agentsRequested * 1800,
      createdAt: new Date().toISOString(),
    },
    usageThisMonth: updated?.usageThisMonth,
  });
}
