"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SalesPageContent() {
  const params = useSearchParams();

  const produto = params.get("produto") || "Produto não definido";
  const publico = params.get("publico") || "Público não definido";
  const preco = params.get("preco") || "€0";

  return (
    <div style={{
      padding: 40,
      maxWidth: 800,
      margin: "0 auto",
      fontFamily: "Arial"
    }}>

      <h1>🔥 Descubra o Produto Perfeito para Vender</h1>

      <p>
        Criado automaticamente com inteligência artificial para gerar vendas rápidas.
      </p>

      <div style={{
        background: "#f5f5f5",
        padding: 20,
        borderRadius: 10,
        marginTop: 20
      }}>
        <p><strong>💡 Produto:</strong> {produto}</p>
        <p><strong>🎯 Público:</strong> {publico}</p>
        <p><strong>💰 Preço:</strong> {preco}</p>
      </div>

      <button style={{
        marginTop: 20,
        padding: "15px 25px",
        background: "#9333ea",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
      }}>
        🚀 Comprar Agora
      </button>

    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Carregando...</div>}>
      <SalesPageContent />
    </Suspense>
  );
}
