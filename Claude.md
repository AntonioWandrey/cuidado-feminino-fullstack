# CLAUDE.md — Cuidado Feminino HealthTech

> Este arquivo é lido automaticamente pelo Claude Code.
> Contém todo o contexto necessário para trabalhar no projeto.

---

## Identidade do Projeto

**Nome:** Minha Saúde Feminina (MS Feminina)
**Tipo:** HealthTech assistencial — app mobile de inteligência clínica para saúde feminina
**Fase:** Incubação UNIFEBE (Propex) | Sprint 01 em andamento
**Repositório:** https://github.com/AntonioWandrey/cuidado-feminino-fullstack
**Dev:** Antonio Wandrey — Fullstack + Co-fundador

**Missão:** Transformar registros de sintomas em inteligência clínica baseada em dados reais da usuária, gerando relatórios pré-consulta que conectam paciente e médico.

**Diferencial:** Ponte de inteligência clínica entre paciente e ginecologista — gera relatórios pré-consulta a partir dos dados do ciclo menstrual (ausente em Flo, Clue e concorrentes globais).

---

## Stack Técnica

### Backend
- Java 21
- Spring Boot 3.x
- Spring Data JPA
- Spring Security (preparado para JWT Stateless)
- MariaDB
- Flyway (migrations)
- Maven
- Lombok

### Frontend
- React 18
- TypeScript (strict mode)
- Vite
- Tailwind CSS
- Shadcn/UI

---

## Identidade Visual

### Paleta de Cores
| Nome | Hex | Uso |
|------|-----|-----|
| Creme | `#FBF4EB` | Background principal |
| Rosa claro | `#FBD9E5` | Cards, destaque suave |
| Vermelho cereja | `#C43A4A` | CTA principal, alertas, menstruação |
| Rosa mauve | `#C56682` | Textos de destaque, ícones |
| Pêssego | `#E7A48C` | Acentos, badges, hover |

### Tipografia
- **Display/Logo:** Leckerli One
- **Body/UI:** Gabriel Sans Condensed
- Importar do Google Fonts

### Elementos Visuais
- Ícone: flor de hibisco estilizada + silhueta feminina
- Patterns: florais tropicais em tons de rosa/cereja
- Bordas arredondadas em cards (border-radius: 12px mínimo)
- Sombras suaves (shadow-sm/md do Tailwind)

### Cores do Calendário (fases do ciclo)
| Fase | Cor | Hex sugerido |
|------|-----|-------------|
| Menstruação | Vermelho | `#C43A4A` |
| Período fértil | Azul | `#4A90C4` |
| Ovulação | Amarelo | `#E8B84A` |
| Fase lútea | Rosa suave | `#FBD9E5` |

---

## Arquitetura de Camadas

```
src/main/java/com/cuidadofeminino/
├── config/          # Segurança, CORS, beans
├── controller/      # REST endpoints — NUNCA lógica de negócio aqui
├── dto/             # Request/Response DTOs — ÚNICA coisa exposta na API
├── entity/          # JPA entities — NUNCA expostas via API
├── enums/           # Enums do domínio
├── exception/       # Exceções customizadas + GlobalExceptionHandler
├── repository/      # Spring Data JPA interfaces
├── service/         # Toda lógica de negócio aqui
└── util/            # Utilitários e helpers
```

---

## Padrões Obrigatórios

### Clean Code
- Métodos curtos (max ~20 linhas)
- Nomes descritivos em inglês
- Single Responsibility por método e classe
- Sem comentários óbvios — código autoexplicativo

### SOLID
- **S:** Uma responsabilidade por classe
- **O:** Aberto para extensão, fechado para modificação
- **L:** Subtipos substituíveis
- **I:** Interfaces segregadas
- **D:** Depender de abstrações (Service depende de Repository interface)

### Regras Absolutas
1. **NUNCA** retornar Entity diretamente — sempre usar DTO
2. **NUNCA** expor stack trace na resposta de erro
3. **NUNCA** usar System.out.println — usar @Slf4j
4. **SEMPRE** validar entrada com @Valid
5. **SEMPRE** usar Conventional Commits
6. **SEMPRE** criar migration Flyway para mudanças no banco
7. **SEMPRE** pensar em LGPD ao manipular dados de saúde
8. **Código em inglês**, comentários e commits em português

### Conventional Commits (Scopes do Projeto)
```
feat(cycle): adicionar cálculo de ovulação
fix(auth): corrigir validação de token JWT
refactor(service): extrair lógica de previsão
docs(api): documentar endpoint de previsões
style(ui): aplicar identidade visual ao calendário
feat(content): criar CRUD de conteúdo educativo
feat(admin): criar painel administrativo
feat(symptom): adicionar registro de corrimento
```

---

## Segurança e LGPD

### Princípios
- Dados de saúde são **sensíveis** (LGPD Art. 11)
- Consentimento explícito e granular
- Minimização de dados — coletar apenas o necessário
- Criptografia de dados sensíveis em repouso
- Logs de acesso a dados de saúde
- Direito ao esquecimento implementado

### Estrutura de Segurança
- JWT Stateless (preparar estrutura, implementação futura)
- GlobalExceptionHandler — nunca vazar stack trace
- Prepared Statements (JPA faz por padrão) — sem SQL Injection
- CORS configurado
- Rate limiting (futuro)

---

## Sprint 00 — Base (CONCLUÍDO ✅)

- Projeto Spring Boot configurado
- Conexão MariaDB funcional
- Entidades base criadas
- Frontend React + TypeScript + Vite + Tailwind + Shadcn
- Integração fullstack funcional
- Persistência de sintomas via API
- CORS configurado

---

## Sprint 01 — Motor Preditivo de Ciclo (EM ANDAMENTO 🔄)

### Entidades do Banco

```sql
-- Registro de cada ciclo menstrual
CREATE TABLE ciclo_menstrual (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    duracao_ciclo INT,           -- dias entre início deste e início do próximo
    duracao_sangramento INT,     -- dias de sangramento
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- Previsões geradas pelo motor
CREATE TABLE previsao_ciclo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    data_prevista_menstruacao DATE NOT NULL,
    data_inicio_periodo_fertil DATE,
    data_fim_periodo_fertil DATE,
    data_ovulacao DATE,
    confianca ENUM('BAIXA', 'MEDIA', 'ALTA') NOT NULL,
    ciclos_analisados INT NOT NULL,
    desvio_padrao_dias DECIMAL(4,2),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
```

### Algoritmo Preditivo

```
1. Buscar ciclos da usuária ordenados por data
2. Se 0 ciclos → fallback 28 dias, confiança BAIXA
3. Se 1-2 ciclos → média simples, confiança BAIXA
4. Se 3-5 ciclos → média ponderada (recentes pesam mais), confiança MÉDIA
5. Se 6+ ciclos → média ponderada + desvio padrão, confiança ALTA

Pesos (média ponderada):
- Último ciclo: peso 3
- Penúltimo: peso 2
- Anteriores: peso 1

Cálculos derivados:
- Ovulação = Data prevista menstruação - 14 dias
- Período fértil = Ovulação - 5 dias até Ovulação + 1 dia
- Desvio padrão = √(Σ(xi - média)² / n)
```

### Endpoints REST

```
GET    /api/ciclos                     → listar ciclos da usuária
POST   /api/ciclos                     → registrar novo ciclo
GET    /api/ciclos/{id}                → buscar ciclo por id
PUT    /api/ciclos/{id}                → atualizar ciclo
DELETE /api/ciclos/{id}                → deletar ciclo

GET    /api/previsoes                  → buscar previsão atual
POST   /api/previsoes/calcular         → forçar recálculo
GET    /api/previsoes/historico        → histórico de previsões
```

---

## Sprint 02 — Conteúdo Educativo e Queixas Ginecológicas (PLANEJADO 📋)

### Sistema de Conteúdo Educativo

O app deve ter uma aba de conteúdos com informações de saúde baseadas em evidências científicas. Os conteúdos são organizados por categorias e séries.

#### Entidades

```sql
-- Categorias de conteúdo
CREATE TABLE categoria_conteudo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conteúdos educativos
CREATE TABLE conteudo_educativo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    categoria_id BIGINT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    subtitulo VARCHAR(300),
    corpo TEXT NOT NULL,                    -- conteúdo em markdown ou HTML
    palavras_chave VARCHAR(500),            -- para busca: "saúde,SUS,prevenção,hormônios"
    tempo_leitura_min INT,
    fonte_referencia TEXT,                  -- links de referências científicas
    imagem_capa_url VARCHAR(500),
    ativo BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,         -- aparece na home como card rotativo
    perfil_alvo ENUM('TODAS','ADOLESCENTE','TENTANTE','GESTANTE','MENOPAUSA'),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categoria_conteudo(id)
);

-- Séries de conteúdo (ex: "Tentando Engravidar")
CREATE TABLE serie_conteudo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relação série ↔ conteúdo (N:N)
CREATE TABLE serie_conteudo_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    serie_id BIGINT NOT NULL,
    conteudo_id BIGINT NOT NULL,
    ordem INT DEFAULT 0,
    FOREIGN KEY (serie_id) REFERENCES serie_conteudo(id),
    FOREIGN KEY (conteudo_id) REFERENCES conteudo_educativo(id)
);
```

#### Conteúdos Mapeados pela Equipe Médica

Os seguintes temas já possuem conteúdo validado por profissionais de saúde:

1. **Corrimento vaginal** — O que é normal vs sinais de alerta, quando procurar a UBS
2. **Cólica menstrual** — Cuidados em casa, quando buscar avaliação médica
3. **Atraso menstrual** — Quando fazer teste, quando procurar UBS
4. **Sangramento fora do período** — Diário de registro, sinais de alerta
5. **Dor/ardor ao urinar** — Sintomas associados, quando buscar ajuda
6. **Conheça seu ciclo menstrual** — Ciclo de 21-36 dias é normal, como registrar
7. **TPM e alterações emocionais** — Causas hormonais, cuidados em casa
8. **Prevenção câncer de colo do útero** — Papanicolau, HPV, sinais de alerta
9. **Prevenção câncer de mama** — Autoexame, mamografia, sinais de alerta
10. **Violência contra a mulher** — Violentômetro, canais de denúncia (180, CRAS)
11. **Climatério e menopausa** — Sintomas, fogachos, dicas práticas
12. **Autocuidado e hábitos saudáveis** — Rotina, exercício, sono

**Série 1: Tentando Engravidar**
- Tópico 1.1: Período fértil sem neura — entendendo seu ciclo na prática

#### Funcionalidades da Aba de Conteúdo
- Busca por palavras-chave (tags: saúde, SUS, prevenção, hormônios, bem-estar, autocuidado, ciclo, consultas)
- Filtro por categoria/série
- Cards rotativos na home com conteúdo em destaque
- Conteúdo personalizado por perfil (adolescente, tentante, gestante, menopausa)
- Tempo estimado de leitura em cada card
- Trilhas de aprendizado por fase da vida (ex: "Trilha da Adolescente", "Trilha da Gestante")

#### Endpoints REST (Conteúdo)
```
GET    /api/conteudos                      → listar conteúdos (paginado, filtros)
GET    /api/conteudos/{id}                 → buscar conteúdo por id
GET    /api/conteudos/busca?q=             → busca por palavras-chave
GET    /api/conteudos/destaque             → conteúdos em destaque para home
GET    /api/conteudos/perfil/{perfil}      → conteúdos por perfil alvo

GET    /api/categorias                     → listar categorias
GET    /api/series                         → listar séries
GET    /api/series/{id}/conteudos          → conteúdos de uma série
```

---

## Sprint 02.B — Registro de Queixas Ginecológicas (PLANEJADO 📋)

### Diário de Queixas

Integrar ao calendário: a usuária registra queixas no dia, que ficam vinculadas ao calendário para apresentar ao ginecologista.

```sql
CREATE TABLE registro_queixa (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    data_registro DATE NOT NULL,
    tipo_queixa ENUM(
        'CORRIMENTO',
        'COLICA',
        'SANGRAMENTO_FORA_PERIODO',
        'DOR_URINAR',
        'DOR_PELVICA',
        'ALTERACAO_HUMOR',
        'FOGACHO',
        'OUTRO'
    ) NOT NULL,
    intensidade ENUM('LEVE','MODERADA','INTENSA'),
    descricao TEXT,
    duracao_horas INT,
    -- Campos específicos por tipo
    corrimento_cor VARCHAR(50),               -- branco, amarelado, esverdeado, acinzentado
    corrimento_odor BOOLEAN,
    corrimento_coceira BOOLEAN,
    sangramento_volume ENUM('LEVE','MODERADO','INTENSO'),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
```

Cada tipo de queixa tem um "clique para saber mais" que abre o conteúdo educativo correspondente.

---

## Sprint 03 — Calendário Dinâmico no Frontend (PLANEJADO 📋)

### Requisitos do Calendário
- Visualização mensal com cores por fase do ciclo
- Integração com: sintomas registrados, humor, lembretes
- Ícones nos dias com registros (menstruação, queixa, sintoma)
- Referência visual: Projeto 7 do benchmark (melhor avaliação)

### Aba de Análise do Ciclo
- Duração média do ciclo da usuária
- Análise dos últimos ciclos (gráfico de tendência)
- Ciclo mais longo e mais curto
- Classificação: Regular / Irregular
- Explicações sobre cada fase (folicular, ovulatória, lútea, menstrual)

---

## Sprint 04 — Lembretes (PLANEJADO 📋)

- Aba exclusiva para lembretes
- Tipos: anticoncepcional, consultas médicas, exames preventivos, ciclo menstrual
- Notificações push (futuro — PWA/mobile)

---

## Sprint 05 — Apoio e Rede de Cuidado (PLANEJADO 📋)

- Contatos úteis: UBS, Disque Saúde (136), CVV (188), Delegacia da Mulher, CRAS
- Botão "Ligar" direto para cada serviço
- Violentômetro integrado (escala visual de sinais de abuso)
- Perguntas anônimas (futuro)

---

## Sprint 06 — Painel Administrativo (PLANEJADO 📋)

### App Admin (separado do app da usuária)

Frontend administrativo para equipe médica e gestão do conteúdo.

#### Funcionalidades Core
1. **CRUD de Conteúdos Educativos** — criar, editar, publicar, despublicar
2. **CRUD de Categorias e Séries** — organizar conteúdo
3. **Gerenciamento de Usuárias** — visualizar métricas (sem acesso a dados clínicos individuais sem consentimento)
4. **Dashboard** — métricas: total de usuárias, conteúdos publicados, categorias ativas
5. **Gerenciamento de Lembretes-padrão**
6. **Moderação de Perguntas Anônimas** (futuro)

#### Estrutura do Admin
```
frontend-admin/           # Projeto React separado
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── ConteudoList.tsx
│   │   ├── ConteudoForm.tsx
│   │   ├── CategoriaList.tsx
│   │   ├── SerieList.tsx
│   │   └── UsuariaList.tsx
│   ├── services/         # API calls
│   ├── hooks/
│   └── types/
```

#### Endpoints REST (Admin)
```
# Conteúdos (CRUD completo)
GET    /api/admin/conteudos                → listar todos (com inativos)
POST   /api/admin/conteudos               → criar conteúdo
PUT    /api/admin/conteudos/{id}           → editar conteúdo
DELETE /api/admin/conteudos/{id}           → soft delete
PATCH  /api/admin/conteudos/{id}/toggle    → ativar/desativar

# Categorias
POST   /api/admin/categorias              → criar categoria
PUT    /api/admin/categorias/{id}         → editar
DELETE /api/admin/categorias/{id}         → deletar

# Séries
POST   /api/admin/series                   → criar série
PUT    /api/admin/series/{id}             → editar
POST   /api/admin/series/{id}/conteudos   → vincular conteúdo à série

# Dashboard
GET    /api/admin/dashboard                → métricas gerais
```

---

## Estrutura da Home (App Usuária)

### Layout da Home
1. **Header** — Nome da usuária, avatar, notificações
2. **Card de Próxima Menstruação** — data prevista + contagem regressiva ("em X dias")
3. **Card de Informações do Ciclo** — duração do ciclo, duração do período, última menstruação
4. **Card de Estatísticas** — ciclos registrados, duração média, regulação (Regular/Irregular)
5. **Card de Registros de Sintomas** — quantidade de registros recentes
6. **Conteúdo em Destaque** — cards rotativos com conteúdo educativo personalizado por perfil
7. **Dica de Saúde do Dia** — frase motivacional + dica rápida
8. **Busca de Conteúdo** — campo de busca + tags populares (saúde, SUS, prevenção, hormônios, etc.)

### Tela de Abertura (Splash)
- Logo MS Feminina com animação suave
- Frase motivacional rotativa
- Transição suave para login/home

### Navegação (Bottom Bar)
```
Home | Calendário | + Registro | Conteúdos | Perfil
```

---

## Aviso Legal Obrigatório

Em TODA tela que exibir informação de saúde ou registro de sintomas:
```
⚠️ Essas informações não substituem avaliação médica.
Procure sempre a UBS para confirmação e acompanhamento.
```

---

## Modelo de Negócio

**B2C Freemium** com 3 tiers:
| Tier | Preço | Funcionalidades |
|------|-------|-----------------|
| Free | R$0 | Calendário básico, registro de ciclo, conteúdo educativo limitado |
| Pro | R$19,90/mês | Motor preditivo completo, análise de ciclo, conteúdo ilimitado, relatório pré-consulta |
| Clínica | R$49,90/mês | Tudo do Pro + integração com profissional de saúde, compartilhamento de dados |

---

## Como Rodar o Projeto

### Backend
```bash
cd backend
./mvnw spring-boot:run
# Porta padrão: 8080
```

### Frontend (App Usuária)
```bash
cd frontend
npm install
npm run dev
# Porta padrão: 5173
```

### Frontend (Admin) — quando criado
```bash
cd frontend-admin
npm install
npm run dev
# Porta padrão: 5174
```

### Banco
```
Host: localhost
Porta: 3306
Database: cuidado_feminino
```

---

## Referências Científicas (Equipe Médica)

Todos os conteúdos de saúde devem referenciar fontes como:
- Protocolos de Atenção Básica à Saúde das Mulheres (MS)
- Ebook Saúde da Mulher (SMS Brusque/UNIFEBE)
- Programa Dignidade Menstrual (Gov.br)
- Diretrizes INCA (câncer de colo e mama)
- Lei Maria da Penha (Lei 11.340/2006)
- Protocolos de Pré-Natal (SMS Brusque)
