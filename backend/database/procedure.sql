DELIMITER //

DROP PROCEDURE IF EXISTS sp_buscar_livros_filtro //

CREATE PROCEDURE sp_buscar_livros_filtro(
    IN p_id_categoria INT,
    IN p_id_livreiro INT,
    IN p_preco_min DECIMAL(10,2),
    IN p_preco_max DECIMAL(10,2)
)
BEGIN
    SELECT 
        l.id_livro,
        l.id_categoria,
        l.id_livreiro,
        l.isbn,
        l.nome,
        l.autor,
        l.idioma,
        c.nome AS categoria,
        lv.usuario AS livreiro,
        i.id_item,
        i.preco,
        i.conservacao,
        i.fotos_item
    FROM livro l
    JOIN categoria c ON l.id_categoria = c.id_categoria
    JOIN livreiro lv ON l.id_livreiro = lv.id_livreiro
    JOIN item i ON i.id_livro = l.id_livro
    WHERE i.id_comprador IS NULL            -- só itens ainda disponíveis
      AND (p_id_categoria IS NULL OR l.id_categoria = p_id_categoria)
      AND (p_id_livreiro IS NULL OR l.id_livreiro = p_id_livreiro)
      AND (p_preco_min IS NULL OR i.preco >= p_preco_min)
      AND (p_preco_max IS NULL OR i.preco <= p_preco_max)
    ORDER BY i.preco ASC;
END //

DELIMITER ;