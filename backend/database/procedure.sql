DELIMITER //

CREATE PROCEDURE sp_buscar_livros_filtro(
    IN p_id_categoria INT,
    IN p_id_livreiro INT,
    IN p_preco_min DECIMAL(10,2),
    IN p_preco_max DECIMAL(10,2)
)
BEGIN
    SELECT 
        l.id_livro,
        l.isbn,
        l.nome,
        l.autor,
        c.nome AS categoria,
        lv.usuario AS livreiro,
        i.id_item,
        i.preco,
        i.conservacao
    FROM livro l
    JOIN categoria c ON l.id_categoria = c.id_categoria
    JOIN livreiro lv ON l.id_livreiro = lv.id_livreiro
    JOIN item i ON i.id_livro = l.id_livro
    WHERE (p_id_categoria IS NULL OR l.id_categoria = p_id_categoria)
      AND (p_id_livreiro IS NULL OR l.id_livreiro = p_id_livreiro)
      AND (p_preco_min IS NULL OR i.preco >= p_preco_min)
      AND (p_preco_max IS NULL OR i.preco <= p_preco_max)
    ORDER BY i.preco ASC;
END //

DELIMITER ;