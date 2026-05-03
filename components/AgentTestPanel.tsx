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
  const [messages, setMessages] = useState<AgentTeamMessage[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCount = selectedAgents.length;
  const freeLimitWarning = selectedCount > 3 ? "Free testing allows up to 3 agents at once." : "";

  const selectedAgentLabels = useMemo(
    () => selectedAgents.map((agentId) => agentProfiles[agentId].name).join(", "),
    [selectedAgents],
  );

  async function runAgents() {
    setLoading(true);
    setError("");
    setMessages([]);

    try {
      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, selectedAgents, mode }),
      });
      const data = (await response.json()) as AgentRunResponse;

      if (!data.ok) {
        setError(data.error || "The agents could not complete the run.");
        return;
      }

      setMessages(data.messages || []);
    } catch {
      setError("The agent API could not be reached. Check the app server and try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleAgent(agentId: AgentId) {
    setSelectedAgents((current) => {
      if (current.includes(agentId)) {
        return current.filter((id) => id !== agentId);
      }
      return [...current, agentId];
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl">
        <label className="field">
          <span className="field-label">Task for the AI team</span>
          <textarea
            className="field-input min-h-36"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Ask the team to create, critique, research, or finalise a product idea."
          />
        </label>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-300">Agents</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">{selectedCount}/3 free</span>
          </div>
          <div className="mt-3 grid gap-3">
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
          {freeLimitWarning && <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">{freeLimitWarning}</p>}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-300">Mode</h2>
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

        <button className="primary-cta mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={runAgents} disabled={loading}>
          {loading ? "Agents are thinking..." : "Run agent team"}
        </button>
        <p className="mt-3 text-center text-xs font-bold text-slate-500">Selected: {selectedAgentLabels || "No agents selected"}</p>
      </section>

      <section className="min-h-[640px] rounded-[2rem] border border-white/10 bg-[#0d1420] p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Live agent room</p>
            <h2 className="mt-1 text-2xl font-black text-white">Visible collaboration</h2>
          </div>
          <span className="rounded-full bg-green/15 px-3 py-2 text-xs font-black text-green">Ollama backend</span>
        </div>

        {error && (
          <div className="mt-5 rounded-3xl border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
            <strong className="block text-white">{error.includes("Debate Mode") ? "Upgrade needed later" : "Agent run stopped"}</strong>
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-6 grid gap-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-3xl bg-white/[0.06]" />
            ))}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="grid min-h-[460px] place-items-center text-center">
            <div>
              <p className="text-5xl">...</p>
              <h3 className="mt-4 text-2xl font-black text-white">Ready for a real agent run</h3>
              <p className="mt-2 max-w-md text-slate-400">Start Ollama locally, choose up to 3 free agents, and run a task. The team will keep the useful bits visible.</p>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-4">
          {messages.map((message) => (
            <article key={message.id} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-aqua/15 font-black text-aqua">{message.avatarEmoji}</span>
                  <div>
                    <h3 className="font-black text-white">
                      {message.agentName} <span className="text-slate-400">/ {message.role}</span>
                    </h3>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{message.messageType}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">
                  {Math.round(message.confidence * 100)}% confidence
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-100">{message.content}</p>
              <p className="mt-3 text-sm font-bold text-aqua">Next: {message.nextAction}</p>
              <details className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-3">
                <summary className="cursor-pointer text-sm font-black text-slate-300">Assumptions and evidence needed</summary>
                <div className="mt-3 grid gap-3 text-sm text-slate-400 md:grid-cols-2">
                  <ListBlock title="Assumptions" items={message.assumptions} empty="No assumptions listed." />
                  <ListBlock title="Evidence needed" items={message.evidenceNeeded} empty="No evidence requests listed." />
                </div>
              </details>
            </article>
          ))}
        </div>
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
