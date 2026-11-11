-- =========================================================
-- RELATÓRIO DE VENDAS DO LIVREIRO (filtros: período e categoria)
-- Chamadas pelo RelatorioVendasRepository (CALL ...).
-- =========================================================
DELIMITER //

-- Detalhe: uma linha por livro vendido
DROP PROCEDURE IF EXISTS sp_relatorio_vendas_detalhe //

CREATE PROCEDURE sp_relatorio_vendas_detalhe(
    IN p_id_livreiro  INT,
    IN p_data_inicio  DATE,
    IN p_data_fim     DATE,
    IN p_id_categoria INT
)
BEGIN
    SELECT
        i.id_item,
        i.data_venda,
        l.nome              AS livro,
        l.autor,
        c.id_categoria,
        c.nome              AS categoria,
        cp.primeiro_nome    AS comprador,
        i.preco
    FROM item i
    JOIN livro     l  ON l.id_livro      = i.id_livro
    JOIN categoria c  ON c.id_categoria  = l.id_categoria
    JOIN comprador cp ON cp.id_comprador = i.id_comprador
    WHERE l.id_livreiro = p_id_livreiro
      AND i.id_comprador IS NOT NULL
      AND (p_data_inicio  IS NULL OR DATE(i.data_venda) >= p_data_inicio)
      AND (p_data_fim     IS NULL OR DATE(i.data_venda) <= p_data_fim)
      AND (p_id_categoria IS NULL OR l.id_categoria = p_id_categoria)
    ORDER BY i.data_venda DESC, i.id_item DESC;
END //

-- Agrupado: receita e quantidade por categoria
DROP PROCEDURE IF EXISTS sp_relatorio_vendas_categoria //

CREATE PROCEDURE sp_relatorio_vendas_categoria(
    IN p_id_livreiro  INT,
    IN p_data_inicio  DATE,
    IN p_data_fim     DATE,
    IN p_id_categoria INT
)
BEGIN
    SELECT
        c.id_categoria,
        c.nome                   AS categoria,
        COUNT(i.id_item)         AS quantidade,
        COALESCE(SUM(i.preco),0) AS receita
    FROM item i
    JOIN livro     l ON l.id_livro     = i.id_livro
    JOIN categoria c ON c.id_categoria = l.id_categoria
    WHERE l.id_livreiro = p_id_livreiro
      AND i.id_comprador IS NOT NULL
      AND (p_data_inicio  IS NULL OR DATE(i.data_venda) >= p_data_inicio)
      AND (p_data_fim     IS NULL OR DATE(i.data_venda) <= p_data_fim)
      AND (p_id_categoria IS NULL OR l.id_categoria = p_id_categoria)
    GROUP BY c.id_categoria, c.nome
    ORDER BY receita DESC;
END //

DELIMITER ;
