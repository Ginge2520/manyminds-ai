import { DashboardChrome } from "@/components/DashboardChrome";
import { FreeLimitModal } from "@/components/FreeLimitModal";
import { UsageMeter } from "@/components/UsageMeter";
import { currentUser } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { getUserById } from "@/lib/users";
import Link from "next/link";

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
      id: session?.id || "local-user",
      name: session?.name || "ManyMinds User",
      email: session?.email || "local@manyminds.ai",
      plan: "free",
      usageThisMonth: 0,
      usageResetDate: new Date().toISOString(),
      onboarded: true,
      createdAt: new Date().toISOString(),
    } as const);
  const plan = getPlan(safeUser.plan);
  const overFreeLimit = Boolean(query.limit) || (safeUser.plan === "free" && safeUser.usageThisMonth >= 10);

  return (
    <DashboardChrome>
      {overFreeLimit && <FreeLimitModal defaultOpen />}
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Start here</p>
            <h1 className="mt-3 text-4xl font-black text-white">Open Agent Lab and give the team a task.</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Agent Lab is the main workspace for this prototype. Choose your AI team, pick a mode, then watch them collaborate in a live chat.
              Current access: <strong className="text-white"> {plan.name}</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="primary-cta" href="/agent-test">Open Agent Lab</Link>
              <Link className="secondary-cta" href="/account">View account</Link>
              <FreeLimitModal />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Pick a team", "Choose the agents that fit the job."],
              ["Choose a mode", "Build fast, debate a decision, or go deeper."],
              ["Send a task", "Watch the team work in the chat."],
            ].map(([item, description]) => (
              <article key={item} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
                <h3 className="text-lg font-black text-white">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <UsageMeter user={safeUser} />
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
            <h2 className="text-xl font-black text-white">Free account controls</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Prototype access is currently open while the core agent experience is being tested. Plan limits will return closer to release.
            </p>
          </div>
        </aside>
      </section>
    </DashboardChrome>
  );
}
