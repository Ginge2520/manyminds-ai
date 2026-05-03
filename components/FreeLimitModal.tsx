"use client";

import Link from "next/link";
import { useState } from "react";

export function FreeLimitModal({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!open) {
    return (
      <button
        className="rounded-2xl border border-aqua/30 bg-aqua/10 px-4 py-3 text-sm font-black text-aqua"
        onClick={() => setOpen(true)}
      >
        Preview free limit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/76 p-4 backdrop-blur">
      <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#101925] p-6 shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-aqua">Free limit reached</p>
        <h2 className="mt-3 text-3xl font-black text-white">Your AI team has used this month's free runs</h2>
        <p className="mt-3 leading-7 text-slate-300">
          Free accounts currently include 10 agent runs each month while we test the product with early users.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/account" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950">
            View account
          </Link>
          <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-slate-300" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
