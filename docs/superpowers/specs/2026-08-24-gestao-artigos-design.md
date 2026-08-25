# Entrega 1 — Gestão e integração de artigos

Data: 24/08/2026
Prazo da entrega: 28/08/2026 às 23:59
Branch: `feature/entrega-1-artigos`

## 1. Objetivo

Entregar um fluxo demonstrável no qual uma pessoa responsável pelo conteúdo possa criar, editar, publicar e excluir artigos em uma interface Web. O aplicativo deve consumir a mesma API e refletir criação, edição e exclusão após atualização da consulta.

O artigo deve combinar texto formatado, imagens e vídeos. O editor será um componente pronto de Rich Text Editor, conforme exigido pela atividade.

## 2. Escopo aprovado

### Incluído

- Gestão Web no frontend React existente, em rotas `/gestao/artigos`.
- Listagem administrativa de artigos ativos e inativos.
- Criação, edição, publicação/despublicação e exclusão lógica.
- Editor Tiptap com:
  - títulos H2 e H3;
  - negrito, itálico e sublinhado;
  - listas ordenadas e não ordenadas;
  - links;
  - paleta restrita de cores;
  - imagens por URL HTTPS;
  - vídeos do YouTube por URL;
  - desfazer e refazer.
- Armazenamento do conteúdo rico como HTML no campo `corpo` já existente.
- Imagem de capa por URL usando `imagemCapaUrl`.
- Sanitização no backend e sanitização defensiva no frontend.
- Renderização responsiva do HTML, imagens e vídeos no aplicativo.
- Atualização da consulta quando o aplicativo volta ao foco e atualização periódica curta durante a demonstração.
- Testes automatizados das regras e fluxos críticos da entrega.
- Refinamento visual limitado à gestão Web e às telas de conteúdo.

### Fora do escopo

- Novo repositório ou frontend administrativo separado.
- CRUD de categorias e séries.
- Upload binário e armazenamento próprio de imagens ou vídeos.
- Biblioteca de mídia, CDN ou object storage.
- Workflow editorial com revisão, aprovação e agendamento.
- Histórico completo de versões.
- Colaboração simultânea entre editores.
- WebSocket, SSE ou notificações push.
- Redesign integral das telas de ciclo, calendário e perfil.
- Módulo completo de autenticação e autorização.

Os endpoints administrativos serão usados apenas no ambiente local da demonstração. Eles não poderão ser publicados em ambiente externo sem autenticação e autorização. Essa restrição deve constar na documentação de execução.

## 3. Estado atual reaproveitado

- A migration V3 já cria `categoria_conteudo` e `conteudo_educativo`.
- `conteudo_educativo.corpo` já é `TEXT` e pode armazenar HTML baseado em URLs.
- `imagem_capa_url`, `ativo`, `destaque`, `perfil_alvo`, `criado_em` e `atualizado_em` já existem.
- `ConteudoEducativoService` já contém lógica inicial de criação, atualização e exclusão.
- O aplicativo já possui listagem, busca, destaques e detalhe de conteúdo.
- React Query e Axios já estão configurados.

Não será criada migration apenas para esta entrega. Imagens não serão armazenadas como Base64, evitando exceder o tamanho de `TEXT` e aumentar o payload.

## 4. Arquitetura

```text
React/Vite existente
├── /gestao/artigos
│   ├── GestaoArtigosPage
│   ├── ArtigoFormPage
│   ├── RichTextEditor
│   └── PreviaArtigo
├── adminConteudoService
└── ConteudoRico compartilhado
              │
              ▼
Spring Boot
├── AdminConteudoController  /api/admin/conteudos
├── ConteudoEducativoController /api/conteudos
├── ConteudoEducativoService
├── SanitizadorConteudoService
└── ConteudoEducativoRepository
              │
              ▼
          MySQL/Flyway
```

O controller público continuará somente leitura. O controller administrativo concentrará as mutações. Consultas públicas nunca poderão retornar artigos inativos.

## 5. Contratos REST

### Administração

```http
GET    /api/admin/conteudos
GET    /api/admin/conteudos/{id}
POST   /api/admin/conteudos
PUT    /api/admin/conteudos/{id}
PATCH  /api/admin/conteudos/{id}/publicacao
DELETE /api/admin/conteudos/{id}
```

Regras:

- `GET /api/admin/conteudos` lista ativos e inativos.
- `POST` retorna `201 Created` e o artigo persistido.
- `PUT` retorna `200 OK` e substitui os campos editáveis.
- `PATCH /publicacao` recebe `{ "ativo": true|false }`.
- `DELETE` realiza exclusão lógica, define `ativo = false` e retorna `204 No Content`.
- Categoria inexistente retorna `404`.
- Dados inválidos retornam `400` com o formato de erro já usado pelo projeto.
- Falha inesperada retorna `500` sem stack trace.

### Aplicativo

```http
GET /api/conteudos
GET /api/conteudos/{id}
GET /api/conteudos/busca?q=
GET /api/conteudos/destaque
GET /api/conteudos/perfil/{perfil}
```

Todas as consultas públicas filtram `ativo = true`, inclusive a consulta direta por ID.

## 6. Modelo e conteúdo rico

O campo `corpo` armazenará HTML produzido pelo Tiptap. O conjunto aceito será restrito a:

- `p`, `h2`, `h3`, `strong`, `em`, `u`;
- `ul`, `ol`, `li`, `blockquote`, `br`, `hr`;
- `a` com URL HTTPS;
- `img` com `src` HTTPS, `alt` e `title`;
- `span` apenas para cores pertencentes à paleta aprovada;
- embed de YouTube convertido para origem `youtube-nocookie.com`.

Regras de segurança:

- remover `script`, `style`, formulários, objetos e embeds arbitrários;
- remover atributos iniciados por `on`;
- rejeitar `javascript:`, `data:`, `file:` e URLs sem HTTPS;
- rejeitar SVG como imagem nesta entrega;
- não aceitar iframe digitado ou colado manualmente;
- aceitar somente IDs e URLs válidos do YouTube;
- abrir links externos com `rel="noopener noreferrer"`;
- usar uma lista fixa de cores, sem CSS arbitrário.

O backend sanitiza antes de persistir. O componente `ConteudoRico` sanitiza novamente antes de renderizar.

## 7. Comportamento de publicação e exclusão

- `ativo = false` representa rascunho, despublicado ou excluído logicamente.
- `ativo = true` representa artigo publicado.
- Um artigo inativo aparece na gestão Web com estado visível, mas não aparece no aplicativo.
- Publicar torna o artigo disponível na próxima atualização da consulta.
- Excluir solicita confirmação e desativa o artigo.
- A URL pública de um artigo inativo retorna `404`.
- Uma edição que falha não pode substituir a versão persistida nem exibir sucesso.

## 8. Sincronização

A fonte de verdade é a API Spring/MySQL; não haverá replicação de conteúdo.

- Consultas de conteúdo terão `staleTime` específico menor que o cache global atual.
- A listagem será refeita quando a tela montar e quando o aplicativo voltar ao foco.
- Durante a demonstração, listagem e detalhe poderão usar `refetchInterval` de 5 segundos.
- O fallback de mocks não será aplicado às mutações nem ocultará falhas de integração.
- A interface exibirá erro quando o backend estiver indisponível.

Não é requisito que a atualização ocorra em tempo real sem nova consulta.

## 9. Direção visual

A identidade continuará feminina, porém mais limpa, editorial e profissional.

### Princípios

- Menor repetição de rosa em superfícies, bordas e textos.
- Mais espaço em branco e hierarquia tipográfica.
- Cards com borda discreta e sombras mínimas.
- Imagens de capa como elemento editorial.
- Estados de loading, vazio, erro e sucesso consistentes.
- Contraste WCAG AA para textos e ações essenciais.
- Layout administrativo responsivo, priorizando desktop sem quebrar no mobile.

### Tokens propostos

| Uso | Cor |
|---|---|
| Fundo | `#FCF8F3` |
| Superfície | `#FFFFFF` |
| Texto principal | `#34282B` |
| Texto secundário | `#746469` |
| Primária vinho | `#8F344D` |
| Acento terracota | `#D78F79` |
| Superfície suave | `#F4E6E8` |
| Sucesso | `#287A5A` |
| Erro | `#B4233A` |

Os tokens serão centralizados no CSS/Tailwind. Novos componentes não usarão cores hexadecimais espalhadas no JSX.

### Gestão Web

- Cabeçalho com título, resumo e ação “Novo artigo”.
- Lista/tabela com título, categoria, estado, última atualização e ações.
- Formulário dividido em metadados, editor e publicação.
- Barra do editor fixa durante a edição.
- Preview responsivo antes de salvar.
- Exclusão em diálogo de confirmação.

### Aplicativo

- Card de artigo com imagem de capa, categoria, título, resumo e tempo de leitura.
- Detalhe com capa, título, metadados, corpo rico e referências.
- Imagens com proporção preservada e fallback.
- Player de vídeo responsivo, sem autoplay.

## 10. Erros e feedback

- Botões de salvar ficam desabilitados enquanto a requisição está em andamento.
- Sucesso somente após resposta válida da API.
- Erros de validação aparecem próximos aos campos.
- Erros de rede preservam o conteúdo digitado.
- Exclusão exige confirmação e informa falha sem remover o item da lista.
- Imagem ou vídeo quebrado não pode impedir a leitura do restante do artigo.
- Artigo removido ou inativo mostra “Conteúdo não encontrado” no aplicativo.

## 11. Estratégia de testes

### Backend

- Service: criação, atualização, publicação, despublicação e exclusão lógica.
- Service: sanitização de scripts, eventos, URLs e embeds inválidos.
- Controller: `201`, `200`, `204`, `400` e `404`.
- Repositório: consultas públicas nunca retornam inativos.

### Frontend

- Editor preserva títulos, ênfase, listas, imagens e vídeo.
- Formulário não mostra sucesso em falha de rede.
- Renderer não executa payloads XSS.
- Artigo ativo aparece; artigo inativo não aparece.
- Edição reflete a versão nova após refetch.
- Exclusão remove o artigo da lista pública.

### Verificação manual

- Criar artigo com título, cores, negrito, lista, capa, imagem inline e vídeo.
- Abrir no aplicativo e conferir a renderização.
- Editar texto e mídia e conferir atualização.
- Cancelar uma exclusão e confirmar permanência.
- Excluir e confirmar remoção da lista e da URL pública.
- Desligar o backend e confirmar que não existe sucesso fictício.

## 12. Blocos de trabalho e commits

Cada bloco ficará separado e será apresentado antes do commit:

1. `docs`: especificação da Entrega 1.
2. `backend`: API administrativa, filtros públicos e exclusão lógica.
3. `frontend-admin`: gestão Web e editor Tiptap.
4. `design`: tokens e refinamento visual das telas de conteúdo.
5. `frontend-app`: renderização rica e sincronização com o aplicativo.
6. `test`: testes backend e frontend.
7. `docs`: roteiro de execução e demonstração.

Antes de cada commit serão informados:

- arquivos incluídos;
- resumo da mudança;
- verificações executadas;
- autoria proposta.

Autoria de outro integrante só será aplicada após confirmação de participação, revisão ou responsabilidade pelo bloco e fornecimento de nome e e-mail corretos.

## 13. Critério final de aceite

A entrega estará pronta quando o fluxo abaixo funcionar com dados reais:

```text
Criar no Web
  → publicar
  → visualizar formatado no aplicativo
  → editar no Web
  → visualizar versão atualizada
  → excluir no Web
  → não localizar mais no aplicativo
```

O fluxo deverá ser repetível em ambiente limpo, sem conteúdo mock, sem erros no console relevantes à entrega e com builds e testes aprovados.
