import api from "./api";
import type { SerieConteudo, ConteudoEducativo } from "@/types";

export const getSeries = (): Promise<SerieConteudo[]> =>
  api.get("/api/series").then((r) => r.data);

export const getConteudosDaSerie = (id: number): Promise<ConteudoEducativo[]> =>
  api.get(`/api/series/${id}/conteudos`).then((r) => r.data);
