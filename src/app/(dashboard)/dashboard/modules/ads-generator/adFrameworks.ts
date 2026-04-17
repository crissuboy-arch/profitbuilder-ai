export type PsychologicalTrigger = 
  | "curiosity" 
  | "urgency" 
  | "social_proof" 
  | "fear" 
  | "scarcity" 
  | "exclusivity"
  | "authority"
  | "contrast"
  | "story"
  | "logic"
  | "empathy"
  | "aspiration";

export type VisualLogic = 
  | "stacked_cards"
  | "before_after"
  | "notification_popup"
  | "printed_material"
  | "annotated_image"
  | "news_layout"
  | "warning_banner"
  | "diagram"
  | "price_tag"
  | "social_post"
  | "checklist"
  | "video_frame"
  | "question_box"
  | "comparison_split"
  | "headline_hero"
  | "poster"
  | "crumpled_paper"
  | "sticky_note"
  | "news_portal"
  | "wanted_poster"
  | "direct_offer"
  | "newspaper"
  | "website_mock"
  | "receipt"
  | "tweet"
  | "steps"
  | "ebook_cover"
  | "handdrawn"
  | "promo_badge"
  | "testimonial_card";

export interface AdFramework {
  id: string;
  name: string;
  description: string;
  psychologicalTrigger: PsychologicalTrigger;
  visualLogic: VisualLogic;
  headlineTemplate: string;
  bodyTemplate: string;
  ctaTemplate: string;
  imagePromptTemplate: string;
  category: "native" | "conversion" | "awareness" | "retargeting";
}

export const adFrameworks: AdFramework[] = [
  {
    id: "stack",
    name: "STACK",
    description: "Multiple stacked cards showing transformation steps or benefits in sequence.",
    psychologicalTrigger: "logic",
    visualLogic: "stacked_cards",
    headlineTemplate: "{transformation} em {tempo}: Descubra como",
    bodyTemplate: "Resultado 1 + Resultado 2 + Resultado 3 = Transformação completa\n\nMódulos:\n[Card 1] [Card 2] [Card 3]",
    ctaTemplate: "Quero Começar Agora →",
    imagePromptTemplate: "Clean minimalist flat design, stacked floating cards showing step-by-step transformation process, soft gradient background in {cor_principal}, professional photography aesthetic, no text, no watermark, high contrast, 16:9 aspect ratio",
    category: "conversion"
  },
  {
    id: "native_notes",
    name: "NATIVE NOTES",
    description: "Handwritten sticky notes or notebook paper aesthetic for authentic feel.",
    psychologicalTrigger: "empathy",
    visualLogic: "sticky_note",
    headlineTemplate: "Anotações de quem já passou por isso:",
    bodyTemplate: "[Nota 1] Insight principal\n[Nota 2] Revelação pessoal\n[Nota 3] Resultado alcançado\n\n written on lined notebook paper, casual authentic feel",
    ctaTemplate: "Baixar Minhas Anotações Grátis",
    imagePromptTemplate: "Messy notebook paper with handwritten sticky notes, coffee stains, pen marks, warm lighting, authentic personal feel, slight shadow, pastel tones, no text, no watermark, 4:5 aspect ratio",
    category: "awareness"
  },
  {
    id: "us_vs_them",
    name: "US VS THEM",
    description: "Split comparison showing your solution vs competitors or status quo.",
    psychologicalTrigger: "contrast",
    visualLogic: "comparison_split",
    headlineTemplate: "Você ainda está fazendo do jeito antigo?",
    bodyTemplate: "❌ ANTES: [Problema comum]\n→ Agora: [Sua solução]\n\n[Metodo] vs [Status quo]\nResultados diferentes em 30 dias",
    ctaTemplate: "Testar o Novo Jeito →",
    imagePromptTemplate: "Split screen comparison design, left side showing old outdated messy approach, right side showing clean modern solution, dramatic contrast, red X on left, green checkmark on right, white background, professional photography, no text, no watermark, 1:1 aspect ratio",
    category: "conversion"
  },
  {
    id: "notification",
    name: "NOTIFICATION",
    description: "Mimics phone notification to grab attention in feed.",
    psychologicalTrigger: "urgency",
    visualLogic: "notification_popup",
    headlineTemplate: "🔔 [Notificação]: {beneficio} foi desbloqueado!",
    bodyTemplate: "Você tem 1 nova mensagem\n\n{produto} acabou de abrir vagas para [{publico}]\n\nAcesso limitado • Vagas restantes: [NUMERO]",
    ctaTemplate: "Verificar Vagas Agora",
    imagePromptTemplate: "Smartphone notification popup interface, dark mode notification center style, glowing notification badge, app icon placeholder, blurry background showing social media feed, modern iOS/Android UI mockup, vibrant accent color, no text, no watermark, 9:16 vertical aspect ratio",
    category: "awareness"
  },
  {
    id: "annotated_print",
    name: "ANNOTATED PRINT",
    description: "Printed material with handwritten annotations highlighting key points.",
    psychologicalTrigger: "authority",
    visualLogic: "annotated_image",
    headlineTemplate: "圈tees que separam quem lucra de quem só trabalha:",
    bodyTemplate: "圈tees marcado à mão:\n\n[ ] Não saber precificar\n[ ] Vender sem estratégia\n[ ] Ignorar métricas\n\nO que você está deixando passar?",
    ctaTemplate: "Descobrir Meu Nível Agora",
    imagePromptTemplate: "Printed document or book page with colorful handwritten annotations, circled highlights in red and yellow marker, arrows pointing to key text, coffee ring stain, casual desk setting, warm natural lighting, no text visible, no watermark, 4:5 aspect ratio",
    category: "awareness"
  },
  {
    id: "news_advertorial",
    name: "NEWS ADVERTORIAL",
    description: "News article style layout that feels like journalism.",
    psychologicalTrigger: "authority",
    visualLogic: "news_layout",
    headlineTemplate: "EXCLUSIVO: Como [{publico}] começou a {resultado} em 30 dias",
    bodyTemplate: "[Cidade], [Data] — Uma nova abordagem está revolucionando como [{publico}] consegue {beneficio}.\n\nEspecialistas apontam que o método combina elementos nunca antes vistos no mercado.\n\n'Nunca vi resultados assim', afirma [depoimento_curto].",
    ctaTemplate: "Ler Reportagem Completa",
    imagePromptTemplate: "Professional news article layout mockup, newspaper magazine style, serif typography placeholder, journalist photography aesthetic, neutral lighting, slight paper texture, editorial design, no text, no watermark, 16:9 aspect ratio",
    category: "awareness"
  },
  {
    id: "warning_sign",
    name: "WARNING SIGN",
    description: "Warning/alert visual style to highlight urgency or danger.",
    psychologicalTrigger: "fear",
    visualLogic: "warning_banner",
    headlineTemplate: "⚠️ ATENÇÃO [{publico}]: Você pode estar perdendo R${valor} por mês",
    bodyTemplate: "Sintomas detectados:\n\n🚩 [Sintoma 1]\n🚩 [Sintoma 2]\n🚩 [Sintoma 3]\n\nVocê se identifica com algum?",
    ctaTemplate: "Diagnosticar Minha Situação Grátis",
    imagePromptTemplate: "Bold warning sign or hazard tape aesthetic, triangular warning symbol, high contrast yellow and black design, urgent dramatic feel, industrial style, modern vector graphics, no text, no watermark, 1:1 aspect ratio",
    category: "conversion"
  },
  {
    id: "anatomy",
    name: "ANATOMY",
    description: "Exploded view or diagram showing components of the solution.",
    psychologicalTrigger: "logic",
    visualLogic: "diagram",
    headlineTemplate: "A Anatomia do Sucesso: O que você precisa dominar",
    bodyTemplate: "Componente 1: [Habilidade central]\nComponente 2: [Estratégia]\nComponente 3: [Ferramenta]\nComponente 4: [Mentalidade]\n\nTodos conectados = Resultado garantido",
    ctaTemplate: "Ver Componentes Completos",
    imagePromptTemplate: "Clean infographic or exploded diagram showing interconnected components, circular hub and spoke design, modern flat illustration style, gradient colors from blue to purple, professional business aesthetic, white background, no text, no watermark, 16:9 aspect ratio",
    category: "awareness"
  },
  {
    id: "price_anchor",
    name: "PRICE ANCHOR",
    description: "Shows original high price crossed out with new lower price.",
    psychologicalTrigger: "scarcity",
    visualLogic: "price_tag",
    headlineTemplate: "De R${preco_alto} por apenas R${preco_baixo}: Oferta por tempo limitado",
    bodyTemplate: "💰ECONOMIA DE {porcentagem}%\n\nValor normal: R${preco_alto}\nValor promocional: R${preco_baixo}\n\n⏰ Oferta expira em [contador]",
    ctaTemplate: "Garantir Preço Promocional",
    imagePromptTemplate: "Price tag or sale sticker design, red crossed out original price, green highlighted new price, circular discount badge, retail store aesthetic, clean white background, professional product photography style, no text, no watermark, 1:1 aspect ratio",
    category: "conversion"
  },
  {
    id: "native_feed_post",
    name: "NATIVE FEED POST",
    description: "Looks like a regular social media post for organic feel.",
    psychologicalTrigger: "social_proof",
    visualLogic: "social_post",
    headlineTemplate: "Compartilhando minha experiência com {produto}:",
    bodyTemplate: "3 meses usando [{metodo}] e aqui vai o resultado:\n\n✅ [Resultado 1]\n✅ [Resultado 2]\n✅ [Resultado 3]\n\nNão é perfeito, mas funciona. [depoimento_pessoal]",
    ctaTemplate: "Conhecer o Método",
    imagePromptTemplate: "Screenshot of a social media feed post, Instagram or Facebook style, profile photo placeholder, engagement icons (likes, comments), slightly blurred realistic interface, casual personal photo aesthetic, no text, no watermark, 4:5 aspect ratio",
    category: "awareness"
  },
  {
    id: "checklist_manual",
    name: "CHECKLIST MANUAL",
    description: "Step-by-step checklist format showing process.",
    psychologicalTrigger: "logic",
    visualLogic: "checklist",
    headlineTemplate: "O Checklist Definitivo para {resultado}:",
    bodyTemplate: "☐ Passo 1: [Ação inicial]\n☐ Passo 2: [Ação seguinte]\n☐ Passo 3: [Ação avançada]\n☐ Passo 4: [Resultado final]\n\nBaixe o checklist completo no link.",
    ctaTemplate: "Baixar Checklist Completo",
    imagePromptTemplate: "Clipboard with printed checklist, checkboxes marked with red pen, clean printed text, slight paper curl, desk background with pen, warm office lighting, professional document aesthetic, no text, no watermark, 4:5 aspect ratio",
    category: "awareness"
  },
  {
    id: "micro_aula",
    name: "MICRO AULA",
    description: "Mini lesson or tip that provides immediate value.",
    psychologicalTrigger: "logic",
    visualLogic: "video_frame",
    headlineTemplate: "🎓 Aula Gratuita: {topico} em 3 minutos",
    bodyTemplate: "Hoje vou te ensinar:\n\n[Ponto 1] - Breve explicação\n[Ponto 2] - Breve explicação  \n[Ponto 3] - Breve explicação\n\nQuer dominar isso? Assista a aula completa.",
    ctaTemplate: "Assistir Aula Completa",
    imagePromptTemplate: "Video thumbnail with play button overlay, online course platform interface, teacher or presenter silhouette placeholder, presentation slides background, modern e-learning aesthetic, blue and white color scheme, no text, no watermark, 16:9 aspect ratio",
    category: "awareness"
  },
  {
    id: "dor_solucao",
    name: "DOR + SOLUÇÃO",
    description: "Pain point followed by solution presentation.",
    psychologicalTrigger: "empathy",
    visualLogic: "before_after",
    headlineTemplate: "Sente isso? → Existe uma saída:",
    bodyTemplate: "😰 DOR: [Problema emocional que o público sente]\n\n[Contexto do problema]\n\n✨ SOLUÇÃO: {produto} chegou para transformar isso.\n\n[Benefício central]",
    ctaTemplate: "Transformar Minha Realidade",
    imagePromptTemplate: "Split composition showing emotional contrast, left side dark stormy representing pain/problem, right side bright warm light representing solution, person silhouette in the middle transitioning, dramatic lighting, cinematic feel, no text, no watermark, 16:9 aspect ratio",
    category: "conversion"
  },
  {
    id: "prova_explicada",
    name: "PROVA EXPLICADA",
    description: "Screenshot or data visualization with explanation.",
    psychologicalTrigger: "social_proof",
    visualLogic: "diagram",
    headlineTemplate: "Fiz isso e olha o resultado:",
    bodyTemplate: "[Print/Dados mostrando resultado]\n\nO que eu fiz:\n1. [Ação 1]\n2. [Ação 2]\n3. [Ação 3]\n\nVocê pode fazer o mesmo com [{metodo}].",
    ctaTemplate: "Ver Como Eu Fiz",
    imagePromptTemplate: "Dashboard or analytics screenshot mockup, clean graphs and charts, impressive metrics highlighted, modern UI design, dark mode interface, professional data visualization, laptop screen mockup, no text, no watermark, 16:9 aspect ratio",
    category: "retargeting"
  },
  {
    id: "antes_depois_cog",
    name: "ANTES/DEPOIS COG",
    description: "Classic transformation visual with cognitive emphasis.",
    psychologicalTrigger: "contrast",
    visualLogic: "before_after",
    headlineTemplate: "Cognitive Shift: O antes e depois mental",
    bodyTemplate: "🧠 ANTES:\n[Mentalidade limitante 1]\n[Mentalidade limitante 2]\n\n🧠 DEPOIS:\n[Mentalidade liberada 1]\n[Mentalidade liberada 2]",
    ctaTemplate: "ativar Essa Transformação",
    imagePromptTemplate: "Dramatic before and after split, brain or mind imagery, left side showing confused stressed state, right side showing calm confident state, vibrant color contrast, psychological transformation visual, professional graphic design, no text, no watermark, 1:1 aspect ratio",
    category: "conversion"
  },
  {
    id: "jeito_antigo_novo",
    name: "JEITO ANTIGO/NOVO",
    description: "Traditional vs modern approach comparison.",
    psychologicalTrigger: "contrast",
    visualLogic: "comparison_split",
    headlineTemplate: "Parando de fazer isso: O método que mudou tudo",
    bodyTemplate: "❌ ANTES: [Abordagem tradicional/ineficiente]\n\n✅ AGORA: [Abordagem moderna/eficiente]\n\nPor que demorei tanto para mudar?",
    ctaTemplate: "Aplicar Esse Método Agora",
    imagePromptTemplate: "Timeline or journey comparison, vintage sepia style on left transitioning to modern vibrant style on right, old typewriter and papers vs modern laptop and coffee, evolution concept, warm to cool color transition, no text, no watermark, 16:9 aspect ratio",
    category: "awareness"
  },
  {
    id: "checklist_irresistivel",
    name: "CHECKLIST IRRESISTÍVEL",
    description: "Irresistible checklist that creates FOMO.",
    psychologicalTrigger: "scarcity",
    visualLogic: "checklist",
    headlineTemplate: "Você já faz esses {numero} things?",
    bodyTemplate: "☐ [Item 1] — A maioria não faz\n☐ [Item 2] — Especialistas indicam\n☐ [Item 3] — Multiplica resultados\n☐ [Item 4] — Poucos conhecem\n☐ [Item 5] — Mudança imediata",
    ctaTemplate: "Descobrir Se Estou no Caminho Certo",
    imagePromptTemplate: "Elegant checklist design, gold checkmarks on dark background, luxury feel, minimal typography space, premium product aesthetic, dark charcoal background with gold accents, no text, no watermark, 4:5 aspect ratio",
    category: "awareness"
  },
  {
    id: "comparativo_metodo",
    name: "COMPARATIVO MÉTODO",
    description: "Method comparison chart or table.",
    psychologicalTrigger: "logic",
    visualLogic: "comparison_split",
    headlineTemplate: "Escolha seu método:",
    bodyTemplate: "                  | Método A | Método B | {Seu Método}\nVelocidade        | Lento   | Médio   | Rápido\nFacilidade       | Difícil | Médio   | Fácil\nResultado         | Baixo   | Médio   | Alto\n\nSpoiler: a terceira coluna sempre vence.",
    ctaTemplate: "Conhecer o Método Vencedor",
    imagePromptTemplate: "Clean comparison table or matrix graphic, three columns with checkmarks and crosses, modern infographic style, blue and green color scheme, professional business presentation aesthetic, white background, no text, no watermark, 16:9 aspect ratio",
    category: "conversion"
  },
  {
    id: "revelacao",
    name: "REVELAÇÃO",
    description: "Dramatic reveal moment to create curiosity.",
    psychologicalTrigger: "curiosity",
    visualLogic: "stacked_cards",
    headlineTemplate: "O que ninguém te conta sobre {topico}...",
    bodyTemplate: "[Silêncio/Reveals dramatic image]\n\nA verdade é que:\n\n[Revelação 1]\n[Revelação 2]\n[Revelação 3]\n\nSpoiler: É mais simples do que você pensa.",
    ctaTemplate: "Ver a Verdade Completa",
    imagePromptTemplate: "Dramatic curtain pull or spotlight reveal moment, mystery silhouette waiting to be revealed, theatrical lighting with dramatic shadows, anticipation atmosphere, dark background with bright spotlight, professional photography, no text, no watermark, 1:1 aspect ratio",
    category: "awareness"
  },
  {
    id: "caixinha_pergunta",
    name: "CAIXINHA PERGUNTA",
    description: "Question box format that engages through inquiry.",
    psychologicalTrigger: "curiosity",
    visualLogic: "question_box",
    headlineTemplate: "Você sabia que...❓",
    bodyTemplate: "❓ [Pergunta surpreendente]\n\nA resposta pode mudar como você vê {topico}.\n\n[Contexto adicional]\n\n👉 Responde aqui nos comentários!",
    ctaTemplate: "Ver Resposta Certa",
    imagePromptTemplate: "Cute question mark box or speech bubble design, playful pastel colors, engaging social media post style, question icon or lightbulb, friendly approachable aesthetic, modern flat illustration, no text, no watermark, 1:1 aspect ratio",
    category: "awareness"
  },
  {
    id: "oferta_beneficios",
    name: "OFERTA + BENEFÍCIOS",
    description: "Direct offer with list of benefits.",
    psychologicalTrigger: "exclusivity",
    visualLogic: "price_tag",
    headlineTemplate: "Oferta Especial: {produto} + {bonus} de bônus",
    bodyTemplate: "✨ O que você recebe:\n\n🎁 [Benefício 1]\n🎁 [Benefício 2]\n🎁 [Benefício 3]\n🎁 [Bônus especial]\n\nPor apenas R${preco} ou {condicao}",
    ctaTemplate: "Aproveitar Oferta Agora",
    imagePromptTemplate: "Gift box or present with ribbon opening, premium products inside glowing, celebratory confetti, warm lighting, luxury gift aesthetic, gold and white color scheme, professional product photography style, no text, no watermark, 1:1 aspect ratio",
    category: "conversion"
  },
  {
    id: "problema_vs_solucao",
    name: "PROBLEMA VS SOLUÇÃO",
    description: "Direct problem to solution flow.",
    psychologicalTrigger: "empathy",
    visualLogic: "comparison_split",
    headlineTemplate: "Você se sente assim? → E se existisse uma saída?",
    bodyTemplate: "😔 [Expressão do problema profundo]\n\n[Descrição da frustração do público]\n\n💡 {produto}: A solução que você procurava.\n\n[Breve explicação da solução]",
    ctaTemplate: "Descobrir a Saída",
    imagePromptTemplate: "Flowing arrow from dark stormy clouds to bright sunrise, problem on left transitioning to solution on right, journey concept, emotional contrast, professional landscape photography composition, no text, no watermark, 16:9 aspect ratio",
    category: "conversion"
  },
  {
    id: "super_headline",
    name: "SUPER HEADLINE",
    description: "Massive attention-grabbing headline with minimal text.",
    psychologicalTrigger: "urgency",
    visualLogic: "headline_hero",
    headlineTemplate: "{RESULTADO_EM_MAIÚSCULAS}",
    bodyTemplate: "[Subtítulo que expande a promessa]\n\n{produto} — O método comprovado que já ajudou [{numero}] pessoas a conseguir {beneficio}.",
    ctaTemplate: "Quero Esse Resultado →",
    imagePromptTemplate: "Massive bold typography on full screen background, dramatic gradient from deep purple to hot pink, minimalist design with maximum impact, hero image composition, professional cinematic style, no text in image area, no watermark, 9:16 vertical aspect ratio",
    category: "conversion"
  },
  {
    id: "cartaz_poste",
    name: "CARTAZ POSTE",
    description: "Street poster/pole sign aesthetic for local appeal.",
    psychologicalTrigger: "urgency",
    visualLogic: "poster",
    headlineTemplate: "AFIXADO EM [data]: {aviso_urgente}",
    bodyTemplate: "⚠️ AVISO IMPORTANTE\n\n{Informação crítica que cria urgência}\n\nAberto ao público: [condição]\nVagas limitadas: [número]\n\nNão perca esta oportunidade!",
    ctaTemplate: "Reservar Minha Vaga",
    imagePromptTemplate: "Street pole poster or bulletin board notice, weathered paper texture, pushpin or tape marks, mixed with other flyers background, urban street style, warm yellow and red colors, casual authentic feel, no text, no watermark, 4:5 aspect ratio",
    category: "awareness"
  },
  {
    id: "cartaz_amassado",
    name: "CARTAZ AMASSADO",
    description: "Crumpled paper poster with desperate/viral feel.",
    psychologicalTrigger: "urgency",
    visualLogic: "crumpled_paper",
    headlineTemplate: "FUI DESCARTADO... mas ainda tenho valor!",
    bodyTemplate: "Este papel foi amassado, pisado...\n\nMas a informação aqui dentro é DEMAIS para ignorar:\n\n[Ideia principal]\n[Ideia secundária]\n[Ideia bônus]",
    ctaTemplate: "Recuperar Meu Acesso Agora",
    imagePromptTemplate: "Crumpled ball of paper being unfolded, desperate handwritten urgent note, harsh lighting showing wrinkles and creases, dramatic shadow, emotional rescue feel, warm paper tones, authentic urgent aesthetic, no text, no watermark, 4:5 aspect ratio",
    category: "conversion"
  },
  {
    id: "post_it",
    name: "POST-IT",
    description: "Colorful sticky notes with quick tips.",
    psychologicalTrigger: "empathy",
    visualLogic: "sticky_note",
    headlineTemplate: "Notas adesivas na minha tela enquanto trabalho:",
    bodyTemplate: "🟡 [Dica 1] - Lembrete importante\n🟢 [Dica 2] - Segredo descubierto\n🔴 [Dica 3] - Erro a evitar\n🟣 [Dica 4] - Hack produtivo\n\nSalva para depois! ⬇️",
    ctaTemplate: "Ver Mais Notas Como Esta",
    imagePromptTemplate: "Colorful sticky notes scattered on laptop screen or monitor, yellow pink green blue notes, casual desk workspace background, warm natural lighting, productive workspace aesthetic, no text, no watermark, 4:5 aspect ratio",
    category: "awareness"
  },
  {
    id: "portal_noticia",
    name: "PORTAL NOTÍCIA",
    description: "News website portal look and feel.",
    psychologicalTrigger: "authority",
    visualLogic: "news_portal",
    headlineTemplate: "PORTAL [Nome]: {tema} é destaque nacional",
    bodyTemplate: "[Data] | [Categoria] | [Autor]\n\nMANCHETE: [Título chamativo]\n\n{subtítulo expandido}\n\n[Trecho da matéria]\n\n📰 Leia mais em: [link]",
    ctaTemplate: "Acessar Matéria Completa",
    imagePromptTemplate: "News website or portal interface mockup, professional media outlet style, article card layout, navigation bar, clean responsive web design, blue and white color scheme, professional web aesthetic, no text, no watermark, 16:9 aspect ratio",
    category: "awareness"
  },
  {
    id: "procura_se",
    name: "PROCURA-SE",
    description: "Wanted poster style for lighthearted urgency.",
    psychologicalTrigger: "scarcity",
    visualLogic: "wanted_poster",
    headlineTemplate: "PROCURA-SE: {produto} — Morto ou Vivo",
    bodyTemplate: "RECOMPENSA: {beneficio}\n\nVisto por último em: [local/vitrine]\nÚltima vez visto: [situação]\n\nSe encontrado, não soltar sob nenhuma hipótese.\n\n🕵️ Contato: [CTA]",
    ctaTemplate: "Capturar Este Produto",
    imagePromptTemplate: "Wanted poster or missing person flyer style, vintage western or detective aesthetic, textured aged paper background, bold typography, red wanted stamp, humorous yet professional, no text, no watermark, 1:1 aspect ratio",
    category: "awareness"
  },
  {
    id: "oferta_direta",
    name: "OFERTA DIRETA",
    description: "Clean direct offer with clear CTA.",
    psychologicalTrigger: "exclusivity",
    visualLogic: "direct_offer",
    headlineTemplate: "👉 Oferta Direta: {produto} por R${preco}",
    bodyTemplate: "Você recebe:\n• [Benefício 1]\n• [Benefício 2]\n• [Benefício 3]\n• Bônus: [Bônus especial]\n\nValor: R${preco_alto} → R${preco_atual}\nEconomia: {porcentagem}%",
    ctaTemplate: "Quero Garantir Agora",
    imagePromptTemplate: "Clean professional sales page hero section mockup, product image placeholder, bold CTA button, gradient background in brand colors, modern landing page aesthetic, conversion focused design, no text, no watermark, 16:9 aspect ratio",
    category: "conversion"
  },
  {
    id: "manchete_jornal",
    name: "MANCHETE JORNAL",
    description: "Newspaper headline style for authority.",
    psychologicalTrigger: "authority",
    visualLogic: "newspaper",
    headlineTemplate: "JORNAL [Nome] | {data} | EXCLUSIVO",
    bodyTemplate: "MANCHETE:\n{Título impactante em caixa alta}\n\n{subtítulo}\n\n{Parágrafo de abertura}\n\n[Continua na página X]\n\nPor: [Nome do redator]",
    ctaTemplate: "Ler Matéria Completa",
    imagePromptTemplate: "Vintage newspaper front page layout, classic typography and masthead, newsprint texture, black and white photography style, editorial design aesthetic, traditional newspaper feel, no text, no watermark, 16:9 aspect ratio",
    category: "awareness"
  },
  {
    id: "site_noticia",
    name: "SITE NOTÍCIA",
    description: "Modern news website design.",
    psychologicalTrigger: "authority",
    visualLogic: "website_mock",
    headlineTemplate: "{Site} | {tema} bomba na internet",
    bodyTemplate: "{Data} às {hora}\n\n[MANCHETE PRINCIPAL]\n\n{subtítulo}\n\n[Corpo da notícia]\n\n📱 Compartilhe esta história\n💬 Comente abaixo",
    ctaTemplate: "Ler Reportagem Completa",
    imagePromptTemplate: "Modern news website homepage or article page, responsive mobile design, social sharing buttons, professional media layout, current sleek web design trends, blue and white palette, no text, no watermark, 9:16 vertical aspect ratio",
    category: "awareness"
  },
  {
    id: "oferta_direta_hard",
    name: "OFERTA DIRETA HARD",
    description: "Aggressive direct offer with heavy CTA.",
    psychologicalTrigger: "urgency",
    visualLogic: "direct_offer",
    headlineTemplate: "PARE TUDO! Você pode perder essa oferta AGORA",
    bodyTemplate: "⚠️ ÚLTIMA CHAMADA ⚠️\n\n{produto}\n\nNão deixe para depois.\nNão espere mais.\nComece HOJE.\n\n🚨 Preço sobe em: [contador]\n\nCLIQUE AGORA!",
    ctaTemplate: "SIM! Quero Garantir Agora!",
    imagePromptTemplate: "Explosive urgent sales design, red and black color scheme, lightning bolts, countdown timer graphic, aggressive marketing aesthetic, high contrast dramatic lighting, action oriented composition, no text, no watermark, 16:9 aspect ratio",
    category: "conversion"
  },
  {
    id: "cupom_fiscal",
    name: "CUPOM FISCAL",
    description: "Receipt style for price anchoring.",
    psychologicalTrigger: "scarcity",
    visualLogic: "receipt",
    headlineTemplate: "COMPROVANTE: Sua economia está aqui!",
    bodyTemplate: "━━━━━━━━━━━━━━━━\nPRODUTO: {produto}\n━━━━━━━━━━━━━━━━\nVALOR TOTAL:  R$ {preco_alto}\nDESCONTO:    - R$ {desconto}\n━━━━━━━━━━━━━━━━\nTOTAL A PAGAR: R$ {preco_final}\n━━━━━━━━━━━━━━━━\nEconomia de {porcentagem}%!\n\nVálido até: [data]",
    ctaTemplate: "Emitir Meu Cupom Agora",
    imagePromptTemplate: "Thermal receipt or cash register receipt mockup, paper tape style, detailed itemized list, red discount highlights, realistic paper texture and curl, point of sale aesthetic, no text, no watermark, 4:5 aspect ratio",
    category: "conversion"
  },
  {
    id: "post_twitter",
    name: "POST TWITTER",
    description: "Tweet/X style post format.",
    psychologicalTrigger: "social_proof",
    visualLogic: "tweet",
    headlineTemplate: "[Nome] no X (Twitter):",
    bodyTemplate: "Hot take 🧵:\n\n[{Opinião controversa ou insight}]\n\n[{Expansão}]\n\n[{Conclusão}]\n\n{numero} pessoas concordam\n{numero} repost\n{numero} favoritos\n\n⤵️ Ler replies",
    ctaTemplate: "Ver Thread Completo",
    imagePromptTemplate: "Twitter or X social media post screenshot, verification badge placeholder, engagement metrics visible, profile picture and username mockup, dark mode interface, viral tweet aesthetic, no text, no watermark, 16:9 aspect ratio",
    category: "awareness"
  },
  {
    id: "passo_a_passo",
    name: "PASSO A PASSO",
    description: "Numbered steps showing process.",
    psychologicalTrigger: "logic",
    visualLogic: "steps",
    headlineTemplate: "O {numero} passos para {resultado}:",
    bodyTemplate: "1️⃣ [Primeiro passo]\n\n2️⃣ [Segundo passo]\n\n3️⃣ [Terceiro passo]\n\n4️⃣ [Quarto passo]\n\n→ Resultado: {beneficio}",
    ctaTemplate: "Ver Caminho Completo",
    imagePromptTemplate: "Numbered steps or process flow infographic, arrows or connecting lines between steps, icons for each step, clean modern design, gradient progress bar, professional illustration style, no text, no watermark, 9:16 vertical aspect ratio",
    category: "awareness"
  },
  {
    id: "pov_ebook",
    name: "POV EBOOK",
    description: "Ebook cover style for content marketing.",
    psychologicalTrigger: "aspiration",
    visualLogic: "ebook_cover",
    headlineTemplate: "POV: Você terminou de ler {nome_ebook}",
    bodyTemplate: "📖 {Nome do Ebook}\nSubtítulo: {promessa}\n\nO que você aprendeu:\n• [Insight 1]\n• [Insight 2]\n• [Insight 3]\n\nQuerdominar esse assunto?",
    ctaTemplate: "Baixar Ebook Agora",
    imagePromptTemplate: "Professional ebook or digital book cover mockup, clean modern design, gradient background, title and subtitle typography space, professional publishing aesthetic, premium digital product look, no text, no watermark, 3:4 portrait aspect ratio",
    category: "awareness"
  },
  {
    id: "traco_lapis",
    name: "TRAÇO A LÁPIS",
    description: "Hand-drawn sketch style for authentic connection.",
    psychologicalTrigger: "empathy",
    visualLogic: "handdrawn",
    headlineTemplate: "Desenhado à mão enquanto pensava em você:",
    bodyTemplate: "[Esboço rabiscado mostrando conceito]\n\nSim, eu sei como você se sente.\n\n[Desenho de expressão emocional]\n\nPor isso criei [produto] —\npara você não passar pelo que eu passei.",
    ctaTemplate: "Conectar Comigo",
    imagePromptTemplate: "Handdrawn pencil sketch on paper, rough pencil strokes, casual doodle aesthetic, warm paper background, personal intimate feel, coffee stain or smudge marks, authentic artist sketchbook style, no text, no watermark, 4:5 aspect ratio",
    category: "awareness"
  },
  {
    id: "ebook_promo",
    name: "EBOOK PROMO",
    description: "Promotional ebook with deal.",
    psychologicalTrigger: "scarcity",
    visualLogic: "ebook_cover",
    headlineTemplate: "📚 Ebook GRÁTIS: {tema} — Vagas limitadas",
    bodyTemplate: "O que você vai encontrar:\n\n✓ [Capítulo 1] — [Resumo]\n✓ [Capítulo 2] — [Resumo]\n✓ [Capítulo 3] — [Resumo]\n✓ [Bônus] — [Resumo do bônus]\n\nNormal: R${preco}\nHoje: GRÁTIS (para os primeiros [número])",
    ctaTemplate: "Garantir Meu Ebook Grátis",
    imagePromptTemplate: "Ebook on promotional display with FREE or GRÁTIS stamp, gift bow or sparkles, attractive book cover design, warm lighting, promotional retail aesthetic, no text, no watermark, 3:4 portrait aspect ratio",
    category: "conversion"
  },
  {
    id: "ebook_depoimento",
    name: "EBOOK DEPOIMENTO",
    description: "Ebook format featuring testimonials.",
    psychologicalTrigger: "social_proof",
    visualLogic: "testimonial_card",
    headlineTemplate: "O que nossos leitores dizem:",
    bodyTemplate: "📖 {Nome do Ebook}\n\n💬 Depoimento 1:\n\"{depoimento_1}\"\n— [Nome], [Resultado]\n\n💬 Depoimento 2:\n\"{depoimento_2}\"\n— [Nome], [Resultado]",
    ctaTemplate: "Quero Esse Ebook",
    imagePromptTemplate: "Open ebook with testimonial quotes floating beside it, warm cozy reading atmosphere, glasses and coffee, soft lighting, social proof highlighting, professional yet approachable, no text, no watermark, 4:5 aspect ratio",
    category: "retargeting"
  }
];

export const FRAMEWORK_CATEGORIES = {
  native: "🧩 Orgânico",
  conversion: "🎯 Conversão",
  awareness: "📢 Consciência",
  retargeting: "🔄 Retargeting"
} as const;

export const PSYCHOLOGICAL_TRIGGER_LABELS: Record<PsychologicalTrigger, string> = {
  curiosity: "🔮 Curiosidade",
  urgency: "⏰ Urgência",
  social_proof: "👥 Prova Social",
  fear: "😰 Medo",
  scarcity: "💎 Escassez",
  exclusivity: "✨ Exclusividade",
  authority: "📋 Autoridade",
  contrast: "⚡ Contraste",
  story: "📖 História",
  logic: "🧠 Lógica",
  empathy: "❤️ Empatia",
  aspiration: "🚀 Aspiração"
};

export function getRandomFrameworks(count: number, preferredCategory?: string): AdFramework[] {
  const shuffled = [...adFrameworks].sort(() => Math.random() - 0.5);
  if (preferredCategory) {
    const categoryFrameworks = shuffled.filter(f => f.category === preferredCategory);
    if (categoryFrameworks.length >= count) {
      return categoryFrameworks.slice(0, count);
    }
    const remaining = count - categoryFrameworks.length;
    const otherFrameworks = shuffled.filter(f => f.category !== preferredCategory);
    return [...categoryFrameworks, ...otherFrameworks.slice(0, remaining)];
  }
  return shuffled.slice(0, count);
}

export function getFrameworksByIds(ids: string[]): AdFramework[] {
  return adFrameworks.filter(f => ids.includes(f.id));
}
