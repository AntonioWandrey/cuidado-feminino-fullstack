import api from "./api";
import type { ConteudoEducativo } from "@/types";

export const getConteudos = (params?: {
  categoriaId?: number;
  perfilAlvo?: string;
}): Promise<ConteudoEducativo[]> =>
  api.get("/api/conteudos", { params }).then((r) => r.data);

export const getConteudo = (id: number): Promise<ConteudoEducativo> =>
  api.get(`/api/conteudos/${id}`).then((r) => r.data);

export const buscarConteudos = (q: string): Promise<ConteudoEducativo[]> =>
  api.get("/api/conteudos/busca", { params: { q } }).then((r) => r.data);

export const getDestaques = (): Promise<ConteudoEducativo[]> =>
  api.get("/api/conteudos/destaque").then((r) => r.data);

export const getConteudosPorPerfil = (
  perfil: string
): Promise<ConteudoEducativo[]> =>
  api.get(`/api/conteudos/perfil/${perfil}`).then((r) => r.data);
