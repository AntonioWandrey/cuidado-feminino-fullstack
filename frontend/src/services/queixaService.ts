import api from "./api";
import type {
  RegistroQueixaRequest,
  RegistroQueixaResponse,
  ResumoQueixasResponse,
  TipoQueixa,
} from "@/types";

export const registrarQueixa = (data: RegistroQueixaRequest): Promise<RegistroQueixaResponse> =>
  api.post("/api/queixas", data).then((r) => r.data);

export const getQueixas = (tipo?: TipoQueixa): Promise<RegistroQueixaResponse[]> =>
  api.get("/api/queixas", { params: tipo ? { tipo } : {} }).then((r) => r.data);

export const getQueixasPorPeriodo = (inicio: string, fim: string): Promise<RegistroQueixaResponse[]> =>
  api.get("/api/queixas/periodo", { params: { inicio, fim } }).then((r) => r.data);

export const getResumoQueixas = (): Promise<ResumoQueixasResponse> =>
  api.get("/api/queixas/resumo").then((r) => r.data);

export const atualizarQueixa = (id: number, data: RegistroQueixaRequest): Promise<RegistroQueixaResponse> =>
  api.put(`/api/queixas/${id}`, data).then((r) => r.data);

export const deletarQueixa = (id: number): Promise<void> =>
  api.delete(`/api/queixas/${id}`).then((r) => r.data);
