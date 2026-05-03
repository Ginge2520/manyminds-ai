import { getPlan } from "@/lib/plans";
import { usageRemaining } from "@/lib/usage";
import type { User } from "@/lib/types";

export function UsageMeter({ user }: { user: User }) {
  const plan = getPlan(user.plan);
  const remaining = usageRemaining(user);
  const limit = plan.runsPerMonth;
  const percentage = limit === null ? 18 : Math.min((user.usageThisMonth / limit) * 100, 100);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-aqua">Usage this month</p>
          <h3 className="mt-2 text-2xl font-black text-white">
            {user.usageThisMonth} / {limit === null ? "Custom" : limit} runs
          </h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">
          {remaining === null ? "Custom limit" : `${remaining} left`}
        </span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-aqua" style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-400">Usage resets on {new Date(user.usageResetDate).toLocaleDateString()}.</p>
    </div>
  );
}
