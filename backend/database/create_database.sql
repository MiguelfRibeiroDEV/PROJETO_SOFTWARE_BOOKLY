
-- =========================================================
-- BANCO DE DADOS
-- =========================================================
CREATE DATABASE IF NOT EXISTS bookly_db;
USE bookly_db;

CREATE TABLE livreiro (
    id_livreiro         INT AUTO_INCREMENT PRIMARY KEY,
    login               VARCHAR(50)  NOT NULL UNIQUE,
    senha               VARCHAR(255) NOT NULL,
    usuario             VARCHAR(50)  NOT NULL UNIQUE,
    cpf                 CHAR(11)     NOT NULL UNIQUE,
    telefone            VARCHAR(20),
    email               VARCHAR(150) NOT NULL UNIQUE,
    primeiro_nome       VARCHAR(100) NOT NULL,
    segundo_nome        VARCHAR(100),
    data_nascimento     DATE,
    data_cadastro       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    livros_registrados  INT      DEFAULT 0,
    livros_vendidos     INT      DEFAULT 0,
    total_faturado      DECIMAL(12,2) DEFAULT 0,
    -- atributo composto "endereco"
    endereco_rua         VARCHAR(150),
    endereco_numero      VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro      VARCHAR(100),
    endereco_cidade      VARCHAR(100),
    endereco_estado      CHAR(2),
    endereco_cep         VARCHAR(9)
) ENGINE=InnoDB;

-- =========================================================
-- Entidade COMPRADOR
-- =========================================================
CREATE TABLE comprador (
    id_comprador        INT AUTO_INCREMENT PRIMARY KEY,
    login               VARCHAR(50)  NOT NULL UNIQUE,
    senha               VARCHAR(255) NOT NULL,
    usuario             VARCHAR(50)  NOT NULL UNIQUE,
    cpf                 CHAR(11)     NOT NULL UNIQUE,
    telefone            VARCHAR(20),
    email               VARCHAR(150) NOT NULL UNIQUE,
    primeiro_nome       VARCHAR(100) NOT NULL,
    segundo_nome        VARCHAR(100),
    data_nascimento     DATE,
    data_cadastro       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    livros_comprados    INT      DEFAULT 0,
    -- atributo composto "endereco"
    endereco_rua         VARCHAR(150),
    endereco_numero      VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro      VARCHAR(100),
    endereco_cidade      VARCHAR(100),
    endereco_estado      CHAR(2),
    endereco_cep         VARCHAR(9)
) ENGINE=InnoDB;

-- =========================================================
-- Entidade CATEGORIA
-- =========================================================
CREATE TABLE categoria (
    id_categoria   INT AUTO_INCREMENT PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL,
    descricao      TEXT,
    codigo_index   VARCHAR(20) UNIQUE
) ENGINE=InnoDB;

-- =========================================================
-- Entidade LIVRO
-- Relacionamentos:
--   LIVREIRO (1) --- TEM --- (N) LIVRO  -> FK id_livreiro
--   CATEGORIA (1) --- TEM --- (N) LIVRO -> FK id_categoria
-- =========================================================
CREATE TABLE livro (
    id_livro        INT AUTO_INCREMENT PRIMARY KEY,
    isbn            VARCHAR(20)  NOT NULL UNIQUE,
    nome            VARCHAR(200) NOT NULL,
    autor           VARCHAR(150) NOT NULL,
    editora         VARCHAR(150),
    volume          VARCHAR(20),
    idioma          VARCHAR(50),
    ano_publicacao  INT,
    numero_paginas  INT,
    sinopse         TEXT,
    id_livreiro     INT NOT NULL,
    id_categoria    INT NOT NULL,
    CONSTRAINT fk_livro_livreiro  FOREIGN KEY (id_livreiro)  REFERENCES livreiro(id_livreiro),
    CONSTRAINT fk_livro_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
) ENGINE=InnoDB;

-- =========================================================
-- Entidade ITEM (exemplar físico do LIVRO à venda)
-- Relacionamentos:
--   LIVRO (1) --- TEM --- (N) ITEM      -> FK id_livro
--   COMPRADOR (1) --- COMPRA --- (N) ITEM -> FK id_comprador (nulo até ser vendido)
-- =========================================================
CREATE TABLE item (
    id_item             INT AUTO_INCREMENT PRIMARY KEY,
    preco               DECIMAL(10,2) NOT NULL,
    edicao              VARCHAR(50),
    descricao           TEXT,
    ano_aquisicao       INT,
    conservacao         VARCHAR(50),
    dedicatorio         BOOLEAN DEFAULT FALSE,
    raridade            VARCHAR(50),
    tipo_capa           VARCHAR(50),
    presenca_de_grifos  BOOLEAN DEFAULT FALSE,
    fotos_item          TEXT,          -- URLs/paths separados por vírgula ou JSON
    id_livro            INT NOT NULL,
    id_comprador        INT,
    CONSTRAINT fk_item_livro     FOREIGN KEY (id_livro)     REFERENCES livro(id_livro),
    CONSTRAINT fk_item_comprador FOREIGN KEY (id_comprador) REFERENCES comprador(id_comprador)
) ENGINE=InnoDB;

-- =========================================================
-- Entidade ESTIMATIVA (histórico de estimativas de preço de um ITEM)
-- Relacionamento:
--   ITEM (1) --- TEM --- (N) ESTIMATIVA -> FK id_item
-- =========================================================
CREATE TABLE estimativa (
    id_estimativa       INT AUTO_INCREMENT PRIMARY KEY,
    date_time            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    preco_estimado       DECIMAL(10,2),
    possivel_descricao   TEXT,
    id_item              INT NOT NULL,
    CONSTRAINT fk_estimativa_item FOREIGN KEY (id_item) REFERENCES item(id_item)
) ENGINE=InnoDB;

-- =========================================================
-- Índices úteis para as FKs (melhoram performance de joins)
-- =========================================================
CREATE INDEX idx_livro_livreiro   ON livro(id_livreiro);
CREATE INDEX idx_livro_categoria  ON livro(id_categoria);
CREATE INDEX idx_item_livro       ON item(id_livro);
CREATE INDEX idx_item_comprador   ON item(id_comprador);
CREATE INDEX idx_estimativa_item  ON estimativa(id_item);

INSERT INTO livreiro (login, senha, usuario, cpf, email, primeiro_nome, endereco_cidade, endereco_estado)
VALUES ('vendedor_joao', 'senha_criptografada_123', 'joaobooks', '12345678901', 'joao@email.com', 'João', 'Belo Horizonte', 'MG');

select * from livreiro;



