import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createConteudo,
  getConteudoAdmin,
  updateConteudo,
} from "@/services/adminConteudoService";
import { getCategorias } from "@/services/categoriaService";
import type { ConteudoEducativo } from "@/types";
import ArtigoFormPage from "./ArtigoFormPage";

const { successToast } = vi.hoisted(() => ({ successToast: vi.fn() }));

vi.mock("sonner", () => ({
  toast: { success: successToast, error: vi.fn() },
}));

vi.mock("@/services/adminConteudoService", () => ({
  createConteudo: vi.fn(),
  getConteudoAdmin: vi.fn(),
  updateConteudo: vi.fn(),
}));

vi.mock("@/services/categoriaService", () => ({ getCategorias: vi.fn() }));

vi.mock("@/components/admin/RichTextEditor", () => ({
  RichTextEditor: ({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) => (
    <label>
      Corpo do artigo
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      {error && <span>{error}</span>}
    </label>
  ),
}));

const artigo: ConteudoEducativo = {
  id: 7,
  categoriaId: 2,
  categoriaNome: "Saúde íntima",
  titulo: "Título carregado",
  subtitulo: null,
  corpo: "<p>Corpo carregado</p>",
  palavrasChave: null,
  tempoLeituraMin: 5,
  fonteReferencia: null,
  imagemCapaUrl: null,
  ativo: false,
  destaque: false,
  perfilAlvo: "TODAS",
  criadoEm: "2026-08-20T10:00:00",
  atualizadoEm: null,
};

const renderPage = (route = "/gestao/artigos/novo") => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/gestao/artigos/novo" element={<ArtigoFormPage />} />
          <Route path="/gestao/artigos/:id/editar" element={<ArtigoFormPage />} />
          <Route path="/gestao/artigos" element={<p>Lista administrativa</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("ArtigoFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCategorias).mockResolvedValue([
      { id: 2, nome: "Saúde íntima", descricao: null, icone: null, ordem: 1, ativo: true, criadoEm: "2026-08-01" },
    ]);
    vi.mocked(getConteudoAdmin).mockResolvedValue(artigo);
    vi.mocked(createConteudo).mockResolvedValue(artigo);
    vi.mocked(updateConteudo).mockResolvedValue(artigo);
  });

  it("valida título, categoria e corpo semanticamente vazio", async () => {
    renderPage();
    fireEvent.change(await screen.findByLabelText("Corpo do artigo"), {
      target: { value: "<p><br></p>" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar artigo" }));

    expect(await screen.findByText("Título é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("Categoria é obrigatória.")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo é obrigatório.")).toBeInTheDocument();
    expect(createConteudo).not.toHaveBeenCalled();
  });

  it("carrega artigo para edição e mostra o preview", async () => {
    renderPage("/gestao/artigos/7/editar");

    expect(await screen.findByDisplayValue("Título carregado")).toBeInTheDocument();
    expect(screen.getByDisplayValue("<p>Corpo carregado</p>")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prévia do artigo" })).toBeInTheDocument();
    expect(screen.getByText("Corpo carregado")).toBeInTheDocument();
  });

  it("normaliza texto legado em parágrafos antes de editar e salvar", async () => {
    vi.mocked(getConteudoAdmin).mockResolvedValue({
      ...artigo,
      corpo: "Primeiro parágrafo\n\nSegundo parágrafo",
    });
    renderPage("/gestao/artigos/7/editar");

    expect(await screen.findByDisplayValue("<p>Primeiro parágrafo</p><p>Segundo parágrafo</p>")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar artigo" }));

    await waitFor(() => expect(updateConteudo).toHaveBeenCalled());
    expect(vi.mocked(updateConteudo).mock.calls[0][1].corpo).toBe(
      "<p>Primeiro parágrafo</p><p>Segundo parágrafo</p>",
    );
  });

  it("aceita várias referências HTTPS e rejeita capa SVGZ", async () => {
    renderPage();

    fireEvent.change(await screen.findByLabelText("Título"), { target: { value: "Artigo seguro" } });
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Corpo do artigo"), { target: { value: "<p>Corpo</p>" } });
    fireEvent.change(screen.getByLabelText(/Fontes de referência/), {
      target: { value: "https://saude.gov.br/a | https://inca.gov.br/b" },
    });
    fireEvent.change(screen.getByLabelText(/Imagem de capa/), {
      target: { value: "https://cdn.exemplo.com/capa.svgz" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar artigo" }));

    expect(await screen.findByText("A capa deve usar uma URL HTTPS válida e não pode ser SVG.")).toBeInTheDocument();
    expect(screen.queryByText(/Use somente URLs HTTPS válidas/)).not.toBeInTheDocument();
    expect(createConteudo).not.toHaveBeenCalled();
  });

  it("preserva os campos e não exibe sucesso quando a API falha", async () => {
    vi.mocked(createConteudo).mockRejectedValue(new Error("backend indisponível"));
    renderPage();

    fireEvent.change(await screen.findByLabelText("Título"), {
      target: { value: "Meu artigo preservado" },
    });
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Corpo do artigo"), {
      target: { value: "<p>Texto importante</p>" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar artigo" }));

    expect(await screen.findByText("Não foi possível salvar o artigo. Tente novamente.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Meu artigo preservado")).toBeInTheDocument();
    expect(successToast).not.toHaveBeenCalled();
  });

  it("impede envio duplo enquanto a criação está pendente", async () => {
    let resolveCreation: (value: ConteudoEducativo) => void = () => undefined;
    vi.mocked(createConteudo).mockReturnValue(
      new Promise((resolve) => {
        resolveCreation = resolve;
      }),
    );
    renderPage();

    await screen.findByRole("option", { name: "Saúde íntima" });
    fireEvent.change(await screen.findByLabelText("Título"), { target: { value: "Único envio" } });
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Corpo do artigo"), { target: { value: "<p>Corpo</p>" } });
    const save = screen.getByRole("button", { name: "Salvar artigo" });
    fireEvent.click(save);
    fireEvent.click(save);

    await waitFor(() => expect(createConteudo).toHaveBeenCalledTimes(1));
    resolveCreation(artigo);
    await waitFor(() => expect(screen.getByText("Lista administrativa")).toBeInTheDocument());
    expect(createConteudo).toHaveBeenCalledTimes(1);
  });
});
