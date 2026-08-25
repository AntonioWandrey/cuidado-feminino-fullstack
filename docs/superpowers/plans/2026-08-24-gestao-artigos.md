# Gestão e Integração de Artigos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar gestão Web de artigos com Rich Text Editor, publicação, exclusão lógica e atualização segura do conteúdo no aplicativo.

**Architecture:** O React/Vite existente receberá rotas administrativas e um renderizador rico compartilhado com o aplicativo. O Spring Boot manterá consultas públicas somente para artigos ativos e exporá comandos em `/api/admin/conteudos`; HTML será sanitizado antes da persistência e novamente antes da renderização.

**Tech Stack:** Java 21, Spring Boot 4.0.4, Spring Data JPA, MySQL/Flyway, jsoup, React 18, TypeScript, React Query, Axios, Tiptap, DOMPurify, Vitest e Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-24-gestao-artigos-design.md`

## Global Constraints

- Usar a branch `feature/entrega-1-artigos` na worktree isolada.
- Não modificar nem incorporar o WIP presente no checkout original de `develop`.
- Armazenar apenas URLs HTTPS; não aceitar Base64, `data:`, SVG ou upload binário.
- Consultas públicas nunca retornam `ativo = false`, inclusive por ID.
- `DELETE` administrativo é exclusão lógica e retorna `204`.
- Somente embeds normalizados para `youtube-nocookie.com` podem ser renderizados.
- Sucesso visual somente após resposta válida da API; não criar fallback de sucesso para mutações.
- Centralizar o novo visual em tokens; não espalhar novos hexadecimais pelo JSX.
- Pausar antes de cada commit para confirmar nome e e-mail do autor responsável pelo bloco.
- Não expor `/api/admin/**` fora do ambiente local enquanto autenticação e autorização não forem implementadas.

---

## File Structure

### Backend

- `domain/service/SanitizadorConteudoService.java`: política única de HTML, URL, cor e YouTube.
- `application/dto/PublicacaoConteudoRequest.java`: comando validado de publicação.
- `infrastructure/controller/AdminConteudoController.java`: endpoints administrativos.
- `domain/service/ConteudoEducativoService.java`: comandos e consultas públicas/administrativas.
- `domain/repository/ConteudoEducativoRepository.java`: busca pública por ID ativo.
- `infrastructure/controller/ConteudoEducativoController.java`: somente consultas públicas.

### Frontend

- `types/index.ts`: contratos de escrita e publicação.
- `services/adminConteudoService.ts`: cliente da API administrativa.
- `lib/richText.ts`: extensões, validação de URLs e sanitização compartilhada.
- `components/content/ConteudoRico.tsx`: renderizador do aplicativo e preview.
- `components/admin/RichTextEditor.tsx`: editor Tiptap e toolbar.
- `pages/admin/GestaoArtigosPage.tsx`: listagem e ações.
- `pages/admin/ArtigoFormPage.tsx`: criação, edição, preview e publicação.
- `pages/ConteudosPage.tsx`: cards editoriais com capa e atualização.
- `pages/ConteudoDetalhePage.tsx`: capa, metadados e corpo rico.
- `App.tsx`: rotas da gestão.
- `index.css` e `tailwind.config.ts`: tokens e estilos editoriais.

---

### Task 1: Restaurar o baseline de testes do backend no Windows

**Files:**
- Modify: `backend/cuidado-feminino-api/mvnw.cmd:90-96`
- Test: `backend/cuidado-feminino-api/mvnw.cmd`

**Interfaces:**
- Consumes: `.mvn/wrapper/maven-wrapper.properties` com Maven 3.9.12.
- Produces: `mvnw.cmd -version` e `mvnw.cmd test` executáveis no Windows.

- [ ] **Step 1: Reproduzir a falha existente**

Run:

```powershell
cd backend/cuidado-feminino-api
.\mvnw.cmd -version
```

Expected: FAIL com `Não é possível indexar em uma matriz nula` em `Target[0]`.

- [ ] **Step 2: Corrigir a detecção de junction/symlink**

Substituir o acesso direto a `Target[0]` por uma verificação explícita:

```powershell
$mavenM2Item = Get-Item $MAVEN_M2_PATH
if ($null -eq $mavenM2Item.Target -or $mavenM2Item.Target.Count -eq 0) {
  $MAVEN_WRAPPER_DISTS = $MAVEN_M2_PATH + "/wrapper/dists"
} else {
  $MAVEN_WRAPPER_DISTS = $mavenM2Item.Target[0] + "/wrapper/dists"
}
```

- [ ] **Step 3: Verificar o wrapper**

Run: `.\mvnw.cmd -version`

Expected: Maven `3.9.12`, Java `21`, exit code `0`.

- [ ] **Step 4: Executar o teste baseline sem conectar ao banco do usuário**

Primeiro executar apenas compilação de testes:

```powershell
.\mvnw.cmd -DskipTests test
```

Expected: BUILD SUCCESS. Não executar `contextLoads` até existir perfil de teste isolado.

- [ ] **Step 5: Pausar antes do commit de infraestrutura**

Proposed commit:

```text
fix(build): corrigir wrapper Maven no Windows
```

Apresentar `mvnw.cmd`, resultado do wrapper e autoria antes de commitar.

---

### Task 2: Sanitizar conteúdo rico no backend

**Files:**
- Modify: `backend/cuidado-feminino-api/pom.xml:33-78`
- Create: `backend/cuidado-feminino-api/src/main/java/Cuidado/Feminino/API/domain/service/SanitizadorConteudoService.java`
- Modify: `backend/cuidado-feminino-api/src/main/java/Cuidado/Feminino/API/domain/service/ConteudoEducativoService.java:84-129`
- Create: `backend/cuidado-feminino-api/src/test/java/Cuidado/Feminino/API/domain/service/SanitizadorConteudoServiceTest.java`

**Interfaces:**
- Consumes: HTML produzido pelo Tiptap em `ConteudoEducativoRequest.corpo()`.
- Produces: `String sanitizar(String html)`; lança `IllegalArgumentException` quando o corpo fica semanticamente vazio.

- [ ] **Step 1: Adicionar jsoup ao POM**

Adicionar esta propriedade logo após `maven.compiler.release`:

```xml
<jsoup.version>1.21.2</jsoup.version>
```

Adicionar esta dependência após `spring-boot-starter-webmvc`:

```xml
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>${jsoup.version}</version>
</dependency>
```

- [ ] **Step 2: Escrever testes que falham para a política HTML**

Criar testes JUnit para:

```java
@Test
void deveRemoverScriptEventosEProtocolosPerigosos() {
    String html = "<p>Texto</p><script>alert(1)</script>"
            + "<img src='javascript:alert(1)' onerror='alert(2)'>";

    String seguro = sanitizador.sanitizar(html);

    assertThat(seguro).contains("<p>Texto</p>");
    assertThat(seguro).doesNotContain("script", "javascript:", "onerror");
}

@Test
void devePreservarFormatacaoImagemHttpsECorPermitida() {
    String html = "<h2>Título</h2><p><strong>Importante</strong> "
            + "<span style='color: #8F344D'>vinho</span></p>"
            + "<img src='https://images.example.org/capa.jpg' alt='Capa'>";

    String seguro = sanitizador.sanitizar(html);

    assertThat(seguro).contains("<h2>Título</h2>", "<strong>Importante</strong>");
    assertThat(seguro).contains("color: #8F344D", "https://images.example.org/capa.jpg");
}

@Test
void deveAceitarSomenteYoutubeNoCookie() {
    String html = "<iframe src='https://evil.example/video'></iframe>"
            + "<iframe src='https://www.youtube-nocookie.com/embed/abc123'></iframe>";

    String seguro = sanitizador.sanitizar(html);

    assertThat(seguro).doesNotContain("evil.example");
    assertThat(seguro).contains("youtube-nocookie.com/embed/abc123");
}

@Test
void deveRejeitarCorpoVisualmenteVazio() {
    assertThatThrownBy(() -> sanitizador.sanitizar("<p><br></p>"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Corpo do conteúdo é obrigatório");
}
```

- [ ] **Step 3: Executar os testes para comprovar falha**

Run:

```powershell
.\mvnw.cmd -Dtest=SanitizadorConteudoServiceTest test
```

Expected: FAIL porque a classe ainda não existe.

- [ ] **Step 4: Implementar a política mínima**

Implementar `SanitizadorConteudoService` com `Safelist`, `Jsoup.clean` e pós-validação do DOM:

```java
@Service
public class SanitizadorConteudoService {
    private static final Set<String> CORES = Set.of(
            "#34282B", "#746469", "#8F344D", "#D78F79", "#287A5A", "#B4233A");
    private static final Pattern ESTILO_COR = Pattern.compile(
            "(?i)^\\s*color\\s*:\\s*(#[0-9a-f]{6})\\s*;?\\s*$");
    private static final Pattern YOUTUBE_PATH = Pattern.compile("^/embed/[A-Za-z0-9_-]{6,}$");

    private final Safelist safelist = new Safelist()
            .addTags("p", "h2", "h3", "strong", "em", "u", "ul", "ol", "li",
                    "blockquote", "br", "hr", "a", "img", "span", "iframe")
            .addAttributes("a", "href", "title", "target", "rel")
            .addAttributes("img", "src", "alt", "title", "loading")
            .addAttributes("span", "style")
            .addAttributes("iframe", "src", "title", "width", "height", "loading",
                    "allow", "allowfullscreen", "frameborder")
            .addProtocols("a", "href", "https")
            .addProtocols("img", "src", "https")
            .addProtocols("iframe", "src", "https");

    public String sanitizar(String html) {
        if (!StringUtils.hasText(html)) {
            throw new IllegalArgumentException("Corpo do conteúdo é obrigatório");
        }

        String limpo = Jsoup.clean(html, "", safelist,
                new Document.OutputSettings().prettyPrint(false));
        Document document = Jsoup.parseBodyFragment(limpo);

        document.select("span[style]").forEach(span -> {
            Matcher matcher = ESTILO_COR.matcher(span.attr("style"));
            if (!matcher.matches()) {
                span.removeAttr("style");
                return;
            }
            String cor = matcher.group(1).toUpperCase(Locale.ROOT);
            if (CORES.contains(cor)) {
                span.attr("style", "color: " + cor);
            } else {
                span.removeAttr("style");
            }
        });

        document.select("iframe[src]").forEach(iframe -> {
            try {
                URI uri = URI.create(iframe.attr("src"));
                boolean permitido = "https".equalsIgnoreCase(uri.getScheme())
                        && "www.youtube-nocookie.com".equalsIgnoreCase(uri.getHost())
                        && YOUTUBE_PATH.matcher(uri.getPath()).matches();
                if (!permitido) iframe.remove();
            } catch (IllegalArgumentException ex) {
                iframe.remove();
            }
        });

        document.select("a[href]").forEach(link ->
                link.attr("target", "_blank").attr("rel", "noopener noreferrer"));
        document.select("img[src]").forEach(image -> image.attr("loading", "lazy"));

        boolean possuiMidia = !document.select("img[src], iframe[src]").isEmpty();
        if (!StringUtils.hasText(document.text()) && !possuiMidia) {
            throw new IllegalArgumentException("Corpo do conteúdo é obrigatório");
        }
        return document.body().html();
    }
}
```

A implementação deve permitir apenas as tags e atributos listados na especificação e usar `https` em `a[href]`, `img[src]` e `iframe[src]`.

- [ ] **Step 5: Aplicar sanitização em criação e atualização**

Em `ConteudoEducativoService`, injetar o sanitizador e substituir:

```java
.corpo(request.corpo())
```

por:

```java
.corpo(sanitizadorConteudoService.sanitizar(request.corpo()))
```

Na atualização usar a mesma chamada antes de modificar a entidade.

- [ ] **Step 6: Executar testes e compilação**

Run:

```powershell
.\mvnw.cmd -Dtest=SanitizadorConteudoServiceTest test
.\mvnw.cmd -DskipTests package
```

Expected: todos passam.

- [ ] **Step 7: Pausar antes do commit de sanitização**

Proposed commit:

```text
feat(articles): sanitizar conteúdo rico no backend
```

---

### Task 3: Expor CRUD administrativo e proteger consultas públicas

**Files:**
- Modify: `backend/cuidado-feminino-api/src/main/java/Cuidado/Feminino/API/domain/repository/ConteudoEducativoRepository.java:11-29`
- Modify: `backend/cuidado-feminino-api/src/main/java/Cuidado/Feminino/API/domain/service/ConteudoEducativoService.java:28-151`
- Modify: `backend/cuidado-feminino-api/src/main/java/Cuidado/Feminino/API/infrastructure/controller/ConteudoEducativoController.java:19-50`
- Create: `backend/cuidado-feminino-api/src/main/java/Cuidado/Feminino/API/application/dto/PublicacaoConteudoRequest.java`
- Create: `backend/cuidado-feminino-api/src/main/java/Cuidado/Feminino/API/infrastructure/controller/AdminConteudoController.java`
- Create: `backend/cuidado-feminino-api/src/test/java/Cuidado/Feminino/API/domain/service/ConteudoEducativoServiceTest.java`
- Create: `backend/cuidado-feminino-api/src/test/java/Cuidado/Feminino/API/infrastructure/controller/AdminConteudoControllerTest.java`

**Interfaces:**
- Consumes: `ConteudoEducativoRequest` e `PublicacaoConteudoRequest(Boolean ativo)`.
- Produces: `buscarPublicoPorId`, `alterarPublicacao`, `excluirLogicamente` e `/api/admin/conteudos`.

- [ ] **Step 1: Escrever testes do service para visibilidade e exclusão lógica**

Cobrir estas asserções:

```java
when(repository.findByIdAndAtivoTrue(9L)).thenReturn(Optional.empty());
assertThatThrownBy(() -> service.buscarPublicoPorId(9L))
        .isInstanceOf(ConteudoEducativoNaoEncontradoException.class);

service.excluirLogicamente(artigo.getId());
assertThat(artigo.getAtivo()).isFalse();
verify(repository).save(artigo);
verify(repository, never()).delete(any());
```

Também testar `alterarPublicacao(id, true)` e `listarTodos()` incluindo inativos.

- [ ] **Step 2: Executar o teste para comprovar falha**

Run: `.\mvnw.cmd -Dtest=ConteudoEducativoServiceTest test`

Expected: FAIL por métodos ausentes.

- [ ] **Step 3: Implementar repositório e service**

Adicionar ao repository:

```java
Optional<ConteudoEducativo> findByIdAndAtivoTrue(Long id);
```

Adicionar ao service:

```java
@Transactional(readOnly = true)
public ConteudoEducativoResponse buscarPublicoPorId(Long id)

@Transactional
public ConteudoEducativoResponse alterarPublicacao(Long id, boolean ativo)

@Transactional
public void excluirLogicamente(Long id)
```

Manter `buscarPorId` para o painel administrativo. Remover o uso de `repository.delete` do fluxo exposto.

- [ ] **Step 4: Criar request de publicação**

```java
public record PublicacaoConteudoRequest(
        @NotNull(message = "Estado de publicação é obrigatório") Boolean ativo
) {}
```

- [ ] **Step 5: Criar testes MockMvc do controller administrativo**

Testar:

- `POST /api/admin/conteudos` retorna `201`;
- `PUT /api/admin/conteudos/1` retorna `200`;
- `PATCH /api/admin/conteudos/1/publicacao` retorna `200`;
- `DELETE /api/admin/conteudos/1` retorna `204`;
- request sem título retorna `400`;
- service lança não encontrado e retorna `404`.

- [ ] **Step 6: Implementar AdminConteudoController**

```java
@RestController
@RequestMapping("/api/admin/conteudos")
@RequiredArgsConstructor
public class AdminConteudoController {
    private final ConteudoEducativoService conteudoService;

    @GetMapping
    ResponseEntity<List<ConteudoEducativoResponse>> listarTodos()

    @GetMapping("/{id}")
    ResponseEntity<ConteudoEducativoResponse> buscarPorId(@PathVariable Long id)

    @PostMapping
    ResponseEntity<ConteudoEducativoResponse> criar(@Valid @RequestBody ConteudoEducativoRequest request)

    @PutMapping("/{id}")
    ResponseEntity<ConteudoEducativoResponse> atualizar(
            @PathVariable Long id, @Valid @RequestBody ConteudoEducativoRequest request)

    @PatchMapping("/{id}/publicacao")
    ResponseEntity<ConteudoEducativoResponse> alterarPublicacao(
            @PathVariable Long id, @Valid @RequestBody PublicacaoConteudoRequest request)

    @DeleteMapping("/{id}")
    ResponseEntity<Void> excluir(@PathVariable Long id)
}
```

- [ ] **Step 7: Proteger o detalhe público**

Alterar `GET /api/conteudos/{id}` para chamar `buscarPublicoPorId(id)`.

- [ ] **Step 8: Executar testes backend**

Run:

```powershell
.\mvnw.cmd -Dtest=ConteudoEducativoServiceTest,AdminConteudoControllerTest test
.\mvnw.cmd -DskipTests package
```

Expected: PASS e BUILD SUCCESS.

- [ ] **Step 9: Pausar antes do commit da API**

Proposed commit:

```text
feat(articles): adicionar gestão administrativa de artigos
```

---

### Task 4: Criar contratos e cliente administrativo no React

**Files:**
- Modify: `frontend/src/types/index.ts:56-80`
- Create: `frontend/src/services/adminConteudoService.ts`
- Create: `frontend/src/services/adminConteudoService.test.ts`

**Interfaces:**
- Consumes: endpoints de Task 3.
- Produces: `ConteudoEducativoRequest`, `getConteudosAdmin`, `createConteudo`, `updateConteudo`, `setConteudoPublicado`, `deleteConteudo`.

- [ ] **Step 1: Definir os tipos de escrita**

```ts
export interface ConteudoEducativoRequest {
  categoriaId: number;
  titulo: string;
  subtitulo: string | null;
  corpo: string;
  palavrasChave: string | null;
  tempoLeituraMin: number | null;
  fonteReferencia: string | null;
  imagemCapaUrl: string | null;
  ativo: boolean;
  destaque: boolean;
  perfilAlvo: PerfilAlvo;
}
```

- [ ] **Step 2: Escrever testes do cliente Axios**

Mockar `@/services/api` e verificar método, URL e body:

```ts
expect(api.post).toHaveBeenCalledWith("/api/admin/conteudos", payload);
expect(api.put).toHaveBeenCalledWith("/api/admin/conteudos/7", payload);
expect(api.patch).toHaveBeenCalledWith(
  "/api/admin/conteudos/7/publicacao",
  { ativo: false },
);
expect(api.delete).toHaveBeenCalledWith("/api/admin/conteudos/7");
```

- [ ] **Step 3: Executar teste para comprovar falha**

Run: `npm test -- src/services/adminConteudoService.test.ts`

Expected: FAIL porque o serviço ainda não existe.

- [ ] **Step 4: Implementar o serviço administrativo**

```ts
export const getConteudosAdmin = (): Promise<ConteudoEducativo[]> =>
  api.get("/api/admin/conteudos").then((response) => response.data);

export const createConteudo = (payload: ConteudoEducativoRequest) =>
  api.post("/api/admin/conteudos", payload).then((response) => response.data);

export const updateConteudo = (id: number, payload: ConteudoEducativoRequest) =>
  api.put(`/api/admin/conteudos/${id}`, payload).then((response) => response.data);

export const setConteudoPublicado = (id: number, ativo: boolean) =>
  api.patch(`/api/admin/conteudos/${id}/publicacao`, { ativo })
    .then((response) => response.data);

export const deleteConteudo = (id: number): Promise<void> =>
  api.delete(`/api/admin/conteudos/${id}`).then(() => undefined);
```

- [ ] **Step 5: Executar testes e typecheck**

Run:

```powershell
npm test -- src/services/adminConteudoService.test.ts
.\node_modules\.bin\tsc.cmd --build --pretty false
```

Expected: PASS e exit code `0`.

- [ ] **Step 6: Pausar antes do commit de contratos**

Proposed commit:

```text
feat(articles): adicionar cliente da gestão de artigos
```

---

### Task 5: Implementar editor Tiptap e renderizador seguro

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/src/lib/richText.ts`
- Create: `frontend/src/components/admin/RichTextEditor.tsx`
- Create: `frontend/src/components/admin/RichTextEditor.test.tsx`
- Create: `frontend/src/components/content/ConteudoRico.tsx`
- Create: `frontend/src/components/content/ConteudoRico.test.tsx`

**Interfaces:**
- Consumes: HTML no campo `corpo` e callback `onChange(html)`.
- Produces: `RichTextEditor({ value, onChange, error? })` e `ConteudoRico({ html })`.

- [ ] **Step 1: Instalar dependências oficiais**

Run:

```powershell
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit `
  @tiptap/extension-image @tiptap/extension-youtube `
  @tiptap/extension-text-style dompurify
```

O `package-lock.json` deve ser atualizado pelo npm; não editar o lock manualmente.

- [ ] **Step 2: Escrever testes do renderizador contra XSS**

```tsx
render(
  <ConteudoRico html={'<p>Seguro</p><img src="x" onerror="alert(1)"><script>alert(2)</script>'} />,
);

expect(screen.getByText("Seguro")).toBeInTheDocument();
expect(document.querySelector("script")).not.toBeInTheDocument();
expect(document.querySelector("[onerror]")).not.toBeInTheDocument();
```

Adicionar casos para imagem HTTPS, cor permitida, link `javascript:` e YouTube permitido.

- [ ] **Step 3: Executar teste para comprovar falha**

Run: `npm test -- src/components/content/ConteudoRico.test.tsx`

Expected: FAIL por componente ausente.

- [ ] **Step 4: Implementar configuração compartilhada**

Em `richText.ts` exportar:

```ts
export const ARTICLE_COLORS = [
  "#34282B", "#746469", "#8F344D", "#D78F79", "#287A5A", "#B4233A",
] as const;

const COLOR_PATTERN = /^color:\s*(#[0-9A-Fa-f]{6})\s*;?$/;
let hooksConfigured = false;

const configureSanitizerHooks = () => {
  if (hooksConfigured) return;
  hooksConfigured = true;

  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (["href", "src"].includes(data.attrName)) {
      try {
        data.keepAttr = new URL(data.attrValue).protocol === "https:";
      } catch {
        data.keepAttr = false;
      }
    }

    if (data.attrName === "style") {
      const match = COLOR_PATTERN.exec(data.attrValue);
      data.keepAttr = Boolean(
        match && ARTICLE_COLORS.includes(match[1].toUpperCase() as (typeof ARTICLE_COLORS)[number]),
      );
    }
  });

  DOMPurify.addHook("uponSanitizeElement", (node) => {
    if (node instanceof HTMLIFrameElement) {
      try {
        const url = new URL(node.src);
        if (url.hostname !== "www.youtube-nocookie.com" || !url.pathname.startsWith("/embed/")) {
          node.remove();
        }
      } catch {
        node.remove();
      }
    }
  });
};

export const sanitizeArticleHtml = (html: string): string => {
  configureSanitizerHooks();
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allowfullscreen", "frameborder", "loading"],
  });
};
```

- [ ] **Step 5: Implementar ConteudoRico**

```tsx
export const ConteudoRico = ({ html }: { html: string }) => {
  const safeHtml = useMemo(() => sanitizeArticleHtml(html), [html]);
  return (
    <article
      className="article-content prose prose-stone max-w-none"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};
```

- [ ] **Step 6: Escrever teste do editor**

Validar que:

- o HTML inicial reaparece;
- clicar em negrito altera o estado da toolbar;
- inserir URL de imagem HTTPS chama `onChange` com `<img>`;
- URL não HTTPS mostra erro;
- YouTube é convertido para `youtube-nocookie.com`;
- existe label acessível para cada ação.

- [ ] **Step 7: Implementar RichTextEditor**

Configurar as extensões uma única vez e reutilizá-las no editor:

```ts
const editor = useEditor({
  content: value,
  extensions: [
    StarterKit,
    Image.configure({ inline: false }),
    Youtube.configure({ nocookie: true, autoplay: false, controls: true }),
    TextStyleKit,
  ],
  onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
});
```

Criar toolbar com H2/H3, bold, italic, underline, listas, links, seis cores, imagem e YouTube. URLs são solicitadas em diálogo controlado, não por HTML colado.

- [ ] **Step 8: Executar testes, typecheck e build**

Run:

```powershell
npm test -- src/components/admin/RichTextEditor.test.tsx src/components/content/ConteudoRico.test.tsx
.\node_modules\.bin\tsc.cmd --build --pretty false
npm run build
```

Expected: PASS e build concluído.

- [ ] **Step 9: Pausar antes do commit do editor**

Proposed commit:

```text
feat(articles): adicionar editor e renderizador de conteúdo rico
```

---

### Task 6: Construir a gestão Web de artigos

**Files:**
- Create: `frontend/src/pages/admin/GestaoArtigosPage.tsx`
- Create: `frontend/src/pages/admin/ArtigoFormPage.tsx`
- Create: `frontend/src/pages/admin/GestaoArtigosPage.test.tsx`
- Create: `frontend/src/pages/admin/ArtigoFormPage.test.tsx`
- Modify: `frontend/src/App.tsx:33-38`

**Interfaces:**
- Consumes: `adminConteudoService`, `getCategorias`, `RichTextEditor`, `ConteudoRico`.
- Produces: `/gestao/artigos`, `/gestao/artigos/novo`, `/gestao/artigos/:id/editar`.

- [ ] **Step 1: Escrever teste da listagem administrativa**

Mockar services e validar:

```tsx
expect(await screen.findByText("Gestão de artigos")).toBeInTheDocument();
expect(screen.getByText("Publicado")).toBeInTheDocument();
expect(screen.getByRole("link", { name: /novo artigo/i })).toHaveAttribute(
  "href", "/gestao/artigos/novo",
);
```

Testar loading, vazio, erro, publicar/despublicar e confirmação de exclusão.

- [ ] **Step 2: Escrever teste do formulário**

Validar título/categoria/corpo, carregamento para edição, preview e comportamento de erro:

```tsx
await user.click(screen.getByRole("button", { name: /salvar artigo/i }));
expect(await screen.findByText("Título é obrigatório")).toBeInTheDocument();
expect(createConteudo).not.toHaveBeenCalled();
```

No erro da API, o título digitado deve continuar no input e não deve existir toast de sucesso.

- [ ] **Step 3: Executar testes para comprovar falha**

Run:

```powershell
npm test -- src/pages/admin/GestaoArtigosPage.test.tsx src/pages/admin/ArtigoFormPage.test.tsx
```

Expected: FAIL por páginas ausentes.

- [ ] **Step 4: Implementar GestaoArtigosPage**

Usar React Query:

```ts
useQuery({ queryKey: ["admin-conteudos"], queryFn: getConteudosAdmin });
```

Mutações devem invalidar `['admin-conteudos']`, exigir confirmação de exclusão e mostrar estado de requisição.

- [ ] **Step 5: Implementar ArtigoFormPage**

Campos obrigatórios: categoria, título e corpo semanticamente não vazio. Campos opcionais: subtítulo, palavras-chave, tempo, referência, capa, destaque, perfil e ativo. O preview usa `ConteudoRico` com o HTML atual.

- [ ] **Step 6: Adicionar rotas**

```tsx
<Route path="/gestao/artigos" element={<GestaoArtigosPage />} />
<Route path="/gestao/artigos/novo" element={<ArtigoFormPage />} />
<Route path="/gestao/artigos/:id/editar" element={<ArtigoFormPage />} />
```

As rotas administrativas não exibem `SplashScreen` em cada navegação.

- [ ] **Step 7: Executar testes e build**

Run:

```powershell
npm test -- src/pages/admin/GestaoArtigosPage.test.tsx src/pages/admin/ArtigoFormPage.test.tsx
.\node_modules\.bin\tsc.cmd --build --pretty false
npm run build
```

Expected: PASS e build concluído.

- [ ] **Step 8: Pausar antes do commit da gestão Web**

Proposed commit:

```text
feat(articles): implementar gestão web de artigos
```

---

### Task 7: Aplicar refinamento visual editorial

**Files:**
- Modify: `frontend/src/index.css:5-64`
- Modify: `frontend/tailwind.config.ts:15-82`
- Modify: `frontend/src/pages/admin/GestaoArtigosPage.tsx`
- Modify: `frontend/src/pages/admin/ArtigoFormPage.tsx`
- Modify: `frontend/src/components/admin/RichTextEditor.tsx`
- Modify: `frontend/src/components/content/ConteudoRico.tsx`

**Interfaces:**
- Consumes: páginas e componentes das Tasks 5 e 6.
- Produces: tokens `editorial-*` e classes `.article-content`.

- [ ] **Step 1: Centralizar tokens**

Atualizar variáveis CSS para os valores da especificação e expor no Tailwind:

```ts
editorial: {
  background: "#FCF8F3",
  surface: "#FFFFFF",
  text: "#34282B",
  muted: "#746469",
  primary: "#8F344D",
  accent: "#D78F79",
  soft: "#F4E6E8",
  success: "#287A5A",
  error: "#B4233A",
}
```

- [ ] **Step 2: Criar estilos do artigo rico**

Definir em `index.css` hierarquia para `h2`, `h3`, parágrafos, listas, blockquotes, links, imagens e iframe responsivo. Usar `font-size >= 1rem`, `line-height >= 1.65` e foco visível.

- [ ] **Step 3: Refinar gestão Web**

Aplicar:

- fundo editorial;
- largura de conteúdo `max-w-7xl`;
- superfícies brancas;
- radius de 12px;
- bordas discretas;
- estados sem depender somente de cor;
- tabela desktop e cards mobile;
- botões com foco e labels acessíveis.

- [ ] **Step 4: Verificar responsividade e contraste**

Executar manualmente em 375px, 768px e 1280px. Confirmar navegação por Tab, foco visível, labels e contraste de texto.

- [ ] **Step 5: Executar testes e build**

Run:

```powershell
npm test
npm run build
```

Expected: todos os testes existentes passam e build concluído.

- [ ] **Step 6: Pausar antes do commit visual**

Este é o bloco indicado para eventual autoria do integrante de UX/frontend.

Proposed commit:

```text
style(articles): refinar identidade visual editorial
```

---

### Task 8: Integrar conteúdo rico e atualização ao aplicativo

**Files:**
- Modify: `frontend/src/pages/ConteudosPage.tsx:26-258`
- Modify: `frontend/src/pages/ConteudoDetalhePage.tsx:6-153`
- Modify: `frontend/src/pages/HomePage.tsx:202-255`
- Modify: `frontend/src/services/conteudoService.ts:4-22`
- Create: `frontend/src/pages/ConteudosPage.test.tsx`
- Create: `frontend/src/pages/ConteudoDetalhePage.test.tsx`

**Interfaces:**
- Consumes: API pública filtrada e `ConteudoRico`.
- Produces: cards com capa, detalhe rico e refetch previsível.

- [ ] **Step 1: Escrever testes de integração da listagem**

Testar loading, erro, vazio, capa, busca e remoção após refetch. O teste de erro deve provar que conteúdo mock não aparece quando a API falha.

- [ ] **Step 2: Escrever testes do detalhe**

Validar capa, categoria, tempo, HTML rico, YouTube, referências e estado de não encontrado após artigo ser desativado.

- [ ] **Step 3: Executar testes para comprovar falha**

Run:

```powershell
npm test -- src/pages/ConteudosPage.test.tsx src/pages/ConteudoDetalhePage.test.tsx
```

Expected: pelo menos os casos de rich text e capa falham.

- [ ] **Step 4: Atualizar cards e remover fallback fictício**

Usar somente dados de API em `ConteudosPage`. Exibir estado de erro com ação “Tentar novamente”. Renderizar capa com `loading="lazy"`, `alt` baseado no título e fallback visual.

- [ ] **Step 5: Atualizar detalhe**

Remover divisão por `\n\n` e substituir por:

```tsx
<ConteudoRico html={conteudo.corpo} />
```

Renderizar capa, metadados e referências como links HTTPS seguros.

- [ ] **Step 6: Configurar atualização das queries**

Nas queries de listagem e detalhe usar:

```ts
staleTime: 0,
refetchOnMount: "always",
refetchOnWindowFocus: true,
refetchInterval: 5_000,
```

O polling de 5 segundos fica documentado como configuração da demonstração e pode ser aumentado depois.

- [ ] **Step 7: Atualizar destaque da Home**

Renderizar capa e remover qualquer fallback que possa ser confundido com conteúdo real da API.

- [ ] **Step 8: Executar testes, lint dirigido, typecheck e build**

Run:

```powershell
npm test
.\node_modules\.bin\eslint.cmd src --max-warnings=0
.\node_modules\.bin\tsc.cmd --build --pretty false
npm run build
```

Expected: tudo passa.

- [ ] **Step 9: Pausar antes do commit da integração**

Proposed commit:

```text
feat(articles): integrar conteúdo rico ao aplicativo
```

---

### Task 9: Validar fluxo ponta a ponta e documentar demonstração

**Files:**
- Create: `docs/entregas/semana-1-entrega-1-artigos.md`
- Modify only if a defect is reproduced: files owned by Tasks 2–8.

**Interfaces:**
- Consumes: backend, gestão Web e aplicativo concluídos.
- Produces: roteiro reproduzível de execução e vídeo de até seis minutos.

- [ ] **Step 1: Executar suíte backend**

Run:

```powershell
cd backend/cuidado-feminino-api
.\mvnw.cmd test
```

Expected: BUILD SUCCESS e nenhuma conexão com banco local real durante testes unitários/controller.

- [ ] **Step 2: Executar suíte frontend**

Run:

```powershell
cd frontend
npm test
.\node_modules\.bin\eslint.cmd src --max-warnings=0
.\node_modules\.bin\tsc.cmd --build --pretty false
npm run build
```

Expected: todos passam.

- [ ] **Step 3: Executar smoke manual com identificador único**

Usar título `E1-ARTIGO-20260824` e comprovar:

1. criar com H2, negrito, itálico, lista, cor, capa, imagem inline e YouTube;
2. publicar e localizar no app em até 5 segundos;
3. editar título para `E1-ARTIGO-20260824-V2` e trocar mídia;
4. confirmar atualização no app;
5. cancelar exclusão e comprovar permanência;
6. excluir e comprovar desaparecimento da lista, busca e URL direta;
7. desligar backend e comprovar erro real, sem sucesso fictício.

- [ ] **Step 4: Documentar execução e roteiro do vídeo**

O documento deve conter:

- pré-requisitos e variáveis;
- comandos para banco, backend e frontend;
- URLs do app e gestão;
- roteiro cronometrado de até 5min30s;
- limitações: administração local sem auth e mídia por URL;
- checklist de evidências da atividade.

- [ ] **Step 5: Revisar o diff completo**

Run:

```powershell
git diff develop...HEAD --check
git diff develop...HEAD --stat
git status --short
```

Expected: sem whitespace inválido, sem artefatos de build, sem `tsbuildinfo` e sem arquivos da worktree original.

- [ ] **Step 6: Pausar antes do commit final de documentação**

Proposed commit:

```text
docs(articles): adicionar roteiro da entrega funcional
```

---

## Commit Checkpoints

Os commits previstos, todos sujeitos à confirmação prévia de autoria, são:

1. `fix(build): corrigir wrapper Maven no Windows`
2. `feat(articles): sanitizar conteúdo rico no backend`
3. `feat(articles): adicionar gestão administrativa de artigos`
4. `feat(articles): adicionar cliente da gestão de artigos`
5. `feat(articles): adicionar editor e renderizador de conteúdo rico`
6. `feat(articles): implementar gestão web de artigos`
7. `style(articles): refinar identidade visual editorial`
8. `feat(articles): integrar conteúdo rico ao aplicativo`
9. `docs(articles): adicionar roteiro da entrega funcional`

Nenhum passo de commit será executado automaticamente. Antes de cada checkpoint, apresentar arquivos, testes, resultado e autoria solicitada.
