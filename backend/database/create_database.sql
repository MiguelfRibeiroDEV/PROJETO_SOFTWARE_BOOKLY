-- =========================================================
-- BANCO DE DADOS: BOOKLY_DB
-- =========================================================
DROP DATABASE IF EXISTS bookly_db;
CREATE DATABASE bookly_db;
USE bookly_db;

-- =========================================================
-- 1. Entidade LIVREIRO (Vendedor)
-- =========================================================
CREATE TABLE livreiro (
    id_livreiro          INT AUTO_INCREMENT PRIMARY KEY,
    login                VARCHAR(50)  NOT NULL UNIQUE,
    senha                VARCHAR(255) NOT NULL,
    usuario              VARCHAR(50)  NOT NULL UNIQUE,
    cpf                  CHAR(11)     NOT NULL UNIQUE,
    telefone             VARCHAR(20),
    email                VARCHAR(150) NOT NULL UNIQUE,
    primeiro_nome        VARCHAR(100) NOT NULL,
    segundo_nome          VARCHAR(100),
    data_nascimento      DATE,
    data_cadastro        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    livros_registrados   INT          DEFAULT 0,
    livros_vendidos      INT          DEFAULT 0,
    total_faturado       DECIMAL(12,2) DEFAULT 0,
    endereco_rua         VARCHAR(150),
    endereco_numero      VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro      VARCHAR(100),
    endereco_cidade      VARCHAR(100),
    endereco_estado      CHAR(2),
    endereco_cep         VARCHAR(9),
    foto_perfil          LONGTEXT
) ENGINE=InnoDB;

-- =========================================================
-- 2. Entidade COMPRADOR
-- =========================================================
CREATE TABLE comprador (
    id_comprador         INT AUTO_INCREMENT PRIMARY KEY,
    login                VARCHAR(50)  NOT NULL UNIQUE,
    senha                VARCHAR(255) NOT NULL,
    usuario              VARCHAR(50)  NOT NULL UNIQUE,
    cpf                  CHAR(11)     NOT NULL UNIQUE,
    telefone             VARCHAR(20),
    email                VARCHAR(150) NOT NULL UNIQUE,
    primeiro_nome        VARCHAR(100) NOT NULL,
    segundo_nome          VARCHAR(100),
    data_nascimento      DATE,
    data_cadastro        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    livros_comprados     INT          DEFAULT 0,
    endereco_rua         VARCHAR(150),
    endereco_numero      VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro      VARCHAR(100),
    endereco_cidade      VARCHAR(100),
    endereco_estado      CHAR(2),
    endereco_cep         VARCHAR(9),
    foto_perfil          LONGTEXT
) ENGINE=InnoDB;

-- =========================================================
-- 3. Entidade CATEGORIA
-- =========================================================
CREATE TABLE categoria (
    id_categoria   INT AUTO_INCREMENT PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL,
    descricao      TEXT,
    codigo_index   VARCHAR(20) UNIQUE
) ENGINE=InnoDB;

-- =========================================================
-- 4. Entidade LIVRO (ISBN ajustado para ser opcional/NULL)
-- =========================================================
CREATE TABLE livro (
    id_livro        INT AUTO_INCREMENT PRIMARY KEY,
    isbn            VARCHAR(20) NULL, -- Corrigido para permitir livros sem ISBN
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
-- 5. Entidade ITEM
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
    fotos_item          LONGTEXT,
    data_venda          DATETIME NULL,
    id_livro            INT NOT NULL,
    id_comprador        INT,
    CONSTRAINT fk_item_livro     FOREIGN KEY (id_livro)     REFERENCES livro(id_livro),
    CONSTRAINT fk_item_comprador FOREIGN KEY (id_comprador) REFERENCES comprador(id_comprador)
) ENGINE=InnoDB;

-- =========================================================
-- 6. Entidade ESTIMATIVA
-- =========================================================
CREATE TABLE estimativa (
    id_estimativa       INT AUTO_INCREMENT PRIMARY KEY,
    date_time           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    preco_estimado      DECIMAL(10,2),
    possivel_descricao  TEXT,
    id_item             INT NOT NULL,
    CONSTRAINT fk_estimativa_item FOREIGN KEY (id_item) REFERENCES item(id_item)
) ENGINE=InnoDB;

-- =========================================================
-- 7. Entidade FAVORITO (comprador <-> item)
-- =========================================================
CREATE TABLE favorito (
    id_favorito   INT AUTO_INCREMENT PRIMARY KEY,
    id_comprador  INT NOT NULL,
    id_item       INT NOT NULL,
    data_criacao  DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_favorito_comprador_item UNIQUE (id_comprador, id_item),
    CONSTRAINT fk_favorito_comprador FOREIGN KEY (id_comprador) REFERENCES comprador(id_comprador),
    CONSTRAINT fk_favorito_item      FOREIGN KEY (id_item)      REFERENCES item(id_item)
) ENGINE=InnoDB;

-- =========================================================
-- 8. Entidade CARRINHO (comprador <-> item, antes da compra)
-- =========================================================
CREATE TABLE carrinho (
    id_carrinho   INT AUTO_INCREMENT PRIMARY KEY,
    id_comprador  INT NOT NULL,
    id_item       INT NOT NULL,
    data_adicao   DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_carrinho_comprador_item UNIQUE (id_comprador, id_item),
    CONSTRAINT fk_carrinho_comprador FOREIGN KEY (id_comprador) REFERENCES comprador(id_comprador),
    CONSTRAINT fk_carrinho_item      FOREIGN KEY (id_item)      REFERENCES item(id_item)
) ENGINE=InnoDB;

-- =========================================================
-- 9. Entidade PERGUNTA (comprador pergunta sobre um item; livreiro responde)
-- =========================================================
CREATE TABLE pergunta (
    id_pergunta     INT AUTO_INCREMENT PRIMARY KEY,
    id_item         INT NOT NULL,
    id_comprador    INT NOT NULL,
    texto_pergunta  VARCHAR(500) NOT NULL,
    data_pergunta   DATETIME DEFAULT CURRENT_TIMESTAMP,
    texto_resposta  VARCHAR(500) NULL,
    data_resposta   DATETIME NULL,
    CONSTRAINT fk_pergunta_item      FOREIGN KEY (id_item)      REFERENCES item(id_item),
    CONSTRAINT fk_pergunta_comprador FOREIGN KEY (id_comprador) REFERENCES comprador(id_comprador)
) ENGINE=InnoDB;


-- =========================================================
-- ÍNDICES DE PERFORMANCE
-- =========================================================
CREATE INDEX idx_livro_livreiro   ON livro(id_livreiro);
CREATE INDEX idx_livro_categoria  ON livro(id_categoria);
CREATE INDEX idx_item_livro       ON item(id_livro);
CREATE INDEX idx_item_comprador   ON item(id_comprador);
CREATE INDEX idx_estimativa_item  ON estimativa(id_item);
CREATE INDEX idx_item_data_venda    ON item(data_venda);
CREATE INDEX idx_pergunta_item      ON pergunta(id_item);
CREATE INDEX idx_carrinho_comprador ON carrinho(id_comprador);

-- =========================================================
-- POPULANDO CATEGORIAS INICIAIS (Essencial para o Frontend)
-- =========================================================
INSERT INTO categoria (nome, descricao, codigo_index) VALUES 
('Romance', 'Ficção narrativa, histórias românticas e literatura dramática', 'CAT-001'),
('Ficção Científica', 'Obras com temática científica, futurismo e tecnologia', 'CAT-002'),
('Fantasia', 'Aventuras mágicas, universos fantásticos e mitologia', 'CAT-003'),
('Didático / Acadêmico', 'Livros escolares, universitários e de estudo', 'CAT-004'),
('História', 'Análises históricas, biografias e memórias', 'CAT-005'),
('Terror / Suspense', 'Obras de suspense, mistério e horror', 'CAT-006');

-- =========================================================
-- POPULANDO LIVREIRO PADRÃO PARA TESTE
-- =========================================================
INSERT INTO livreiro (login, senha, usuario, cpf, email, primeiro_nome, endereco_cidade, endereco_estado)
VALUES ('vendedorTeste', 'teste', 'joaobooks', '12345678900', 'joao@teste.com', 'João', 'Belo Horizonte', 'MG');
