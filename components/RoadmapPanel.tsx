interface RoadmapTask {
  label: string;
  done?: boolean;
}

interface RoadmapPhase {
  title: string;
  purpose: string;
  tasks: RoadmapTask[];
}

const roadmapPhases: RoadmapPhase[] = [
  {
    title: "Current Build",
    purpose: "What is already in place for the prototype.",
    tasks: [
      { label: "Next.js app scaffold, dashboard shell, and Agent Lab exist.", done: true },
      { label: "ManyMinds AI logo, branding, and premium dark UI direction added.", done: true },
      { label: "Team Build, Debate Mode, and Developer Mode are available.", done: true },
      { label: "Ollama local backend and OpenAI-ready provider structure exist.", done: true },
      { label: "Roadmap is visible at the bottom of Agent Lab.", done: true },
    ],
  },
  {
    title: "1. Local Agent Experience",
    purpose: "Make the core product feel worth testing.",
    tasks: [
      { label: "Improve agent collaboration so they reliably reply to each other.", done: true },
      { label: "Make final answers consistently useful and complete.", done: true },
      { label: "Stop raw JSON or malformed model output appearing in chat.", done: true },
      { label: "Add clarification-needed and task-complete cards.", done: true },
      { label: "Pause the run when agents need user clarification.", done: true },
      { label: "Keep funny comments short and clearly marked.", done: true },
      { label: "Add retry and reset controls for failed or finished chats.", done: true },
      { label: "Show a clear Ollama/local model failure state.", done: true },
      { label: "Test Team Build, Debate Mode, and Developer Mode with real prompts." },
    ],
  },
  {
    title: "2. UI Polish For Testers",
    purpose: "Make the app obvious for non-technical friends.",
    tasks: [
      { label: "Make the first screen after entry impossible to misunderstand.", done: true },
      { label: "Simplify tester-facing copy.", done: true },
      { label: "Improve mobile layout for chat, agent selector, and mode selector.", done: true },
      { label: "Check all buttons have consistent size, shape, and hover states.", done: true },
      { label: "Make message bubbles easier to scan on small screens.", done: true },
      { label: "Make every agent message explain who is speaking and why.", done: true },
      { label: "Keep Developer Mode feeling clearly more premium.", done: true },
      { label: "Remove or rewrite generic prototype copy.", done: true },
      { label: "Run a visual pass in Safari and Chrome." },
    ],
  },
  {
    title: "3. Auth And Accounts",
    purpose: "Make public testing less chaotic.",
    tasks: [
      { label: "Decide whether initial release requires login or allows demo access." },
      { label: "Fix sign-up, login, logout, and redirects." },
      { label: "Default new users to a Free account." },
      { label: "Remove false usage-limit errors for new users." },
      { label: "Confirm auth works on the deployed Netlify environment." },
    ],
  },
  {
    title: "4. Data And Persistence",
    purpose: "Stop the app feeling like a temporary demo.",
    tasks: [
      { label: "Choose production database.", done: true },
      { label: "Wire users, conversations, selected agents, and preferred mode to Netlify Database." },
      { label: "Save agent run history to Netlify Database." },
      { label: "Add shared memory and agent assumptions views." },
      { label: "Add a basic activity log." },
    ],
  },
  {
    title: "5. Hosted AI Provider",
    purpose: "Prepare for users who will not install Ollama.",
    tasks: [
      { label: "Choose the first hosted AI provider for production." },
      { label: "Wire OpenAI server-side provider for real app runs." },
      { label: "Add model selection per plan." },
      { label: "Add timeout, cost control, and provider error handling." },
      { label: "Keep provider keys server-side only." },
    ],
  },
  {
    title: "6. Plans And Upgrades",
    purpose: "Reintroduce restrictions when the core experience is ready.",
    tasks: [
      { label: "Re-enable Free plan limits and mode restrictions." },
      { label: "Lock Developer Mode to Pro and above." },
      { label: "Add upgrade prompts only where they make sense." },
      { label: "Wire Stripe Checkout, webhook, and customer portal." },
      { label: "Test upgrade and downgrade flows." },
    ],
  },
  {
    title: "7. Trust And Control",
    purpose: "Make the product feel safe and serious.",
    tasks: [
      { label: "Add pause all agents and stop current run controls." },
      { label: "Add reset conversation context." },
      { label: "Add tool/action history." },
      { label: "Add human approval checkpoints for risky actions." },
      { label: "Add warning cards for missing sources, weak assumptions, disagreement, and low confidence." },
    ],
  },
  {
    title: "8. Output And Export",
    purpose: "Turn good conversations into useful documents.",
    tasks: [
      { label: "Design output/report workspace separately from chat modes." },
      { label: "Add final answer summary card." },
      { label: "Add copy-to-clipboard for final outputs." },
      { label: "Add Markdown, PDF, and DOCX export path." },
      { label: "Add product brief, roadmap, build plan, and pitch deck templates." },
    ],
  },
  {
    title: "9. Deployment And Testing",
    purpose: "Get the first public test release ready.",
    tasks: [
      { label: "Confirm Netlify build and production domain are healthy." },
      { label: "Add required environment variables in Netlify." },
      { label: "Test desktop Safari, desktop Chrome, iPhone Safari, and Android Chrome." },
      { label: "Create 10 tester tasks for friends." },
      { label: "Add privacy policy, terms draft, and feedback route." },
    ],
  },
];

export function RoadmapPanel() {
  const totalTasks = roadmapPhases.reduce((total, phase) => total + phase.tasks.length, 0);
  const completeTasks = roadmapPhases.reduce((total, phase) => total + phase.tasks.filter((task) => task.done).length, 0);

  return (
    <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl md:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Release roadmap</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Initial release checklist</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            A quick view of what is already built and what still needs to happen before ManyMinds AI is ready for friends and early testers.
          </p>
        </div>
        <div className="rounded-2xl border border-aqua/20 bg-aqua/10 px-4 py-3 text-sm font-black text-aqua">
          {completeTasks}/{totalTasks} visible tasks complete
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {roadmapPhases.map((phase, index) => {
          const completed = phase.tasks.filter((task) => task.done).length;

          return (
            <details
              key={phase.title}
              className="group rounded-3xl border border-white/10 bg-[#0d1420] p-4 transition hover:border-aqua/20"
              open={index < 2}
            >
              <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="text-lg font-black text-white">{phase.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">{phase.purpose}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-slate-300">
                    {completed}/{phase.tasks.length}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-2 text-xs font-black text-slate-400 group-open:text-aqua">
                    Open
                  </span>
                </span>
              </summary>

              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {phase.tasks.map((task) => (
                  <li
                    key={task.label}
                    className={`flex gap-3 rounded-2xl border px-3 py-3 text-sm leading-6 ${
                      task.done
                        ? "border-green/20 bg-green/10 text-green"
                        : "border-white/10 bg-white/[0.035] text-slate-300"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border text-xs font-black ${
                        task.done ? "border-green bg-green text-slate-950" : "border-slate-500 text-slate-500"
                      }`}
                    >
                      {task.done ? "✓" : ""}
                    </span>
                    <span>{task.label}</span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-500">
        Full source document: <span className="font-bold text-slate-300">docs/INITIAL_RELEASE_ROADMAP.md</span>
      </p>
    </section>
  );
}
