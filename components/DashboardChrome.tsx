import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function DashboardChrome({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#080d16] text-ink">
      <header className="border-b border-white/10 bg-white/[0.04]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Logo compact />
          <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-300">
            <Link className="rounded-full px-3 py-2 hover:bg-white/10" href="/dashboard">Dashboard</Link>
            <Link className="rounded-full bg-white px-5 py-3 text-base font-black text-slate-950 shadow-lg shadow-white/10 transition hover:bg-slate-100" href="/agent-test">Agent Lab</Link>
            <Link className="rounded-full px-3 py-2 hover:bg-white/10" href="/account">Account</Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </main>
  );
}
