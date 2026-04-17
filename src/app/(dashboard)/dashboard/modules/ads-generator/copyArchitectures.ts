export type FunnelStage = "top" | "middle" | "bottom";
export type ToneStyle = "aggressive" | "storytelling" | "empathetic" | "authority" | "educational" | "confrontational" | "honest" | "curiosity" | "warning" | "viral" | "professional";

export interface CopyArchitecture {
  id: string;
  name: string;
  description: string;
  funnelStage: FunnelStage;
  toneStyle: ToneStyle;
  structure: string;
  emoji: string;
}

export const copyArchitectures: CopyArchitecture[] = [
  {
    id: "aggressive",
    name: "AGGRESSIVE",
    description: "Direct, bold, no-nonsense approach. Creates urgency and FOMO.",
    funnelStage: "bottom",
    toneStyle: "aggressive",
    structure: `1. SHOCK STATEMENT - Open with a controversial or bold claim
2. CALL OUT - Address the reader directly about their problem
3. PRESSURE - Create urgency with scarcity or time pressure
4. DEMAND ACTION - Force immediate response`,
    emoji: "🔥"
  },
  {
    id: "storytelling",
    name: "STORYTELLING",
    description: "Narrative-driven copy that connects emotionally through stories.",
    funnelStage: "top",
    toneStyle: "storytelling",
    structure: `1. hook - Set the scene with a relatable situation
2. CONFLICT - Introduce the struggle or problem
3. JOURNEY - Show the transformation process
4. RESOLUTION - Reveal the solution and results
5. CTA - Invite reader to start their own journey`,
    emoji: "📖"
  },
  {
    id: "pas",
    name: "PAS",
    description: "Problem, Agitation, Solution. The classic conversion framework.",
    funnelStage: "middle",
    toneStyle: "empathetic",
    structure: `1. PROBLEMA - Identify the pain point clearly
2. AGREMIÇÃO - Amplify the problem, show consequences
3. SOLUÇÃO - Present your product as the answer
4. CTA - Clear next step to solve the problem`,
    emoji: "💡"
  },
  {
    id: "authority",
    name: "AUTHORITY",
    description: "Establish credibility and expertise. Social proof heavy.",
    funnelStage: "top",
    toneStyle: "authority",
    structure: `1. CREDENTIALS - Show expertise and authority
2. PROOF POINTS - Use numbers, stats, testimonials
3. FRAMEWORK - Present your methodology
4. INVITATION - Invite to learn from expert`,
    emoji: "🏆"
  },
  {
    id: "mini_aula",
    name: "MINI AULA",
    description: "Educational content that provides value and builds trust.",
    funnelStage: "top",
    toneStyle: "educational",
    structure: `1. LESSON - Teach something valuable upfront
2. INSIGHT - Share a surprising revelation
3. APPLICATION - Show how to apply the knowledge
4. OFFER - Transition to your paid solution`,
    emoji: "🎓"
  },
  {
    id: "confronto",
    name: "CONFRONTO",
    description: "Direct comparison that challenges status quo.",
    funnelStage: "middle",
    toneStyle: "confrontational",
    structure: `1. CHALLENGE - Question the conventional approach
2. EXPOSE - Show why old methods don't work
3. ALTERNATIVE - Introduce the better way
4. PROOF - Show evidence of superior results`,
    emoji: "⚔️"
  },
  {
    id: "sinceridade",
    name: "SINCERIDADE",
    description: "Honest, transparent approach that builds trust.",
    funnelStage: "middle",
    toneStyle: "honest",
    structure: `1. HONESTY - Admit limitations or tough truths
2. REALITY - Paint realistic expectations
3. VALUE - Focus on genuine benefits
4. TRUST - Build connection through authenticity`,
    emoji: "🤝"
  },
  {
    id: "segredo_aberto",
    name: "SEGREDOS ABERTOS",
    description: "Reveal hidden knowledge that creates value perception.",
    funnelStage: "top",
    toneStyle: "curiosity",
    structure: `1. HOOK - Suggest hidden knowledge
2. REVEAL PART 1 - Share first insight freely
3. HOOK - Imply there's more
4. REVEAL PART 2 - Share another insight
5. OFFER - Unlock the complete secret`,
    emoji: "🔐"
  },
  {
    id: "3_erros",
    name: "3 ERROS",
    description: "Common mistakes framework that creates urgency to avoid.",
    funnelStage: "top",
    toneStyle: "warning",
    structure: `1. PROMISE - Show the right path exists
2. ERROR 1 - First common mistake
3. ERROR 2 - Second common mistake
4. ERROR 3 - Third common mistake
5. SOLUTION - Offer the correct path`,
    emoji: "❌"
  },
  {
    id: "aida_viral",
    name: "AIDA VIRAL",
    description: "Attention, Interest, Desire, Action adapted for viral potential.",
    funnelStage: "top",
    toneStyle: "viral",
    structure: `1. ATTENTION - Hook with shocking statement
2. INTEREST - Build curiosity with details
3. DESIRE - Paint vivid picture of transformation
4. ACTION - Clear, urgent call to action`,
    emoji: "🚀"
  },
  {
    id: "ugc_conexao",
    name: "UGC CONEXÃO",
    description: "User-generated content style for authentic connection.",
    funnelStage: "middle",
    toneStyle: "storytelling",
    structure: `1. PERSONAL MOMENT - Share authentic experience
2. RELATABLE CONTEXT - Set the scene anyone can understand
3. GENUINE RESULT - Show real outcome
4. PERSONAL TAKEAWAY - End with authentic reflection`,
    emoji: "👤"
  },
  {
    id: "profissional",
    name: "PROFISSIONAL",
    description: "Clean, professional B2B-style copy.",
    funnelStage: "middle",
    toneStyle: "professional",
    structure: `1. VALUE PROPOSITION - Clear benefit statement
2. FEATURES - List key capabilities
3. PROOF - Professional credentials or data
4. OFFER - Clear pricing and next steps`,
    emoji: "💼"
  }
];

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  top: "🎯 Topo de Funil",
  middle: "📊 Meio de Funil",
  bottom: "💰 Fundo de Funil"
};

export const TONE_STYLE_LABELS: Record<ToneStyle, string> = {
  aggressive: "🔥 Agressivo",
  storytelling: "📖 Storytelling",
  empathetic: "❤️ Empático",
  authority: "🏆 Autoridade",
  educational: "🎓 Educativo",
  confrontational: "⚔️ Confronto",
  honest: "🤝 Sincero",
  curiosity: "🔮 Curiosidade",
  warning: "⚠️ Alerta",
  viral: "🚀 Viral",
  professional: "💼 Profissional"
};

export function getArchitecturesByStage(stage: FunnelStage): CopyArchitecture[] {
  return copyArchitectures.filter(a => a.funnelStage === stage);
}

export function getArchitectureById(id: string): CopyArchitecture | undefined {
  return copyArchitectures.find(a => a.id === id);
}

export function getRandomArchitectures(count: number): CopyArchitecture[] {
  const shuffled = [...copyArchitectures].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
