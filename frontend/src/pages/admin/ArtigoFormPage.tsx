import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ConteudoRico } from "@/components/content/ConteudoRico";
import {
  createConteudo,
  getConteudoAdmin,
  updateConteudo,
} from "@/services/adminConteudoService";
import { getCategorias } from "@/services/categoriaService";
import {
  areSafeReferenceUrls,
  isSafeImageUrl,
  isSemanticallyEmptyHtml,
  normalizeArticleHtml,
} from "@/lib/richText";
import type { ConteudoEducativoRequest, PerfilAlvo } from "@/types";

interface FormState {
  categoriaId: string;
  titulo: string;
  subtitulo: string;
  corpo: string;
  palavrasChave: string;
  tempoLeituraMin: string;
  fonteReferencia: string;
  imagemCapaUrl: string;
  ativo: boolean;
  destaque: boolean;
  perfilAlvo: PerfilAlvo;
}

type FormErrors = Partial<Record<keyof FormState | "submit", string>>;

const initialForm: FormState = {
  categoriaId: "",
  titulo: "",
  subtitulo: "",
  corpo: "",
  palavrasChave: "",
  tempoLeituraMin: "",
  fonteReferencia: "",
  imagemCapaUrl: "",
  ativo: false,
  destaque: false,
  perfilAlvo: "TODAS",
};

const inputClass = "mt-1 block min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-editorial-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary";

const ArtigoFormPage = () => {
  const { id } = useParams();
  const articleId = id ? Number(id) : null;
  const isEditing = Number.isFinite(articleId) && articleId !== null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submissionLock = useRef(false);
  const hydratedArticle = useRef<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const categoriesQuery = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
  const articleQuery = useQuery({
    queryKey: ["admin-conteudo", articleId],
    queryFn: () => getConteudoAdmin(articleId as number),
    enabled: isEditing,
    staleTime: 0,
  });

  useEffect(() => {
    const article = articleQuery.data;
    if (!article || hydratedArticle.current === article.id) return;
    hydratedArticle.current = article.id;
    setForm({
      categoriaId: String(article.categoriaId),
      titulo: article.titulo,
      subtitulo: article.subtitulo ?? "",
      corpo: normalizeArticleHtml(article.corpo),
      palavrasChave: article.palavrasChave ?? "",
      tempoLeituraMin: article.tempoLeituraMin?.toString() ?? "",
      fonteReferencia: article.fonteReferencia ?? "",
      imagemCapaUrl: article.imagemCapaUrl ?? "",
      ativo: article.ativo,
      destaque: article.destaque,
      perfilAlvo: article.perfilAlvo,
    });
  }, [articleQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: ConteudoEducativoRequest) =>
      isEditing
        ? updateConteudo(articleId as number, payload)
        : createConteudo(payload),
  });

  const setField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.titulo.trim()) nextErrors.titulo = "Título é obrigatório.";
    if (!form.categoriaId) nextErrors.categoriaId = "Categoria é obrigatória.";
    if (isSemanticallyEmptyHtml(form.corpo)) nextErrors.corpo = "Conteúdo é obrigatório.";
    if (form.tempoLeituraMin && Number(form.tempoLeituraMin) < 1) nextErrors.tempoLeituraMin = "Informe pelo menos 1 minuto.";
    if (form.imagemCapaUrl && !isSafeImageUrl(form.imagemCapaUrl)) {
      nextErrors.imagemCapaUrl = "A capa deve usar uma URL HTTPS válida e não pode ser SVG.";
    }
    if (!areSafeReferenceUrls(form.fonteReferencia)) {
      nextErrors.fonteReferencia = "Use somente URLs HTTPS válidas, separadas por |.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submissionLock.current || !validate()) return;
    submissionLock.current = true;

    const payload: ConteudoEducativoRequest = {
      categoriaId: Number(form.categoriaId),
      titulo: form.titulo.trim(),
      subtitulo: form.subtitulo.trim() || null,
      corpo: form.corpo,
      palavrasChave: form.palavrasChave.trim() || null,
      tempoLeituraMin: form.tempoLeituraMin ? Number(form.tempoLeituraMin) : null,
      fonteReferencia: form.fonteReferencia.trim() || null,
      imagemCapaUrl: form.imagemCapaUrl.trim() || null,
      ativo: form.ativo,
      destaque: form.destaque,
      perfilAlvo: form.perfilAlvo,
    };

    try {
      await saveMutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: ["admin-conteudos"] });
      toast.success(isEditing ? "Artigo atualizado." : "Artigo criado.");
      navigate("/gestao/artigos");
    } catch {
      setErrors((current) => ({ ...current, submit: "Não foi possível salvar o artigo. Tente novamente." }));
    } finally {
      submissionLock.current = false;
    }
  };

  if (isEditing && articleQuery.isPending) {
    return <main className="grid min-h-screen place-items-center bg-editorial-background"><p role="status">Carregando artigo...</p></main>;
  }

  if (isEditing && articleQuery.isError) {
    return <main className="grid min-h-screen place-items-center bg-editorial-background p-4"><div className="text-center"><p className="text-editorial-error">Não foi possível carregar o artigo.</p><Link className="mt-4 inline-block font-semibold text-editorial-primary underline" to="/gestao/artigos">Voltar à gestão</Link></div></main>;
  }

  return (
    <main className="min-h-screen bg-editorial-background px-4 py-8 text-editorial-text sm:px-6">
      <form className="mx-auto max-w-7xl" onSubmit={handleSubmit} noValidate>
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/gestao/artigos" className="text-sm font-semibold text-editorial-primary underline-offset-4 hover:underline">← Gestão de artigos</Link>
            <h1 className="mt-3 text-3xl font-bold">{isEditing ? "Editar artigo" : "Novo artigo"}</h1>
            <p className="mt-2 text-editorial-muted">Organize os metadados, escreva o conteúdo e confira a prévia antes de salvar.</p>
          </div>
          <button type="submit" disabled={saveMutation.isPending} className="min-h-11 rounded-lg bg-editorial-primary px-5 py-2.5 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary focus-visible:ring-offset-2 disabled:opacity-60">
            {saveMutation.isPending ? "Salvando..." : "Salvar artigo"}
          </button>
        </header>

        {errors.submit && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-editorial-error">{errors.submit}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
          <div className="space-y-6">
            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold">Metadados</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium">Título<input className={inputClass} value={form.titulo} onChange={(event) => setField("titulo", event.target.value)} aria-invalid={Boolean(errors.titulo)} />{errors.titulo && <span className="mt-1 block text-editorial-error">{errors.titulo}</span>}</label>
                <label className="text-sm font-medium">Categoria<select className={inputClass} value={form.categoriaId} onChange={(event) => setField("categoriaId", event.target.value)} aria-invalid={Boolean(errors.categoriaId)}><option value="">Selecione</option>{categoriesQuery.data?.filter((category) => category.ativo).map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select>{errors.categoriaId && <span className="mt-1 block text-editorial-error">{errors.categoriaId}</span>}</label>
                <label className="text-sm font-medium sm:col-span-2">Subtítulo<input className={inputClass} value={form.subtitulo} onChange={(event) => setField("subtitulo", event.target.value)} /></label>
                <label className="text-sm font-medium">Palavras-chave<input className={inputClass} value={form.palavrasChave} onChange={(event) => setField("palavrasChave", event.target.value)} /></label>
                <label className="text-sm font-medium">Tempo de leitura (minutos)<input type="number" min="1" className={inputClass} value={form.tempoLeituraMin} onChange={(event) => setField("tempoLeituraMin", event.target.value)} />{errors.tempoLeituraMin && <span className="mt-1 block text-editorial-error">{errors.tempoLeituraMin}</span>}</label>
                <label className="text-sm font-medium sm:col-span-2">Imagem de capa (URL HTTPS)<input type="url" className={inputClass} value={form.imagemCapaUrl} onChange={(event) => setField("imagemCapaUrl", event.target.value)} />{errors.imagemCapaUrl && <span className="mt-1 block text-editorial-error">{errors.imagemCapaUrl}</span>}</label>
                <label className="text-sm font-medium sm:col-span-2">Fontes de referência (URLs HTTPS separadas por |)<input type="text" className={inputClass} value={form.fonteReferencia} onChange={(event) => setField("fonteReferencia", event.target.value)} />{errors.fonteReferencia && <span className="mt-1 block text-editorial-error">{errors.fonteReferencia}</span>}</label>
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 text-xl font-bold">Conteúdo</h2>
              <RichTextEditor value={form.corpo} onChange={(html) => setField("corpo", html)} error={errors.corpo} />
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold">Publicação</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3"><input type="checkbox" checked={form.ativo} onChange={(event) => setField("ativo", event.target.checked)} className="h-5 w-5 accent-editorial-primary" />Publicar ao salvar</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={form.destaque} onChange={(event) => setField("destaque", event.target.checked)} className="h-5 w-5 accent-editorial-primary" />Exibir como destaque</label>
                <label className="text-sm font-medium sm:col-span-2">Perfil do público<select className={inputClass} value={form.perfilAlvo} onChange={(event) => setField("perfilAlvo", event.target.value as PerfilAlvo)}><option value="TODAS">Todas</option><option value="ADOLESCENTE">Adolescente</option><option value="TENTANTE">Tentante</option><option value="GESTANTE">Gestante</option><option value="MENOPAUSA">Menopausa</option></select></label>
              </div>
            </section>
          </div>

          <aside className="self-start rounded-xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold">Prévia do artigo</h2>
            {form.imagemCapaUrl && isSafeImageUrl(form.imagemCapaUrl) && <img src={form.imagemCapaUrl} alt={`Capa de ${form.titulo || "artigo"}`} className="mt-5 aspect-video w-full rounded-lg object-cover" />}
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-editorial-primary">{categoriesQuery.data?.find((category) => String(category.id) === form.categoriaId)?.nome ?? "Categoria"}</p>
            <h3 className="mt-2 text-2xl font-bold">{form.titulo || "Título do artigo"}</h3>
            {form.subtitulo && <p className="mt-2 text-editorial-muted">{form.subtitulo}</p>}
            <div className="mt-5 border-t border-stone-200 pt-5"><ConteudoRico html={form.corpo || "A prévia do conteúdo aparecerá aqui."} /></div>
          </aside>
        </div>
      </form>
    </main>
  );
};

export default ArtigoFormPage;
