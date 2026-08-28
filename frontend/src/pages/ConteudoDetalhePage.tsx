import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { ConteudoRico } from "@/components/content/ConteudoRico";
import { isHttpsUrl, isSafeImageUrl } from "@/lib/richText";
import { getConteudo } from "@/services/conteudoService";

const ConteudoDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = Number(id);
  const conteudoQuery = useQuery({
    queryKey: ["conteudo", id],
    queryFn: () => getConteudo(numericId),
    enabled: Boolean(id && Number.isFinite(numericId)),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 5_000,
    retry: false,
  });

  const voltar = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/", { state: { returnTab: "conteudos" } });
  };

  const notFound =
    !Number.isFinite(numericId) ||
    (conteudoQuery.error as { response?: { status?: number } } | null)?.response?.status === 404;

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col bg-editorial-background px-4 pb-10 pt-6">
        <button type="button" onClick={voltar} className="mb-6 flex items-center gap-2 text-sm font-semibold text-editorial-primary"><ArrowLeft size={18} />Voltar</button>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><p className="mb-4 text-4xl" aria-hidden="true">😔</p><h1 className="mb-2 text-xl font-bold text-editorial-text">Conteúdo não encontrado</h1><p className="text-sm text-editorial-muted">O conteúdo que você procura não existe ou foi removido.</p></div>
      </main>
    );
  }

  if (conteudoQuery.isPending) {
    return (
      <main className="min-h-screen bg-editorial-background px-4 pb-10 pt-6">
        <button type="button" onClick={voltar} className="mb-6 flex items-center gap-2 text-sm font-semibold text-editorial-primary"><ArrowLeft size={18} />Voltar</button>
        <div className="space-y-4 animate-pulse" role="status" aria-label="Carregando conteúdo"><div className="h-5 w-32 rounded-full bg-editorial-soft" /><div className="h-8 rounded-xl bg-editorial-soft" /><div className="h-48 rounded-xl bg-editorial-soft" /></div>
      </main>
    );
  }

  if (conteudoQuery.isError && !conteudoQuery.data) {
    return (
      <main className="flex min-h-screen flex-col bg-editorial-background px-4 pb-10 pt-6">
        <button type="button" onClick={voltar} className="mb-6 flex items-center gap-2 text-sm font-semibold text-editorial-primary"><ArrowLeft size={18} />Voltar</button>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><p className="mb-4 text-4xl" aria-hidden="true">📡</p><h1 className="mb-2 text-xl font-bold text-editorial-text">Não foi possível carregar o conteúdo</h1><p className="text-sm text-editorial-muted">Verifique a conexão com o servidor e tente novamente.</p><button type="button" onClick={() => conteudoQuery.refetch()} className="mt-5 rounded-lg bg-editorial-primary px-4 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary">Tentar novamente</button></div>
      </main>
    );
  }

  if (!conteudoQuery.data) return null;

  const conteudo = conteudoQuery.data;
  const references = conteudo.fonteReferencia?.split("|").map((item) => item.trim()).filter(Boolean) ?? [];
  const safeCover = conteudo.imagemCapaUrl && isSafeImageUrl(conteudo.imagemCapaUrl);

  return (
    <main className="min-h-screen bg-editorial-background">
      <article className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <button type="button" onClick={voltar} className="mb-5 flex items-center gap-2 rounded text-sm font-semibold text-editorial-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary"><ArrowLeft size={18} />Voltar</button>
        {conteudoQuery.isError && <p role="alert" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Não foi possível atualizar agora. Exibindo a última versão carregada.</p>}
        {safeCover && <img src={conteudo.imagemCapaUrl as string} alt={`Capa do artigo ${conteudo.titulo}`} className="mb-6 aspect-video w-full rounded-xl object-cover shadow-sm" />}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-editorial-soft px-2.5 py-1 text-xs font-semibold text-editorial-primary">{conteudo.categoriaNome}</span>
          {conteudo.tempoLeituraMin && <span className="flex items-center gap-1 text-xs text-editorial-muted"><Clock size={12} />{conteudo.tempoLeituraMin} min de leitura</span>}
        </div>
        <h1 className="text-3xl font-bold leading-tight text-editorial-text sm:text-4xl">{conteudo.titulo}</h1>
        {conteudo.subtitulo && <p className="mt-3 text-lg leading-relaxed text-editorial-muted">{conteudo.subtitulo}</p>}
        <div className="my-6 border-t border-stone-200" />
        <ConteudoRico html={conteudo.corpo} />

        {references.length > 0 && (
          <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5" aria-labelledby="references-title">
            <h2 id="references-title" className="text-sm font-bold uppercase tracking-wide text-editorial-primary">Referências</h2>
            <ul className="mt-3 space-y-2">
              {references.map((reference) => (
                <li key={reference} className="break-all text-sm text-editorial-muted">
                  {isHttpsUrl(reference) ? <a href={reference} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 font-semibold text-editorial-primary underline underline-offset-2"><ExternalLink size={14} className="mt-0.5 shrink-0" />{reference}</a> : reference}
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="mt-8 rounded-xl bg-editorial-soft p-4 text-center"><p className="text-sm font-semibold text-editorial-primary">⚠️ Essas informações não substituem avaliação médica.<br />Procure sempre a UBS para confirmação e acompanhamento.</p></div>
      </article>
    </main>
  );
};

export default ConteudoDetalhePage;
