export type SalesPageResult = {
  headline: string;
  subheadline: string;
  problemSection: string;
  storySection: string;
  offerPresentation: string;
  bonuses: string[];
  testimonials: string[];
  guarantee: string;
  faq: string[];
  callsToAction: string[];
  price: string;
};

export type GenerateSalesPageParams = {
  productConcept: string;
  targetAudience: string;
  price: string;
  uniqueMechanism: string;
  country: string;
  language: string;
};

export type TemplateType = "transformacao" | "feminino" | "checkout" | "thankyou";
export type StylePreset = "clean-premium" | "feminine-soft" | "modern-dark";

export type SectionToggle = {
  hero: boolean;
  pain: boolean;
  solution: boolean;
  modules: boolean;
  bonuses: boolean;
  testimonials: boolean;
  guarantee: boolean;
  faq: boolean;
  offer: boolean;
};

export type TemplateSection = {
  id: string;
  title: string;
  content: string;
  style?: Record<string, string>;
};

export type SalesPageTemplate = {
  id: TemplateType;
  name: string;
  description: string;
  style: StylePreset;
  sections: TemplateSection[];
};

export type GeneratedSalesPage = {
  id: string;
  templateType: TemplateType;
  stylePreset: StylePreset;
  sections: {
    hero?: {
      headline: string;
      subheadline: string;
      ctaText: string;
      proofText?: string;
    };
    pain?: {
      title: string;
      painCards: { icon: string; title: string; description: string }[];
    };
    solution?: {
      title: string;
      description: string;
      benefits: string[];
      productImage?: string;
    };
    modules?: {
      title: string;
      chapters: { number: number; title: string; description: string }[];
    };
    bonuses?: {
      title: string;
      items: { icon: string; title: string; description: string; value: string }[];
    };
    testimonials?: {
      title: string;
      items: { quote: string; author: string; role?: string }[];
    };
    guarantee?: {
      title: string;
      description: string;
      days: number;
    };
    faq?: {
      title: string;
      items: { question: string; answer: string }[];
    };
    offer?: {
      price: string;
      originalPrice?: string;
      ctaText: string;
      urgencyText?: string;
    };
    checkout?: {
      title: string;
      productSummary: string;
      price: string;
      ctaText: string;
      trustBadges: string[];
    };
    thankyou?: {
      title: string;
      headline: string;
      nextSteps: string[];
    };
  };
  metadata: {
    productName: string;
    niche: string;
    audience: string;
    language: string;
    createdAt: string;
  };
};

export const TEMPLATE_PRESETS: Record<TemplateType, { name: string; description: string; style: StylePreset }> = {
  transformacao: {
    name: "Transformação / Playbook",
    description: "Premium moderno, foco em transformação e resultados. Ideal para playbooks, cursos de saúde e desenvolvimento pessoal.",
    style: "clean-premium"
  },
  feminino: {
    name: "Feminino Planner",
    description: "Layout delicado e elegante, paletas suaves. Perfeito para planners, produtos digitais femininos e e-books.",
    style: "feminine-soft"
  },
  checkout: {
    name: "Página de Checkout",
    description: "Página de compra focada em conversão, com resumo do produto e elementos de confiança.",
    style: "clean-premium"
  },
  thankyou: {
    name: "Página de Obrigado",
    description: "Página pós-compra para confirmar e engajar o cliente.",
    style: "clean-premium"
  }
};

export const DEFAULT_TOGGLES: SectionToggle = {
  hero: true,
  pain: true,
  solution: true,
  modules: true,
  bonuses: true,
  testimonials: true,
  guarantee: true,
  faq: true,
  offer: true,
};
