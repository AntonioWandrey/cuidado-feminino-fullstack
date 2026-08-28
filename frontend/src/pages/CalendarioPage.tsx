import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  parseISO,
  addDays,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplets,
  FlaskConical,
  Info,
  Plus,
  Stethoscope,
  Syringe,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  encerrarCiclo,
  getPrevisao,
  getCiclos,
  registrarCiclo,
} from "@/services/cicloService";
import { getQueixasPorPeriodo } from "@/services/queixaService";
import type { PrevisaoResponse, RegistroQueixaResponse } from "@/types";
import { cn } from "@/lib/utils";
import RegistroQueixaModal, { tipoQueixaConfig } from "@/components/RegistroQueixaModal";

// ─── tipos ────────────────────────────────────────────────────────────────────
type LembreteTipo = "consulta" | "vacina" | "exame" | "anticoncepcional";
interface Lembrete {
  id: string;
  data: string;
  titulo: string;
  tipo: LembreteTipo;
}

type Fase =
  | { nome: "menstruacao"; label: "Menstruação"; cor: string }
  | { nome: "ovulacao"; label: "Ovulação"; cor: string }
  | { nome: "fertil"; label: "Período Fértil"; cor: string }
  | { nome: "lutea"; label: "Fase Lútea"; cor: string }
  | null;

// ─── helpers ──────────────────────────────────────────────────────────────────
const safeInterval = (start: Date, end: Date): Date[] =>
  start > end ? [] : eachDayOfInterval({ start, end });

const getFase = (date: Date, previsao: PrevisaoResponse): Fase => {
  const d = startOfDay(date);
  const menStart = startOfDay(parseISO(previsao.proximaMenstruacao));
  const menEnd = addDays(menStart, 4);
  const ovulacao = startOfDay(parseISO(previsao.dataOvulacao));
  const fertStart = startOfDay(parseISO(previsao.inicioPeriodoFertil));
  const fertEnd = startOfDay(parseISO(previsao.fimPeriodoFertil));
  const luteaStart = addDays(fertEnd, 1);
  const luteaEnd = addDays(menStart, -1);

  if (isSameDay(d, ovulacao))
    return { nome: "ovulacao", label: "Ovulação", cor: "#E8B84A" };
  if (isWithinInterval(d, { start: menStart, end: menEnd }))
    return { nome: "menstruacao", label: "Menstruação", cor: "#C43A4A" };
  if (isWithinInterval(d, { start: fertStart, end: fertEnd }))
    return { nome: "fertil", label: "Período Fértil", cor: "#4A90C4" };
  if (luteaStart <= luteaEnd && isWithinInterval(d, { start: luteaStart, end: luteaEnd }))
    return { nome: "lutea", label: "Fase Lútea", cor: "#C56682" };
  return null;
};

const buildModifiers = (
  previsao: PrevisaoResponse | undefined,
  ciclosDays: Date[],
  lembreteDays: Date[],
  queixaDays: Date[]
) => {
  if (!previsao)
    return { cicloReal: ciclosDays, lembrete: lembreteDays, queixa: queixaDays };

  const menStart = parseISO(previsao.proximaMenstruacao);
  const menEnd = addDays(menStart, 4);
  const ovulacao = parseISO(previsao.dataOvulacao);
  const fertStart = parseISO(previsao.inicioPeriodoFertil);
  const fertEnd = parseISO(previsao.fimPeriodoFertil);
  const luteaStart = addDays(fertEnd, 1);
  const luteaEnd = addDays(menStart, -1);

  return {
    menstruacao: safeInterval(menStart, menEnd),
    ovulacao: [ovulacao],
    fertil: safeInterval(fertStart, fertEnd),
    lutea: safeInterval(luteaStart, luteaEnd),
    cicloReal: ciclosDays,
    lembrete: lembreteDays,
    queixa: queixaDays,
  };
};

const lembreteTipoConfig: Record<
  LembreteTipo,
  { icon: React.ElementType; label: string; cor: string }
> = {
  consulta:         { icon: Stethoscope, label: "Consulta",         cor: "#4A90C4" },
  vacina:           { icon: Syringe,     label: "Vacina",           cor: "#C43A4A" },
  exame:            { icon: FlaskConical,label: "Exame",            cor: "#E8B84A" },
  anticoncepcional: { icon: Clock,       label: "Anticoncepcional", cor: "#C56682" },
};

const legend = [
  { cor: "#C43A4A", label: "Menstruação" },
  { cor: "#4A90C4", label: "Período fértil" },
  { cor: "#E8B84A", label: "Ovulação" },
  { cor: "#FBD9E5", textCor: "#C56682", label: "Fase lútea" },
  { cor: "#8b1a2a", label: "Período real registrado" },
  { cor: "#E7A48C", label: "Queixa registrada" },
];

// ─── component ────────────────────────────────────────────────────────────────
const CalendarioPage = () => {
  const queryClient = useQueryClient();

  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [mesAtual, setMesAtual] = useState<Date>(new Date());
  const [mostrarLegenda, setMostrarLegenda] = useState(false);
  const [mostrarTodosCiclos, setMostrarTodosCiclos] = useState(false);
  const [mostrarFormLembrete, setMostrarFormLembrete] = useState(false);
  const [mostrarModalQueixa, setMostrarModalQueixa] = useState(false);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [novoLembrete, setNovoLembrete] = useState<{
    titulo: string;
    tipo: LembreteTipo;
  }>({ titulo: "", tipo: "consulta" });

  const { data: previsao, isLoading } = useQuery({
    queryKey: ["previsao"],
    queryFn: getPrevisao,
    retry: 1,
  });

  const { data: ciclos } = useQuery({
    queryKey: ["ciclos"],
    queryFn: getCiclos,
    retry: 1,
  });

  const periodoMes = useMemo(() => ({
    inicio: format(startOfMonth(mesAtual), "yyyy-MM-dd"),
    fim: format(endOfMonth(mesAtual), "yyyy-MM-dd"),
  }), [mesAtual]);

  const { data: queixas = [] } = useQuery<RegistroQueixaResponse[]>({
    queryKey: ["queixas", periodoMes.inicio, periodoMes.fim],
    queryFn: () => getQueixasPorPeriodo(periodoMes.inicio, periodoMes.fim),
    retry: 1,
  });

  const atualizarDadosDoCiclo = () => {
    queryClient.invalidateQueries({ queryKey: ["ciclos"] });
    queryClient.invalidateQueries({ queryKey: ["previsao"] });
  };

  const mensagemErro = (error: unknown) =>
    error instanceof Error ? error.message : "Não foi possível salvar o período.";

  const { mutate: registrar, isPending: iniciando } = useMutation({
    mutationFn: (dataInicio: string) => registrarCiclo({ dataInicio }),
    onSuccess: () => {
      atualizarDadosDoCiclo();
      toast.success("Início do período salvo neste dispositivo.");
    },
    onError: (error) => toast.error(mensagemErro(error)),
  });

  const { mutate: encerrar, isPending: encerrando } = useMutation({
    mutationFn: ({ id, dataFim }: { id: number; dataFim: string }) =>
      encerrarCiclo(id, dataFim),
    onSuccess: () => {
      atualizarDadosDoCiclo();
      toast.success("Período encerrado e previsão atualizada.");
    },
    onError: (error) => toast.error(mensagemErro(error)),
  });

  // ─── dias computados ────────────────────────────────────────────────────────
  const ciclosDays = useMemo(
    () =>
      (ciclos ?? [])
        .flatMap((c) =>
          safeInterval(
            parseISO(c.dataInicio),
            parseISO(c.dataFim ?? format(new Date(), "yyyy-MM-dd"))
          )
        ),
    [ciclos]
  );

  const lembreteDays = useMemo(
    () => lembretes.map((l) => parseISO(l.data)),
    [lembretes]
  );

  const queixaDays = useMemo(
    () => queixas.map((q) => parseISO(q.dataRegistro)),
    [queixas]
  );

  const modifiers = useMemo(
    () => buildModifiers(previsao, ciclosDays, lembreteDays, queixaDays),
    [previsao, ciclosDays, lembreteDays, queixaDays]
  );

  // modifiersStyles é um objeto de config passado ao componente Calendar — não é inline style JSX
  const modifiersStyles = {
    menstruacao: {
      backgroundColor: "#C43A4A",
      color: "#fff",
      borderRadius: "50%",
      fontWeight: "700",
    },
    ovulacao: {
      backgroundColor: "#E8B84A",
      color: "#3d2529",
      borderRadius: "50%",
      fontWeight: "700",
    },
    fertil: {
      backgroundColor: "#4A90C4",
      color: "#fff",
      borderRadius: "50%",
      fontWeight: "600",
    },
    lutea: {
      backgroundColor: "#FBD9E5",
      color: "#C56682",
      borderRadius: "50%",
    },
    cicloReal: {
      backgroundColor: "#8b1a2a",
      color: "#fff",
      borderRadius: "50%",
      fontWeight: "700",
    },
    queixa: {
      outline: "2.5px solid #E7A48C",
      outlineOffset: "1px",
      borderRadius: "50%",
    },
  };

  // ─── seleção ────────────────────────────────────────────────────────────────
  const faseDodia = useMemo(
    () => (selectedDay && previsao ? getFase(selectedDay, previsao) : null),
    [selectedDay, previsao]
  );

  const cicloDoDia = useMemo(() => {
    if (!selectedDay) return undefined;
    const dia = format(selectedDay, "yyyy-MM-dd");
    const hoje = format(new Date(), "yyyy-MM-dd");
    return (ciclos ?? []).find(
      (ciclo) =>
        dia >= ciclo.dataInicio && dia <= (ciclo.dataFim ?? hoje)
    );
  }, [selectedDay, ciclos]);

  const lembretesDodia = useMemo(() => {
    if (!selectedDay) return [];
    const dayStr = format(selectedDay, "yyyy-MM-dd");
    return lembretes.filter((l) => l.data === dayStr);
  }, [selectedDay, lembretes]);

  const queixasDodia = useMemo<RegistroQueixaResponse[]>(() => {
    if (!selectedDay) return [];
    return queixas.filter((q) =>
      isSameDay(parseISO(q.dataRegistro), selectedDay)
    );
  }, [selectedDay, queixas]);

  const ehPassadoOuHoje =
    selectedDay && !isAfter(startOfDay(selectedDay), startOfDay(new Date()));

  const cicloAberto = (ciclos ?? []).find((c) => c.aberto);
  const temCicloAberto = Boolean(cicloAberto);
  const dataSelecionada = selectedDay ? format(selectedDay, "yyyy-MM-dd") : "";
  const acaoCicloDesabilitada = Boolean(
    !selectedDay ||
      (cicloAberto && dataSelecionada < cicloAberto.dataInicio) ||
      (!cicloAberto && cicloDoDia)
  );

  // ─── handlers ───────────────────────────────────────────────────────────────
  const handleAddLembrete = () => {
    if (!selectedDay || !novoLembrete.titulo.trim()) return;
    const dayStr = format(selectedDay, "yyyy-MM-dd");
    setLembretes((prev) => [
      ...prev,
      { id: Date.now().toString(), data: dayStr, ...novoLembrete },
    ]);
    setNovoLembrete({ titulo: "", tipo: "consulta" });
    setMostrarFormLembrete(false);
    toast.success("Lembrete adicionado!");
  };

  const handleRemoverLembrete = (id: string) => {
    setLembretes((prev) => prev.filter((l) => l.id !== id));
  };

  const handleRegistrarPeriodo = () => {
    if (!selectedDay) return;
    const data = format(selectedDay, "yyyy-MM-dd");
    if (cicloAberto) {
      encerrar({ id: cicloAberto.id, dataFim: data });
      return;
    }
    registrar(data);
  };

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3d2529]">Calendário do Ciclo</h1>
        <p className="text-sm mt-0.5 text-[#C56682]">
          Toque em um dia para ver detalhes ou registrar eventos
        </p>
      </div>

      <div className="rounded-2xl px-3 py-2.5 flex gap-2 items-center bg-white border border-[#FBD9E5]">
        <CalendarCheck size={16} className="text-[#C43A4A] flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-[#3d2529]">Dados salvos neste dispositivo</p>
          <p className="text-[10px] text-gray-400">O calendário funciona localmente, mesmo sem internet.</p>
        </div>
      </div>

      {/* Aviso sem dados */}
      {!isLoading && previsao?.ciclosAnalisados === 0 && (
        <div className="rounded-2xl p-3 flex gap-3 items-start bg-[#FBD9E5]">
          <Info size={16} className="text-[#C43A4A] flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-[#3d2529]">
            Sem ciclos registrados. As fases mostradas usam o padrão de 28 dias.
            Registre seu período para previsões personalizadas.
          </p>
        </div>
      )}

      {/* Calendário */}
      <div className="rounded-2xl shadow-sm bg-white border border-[#FBD9E5]">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={(day) => {
            setSelectedDay(day);
            setMostrarFormLembrete(false);
          }}
          onMonthChange={setMesAtual}
          locale={ptBR}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          classNames={{
            day_selected: cn(
              "ring-2 ring-primary ring-offset-1 font-bold",
              "bg-primary text-primary-foreground"
            ),
            day_today: "border-2 border-primary font-bold text-primary",
            day_outside: "opacity-30",
          }}
          className="w-full"
        />
      </div>

      {/* Painel do dia selecionado */}
      {selectedDay && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-[#FBD9E5]">
          {/* Cabeçalho do dia — cor dinâmica vinda da fase */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              backgroundColor: cicloDoDia ? "#8b1a2a" : faseDodia ? faseDodia.cor : "#C43A4A",
              color: !cicloDoDia && faseDodia?.nome === "lutea" ? "#C56682" : "#fff",
            }}
          >
            <div>
              <p className="font-bold text-sm">
                {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
              {(cicloDoDia || faseDodia) && (
                <p className="text-xs opacity-90 mt-0.5">
                  {cicloDoDia ? "Período menstrual registrado" : faseDodia?.label}
                </p>
              )}
            </div>
            <CalendarDays size={20} className="opacity-80" />
          </div>

          <div className="p-4 space-y-3 bg-white">
            {/* Fase do dia */}
            {cicloDoDia ? (
              <div className="rounded-xl p-3 flex items-center gap-3 bg-[#FBF4EB]">
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-[#8b1a2a]" />
                <div>
                  <p className="text-xs font-bold text-[#3d2529]">Período menstrual registrado</p>
                  <p className="text-xs text-gray-400">
                    {cicloDoDia.aberto ? "Registro em andamento" : "Dia confirmado no histórico local"}
                  </p>
                </div>
              </div>
            ) : faseDodia ? (
              <div className="rounded-xl p-3 flex items-center gap-3 bg-[#FBF4EB]">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: faseDodia.cor }}
                />
                <div>
                  <p className="text-xs font-bold text-[#3d2529]">{faseDodia.label}</p>
                  <p className="text-xs text-gray-400">
                    {faseDodia.nome === "menstruacao" && "Período menstrual previsto"}
                    {faseDodia.nome === "fertil" && "Janela de maior fertilidade"}
                    {faseDodia.nome === "ovulacao" && "Pico de fertilidade — ovulação prevista"}
                    {faseDodia.nome === "lutea" && "Fase pré-menstrual — possível TPM"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center py-1 text-gray-400">
                Fora das fases previstas para este ciclo
              </p>
            )}

            {/* Queixas do dia */}
            {queixasDodia.length > 0 && (
              <div className="rounded-xl p-3 bg-[#FBF4EB] space-y-2">
                <p className="text-xs font-bold text-[#C56682]">Queixas registradas</p>
                {queixasDodia.map((q) => {
                  const cfg = tipoQueixaConfig[q.tipoQueixa];
                  const Icon = cfg.icon;
                  return (
                    <div key={q.id} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cfg.cor + "22" }}
                      >
                        <Icon size={12} style={{ color: cfg.cor }} />
                      </div>
                      <span className="text-xs text-[#3d2529]">{cfg.label}</span>
                      {q.intensidade && (
                        <span className="text-[10px] text-gray-400">· {q.intensidade}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              {ehPassadoOuHoje && (
                <button
                  onClick={handleRegistrarPeriodo}
                  disabled={iniciando || encerrando || acaoCicloDesabilitada}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-opacity active:opacity-70 disabled:opacity-50 bg-[#C43A4A] text-white"
                >
                  <Droplets size={14} />
                  {iniciando
                    ? "Salvando início..."
                    : encerrando
                    ? "Encerrando..."
                    : cicloAberto
                    ? "Encerrar período"
                    : "Registrar início do período"}
                </button>
              )}

              {ehPassadoOuHoje && (
                <button
                  onClick={() => setMostrarModalQueixa(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-opacity active:opacity-70 bg-[#E7A48C] text-white"
                >
                  <Plus size={14} />
                  Queixa
                </button>
              )}

              <button
                onClick={() => setMostrarFormLembrete((v) => !v)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-opacity active:opacity-70 bg-[#FBD9E5] text-[#C43A4A]"
              >
                <Plus size={14} />
                Lembrete
              </button>
            </div>

            {/* Formulário de lembrete */}
            {mostrarFormLembrete && (
              <div className="rounded-xl p-3 space-y-3 bg-[#FBF4EB] border border-[#FBD9E5]">
                <p className="text-xs font-bold text-[#3d2529]">
                  Novo lembrete para{" "}
                  {format(selectedDay, "dd/MM", { locale: ptBR })}
                </p>

                {/* Tipo — cores dinâmicas vindas do cfg.cor */}
                <div className="grid grid-cols-2 gap-2">
                  {(
                    Object.entries(lembreteTipoConfig) as [
                      LembreteTipo,
                      (typeof lembreteTipoConfig)[LembreteTipo]
                    ][]
                  ).map(([tipo, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={tipo}
                        onClick={() => setNovoLembrete((n) => ({ ...n, tipo }))}
                        className="flex items-center gap-2 rounded-xl p-2 text-xs font-medium transition-all"
                        style={{
                          backgroundColor:
                            novoLembrete.tipo === tipo ? cfg.cor : "#fff",
                          color:
                            novoLembrete.tipo === tipo ? "#fff" : "#6b5a5e",
                          border: `1px solid ${novoLembrete.tipo === tipo ? cfg.cor : "#FBD9E5"}`,
                        }}
                      >
                        <Icon size={13} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  placeholder="Descrição (ex: Consulta Dr. Ana)"
                  value={novoLembrete.titulo}
                  onChange={(e) =>
                    setNovoLembrete((n) => ({ ...n, titulo: e.target.value }))
                  }
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none bg-white border border-[#FBD9E5] text-[#3d2529]"
                  onKeyDown={(e) => e.key === "Enter" && handleAddLembrete()}
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleAddLembrete}
                    disabled={!novoLembrete.titulo.trim()}
                    className="flex-1 rounded-xl py-2 text-xs font-bold disabled:opacity-40 bg-[#C43A4A] text-white"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setMostrarFormLembrete(false);
                      setNovoLembrete({ titulo: "", tipo: "consulta" });
                    }}
                    className="px-3 rounded-xl text-xs bg-[#FBD9E5] text-[#C43A4A]"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Lembretes do dia */}
            {lembretesDodia.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#C56682]">Lembretes</p>
                {lembretesDodia.map((l) => {
                  const cfg = lembreteTipoConfig[l.tipo];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={l.id}
                      className="flex items-center gap-2 rounded-xl p-2.5 bg-[#FBF4EB]"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cfg.cor + "22" }}
                      >
                        <Icon size={14} style={{ color: cfg.cor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-[#3d2529]">
                          {l.titulo}
                        </p>
                        <p className="text-[10px] text-gray-400">{cfg.label}</p>
                      </div>
                      <button
                        onClick={() => handleRemoverLembrete(l.id)}
                        className="p-1"
                      >
                        <Trash2 size={13} className="text-[#C43A4A]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ciclos registrados */}
      {ciclos && ciclos.length > 0 && (
        <div className="rounded-2xl p-4 shadow-sm bg-white border border-[#FBD9E5]">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck size={16} className="text-[#C43A4A]" />
            <p className="text-sm font-bold text-[#3d2529]">
              Últimos Ciclos Registrados
            </p>
          </div>
          <div className="space-y-2">
            {(mostrarTodosCiclos ? ciclos : ciclos.slice(0, 3)).map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-[#6b5a5e]">
                  {format(parseISO(c.dataInicio), "dd/MM/yyyy")}
                  {c.dataFim
                    ? ` → ${format(parseISO(c.dataFim), "dd/MM/yyyy")}`
                    : " (em andamento)"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    c.aberto
                      ? "bg-[#FBD9E5] text-[#C43A4A]"
                      : "bg-[#f0fdf4] text-green-600"
                  }`}
                >
                  {c.aberto
                    ? "Em andamento"
                    : `${c.duracaoDias ?? "?"} ${c.duracaoDias === 1 ? "dia" : "dias"}`}
                </span>
              </div>
            ))}
          </div>
          {ciclos.length > 3 && (
            <button
              onClick={() => setMostrarTodosCiclos((valor) => !valor)}
              className="w-full mt-3 pt-2 border-t border-[#FBD9E5] text-xs font-semibold text-[#C56682]"
            >
              {mostrarTodosCiclos ? "Mostrar menos" : `Ver todos os ${ciclos.length} ciclos`}
            </button>
          )}
          {temCicloAberto && (
            <p className="text-xs mt-3 p-2 rounded-xl text-center bg-[#FBD9E5] text-[#C43A4A]">
              ⚠️ Há um ciclo em aberto. Encerre-o antes de registrar um novo.
            </p>
          )}
        </div>
      )}

      {/* Previsão */}
      {previsao && (
        <div className="rounded-2xl p-4 shadow-sm bg-white border border-[#FBD9E5]">
          <div className="flex items-center gap-2 mb-3">
            <Droplets size={16} className="text-[#C43A4A]" />
            <p className="text-sm font-bold text-[#3d2529]">
              Próximas Datas Previstas
            </p>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Próxima menstruação",  value: previsao.proximaMenstruacao,  cor: "#C43A4A" },
              { label: "Início período fértil", value: previsao.inicioPeriodoFertil, cor: "#4A90C4" },
              { label: "Ovulação prevista",     value: previsao.dataOvulacao,        cor: "#E8B84A" },
            ].map(({ label, value, cor }) => (
              <div key={label} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cor }}
                  />
                  <span className="text-xs text-[#6b5a5e]">{label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: cor }}>
                  {format(parseISO(value), "dd/MM/yyyy")}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-3 pt-2 border-t border-[#FBD9E5] text-gray-400">
            Confiança:{" "}
            {previsao.confianca === "ALTA"
              ? "Alta ✓"
              : previsao.confianca === "MEDIA"
              ? "Média"
              : "Baixa — registre mais ciclos"}{" "}
            · Ciclo médio: {Math.round(previsao.mediaDuracaoCiclo)} dias
          </p>
        </div>
      )}

      {/* Legenda (colapsável) */}
      <div className="rounded-2xl shadow-sm overflow-hidden border border-[#FBD9E5]">
        <button
          onClick={() => setMostrarLegenda((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white"
        >
          <p className="text-xs font-bold text-[#3d2529]">Legenda das Fases</p>
          {mostrarLegenda ? (
            <ChevronUp size={16} className="text-[#C56682]" />
          ) : (
            <ChevronDown size={16} className="text-[#C56682]" />
          )}
        </button>
        {mostrarLegenda && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2 bg-white">
            {legend.map(({ cor, textCor, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 border"
                  style={{ backgroundColor: cor, borderColor: textCor ?? cor }}
                />
                <span className="text-xs text-[#6b5a5e]">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs py-2 text-gray-400">
        ⚠️ Previsões são estimativas. Consulte sempre a UBS.
      </p>

      {/* Modal de queixa */}
      {mostrarModalQueixa && selectedDay && (
        <RegistroQueixaModal
          dia={selectedDay}
          queixasDodia={queixasDodia}
          onClose={() => setMostrarModalQueixa(false)}
        />
      )}
    </div>
  );
};

export default CalendarioPage;
