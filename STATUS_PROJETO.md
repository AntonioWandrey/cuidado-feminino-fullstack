# Status do Projeto — Minha Saúde Feminina

> Atualizado em 28/08/2026 após implementação, revisão independente, testes, builds e smoke tests reais.

## Resumo executivo

As duas entregas da Semana 1 estão aptas para demonstração Web local. A Entrega 1 usa React/Spring/MySQL e a Entrega 2 funciona localmente no navegador/WebView, sem depender do backend.

| Área | Status | Evidência principal |
|---|---|---|
| Gestão de artigos | Pronta para demo local | Criar, editar, publicar/despublicar e excluir logicamente |
| Conteúdo rico | Pronto | Tiptap, imagens HTTPS, YouTube sem cookies e HTML sanitizado |
| Calendário local | Pronto para demo Web | Início/fim, persistência, calendário, histórico e previsão |
| Testes frontend | Aprovado | 44 testes em 12 arquivos |
| Build e typecheck frontend | Aprovados | TypeScript e Vite concluídos |
| Lint frontend | Aprovado com avisos | 0 erros; 3 avisos preexistentes de Fast Refresh |
| Backend | Aprovado | 43 testes isolados em H2 e package Spring Boot |
| Smoke artigos | Aprovado com MySQL | criar → publicar → visualizar → editar → sanitizar → excluir |
| Smoke calendário | Aprovado | registro persistiu após recarga e pôde ser encerrado |
| Android | Assets sincronizados; APK não validado | Capacitor sync aprovado; SDK Android ainda é necessário |

## Entrega 1 — gestão e integração de artigos

### Critérios atendidos

- listagem administrativa de ativos e inativos;
- criação e edição pela interface Web;
- publicação/despublicação determinística;
- exclusão lógica por `ativo=false`;
- editor pronto Tiptap com títulos, ênfases, listas, links, cores, imagem e YouTube;
- sanitização no backend com jsoup e defensiva no frontend com DOMPurify;
- somente URLs HTTPS; SVG/SVGZ e protocolos perigosos bloqueados;
- YouTube normalizado para `youtube-nocookie.com`, sem query, fragmento ou autoplay;
- aplicação pública nunca retorna conteúdos inativos, inclusive por ID e séries;
- refetch de cinco segundos e ao retornar o foco;
- erro real quando a API está indisponível, sem conteúdo fictício;
- compatibilidade com artigos legados em texto puro e múltiplas referências HTTPS.

### Smoke test final

O fluxo foi executado com o título `E1-ARTIGO-20260828`:

1. criação e publicação pela gestão;
2. leitura formatada no aplicativo;
3. edição para `E1-ARTIGO-20260828-V2` com duas fontes;
4. sanitização de `script`, eventos, SVGZ e `autoplay=1`;
5. exclusão lógica com resposta administrativa `204`;
6. consulta pública posterior retornando `404` e gestão mantendo o registro inativo.

### Limite de segurança

Os endpoints `/api/admin/**` não possuem autenticação e são exclusivos da demonstração local. Não devem ser expostos externamente antes de autenticação e autorização.

## Entrega 2 — calendário menstrual preliminar

### Critérios atendidos

- registro do início e término do período;
- gravação local sob a chave `cuidado-feminino:ciclos:v1`;
- persistência após recarregar ou reabrir a aplicação;
- exibição de períodos reais no calendário;
- identificação de menstruação, período fértil e ovulação;
- consulta do histórico completo;
- previsão pela média dos últimos seis intervalos entre inícios;
- fallback explícito de 28 dias quando o histórico é insuficiente;
- bloqueio de datas futuras, fim anterior ao início e sobreposição.

### Limites conhecidos

- armazenamento local sem criptografia, backup ou sincronização;
- previsão informativa, não clínica e não contraceptiva;
- demonstração principal validada no navegador;
- motor remoto preservado para evolução e ainda não sincronizado com o calendário local.

## Próximos passos após a entrega

1. gravar os vídeos com os roteiros já documentados;
2. implementar autenticação/autorização para a gestão;
3. definir consentimento, criptografia e exclusão de dados;
4. validar APK após configurar Android SDK Platform 36;
5. planejar sincronização local/remota no ADR-006;
6. dividir o bundle Web em chunks em uma etapa de otimização.
