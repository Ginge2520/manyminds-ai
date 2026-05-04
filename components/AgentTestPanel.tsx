"use client";

import { useMemo, useState } from "react";
import { agentProfiles, defaultAgentIds, type AgentId } from "@/lib/agents/agentProfiles";
import type { AgentRunMode, AgentTeamMessage } from "@/lib/agents/agentOrchestrator";

interface AgentRunResponse {
  ok: boolean;
  messages?: AgentTeamMessage[];
  error?: string;
  message?: string;
  code?: string;
}

interface UserChatMessage {
  id: string;
  sender: "user";
  content: string;
  timestamp: string;
}

type ChatMessage = AgentTeamMessage | UserChatMessage;

interface LastRun {
  task: string;
  conversation: ChatMessage[];
}

const agentOptions = Object.values(agentProfiles);
const currentPlan = (process.env.NEXT_PUBLIC_DEMO_PLAN || "free").toLowerCase();
const prototypeUnlocked = process.env.NEXT_PUBLIC_PROTOTYPE_UNLOCK_ALL !== "false";
const developerModeUnlocked = prototypeUnlocked || ["pro", "power", "enterprise"].includes(currentPlan);

const modeOptions: Array<{ id: AgentRunMode; label: string; helper: string; bestUse: string; badge?: string; locked?: boolean }> = [
  {
    id: "standard",
    label: "Team Build",
    helper: "Best all-round mode: agents chat, challenge, then produce the answer.",
    bestUse: "Best for everyday product tasks, quick ideas, feature shaping, and getting a useful answer without slowing the room down.",
  },
  {
    id: "debate",
    label: "Debate Mode",
    helper: "Researcher, Critic, Compliance, and Strategist stress-test the decision.",
    bestUse: "Best when you need the agents to argue through a choice, expose weak assumptions, and reach a stronger recommendation.",
  },
  {
    id: "developer",
    label: "Developer Mode",
    helper: "Deep technical working, evidence, trade-offs, implementation steps, risks, and tests.",
    bestUse: "Best for technical planning, implementation notes, evidence tracking, risks, tests, and decision logs for serious build work.",
    badge: "Pro",
    locked: !developerModeUnlocked,
  },
];

const loadingQuips = [
  "Rok just called Chat's plan 'a PowerPoint wearing confidence'. Fair, but rude.",
  "Gem is fact-checking Pilot because apparently 'trust me bro' is not a source.",
  "Cloud moved one button and Pilot is acting like the whole sprint collapsed.",
  "Peri said 'small risk' in the tone people use before cancelling a launch.",
  "Rok found a weak assumption and is now being unbearable about it.",
  "Chat is summarising while Gem keeps adding footnotes like a nerd with a printer.",
  "Pilot says it is buildable. Rok says that is what every half-baked demo says.",
  "Cloud wants it elegant. Pilot wants it shipped. Peri wants everyone to stop lying to themselves.",
  "Gem is checking the facts because the others were getting dangerously confident.",
  "The team is arguing over the fastest answer that will not embarrass them in public.",
];

export function AgentTestPanel() {
  const [selectedAgents, setSelectedAgents] = useState<AgentId[]>(defaultAgentIds);
  const [mode, setMode] = useState<AgentRunMode>("standard");
  const [chatOpen, setChatOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingQuip, setTypingQuip] = useState(loadingQuips[0]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [lastRun, setLastRun] = useState<LastRun | null>(null);

  const selectedCount = selectedAgents.length;
  const freeLimitWarning = !prototypeUnlocked && selectedCount > 3 ? "Free testing allows up to 3 agents at once." : "";

  const selectedAgentLabels = useMemo(
    () => selectedAgents.map((agentId) => agentProfiles[agentId].nickname).join(", "),
    [selectedAgents],
  );
  const activeMode = modeOptions.find((option) => option.id === mode) || modeOptions[0];
  const lastAgentMessage = getLastAgentMessage(conversation);

  async function callAgents(nextTask: string, nextConversation: ChatMessage[]) {
    setTypingQuip((current) => getDifferentQuip(current));
    setLoading(true);
    setError("");
    setLastRun({ task: nextTask, conversation: nextConversation });

    try {
      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: nextTask, selectedAgents, mode }),
      });
      const data = (await response.json()) as AgentRunResponse;

      if (!data.ok) {
        if (data.code === "upgrade_required" && mode === "developer") setUpgradeOpen(true);
        setError(data.message || data.error || "The agents could not complete the run.");
        return;
      }

      setConversation([...nextConversation, ...(data.messages || [])]);
    } catch {
      setError("The agent API could not be reached. Check the app server and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function openTeamChat() {
    if (!prototypeUnlocked && selectedAgents.length > 3) {
      setError("Free testing allows up to 3 agents at once.");
      return;
    }

    setChatOpen(true);
    setConversation([]);
    setError("");
  }

  async function sendFollowUp() {
    const input = chatInput.trim();
    if (!input || loading) return;

    const userMessage = createUserMessage(input);
    const nextConversation = [...conversation, userMessage];
    const context = conversationToPrompt(nextConversation);
    const followUpTask =
      conversation.length === 0
        ? input
        : [
            "Visible conversation so far:",
            context,
            `User direction or question: ${input}`,
            "Reply as the selected agent team. Keep each message practical and conversational.",
          ].join("\n\n");

    setChatInput("");
    setConversation(nextConversation);
    await callAgents(followUpTask, nextConversation);
  }

  async function retryLastRun() {
    if (!lastRun || loading) return;
    setConversation(lastRun.conversation);
    await callAgents(lastRun.task, lastRun.conversation);
  }

  function toggleAgent(agentId: AgentId) {
    setSelectedAgents((current) => {
      if (current.includes(agentId)) {
        return current.filter((id) => id !== agentId);
      }
      return [...current, agentId];
    });
  }

  function resetRoom() {
    setChatOpen(false);
    setConversation([]);
    setError("");
    setChatInput("");
    setLastRun(null);
  }

  function resetConversation() {
    setConversation([]);
    setError("");
    setChatInput("");
    setLastRun(null);
  }

  if (chatOpen) {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1420] shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.04] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {selectedAgents.map((agentId) => (
                <AgentAvatar key={agentId} agentId={agentId} size="md" className="border border-[#0d1420]" />
              ))}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-aqua">{mode === "developer" ? "Developer workspace" : "ManyMinds team chat"}</p>
              <h2 className="text-xl font-black text-white">{selectedAgentLabels}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            {mode === "developer" && <span className="rounded-full border border-aqua/25 bg-aqua/10 px-3 py-2 text-xs font-black text-aqua">Deep working</span>}
            <span className="rounded-full bg-green/15 px-3 py-2 text-center text-xs font-black text-green">Local model</span>
            <button className="secondary-cta px-3 py-2" type="button" onClick={resetRoom}>
              Change team
            </button>
            <button className="secondary-cta px-3 py-2" type="button" onClick={resetConversation}>
              Reset chat
            </button>
          </div>
        </div>

        <div className="h-[68vh] overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(25,211,255,0.08),transparent_30%),#0b121d] px-3 py-4 sm:h-[64vh] sm:px-4 sm:py-5">
          <div className="mx-auto grid max-w-4xl gap-4">
            <ModeIntroCard mode={activeMode} />
            {mode === "developer" && <DeveloperWorkspaceBanner />}

            {conversation.map((message) =>
              isUserMessage(message) ? <UserBubble key={message.id} message={message} /> : <AgentBubble key={message.id} message={message} />,
            )}

            {!loading && !error && lastAgentMessage && <RunStatusCard message={lastAgentMessage} />}

            {!loading && !error && conversation.length === 0 && (
              <div className="grid min-h-[42vh] place-items-center text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex w-fit -space-x-2">
                    {selectedAgents.map((agentId) => (
                      <AgentAvatar key={agentId} agentId={agentId} size="lg" className="border border-[#0b121d]" />
                    ))}
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-white">Your team is in the room</h3>
                  <p className="mt-2 leading-7 text-slate-400">Send the first message below. The agents will discuss it in this chat and you can steer them as they go.</p>
                </div>
              </div>
            )}

            {loading && (
              <TypingIndicators selectedAgents={selectedAgents} quip={typingQuip} />
            )}

            {error && (
              <div className="rounded-3xl border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
                <strong className="block text-white">{errorTitle(error)}</strong>
                <span>{error}</span>
                {isOllamaError(error) && (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-slate-200">
                    <p className="font-black text-white">Quick local fix</p>
                    <p className="mt-1 text-slate-300">Start Ollama, make sure the model is installed, then try the same run again.</p>
                    <p className="mt-2 font-mono text-xs text-slate-400">ollama pull llama3.1</p>
                  </div>
                )}
                {lastRun && (
                  <button className="mt-3 block rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-slate-100" type="button" onClick={retryLastRun}>
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#0d1420] p-4">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row">
            <input
              className="field-input min-h-12 flex-1 rounded-2xl sm:rounded-full"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendFollowUp();
                }
              }}
              placeholder="Message the team, redirect the plan, or ask a follow-up..."
            />
            <button className="primary-cta min-w-24 rounded-2xl disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-full" type="button" onClick={sendFollowUp} disabled={loading || !chatInput.trim()}>
              Send
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Create the room</p>
        <h2 className="mt-2 text-3xl font-black text-white">Choose your agent team</h2>
        <p className="mt-2 leading-7 text-slate-400">
          {prototypeUnlocked ? "Prototype access is unlocked while you build. Pick any team and test every mode freely." : "Pick up to 3 agents for free testing. Once the room opens, you can send the first message in a clear team chat."}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {["1. Pick agents", "2. Choose mode", "3. Send task"].map((step) => (
            <span key={step} className="rounded-2xl border border-white/10 bg-black/15 px-3 py-2 text-center text-xs font-black uppercase tracking-[0.12em] text-slate-300">
              {step}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          {agentOptions.map((agent) => (
            <label
              key={agent.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 transition hover:bg-white/[0.08]"
            >
              <input
                className="mt-1 h-4 w-4 accent-aqua"
                type="checkbox"
                checked={selectedAgents.includes(agent.id)}
                onChange={() => toggleAgent(agent.id)}
              />
              <span className="grid flex-1 gap-1">
                <span className="font-black text-white">
                  <AgentAvatar agentId={agent.id} size="sm" className="mr-2 inline-grid align-middle" />
                  <span className="text-lg">{agent.nickname}</span>
                  <span className="ml-2 text-sm font-bold text-slate-400">{agent.name} / {agent.role}</span>
                </span>
                <span className="text-sm leading-6 text-slate-400">{agent.purpose}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl">
        <h3 className="text-xl font-black text-white">Room settings</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">Choose how the agents should think before they answer.</p>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-300">Mode</h4>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">{prototypeUnlocked ? "Testing unlocked" : `${selectedCount}/3 free`}</span>
          </div>
          <div className="mt-3 grid gap-3">
            {modeOptions.map((option) => (
              <button
                key={option.id}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  option.id === "developer"
                    ? mode === option.id
                      ? "border-aqua bg-[linear-gradient(135deg,rgba(25,211,255,0.18),rgba(255,255,255,0.075))] shadow-lg shadow-aqua/10"
                      : "border-aqua/20 bg-aqua/[0.055] hover:bg-aqua/[0.09]"
                    : mode === option.id
                      ? "border-aqua bg-aqua/10"
                      : "border-white/10 bg-white/[0.045] hover:bg-white/[0.08]"
                }`}
                type="button"
                onClick={() => {
                  if (option.locked) {
                    setUpgradeOpen(true);
                    return;
                  }
                  setMode(option.id);
                }}
              >
                <span className="flex items-center justify-between gap-3 font-black text-white">
                  <span>{option.label}</span>
                  {option.badge && <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-950">{option.badge}</span>}
                </span>
                <span className="mt-1 block text-sm text-slate-400">{option.helper}</span>
                {option.id === "developer" && (
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {["Evidence", "Risks", "Tests"].map((label) => (
                      <span key={label} className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
                        {label}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {freeLimitWarning && <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">{freeLimitWarning}</p>}
        {error && <p className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm font-bold text-red-100">{error}</p>}

        <button className="primary-cta mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={openTeamChat} disabled={loading || selectedCount === 0}>
          {loading ? "Opening chat..." : "Open team chat"}
        </button>
        <p className="mt-3 text-center text-xs font-bold text-slate-500">{selectedAgentLabels ? `In the room: ${selectedAgentLabels}` : "Pick at least one agent to open the room."}</p>
      </aside>
      {upgradeOpen && <DeveloperUpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </div>
  );
}

function AgentBubble({ message }: { message: AgentTeamMessage }) {
  const agent = agentProfiles[message.agentId];
  const isDeveloper = hasDeveloperDetails(message);

  return (
    <article className={`${isDeveloper ? "max-w-[960px] border-aqua/15 bg-[linear-gradient(180deg,rgba(8,19,31,0.96),rgba(13,20,32,0.96))]" : "max-w-[820px] border-white/10 bg-white/[0.07]"} w-full rounded-3xl rounded-tl-md border p-4 shadow-lg sm:w-fit`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <AgentAvatar agentId={message.agentId} size="lg" />
          <div>
            <h3 className="font-black text-white">
              <span className="text-lg">{agent.nickname}</span>
              <span className="ml-2 text-sm font-bold text-slate-400">{agent.name} / {message.role}</span>
            </h3>
            <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-black uppercase tracking-[0.16em] ${messageTypeClass(message.messageType)}`}>
              {message.messageType}
            </p>
            {message.replyToAgentId && (
              <p className="mt-2 w-fit rounded-full border border-aqua/20 bg-aqua/10 px-2 py-1 text-[11px] font-black text-aqua">
                Replying to @{agentProfiles[message.replyToAgentId].nickname}
              </p>
            )}
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">{Math.round(message.confidence * 100)}%</span>
      </div>
      <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-100">
        <MessageText content={message.content} />
      </p>
      {isDeveloper ? (
        <DeveloperDetails message={message} />
      ) : (
        <details className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-3">
          <summary className="cursor-pointer text-sm font-black text-slate-300">Why this answer looks this way</summary>
          <div className="mt-3 grid gap-3 text-sm text-slate-400 md:grid-cols-2">
            <ListBlock title="Working assumptions" items={message.assumptions} empty="No assumptions listed." />
            <ListBlock title="Evidence to check" items={message.evidenceNeeded} empty="No evidence checks listed." />
          </div>
        </details>
      )}
    </article>
  );
}

function UserBubble({ message }: { message: UserChatMessage }) {
  return (
    <article className="ml-auto w-full max-w-[720px] rounded-3xl rounded-tr-md bg-green/20 p-4 text-right shadow-lg ring-1 ring-green/30 sm:w-fit">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-green">You</p>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-white">
        <MessageText content={message.content} />
      </p>
    </article>
  );
}

function RunStatusCard({ message }: { message: AgentTeamMessage }) {
  const needsClarification = isClarificationMessage(message);
  const clarificationQuestion = needsClarification ? extractClarificationQuestion(message.content) : "";

  return (
    <section
      className={`ml-auto w-full max-w-[760px] rounded-3xl border p-4 shadow-xl sm:w-fit ${
        needsClarification
          ? "border-amber-300/25 bg-amber-300/10"
          : "border-green/25 bg-[linear-gradient(135deg,rgba(42,245,152,0.14),rgba(255,255,255,0.045))]"
      }`}
    >
      <p className={`text-xs font-black uppercase tracking-[0.18em] ${needsClarification ? "text-amber-100" : "text-green"}`}>
        {needsClarification ? "Clarification needed" : "Task complete"}
      </p>
      <h3 className="mt-1 text-xl font-black text-white">
        {needsClarification ? "The team needs one answer from you" : "The team answer is ready"}
      </h3>
      {needsClarification && clarificationQuestion && (
        <p className="mt-4 rounded-2xl border border-amber-200/20 bg-black/20 px-4 py-3 text-lg font-black leading-7 text-white">
          {clarificationQuestion}
        </p>
      )}
      <p className="mt-2 text-sm leading-6 text-slate-300">
        {needsClarification
          ? "Reply in the chat box below and the agents will continue from here instead of guessing."
          : "You can ask a follow-up, redirect the team, or reset the chat for a new task."}
      </p>
    </section>
  );
}

function messageTypeClass(type: AgentTeamMessage["messageType"]) {
  const styles: Record<AgentTeamMessage["messageType"], string> = {
    idea: "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/20",
    evidence: "bg-violet-400/15 text-violet-200 ring-1 ring-violet-300/20",
    challenge: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/20",
    decision: "bg-green/15 text-green ring-1 ring-green/25",
    action: "bg-blue-400/15 text-blue-200 ring-1 ring-blue-300/20",
    summary: "bg-white/15 text-white ring-1 ring-white/20",
    risk: "bg-red-400/15 text-red-200 ring-1 ring-red-300/20",
    funny: "bg-fuchsia-400/15 text-fuchsia-100 ring-1 ring-fuchsia-300/25",
    analysis: "bg-sky-400/15 text-sky-100 ring-1 ring-sky-300/25",
    architecture: "bg-indigo-400/15 text-indigo-100 ring-1 ring-indigo-300/25",
    implementation: "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/25",
    test: "bg-lime-400/15 text-lime-100 ring-1 ring-lime-300/25",
  };

  return styles[type];
}

function AgentAvatar({ agentId, size = "md", className = "" }: { agentId: AgentId; size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClass = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-11 w-11" : "h-10 w-10";

  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-white text-slate-950 shadow-lg ${sizeClass} ${className}`}>
      <AgentSymbol agentId={agentId} />
    </span>
  );
}

function AgentSymbol({ agentId }: { agentId: AgentId }) {
  switch (agentId) {
    case "strategist":
      return (
        <svg aria-label="ChatGPT" className="h-6 w-6" viewBox="0 0 48 48" role="img">
          <g fill="none" stroke="#111827" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M24 8c5 0 8 3 8 8v4l-8 5-8-5v-4c0-5 3-8 8-8Z" />
            <path d="M37.8 16c2.5 4.3 1.4 8.5-2.9 11l-3.5 2-8.3-4.4.3-9.4 3.5-2c4.3-2.5 8.4-1.5 10.9 2.8Z" />
            <path d="M37.8 32c-2.5 4.3-6.6 5.3-10.9 2.8l-3.5-2-.3-9.4 8.3-4.4 3.5 2c4.3 2.5 5.4 6.7 2.9 11Z" />
            <path d="M24 40c-5 0-8-3-8-8v-4l8-5 8 5v4c0 5-3 8-8 8Z" />
            <path d="M10.2 32c-2.5-4.3-1.4-8.5 2.9-11l3.5-2 8.3 4.4-.3 9.4-3.5 2c-4.3 2.5-8.4 1.5-10.9-2.8Z" />
            <path d="M10.2 16c2.5-4.3 6.6-5.3 10.9-2.8l3.5 2 .3 9.4-8.3 4.4-3.5-2c-4.3-2.5-5.4-6.7-2.9-11Z" />
          </g>
        </svg>
      );
    case "researcher":
      return (
        <svg aria-label="Gemini" className="h-6 w-6" viewBox="0 0 48 48" role="img">
          <defs>
            <linearGradient id="gemini-gradient" x1="9" x2="39" y1="39" y2="9">
              <stop stopColor="#5b7cfa" />
              <stop offset="1" stopColor="#f15bb5" />
            </linearGradient>
          </defs>
          <path fill="url(#gemini-gradient)" d="M24 5c2.6 9.4 5.6 12.4 15 15-9.4 2.6-12.4 5.6-15 15-2.6-9.4-5.6-12.4-15-15 9.4-2.6 12.4-5.6 15-15Z" />
          <path fill="#7dd3fc" d="M36 28c1.2 4.2 2.6 5.6 6.8 6.8-4.2 1.2-5.6 2.6-6.8 6.8-1.2-4.2-2.6-5.6-6.8-6.8 4.2-1.2 5.6-2.6 6.8-6.8Z" />
        </svg>
      );
    case "designer":
      return (
        <svg aria-label="Claude" className="h-6 w-6" viewBox="0 0 48 48" role="img">
          <g fill="none" stroke="#b76e3b" strokeLinecap="round" strokeWidth="4">
            <path d="M24 6v36" />
            <path d="M6 24h36" />
            <path d="m11.3 11.3 25.4 25.4" />
            <path d="m36.7 11.3-25.4 25.4" />
            <path d="m17 7 14 34" />
            <path d="m41 17-34 14" />
          </g>
        </svg>
      );
    case "builder":
      return (
        <svg aria-label="GitHub Copilot" className="h-6 w-6" viewBox="0 0 48 48" role="img">
          <g fill="none" stroke="#111827" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
            <path d="M13 24c0-8 4.4-14 11-14s11 6 11 14v11c0 3.3-2.7 6-6 6H19c-3.3 0-6-2.7-6-6V24Z" />
            <path d="M13 25H8c-2.2 0-4 1.8-4 4v3c0 2.2 1.8 4 4 4h5" />
            <path d="M35 25h5c2.2 0 4 1.8 4 4v3c0 2.2-1.8 4-4 4h-5" />
            <rect x="15" y="21" width="18" height="12" rx="5" />
            <path d="M20 27h.1" />
            <path d="M28 27h.1" />
            <path d="M18 11 14 6" />
            <path d="m30 11 4-5" />
          </g>
        </svg>
      );
    case "critic":
      return (
        <svg aria-label="Grok" className="h-6 w-6" viewBox="0 0 48 48" role="img">
          <g fill="none" stroke="#111827" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
            <path d="M11 10 37 38" />
            <path d="M37 10 11 38" />
            <path d="M17 24h14" strokeWidth="3" />
          </g>
        </svg>
      );
    case "compliance":
      return (
        <svg aria-label="Perplexity" className="h-6 w-6" viewBox="0 0 48 48" role="img">
          <g fill="none" stroke="#111827" strokeLinejoin="round" strokeWidth="3.5">
            <path d="M10 9h28v30H10z" />
            <path d="M24 9v30" />
            <path d="M10 24h28" />
            <path d="m10 9 14 15L38 9" />
            <path d="m10 39 14-15 14 15" />
          </g>
        </svg>
      );
  }
}

function TypingIndicators({ selectedAgents, quip }: { selectedAgents: AgentId[]; quip: string }) {
  const typingAgents = selectedAgents.slice(0, 3);

  return (
    <div className="w-fit max-w-[92%] rounded-3xl rounded-tl-md border border-white/10 bg-white/[0.07] p-4 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="flex -space-x-2">
          {typingAgents.map((agentId) => (
            <AgentAvatar key={agentId} agentId={agentId} size="sm" className="border border-[#1b2431]" />
          ))}
        </span>
        <div>
          <p className="text-sm font-black text-white">Team is typing</p>
          <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-400">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
            </span>
            <span>{quip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDifferentQuip(current: string) {
  if (loadingQuips.length === 1) return loadingQuips[0];

  let next = current;
  while (next === current) {
    next = loadingQuips[Math.floor(Math.random() * loadingQuips.length)];
  }
  return next;
}

function MessageText({ content }: { content: string }) {
  const inlinePattern = /(@[A-Za-z][A-Za-z0-9_-]*|\*\*[^*]+\*\*)/g;
  const parts = content.split(inlinePattern);
  const seenMentions = new Set<string>();

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          const mentionKey = part.toLowerCase();
          if (seenMentions.has(mentionKey)) {
            return <span key={`${part}-${index}`}>{part.slice(1)}</span>;
          }
          seenMentions.add(mentionKey);

          return (
            <span key={`${part}-${index}`} className="rounded-full bg-aqua/10 px-1.5 py-0.5 font-black text-aqua">
              {part}
            </span>
          );
        }

        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={`${part}-${index}`} className="font-black text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function ModeIntroCard({ mode }: { mode: (typeof modeOptions)[number] }) {
  const isDeveloper = mode.id === "developer";
  const isDebate = mode.id === "debate";

  return (
    <section
      className={`rounded-[1.75rem] border p-4 shadow-xl ${
        isDeveloper
          ? "border-aqua/25 bg-[linear-gradient(135deg,rgba(25,211,255,0.15),rgba(99,102,241,0.08),rgba(255,255,255,0.045))] shadow-aqua/5"
          : isDebate
            ? "border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(255,255,255,0.045))]"
            : "border-white/10 bg-white/[0.06]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-xs font-black uppercase tracking-[0.18em] ${isDeveloper ? "text-aqua" : isDebate ? "text-amber-100" : "text-green"}`}>
              Current mode
            </p>
            {mode.badge && (
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-950">
                {prototypeUnlocked ? "Unlocked" : mode.badge}
              </span>
            )}
          </div>
          <h3 className="mt-1 text-2xl font-black text-white">{mode.label}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{mode.bestUse}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {(isDeveloper ? ["Evidence", "Risks", "Tests"] : isDebate ? ["Challenge", "Decision", "Approve"] : ["Build", "Chat", "Answer"]).map((label) => (
            <span key={label} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-black text-slate-200">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeveloperWorkspaceBanner() {
  return (
    <section className="rounded-[1.75rem] border border-aqua/20 bg-[linear-gradient(135deg,rgba(25,211,255,0.13),rgba(255,255,255,0.055))] p-4 shadow-xl shadow-aqua/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">Developer Mode Active</p>
          <h3 className="mt-1 text-xl font-black text-white">Technical report workspace</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
            Agents expose safe working summaries, evidence, trade-offs, implementation steps, risks, tests, and decision logs.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-black sm:flex">
          {["Evidence", "Architecture", "Risks", "Tests"].map((label) => (
            <span key={label} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-center text-slate-200">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeveloperDetails({ message }: { message: AgentTeamMessage }) {
  const implementationText = (message.implementationSteps || []).join("\n");

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-aqua/15 bg-[#07111c] shadow-inner shadow-aqua/5">
      <div className="border-b border-white/10 bg-white/[0.035] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">Developer report</p>
            <h4 className="mt-1 text-lg font-black text-white">Safe working notes</h4>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">No hidden chain-of-thought. Only structured summaries, evidence, assumptions, decisions, and checks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-white/10 px-3 py-2 text-xs font-black text-slate-300 transition hover:bg-white/10" type="button" onClick={() => void navigator.clipboard?.writeText(implementationText)}>
              Copy implementation plan
            </button>
            <button className="rounded-full border border-aqua/25 bg-aqua/10 px-3 py-2 text-xs font-black text-aqua transition hover:bg-aqua/15" type="button">
              Export developer report
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <DeveloperLabel label="Evidence" tone="green" count={message.evidenceUsed?.length} />
          <DeveloperLabel label="Assumption" tone="amber" count={message.assumptions?.length} />
          <DeveloperLabel label="Needs Evidence" tone="violet" count={message.evidenceGaps?.length} />
          <DeveloperLabel label="Risk" tone="red" count={message.risks?.length} />
          <DeveloperLabel label="Decision" tone="blue" count={message.decisionLog?.length} />
          <DeveloperLabel label="Test" tone="lime" count={message.testsOrChecks?.length} />
        </div>
      </div>

      <div className="grid gap-3 p-4">
        <DeveloperSection title="Working Summary" text={message.reasoningSummary} empty="No working summary supplied." defaultOpen />
        <DeveloperSection title="Evidence" items={message.evidenceUsed} secondaryTitle="Evidence gaps" secondaryItems={message.evidenceGaps} empty="No evidence listed." defaultOpen />
        <DeveloperSection title="Assumptions" items={message.assumptions} empty="No assumptions listed." />
        <DeveloperSection title="Trade-offs" items={message.tradeOffs} empty="No trade-offs listed." />
        <DeveloperSection title="Decision Log" items={message.decisionLog} empty="No decisions listed." />
        <DeveloperSection title="Risks" items={message.risks} empty="No risks listed." />
        <DeveloperSection title="Implementation" items={message.implementationSteps} secondaryTitle="Model/tool actions taken" secondaryItems={message.toolActionsTaken} empty="No implementation steps listed." defaultOpen />
        <DeveloperSection title="Tests" items={message.testsOrChecks} secondaryTitle="Source links/placeholders" secondaryItems={message.sourceLinks} empty="No tests listed." />
      </div>
    </section>
  );
}

function DeveloperSection({
  title,
  text,
  items,
  secondaryTitle,
  secondaryItems,
  empty,
  defaultOpen = false,
}: {
  title: string;
  text?: string;
  items?: string[];
  secondaryTitle?: string;
  secondaryItems?: string[];
  empty: string;
  defaultOpen?: boolean;
}) {
  const primaryItems = items?.filter(Boolean) || [];
  const secondary = secondaryItems?.filter(Boolean) || [];

  return (
    <details className="group rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-aqua/20" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-white">
        <span>{title}</span>
        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-400 group-open:text-aqua">Open</span>
      </summary>
      <div className="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
        <div>
          {text ? <p className="leading-6">{text}</p> : primaryItems.length ? <MiniList items={primaryItems} /> : <p className="text-slate-500">{empty}</p>}
        </div>
        {(secondaryTitle || secondary.length > 0) && (
          <div>
            {secondaryTitle && <h4 className="mb-2 font-black text-slate-100">{secondaryTitle}</h4>}
            {secondary.length ? <MiniList items={secondary} /> : <p className="text-slate-500">None listed.</p>}
          </div>
        )}
      </div>
    </details>
  );
}

function MiniList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-xl bg-white/[0.05] px-3 py-2 leading-6">
          {item}
        </li>
      ))}
    </ul>
  );
}

function DeveloperLabel({ label, tone, count }: { label: string; tone: "green" | "amber" | "violet" | "red" | "blue" | "lime"; count?: number }) {
  const tones = {
    green: "bg-green/15 text-green",
    amber: "bg-amber-300/15 text-amber-100",
    violet: "bg-violet-300/15 text-violet-100",
    red: "bg-red-400/15 text-red-100",
    blue: "bg-aqua/15 text-aqua",
    lime: "bg-lime-300/15 text-lime-100",
  };

  return (
    <span className={`inline-flex items-center justify-between gap-2 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${tones[tone]}`}>
      <span>{label}</span>
      {typeof count === "number" && <span className="rounded-full bg-black/20 px-1.5 py-0.5">{count}</span>}
    </span>
  );
}

function hasDeveloperDetails(message: AgentTeamMessage) {
  return Boolean(
    message.reasoningSummary ||
      message.evidenceUsed?.length ||
      message.evidenceGaps?.length ||
      message.tradeOffs?.length ||
      message.decisionLog?.length ||
      message.risks?.length ||
      message.implementationSteps?.length ||
      message.testsOrChecks?.length ||
      message.sourceLinks?.length ||
      message.toolActionsTaken?.length,
  );
}

function DeveloperUpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur">
      <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#101925] p-6 shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-aqua">Pro feature</p>
        <h2 className="mt-3 text-3xl font-black text-white">Unlock Developer Mode</h2>
        <p className="mt-3 leading-7 text-slate-300">
          Developer Mode gives you deeper agent working, evidence tracking, trade-offs, implementation plans, risks, tests, and structured decision logs.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href="/pricing" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950">
            Upgrade to Pro
          </a>
          <a href="/pricing" className="rounded-2xl border border-aqua/25 bg-aqua/10 px-4 py-3 text-center text-sm font-black text-aqua">
            View all plans
          </a>
        </div>
        <button className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-slate-300" type="button" onClick={onClose}>
          Not now
        </button>
      </section>
    </div>
  );
}

function ListBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <h4 className="font-black text-white">{title}</h4>
      {items.length ? (
        <ul className="mt-2 grid gap-2">
          {items.map((item) => (
            <li key={item} className="rounded-xl bg-white/[0.045] px-3 py-2">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 rounded-xl bg-white/[0.045] px-3 py-2">{empty}</p>
      )}
    </div>
  );
}

function createUserMessage(content: string): UserChatMessage {
  return {
    id: crypto.randomUUID(),
    sender: "user",
    content,
    timestamp: new Date().toISOString(),
  };
}

function isUserMessage(message: ChatMessage): message is UserChatMessage {
  return "sender" in message && message.sender === "user";
}

function getLastAgentMessage(conversation: ChatMessage[]) {
  return [...conversation].reverse().find((message): message is AgentTeamMessage => !isUserMessage(message));
}

function isClarificationMessage(message: AgentTeamMessage) {
  const content = message.content.trim();
  return /^clarifying question/i.test(content) || (/(\?|more context|need clarification|need you to clarify)/i.test(content) && content.split(/\s+/).length < 90);
}

function extractClarificationQuestion(content: string) {
  const cleaned = content
    .replace(/^clarifying question:\s*/i, "")
    .replace(/^question:\s*/i, "")
    .replace(/@[A-Za-z][A-Za-z0-9_-]*\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const questions = cleaned.match(/[^?]+\?/g)?.map((question) => question.trim()).filter(Boolean) || [];
  const rawQuestion = questions.at(-1) || cleaned;
  return formatClarificationQuestion(trimToQuestion(rawQuestion));
}

function trimToQuestion(value: string) {
  const labelledQuestion = value.replace(
    /^.*?(?:evidence gap|key question|main question|question|clarification|clarify)\s*:\s*/i,
    "",
  );
  const cleaned = labelledQuestion
    .replace(/^.*?\b(?:however|but|so)\b[:,]?\s*/i, "")
    .replace(/^[\s:;,.!?'"`-]+/, "")
    .trim();
  const questionStart = cleaned.search(
    /\b(how|what|which|who|when|where|why|do|does|did|can|could|should|would|is|are|will)\b/i,
  );
  return questionStart >= 0 ? cleaned.slice(questionStart) : cleaned;
}

function formatClarificationQuestion(value: string) {
  const compact = value.replace(/\s+/g, " ").replace(/[.!]+$/, "").trim();
  if (!compact) return "";
  const question = compact.endsWith("?") ? compact : `${compact}?`;
  return `${question.charAt(0).toUpperCase()}${question.slice(1)}`;
}

function errorTitle(error: string) {
  if (error.includes("Debate Mode") || error.includes("Developer Mode")) return "Upgrade needed later";
  if (isOllamaError(error)) return "Local model needs attention";
  return "Agent run stopped";
}

function isOllamaError(error: string) {
  return /ollama|model .*not found|timed out|localhost:11434/i.test(error);
}

function conversationToPrompt(conversation: ChatMessage[]) {
  return conversation
    .slice(-10)
    .map((message) => {
      if (isUserMessage(message)) return `User: ${message.content}`;
      return `${message.agentName} (${message.role}): ${message.content}`;
    })
    .join("\n\n");
}
