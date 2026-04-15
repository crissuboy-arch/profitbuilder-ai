import fs from "fs";
import path from "path";

export interface Agent {
  id: string;
  name: string;
  squad: string;
  icon?: string;
  title?: string;
  whenToUse?: string;
  content: string;
}

export interface Squad {
  id: string;
  label: string;
  agents: Agent[];
}

const SQUAD_LABELS: Record<string, string> = {
  "advisory-board": "Advisory Board",
  "brand-squad": "Brand Squad",
  "c-level-squad": "C-Level Squad",
  "claude-code-mastery": "Claude Code Mastery",
  "copy-master": "Copy Master",
  "copy-squad": "Copy Squad",
  "cybersecurity": "Cybersecurity",
  "data-squad": "Data Squad",
  "design-squad": "Design Squad",
  "hormozi-squad": "Hormozi Squad",
  "movement": "Movement",
  "storytelling": "Storytelling",
  "traffic-masters": "Traffic Masters",
};

function parseAgentMd(content: string, squadId: string, filename: string): Agent {
  const id = filename.replace(".md", "");

  const nameMatch = content.match(/^#\s+(.+)/m);
  const name = nameMatch ? nameMatch[1].trim() : id;

  const iconMatch = content.match(/icon:\s*["']?([^\n"']+)["']?/);
  const icon = iconMatch ? iconMatch[1].trim() : "🤖";

  const titleMatch = content.match(/title:\s*["']?([^\n"']+)["']?/);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  const whenToUseMatch = content.match(/whenToUse:\s*["']([^"']+)["']/s);
  const whenToUse = whenToUseMatch ? whenToUseMatch[1].trim() : undefined;

  return { id, name, squad: squadId, icon, title, whenToUse, content };
}

export function getAllSquads(): Squad[] {
  const agentsDir = path.join(process.cwd(), "public", "agents");

  if (!fs.existsSync(agentsDir)) return [];

  const squadDirs = fs.readdirSync(agentsDir).filter((dir) => {
    return fs.statSync(path.join(agentsDir, dir)).isDirectory();
  });

  return squadDirs.map((squadId) => {
    const squadPath = path.join(agentsDir, squadId);
    const files = fs.readdirSync(squadPath).filter((f) => f.endsWith(".md"));

    const agents = files.map((file) => {
      const content = fs.readFileSync(path.join(squadPath, file), "utf-8");
      return parseAgentMd(content, squadId, file);
    });

    return {
      id: squadId,
      label: SQUAD_LABELS[squadId] ?? squadId,
      agents,
    };
  });
}

export function getSquadById(squadId: string): Squad | null {
  const squads = getAllSquads();
  return squads.find((s) => s.id === squadId) ?? null;
}

export function getAgentById(squadId: string, agentId: string): Agent | null {
  const squad = getSquadById(squadId);
  return squad?.agents.find((a) => a.id === agentId) ?? null;
}
