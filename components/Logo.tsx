import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/assets/manyminds-ai-logo.png"
        width={compact ? 44 : 58}
        height={compact ? 44 : 58}
        alt="ManyMinds AI logo"
        className="rounded-2xl border border-white/10 bg-black shadow-glow"
        priority
      />
      <div>
        <p className="text-lg font-black tracking-tight text-white">ManyMinds AI</p>
        {!compact && <p className="text-sm text-slate-400">Not one AI assistant. A whole team.</p>}
      </div>
    </div>
  );
}
