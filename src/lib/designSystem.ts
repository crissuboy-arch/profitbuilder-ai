// Design System - Global UI Rules for ProfitBuilder AI
// Dark SaaS style with teal/cyan primary and subtle purple secondary

export const DESIGN_SYSTEM = {
  // Color Palette
  colors: {
    // Primary - Teal/Cyan
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',  // Main primary
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    // Secondary - Subtle Purple
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',  // Main secondary
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    // Neutral - Dark SaaS
    dark: {
      bg: '#0a0a0f',
      card: '#121218',
      cardHover: '#1a1a24',
      border: '#2a2a3a',
      borderHover: '#3a3a4a',
    },
    // Accent colors (avoid excessive pink/red)
    accent: {
      success: '#10b981',  // Green instead of red
      warning: '#f59e0b',  // Amber
      info: '#3b82f6',     // Blue
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    heading: {
      h1: 'text-4xl font-bold tracking-tight',
      h2: 'text-3xl font-semibold tracking-tight',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-medium',
    },
    body: {
      large: 'text-lg',
      base: 'text-base',
      small: 'text-sm',
      xs: 'text-xs',
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  // Border Radius
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    glow: {
      primary: '0 0 20px rgba(20, 184, 166, 0.3)',
      secondary: '0 0 20px rgba(168, 85, 247, 0.3)',
    },
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    secondary: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    dark: 'linear-gradient(180deg, #121218 0%, #0a0a0f 100%)',
    card: 'linear-gradient(145deg, #121218 0%, #0a0a0f 100%)',
  },
  
  // Animation
  animations: {
    fadeIn: 'animation: fadeIn 0.3s ease-out',
    slideUp: 'animation: slideUp 0.3s ease-out',
    pulse: 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
};

// Visual Style Rules by Niche
export const NICHE_VISUAL_STYLES = {
  fitness: {
    description: 'Real photos + high contrast + transformation',
    prompt: 'Professional fitness photography, high contrast, dramatic lighting, clean background, real people with athletic builds, before/after composition, vibrant colors, studio quality',
    composition: ['before_after', 'transformation', 'action_pose', 'motivation'],
  },
  business: {
    description: 'Clean UI mockups + professional + data visualization',
    prompt: 'Clean SaaS UI mockup, professional business setting, data visualization screens, modern office environment, corporate photography, blue and white color scheme, high clarity',
    composition: ['dashboard', 'meeting', 'laptop_mockup', 'team'],
  },
  emotional: {
    description: 'Cinematic lighting + emotional + storytelling',
    prompt: 'Cinematic photography, dramatic lighting, emotional storytelling, warm color palette, shallow depth of field, professional studio, aspirational lifestyle',
    composition: ['lifestyle', 'emotional_moment', 'candid', 'portrait'],
  },
  digital_product: {
    description: 'Mockups + stacking + tech aesthetic',
    prompt: 'Digital product mockup, tech aesthetic, device showcase, stacking composition, clean modern design, blue and cyan accents, professional product photography',
    composition: ['device_stack', 'screen_mockup', 'software_ui', 'digital_assets'],
  },
  health: {
    description: 'Natural + clean + wellness aesthetic',
    prompt: 'Wellness photography, natural lighting, clean aesthetic, health and wellness, soft colors, professional studio, organic feel',
    composition: ['lifestyle', 'product_shot', 'natural_light', 'wellness'],
  },
  education: {
    description: 'Learning environment + engaging + bright',
    prompt: 'Education photography, bright and engaging, learning environment, books and technology, professional lighting, warm colors',
    composition: ['study', 'classroom', 'books', 'learning'],
  },
  finance: {
    description: 'Trust + authority + data-driven',
    prompt: 'Financial photography, professional and trustworthy, data visualization, charts and graphs, blue and green tones, corporate style',
    composition: ['office', 'charts', 'handshake', 'calculator'],
  },
  default: {
    description: 'Modern + clean + professional',
    prompt: 'Modern professional photography, clean background, high quality, natural lighting, contemporary style',
    composition: ['portrait', 'lifestyle', 'product', 'abstract'],
  },
};

// Framework Execution Rules - How each framework generates visuals
export const FRAMEWORK_VISUAL_RULES = {
  stack: {
    type: 'stacked_cards',
    description: 'Transformation steps or benefits stacked vertically',
    prompt_addition: 'Vertical card layout, clean design, numbered steps, modern UI',
  },
  us_vs_them: {
    type: 'comparison_split',
    description: 'Before/after or us vs them comparison',
    prompt_addition: 'Split screen composition, before and after, comparison layout, high contrast',
  },
  native_notes: {
    type: 'sticky_note',
    description: 'Handwritten notebook aesthetic',
    prompt_addition: 'Sticky note, handwritten text visible, notebook background, personal feel',
  },
  notification: {
    type: 'notification_popup',
    description: 'Phone notification mockup',
    prompt_addition: 'Phone screen, notification popup, mobile UI, urgent feel',
  },
  news_advertorial: {
    type: 'news_layout',
    description: 'Journalism-style layout',
    prompt_addition: 'News article layout, editorial style, professional journalism, headline text',
  },
  warning_sign: {
    type: 'warning_banner',
    description: 'Alert/hazard aesthetic',
    prompt_addition: 'Warning sign, alert design, urgent message, bold typography',
  },
  anatomy: {
    type: 'diagram',
    description: 'Exploded component view',
    prompt_addition: 'Technical diagram, exploded view, educational illustration, clean lines',
  },
  price_anchor: {
    type: 'price_tag',
    description: 'Crossed-out original price',
    prompt_addition: 'Price tag, crossed out price, discount visual, retail aesthetic',
  },
  native_feed_post: {
    type: 'social_post',
    description: 'Instagram/Facebook post style',
    prompt_addition: 'Social media post, Instagram feed style, engagement metrics visible',
  },
  checklist_manual: {
    type: 'checklist',
    description: 'Step-by-step checklist',
    prompt_addition: 'Checklist layout, checked items, organized list, productivity feel',
  },
  testimonial_quote: {
    type: 'quote_card',
    description: 'Customer quote in elegant card',
    prompt_addition: 'Quote design, elegant card, customer photo, testimonial layout',
  },
  countdown_timer: {
    type: 'timer_display',
    description: 'Countdown or urgency timer',
    prompt_addition: 'Timer display, countdown visual, urgency design, limited time',
  },
  default: {
    type: 'standard',
    description: 'Standard ad layout',
    prompt_addition: 'Clean professional layout, clear messaging, modern design',
  },
};

// Helper function to get visual style for a niche
export function getVisualStyleForNiche(niche: string): typeof NICHE_VISUAL_STYLES.default {
  const nicheLower = niche.toLowerCase();
  
  if (nicheLower.includes('fitness') || nicheLower.includes('gym') || nicheLower.includes('workout') || nicheLower.includes('transform')) {
    return NICHE_VISUAL_STYLES.fitness;
  }
  if (nicheLower.includes('business') || nicheLower.includes('saas') || nicheLower.includes('entrepreneur') || nicheLower.includes('marketing')) {
    return NICHE_VISUAL_STYLES.business;
  }
  if (nicheLower.includes('love') || nicheLower.includes('relationship') || nicheLower.includes('dating')) {
    return NICHE_VISUAL_STYLES.emotional;
  }
  if (nicheLower.includes('digital') || nicheLower.includes('course') || nicheLower.includes('software') || nicheLower.includes('app')) {
    return NICHE_VISUAL_STYLES.digital_product;
  }
  if (nicheLower.includes('health') || nicheLower.includes('wellness') || nicheLower.includes('diet')) {
    return NICHE_VISUAL_STYLES.health;
  }
  if (nicheLower.includes('learn') || nicheLower.includes('education') || nicheLower.includes('study')) {
    return NICHE_VISUAL_STYLES.education;
  }
  if (nicheLower.includes('finance') || nicheLower.includes('invest') || nicheLower.includes('money')) {
    return NICHE_VISUAL_STYLES.finance;
  }
  
  return NICHE_VISUAL_STYLES.default;
}

// Helper function to get framework visual rule
export function getFrameworkVisualRule(frameworkId: string): typeof FRAMEWORK_VISUAL_RULES.default {
  return FRAMEWORK_VISUAL_RULES[frameworkId as keyof typeof FRAMEWORK_VISUAL_RULES] || FRAMEWORK_VISUAL_RULES.default;
}