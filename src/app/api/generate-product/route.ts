import { NextResponse } from "next/server";

type ResultadoMineracao = {
  nicho: string;
  publico: string;
  dor: string;
  produto: string;
  promessa: string;
  headline: string;
  bonus: string[];
  preco: string;
};

function analisarTexto(texto: string): ResultadoMineracao {
  const textoBaixo = texto.toLowerCase();

  let nicho = "negócios digitais";
  let publico = "iniciantes";
  let dor = "começar do zero sem saber o que vender";
  let produto = "Guia de Produto Digital Lucrativo";
  let promessa = "Aprenda a tirar sua ideia do papel e transformar em um produto digital mais fácil de vender";
  let headline = "Descubra como criar um produto digital enxuto, desejado e pronto para vender sem travar no processo";
  let bonus = [
    "Checklist de validação rápida",
    "Modelo de oferta irresistível",
    "Estrutura simples de página de vendas"
  ];
  let preco = "€27";

  if (
    textoBaixo.includes("emagrecer") ||
    textoBaixo.includes("perder peso") ||
    textoBaixo.includes("seca barriga") ||
    textoBaixo.includes("low carb") ||
    textoBaixo.includes("receitas fit")
  ) {
    nicho = "emagrecimento";
    publico = "mulheres que querem emagrecer";
    dor = "perder peso de forma simples sem sofrer";
    produto = "Ebook Receitas para Emagrecer Sem Sofrer";
    promessa = "Aprenda uma forma prática de emagrecer com receitas simples e rotina possível de seguir";
    headline = "Perca peso com mais leveza usando receitas simples que cabem na sua rotina";
    bonus = [
      "Cardápio de 7 dias",
      "Lista de compras pronta",
      "Guia de substituições inteligentes"
    ];
    preco = "€27";
  }

  if (
    textoBaixo.includes("ganhar dinheiro") ||
    textoBaixo.includes("renda extra") ||
    textoBaixo.includes("vender online") ||
    textoBaixo.includes("afiliado") ||
    textoBaixo.includes("produto digital")
  ) {
    nicho = "renda extra";
    publico = "pessoas que querem vender online";
    dor = "ganhar dinheiro sem depender de emprego fixo";
    produto = "Guia Renda Extra com Produtos Digitais";
    promessa = "Descubra como começar a vender online com um modelo mais simples e acessível para iniciantes";
    headline = "Aprenda um caminho mais prático para ganhar dinheiro online mesmo começando do zero";
    bonus = [
      "Lista de nichos lucrativos",
      "Modelo de anúncio inicial",
      "Checklist para lançar mais rápido"
    ];
    preco = "€37";
  }

  if (
    textoBaixo.includes("beleza") ||
    textoBaixo.includes("cabelo") ||
    textoBaixo.includes("pele") ||
    textoBaixo.includes("maquiagem") ||
    textoBaixo.includes("skincare")
  ) {
    nicho = "beleza";
    publico = "mulheres que querem melhorar autoestima e imagem";
    dor = "cuidar da aparência com mais praticidade e resultado";
    produto = "Manual de Beleza Prática em Casa";
    promessa = "Aprenda cuidados simples que ajudam a valorizar sua imagem sem gastar tanto";
    headline = "Rotina de beleza prática para elevar sua autoestima sem complicação";
    bonus = [
      "Rotina semanal pronta",
      "Lista de produtos essenciais",
      "Guia de erros que envelhecem a imagem"
    ];
    preco = "€29";
  }

  if (
    textoBaixo.includes("relacionamento") ||
    textoBaixo.includes("casamento") ||
    textoBaixo.includes("conquista") ||
    textoBaixo.includes("terminou comigo") ||
    textoBaixo.includes("homem")
  ) {
    nicho = "relacionamentos";
    publico = "mulheres em fase de dor afetiva ou reconstrução";
    dor = "sofrer com insegurança e confusão emocional nos relacionamentos";
    produto = "Guia de Recomeço Emocional";
    promessa = "Aprenda a recuperar autoestima, clareza emocional e postura depois de relações desgastantes";
    headline = "Reconstrua sua força emocional e recupere sua paz sem depender da validação de ninguém";
    bonus = [
      "Exercícios de amor-próprio",
      "Plano de 7 dias para recomeçar",
      "Frases de posicionamento emocional"
    ];
    preco = "€27";
  }

  return {
    nicho,
    publico,
    dor,
    produto,
    promessa,
    headline,
    bonus,
    preco
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const textoAnuncio = body.textoAnuncio || "";
    const resultado = analisarTexto(textoAnuncio);

    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao analisar anúncio" },
      { status: 500 }
    );
  }
}