import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import type { CicloResponse, PrevisaoResponse } from "@/types";

const STORAGE_KEY = "cuidado-feminino:ciclos:v1";
const DURACAO_PADRAO_CICLO = 28;
const JANELA_MAXIMA_INTERVALOS = 6;

const validarData = (valor: string, nomeCampo: string): Date => {
  const data = parseISO(valor);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || !isValid(data) || format(data, "yyyy-MM-dd") !== valor) {
    throw new Error(`${nomeCampo} deve ser uma data válida.`);
  }
  if (isAfter(startOfDay(data), startOfDay(new Date()))) {
    throw new Error(`${nomeCampo} não pode estar no futuro.`);
  }
  return data;
};

const lerCiclos = (): CicloResponse[] => {
  try {
    const armazenado = localStorage.getItem(STORAGE_KEY);
    if (!armazenado) return [];
    const ciclos = JSON.parse(armazenado);
    if (!Array.isArray(ciclos)) return [];
    return ciclos
      .filter((ciclo): ciclo is CicloResponse =>
        Boolean(ciclo && typeof ciclo.id === "number" && typeof ciclo.dataInicio === "string")
      )
      .sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));
  } catch {
    return [];
  }
};

const salvarCiclos = (ciclos: CicloResponse[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ciclos));
};

export const getCiclos = async (): Promise<CicloResponse[]> => lerCiclos();

const calcularDesvioPadrao = (valores: number[], media: number): number | null => {
  if (valores.length < 2) return null;
  const variancia = valores.reduce((total, valor) => total + (valor - media) ** 2, 0) / valores.length;
  return Number(Math.sqrt(variancia).toFixed(1));
};

export const getPrevisao = async (): Promise<PrevisaoResponse> => {
  const ciclos = lerCiclos().sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
  const intervalos = ciclos
    .slice(1)
    .map((ciclo, indice) =>
      differenceInCalendarDays(parseISO(ciclo.dataInicio), parseISO(ciclos[indice].dataInicio))
    )
    .filter((dias) => dias > 0)
    .slice(-JANELA_MAXIMA_INTERVALOS);
  const mediaExata = intervalos.length
    ? intervalos.reduce((total, dias) => total + dias, 0) / intervalos.length
    : DURACAO_PADRAO_CICLO;
  const mediaDias = Math.round(mediaExata);
  const ultimaDataInicio = ciclos.length
    ? parseISO(ciclos[ciclos.length - 1].dataInicio)
    : startOfDay(new Date());
  let proximaMenstruacao = addDays(ultimaDataInicio, mediaDias);
  while (!isAfter(proximaMenstruacao, startOfDay(new Date()))) {
    proximaMenstruacao = addDays(proximaMenstruacao, mediaDias);
  }
  const dataOvulacao = addDays(proximaMenstruacao, -14);

  return {
    id: 0,
    geradaEm: new Date().toISOString(),
    mediaDuracaoCiclo: Number(mediaExata.toFixed(1)),
    desvioPadrao: calcularDesvioPadrao(intervalos, mediaExata),
    ciclosAnalisados: ciclos.length,
    proximaMenstruacao: format(proximaMenstruacao, "yyyy-MM-dd"),
    dataOvulacao: format(dataOvulacao, "yyyy-MM-dd"),
    inicioPeriodoFertil: format(addDays(dataOvulacao, -5), "yyyy-MM-dd"),
    fimPeriodoFertil: format(addDays(dataOvulacao, 1), "yyyy-MM-dd"),
    confianca: intervalos.length >= 6 ? "ALTA" : intervalos.length >= 3 ? "MEDIA" : "BAIXA",
  };
};

export const calcularPrevisao = getPrevisao;

export const registrarCiclo = async (data: {
  dataInicio: string;
  fluxo?: string;
  observacoes?: string;
}): Promise<CicloResponse> => {
  validarData(data.dataInicio, "A data de início");
  const ciclos = lerCiclos();
  if (ciclos.some((ciclo) => ciclo.aberto)) {
    throw new Error("Já existe um ciclo em andamento. Encerre-o antes de iniciar outro.");
  }
  if (
    ciclos.some(
      (ciclo) =>
        ciclo.dataFim &&
        data.dataInicio >= ciclo.dataInicio &&
        data.dataInicio <= ciclo.dataFim
    )
  ) {
    throw new Error("A data selecionada pertence a um período já registrado.");
  }

  const criado: CicloResponse = {
    id: Math.max(0, ...ciclos.map((ciclo) => ciclo.id)) + 1,
    dataInicio: data.dataInicio,
    dataFim: null,
    duracaoDias: null,
    fluxo: (data.fluxo as CicloResponse["fluxo"]) ?? null,
    observacoes: data.observacoes?.trim() || null,
    aberto: true,
    criadoEm: new Date().toISOString(),
  };
  salvarCiclos([criado, ...ciclos]);
  return criado;
};

export const encerrarCiclo = async (
  id: number,
  dataFim: string
): Promise<CicloResponse> => {
  const fim = validarData(dataFim, "A data de término");
  const ciclos = lerCiclos();
  const indice = ciclos.findIndex((ciclo) => ciclo.id === id);
  if (indice < 0) throw new Error("Ciclo não encontrado.");
  const ciclo = ciclos[indice];
  if (!ciclo.aberto) throw new Error("Este ciclo já foi encerrado.");

  const inicio = validarData(ciclo.dataInicio, "A data de início");
  if (isBefore(fim, inicio)) {
    throw new Error("A data de término não pode ser anterior à data de início.");
  }
  const sobrepoeOutroPeriodo = ciclos.some(
    (outro) =>
      outro.id !== id &&
      outro.dataFim &&
      ciclo.dataInicio <= outro.dataFim &&
      dataFim >= outro.dataInicio
  );
  if (sobrepoeOutroPeriodo) {
    throw new Error("O intervalo selecionado sobrepõe outro período já registrado.");
  }

  const encerrado: CicloResponse = {
    ...ciclo,
    dataFim,
    duracaoDias: differenceInCalendarDays(fim, inicio) + 1,
    aberto: false,
  };
  ciclos[indice] = encerrado;
  salvarCiclos(ciclos);
  return encerrado;
};
