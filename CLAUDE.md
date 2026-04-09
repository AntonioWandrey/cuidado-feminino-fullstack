# CLAUDE.md — Cuidado Feminino HealthTech

> Este arquivo é lido automaticamente pelo Claude Code.
> Contém todo o contexto necessário para trabalhar no projeto.

---

## Identidade do Projeto

**Nome:** Cuidado Feminino
**Tipo:** HealthTech assistencial — plataforma de inteligência clínica para saúde feminina
**Fase:** Incubação UNIFEBE | Sprint 01 ativo
**Repositório:** https://github.com/AntonioWandrey/cuidado-feminino-fullstack
**Dev:** Antonio Wandrey — Fullstack + Co-fundador

**Missão:** Transformar registros de sintomas em inteligência clínica baseada em dados reais da usuária.

---

## Stack Obrigatória

### Backend
- **Java 21** (LTS)
- **Spring Boot 3.x**
- **Spring Data JPA** (Hibernate)
- **MariaDB / MySQL**
- **Flyway** para versionamento de migrations
- **Lombok** para redução de boilerplate
- **Maven** como build tool

### Frontend
- **React 18**
- **TypeScript** (strict mode obrigatório)
- **Vite**
- **Tailwind CSS**
- **Shadcn/UI**
- **Axios** com interceptors

### Banco de Dados
- **MariaDB** (compatível com MySQL)
- Modelagem relacional orientada a séries temporais

---

## Arquitetura — Camadas do Backend

```
com.cuidadofeminino
├── application
│   ├── dto/              Records de Request e Response (nunca expor Entity)
│   └── exception/        Exceções customizadas + GlobalExceptionHandler
├── domain
│   ├── entity/           JPA Entities com anotações de ciclo de vida
│   ├── repository/       Interfaces Spring Data JPA
│   └── service/          Regras de negócio + Motor Preditivo
└── infrastructure
    ├── controller/       REST Controllers (@RestController)
    └── config/           CORS, Security, Beans
```

**Fluxo obrigatório de uma requisição:**
```
Controller → Service → Repository → Entity → Banco
Controller ← DTO    ← Service    ← Entity ← Banco
```

---

## Padrões Obrigatórios

### Código
- **Clean Code** — métodos com no máximo 20-30 linhas, nomes descritivos
- **SOLID** — especialmente Single Responsibility e Dependency Inversion
- **DTOs sempre** — nunca retornar Entity diretamente no Controller
- **Records Java** para DTOs (imutáveis, sem boilerplate)
- **Lombok** nas Entities (@Getter, @Setter, @Builder, @NoArgsConstructor, @AllArgsConstructor)
- **@Slf4j** para logs — nunca usar System.out.println
- **GlobalExceptionHandler** com @RestControllerAdvice para todos os erros

### Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Classes | PascalCase | CicloMenstrual, MotorPreditivoCiclo |
| Métodos | camelCase com verbo | calcularPrevisao(), buscarUltimoCiclo() |
| Variáveis | camelCase descritivas | mediaDuracaoCiclo, ciclosAnalisados |
| Constantes | UPPER_SNAKE_CASE | DIAS_FASE_LUTEA, DURACAO_PADRAO |
| Endpoints | kebab-case | /api/v1/ciclos, /api/v1/ciclos/{id}/encerrar |
| Migrations | Flyway padrão | V1__initial_schema.sql, V2__create_cycle_tables.sql |

### Git — Conventional Commits (obrigatório)

```
feat(escopo): descricao curta em minusculo
fix(escopo): descricao
refactor(escopo): descricao
docs(escopo): descricao
test(escopo): descricao
chore(escopo): descricao
```

**Escopos do projeto:** ciclo, sintoma, auth, calendario, banco, relatorio, infra

---

## Segurança e LGPD

- **JWT Stateless** planejado para Sprint 04 — preparar estrutura agora
- **Nunca expor stack trace** nas respostas de erro (apenas mensagem)
- **PreparedStatements sempre** (garantido pelo JPA, nunca usar query string concatenada)
- **Dados sensíveis** — ciclos e sintomas são dados de saúde (sensíveis pela LGPD)
- **DTOs** evitam exposição acidental de campos da Entity
- **Validação** em todos os endpoints com @Valid + Bean Validation

---

## Banco de Dados — Estado Atual

### Migrations existentes
- `V1__initial_schema.sql` — schema inicial com tabela de sintomas

### Migrations a criar (Sprint 01)
- `V2__create_cycle_tables.sql` — tabelas ciclo_menstrual e previsao_ciclo

### Entidades do domínio (Sprint 01)

**ciclo_menstrual**
```sql
id              BIGINT PK AUTO_INCREMENT
usuario_id      BIGINT FK (usuario — Sprint 04)
data_inicio     DATE NOT NULL
data_fim        DATE NULL (null = ciclo em aberto)
duracao_dias    INT NULL (calculado via @PrePersist/@PreUpdate)
fluxo           ENUM('LEVE','MODERADO','INTENSO','MUITO_INTENSO')
observacoes     TEXT
criado_em       DATETIME
atualizado_em   DATETIME
```

**previsao_ciclo**
```sql
id                      BIGINT PK AUTO_INCREMENT
usuario_id              BIGINT FK
gerada_em               DATETIME
media_duracao_ciclo     DECIMAL(5,2)
desvio_padrao           DECIMAL(5,2) NULL
ciclos_analisados       INT
proxima_menstruacao     DATE
data_ovulacao           DATE
inicio_periodo_fertil   DATE
fim_periodo_fertil      DATE
confianca               ENUM('BAIXA','MEDIA','ALTA')
```

---

## Motor Preditivo — Algoritmo (Sprint 01)

**Classe:** `MotorPreditivoCiclo` em `domain/service/`
**Tipo:** @Component (não @Service — é um componente de cálculo puro)

### Algoritmo
1. Busca os últimos 12 ciclos completos (com data_fim) da usuária
2. Calcula **média móvel ponderada** — ciclos mais recentes têm peso maior
3. Fallback: 28 dias se não houver histórico suficiente
4. Calcula **desvio padrão** para medir regularidade
5. Define **nível de confiança:**
   - BAIXA: menos de 3 ciclos
   - MEDIA: 3 a 5 ciclos
   - ALTA: 6 ou mais ciclos
6. Calcula datas:
   - Próxima menstruação = última data_inicio + média
   - Ovulação = próxima menstruação - 14 dias (fase lútea padrão)
   - Início do período fértil = ovulação - 5 dias
   - Fim do período fértil = ovulação + 1 dia

---

## API REST — Endpoints (Sprint 01)

**Base URL:** `/api/v1`

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| POST | /ciclos | Registrar início de ciclo | Sprint 01 |
| PATCH | /ciclos/{id}/encerrar | Encerrar ciclo em aberto | Sprint 01 |
| GET | /ciclos | Listar ciclos da usuária | Sprint 01 |
| GET | /ciclos/previsao | Obter previsão do próximo ciclo | Sprint 01 |
| GET | /ciclos/calendario?meses=3 | Projeção para o calendário | Sprint 01 |

**Códigos de status obrigatórios:**
- 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 409 Conflict, 500 Internal Server Error

---

## Frontend — Calendário (Sprint 02)

**Código de cores:**
- 🔴 Vermelho — dias de menstruação
- 🔵 Azul — período fértil
- 🟡 Amarelo — ovulação

---

## Roadmap de Sprints

| Sprint | Foco | Status |
|--------|------|--------|
| Sprint 00 | Setup fullstack + persistência de sintomas | ✅ Concluído |
| Sprint 01 | Motor Preditivo de Ciclo Menstrual | 🔄 Ativo |
| Sprint 02 | Calendário dinâmico com código de cores | ⏳ Próximo |
| Sprint 03 | Log sexual, contraceptivos, libido | ⏳ Futuro |
| Sprint 04 | JWT Stateless + relatórios médicos PDF | ⏳ Futuro |

---

## O que já está implementado (Sprint 00)

- Comunicação fullstack funcional (React ↔ Spring Boot)
- Persistência de sintomas via API
- Interface responsiva mobile-first
- Sistema de alertas com integração a mapas
- Configuração de CORS para desenvolvimento local

---

## Regras de Ouro

1. **Nunca** retornar Entity diretamente — sempre usar DTO
2. **Nunca** expor stack trace na resposta de erro
3. **Nunca** usar System.out.println — usar @Slf4j
4. **Sempre** validar entrada com @Valid
5. **Sempre** usar Conventional Commits
6. **Sempre** criar migration Flyway para mudanças no banco
7. **Sempre** pensar em LGPD ao manipular dados de saúde
8. **Código em inglês**, comentários e commits em português

---

## Como Rodar o Projeto

### Backend
```bash
cd backend
./mvnw spring-boot:run
# Porta padrão: 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Porta padrão: 5173
```

### Banco
```
Host: localhost
Porta: 3306
Database: cuidado_feminino
```
