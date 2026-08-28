import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
  deleteConteudo,
  getConteudosAdmin,
  setConteudoPublicado,
} from "@/services/adminConteudoService";
import type { ConteudoEducativo } from "@/types";

const formatDate = (value: string | null) => {
  if (!value) return "Sem atualização";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Sem atualização"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
};

const Status = ({ ativo }: { ativo: boolean }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ativo ? "bg-emerald-50 text-editorial-success" : "bg-stone-100 text-editorial-muted"}`}>
    {ativo ? "Publicado" : "Rascunho"}
  </span>
);

const GestaoArtigosPage = () => {
  const queryClient = useQueryClient();
  const [articleToDelete, setArticleToDelete] = useState<ConteudoEducativo | null>(null);
  const [feedback, setFeedback] = useState("");
  const [actionError, setActionError] = useState("");
  const articlesQuery = useQuery({
    queryKey: ["admin-conteudos"],
    queryFn: getConteudosAdmin,
    staleTime: 0,
  });

  const publicationMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) =>
      setConteudoPublicado(id, ativo),
    onMutate: () => {
      setFeedback("");
      setActionError("");
    },
    onSuccess: async (_, variables) => {
      setFeedback(variables.ativo ? "Artigo publicado." : "Artigo despublicado.");
      await queryClient.invalidateQueries({ queryKey: ["admin-conteudos"] });
    },
    onError: () => setActionError("Não foi possível alterar a publicação."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteConteudo(id),
    onMutate: () => {
      setFeedback("");
      setActionError("");
    },
    onSuccess: async () => {
      setFeedback("Artigo excluído.");
      setArticleToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-conteudos"] });
    },
    onError: () => setActionError("Não foi possível excluir o artigo."),
  });

  const articles = articlesQuery.data ?? [];
  const mutationPending = publicationMutation.isPending || deleteMutation.isPending;

  const Actions = ({ article }: { article: ConteudoEducativo }) => (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/gestao/artigos/${article.id}/editar`}
        className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-editorial-text hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary"
      >
        Editar
      </Link>
      <button
        type="button"
        aria-label={`${article.ativo ? "Despublicar" : "Publicar"} ${article.titulo}`}
        disabled={mutationPending}
        onClick={() => publicationMutation.mutate({ id: article.id, ativo: !article.ativo })}
        className="rounded-md border border-editorial-primary px-3 py-2 text-sm font-semibold text-editorial-primary hover:bg-editorial-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary disabled:opacity-60"
      >
        {article.ativo ? "Despublicar" : "Publicar"}
      </button>
      <button
        type="button"
        aria-label={`Excluir ${article.titulo}`}
        disabled={mutationPending}
        onClick={() => setArticleToDelete(article)}
        className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-editorial-error hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-error disabled:opacity-60"
      >
        Excluir
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-editorial-background px-4 py-8 text-editorial-text sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-editorial-primary">Conteúdo educativo</p>
            <h1 className="mt-1 text-3xl font-bold">Gestão de artigos</h1>
            <p className="mt-2 max-w-2xl text-editorial-muted">Crie, revise e publique conteúdos consumidos pelo aplicativo.</p>
          </div>
          <Link
            to="/gestao/artigos/novo"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-editorial-primary px-5 py-2.5 font-semibold text-white hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary focus-visible:ring-offset-2"
          >
            Novo artigo
          </Link>
        </header>

        {feedback && <p role="status" className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-editorial-success">{feedback}</p>}
        {actionError && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-editorial-error">{actionError}</p>}

        <section className="mt-8 overflow-hidden rounded-xl border border-stone-200 bg-editorial-surface shadow-sm" aria-label="Artigos cadastrados">
          {articlesQuery.isPending && <p className="p-8 text-center text-editorial-muted" role="status">Carregando artigos...</p>}
          {articlesQuery.isError && (
            <div className="p-8 text-center">
              <p className="text-editorial-error">Não foi possível carregar os artigos.</p>
              <button type="button" className="mt-4 rounded-md bg-editorial-primary px-4 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary" onClick={() => articlesQuery.refetch()}>
                Tentar novamente
              </button>
            </div>
          )}
          {articlesQuery.isSuccess && articles.length === 0 && (
            <p className="p-8 text-center text-editorial-muted">Nenhum artigo cadastrado.</p>
          )}

          {articlesQuery.isSuccess && articles.length > 0 && (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-editorial-soft text-sm text-editorial-muted">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Artigo</th>
                      <th className="px-5 py-3 font-semibold">Categoria</th>
                      <th className="px-5 py-3 font-semibold">Estado</th>
                      <th className="px-5 py-3 font-semibold">Atualização</th>
                      <th className="px-5 py-3 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id} className="border-t border-stone-200 align-top">
                        <td className="px-5 py-4"><p className="font-semibold">{article.titulo}</p>{article.subtitulo && <p className="mt-1 text-sm text-editorial-muted">{article.subtitulo}</p>}</td>
                        <td className="px-5 py-4 text-sm">{article.categoriaNome}</td>
                        <td className="px-5 py-4"><Status ativo={article.ativo} /></td>
                        <td className="px-5 py-4 text-sm text-editorial-muted">{formatDate(article.atualizadoEm ?? article.criadoEm)}</td>
                        <td className="px-5 py-4"><Actions article={article} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-stone-200 md:hidden">
                {articles.map((article) => (
                  <article key={article.id} className="p-5">
                    <div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{article.titulo}</h2><Status ativo={article.ativo} /></div>
                    <p className="mt-2 text-sm text-editorial-muted">{article.categoriaNome} · {formatDate(article.atualizadoEm ?? article.criadoEm)}</p>
                    <div className="mt-4"><Actions article={article} /></div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {articleToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-label="Confirmar exclusão" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Excluir artigo?</h2>
            <p className="mt-3 text-editorial-muted">“{articleToDelete.titulo}” será removido do aplicativo. Esta ação exige confirmação.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" aria-label="Cancelar exclusão" className="rounded-md border border-stone-300 px-4 py-2 font-semibold" onClick={() => setArticleToDelete(null)}>Cancelar</button>
              <button type="button" aria-label="Confirmar exclusão" disabled={deleteMutation.isPending} className="rounded-md bg-editorial-error px-4 py-2 font-semibold text-white disabled:opacity-60" onClick={() => deleteMutation.mutate(articleToDelete.id)}>{deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default GestaoArtigosPage;
