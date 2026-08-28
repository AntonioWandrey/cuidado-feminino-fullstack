import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/services/api";
import type { ConteudoEducativoRequest } from "@/types";
import {
  createConteudo,
  deleteConteudo,
  getConteudoAdmin,
  getConteudosAdmin,
  setConteudoPublicado,
  updateConteudo,
} from "./adminConteudoService";

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const payload: ConteudoEducativoRequest = {
  categoriaId: 2,
  titulo: "Saúde sem tabus",
  subtitulo: null,
  corpo: "<p>Conteúdo</p>",
  palavrasChave: null,
  tempoLeituraMin: 4,
  fonteReferencia: null,
  imagemCapaUrl: null,
  ativo: false,
  destaque: false,
  perfilAlvo: "TODAS",
};

const response = { id: 7, ...payload, categoriaNome: "Saúde", criadoEm: "2026-08-28", atualizadoEm: null };

describe("adminConteudoService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("usa os endpoints administrativos de leitura", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [response] }).mockResolvedValueOnce({ data: response });

    await expect(getConteudosAdmin()).resolves.toEqual([response]);
    await expect(getConteudoAdmin(7)).resolves.toEqual(response);

    expect(api.get).toHaveBeenNthCalledWith(1, "/api/admin/conteudos");
    expect(api.get).toHaveBeenNthCalledWith(2, "/api/admin/conteudos/7");
  });

  it("envia o payload correto ao criar e atualizar", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: response });
    vi.mocked(api.put).mockResolvedValue({ data: response });

    await expect(createConteudo(payload)).resolves.toEqual(response);
    await expect(updateConteudo(7, payload)).resolves.toEqual(response);

    expect(api.post).toHaveBeenCalledWith("/api/admin/conteudos", payload);
    expect(api.put).toHaveBeenCalledWith("/api/admin/conteudos/7", payload);
  });

  it("publica, despublica e exclui sem fabricar resposta", async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: response });
    vi.mocked(api.delete).mockResolvedValue({ data: undefined });

    await expect(setConteudoPublicado(7, false)).resolves.toEqual(response);
    await expect(deleteConteudo(7)).resolves.toBeUndefined();

    expect(api.patch).toHaveBeenCalledWith("/api/admin/conteudos/7/publicacao", { ativo: false });
    expect(api.delete).toHaveBeenCalledWith("/api/admin/conteudos/7");
  });

  it("propaga falhas de mutação", async () => {
    const failure = new Error("backend indisponível");
    vi.mocked(api.post).mockRejectedValue(failure);

    await expect(createConteudo(payload)).rejects.toBe(failure);
  });
});
