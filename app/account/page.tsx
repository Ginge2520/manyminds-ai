import { DashboardChrome } from "@/components/DashboardChrome";
import { UsageMeter } from "@/components/UsageMeter";
import { currentUser } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { getUserById } from "@/lib/users";

export default async function AccountPage() {
  const session = await currentUser();
  const user = session ? getUserById(session.id) : null;
  const safeUser =
    user ||
    ({
      id: "demo",
      name: "Demo Founder",
      email: "demo@manyminds.ai",
      plan: "free",
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
          <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Free account</p>
          <h1 className="mt-3 text-4xl font-black text-white">Current access: {plan.name}</h1>
          <p className="mt-3 leading-7 text-slate-300">
            Paid tiers are switched off for now. Every new user starts with a free account while ManyMinds AI is tested with early users.
          </p>
          <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.055] p-5">
            <h2 className="text-xl font-black text-white">What is included now</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <UsageMeter user={safeUser} />
      </section>
    </DashboardChrome>
  );
}
