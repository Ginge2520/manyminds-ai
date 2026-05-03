import Link from "next/link";
import { ComparisonTable } from "@/components/ComparisonTable";
import { Logo } from "@/components/Logo";
import { PricingCard } from "@/components/PricingCard";
import { planConfig } from "@/lib/plans";

export default function PricingPage() {
  const plans = Object.values(planConfig);

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
        <h1 className="mt-4 text-5xl font-black tracking-tight text-white md:text-7xl">Choose the team that fits the mission.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Start free, upgrade when your AI team starts earning its snacks. Free plan never asks for payment details.
        </p>
      </section>

      <section className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} featured={plan.id === "pro"} />
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-7xl">
        <h2 className="mb-5 text-3xl font-black text-white">Upgrade comparison</h2>
        <ComparisonTable />
      </section>
    </main>
  );
}
