-- V2: Tabelas do Motor Preditivo de Ciclo Menstrual (Sprint 01)

CREATE TABLE IF NOT EXISTS ciclo_menstrual (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    usuario_id    BIGINT       NOT NULL DEFAULT 1,
    data_inicio   DATE         NOT NULL,
    data_fim      DATE,
    duracao_dias  INT,
    fluxo         ENUM('LEVE','MODERADO','INTENSO','MUITO_INTENSO'),
    observacoes   TEXT,
    criado_em     DATETIME     NOT NULL,
    atualizado_em DATETIME,
    PRIMARY KEY (id),
    INDEX idx_ciclo_usuario (usuario_id),
    INDEX idx_ciclo_data_inicio (data_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS previsao_ciclo (
    id                      BIGINT         NOT NULL AUTO_INCREMENT,
    usuario_id              BIGINT         NOT NULL DEFAULT 1,
    gerada_em               DATETIME       NOT NULL,
    media_duracao_ciclo     DECIMAL(5,2),
    desvio_padrao           DECIMAL(5,2),
    ciclos_analisados       INT,
    proxima_menstruacao     DATE,
    data_ovulacao           DATE,
    inicio_periodo_fertil   DATE,
    fim_periodo_fertil      DATE,
    confianca               ENUM('BAIXA','MEDIA','ALTA'),
    PRIMARY KEY (id),
    INDEX idx_previsao_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
