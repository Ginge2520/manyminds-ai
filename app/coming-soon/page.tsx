export default function ComingSoonPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070b14] text-white">
      <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(44,213,255,0.18),transparent_34%),linear-gradient(135deg,rgba(126,87,255,0.16),transparent_42%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

        <div className="relative w-full max-w-3xl text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-cyan-500/10">
            <img
              src="/assets/manyminds-ai-logo.png"
              alt="ManyMinds AI"
              className="h-16 w-16 rounded-2xl object-cover"
            />
          </div>

          <p className="mb-4 text-sm font-black uppercase tracking-[0.32em] text-cyan-200">
            ManyMinds AI
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
            Coming soon
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-300 sm:text-xl">
            We are building a visible AI product team: agents that collaborate, debate, and help turn rough ideas into real plans.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl gap-3 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 text-left shadow-2xl shadow-black/30 sm:grid-cols-3">
            {["Private testing", "Agent workspace", "Launch prep"].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-sm font-black text-white">{item}</p>
                <p className="mt-2 text-sm font-semibold text-slate-400">In progress</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm font-bold text-slate-500">
            The team is backstage arguing over button labels. Productive chaos, allegedly.
          </p>
        </div>
      </section>
    </main>
  );
}
