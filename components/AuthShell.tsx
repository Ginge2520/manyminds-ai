import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,92,255,0.22),transparent_34%),linear-gradient(180deg,#070b13,#0c1420)] px-4 py-8 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1fr]">
        <section className="space-y-8">
          <Logo />
          <div className="max-w-xl space-y-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-aqua">Top AI agents. One team. One app.</p>
            <h1 className="text-5xl font-black leading-none tracking-tight text-white md:text-7xl">
              Your AI product team.
            </h1>
            <p className="text-lg leading-8 text-slate-300">
              Agents that collaborate, debate, and build with a bit of banter. Serious outputs, less lonely staring at a blank page.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="mb-7">
            <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
