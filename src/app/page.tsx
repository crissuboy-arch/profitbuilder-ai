"use client";

import { useState } from "react";

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

export default function Home() {
  const [textoAnuncio, setTextoAnuncio] = useState("");
  const [resultado, setResultado] = useState<ResultadoMineracao | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function minerarAnuncio() {
    setCarregando(true);
    setErro("");
    setResultado(null);

    try {
      const res = await fetch("/api/generate-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          textoAnuncio: textoAnuncio
        })
      });

      if (!res.ok) {
        throw new Error("Erro ao minerar anúncio");
      }

      const data = await res.json();
      setResultado(data);
    } catch (e) {
      setErro("Não foi possível minerar o anúncio.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
        padding: "32px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto"
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
          Radar de Produtos com IA
        </h1>

        <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>
          Cole o texto de um anúncio e transforme isso em produto, promessa e oferta.
        </p>

        <div
          style={{
            background: "#111827",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "14px",
              marginBottom: "8px",
              color: "#cbd5e1"
            }}
          >
            Texto do anúncio
          </label>

          <textarea
            value={textoAnuncio}
            onChange={(e) => setTextoAnuncio(e.target.value)}
            placeholder="Cole aqui o texto do anúncio que você quer minerar..."
            style={{
              width: "100%",
              minHeight: "180px",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #475569",
              background: "#0b1220",
              color: "#ffffff",
              resize: "vertical",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />

          <button
            onClick={minerarAnuncio}
            disabled={carregando}
            style={{
              marginTop: "16px",
              background: carregando ? "#6b7280" : "#7c3aed",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 20px",
              cursor: carregando ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "15px"
            }}
          >
            {carregando ? "Minerando..." : "Minerar anúncio"}
          </button>

          {erro ? (
            <p style={{ color: "#fca5a5", marginTop: "14px" }}>{erro}</p>
          ) : null}
        </div>

        {resultado ? (
          <div
            style={{
              display: "grid",
              gap: "16px"
            }}
          >
            <div
              style={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: "16px",
                padding: "20px"
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
                Diagnóstico do anúncio
              </h2>

              <p><strong>Nicho:</strong> {resultado.nicho}</p>
              <p><strong>Público:</strong> {resultado.publico}</p>
              <p><strong>Dor principal:</strong> {resultado.dor}</p>
            </div>

            <div
              style={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: "16px",
                padding: "20px"
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
                Produto sugerido
              </h2>

              <p><strong>Produto:</strong> {resultado.produto}</p>
              <p><strong>Promessa:</strong> {resultado.promessa}</p>
              <p><strong>Headline:</strong> {resultado.headline}</p>
              <p><strong>Preço sugerido:</strong> {resultado.preco}</p>
            </div>

            <div
              style={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: "16px",
                padding: "20px"
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
                Bônus sugeridos
              </h2>

              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                {resultado.bonus.map((item, index) => (
                  <li key={index} style={{ marginBottom: "8px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                const params = new URLSearchParams({
                  concept: `${resultado.produto} — ${resultado.promessa}`,
                  audience: `${resultado.publico} (${resultado.nicho})`,
                  price: resultado.preco,
                  mechanism: resultado.headline,
                });
                window.location.href = `/dashboard/modules/sales-page-generator?${params.toString()}`;
              }}
              style={{
                padding: "16px 24px",
                background: "#7c3aed",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                width: "100%",
              }}
            >
              🚀 Gerar Página de Vendas
            </button>

          </div>
        ) : null}
      </div>
    </main>
  );
}
