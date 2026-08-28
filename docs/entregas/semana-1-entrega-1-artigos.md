# Semana 1 — Entrega 1: gestão e integração de artigos

Prazo: 28/08/2026 às 23:59. Meta interna: 20:00.

## Objetivo demonstrável

```text
criar artigo na gestão Web
→ formatar texto e inserir mídia
→ publicar
→ visualizar no aplicativo
→ editar e atualizar
→ excluir logicamente
→ confirmar ausência no aplicativo
```

## Pré-requisitos

- Java 21;
- Node.js 22 ou superior;
- MySQL iniciado;
- arquivo `application-local.properties` configurado;
- conexão com a internet apenas para carregar as URLs de imagem/vídeo usadas na demonstração.

Os endpoints administrativos são destinados somente à demonstração local. Não publique o backend externamente sem autenticação e autorização.

## Iniciar

### Terminal 1 — backend

```powershell
cd backend\cuidado-feminino-api
.\mvnw.cmd spring-boot:run
```

Confirme `http://localhost:8080/actuator/health`.

### Terminal 2 — frontend

```powershell
cd frontend
npm ci
npm run dev
```

URLs:

- aplicativo: `http://localhost:5173`;
- gestão de artigos: `http://localhost:5173/gestao/artigos`.

## Dados de demonstração

Use um identificador fácil de pesquisar:

```text
Título inicial: E1-ARTIGO-20260828
Título editado: E1-ARTIGO-20260828-V2
```

Inclua:

- título H2 e H3;
- negrito, itálico e sublinhado;
- lista;
- uma cor da paleta;
- link HTTPS;
- imagem de capa HTTPS;
- imagem inline HTTPS;
- vídeo válido do YouTube.

Use apenas conteúdo e mídia fictícios ou autorizados.

## Roteiro de vídeo — até 5min30s

### 0:00–0:30 — apresentação

“Esta entrega demonstra a gestão e integração de artigos do Minha Saúde Feminina. A equipe de conteúdo consegue criar, formatar, publicar, editar e excluir um artigo, e o aplicativo consulta a mesma API.”

### 0:30–1:50 — criar e formatar

1. Abra `/gestao/artigos`.
2. Clique em **Novo artigo**.
3. Preencha título, categoria, resumo, capa e metadados.
4. Use a toolbar do editor para mostrar formatação, lista, imagem e vídeo.
5. Abra a prévia e salve.

### 1:50–2:40 — publicar e visualizar

1. Publique o artigo.
2. Abra a área de conteúdos do aplicativo.
3. Pesquise `E1-ARTIGO-20260828`.
4. Abra o detalhe e mostre texto, imagem e vídeo responsivos.

### 2:40–3:45 — editar

1. Volte à gestão.
2. Edite o título para `E1-ARTIGO-20260828-V2` e altere um trecho/mídia.
3. Salve.
4. Volte ao aplicativo e mostre a versão atualizada.

### 3:45–4:45 — excluir

1. Clique em excluir e primeiro cancele a confirmação.
2. Mostre que o artigo permaneceu.
3. Exclua novamente e confirme.
4. Demonstre que ele não aparece mais na listagem, busca ou URL pública.

### 4:45–5:20 — segurança e fechamento

“O backend sanitiza o HTML antes de persistir e o aplicativo aplica sanitização defensiva ao renderizar. Nesta versão, imagens usam URLs HTTPS, vídeos são restritos ao YouTube e a gestão é limitada ao ambiente local de demonstração.”

## Checklist técnico

- [x] backend: 43 testes e package aprovados;
- [x] frontend: 44 testes, lint com 0 erros, typecheck e build aprovados;
- [x] criar artigo com editor rico;
- [x] publicar e localizar no aplicativo;
- [x] editar com múltiplas fontes e confirmar atualização;
- [x] excluir logicamente e confirmar `204` administrativo e `404` público;
- [x] desligar backend e confirmar erro real, sem sucesso fictício;
- [x] sanitização de script, eventos, SVGZ e autoplay validada;
- [x] console do navegador sem erros relevantes;
- [ ] vídeo com menos de 6 minutos.

## Evidência final de 28/08/2026

O smoke test usou o artigo `E1-ARTIGO-20260828`, depois renomeado para `E1-ARTIGO-20260828-V2`. A gestão salvou duas referências HTTPS, o aplicativo exibiu a versão publicada e a edição foi refletida. Um payload com `script`, eventos, SVGZ e `autoplay=1` foi sanitizado antes da persistência. A exclusão foi lógica: o item permaneceu inativo na gestão e passou a retornar `404` na API pública.

## Limitações declaradas

- gestão administrativa local sem autenticação;
- mídia externa por URL, sem upload próprio;
- sem workflow editorial, agendamento ou versionamento;
- exclusão lógica por `ativo=false`;
- atualização por nova consulta, não WebSocket.
