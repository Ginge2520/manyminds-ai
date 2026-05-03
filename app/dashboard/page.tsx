import { DashboardChrome } from "@/components/DashboardChrome";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UsageMeter } from "@/components/UsageMeter";
import { currentUser } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { getUserById } from "@/lib/users";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const session = await currentUser();
  const query = await searchParams;
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
      usageThisMonth: 10,
      usageResetDate: new Date().toISOString(),
      onboarded: true,
      createdAt: new Date().toISOString(),
    } as const);
  const plan = getPlan(safeUser.plan);
  const overFreeLimit = query.limit || (safeUser.plan === "free" && safeUser.usageThisMonth >= 10);

  return (
    <DashboardChrome>
      {overFreeLimit && <UpgradeModal defaultOpen />}
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Your AI product team</p>
            <h1 className="mt-3 text-4xl font-black text-white">Agents that collaborate, debate, and build.</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Current plan: <strong className="text-white">{plan.name}</strong>. Debate Mode is{" "}
              <strong className="text-white">{plan.debateMode ? "available" : "locked"}</strong> on this tier.
            </p>
            <form action="/api/agent-runs" method="post" className="mt-6 flex flex-wrap gap-3">
              <input type="hidden" name="agentsRequested" value="3" />
              <button className="primary-cta" type="submit">Run agent team</button>
              <UpgradeModal />
            </form>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {["Product brief", "MVP roadmap", "Competitor scan"].map((item) => (
              <article key={item} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
                <h3 className="text-lg font-black text-white">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Ready for agent collaboration, debate, and export.</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <UsageMeter user={safeUser} />
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
            <h2 className="text-xl font-black text-white">Plan controls</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Free users are blocked when limits are exceeded and shown the upgrade modal.
            </p>
          </div>
        </aside>
      </section>
    </DashboardChrome>
  );
}
