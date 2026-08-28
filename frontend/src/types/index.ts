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

export interface ConteudoEducativoRequest {
  categoriaId: number;
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

// ─── Registro de Queixas ─────────────────────────────────────────────────────
export type TipoQueixa =
  | "CORRIMENTO"
  | "COLICA"
  | "SANGRAMENTO_FORA_PERIODO"
  | "DOR_URINAR"
  | "DOR_PELVICA"
  | "ALTERACAO_HUMOR"
  | "FOGACHO"
  | "OUTRO";

export type Intensidade = "LEVE" | "MODERADA" | "INTENSA";
export type VolumeSangramento = "LEVE" | "MODERADO" | "INTENSO";

export interface RegistroQueixaRequest {
  dataRegistro: string;
  tipoQueixa: TipoQueixa;
  intensidade?: Intensidade;
  descricao?: string;
  duracaoHoras?: number;
  corrimentoCor?: string;
  corrimentoOdor?: boolean;
  corrimentoCoceira?: boolean;
  sangramentoVolume?: VolumeSangramento;
  conteudoRelacionadoId?: number;
}

export interface RegistroQueixaResponse {
  id: number;
  dataRegistro: string;
  tipoQueixa: TipoQueixa;
  intensidade: Intensidade | null;
  descricao: string | null;
  duracaoHoras: number | null;
  corrimentoCor: string | null;
  corrimentoOdor: boolean | null;
  corrimentoCoceira: boolean | null;
  sangramentoVolume: VolumeSangramento | null;
  conteudoRelacionadoId: number | null;
  conteudoRelacionadoTitulo: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface ResumoQueixasResponse {
  totalQueixas: number;
  contagemPorTipo: Record<TipoQueixa, number>;
  queixaMaisFrequente: TipoQueixa | null;
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
