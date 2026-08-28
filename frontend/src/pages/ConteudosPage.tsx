import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Clock, Search, X } from "lucide-react";

import { getCategorias } from "@/services/categoriaService";
import { buscarConteudos, getConteudos } from "@/services/conteudoService";
import { isSafeImageUrl } from "@/lib/richText";
import type { ConteudoEducativo } from "@/types";

const TAGS_POPULARES = [
  "saúde", "SUS", "prevenção", "hormônios", "bem-estar", "autocuidado", "ciclo", "consultas",
];

const DEMO_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: true,
  refetchInterval: 5_000,
  retry: false,
};

const ConteudoCard = ({ conteudo, onClick }: { conteudo: ConteudoEducativo; onClick: () => void }) => {
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = Boolean(
    conteudo.imagemCapaUrl && isSafeImageUrl(conteudo.imagemCapaUrl) && !coverFailed,
  );

  return (
    <button type="button" onClick={onClick} className="w-full overflow-hidden rounded-xl border border-stone-200 bg-white text-left shadow-sm transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary">
      {showCover ? (
        <img src={conteudo.imagemCapaUrl as string} alt={`Capa do artigo ${conteudo.titulo}`} loading="lazy" onError={() => setCoverFailed(true)} className="aspect-[16/7] w-full object-cover" />
      ) : (
        <div className="grid aspect-[16/5] w-full place-items-center bg-editorial-soft" aria-hidden="true"><BookOpen className="text-editorial-primary" size={24} /></div>
      )}
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-editorial-soft px-2 py-0.5 text-xs font-semibold text-editorial-primary">{conteudo.categoriaNome}</span>
            {conteudo.tempoLeituraMin && <span className="flex items-center gap-1 text-xs text-editorial-muted"><Clock size={12} aria-hidden="true" />{conteudo.tempoLeituraMin} min</span>}
            {conteudo.destaque && <span className="rounded-full bg-editorial-accent px-2 py-0.5 text-[0.7rem] font-semibold text-editorial-text">Destaque</span>}
          </div>
          <p className="font-bold text-editorial-text">{conteudo.titulo}</p>
          {conteudo.subtitulo && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-editorial-muted">{conteudo.subtitulo}</p>}
        </div>
        <ChevronRight size={18} className="mt-1 shrink-0 text-editorial-primary" aria-hidden="true" />
      </div>
    </button>
  );
};

const ConteudosPage = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [debouncedBusca, setDebouncedBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusca(busca.trim()), 500);
    return () => clearTimeout(timer);
  }, [busca]);

  const categoriasQuery = useQuery({ queryKey: ["categorias"], queryFn: getCategorias, retry: 1 });
  const searchQuery = useQuery({
    queryKey: ["conteudos-busca", debouncedBusca],
    queryFn: () => buscarConteudos(debouncedBusca),
    enabled: debouncedBusca.length >= 2,
    ...DEMO_QUERY_OPTIONS,
  });
  const listQuery = useQuery({
    queryKey: ["conteudos", categoriaAtiva],
    queryFn: () => getConteudos(categoriaAtiva ? { categoriaId: categoriaAtiva } : undefined),
    enabled: debouncedBusca.length < 2,
    ...DEMO_QUERY_OPTIONS,
  });

  const activeQuery = debouncedBusca.length >= 2 ? searchQuery : listQuery;
  const conteudos = activeQuery.data ?? [];
  const handleTagClick = useCallback((tag: string) => setBusca(tag), []);

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold text-editorial-text">Conteúdos</h1><p className="mt-0.5 text-sm text-editorial-primary">Informações de saúde baseadas em evidências</p></div>

      <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-editorial-primary">
        <Search size={16} className="text-editorial-primary" aria-hidden="true" />
        <input type="search" aria-label="Buscar conteúdo" placeholder="Buscar conteúdo..." value={busca} onChange={(event) => setBusca(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-editorial-text outline-none placeholder:text-stone-400" />
        {busca && <button type="button" aria-label="Limpar busca" onClick={() => setBusca("")} className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary"><X size={16} className="text-editorial-muted" /></button>}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TAGS_POPULARES.map((tag) => <button type="button" key={tag} onClick={() => handleTagClick(tag)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary ${busca === tag ? "bg-editorial-primary text-white" : "bg-editorial-soft text-editorial-primary"}`}>#{tag}</button>)}
      </div>

      {categoriasQuery.data && categoriasQuery.data.length > 0 && debouncedBusca.length < 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por categoria">
          <button type="button" onClick={() => setCategoriaAtiva(null)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${!categoriaAtiva ? "bg-editorial-primary text-white" : "border border-stone-200 bg-white text-editorial-muted"}`}>Todas</button>
          {categoriasQuery.data.filter((category) => category.ativo).map((category) => <button type="button" key={category.id} onClick={() => setCategoriaAtiva(category.id === categoriaAtiva ? null : category.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${categoriaAtiva === category.id ? "bg-editorial-primary text-white" : "border border-stone-200 bg-white text-editorial-muted"}`}>{category.nome}</button>)}
        </div>
      )}

      {activeQuery.isPending ? (
        <div className="space-y-3" role="status" aria-label="Carregando conteúdos">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl bg-editorial-soft" />)}</div>
      ) : activeQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center"><p className="font-semibold text-editorial-error">Não foi possível carregar os conteúdos.</p><p className="mt-1 text-sm text-editorial-muted">Verifique a conexão com o servidor.</p><button type="button" className="mt-4 rounded-lg bg-editorial-primary px-4 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary" onClick={() => activeQuery.refetch()}>Tentar novamente</button></div>
      ) : conteudos.length === 0 ? (
        <div className="py-10 text-center"><BookOpen size={40} className="mx-auto mb-3 text-editorial-accent" aria-hidden="true" /><p className="text-sm font-semibold text-editorial-primary">Nenhum conteúdo encontrado</p><p className="mt-1 text-xs text-editorial-muted">Tente outro termo ou categoria</p></div>
      ) : (
        <div className="space-y-3">{conteudos.map((conteudo) => <ConteudoCard key={conteudo.id} conteudo={conteudo} onClick={() => navigate(`/conteudos/${conteudo.id}`)} />)}</div>
      )}

      <p className="py-3 text-center text-xs text-editorial-muted">⚠️ Essas informações não substituem avaliação médica.<br />Procure sempre a UBS para confirmação e acompanhamento.</p>
    </div>
  );
};

export default ConteudosPage;
