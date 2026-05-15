// ─── Usuária ────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  lastPeriodDate?: string;
  cycleLength?: number;
  notifications: boolean;
}

// ─── Sintomas ────────────────────────────────────────────────────────────────
export interface SymptomLog {
  id: string;
  userId: string;
  date: string;
  mood: "bem" | "normal" | "cansada" | "desconfortavel";
  symptoms: string[];
  discharge?: string;
  otherSigns: string[];
  alertTriggered: boolean;
  notes?: string;
}

// ─── Ciclo ────────────────────────────────────────────────────────────────────
export type Fluxo = "LEVE" | "MODERADO" | "INTENSO" | "MUITO_INTENSO";

export interface CicloResponse {
  id: number;
  dataInicio: string;
  dataFim: string | null;
  duracaoDias: number | null;
  fluxo: Fluxo | null;
  observacoes: string | null;
  aberto: boolean;
  criadoEm: string;
}

// ─── Previsão ────────────────────────────────────────────────────────────────
export type Confianca = "BAIXA" | "MEDIA" | "ALTA";

export interface PrevisaoResponse {
  id: number;
  geradaEm: string;
  mediaDuracaoCiclo: number;
  desvioPadrao: number | null;
  ciclosAnalisados: number;
  proximaMenstruacao: string;
  dataOvulacao: string;
  inicioPeriodoFertil: string;
  fimPeriodoFertil: string;
  confianca: Confianca;
}

// ─── Conteúdo Educativo ──────────────────────────────────────────────────────
export type PerfilAlvo =
  | "TODAS"
  | "ADOLESCENTE"
  | "TENTANTE"
  | "GESTANTE"
  | "MENOPAUSA";

export interface ConteudoEducativo {
  id: number;
  categoriaId: number;
  categoriaNome: string;
  titulo: string;
  subtitulo: string | null;
  corpo: string;
  palavrasChave: string | null;
  tempoLeituraMin: number | null;
  fonteReferencia: string | null;
  imagemCapaUrl: string | null;
  ativo: boolean;
  destaque: boolean;
  perfilAlvo: PerfilAlvo;
  criadoEm: string;
  atualizadoEm: string | null;
}

// ─── Categoria ───────────────────────────────────────────────────────────────
export interface CategoriaConteudo {
  id: number;
  nome: string;
  descricao: string | null;
  icone: string | null;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
}

// ─── Série ───────────────────────────────────────────────────────────────────
export interface SerieConteudo {
  id: number;
  nome: string;
  descricao: string | null;
  icone: string | null;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
}

// ─── Lembretes ───────────────────────────────────────────────────────────────
export interface Appointment {
  id: string;
  userId: string;
  date: Date;
  title: string;
  type: "consulta" | "vacina" | "exame";
  notes?: string;
}
