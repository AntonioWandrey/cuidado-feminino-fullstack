import axios from "axios";
import {
  mockPrevisao,
  mockCiclos,
  mockCategorias,
  mockSeries,
} from "@/mocks/data";

// Em Android (Capacitor), 10.0.2.2 aponta para localhost do computador host (emulador).
// Em web dev, usa localhost normalmente.
const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

// Mapeamento URL → mock data para fallback offline
const mockByUrl: Record<string, unknown> = {
  "/api/previsoes":         mockPrevisao,
  "/api/v1/ciclos":         mockCiclos,
  "/api/categorias":        mockCategorias,
  "/api/series":            mockSeries,
  "/api/queixas":           [],
  "/api/queixas/resumo":    { totalQueixas: 0, contagemPorTipo: {}, queixaMaisFrequente: null },
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED";

    if (isNetworkError) {
      const url: string = error.config?.url ?? "";
      const basePath = url.split("?")[0];

      const mock = mockByUrl[basePath];
      if (mock !== undefined) {
        console.warn(`[offline] Retornando mock para ${basePath}`);
        return Promise.resolve({ data: mock, status: 200, statusText: "OK (mock)", headers: {}, config: error.config });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
