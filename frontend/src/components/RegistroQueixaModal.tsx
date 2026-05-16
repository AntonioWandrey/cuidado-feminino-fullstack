import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  Droplets,
  Flame,
  Heart,
  Moon,
  Thermometer,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { registrarQueixa, deletarQueixa } from "@/services/queixaService";
import type {
  Intensidade,
  RegistroQueixaResponse,
  TipoQueixa,
  VolumeSangramento,
} from "@/types";

// ─── config visual por tipo de queixa ────────────────────────────────────────
export const tipoQueixaConfig: Record<
  TipoQueixa,
  { label: string; icon: React.ElementType; cor: string; conteudoId?: number }
> = {
  CORRIMENTO:              { label: "Corrimento",          icon: Droplets,     cor: "#4A90C4", conteudoId: 1 },
  COLICA:                  { label: "Cólica",              icon: Zap,          cor: "#C43A4A", conteudoId: 2 },
  SANGRAMENTO_FORA_PERIODO:{ label: "Sangramento",         icon: AlertCircle,  cor: "#C43A4A", conteudoId: 3 },
  DOR_URINAR:              { label: "Dor ao urinar",       icon: Flame,        cor: "#E8B84A", conteudoId: 4 },
  DOR_PELVICA:             { label: "Dor pélvica",         icon: Thermometer,  cor: "#C56682", conteudoId: 4 },
  ALTERACAO_HUMOR:         { label: "Alteração de humor",  icon: Moon,         cor: "#8B8BC4", conteudoId: 5 },
  FOGACHO:                 { label: "Fogacho",             icon: Wind,         cor: "#E7A48C", conteudoId: 6 },
  OUTRO:                   { label: "Outro",               icon: Heart,        cor: "#C56682" },
};

const intensidades: { valor: Intensidade; label: string }[] = [
  { valor: "LEVE",     label: "Leve" },
  { valor: "MODERADA", label: "Moderada" },
  { valor: "INTENSA",  label: "Intensa" },
];

const coresCorrimento = ["Branco", "Amarelado", "Esverdeado", "Acinzentado", "Transparente"];

interface Props {
  dia: Date;
  queixasDodia: RegistroQueixaResponse[];
  onClose: () => void;
}

const RegistroQueixaModal = ({ dia, queixasDodia, onClose }: Props) => {
  const queryClient = useQueryClient();

  const [tipoSelecionado, setTipoSelecionado] = useState<TipoQueixa | null>(null);
  const [intensidade, setIntensidade] = useState<Intensidade>("MODERADA");
  const [descricao, setDescricao] = useState("");
  const [corrimentoCor, setCorrimentoCor] = useState("");
  const [corrimentoOdor, setCorrimentoOdor] = useState(false);
  const [corrimentoCoceira, setCorrimentoCoceira] = useState(false);
  const [sangramentoVolume, setSangramentoVolume] = useState<VolumeSangramento>("MODERADO");
  const [mostrarForm, setMostrarForm] = useState(false);

  const { mutate: salvar, isPending: salvando } = useMutation({
    mutationFn: () =>
      registrarQueixa({
        dataRegistro: format(dia, "yyyy-MM-dd"),
        tipoQueixa: tipoSelecionado!,
        intensidade,
        descricao: descricao.trim() || undefined,
        corrimentoCor: tipoSelecionado === "CORRIMENTO" ? corrimentoCor || undefined : undefined,
        corrimentoOdor: tipoSelecionado === "CORRIMENTO" ? corrimentoOdor : undefined,
        corrimentoCoceira: tipoSelecionado === "CORRIMENTO" ? corrimentoCoceira : undefined,
        sangramentoVolume: tipoSelecionado === "SANGRAMENTO_FORA_PERIODO" ? sangramentoVolume : undefined,
        conteudoRelacionadoId: tipoSelecionado
          ? tipoQueixaConfig[tipoSelecionado].conteudoId
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queixas"] });
      toast.success("Queixa registrada!");
      setTipoSelecionado(null);
      setDescricao("");
      setMostrarForm(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensagem ?? "Erro ao registrar queixa");
    },
  });

  const { mutate: remover } = useMutation({
    mutationFn: deletarQueixa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queixas"] });
      toast.success("Queixa removida");
    },
  });

  const podeSalvar = tipoSelecionado !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-t-3xl bg-[#FBF4EB] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div>
            <p className="text-sm font-bold text-[#3d2529]">
              {format(dia, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="text-xs text-[#C56682]">Registro de queixa ginecológica</p>
          </div>
          <button onClick={onClose} className="p-1">
            <X size={18} className="text-[#C56682]" />
          </button>
        </div>

        <div className="px-4 pb-6 space-y-4">
          {/* Queixas já registradas no dia */}
          {queixasDodia.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#C56682]">Registradas neste dia</p>
              {queixasDodia.map((q) => {
                const cfg = tipoQueixaConfig[q.tipoQueixa];
                const Icon = cfg.icon;
                return (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 rounded-2xl p-3 bg-white border border-[#FBD9E5]"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: cfg.cor + "22" }}
                    >
                      <Icon size={16} style={{ color: cfg.cor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#3d2529]">{cfg.label}</p>
                      {q.intensidade && (
                        <p className="text-[10px] text-gray-400">{q.intensidade}</p>
                      )}
                      {q.descricao && (
                        <p className="text-[10px] text-gray-500 truncate">{q.descricao}</p>
                      )}
                    </div>
                    {q.conteudoRelacionadoTitulo && (
                      <a
                        href="#"
                        className="flex items-center gap-1 text-[10px] text-[#4A90C4] flex-shrink-0"
                        title={q.conteudoRelacionadoTitulo}
                      >
                        <BookOpen size={12} />
                        Saiba mais
                      </a>
                    )}
                    <button onClick={() => remover(q.id)} className="p-1 flex-shrink-0">
                      <X size={13} className="text-[#C43A4A]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Botão para abrir formulário */}
          {!mostrarForm && (
            <button
              onClick={() => setMostrarForm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold bg-[#C43A4A] text-white"
            >
              + Registrar nova queixa
            </button>
          )}

          {/* Formulário */}
          {mostrarForm && (
            <div className="space-y-4">
              {/* Seleção de tipo */}
              <div>
                <p className="text-xs font-bold text-[#3d2529] mb-2">Qual é a queixa?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(tipoQueixaConfig) as [TipoQueixa, typeof tipoQueixaConfig[TipoQueixa]][]).map(
                    ([tipo, cfg]) => {
                      const Icon = cfg.icon;
                      const ativo = tipoSelecionado === tipo;
                      return (
                        <button
                          key={tipo}
                          onClick={() => setTipoSelecionado(tipo)}
                          className="flex items-center gap-2 rounded-2xl p-3 text-xs font-medium text-left transition-all"
                          style={{
                            backgroundColor: ativo ? cfg.cor : "#fff",
                            color: ativo ? "#fff" : "#6b5a5e",
                            border: `1.5px solid ${ativo ? cfg.cor : "#FBD9E5"}`,
                          }}
                        >
                          <Icon size={14} />
                          {cfg.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Intensidade */}
              {tipoSelecionado && (
                <div>
                  <p className="text-xs font-bold text-[#3d2529] mb-2">Intensidade</p>
                  <div className="flex gap-2">
                    {intensidades.map(({ valor, label }) => (
                      <button
                        key={valor}
                        onClick={() => setIntensidade(valor)}
                        className="flex-1 rounded-xl py-2 text-xs font-medium transition-all"
                        style={{
                          backgroundColor: intensidade === valor ? tipoQueixaConfig[tipoSelecionado].cor : "#fff",
                          color: intensidade === valor ? "#fff" : "#6b5a5e",
                          border: `1.5px solid ${intensidade === valor ? tipoQueixaConfig[tipoSelecionado].cor : "#FBD9E5"}`,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Campos condicionais — corrimento */}
              {tipoSelecionado === "CORRIMENTO" && (
                <div className="rounded-2xl p-3 space-y-3 bg-white border border-[#FBD9E5]">
                  <p className="text-xs font-bold text-[#3d2529]">Detalhes do corrimento</p>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Cor</label>
                    <div className="relative">
                      <select
                        value={corrimentoCor}
                        onChange={(e) => setCorrimentoCor(e.target.value)}
                        className="w-full rounded-xl px-3 py-2 text-xs bg-[#FBF4EB] border border-[#FBD9E5] text-[#3d2529] appearance-none"
                      >
                        <option value="">Selecionar cor</option>
                        {coresCorrimento.map((c) => (
                          <option key={c} value={c.toLowerCase()}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-2.5 text-[#C56682] pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={corrimentoOdor}
                        onChange={(e) => setCorrimentoOdor(e.target.checked)}
                        className="accent-[#C43A4A] w-4 h-4"
                      />
                      <span className="text-xs text-[#3d2529]">Odor forte</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={corrimentoCoceira}
                        onChange={(e) => setCorrimentoCoceira(e.target.checked)}
                        className="accent-[#C43A4A] w-4 h-4"
                      />
                      <span className="text-xs text-[#3d2529]">Coceira</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Campos condicionais — sangramento */}
              {tipoSelecionado === "SANGRAMENTO_FORA_PERIODO" && (
                <div className="rounded-2xl p-3 space-y-2 bg-white border border-[#FBD9E5]">
                  <p className="text-xs font-bold text-[#3d2529]">Volume do sangramento</p>
                  <div className="flex gap-2">
                    {(["LEVE", "MODERADO", "INTENSO"] as VolumeSangramento[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setSangramentoVolume(v)}
                        className="flex-1 rounded-xl py-2 text-xs font-medium transition-all"
                        style={{
                          backgroundColor: sangramentoVolume === v ? "#C43A4A" : "#fff",
                          color: sangramentoVolume === v ? "#fff" : "#6b5a5e",
                          border: `1.5px solid ${sangramentoVolume === v ? "#C43A4A" : "#FBD9E5"}`,
                        }}
                      >
                        {v.charAt(0) + v.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Descrição livre */}
              {tipoSelecionado && (
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva como está se sentindo (opcional)"
                  maxLength={1000}
                  rows={2}
                  className="w-full rounded-2xl px-3 py-2 text-xs bg-white border border-[#FBD9E5] text-[#3d2529] resize-none outline-none"
                />
              )}

              {/* Aviso LGPD */}
              {tipoSelecionado && (
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  ⚠️ Essas informações não substituem avaliação médica.
                  Procure sempre a UBS para confirmação e acompanhamento.
                </p>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMostrarForm(false);
                    setTipoSelecionado(null);
                  }}
                  className="flex-1 rounded-2xl py-3 text-xs font-semibold bg-[#FBD9E5] text-[#C43A4A]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => salvar()}
                  disabled={!podeSalvar || salvando}
                  className="flex-1 rounded-2xl py-3 text-xs font-bold disabled:opacity-40 bg-[#C43A4A] text-white"
                >
                  {salvando ? "Salvando..." : "Salvar queixa"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroQueixaModal;
