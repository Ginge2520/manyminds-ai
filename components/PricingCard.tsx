import Link from "next/link";
import type { PlanConfig } from "@/lib/plans";

export function PricingCard({ plan, featured = false }: { plan: PlanConfig; featured?: boolean }) {
  const isFree = plan.id === "free";
  const isEnterprise = plan.id === "enterprise";
  const buttonText = isFree ? "Start free" : isEnterprise ? "Contact us" : "Upgrade";
  const href = isFree ? "/signup" : isEnterprise ? "mailto:hello@manyminds.ai" : `/api/stripe/create-checkout-session?plan=${plan.id}`;

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border p-6 shadow-xl ${
        featured
          ? "border-aqua/50 bg-aqua/10 shadow-glow"
          : "border-white/10 bg-white/[0.055]"
      }`}
    >
      {featured && (
        <div className="absolute right-5 top-5 rounded-full bg-aqua px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-950">
          Most Popular
        </div>
      )}
      <div className="space-y-3">
        <h3 className="text-2xl font-black text-white">{plan.name}</h3>
        <p className="text-sm leading-6 text-slate-400">{plan.strapline}</p>
        <p className="text-3xl font-black text-white">{plan.price}</p>
      </div>
      <ul className="mt-6 grid gap-3 text-sm text-slate-300">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-green" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-7 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
          featured ? "bg-aqua text-slate-950" : "bg-white text-slate-950"
        }`}
      >
        {buttonText}
      </Link>
    </article>
  );
}
