DELIMITER //

DROP PROCEDURE IF EXISTS sp_dashboard_livreiro //

CREATE PROCEDURE sp_dashboard_livreiro(
    IN p_id_livreiro INT
)
BEGIN
    SELECT
        l.id_livro,
        l.nome,
        l.autor,
        COUNT(i.id_item) AS itens_anunciados,
        SUM(CASE WHEN i.id_comprador IS NOT NULL THEN 1 ELSE 0 END) AS itens_vendidos,
        COALESCE(SUM(CASE WHEN i.id_comprador IS NOT NULL THEN i.preco ELSE 0 END), 0) AS receita_total
    FROM livro l
    LEFT JOIN item i ON i.id_livro = l.id_livro
    WHERE l.id_livreiro = p_id_livreiro
    GROUP BY l.id_livro, l.nome, l.autor
    ORDER BY receita_total DESC;
END //

DELIMITER ;
