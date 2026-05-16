-- V4: Tabela de Registro de Queixas Ginecológicas (Sprint 02.B)

CREATE TABLE IF NOT EXISTS registro_queixa (
    id                      BIGINT       NOT NULL AUTO_INCREMENT,
    usuario_id              BIGINT       NOT NULL DEFAULT 1,
    data_registro           DATE         NOT NULL,
    tipo_queixa             ENUM(
                                'CORRIMENTO',
                                'COLICA',
                                'SANGRAMENTO_FORA_PERIODO',
                                'DOR_URINAR',
                                'DOR_PELVICA',
                                'ALTERACAO_HUMOR',
                                'FOGACHO',
                                'OUTRO'
                            )            NOT NULL,
    intensidade             ENUM('LEVE','MODERADA','INTENSA'),
    descricao               TEXT,
    duracao_horas           INT,
    corrimento_cor          VARCHAR(50),
    corrimento_odor         BOOLEAN,
    corrimento_coceira      BOOLEAN,
    sangramento_volume      ENUM('LEVE','MODERADO','INTENSO'),
    conteudo_relacionado_id BIGINT,
    criado_em               DATETIME     NOT NULL,
    atualizado_em           DATETIME,
    PRIMARY KEY (id),
    INDEX idx_queixa_usuario (usuario_id),
    INDEX idx_queixa_data (data_registro),
    INDEX idx_queixa_tipo (tipo_queixa),
    CONSTRAINT fk_queixa_conteudo
        FOREIGN KEY (conteudo_relacionado_id) REFERENCES conteudo_educativo (id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
