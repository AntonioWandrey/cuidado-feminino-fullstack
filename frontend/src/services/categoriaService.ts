import api from "./api";
import type { CategoriaConteudo } from "@/types";

export const getCategorias = (): Promise<CategoriaConteudo[]> =>
  api.get("/api/categorias").then((r) => r.data);
