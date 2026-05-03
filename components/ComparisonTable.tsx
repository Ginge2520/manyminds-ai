import { formatLimit, planConfig } from "@/lib/plans";

const rows = [
  { label: "Agent runs", value: (id: keyof typeof planConfig) => formatLimit(planConfig[id].runsPerMonth, "/month") },
  { label: "Max agents", value: (id: keyof typeof planConfig) => formatLimit(planConfig[id].maxAgents) },
  { label: "Debate Mode", value: (id: keyof typeof planConfig) => (planConfig[id].debateMode ? "Included" : "Not included") },
  { label: "Provider", value: (id: keyof typeof planConfig) => planConfig[id].provider.replaceAll("_", " ") },
  { label: "Queue", value: (id: keyof typeof planConfig) => planConfig[id].queue },
  { label: "History", value: (id: keyof typeof planConfig) => planConfig[id].history },
];

export function ComparisonTable() {
  const plans = Object.values(planConfig);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.06] text-slate-300">
            <tr>
              <th className="p-4 font-black text-white">Compare</th>
              {plans.map((plan) => (
                <th key={plan.id} className="p-4 font-black text-white">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-white/10">
                <td className="p-4 font-bold text-slate-300">{row.label}</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 capitalize text-slate-400">
                    {row.value(plan.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
