# Análise final das entregas — 28/08/2026

Prazo acadêmico: 28/08/2026 às 23:59. Validação final executada em 28/08/2026.

## Parecer final

| Entrega | Parecer | Forma segura de demonstrar |
|---|---|---|
| Entrega 1 — gestão e integração de artigos | **GO para demonstração Web local** | MySQL + backend Spring em `8080` + frontend Vite em `5173` |
| Entrega 2 — calendário menstrual preliminar | **GO para demonstração Web local** | Frontend; o calendário não depende do backend |
| APK Android | **Não usar como plano principal** | Assets sincronizados, mas o APK não foi gerado nesta máquina |

## Entrega 1 — matriz de aceite

| Requisito | Evidência | Estado |
|---|---|---|
| Criar artigo em interface Web | `/gestao/artigos/novo` e `POST /api/admin/conteudos` | Atende |
| Editar artigo | hidratação assíncrona do Tiptap e `PUT` | Atende |
| Publicar/despublicar | `PATCH /publicacao` com booleano explícito | Atende |
| Excluir artigo | confirmação Web e exclusão lógica `204` | Atende |
| Editor pronto Rich Text | Tiptap com toolbar acessível | Atende |
| Texto, imagens e vídeos | HTML rico, HTTPS e YouTube sem cookies | Atende |
| Aplicativo refletir alterações | refetch em montagem, foco e intervalo de 5 s | Atende |
| Conteúdo inativo não ser público | filtros de lista, ID, busca, perfil, categoria, destaque e séries | Atende |
| Segurança do HTML | jsoup no backend e DOMPurify no frontend | Atende |
| Testes automatizados | 43 backend e 44 frontend | Atende |

## Entrega 2 — matriz de aceite

| Requisito | Evidência | Estado |
|---|---|---|
| Registrar início e término | ação contextual na `CalendarioPage` e serviço local | Atende |
| Armazenar localmente | `localStorage`, chave versionada | Atende |
| Visualizar no calendário | intervalos abertos e fechados destacados | Atende |
| Identificar períodos | painel do dia e legenda distinguem real e previsto | Atende |
| Prever o próximo ciclo | média dos intervalos entre inícios; fallback de 28 dias | Atende |
| Consultar registros | histórico expansível com início, fim, status e duração | Atende |

## Evidências técnicas finais

- `npm test`: 12 arquivos, 44 testes, 0 falhas;
- `npm run lint`: 0 erros e 3 avisos preexistentes de Fast Refresh;
- `tsc --build`: aprovado;
- `npm run build`: aprovado; aviso não bloqueante de bundle principal acima de 500 kB;
- `mvnw.cmd --offline test`: 43 testes, 0 falhas, H2 em memória e sem MySQL;
- `mvnw.cmd --offline -DskipTests package`: aprovado;
- `cap sync android`: aprovado;
- browser: gestão, conteúdo público e calendário sem erros de console relevantes;
- `git diff --check`: sem erros de whitespace na revisão anterior às correções finais; repetir no conjunto staged antes do push.

## Smoke test de artigos

O artigo `E1-ARTIGO-20260828` foi criado e publicado pela interface, exibido no aplicativo, editado para `E1-ARTIGO-20260828-V2` e salvo com duas referências HTTPS. Em seguida, um payload contendo script, eventos, SVGZ e YouTube com autoplay foi enviado à API: o backend preservou somente o HTML seguro e normalizou o iframe. A exclusão lógica retornou `204`, a gestão manteve o item inativo e a consulta pública retornou `404`.

## Smoke test do calendário

Um período foi iniciado na data selecionada, apareceu como “Em andamento”, permaneceu após recarregar a aplicação e foi encerrado. O histórico mostrou início, fim e duração; a previsão permaneceu visível com confiança baixa por histórico insuficiente.

## Limites a declarar na apresentação

- administração local sem autenticação;
- ciclos locais sem criptografia ou sincronização;
- previsões não são diagnóstico nem método contraceptivo;
- mídia por URL, sem upload próprio;
- APK não validado nesta máquina;
- atualização de conteúdo por consulta, não por WebSocket.

## Roteiros

- Entrega 1: `docs/entregas/semana-1-entrega-1-artigos.md`;
- Entrega 2: `ENTREGA_SEMANA1_CALENDARIO.md`;
- inicialização no VS Code: `INICIAR_PROJETO_VSCODE.md`.
