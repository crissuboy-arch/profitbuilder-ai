import { NextRequest, NextResponse } from "next/server";
import { getAllSquads, getSquadById, getAgentById } from "@/lib/agentsData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const squadId = searchParams.get("squad");
  const agentId = searchParams.get("agent");

  if (squadId && agentId) {
    const agent = getAgentById(squadId, agentId);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    return NextResponse.json(agent);
  }

  if (squadId) {
    const squad = getSquadById(squadId);
    if (!squad) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }
    return NextResponse.json(squad);
  }

  const squads = getAllSquads().map((s) => ({
    id: s.id,
    label: s.label,
    agentCount: s.agents.length,
  }));

  return NextResponse.json(squads);
}
