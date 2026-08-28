# Cuidado Feminino — Minha Saúde Feminina

Aplicação acadêmica de saúde feminina construída com React, Spring Boot e MySQL. O projeto reúne calendário menstrual, registro de queixas e conteúdo educativo em uma interface preparada para Web e Android com Capacitor.

> As previsões do calendário são estimativas. O aplicativo não substitui avaliação médica e não deve ser usado como método contraceptivo.

## Estado das entregas de 28/08/2026

| Entrega | Estado real | Observação |
|---|---|---|
| Entrega 1 — gestão e integração de artigos | **Pronta para demonstração Web local** | CRUD administrativo, Tiptap, sanitização em duas camadas e fluxo criar → publicar → editar → excluir foram validados com MySQL. |
| Entrega 2 — calendário menstrual preliminar | **Pronta para demonstração Web local** | Início/fim, persistência no dispositivo, calendário, histórico e previsão estão implementados e validados. |
| APK Android | **Não validado nesta máquina** | O projeto Capacitor está sincronizado, mas a geração atual exige Android SDK Platform 36 e Build Tools configurados. |

O diagnóstico detalhado está em [ANALISE_ENTREGAS_28-08-2026.md](ANALISE_ENTREGAS_28-08-2026.md). Os roteiros estão em [docs/entregas/semana-1-entrega-1-artigos.md](docs/entregas/semana-1-entrega-1-artigos.md) e [ENTREGA_SEMANA1_CALENDARIO.md](ENTREGA_SEMANA1_CALENDARIO.md).

## Arquitetura atual

```text
React 18 + TypeScript + Vite
├── Calendário menstrual
│   └── cicloService → localStorage
│       chave: cuidado-feminino:ciclos:v1
├── Conteúdos e queixas
│   ├── gestão Web + editor Tiptap
│   ├── DOMPurify + sanitização jsoup
│   └── Axios → Spring Boot → MySQL
└── Capacitor
    └── projeto Android gerado a partir de frontend/dist

Spring Boot 4 + Java 21
├── ciclos e previsão remotos (evolução; não usados pela Entrega 2)
├── conteúdo educativo público e CRUD administrativo local
├── categorias e séries
└── registro de queixas
```

O calendário da entrega é **local-first**: ele funciona sem backend e calcula o próximo ciclo no navegador/WebView. O backend de ciclos foi preservado para evolução futura, mas sua sincronização ainda não foi definida.

## Stack

### Frontend

- React 18.3.1 e TypeScript 5.8
- Vite 8
- Tailwind CSS e Shadcn/UI
- TanStack Query e Axios
- Vitest e Testing Library
- Capacitor 8 para Android

### Backend

- Java 21
- Spring Boot 4.0.4
- Spring Data JPA e Hibernate
- Flyway
- MySQL Connector/J
- Maven Wrapper

## Estrutura do repositório

```text
projeto-saude-feminina/
├── backend/cuidado-feminino-api/  API Spring Boot
├── frontend/                      aplicação React e projeto Android
├── docs/superpowers/              especificações e planos técnicos
├── .vscode/                       atalhos de execução no VS Code
├── ANALISE_ENTREGAS_28-08-2026.md
├── ENTREGA_SEMANA1_CALENDARIO.md
├── INICIAR_PROJETO_VSCODE.md
└── STATUS_PROJETO.md
```

## Início rápido — demonstração do calendário

Esse caminho não requer Java, MySQL ou backend:

```powershell
cd frontend
.\INICIAR_DEMO.bat
```

Abra `http://127.0.0.1:4173` e entre na aba **Calendário**.

Se as dependências ainda não estiverem instaladas:

```powershell
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`.

Para a Entrega 1, inicie também backend e MySQL e abra `http://localhost:5173/gestao/artigos`.

## Projeto completo no VS Code

Consulte [INICIAR_PROJETO_VSCODE.md](INICIAR_PROJETO_VSCODE.md) para instalar os pré-requisitos, configurar o MySQL, iniciar frontend/backend e resolver problemas de `npm`, Maven ou porta.

Resumo:

```powershell
# Terminal 1 — backend
cd backend\cuidado-feminino-api
Copy-Item src\main\resources\application-local.properties.example src\main\resources\application-local.properties
.\mvnw.cmd spring-boot:run

# Terminal 2 — frontend
cd frontend
npm ci
npm run dev
```

O backend usa `http://localhost:8080`; o frontend, `http://localhost:5173`.

## Verificação

```powershell
# Frontend
cd frontend
npm run lint
npm test
npm run build

# Backend — testes usam H2 isolado
cd ..\backend\cuidado-feminino-api
.\mvnw.cmd test
```

Validação final de 28/08/2026:

- frontend: **44/44 testes aprovados em 12 arquivos**;
- build Vite: **aprovado**;
- ESLint: **0 erros** e 3 avisos de Fast Refresh;
- backend: **43/43 testes aprovados** com Java 21 e H2 isolado;
- package Spring Boot: **aprovado**;
- fluxo real de artigos: criação, publicação, leitura, edição, sanitização XSS/autoplay e exclusão lógica validados com MySQL;
- fluxo visual do calendário: início, encerramento, histórico, previsão e recarga validados;
- Capacitor: assets Web sincronizados com Android.

## Persistência e segurança

- Os ciclos da Entrega 2 ficam no `localStorage` do dispositivo/navegador.
- Não há sincronização, backup ou compartilhamento entre aparelhos nesta versão.
- O armazenamento local não é criptografado; use apenas dados fictícios na apresentação.
- O backend ainda opera como protótipo single-user em partes do domínio.
- Endpoints administrativos não devem ser publicados sem autenticação e autorização.

## Branches

- `develop`: branch de integração e entrega acadêmica.
- `main`: branch estável; pode ficar atrás da `develop` até a homologação.
- `feature/entrega-1-artigos`: preserva a origem do planejamento; a implementação integrada está em `develop`.

## Documentação arquitetural

As decisões arquiteturais e notas técnicas ficam no vault `cuidado-feminino-vault`, incluindo:

- ADR-001 — Java 21 + Spring Boot 4;
- ADR-002 — MySQL/MariaDB no backend;
- ADR-003 — decisão histórica do motor remoto, substituída;
- ADR-004 — React/Vite com Capacitor;
- ADR-005 — calendário local-first;
- ADR-006 — fronteira de sincronização futura.
- ADR-007 — conteúdo rico HTML sanitizado com Tiptap.
