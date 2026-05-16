import api from "./api";
import type { CicloResponse, PrevisaoResponse } from "@/types";

export const getCiclos = (): Promise<CicloResponse[]> =>
  api.get("/api/v1/ciclos").then((r) => r.data);

export const getPrevisao = (): Promise<PrevisaoResponse> =>
  api.get("/api/previsoes").then((r) => r.data);

export const calcularPrevisao = (): Promise<PrevisaoResponse> =>
  api.post("/api/previsoes/calcular").then((r) => r.data);

export const registrarCiclo = (data: {
  dataInicio: string;
  fluxo?: string;
  observacoes?: string;
}): Promise<CicloResponse> =>
  api.post("/api/v1/ciclos", data).then((r) => r.data);
