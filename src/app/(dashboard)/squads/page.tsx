"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Users, Bot, Copy, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentSummary {
  id: string;
  name: string;
  squad: string;
  icon?: string;
  title?: string;
  whenToUse?: string;
  content: string;
}

interface SquadSummary {
  id: string;
  label: string;
  agentCount: number;
}

interface SquadDetail {
  id: string;
  label: string;
  agents: AgentSummary[];
}

export default function SquadsPage() {
  const [squads, setSquads] = useState<SquadSummary[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<SquadDetail | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentSummary | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/squads")
      .then((r) => r.json())
      .then((data) => {
        setSquads(data);
        setLoading(false);
      });
  }, []);

  async function selectSquad(squadId: string) {
    setSelectedAgent(null);
    setSearch("");
    const res = await fetch(`/api/squads?squad=${squadId}`);
    const data = await res.json();
    setSelectedSquad(data);
  }

  function selectAgent(agent: AgentSummary) {
    setSelectedAgent(agent);
  }

  function copyPrompt() {
    if (!selectedAgent) return;
    navigator.clipboard.writeText(selectedAgent.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filteredAgents = selectedSquad?.agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.title?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-7 w-7 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Squads de Agentes</h1>
        </div>
        <p className="text-slate-400 text-sm ml-10">
          177 agentes especializados organizados em 13 squads
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Squads list */}
        <div className="w-56 border-r border-slate-800 overflow-y-auto py-3 shrink-0">
          {loading ? (
            <div className="px-4 text-slate-500 text-sm mt-4">Carregando...</div>
          ) : (
            squads.map((squad) => (
              <button
                key={squad.id}
                onClick={() => selectSquad(squad.id)}
                className={cn(
                  "w-full text-left px-4 py-3 flex items-center justify-between text-sm transition hover:bg-white/5",
                  selectedSquad?.id === squad.id
                    ? "bg-white/10 text-white"
                    : "text-slate-400"
                )}
              >
                <span className="truncate">{squad.label}</span>
                <span className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-xs text-slate-500">{squad.agentCount}</span>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                </span>
              </button>
            ))
          )}
        </div>

        {/* Agents list */}
        <div className="w-60 border-r border-slate-800 overflow-y-auto shrink-0">
          {selectedSquad ? (
            <>
              <div className="px-3 py-3 border-b border-slate-800">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar agente..."
                    className="w-full bg-slate-800 text-sm text-white placeholder-slate-500 rounded-md pl-8 pr-3 py-2 outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => selectAgent(agent)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex items-start gap-2 text-sm transition hover:bg-white/5",
                      selectedAgent?.id === agent.id
                        ? "bg-white/10 text-white"
                        : "text-slate-400"
                    )}
                  >
                    <span className="text-base leading-none mt-0.5">{agent.icon ?? "🤖"}</span>
                    <span className="min-w-0 flex flex-col">
                      <span className="font-medium truncate">{agent.name}</span>
                      {agent.title && (
                        <span className="text-xs text-slate-500 truncate mt-0.5">{agent.title}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2 p-6">
              <Bot className="h-8 w-8" />
              <p className="text-sm text-center">Selecione um squad para ver os agentes</p>
            </div>
          )}
        </div>

        {/* Agent detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedAgent ? (
            <div className="max-w-3xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedAgent.icon ?? "🤖"}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
                    {selectedAgent.title && (
                      <p className="text-sm text-slate-400 mt-0.5">{selectedAgent.title}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={copyPrompt}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar prompt"}
                </button>
              </div>

              {selectedAgent.whenToUse && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-6">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                    Quando usar
                  </p>
                  <p className="text-sm text-slate-300">{selectedAgent.whenToUse}</p>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Prompt completo
                </p>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedAgent.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-3">
              <Bot className="h-12 w-12" />
              <p className="text-base">Selecione um agente para ver o prompt completo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
