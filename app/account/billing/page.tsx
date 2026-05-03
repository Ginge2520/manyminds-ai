import Link from "next/link";
import { DashboardChrome } from "@/components/DashboardChrome";
import { UsageMeter } from "@/components/UsageMeter";
import { currentUser } from "@/lib/auth";
import { getPlan, paidPlanIds, planConfig } from "@/lib/plans";
import { getUserById } from "@/lib/users";

export default async function BillingPage() {
  const session = await currentUser();
  const user = session ? getUserById(session.id) : null;
  const safeUser =
    user ||
    ({
      id: "demo",
      name: "Demo Founder",
      email: "demo@manyminds.ai",
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      usageThisMonth: 3,
      usageResetDate: new Date().toISOString(),
      onboarded: true,
      createdAt: new Date().toISOString(),
    } as const);
  const plan = getPlan(safeUser.plan);

  return (
    <DashboardChrome>
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Account and billing</p>
          <h1 className="mt-3 text-4xl font-black text-white">Current plan: {plan.name}</h1>
          <p className="mt-3 leading-7 text-slate-300">
            Manage subscription state here. Stripe Customer Portal is wired as a server-only placeholder.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {paidPlanIds.map((planId) => (
              <Link key={planId} className="secondary-cta" href={`/api/stripe/create-checkout-session?plan=${planId}`}>
                Upgrade to {planConfig[planId].name}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="secondary-cta" href="/pricing">View all plans</Link>
            <Link className="secondary-cta" href="/api/stripe/create-portal-session">Manage billing</Link>
          </div>
        </div>
        <UsageMeter user={safeUser} />
      </section>
    </DashboardChrome>
  );
}
