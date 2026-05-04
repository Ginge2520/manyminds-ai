import { AgentTestPanel } from "@/components/AgentTestPanel";
import { DashboardChrome } from "@/components/DashboardChrome";
import { RoadmapPanel } from "@/components/RoadmapPanel";

export default function AgentTestPage() {
  return (
    <DashboardChrome>
      <section className="mb-7 rounded-[2rem] border border-white/10 bg-white/[0.055] p-7">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Agent Lab</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">ManyMinds AI Agent Test Lab</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-300">
          Choose your AI team, pick how they should work, then send a task. You will see the agents talk, challenge, and produce a useful answer in one shared chat.
        </p>
      </section>
      <AgentTestPanel />
      <RoadmapPanel />
    </DashboardChrome>
  );
}
