-- V3: Tabelas do Sistema de Conteúdo Educativo (Sprint 02)

CREATE TABLE IF NOT EXISTS categoria_conteudo (
    id        BIGINT       NOT NULL AUTO_INCREMENT,
    nome      VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone     VARCHAR(50),
    ordem     INT          NOT NULL DEFAULT 0,
    ativo     BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em DATETIME     NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_categoria_ativo (ativo),
    INDEX idx_categoria_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conteudo_educativo (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    categoria_id      BIGINT       NOT NULL,
    titulo            VARCHAR(200) NOT NULL,
    subtitulo         VARCHAR(300),
    corpo             TEXT         NOT NULL,
    palavras_chave    VARCHAR(500),
    tempo_leitura_min INT,
    fonte_referencia  TEXT,
    imagem_capa_url   VARCHAR(500),
    ativo             BOOLEAN      NOT NULL DEFAULT TRUE,
    destaque          BOOLEAN      NOT NULL DEFAULT FALSE,
    perfil_alvo       ENUM('TODAS','ADOLESCENTE','TENTANTE','GESTANTE','MENOPAUSA') NOT NULL DEFAULT 'TODAS',
    criado_em         DATETIME     NOT NULL,
    atualizado_em     DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (categoria_id) REFERENCES categoria_conteudo(id),
    INDEX idx_conteudo_categoria (categoria_id),
    INDEX idx_conteudo_ativo (ativo),
    INDEX idx_conteudo_destaque (destaque),
    INDEX idx_conteudo_perfil (perfil_alvo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS serie_conteudo (
    id        BIGINT       NOT NULL AUTO_INCREMENT,
    nome      VARCHAR(200) NOT NULL,
    descricao TEXT,
    icone     VARCHAR(50),
    ordem     INT          NOT NULL DEFAULT 0,
    ativo     BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em DATETIME     NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_serie_ativo (ativo),
    INDEX idx_serie_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS serie_conteudo_item (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    serie_id    BIGINT NOT NULL,
    conteudo_id BIGINT NOT NULL,
    ordem       INT    NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (serie_id)    REFERENCES serie_conteudo(id),
    FOREIGN KEY (conteudo_id) REFERENCES conteudo_educativo(id),
    UNIQUE KEY uq_serie_conteudo (serie_id, conteudo_id),
    INDEX idx_item_serie (serie_id),
    INDEX idx_item_conteudo (conteudo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
