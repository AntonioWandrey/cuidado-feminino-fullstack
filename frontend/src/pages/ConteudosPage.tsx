import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  ChevronRight,
  BookOpen,
  X,
} from "lucide-react";
import { getConteudos, buscarConteudos } from "@/services/conteudoService";
import { getCategorias } from "@/services/categoriaService";
import type { ConteudoEducativo } from "@/types";

const TAGS_POPULARES = [
  "saúde",
  "SUS",
  "prevenção",
  "hormônios",
  "bem-estar",
  "autocuidado",
  "ciclo",
  "consultas",
];

const MOCK_CONTEUDOS: ConteudoEducativo[] = [
  {
    id: 0,
    categoriaId: 1,
    categoriaNome: "Queixas Ginecológicas",
    titulo: "Corrimento Vaginal",
    subtitulo: "O que é normal, quando se preocupar e como cuidar",
    corpo: "Backend ainda iniciando... Inicie o servidor para ver os conteúdos reais.",
    palavrasChave: "corrimento,saúde,ginecologia",
    tempoLeituraMin: 4,
    fonteReferencia: null,
    imagemCapaUrl: null,
    ativo: true,
    destaque: false,
    perfilAlvo: "TODAS",
    criadoEm: new Date().toISOString(),
    atualizadoEm: null,
  },
  {
    id: 0,
    categoriaId: 2,
    categoriaNome: "Ciclo Menstrual",
    titulo: "Conheça Seu Ciclo Menstrual",
    subtitulo: "Fases do ciclo, o que é normal e como registrar",
    corpo: "Backend ainda iniciando...",
    palavrasChave: "ciclo,menstruação,fases",
    tempoLeituraMin: 5,
    fonteReferencia: null,
    imagemCapaUrl: null,
    ativo: true,
    destaque: true,
    perfilAlvo: "TODAS",
    criadoEm: new Date().toISOString(),
    atualizadoEm: null,
  },
];

const ConteudoCard = ({
  conteudo,
  onClick,
}: {
  conteudo: ConteudoEducativo;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-2xl p-4 shadow-sm flex gap-3 items-start active:scale-[0.98] transition-transform"
    style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
          style={{ backgroundColor: "#FBD9E5", color: "#C43A4A" }}
        >
          {conteudo.categoriaNome}
        </span>
        {conteudo.tempoLeituraMin && (
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: "#9ca3af" }}
          >
            <Clock size={11} />
            {conteudo.tempoLeituraMin} min
          </span>
        )}
        {conteudo.destaque && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: "#E7A48C", color: "#fff", fontSize: "10px" }}
          >
            ✨ Destaque
          </span>
        )}
      </div>
      <p className="font-bold text-sm mb-1" style={{ color: "#3d2529" }}>
        {conteudo.titulo}
      </p>
      {conteudo.subtitulo && (
        <p
          className="text-xs line-clamp-2 leading-relaxed"
          style={{ color: "#6b5a5e" }}
        >
          {conteudo.subtitulo}
        </p>
      )}
    </div>
    <ChevronRight
      size={18}
      className="flex-shrink-0 mt-1"
      style={{ color: "#C56682" }}
    />
  </button>
);

const ConteudosPage = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [debouncedBusca, setDebouncedBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<number | null>(null);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusca(busca), 500);
    return () => clearTimeout(timer);
  }, [busca]);

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
    retry: 1,
  });

  const { data: conteudosBusca, isLoading: loadingBusca } = useQuery({
    queryKey: ["conteudos-busca", debouncedBusca],
    queryFn: () => buscarConteudos(debouncedBusca),
    enabled: debouncedBusca.length >= 2,
    retry: 1,
  });

  const { data: conteudosFiltrados, isLoading: loadingFiltro } = useQuery({
    queryKey: ["conteudos", categoriaAtiva],
    queryFn: () =>
      getConteudos(categoriaAtiva ? { categoriaId: categoriaAtiva } : undefined),
    enabled: debouncedBusca.length < 2,
    retry: 1,
  });

  const conteudos =
    debouncedBusca.length >= 2
      ? conteudosBusca
      : conteudosFiltrados;

  const isLoading = debouncedBusca.length >= 2 ? loadingBusca : loadingFiltro;

  const handleTagClick = useCallback((tag: string) => {
    setBusca(tag);
  }, []);

  const handleConteudoClick = (conteudo: ConteudoEducativo) => {
    if (conteudo.id === 0) return;
    navigate(`/conteudos/${conteudo.id}`);
  };

  const lista = conteudos ?? (isLoading ? [] : MOCK_CONTEUDOS);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#3d2529" }}>
          Conteúdos
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#C56682" }}>
          Informações de saúde baseadas em evidências
        </p>
      </div>

      {/* Busca */}
      <div
        className="flex items-center gap-2 rounded-2xl px-4 py-3"
        style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
      >
        <Search size={16} style={{ color: "#C56682" }} />
        <input
          type="text"
          placeholder="Buscar conteúdo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          style={{ color: "#3d2529" }}
        />
        {busca && (
          <button onClick={() => setBusca("")}>
            <X size={16} style={{ color: "#9ca3af" }} />
          </button>
        )}
      </div>

      {/* Tags populares */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TAGS_POPULARES.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={{
              backgroundColor:
                busca === tag ? "#C43A4A" : "#FBD9E5",
              color: busca === tag ? "#fff" : "#C43A4A",
            }}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Categorias */}
      {categorias && categorias.length > 0 && debouncedBusca.length < 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setCategoriaAtiva(null)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium"
            style={{
              backgroundColor: !categoriaAtiva ? "#C43A4A" : "#fff",
              color: !categoriaAtiva ? "#fff" : "#6b5a5e",
              border: !categoriaAtiva ? "none" : "1px solid #FBD9E5",
            }}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setCategoriaAtiva(cat.id === categoriaAtiva ? null : cat.id)
              }
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                backgroundColor:
                  categoriaAtiva === cat.id ? "#C43A4A" : "#fff",
                color: categoriaAtiva === cat.id ? "#fff" : "#6b5a5e",
                border:
                  categoriaAtiva === cat.id ? "none" : "1px solid #FBD9E5",
                whiteSpace: "nowrap",
              }}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      )}

      {/* Lista de conteúdos */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-4 animate-pulse"
              style={{ backgroundColor: "#FBD9E5", height: "88px" }}
            />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen size={40} className="mx-auto mb-3" style={{ color: "#FBD9E5" }} />
          <p className="text-sm font-medium" style={{ color: "#C56682" }}>
            Nenhum conteúdo encontrado
          </p>
          <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
            Tente outro termo ou categoria
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((c, idx) => (
            <ConteudoCard
              key={c.id || idx}
              conteudo={c}
              onClick={() => handleConteudoClick(c)}
            />
          ))}
        </div>
      )}

      {/* Aviso legal */}
      <p className="text-center text-xs py-3" style={{ color: "#9ca3af" }}>
        ⚠️ Essas informações não substituem avaliação médica.
        <br />
        Procure sempre a UBS para confirmação e acompanhamento.
      </p>
    </div>
  );
};

export default ConteudosPage;
