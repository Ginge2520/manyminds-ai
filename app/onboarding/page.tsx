import { DashboardChrome } from "@/components/DashboardChrome";

export default function OnboardingPage() {
  return (
    <DashboardChrome>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">First room setup</p>
        <h1 className="mt-3 text-4xl font-black text-white">Build your first AI agent team</h1>
        <p className="mt-3 leading-7 text-slate-300">
          Pick your first mission. ManyMinds starts you on a free account, then keeps the early test experience simple.
        </p>
        <form action="/api/onboarding/complete" method="post" className="mt-7 grid gap-4">
          <label className="field">
            <span className="field-label">First mission</span>
            <textarea className="field-input min-h-28" name="mission" placeholder="Plan my MVP, create a launch brief, compare product ideas..." required />
          </label>
          <button className="primary-cta" type="submit">Enter dashboard</button>
        </form>
      </section>
    </DashboardChrome>
  );
}
