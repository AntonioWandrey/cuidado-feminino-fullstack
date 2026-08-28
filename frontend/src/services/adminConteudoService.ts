import api from "./api";
import type { ConteudoEducativo, ConteudoEducativoRequest } from "@/types";

export const getConteudosAdmin = (): Promise<ConteudoEducativo[]> =>
  api.get("/api/admin/conteudos").then((response) => response.data);

export const getConteudoAdmin = (id: number): Promise<ConteudoEducativo> =>
  api.get(`/api/admin/conteudos/${id}`).then((response) => response.data);

export const createConteudo = (
  payload: ConteudoEducativoRequest,
): Promise<ConteudoEducativo> =>
  api.post("/api/admin/conteudos", payload).then((response) => response.data);

export const updateConteudo = (
  id: number,
  payload: ConteudoEducativoRequest,
): Promise<ConteudoEducativo> =>
  api.put(`/api/admin/conteudos/${id}`, payload).then((response) => response.data);

export const setConteudoPublicado = (
  id: number,
  ativo: boolean,
): Promise<ConteudoEducativo> =>
  api
    .patch(`/api/admin/conteudos/${id}/publicacao`, { ativo })
    .then((response) => response.data);

export const deleteConteudo = (id: number): Promise<void> =>
  api.delete(`/api/admin/conteudos/${id}`).then(() => undefined);
