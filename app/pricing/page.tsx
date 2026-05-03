import Link from "next/link";
import { Logo } from "@/components/Logo";
import { planConfig } from "@/lib/plans";

export default function PricingPage() {
  const plan = planConfig.free;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(25,211,255,0.16),transparent_32%),linear-gradient(180deg,#070b13,#0c1420)] px-4 py-7 text-ink">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Logo compact />
        <nav className="flex gap-2 text-sm font-bold">
          <Link className="rounded-full px-4 py-2 text-slate-300 hover:bg-white/10" href="/login">Log in</Link>
          <Link className="rounded-full bg-white px-4 py-2 text-slate-950" href="/signup">Start free</Link>
        </nav>
      </header>

      <section className="mx-auto mt-16 max-w-4xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-aqua">Top AI agents. One team. One app.</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-white md:text-7xl">Start with a free ManyMinds account.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Paid tiers are switched off while we test the first experience. Create a free account, invite your first AI team, and help shape what comes next.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white">{plan.name}</h2>
            <p className="mt-2 text-slate-400">{plan.strapline}</p>
          </div>
          <p className="text-3xl font-black text-white">{plan.price}</p>
        </div>
        <ul className="mt-7 grid gap-3 text-slate-300">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-green" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link href="/signup" className="mt-8 inline-flex w-full justify-center rounded-2xl bg-aqua px-4 py-3 text-sm font-black text-slate-950">
          Create free account
        </Link>
      </section>
    </main>
  );
}
