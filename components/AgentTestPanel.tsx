"use client";

import { useMemo, useState } from "react";
import { agentProfiles, defaultAgentIds, type AgentId } from "@/lib/agents/agentProfiles";
import type { AgentRunMode, AgentTeamMessage } from "@/lib/agents/agentOrchestrator";

interface AgentRunResponse {
  ok: boolean;
  messages?: AgentTeamMessage[];
  error?: string;
  code?: string;
}

interface UserChatMessage {
  id: string;
  sender: "user";
  content: string;
  timestamp: string;
}

type ChatMessage = AgentTeamMessage | UserChatMessage;

const agentOptions = Object.values(agentProfiles);
const modeOptions: Array<{ id: AgentRunMode; label: string; helper: string }> = [
  { id: "standard", label: "Standard", helper: "Agents respond one after another." },
  { id: "debate", label: "Debate", helper: "Blocked on free for now." },
  { id: "finalise", label: "Finalise", helper: "Builder, Critic, and Strategist create the output." },
];

export function AgentTestPanel() {
  const [task, setTask] = useState("Create a lean product plan for ManyMinds AI aimed at early-stage founders.");
  const [selectedAgents, setSelectedAgents] = useState<AgentId[]>(defaultAgentIds);
  const [mode, setMode] = useState<AgentRunMode>("standard");
  const [chatOpen, setChatOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCount = selectedAgents.length;
  const freeLimitWarning = selectedCount > 3 ? "Free testing allows up to 3 agents at once." : "";

  const selectedAgentLabels = useMemo(
    () => selectedAgents.map((agentId) => agentProfiles[agentId].name).join(", "),
    [selectedAgents],
  );

  async function callAgents(nextTask: string, nextConversation: ChatMessage[]) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: nextTask, selectedAgents, mode }),
      });
      const data = (await response.json()) as AgentRunResponse;

      if (!data.ok) {
        setError(data.error || "The agents could not complete the run.");
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
    if (!task.trim()) {
      setError("Add a mission before opening the team chat.");
      return;
    }

    if (selectedAgents.length > 3) {
      setError("Free testing allows up to 3 agents at once.");
      return;
    }

    const firstMessage = createUserMessage(task);
    setChatOpen(true);
    setConversation([firstMessage]);
    await callAgents(task, [firstMessage]);
  }

  async function sendFollowUp() {
    const input = chatInput.trim();
    if (!input || loading) return;

    const userMessage = createUserMessage(input);
    const nextConversation = [...conversation, userMessage];
    const context = conversationToPrompt(nextConversation);
    const followUpTask = [
      `Original mission: ${task}`,
      "Visible conversation so far:",
      context,
      `User direction or question: ${input}`,
      "Reply as the selected agent team. Keep each message practical and conversational.",
    ].join("\n\n");

    setChatInput("");
    setConversation(nextConversation);
    await callAgents(followUpTask, nextConversation);
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
  }

  if (chatOpen) {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1420] shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {selectedAgents.map((agentId) => (
                <span key={agentId} className="grid h-10 w-10 place-items-center rounded-full border border-[#0d1420] bg-aqua/20 text-sm font-black text-aqua">
                  {agentProfiles[agentId].avatarEmoji}
                </span>
              ))}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-aqua">ManyMinds team chat</p>
              <h2 className="text-xl font-black text-white">{selectedAgentLabels}</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green/15 px-3 py-2 text-xs font-black text-green">Ollama backend</span>
            <button className="secondary-cta px-3 py-2" type="button" onClick={resetRoom}>
              Change team
            </button>
          </div>
        </div>

        <div className="h-[64vh] overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(25,211,255,0.08),transparent_30%),#0b121d] px-4 py-5">
          <div className="mx-auto grid max-w-4xl gap-4">
            {conversation.map((message) =>
              isUserMessage(message) ? <UserBubble key={message.id} message={message} /> : <AgentBubble key={message.id} message={message} />,
            )}

            {loading && (
              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-slate-300">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-aqua/15 text-sm font-black text-aqua">AI</span>
                <div>
                  <p className="font-black text-white">Agents are thinking...</p>
                  <p className="text-sm text-slate-400">Atlas is probably drawing a tidy box around the chaos.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
                <strong className="block text-white">{error.includes("Debate Mode") ? "Upgrade needed later" : "Agent run stopped"}</strong>
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#0d1420] p-4">
          <div className="mx-auto flex max-w-4xl gap-3">
            <input
              className="field-input min-h-12 flex-1 rounded-full"
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
            <button className="primary-cta min-w-24 rounded-full disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={sendFollowUp} disabled={loading || !chatInput.trim()}>
              Send
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Create the room</p>
        <h2 className="mt-2 text-3xl font-black text-white">Choose your agent team</h2>
        <p className="mt-2 leading-7 text-slate-400">Pick up to 3 agents for free testing. Once the room opens, the interface becomes a clear team chat.</p>

        <label className="field mt-6">
          <span className="field-label">First message to the team</span>
          <textarea
            className="field-input min-h-36"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Ask the team to create, critique, research, or finalise a product idea."
          />
        </label>

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
                  <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-aqua/15 text-xs text-aqua">{agent.avatarEmoji}</span>
                  {agent.name} <span className="text-slate-400">/ {agent.role}</span>
                </span>
                <span className="text-sm leading-6 text-slate-400">{agent.purpose}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl">
        <h3 className="text-xl font-black text-white">Room settings</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">These stay lightweight while we test the real agent flow.</p>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-300">Mode</h4>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">{selectedCount}/3 free</span>
          </div>
          <div className="mt-3 grid gap-3">
            {modeOptions.map((option) => (
              <button
                key={option.id}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  mode === option.id ? "border-aqua bg-aqua/10" : "border-white/10 bg-white/[0.045] hover:bg-white/[0.08]"
                }`}
                type="button"
                onClick={() => setMode(option.id)}
              >
                <span className="block font-black text-white">{option.label}</span>
                <span className="mt-1 block text-sm text-slate-400">{option.helper}</span>
              </button>
            ))}
          </div>
        </div>

        {freeLimitWarning && <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">{freeLimitWarning}</p>}
        {error && <p className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm font-bold text-red-100">{error}</p>}

        <button className="primary-cta mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={openTeamChat} disabled={loading || selectedCount === 0}>
          {loading ? "Opening chat..." : "Open team chat"}
        </button>
        <p className="mt-3 text-center text-xs font-bold text-slate-500">Selected: {selectedAgentLabels || "No agents selected"}</p>
      </aside>
    </div>
  );
}

function AgentBubble({ message }: { message: AgentTeamMessage }) {
  return (
    <article className="max-w-[820px] rounded-3xl rounded-tl-md border border-white/10 bg-white/[0.07] p-4 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-aqua/15 font-black text-aqua">{message.avatarEmoji}</span>
          <div>
            <h3 className="font-black text-white">
              {message.agentName} <span className="text-slate-400">/ {message.role}</span>
            </h3>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{message.messageType}</p>
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">{Math.round(message.confidence * 100)}%</span>
      </div>
      <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-100">{message.content}</p>
      <p className="mt-3 text-sm font-bold text-aqua">Next: {message.nextAction}</p>
      <details className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-3">
        <summary className="cursor-pointer text-sm font-black text-slate-300">Assumptions and evidence</summary>
        <div className="mt-3 grid gap-3 text-sm text-slate-400 md:grid-cols-2">
          <ListBlock title="Assumptions" items={message.assumptions} empty="No assumptions listed." />
          <ListBlock title="Evidence needed" items={message.evidenceNeeded} empty="No evidence requests listed." />
        </div>
      </details>
    </article>
  );
}

function UserBubble({ message }: { message: UserChatMessage }) {
  return (
    <article className="ml-auto max-w-[720px] rounded-3xl rounded-tr-md bg-green/20 p-4 text-right shadow-lg ring-1 ring-green/30">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-green">You</p>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-white">{message.content}</p>
    </article>
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

function conversationToPrompt(conversation: ChatMessage[]) {
  return conversation
    .slice(-10)
    .map((message) => {
      if (isUserMessage(message)) return `User: ${message.content}`;
      return `${message.agentName} (${message.role}): ${message.content}`;
    })
    .join("\n\n");
}
