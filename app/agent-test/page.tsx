import { AgentTestPanel } from "@/components/AgentTestPanel";
import { DashboardChrome } from "@/components/DashboardChrome";

export default function AgentTestPage() {
  return (
    <DashboardChrome>
      <section className="mb-7 rounded-[2rem] border border-white/10 bg-white/[0.055] p-7">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Local AI lab</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">ManyMinds AI Agent Test Lab</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-300">Test real local agents before launch.</p>
      </section>
      <AgentTestPanel />
    </DashboardChrome>
  );
}
