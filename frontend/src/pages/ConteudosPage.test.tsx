import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCategorias } from "@/services/categoriaService";
import { buscarConteudos, getConteudos } from "@/services/conteudoService";
import type { ConteudoEducativo } from "@/types";
import ConteudosPage from "./ConteudosPage";

vi.mock("@/services/conteudoService", () => ({
  getConteudos: vi.fn(),
  buscarConteudos: vi.fn(),
}));
vi.mock("@/services/categoriaService", () => ({ getCategorias: vi.fn() }));

const artigo: ConteudoEducativo = {
  id: 7,
  categoriaId: 2,
  categoriaNome: "Saúde íntima",
  titulo: "Artigo real da API",
  subtitulo: "Informação atualizada",
  corpo: "<p>Corpo</p>",
  palavrasChave: "saúde",
  tempoLeituraMin: 4,
  fonteReferencia: null,
  imagemCapaUrl: "https://cdn.exemplo.com/capa.jpg",
  ativo: true,
  destaque: true,
  perfilAlvo: "TODAS",
  criadoEm: "2026-08-28T10:00:00",
  atualizadoEm: null,
};

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderPage = (client = createClient()) => ({
  client,
  ...render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ConteudosPage />
      </MemoryRouter>
    </QueryClientProvider>,
  ),
});

describe("ConteudosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCategorias).mockResolvedValue([]);
    vi.mocked(getConteudos).mockResolvedValue([artigo]);
    vi.mocked(buscarConteudos).mockResolvedValue([{ ...artigo, titulo: "Resultado da busca" }]);
  });

  it("mostra capa e dados recebidos da API", async () => {
    renderPage();
    expect(await screen.findByText("Artigo real da API")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Capa do artigo Artigo real da API" })).toHaveAttribute("loading", "lazy");
  });

  it("exibe erro real sem conteúdo fictício e permite tentar novamente", async () => {
    vi.mocked(getConteudos).mockRejectedValue(new Error("offline"));
    renderPage();

    expect(await screen.findByText("Não foi possível carregar os conteúdos.")).toBeInTheDocument();
    expect(screen.queryByText("Corrimento Vaginal")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("busca na API após digitação", async () => {
    renderPage();
    fireEvent.change(await screen.findByRole("searchbox", { name: "Buscar conteúdo" }), {
      target: { value: "saúde" },
    });

    expect(await screen.findByText("Resultado da busca", {}, { timeout: 2_000 })).toBeInTheDocument();
    expect(buscarConteudos).toHaveBeenCalledWith("saúde");
  });

  it("remove artigo da tela após refetch ao montar", async () => {
    const client = createClient();
    const first = renderPage(client);
    expect(await screen.findByText("Artigo real da API")).toBeInTheDocument();
    first.unmount();

    vi.mocked(getConteudos).mockResolvedValueOnce([]);
    renderPage(client);
    expect(await screen.findByText("Nenhum conteúdo encontrado")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Artigo real da API")).not.toBeInTheDocument());
  });
});
