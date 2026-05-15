import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { getConteudo } from "@/services/conteudoService";

const ConteudoDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: conteudo, isLoading, isError } = useQuery({
    queryKey: ["conteudo", id],
    queryFn: () => getConteudo(Number(id)),
    enabled: !!id,
  });

  const voltar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { state: { returnTab: "conteudos" } });
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen px-4 pt-6 pb-10"
        style={{ backgroundColor: "#FBF4EB" }}
      >
        <button
          onClick={voltar}
          className="flex items-center gap-2 mb-6 text-sm font-medium"
          style={{ color: "#C43A4A" }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="space-y-4 animate-pulse">
          <div className="h-5 w-32 rounded-full" style={{ backgroundColor: "#FBD9E5" }} />
          <div className="h-8 rounded-xl" style={{ backgroundColor: "#FBD9E5" }} />
          <div className="h-4 w-3/4 rounded-xl" style={{ backgroundColor: "#FBD9E5" }} />
          <div className="h-48 rounded-2xl" style={{ backgroundColor: "#FBD9E5" }} />
        </div>
      </div>
    );
  }

  if (isError || !conteudo) {
    return (
      <div
        className="min-h-screen px-4 pt-6 pb-10 flex flex-col"
        style={{ backgroundColor: "#FBF4EB" }}
      >
        <button
          onClick={voltar}
          className="flex items-center gap-2 mb-6 text-sm font-medium"
          style={{ color: "#C43A4A" }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <p className="text-4xl mb-4">😔</p>
          <p className="font-bold text-lg mb-2" style={{ color: "#3d2529" }}>
            Conteúdo não encontrado
          </p>
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            O conteúdo que você procura não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  const paragrafos = conteudo.corpo
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const isAvisoLegal = (p: string) =>
    p.startsWith("⚠️") || p.toLowerCase().includes("não substituem avaliação");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FBF4EB" }}>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-16">
        {/* Back */}
        <button
          onClick={voltar}
          className="flex items-center gap-2 mb-5 text-sm font-medium"
          style={{ color: "#C43A4A" }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: "#FBD9E5", color: "#C43A4A" }}
          >
            {conteudo.categoriaNome}
          </span>
          {conteudo.tempoLeituraMin && (
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: "#9ca3af" }}
            >
              <Clock size={12} />
              {conteudo.tempoLeituraMin} min de leitura
            </span>
          )}
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold mb-2 leading-tight" style={{ color: "#3d2529" }}>
          {conteudo.titulo}
        </h1>

        {conteudo.subtitulo && (
          <p className="text-base mb-5 leading-relaxed" style={{ color: "#C56682" }}>
            {conteudo.subtitulo}
          </p>
        )}

        <div
          className="border-t mb-5"
          style={{ borderColor: "#FBD9E5" }}
        />

        {/* Corpo */}
        <div className="space-y-4">
          {paragrafos.map((paragrafo, i) =>
            isAvisoLegal(paragrafo) ? (
              <div
                key={i}
                className="rounded-2xl p-4"
                style={{ backgroundColor: "#FBD9E5", border: "1px solid #C56682" }}
              >
                <p className="text-sm font-semibold leading-relaxed" style={{ color: "#C43A4A" }}>
                  {paragrafo}
                </p>
              </div>
            ) : (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{ color: "#3d2529" }}
              >
                {paragrafo}
              </p>
            )
          )}
        </div>

        {/* Fonte */}
        {conteudo.fonteReferencia && (
          <div
            className="mt-6 rounded-2xl p-4"
            style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
          >
            <p className="text-xs font-bold mb-2" style={{ color: "#C56682" }}>
              Referências
            </p>
            {conteudo.fonteReferencia.split("|").map((fonte, i) => (
              <p key={i} className="text-xs break-all" style={{ color: "#9ca3af" }}>
                <ExternalLink size={10} className="inline mr-1" />
                {fonte.trim()}
              </p>
            ))}
          </div>
        )}

        {/* Aviso legal final */}
        <div
          className="mt-6 rounded-2xl p-4 text-center"
          style={{ backgroundColor: "#FBD9E5" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#C43A4A" }}>
            ⚠️ Essas informações não substituem avaliação médica.
            <br />
            Procure sempre a UBS para confirmação e acompanhamento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConteudoDetalhePage;
