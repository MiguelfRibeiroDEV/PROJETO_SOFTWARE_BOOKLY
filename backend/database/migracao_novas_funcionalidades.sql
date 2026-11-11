-- =========================================================
-- MIGRAÇÃO para quem JÁ TEM o bookly_db criado (não recria o banco)
-- Rode no MySQL, UMA vez, depois reinicie o backend.
-- Se aparecer "Duplicate column name" ou "already exists", é só
-- porque aquele item já tinha sido feito: pode ignorar e seguir.
-- Depois rode também: procedure.sql e procedure_relatorio_vendas.sql
-- =========================================================
USE bookly_db;

-- Perfil: foto de perfil
ALTER TABLE comprador ADD COLUMN foto_perfil LONGTEXT NULL;
ALTER TABLE livreiro  ADD COLUMN foto_perfil LONGTEXT NULL;

-- Fotos dos itens (caso ainda esteja como TEXT) e data da venda
ALTER TABLE item MODIFY COLUMN fotos_item LONGTEXT;
ALTER TABLE item ADD COLUMN data_venda DATETIME NULL;
UPDATE item SET data_venda = NOW() WHERE id_comprador IS NOT NULL AND data_venda IS NULL;

-- Favoritos
CREATE TABLE IF NOT EXISTS favorito (
    id_favorito   INT AUTO_INCREMENT PRIMARY KEY,
    id_comprador  INT NOT NULL,
    id_item       INT NOT NULL,
    data_criacao  DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_favorito_comprador_item UNIQUE (id_comprador, id_item),
    CONSTRAINT fk_favorito_comprador FOREIGN KEY (id_comprador) REFERENCES comprador(id_comprador),
    CONSTRAINT fk_favorito_item      FOREIGN KEY (id_item)      REFERENCES item(id_item)
) ENGINE=InnoDB;

-- Carrinho
CREATE TABLE IF NOT EXISTS carrinho (
    id_carrinho   INT AUTO_INCREMENT PRIMARY KEY,
    id_comprador  INT NOT NULL,
    id_item       INT NOT NULL,
    data_adicao   DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_carrinho_comprador_item UNIQUE (id_comprador, id_item),
    CONSTRAINT fk_carrinho_comprador FOREIGN KEY (id_comprador) REFERENCES comprador(id_comprador),
    CONSTRAINT fk_carrinho_item      FOREIGN KEY (id_item)      REFERENCES item(id_item)
) ENGINE=InnoDB;

-- Perguntas ao livreiro
CREATE TABLE IF NOT EXISTS pergunta (
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

CREATE INDEX idx_item_data_venda    ON item(data_venda);
CREATE INDEX idx_pergunta_item      ON pergunta(id_item);
