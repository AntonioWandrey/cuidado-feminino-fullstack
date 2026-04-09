-- V1: Schema inicial — tabela de registros de sintomas (Sprint 00)
CREATE TABLE IF NOT EXISTS registros_saude (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    fase_vida     VARCHAR(100) NOT NULL,
    cor_muco      VARCHAR(100),
    possui_odor   BOOLEAN      NOT NULL DEFAULT FALSE,
    dor_pelvica   BOOLEAN      NOT NULL DEFAULT FALSE,
    alerta_ubs    BOOLEAN      NOT NULL DEFAULT FALSE,
    data_registro DATETIME,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
