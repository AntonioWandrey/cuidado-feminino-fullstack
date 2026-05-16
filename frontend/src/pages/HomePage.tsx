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
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#C56682]">{greeting()} 💕</p>
          <h1 className="text-2xl font-bold mt-0.5 text-[#3d2529]">MS Feminina</h1>
        </div>
        <button className="p-2 rounded-full bg-[#FBD9E5]">
          <Bell size={20} className="text-[#C43A4A]" />
        </button>
      </div>

      {/* Card: Próxima Menstruação */}
      <div className="rounded-2xl p-5 text-white shadow-md bg-gradient-to-br from-[#C43A4A] to-[#a02d3a]">
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={18} className="opacity-80" />
          <span className="text-sm font-semibold opacity-90">Próxima Menstruação</span>
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
                Confiança:{" "}
                {previsao.confianca === "ALTA"
                  ? "Alta"
                  : previsao.confianca === "MEDIA"
                  ? "Média"
                  : "Baixa"}
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
      {ciclos && ciclos.length > 0 ? (
        <div className="rounded-2xl p-4 grid grid-cols-2 gap-3 shadow-sm bg-white border border-[#FBD9E5]">
          <div className="text-center p-3 rounded-xl bg-[#FBF4EB]">
            <p className="text-2xl font-bold text-[#C43A4A]">{ciclos.length}</p>
            <p className="text-xs mt-0.5 text-[#C56682]">ciclos registrados</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-[#FBF4EB]">
            <p className="text-2xl font-bold text-[#C43A4A]">
              {previsao ? Math.round(previsao.mediaDuracaoCiclo) : "—"}
            </p>
            <p className="text-xs mt-0.5 text-[#C56682]">dias (média)</p>
          </div>
          {ultimoCiclo && (
            <div className="col-span-2 pt-2 border-t border-[#FBD9E5]">
              <p className="text-xs text-center text-gray-400">
                Último período:{" "}
                <span className="text-[#C56682] font-semibold">
                  {format(parseISO(ultimoCiclo.dataInicio), "dd/MM/yyyy")}
                </span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => onNavigate("calendario")}
          className="w-full rounded-2xl p-4 flex items-center gap-3 shadow-sm bg-white border border-[#FBD9E5]"
        >
          <div className="p-2 rounded-xl bg-[#FBD9E5]">
            <CalendarDays size={20} className="text-[#C43A4A]" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-[#3d2529]">Registrar meu ciclo</p>
            <p className="text-xs text-gray-400">Toque para ir ao calendário</p>
          </div>
          <ChevronRight size={16} className="text-[#C56682]" />
        </button>
      )}

      {/* Botão: Sintomas */}
      <button
        onClick={() => setSymptomOpen(true)}
        className="w-full rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform bg-[#C43A4A]"
      >
        <div className="p-2 rounded-xl bg-white/20">
          <Sparkles size={22} className="text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="font-bold text-sm text-white">Como estou hoje?</p>
          <p className="text-xs text-white opacity-80">Registre sintomas e humor</p>
        </div>
        <ChevronRight size={16} className="text-white opacity-70" />
      </button>

      {/* Conteúdo em Destaque */}
      {destaques && destaques.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-[#3d2529]">✨ Conteúdo em Destaque</h2>
            <button
              onClick={() => onNavigate("conteudos")}
              className="text-xs font-medium text-[#C56682]"
            >
              Ver todos
            </button>
          </div>

          <button
            onClick={() => navigate(`/conteudos/${destaques[destaqueIdx].id}`)}
            className="w-full text-left rounded-2xl p-4 shadow-sm bg-white border border-[#FBD9E5]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#FBD9E5] text-[#C43A4A]">
                {destaques[destaqueIdx].categoriaNome}
              </span>
              {destaques[destaqueIdx].tempoLeituraMin && (
                <span className="text-xs flex items-center gap-1 text-gray-400">
                  <Clock size={11} />
                  {destaques[destaqueIdx].tempoLeituraMin} min
                </span>
              )}
            </div>
            <p className="font-bold text-sm mb-1 text-[#3d2529]">
              {destaques[destaqueIdx].titulo}
            </p>
            {destaques[destaqueIdx].subtitulo && (
              <p className="text-xs line-clamp-2 text-[#6b5a5e]">
                {destaques[destaqueIdx].subtitulo}
              </p>
            )}
            <p className="text-xs mt-2 font-semibold text-[#C43A4A]">Ler mais →</p>
          </button>

          {destaques.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {destaques.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 h-1.5 ${
                    i === destaqueIdx
                      ? "w-5 bg-[#C43A4A]"
                      : "w-1.5 bg-[#FBD9E5]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dica do dia */}
      <div className="rounded-2xl p-4 shadow-sm bg-white border border-[#FBD9E5]">
        <div className="flex items-center gap-2 mb-2">
          <Heart size={14} className="text-[#C43A4A]" />
          <span className="text-xs font-bold text-[#C43A4A]">Dica de Saúde do Dia</span>
        </div>
        <p className="text-sm font-semibold mb-1 text-[#3d2529]">
          {dica.icon} {dica.titulo}
        </p>
        <p className="text-xs leading-relaxed text-[#6b5a5e]">{dica.texto}</p>
      </div>

      {/* Tags de busca rápida */}
      <div>
        <p className="text-xs font-bold mb-2 text-[#C56682]">Busca rápida</p>
        <div className="flex flex-wrap gap-2">
          {["saúde", "SUS", "prevenção", "hormônios", "bem-estar", "ciclo"].map((tag) => (
            <button
              key={tag}
              onClick={() => onNavigate("conteudos")}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-opacity active:opacity-70 bg-[#FBD9E5] text-[#C43A4A]"
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
          className="rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm bg-white border border-[#FBD9E5]"
        >
          <div className="p-2 rounded-xl bg-[#FBD9E5]">
            <BookOpen size={20} className="text-[#C43A4A]" />
          </div>
          <span className="text-xs font-semibold text-[#3d2529]">Conteúdos</span>
        </button>
        <button
          onClick={() => setSymptomOpen(true)}
          className="rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm bg-white border border-[#FBD9E5]"
        >
          <div className="p-2 rounded-xl bg-[#FBD9E5]">
            <Stethoscope size={20} className="text-[#C43A4A]" />
          </div>
          <span className="text-xs font-semibold text-[#3d2529]">Sintomas</span>
        </button>
      </div>

      <p className="text-center text-xs py-2 text-gray-400">
        ⚠️ As informações deste app não substituem avaliação médica.
        <br />
        Procure sempre a UBS para acompanhamento.
      </p>

      <SymptomForm open={symptomOpen} onClose={() => setSymptomOpen(false)} />
    </div>
  );
};

export default HomePage;
