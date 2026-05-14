# Cuidado Feminino — Plataforma de Saúde Feminina Inteligente

> Plataforma assistencial que transforma registros de sintomas em inteligência clínica, aproxima mulheres do sistema público de saúde e democratiza o acesso ao conhecimento científico sobre saúde feminina.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Objetivos da Plataforma](#objetivos-da-plataforma)
- [Módulos do Sistema](#módulos-do-sistema)
- [Stack Tecnológica](#stack-tecnológica)
- [Banco de Dados](#banco-de-dados)
- [Documentação com Obsidian](#documentação-com-obsidian)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Sprints Concluídas](#sprints-concluídas)
- [O que Ainda Falta Fazer](#o-que-ainda-falta-fazer)
- [Como Planejamos Continuar](#como-planejamos-continuar)
- [Possível Migração para Next.js](#possível-migração-para-nextjs)
- [Como Rodar o Projeto](#como-rodar-o-projeto)

---

## Visão Geral

O **Cuidado Feminino** nasceu de uma percepção simples e urgente: milhões de mulheres brasileiras não têm acesso fácil a informações confiáveis sobre sua própria saúde, enfrentam dificuldades para navegar no sistema público de saúde e raramente conseguem conectar os sintomas que sentem a um contexto clínico real.

A plataforma atua em três frentes simultâneas:

1. **Inteligência individual** — rastreia sintomas e aprende o padrão único de cada mulher para gerar previsões personalizadas do ciclo menstrual
2. **Conexão com o SUS** — aproxima a usuária das Unidades Básicas de Saúde (UBSs), facilitando encaminhamentos, acompanhamento por profissionais e compartilhamento seguro de dados clínicos
3. **Educação baseada em evidências** — disponibiliza conteúdo científico curado — artigos, guias, vídeos e recomendações personalizadas — tornando o conhecimento técnico acessível à linguagem do cotidiano

O resultado é um ecossistema de saúde feminina que não apenas registra dados, mas os transforma em ação: a usuária entende seu corpo, encontra suporte no sistema público e tem acesso à ciência de forma clara e contextualizada.

---

## Objetivos da Plataforma

### Para a Usuária Final
- Registrar sintomas diários e acompanhar o próprio ciclo menstrual de forma intuitiva
- Receber previsões personalizadas baseadas no **histórico real da própria usuária**, não em médias genéricas
- Acessar conteúdo científico sobre saúde feminina em linguagem acessível
- Receber recomendações de conteúdo contextualizadas ao seu perfil e fase do ciclo
- Ser encaminhada para UBSs próximas quando os dados indicarem necessidade de atenção médica
- Compartilhar seu histórico clínico de forma segura com profissionais de saúde vinculados

### Para Profissionais de Saúde (UBSs)
- Acompanhar o histórico de pacientes vinculadas à unidade
- Ter acesso a dados estruturados de sintomas que complementam a consulta presencial
- Validar ou contextualizar registros feitos pela paciente dentro da plataforma
- Reduzir a lacuna de informação entre consultas esporádicas e o cotidiano da paciente

### Para a Gestão da Plataforma
- Publicar e gerenciar conteúdo científico curado por editores especializados
- Gerenciar usuárias, profissionais de saúde e níveis de acesso ao sistema
- Monitorar o uso da plataforma e garantir a qualidade do conteúdo disponibilizado

---

## Módulos do Sistema

A plataforma é composta por três grandes módulos, cada um com seu público e responsabilidades distintas:

---

### Módulo 1 — App da Usuária

Interface principal voltada para a mulher que utiliza a plataforma no dia a dia.

**Funcionalidades:**
- Cadastro e autenticação segura
- Registro diário de sintomas (dor, humor, fluxo, cansaço, etc.)
- Calendário dinâmico com visualização das fases do ciclo (menstruação, ovulação, período fértil, fase lútea)
- Previsões personalizadas geradas pelo motor preditivo
- Feed de conteúdo científico curado com recomendações baseadas no perfil
- Localização e encaminhamento para UBSs próximas
- Exportação de histórico clínico para uso em consultas
- Notificações e lembretes de registro

---

### Módulo 2 — Painel Administrativo

Interface restrita para gestão da plataforma. O painel suporta quatro perfis de acesso distintos, cada um com permissões específicas:

#### Perfis de Acesso

| Perfil | Descrição | Permissões Principais |
|---|---|---|
| **Admin Geral** | Controle total da plataforma | Gerenciar usuárias, profissionais, editores, conteúdo, configurações do sistema e relatórios completos |
| **Editor de Conteúdo** | Responsável pelo acervo científico | Criar, editar, publicar e arquivar artigos, guias e vídeos — sem acesso a dados de usuárias |
| **Profissional de Saúde** | Médicos, enfermeiros e agentes de UBSs | Visualizar histórico clínico de pacientes vinculadas, inserir observações e validar dados registrados |
| **Moderador** | Gestão de usuárias e interações | Gerenciar contas de usuárias, revisar conteúdo sinalizado, sem acesso a dados clínicos sensíveis |

**Funcionalidades do Painel:**
- Dashboard com métricas de uso (usuárias ativas, sintomas registrados, conteúdo mais acessado)
- CRUD completo de conteúdo científico (artigos, guias, vídeos)
- Gerenciamento de usuárias e atribuição de permissões
- Vinculação de profissionais de saúde a pacientes ou unidades
- Configuração de categorias de sintomas e fases do ciclo
- Logs de auditoria para ações sensíveis
- Moderação de conteúdo e gerenciamento de denúncias

---

### Módulo 3 — Integração com UBSs

A integração com as Unidades Básicas de Saúde opera em camadas progressivas de profundidade:

#### Nível 1 — Encaminhamento Inteligente
A plataforma identifica, a partir dos dados da usuária, situações que sugerem atenção médica (padrões irregulares, sintomas persistentes) e exibe indicações da UBS mais próxima com endereço, horários e como chegar. Nenhuma integração técnica com o sistema da unidade é necessária nessa camada.

#### Nível 2 — Profissional Vinculado
Profissionais de saúde de UBSs criam conta na plataforma e podem ser vinculados a pacientes que optarem por compartilhar seu histórico. O profissional acessa um painel simplificado com os registros da paciente, complementando a consulta presencial com dados estruturados do cotidiano dela.

#### Nível 3 — Compartilhamento de Dados Clínicos
A usuária pode exportar ou autorizar o envio de seu histórico clínico de forma estruturada — via PDF padronizado ou, futuramente, via integração com sistemas do SUS como o **eSUS** ou a **RNDS (Rede Nacional de Dados em Saúde)**. Essa camada depende de definições técnicas e regulatórias que serão detalhadas em sprints futuras.

---

### Módulo 4 — Conteúdo Científico

Um acervo curado e organizado de conhecimento sobre saúde feminina, acessível dentro do app da usuária.

**Tipos de conteúdo:**

| Formato | Descrição |
|---|---|
| **Artigos e Estudos** | Pesquisas científicas traduzidas para linguagem acessível, com link para a fonte original |
| **Guias e Cartilhas** | Material educativo sobre ciclo menstrual, sintomas comuns, prevenção e cuidados |
| **Vídeos e Mídia** | Conteúdo audiovisual explicativo produzido ou curado pela equipe |
| **Recomendações Personalizadas** | Conteúdo sugerido pelo sistema com base no perfil, histórico e fase atual do ciclo da usuária |

**Gestão do Conteúdo:**
- Todo conteúdo passa por um fluxo de publicação: **Rascunho → Revisão → Publicado → Arquivado**
- Editores de conteúdo gerenciam o acervo via painel administrativo
- Categorias e tags permitem filtragem por tema (ex: endometriose, SOP, menopausa, saúde reprodutiva)
- O motor de recomendação cruza o perfil da usuária com as categorias de conteúdo para personalizar o feed

---

## Stack Tecnológica

### Backend
| Tecnologia | Versão | Papel |
|---|---|---|
| Java | 21 (LTS) | Linguagem principal do backend |
| Spring Boot | 4.0.4 | Framework web e injeção de dependência |
| Spring Security | — | Autenticação, autorização e controle de permissões por perfil |
| Spring Data JPA | — | Abstração do banco de dados |
| Flyway | — | Controle de versão e migração do banco |
| Maven | — | Gerenciador de dependências e build |

O backend é organizado em camadas clássicas: **Controller → Service → Repository**, seguindo boas práticas de separação de responsabilidades. O Spring Security será responsável por implementar o sistema de permissões dos quatro perfis de acesso ao painel administrativo.

### Frontend (atual)
| Tecnologia | Papel |
|---|---|
| React | Biblioteca de UI |
| Vite | Bundler e servidor de desenvolvimento |
| TypeScript | Tipagem estática |

O frontend atual foi iniciado com React + Vite como ponto de partida para validação das telas e fluxos. Uma migração para Next.js está sendo avaliada — veja a seção [Possível Migração para Next.js](#possível-migração-para-nextjs).

---

## Banco de Dados

O projeto utiliza um banco de dados relacional gerenciado com **Flyway**, garantindo que toda evolução do schema seja versionada, rastreável e reproduzível em qualquer ambiente.

**Configuração de segurança:**
- `ddl-auto=validate` — o Hibernate apenas valida o schema, nunca altera automaticamente
- Toda mudança estrutural é feita exclusivamente via migrations Flyway versionadas em `src/main/resources/db/migration`

**Principais entidades modeladas (atual e planejada):**

| Entidade | Descrição |
|---|---|
| `Usuario` | Conta da usuária (app) ou membro da equipe (painel admin) |
| `Perfil` | Tipo de acesso: USUARIA, ADMIN, EDITOR, PROFISSIONAL, MODERADOR |
| `Ciclo` | Registro de cada ciclo menstrual (início, duração) |
| `Sintoma` | Entrada diária da usuária (data, tipo, intensidade) |
| `Previsao` | Resultado do motor preditivo (fases projetadas) |
| `Conteudo` | Artigos, guias e vídeos do acervo científico |
| `Categoria` | Categorias e tags do conteúdo |
| `UBS` | Dados das unidades básicas de saúde cadastradas |
| `Vinculo` | Relação entre profissional de saúde e paciente |
| `AuditoriaLog` | Registro de ações sensíveis para rastreabilidade |

---

## Documentação com Obsidian

Todo o planejamento, raciocínio de decisões arquiteturais, notas de sprint, rascunhos de features e documentação interna do projeto são mantidos em um **Vault Obsidian** dedicado.

**Localização do vault:**
`C:\Users\cntta\OneDrive\Documentos\cuidado-feminino-vault`

O Obsidian foi escolhido por permitir documentação em Markdown com links bidirecionais, tornando fácil conectar ideias — por exemplo, linkar uma nota de decisão arquitetural diretamente à sprint em que ela surgiu. O vault serve como a "memória longa" do projeto: cada decisão de design, cada dilema técnico resolvido e cada feature descartada fica registrada com seu contexto original.

---

## Estrutura do Projeto

```
cuidado-feminino-fullstack/
│
├── backend/                            # Módulo Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/cuidadofeminino/
│   │   │   │       ├── controller/         # Endpoints REST
│   │   │   │       ├── service/            # Regras de negócio e motor preditivo
│   │   │   │       ├── repository/         # Acesso ao banco (Spring Data JPA)
│   │   │   │       ├── model/              # Entidades JPA
│   │   │   │       ├── dto/                # Objetos de transferência de dados
│   │   │   │       ├── security/           # Spring Security, JWT, permissões
│   │   │   │       └── config/             # Configurações globais
│   │   │   └── resources/
│   │   │       ├── db/migration/           # Scripts Flyway (V1__, V2__, ...)
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/                           # Módulo React + Vite (atual)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── app/                    # Páginas do app da usuária
│   │   │   └── admin/                  # Páginas do painel administrativo
│   │   ├── services/                   # Chamadas à API
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

---

## Sprints Concluídas

### Sprint 00 — Setup Fullstack + Persistência de Sintomas ✅

**Objetivo:** Estabelecer a fundação técnica do projeto do zero.

**O que foi feito:**
- Configuração do projeto Spring Boot com Maven
- Modelagem inicial do banco de dados (entidades `Usuária`, `Sintoma`, `Ciclo`)
- Criação dos primeiros endpoints REST para cadastro e listagem de sintomas
- Configuração do frontend React + Vite
- Integração básica frontend → backend via chamadas HTTP

**Resultado:** Sistema funcional com persistência real de dados — a usuária já conseguia registrar sintomas e vê-los salvos no banco.

---

### Sprint 01 — Motor Preditivo Backend ✅

**Objetivo:** Implementar o coração do produto: a lógica que transforma histórico em previsão.

**O que foi feito:**
- Desenvolvimento do motor preditivo em Java 21
- Algoritmo que analisa o histórico de ciclos e calcula a duração média real do ciclo individual da usuária
- Geração de previsões para as próximas fases: menstruação esperada, janela fértil, ovulação estimada e fase lútea
- Persistência das previsões na entidade `Previsão`
- Exposição dos resultados via endpoint REST (`GET /previsoes/{usuarioId}`)

**Resultado:** Backend capaz de gerar previsões personalizadas baseadas no histórico real da usuária.

---

### Pós-Sprint 01 — Correções Críticas de Infraestrutura ✅

**Objetivo:** Estabilizar o ambiente de desenvolvimento e garantir consistência do schema.

**O que foi feito:**
- Reativação do **Flyway** (que havia sido temporariamente desativado durante desenvolvimento)
- Configuração de `spring.jpa.hibernate.ddl-auto=validate` para segurança do schema
- Correção do `pom.xml` com ajustes de dependências incompatíveis
- Commits de referência: `c442b8f`, `f5d5f0f`

**Resultado:** Ambiente estável, schema controlado pelo Flyway, build limpo sem warnings críticos.

---

### Sprint 02 — Calendário Dinâmico (Em andamento) 🔄

**Objetivo:** Tornar as previsões visíveis e navegáveis para a usuária no frontend.

**O que foi feito até agora:**
- Design e planejamento do componente de calendário
- Definição de como representar visualmente as fases do ciclo (cores, indicadores por fase)

**Pendente:**
- Integração do frontend com o endpoint de previsões
- Renderização dinâmica do calendário consumindo dados reais da API
- Testes de usabilidade do fluxo completo

---

## O que Ainda Falta Fazer

### Curto prazo — App da Usuária
- [ ] Concluir Sprint 02 — calendário dinâmico integrado com o backend
- [ ] Implementar autenticação (JWT) — cadastro, login e gerenciamento de sessão
- [ ] Tela de histórico de sintomas com visualização por período
- [ ] Validações robustas no backend (Bean Validation nos DTOs, tratamento global de erros)

### Curto prazo — Painel Administrativo
- [ ] Estrutura base do painel admin com roteamento protegido por perfil
- [ ] CRUD de conteúdo científico (artigos, guias, vídeos) com fluxo de publicação
- [ ] Gerenciamento de usuárias (listagem, ativação/desativação, atribuição de perfil)
- [ ] Cadastro e gerenciamento de profissionais de saúde

### Médio prazo — Conteúdo e Recomendações
- [ ] Feed de conteúdo científico no app da usuária
- [ ] Sistema de categorias e tags para o acervo
- [ ] Motor de recomendação de conteúdo baseado no perfil e fase do ciclo
- [ ] Suporte a vídeos e mídia no acervo

### Médio prazo — Integração com UBSs
- [ ] Cadastro e geolocalização de UBSs na plataforma
- [ ] Funcionalidade de encaminhamento para UBS próxima (Nível 1)
- [ ] Sistema de vínculo entre profissional de saúde e paciente (Nível 2)
- [ ] Painel simplificado do profissional de saúde para acompanhamento de pacientes

### Médio prazo — Segurança e Permissões
- [ ] Implementação do Spring Security com controle de acesso por perfil (RBAC)
- [ ] Logs de auditoria para ações sensíveis no painel admin
- [ ] Política de privacidade e consentimento de compartilhamento de dados

### Longo prazo
- [ ] Dashboard de insights para a usuária (padrões detectados, sintomas por fase)
- [ ] Notificações e lembretes de registro de sintomas
- [ ] Exportação de histórico clínico em PDF padronizado
- [ ] Integração com eSUS / RNDS para compartilhamento estruturado com o SUS (Nível 3)
- [ ] Testes automatizados — unitários (JUnit 5 + Mockito) e de integração
- [ ] Refinamento progressivo do motor preditivo com mais dados acumulados

---

## Como Planejamos Continuar

O desenvolvimento segue um **modelo de sprints curtas e focadas**, cada uma com um objetivo claro e entregável concreto. A filosofia é: antes de avançar para uma nova funcionalidade, a anterior precisa estar integrada ponta a ponta (backend + frontend + banco).

A prioridade imediata é concluir a Sprint 02 (calendário) e iniciar a implementação do painel administrativo em paralelo — pois ele é o alicerce para toda a gestão de conteúdo e de usuárias que virá a seguir.

A integração com UBSs será implementada em camadas progressivas, começando pelo encaminhamento simples (Nível 1), que não depende de integração técnica externa, e avançando para os níveis mais complexos conforme o sistema amadurece.

O vault Obsidian acompanha o planejamento de cada sprint, servindo como espaço de rascunho antes que as decisões se tornem código. O repositório no GitHub reflete o estado atual do código, com commits semânticos que permitem rastrear a evolução de cada decisão técnica.

---

## Possível Migração para Next.js

O frontend atual foi desenvolvido com **React + Vite**, uma escolha adequada para validação inicial. No entanto, dado o escopo do produto — que inclui app da usuária, painel administrativo, feed de conteúdo e integração com dados externos — a migração para **Next.js** está sendo considerada pelas seguintes razões:

**Vantagens técnicas:**
- **Server-Side Rendering (SSR) e Server Components** — performance superior, especialmente para o feed de conteúdo e para o painel admin com muito dado
- **Roteamento de arquivos nativo** — facilita a separação clara entre as rotas do app (`/app/*`) e do painel admin (`/admin/*`) com layouts distintos
- **Middleware de autenticação** — proteção de rotas no nível do servidor, ideal para o controle de acesso por perfil do painel administrativo
- **API Routes** — possibilidade de criar endpoints leves no próprio Next.js para funcionalidades que não justificam um endpoint Spring completo
- **Deploy otimizado** — integração nativa com Vercel, edge functions e caching automático
- **Preparação para PWA** — base para transformar o app da usuária em Progressive Web App com suporte offline

**Status da decisão:** Pendente de confirmação. Nenhuma refatoração do frontend atual será feita com base nessa migração até que a decisão seja formalizada. O backend Spring Boot não é impactado por essa mudança.

---

## Como Rodar o Projeto

### Pré-requisitos
- Java 21+
- Maven 3.9+
- Node.js 20+
- Banco de dados relacional (PostgreSQL recomendado para produção; H2 para desenvolvimento local)

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

O Flyway executará as migrations automaticamente na primeira inicialização. Configure as credenciais do banco em `application.properties` ou via variáveis de ambiente:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cuidado_feminino
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
spring.jpa.hibernate.ddl-auto=validate
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173` e se comunicará com o backend em `http://localhost:8080`.

---

> Construindo uma plataforma que respeita, amplia e conecta o cuidado com a saúde feminina — da previsão do ciclo ao sistema público de saúde.
