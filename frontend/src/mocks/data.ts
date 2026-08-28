import type {
  PrevisaoResponse,
  CicloResponse,
  ConteudoEducativo,
  CategoriaConteudo,
  SerieConteudo,
} from "@/types";

const hoje = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDias = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const mockPrevisao: PrevisaoResponse = {
  id: 1,
  geradaEm: hoje.toISOString(),
  mediaDuracaoCiclo: 28,
  desvioPadrao: 1.5,
  ciclosAnalisados: 3,
  proximaMenstruacao: fmt(addDias(hoje, 14)),
  dataOvulacao: fmt(addDias(hoje, 0)),
  inicioPeriodoFertil: fmt(addDias(hoje, -5)),
  fimPeriodoFertil: fmt(addDias(hoje, 1)),
  confianca: "MEDIA",
};

export const mockCiclos: CicloResponse[] = [
  {
    id: 1,
    dataInicio: fmt(addDias(hoje, -28)),
    dataFim: fmt(addDias(hoje, -23)),
    duracaoDias: 5,
    fluxo: "MODERADO",
    observacoes: null,
    aberto: false,
    criadoEm: addDias(hoje, -28).toISOString(),
  },
  {
    id: 2,
    dataInicio: fmt(addDias(hoje, -56)),
    dataFim: fmt(addDias(hoje, -51)),
    duracaoDias: 5,
    fluxo: "LEVE",
    observacoes: null,
    aberto: false,
    criadoEm: addDias(hoje, -56).toISOString(),
  },
];

export const mockCategorias: CategoriaConteudo[] = [
  { id: 1, nome: "Queixas Ginecológicas", descricao: null, icone: "stethoscope", ordem: 1, ativo: true, criadoEm: hoje.toISOString() },
  { id: 2, nome: "Ciclo Menstrual", descricao: null, icone: "calendar", ordem: 2, ativo: true, criadoEm: hoje.toISOString() },
  { id: 3, nome: "Prevenção e Rastreio", descricao: null, icone: "shield", ordem: 3, ativo: true, criadoEm: hoje.toISOString() },
  { id: 4, nome: "Bem-estar e Autocuidado", descricao: null, icone: "heart", ordem: 4, ativo: true, criadoEm: hoje.toISOString() },
];

export const mockConteudos: ConteudoEducativo[] = [
  {
    id: 1,
    categoriaId: 1,
    categoriaNome: "Queixas Ginecológicas",
    titulo: "Corrimento vaginal: o que é normal?",
    subtitulo: "Saiba distinguir o corrimento fisiológico dos sinais de alerta",
    corpo: "O corrimento vaginal é normal na maioria dos casos e faz parte da autolimpeza vaginal. Ele pode variar em cor, consistência e quantidade ao longo do ciclo menstrual.\n\n**Quando é normal:**\n- Transparente ou branco leitoso\n- Sem odor forte\n- Sem coceira ou irritação\n\n**Sinais de alerta — procure a UBS:**\n- Cor esverdeada, amarelada ou acinzentada\n- Odor forte ou desagradável\n- Acompanhado de coceira, ardor ou vermelhidão\n- Consistência diferente do habitual\n\n⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.",
    palavrasChave: "corrimento,vaginal,normal,alerta,infecção",
    tempoLeituraMin: 3,
    fonteReferencia: "Protocolo de Atenção Básica à Saúde das Mulheres — Ministério da Saúde",
    imagemCapaUrl: null,
    ativo: true,
    destaque: true,
    perfilAlvo: "TODAS",
    criadoEm: hoje.toISOString(),
    atualizadoEm: null,
  },
  {
    id: 2,
    categoriaId: 1,
    categoriaNome: "Queixas Ginecológicas",
    titulo: "Cólica menstrual: cuidados em casa",
    subtitulo: "O que ajuda a aliviar e quando buscar avaliação médica",
    corpo: "A cólica menstrual (dismenorreia) é uma das queixas mais comuns entre mulheres em idade fértil. Pode variar de leve desconforto até dor intensa.\n\n**Cuidados em casa:**\n- Bolsa de água quente no abdômen\n- Chás de erva-cidreira ou camomila\n- Exercícios leves\n- Anti-inflamatórios (seguindo bula)\n\n**Quando procurar a UBS:**\n- Dor que não melhora com analgésicos\n- Dor que piora progressivamente a cada ciclo\n- Cólica fora do período menstrual\n- Sangramento muito intenso junto com a dor\n\n⚠️ Essas informações não substituem avaliação médica.",
    palavrasChave: "cólica,menstrual,dor,alívio,dismenorreia",
    tempoLeituraMin: 4,
    fonteReferencia: "Protocolo de Atenção Básica à Saúde das Mulheres — Ministério da Saúde",
    imagemCapaUrl: null,
    ativo: true,
    destaque: true,
    perfilAlvo: "TODAS",
    criadoEm: hoje.toISOString(),
    atualizadoEm: null,
  },
  {
    id: 3,
    categoriaId: 2,
    categoriaNome: "Ciclo Menstrual",
    titulo: "Conheça seu ciclo menstrual",
    subtitulo: "Fases, duração normal e como registrar",
    corpo: "O ciclo menstrual é contado do primeiro dia da menstruação até o dia anterior ao início da próxima. Um ciclo de 21 a 36 dias é considerado normal.\n\n**As 4 fases do ciclo:**\n1. **Menstrual** (dias 1-5): sangramento, descamação do endométrio\n2. **Folicular** (dias 1-13): crescimento dos folículos, aumento do estrogênio\n3. **Ovulatória** (dia 14): liberação do óvulo\n4. **Lútea** (dias 15-28): fase pré-menstrual, possível TPM\n\n**Como registrar:**\n- Marque o primeiro dia do sangramento\n- Observe a duração e intensidade\n- Anote sintomas associados\n\n⚠️ Essas informações não substituem avaliação médica.",
    palavrasChave: "ciclo,menstrual,fases,ovulação,folicular",
    tempoLeituraMin: 5,
    fonteReferencia: "Ebook Saúde da Mulher — SMS Brusque/UNIFEBE",
    imagemCapaUrl: null,
    ativo: true,
    destaque: true,
    perfilAlvo: "TODAS",
    criadoEm: hoje.toISOString(),
    atualizadoEm: null,
  },
  {
    id: 4,
    categoriaId: 3,
    categoriaNome: "Prevenção e Rastreio",
    titulo: "Prevenção do câncer de colo do útero",
    subtitulo: "Papanicolau, vacina HPV e sinais de alerta",
    corpo: "O câncer de colo do útero é altamente prevenível quando detectado precocemente. O exame de Papanicolau é gratuito no SUS.\n\n**Quem deve fazer o Papanicolau:**\n- Mulheres de 25 a 64 anos\n- Frequência: anual nos primeiros 2 anos consecutivos negativos, depois a cada 3 anos\n\n**Vacina HPV (SUS):**\n- Meninas de 9 a 14 anos\n- Meninos de 11 a 14 anos\n- Imunossuprimidos até 45 anos\n\n**Sinais de alerta — procure a UBS:**\n- Sangramento após relação sexual\n- Sangramento fora do período menstrual\n- Corrimento com odor persistente\n\n⚠️ Essas informações não substituem avaliação médica.",
    palavrasChave: "câncer,colo,útero,papanicolau,HPV,prevenção",
    tempoLeituraMin: 4,
    fonteReferencia: "Diretrizes INCA — Instituto Nacional de Câncer",
    imagemCapaUrl: null,
    ativo: true,
    destaque: false,
    perfilAlvo: "TODAS",
    criadoEm: hoje.toISOString(),
    atualizadoEm: null,
  },
  {
    id: 5,
    categoriaId: 2,
    categoriaNome: "Ciclo Menstrual",
    titulo: "TPM e alterações emocionais",
    subtitulo: "Causas hormonais e cuidados durante a fase lútea",
    corpo: "A Tensão Pré-Menstrual (TPM) é um conjunto de sintomas físicos e emocionais que ocorrem na fase lútea (dias anteriores à menstruação) e desaparecem com o início do sangramento.\n\n**Sintomas comuns:**\n- Irritabilidade e mudanças de humor\n- Ansiedade ou tristeza\n- Cólicas, inchaço, sensibilidade nos seios\n- Insônia ou sonolência excessiva\n\n**O que ajuda:**\n- Exercício físico regular\n- Reduzir sal, açúcar e cafeína\n- Sono de qualidade\n- Técnicas de relaxamento\n\n**Quando procurar ajuda:**\n- Sintomas incapacitantes (PMDD)\n- Impacto significativo no trabalho e relacionamentos\n\n⚠️ Essas informações não substituem avaliação médica.",
    palavrasChave: "TPM,humor,hormônios,lútea,pré-menstrual",
    tempoLeituraMin: 4,
    fonteReferencia: "Ebook Saúde da Mulher — SMS Brusque/UNIFEBE",
    imagemCapaUrl: null,
    ativo: true,
    destaque: true,
    perfilAlvo: "TODAS",
    criadoEm: hoje.toISOString(),
    atualizadoEm: null,
  },
];

export const mockSeries: SerieConteudo[] = [
  {
    id: 1,
    nome: "Tentando Engravidar",
    descricao: "Tudo o que você precisa saber para aumentar suas chances de gravidez",
    icone: "heart",
    ordem: 1,
    ativo: true,
    criadoEm: hoje.toISOString(),
  },
];
