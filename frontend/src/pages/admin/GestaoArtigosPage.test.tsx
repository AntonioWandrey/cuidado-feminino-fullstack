import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteConteudo,
  getConteudosAdmin,
  setConteudoPublicado,
} from "@/services/adminConteudoService";
import type { ConteudoEducativo } from "@/types";
import GestaoArtigosPage from "./GestaoArtigosPage";

vi.mock("@/services/adminConteudoService", () => ({
  getConteudosAdmin: vi.fn(),
  setConteudoPublicado: vi.fn(),
  deleteConteudo: vi.fn(),
}));

const artigo: ConteudoEducativo = {
  id: 7,
  categoriaId: 2,
  categoriaNome: "Saúde íntima",
  titulo: "Saúde sem tabus",
  subtitulo: "Informação acolhedora",
  corpo: "<p>Conteúdo</p>",
  palavrasChave: null,
  tempoLeituraMin: 4,
  fonteReferencia: null,
  imagemCapaUrl: null,
  ativo: true,
  destaque: false,
  perfilAlvo: "TODAS",
  criadoEm: "2026-08-20T10:00:00",
  atualizadoEm: "2026-08-28T10:00:00",
};

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <GestaoArtigosPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("GestaoArtigosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConteudosAdmin).mockResolvedValue([artigo]);
    vi.mocked(setConteudoPublicado).mockResolvedValue({ ...artigo, ativo: false });
    vi.mocked(deleteConteudo).mockResolvedValue(undefined);
  });

  it("lista artigos com estado e ação para criar", async () => {
    renderPage();

    expect(await screen.findByText("Gestão de artigos")).toBeInTheDocument();
    expect(await screen.findAllByText("Publicado")).not.toHaveLength(0);
    expect(screen.getAllByText("Saúde sem tabus")).not.toHaveLength(0);
    expect(screen.getByRole("link", { name: /novo artigo/i })).toHaveAttribute(
      "href",
      "/gestao/artigos/novo",
    );
  });

  it("exibe vazio e erro real com tentativa novamente", async () => {
    vi.mocked(getConteudosAdmin).mockResolvedValueOnce([]);
    const { unmount } = renderPage();
    expect(await screen.findByText("Nenhum artigo cadastrado.")).toBeInTheDocument();
    unmount();

    vi.mocked(getConteudosAdmin).mockRejectedValueOnce(new Error("offline"));
    renderPage();
    expect(await screen.findByText("Não foi possível carregar os artigos.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("despublica e refaz a consulta administrativa", async () => {
    renderPage();
    fireEvent.click((await screen.findAllByRole("button", { name: "Despublicar Saúde sem tabus" }))[0]);

    await waitFor(() => expect(setConteudoPublicado).toHaveBeenCalledWith(7, false));
    await waitFor(() => expect(getConteudosAdmin).toHaveBeenCalledTimes(2));
  });

  it("exige confirmação antes de excluir", async () => {
    renderPage();
    fireEvent.click((await screen.findAllByRole("button", { name: "Excluir Saúde sem tabus" }))[0]);
    expect(screen.getByRole("dialog", { name: "Confirmar exclusão" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar exclusão" }));
    expect(deleteConteudo).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "Excluir Saúde sem tabus" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    await waitFor(() => expect(deleteConteudo).toHaveBeenCalledWith(7));
  });
});
