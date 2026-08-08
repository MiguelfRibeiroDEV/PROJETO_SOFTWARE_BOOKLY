    DELIMITER //

    CREATE PROCEDURE sp_relatorio_preco_medio_categoria()
    BEGIN
        SELECT 
            c.id_categoria,
            c.nome AS categoria,
            COUNT(i.id_item) AS total_itens,
            ROUND(AVG(i.preco), 2) AS preco_medio,
            MIN(i.preco) AS preco_minimo,
            MAX(i.preco) AS preco_maximo
        FROM categoria c
        JOIN livro l ON l.id_categoria = c.id_categoria
        JOIN item i ON i.id_livro = l.id_livro
        GROUP BY c.id_categoria, c.nome
        ORDER BY preco_medio DESC;
    END //

    DELIMITER ;