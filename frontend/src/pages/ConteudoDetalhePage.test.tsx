import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getConteudo } from "@/services/conteudoService";
import type { ConteudoEducativo } from "@/types";
import ConteudoDetalhePage from "./ConteudoDetalhePage";

vi.mock("@/services/conteudoService", () => ({ getConteudo: vi.fn() }));

const artigo: ConteudoEducativo = {
  id: 7,
  categoriaId: 2,
  categoriaNome: "Saúde íntima",
  titulo: "Artigo rico",
  subtitulo: "Informação atualizada",
  corpo: '<h2>Orientações</h2><p><strong>Texto seguro</strong></p><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>',
  palavrasChave: null,
  tempoLeituraMin: 6,
  fonteReferencia: "https://saude.gov.br/referencia",
  imagemCapaUrl: "https://cdn.exemplo.com/capa.jpg",
  ativo: true,
  destaque: false,
  perfilAlvo: "TODAS",
  criadoEm: "2026-08-28T10:00:00",
  atualizadoEm: null,
};

const createClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });
const renderPage = (client = createClient()) => ({
  client,
  ...render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/conteudos/7"]}>
        <Routes><Route path="/conteudos/:id" element={<ConteudoDetalhePage />} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  ),
});

describe("ConteudoDetalhePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConteudo).mockResolvedValue(artigo);
  });

  it("renderiza capa, metadados, HTML rico, YouTube e referência HTTPS", async () => {
    const { container } = renderPage();

    expect(await screen.findByRole("heading", { name: "Artigo rico" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Capa do artigo Artigo rico" })).toHaveAttribute("src", artigo.imagemCapaUrl);
    expect(screen.getByText("6 min de leitura")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Orientações" })).toBeInTheDocument();
    expect(container.querySelector("iframe")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(screen.getByRole("link", { name: "https://saude.gov.br/referencia" })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("mostra não encontrado quando o artigo deixa de estar disponível após refetch", async () => {
    const client = createClient();
    const first = renderPage(client);
    expect(await screen.findByText("Artigo rico")).toBeInTheDocument();
    first.unmount();

    vi.mocked(getConteudo).mockRejectedValueOnce({ response: { status: 404 } });
    renderPage(client);
    expect(await screen.findByText("Conteúdo não encontrado")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Artigo rico")).not.toBeInTheDocument());
  });

  it("distingue indisponibilidade do backend e permite tentar novamente", async () => {
    vi.mocked(getConteudo).mockRejectedValue(new Error("offline"));
    renderPage();

    expect(await screen.findByText("Não foi possível carregar o conteúdo")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo não encontrado")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("não renderiza capa SVGZ mesmo quando a URL usa HTTPS", async () => {
    vi.mocked(getConteudo).mockResolvedValue({
      ...artigo,
      imagemCapaUrl: "https://cdn.exemplo.com/capa.svgz",
    });
    renderPage();

    expect(await screen.findByRole("heading", { name: "Artigo rico" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Capa do artigo/ })).not.toBeInTheDocument();
  });
});
