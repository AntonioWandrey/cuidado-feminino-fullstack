import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  Droplets,
  Heart,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import SymptomForm from "@/components/SymptomForm";
import { getPrevisao, getCiclos } from "@/services/cicloService";
import { getDestaques } from "@/services/conteudoService";
import { useNavigate } from "react-router-dom";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

const dicas = [
  {
    icon: "💧",
    titulo: "Hidrate-se",
    texto: "Beba ao menos 2 litros de água hoje. A hidratação equilibra os hormônios.",
  },
  {
    icon: "🏃",
    titulo: "Mexa-se",
    texto: "30 minutos de atividade física aliviam cólicas e melhoram o humor durante a TPM.",
  },
  {
    icon: "😴",
    titulo: "Durma bem",
    texto: "7–9 horas de sono regulam os hormônios e reduzem sintomas de TPM.",
  },
  {
    icon: "🥦",
    titulo: "Alimente-se bem",
    texto: "Magnésio (banana, abacate) ajuda a reduzir cólicas menstruais.",
  },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const HomePage = ({ onNavigate }: HomePageProps) => {
  const navigate = useNavigate();
  const [symptomOpen, setSymptomOpen] = useState(false);
  const [dicaIdx, setDicaIdx] = useState(0);
  const [destaqueIdx, setDestaqueIdx] = useState(0);

  const { data: previsao } = useQuery({
    queryKey: ["previsao"],
    queryFn: getPrevisao,
    retry: 1,
  });

  const { data: ciclos } = useQuery({
    queryKey: ["ciclos"],
    queryFn: getCiclos,
    retry: 1,
  });

  const { data: destaques } = useQuery({
    queryKey: ["destaques"],
    queryFn: getDestaques,
    retry: 1,
  });

  useEffect(() => {
    const dayIdx = Math.floor(Date.now() / 86400000) % dicas.length;
    setDicaIdx(dayIdx);
  }, []);

  useEffect(() => {
    if (!destaques || destaques.length <= 1) return;
    const timer = setInterval(() => {
      setDestaqueIdx((i) => (i + 1) % destaques.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [destaques]);

  const diasAteProxima = previsao?.proximaMenstruacao
    ? differenceInDays(parseISO(previsao.proximaMenstruacao), new Date())
    : null;

  const ultimoCiclo = ciclos?.[0];
  const dica = dicas[dicaIdx];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: "#C56682" }}>
            {greeting()} 💕
          </p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ color: "#3d2529" }}>
            MS Feminina
          </h1>
        </div>
        <button
          className="p-2 rounded-full"
          style={{ backgroundColor: "#FBD9E5" }}
        >
          <Bell size={20} style={{ color: "#C43A4A" }} />
        </button>
      </div>

      {/* Card: Próxima Menstruação */}
      <div
        className="rounded-2xl p-5 text-white shadow-md"
        style={{
          background: "linear-gradient(135deg, #C43A4A 0%, #a02d3a 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={18} className="opacity-80" />
          <span className="text-sm font-semibold opacity-90">
            Próxima Menstruação
          </span>
        </div>
        {diasAteProxima !== null ? (
          <>
            <p className="text-4xl font-bold mb-1">
              {diasAteProxima <= 0 ? "Hoje!" : `em ${diasAteProxima} dias`}
            </p>
            <p className="text-sm opacity-80">
              {previsao?.proximaMenstruacao
                ? format(parseISO(previsao.proximaMenstruacao), "dd 'de' MMMM", {
                    locale: ptBR,
                  })
                : ""}
            </p>
            {previsao && (
              <p className="text-xs mt-2 opacity-70">
                Confiança: {previsao.confianca === "ALTA" ? "Alta" : previsao.confianca === "MEDIA" ? "Média" : "Baixa"}
                {" · "}Ciclo médio: {Math.round(previsao.mediaDuracaoCiclo)} dias
              </p>
            )}
          </>
        ) : (
          <div>
            <p className="text-lg font-semibold mb-1">Registre seu ciclo</p>
            <p className="text-sm opacity-80">
              Adicione a data do seu período para ver previsões personalizadas.
            </p>
          </div>
        )}
      </div>

      {/* Card: Informações do Ciclo */}
      {(ciclos && ciclos.length > 0) ? (
        <div
          className="rounded-2xl p-4 grid grid-cols-2 gap-3 shadow-sm"
          style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
        >
          <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#FBF4EB" }}>
            <p className="text-2xl font-bold" style={{ color: "#C43A4A" }}>
              {ciclos.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#C56682" }}>
              ciclos registrados
            </p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#FBF4EB" }}>
            <p className="text-2xl font-bold" style={{ color: "#C43A4A" }}>
              {previsao ? Math.round(previsao.mediaDuracaoCiclo) : "—"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#C56682" }}>
              dias (média)
            </p>
          </div>
          {ultimoCiclo && (
            <div className="col-span-2 pt-2 border-t" style={{ borderColor: "#FBD9E5" }}>
              <p className="text-xs text-center" style={{ color: "#9ca3af" }}>
                Último período:{" "}
                <span style={{ color: "#C56682", fontWeight: 600 }}>
                  {format(parseISO(ultimoCiclo.dataInicio), "dd/MM/yyyy")}
                </span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => onNavigate("calendario")}
          className="w-full rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
        >
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: "#FBD9E5" }}
          >
            <CalendarDays size={20} style={{ color: "#C43A4A" }} />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold" style={{ color: "#3d2529" }}>
              Registrar meu ciclo
            </p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Toque para ir ao calendário
            </p>
          </div>
          <ChevronRight size={16} style={{ color: "#C56682" }} />
        </button>
      )}

      {/* Botão: Sintomas */}
      <button
        onClick={() => setSymptomOpen(true)}
        className="w-full rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform"
        style={{ backgroundColor: "#C43A4A" }}
      >
        <div className="p-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <Sparkles size={22} className="text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="font-bold text-sm text-white">Como estou hoje?</p>
          <p className="text-xs text-white opacity-80">
            Registre sintomas e humor
          </p>
        </div>
        <ChevronRight size={16} className="text-white opacity-70" />
      </button>

      {/* Conteúdo em Destaque */}
      {destaques && destaques.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm" style={{ color: "#3d2529" }}>
              ✨ Conteúdo em Destaque
            </h2>
            <button
              onClick={() => onNavigate("conteudos")}
              className="text-xs font-medium"
              style={{ color: "#C56682" }}
            >
              Ver todos
            </button>
          </div>

          <button
            onClick={() => navigate(`/conteudos/${destaques[destaqueIdx].id}`)}
            className="w-full text-left rounded-2xl p-4 shadow-sm"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #FBD9E5",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "#FBD9E5", color: "#C43A4A" }}
              >
                {destaques[destaqueIdx].categoriaNome}
              </span>
              {destaques[destaqueIdx].tempoLeituraMin && (
                <span className="text-xs flex items-center gap-1" style={{ color: "#9ca3af" }}>
                  <Clock size={11} />
                  {destaques[destaqueIdx].tempoLeituraMin} min
                </span>
              )}
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: "#3d2529" }}>
              {destaques[destaqueIdx].titulo}
            </p>
            {destaques[destaqueIdx].subtitulo && (
              <p className="text-xs line-clamp-2" style={{ color: "#6b5a5e" }}>
                {destaques[destaqueIdx].subtitulo}
              </p>
            )}
            <p className="text-xs mt-2 font-semibold" style={{ color: "#C43A4A" }}>
              Ler mais →
            </p>
          </button>

          {/* Dots */}
          {destaques.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {destaques.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === destaqueIdx ? "20px" : "6px",
                    height: "6px",
                    backgroundColor: i === destaqueIdx ? "#C43A4A" : "#FBD9E5",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dica do dia */}
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Heart size={14} style={{ color: "#C43A4A" }} />
          <span className="text-xs font-bold" style={{ color: "#C43A4A" }}>
            Dica de Saúde do Dia
          </span>
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: "#3d2529" }}>
          {dica.icon} {dica.titulo}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#6b5a5e" }}>
          {dica.texto}
        </p>
      </div>

      {/* Tags de busca rápida */}
      <div>
        <p className="text-xs font-bold mb-2" style={{ color: "#C56682" }}>
          Busca rápida
        </p>
        <div className="flex flex-wrap gap-2">
          {["saúde", "SUS", "prevenção", "hormônios", "bem-estar", "ciclo"].map((tag) => (
            <button
              key={tag}
              onClick={() => onNavigate("conteudos")}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-opacity active:opacity-70"
              style={{
                backgroundColor: "#FBD9E5",
                color: "#C43A4A",
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Acesso rápido */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("conteudos")}
          className="rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm"
          style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
        >
          <div className="p-2 rounded-xl" style={{ backgroundColor: "#FBD9E5" }}>
            <BookOpen size={20} style={{ color: "#C43A4A" }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "#3d2529" }}>
            Conteúdos
          </span>
        </button>
        <button
          onClick={() => setSymptomOpen(true)}
          className="rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm"
          style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
        >
          <div className="p-2 rounded-xl" style={{ backgroundColor: "#FBD9E5" }}>
            <Stethoscope size={20} style={{ color: "#C43A4A" }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "#3d2529" }}>
            Sintomas
          </span>
        </button>
      </div>

      {/* Aviso legal */}
      <p className="text-center text-xs py-2" style={{ color: "#9ca3af" }}>
        ⚠️ As informações deste app não substituem avaliação médica.
        <br />
        Procure sempre a UBS para acompanhamento.
      </p>

      <SymptomForm open={symptomOpen} onClose={() => setSymptomOpen(false)} />
    </div>
  );
};

export default HomePage;
