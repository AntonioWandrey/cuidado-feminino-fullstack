import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { getDestaques } from "@/services/conteudoService";
import HomePage from "./HomePage";

vi.mock("@/services/cicloService", () => ({
  getPrevisao: vi.fn().mockResolvedValue(null),
  getCiclos: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/services/conteudoService", () => ({
  getDestaques: vi.fn(),
}));
vi.mock("@/components/SymptomForm", () => ({ default: () => null }));

describe("HomePage", () => {
  it("renderiza a capa recebida da API no destaque", async () => {
    vi.mocked(getDestaques).mockResolvedValue([
      {
        id: 7,
        categoriaId: 2,
        categoriaNome: "Saúde íntima",
        titulo: "Destaque real",
        subtitulo: null,
        corpo: "<p>Corpo</p>",
        palavrasChave: null,
        tempoLeituraMin: 4,
        fonteReferencia: null,
        imagemCapaUrl: "https://cdn.exemplo.com/destaque.jpg",
        ativo: true,
        destaque: true,
        perfilAlvo: "TODAS",
        criadoEm: "2026-08-28",
        atualizadoEm: null,
      },
    ]);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter><HomePage onNavigate={vi.fn()} /></MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Destaque real")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Capa do artigo Destaque real" })).toHaveAttribute("loading", "lazy");
  });
});
