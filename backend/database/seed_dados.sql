-- =========================================================
-- SEED DE DADOS DE TESTE - BOOKLY_DB
-- 100 livros reais (com 1 item/anúncio cada), 8 categorias,
-- 5 livreiros, 6 compradores e 20 estimativas.
--
-- COMO USAR: rode DEPOIS de create_database.sql (e das procedures).
--   mysql -u root -p bookly_db < backend/database/seed_dados.sql
-- Rode apenas UMA vez (rodar de novo duplica os livros).
--
-- Observações:
--  * Autores e títulos são reais. Editora, nº de páginas e preço são
--    aproximados (variam conforme a edição) e o ano é o da publicação
--    original da obra. ISBN fica NULL, pois o campo é opcional.
--  * Senha de todos os usuários de teste: teste123 (o sistema compara
--    a senha em texto puro). CPFs, telefones e endereços são fictícios.
-- =========================================================

USE bookly_db;
SET NAMES utf8mb4;

-- ---------------------------------------------------------
-- 1. CATEGORIAS (INSERT IGNORE: não duplica as que já existem)
-- ---------------------------------------------------------
INSERT IGNORE INTO categoria (nome, descricao, codigo_index) VALUES
('Romance', 'Ficção narrativa, histórias românticas e literatura dramática', 'CAT-001'),
('Ficção Científica', 'Obras com temática científica, futurismo e tecnologia', 'CAT-002'),
('Fantasia', 'Aventuras mágicas, universos fantásticos e mitologia', 'CAT-003'),
('Didático / Acadêmico', 'Livros escolares, universitários e de estudo', 'CAT-004'),
('História', 'Análises históricas, biografias e memórias', 'CAT-005'),
('Terror / Suspense', 'Obras de suspense, mistério e horror', 'CAT-006'),
('Autoajuda / Negócios', 'Desenvolvimento pessoal, hábitos, finanças e carreira', 'CAT-007'),
('Infantojuvenil', 'Literatura para crianças e jovens leitores', 'CAT-008');

SET @cat_romance := (SELECT id_categoria FROM categoria WHERE codigo_index = 'CAT-001');
SET @cat_fc := (SELECT id_categoria FROM categoria WHERE codigo_index = 'CAT-002');
SET @cat_fantasia := (SELECT id_categoria FROM categoria WHERE codigo_index = 'CAT-003');
SET @cat_didatico := (SELECT id_categoria FROM categoria WHERE codigo_index = 'CAT-004');
SET @cat_historia := (SELECT id_categoria FROM categoria WHERE codigo_index = 'CAT-005');
SET @cat_terror := (SELECT id_categoria FROM categoria WHERE codigo_index = 'CAT-006');
SET @cat_autoajuda := (SELECT id_categoria FROM categoria WHERE codigo_index = 'CAT-007');
SET @cat_infantojuvenil := (SELECT id_categoria FROM categoria WHERE codigo_index = 'CAT-008');

-- ---------------------------------------------------------
-- 2. LIVREIROS (o 'vendedorTeste' já existe no create_database.sql)
-- ---------------------------------------------------------
INSERT IGNORE INTO livreiro (login, senha, usuario, cpf, telefone, email, primeiro_nome, segundo_nome, data_nascimento,
    endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep) VALUES
('anaestante', 'teste123', 'anaestante', '22222222201', '(31) 98888-0001', 'ana@bookly.teste', 'Ana', 'Ribeiro', '1990-04-12', 'Rua da Bahia', '1120', 'Centro', 'Belo Horizonte', 'MG', '30160-011'),
('carlossebo', 'teste123', 'carlossebo', '22222222202', '(11) 97777-0002', 'carlos@bookly.teste', 'Carlos', 'Menezes', '1985-09-30', 'Rua Augusta', '850', 'Consolação', 'São Paulo', 'SP', '01304-001'),
('rafatech', 'teste123', 'rafatech', '22222222203', '(21) 96666-0003', 'rafael@bookly.teste', 'Rafael', 'Tavares', '1993-01-18', 'Rua do Catete', '204', 'Catete', 'Rio de Janeiro', 'RJ', '22220-000'),
('biahistoria', 'teste123', 'biahistoria', '22222222204', '(51) 95555-0004', 'beatriz@bookly.teste', 'Beatriz', 'Almeida', '1988-11-05', 'Rua dos Andradas', '1001', 'Centro Histórico', 'Porto Alegre', 'RS', '90020-007');

SET @lv_joao := (SELECT id_livreiro FROM livreiro WHERE login = 'vendedorTeste');
SET @lv_ana := (SELECT id_livreiro FROM livreiro WHERE login = 'anaestante');
SET @lv_carlos := (SELECT id_livreiro FROM livreiro WHERE login = 'carlossebo');
SET @lv_rafael := (SELECT id_livreiro FROM livreiro WHERE login = 'rafatech');
SET @lv_bia := (SELECT id_livreiro FROM livreiro WHERE login = 'biahistoria');

-- ---------------------------------------------------------
-- 3. COMPRADORES
-- ---------------------------------------------------------
INSERT IGNORE INTO comprador (login, senha, usuario, cpf, telefone, email, primeiro_nome, segundo_nome, data_nascimento,
    endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep) VALUES
('lucas.c', 'teste123', 'lucascomprador', '33333333301', '(31) 94444-1001', 'lucas@bookly.teste', 'Lucas', 'Ferreira', '2001-02-14', 'Rua Pernambuco', '77', 'Funcionários', 'Belo Horizonte', 'MG', '30130-150'),
('julia.c', 'teste123', 'juliacomprador', '33333333302', '(31) 94444-1002', 'julia@bookly.teste', 'Júlia', 'Campos', '1999-07-22', 'Av. Amazonas', '3300', 'Barro Preto', 'Belo Horizonte', 'MG', '30180-001'),
('pedro.c', 'teste123', 'pedrocomprador', '33333333303', '(11) 94444-1003', 'pedro@bookly.teste', 'Pedro', 'Nogueira', '1996-12-03', 'Rua Oscar Freire', '410', 'Jardins', 'São Paulo', 'SP', '01426-001'),
('marina.c', 'teste123', 'marinacomprador', '33333333304', '(21) 94444-1004', 'marina@bookly.teste', 'Marina', 'Costa', '2003-05-09', 'Rua Visconde de Pirajá', '550', 'Ipanema', 'Rio de Janeiro', 'RJ', '22410-002'),
('thiago.c', 'teste123', 'thiagocomprador', '33333333305', '(41) 94444-1005', 'thiago@bookly.teste', 'Thiago', 'Lima', '1994-08-27', 'Rua XV de Novembro', '900', 'Centro', 'Curitiba', 'PR', '80020-310'),
('fernanda.c', 'teste123', 'fernandacomprador', '33333333306', '(71) 94444-1006', 'fernanda@bookly.teste', 'Fernanda', 'Santos', '1998-03-16', 'Rua Chile', '30', 'Pelourinho', 'Salvador', 'BA', '40020-000');

SET @cp_c1 := (SELECT id_comprador FROM comprador WHERE login = 'lucas.c');
SET @cp_c2 := (SELECT id_comprador FROM comprador WHERE login = 'julia.c');
SET @cp_c3 := (SELECT id_comprador FROM comprador WHERE login = 'pedro.c');
SET @cp_c4 := (SELECT id_comprador FROM comprador WHERE login = 'marina.c');
SET @cp_c5 := (SELECT id_comprador FROM comprador WHERE login = 'thiago.c');
SET @cp_c6 := (SELECT id_comprador FROM comprador WHERE login = 'fernanda.c');

-- ---------------------------------------------------------
-- 4. LIVROS + ITENS (+ ESTIMATIVAS): 100 livros reais
--    Cada bloco: INSERT livro -> INSERT item -> (opcional) INSERT estimativa
-- ---------------------------------------------------------

-- ===== ROMANCE =====
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Dom Casmurro', 'Machado de Assis', 'Principis', 'Português (BR)', 1899, 256, 'Bentinho narra a própria vida e tenta provar a si mesmo que Capitu o traiu com seu melhor amigo.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (20.90, '9ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2010, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (22.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', 'Penguin-Companhia', 'Português (BR)', 1881, 288, 'Um defunto autor conta sua vida com ironia e humor ácido, criticando a sociedade carioca do século XIX.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (25.90, '6ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2020, 'Bom', FALSE, 'Vintage', 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (30.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Quincas Borba', 'Machado de Assis', 'Penguin-Companhia', 'Português (BR)', 1891, 304, 'Rubião herda a fortuna do filósofo Quincas Borba e se perde entre a ambição e a loucura.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (28.90, '8ª edição', 'Exemplar em estado médio, capa dura. Sem grifos ou rasuras.', 2021, 'Médio', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Orgulho e Preconceito', 'Jane Austen', 'Martin Claret', 'Português (BR)', 1813, 424, 'Elizabeth Bennet e o orgulhoso Sr. Darcy precisam superar seus próprios julgamentos para se entenderem.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (30.90, '3ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2024, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Razão e Sensibilidade', 'Jane Austen', 'Martin Claret', 'Português (BR)', 1811, 400, 'As irmãs Dashwood enfrentam amores, perdas e dificuldades financeiras na Inglaterra do início do século XIX.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (9.90, '8ª edição', 'Exemplar em estado ruim, capa dura. Sem grifos ou rasuras.', 2022, 'Ruim', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Capitães da Areia', 'Jorge Amado', 'Companhia das Letras', 'Português (BR)', 1937, 280, 'Um grupo de meninos de rua de Salvador vive de pequenos furtos e luta por sobrevivência e dignidade.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (25.90, '5ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2023, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Cortiço', 'Aluísio Azevedo', 'Ática', 'Português (BR)', 1890, 240, 'A vida num cortiço do Rio de Janeiro mostra a ambição, a pobreza e as relações de uma comunidade operária.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (19.90, '5ª edição', 'Exemplar em estado médio, brochura. Possui grifos a lápis.', 2022, 'Médio', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Senhora', 'José de Alencar', 'Ática', 'Português (BR)', 1875, 232, 'Aurélia, jovem rica, compra o marido numa espécie de casamento por interesse para vingar uma antiga traição.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (29.90, '5ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2023, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'A Hora da Estrela', 'Clarice Lispector', 'Rocco', 'Português (BR)', 1977, 88, 'A trajetória de Macabéa, datilógrafa nordestina no Rio de Janeiro, contada por um narrador que se questiona.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (22.90, '6ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2022, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Grande Sertão: Veredas', 'João Guimarães Rosa', 'Nova Fronteira', 'Português (BR)', 1956, 624, 'O ex-jagunço Riobaldo relata suas travessias pelo sertão, o amor por Diadorim e o medo do pacto com o diabo.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (26.90, '3ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2023, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Amor nos Tempos do Cólera', 'Gabriel García Márquez', 'Record', 'Português (BR)', 1985, 432, 'Florentino Ariza espera mais de cinquenta anos para voltar a ficar com o grande amor de sua juventude.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (17.90, '4ª edição', 'Exemplar em estado ruim, capa dura. Sem grifos ou rasuras.', 2008, 'Ruim', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (16.90, 'Estimativa de mercado para um exemplar em estado ruim (capa dura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Cem Anos de Solidão', 'Gabriel García Márquez', 'Record', 'Português (BR)', 1967, 448, 'A saga da família Buendía na cidade imaginária de Macondo mistura realidade, magia e história.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (27.90, '4ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2025, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Anna Kariênina', 'Liev Tolstói', 'Companhia das Letras', 'Português (BR)', 1878, 864, 'A paixão de Anna por um oficial a coloca em conflito com a rígida sociedade aristocrática russa.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (12.90, '1ª edição', 'Exemplar em estado péssimo, brochura. Possui grifos a lápis.', 2023, 'Péssimo', FALSE, 'Primeira edição', 'Brochura', TRUE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (14.90, 'Estimativa de mercado para um exemplar em estado péssimo (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Madame Bovary', 'Gustave Flaubert', 'Penguin-Companhia', 'Português (BR)', 1857, 440, 'Emma Bovary, entediada com a vida de província, busca o amor ideal e acaba se endividando e se frustrando.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (15.90, '9ª edição', 'Exemplar em estado ruim, capa dura. Possui grifos a lápis.', 2013, 'Ruim', FALSE, NULL, 'Capa dura', TRUE, NULL, @id_livro, @cp_c2);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Morro dos Ventos Uivantes', 'Emily Brontë', 'Martin Claret', 'Português (BR)', 1847, 400, 'A relação obsessiva entre Heathcliff e Catherine atravessa gerações nas charnecas inglesas.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (29.90, '7ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2014, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (30.90, 'Estimativa de mercado para um exemplar em estado médio (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Jane Eyre', 'Charlotte Brontë', 'Zahar', 'Português (BR)', 1847, 624, 'Órfã e independente, Jane se torna governanta e se apaixona pelo misterioso Sr. Rochester.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (9.90, '6ª edição', 'Exemplar em estado péssimo, brochura. Sem grifos ou rasuras.', 2008, 'Péssimo', FALSE, 'Vintage', 'Brochura', FALSE, NULL, @id_livro, @cp_c5);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Os Miseráveis', 'Victor Hugo', 'Martin Claret', 'Português (BR)', 1862, 1488, 'Jean Valjean tenta recomeçar a vida enquanto é perseguido pelo inspetor Javert na França do século XIX.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (30.90, '2ª edição', 'Exemplar em estado bom, capa dura. Sem grifos ou rasuras.', 2013, 'Bom', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Sol é Para Todos', 'Harper Lee', 'José Olympio', 'Português (BR)', 1960, 336, 'Na pequena Maycomb, a menina Scout acompanha o pai advogado na defesa de um homem negro injustamente acusado.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (26.90, '8ª edição', 'Exemplar em estado bom, capa dura. Sem grifos ou rasuras.', 2010, 'Bom', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'A Culpa é das Estrelas', 'John Green', 'Intrínseca', 'Português (BR)', 2012, 288, 'Hazel e Gus, dois jovens com câncer, se conhecem num grupo de apoio e vivem um amor intenso.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (12.90, '9ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras. Contém dedicatória na folha de rosto.', 2014, 'Médio', TRUE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Como Eu Era Antes de Você', 'Jojo Moyes', 'Intrínseca', 'Português (BR)', 2012, 336, 'Louisa aceita um emprego como cuidadora de Will, tetraplégico, e os dois transformam a vida um do outro.', @lv_joao, @cat_romance);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (30.90, '1ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2024, 'Bom', FALSE, 'Primeira edição', 'Brochura', FALSE, NULL, @id_livro, NULL);

-- ===== FICÇÃO CIENTÍFICA =====
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, '1984', 'George Orwell', 'Companhia das Letras', 'Português (BR)', 1949, 416, 'Winston Smith vive sob a vigilância total do Grande Irmão e arrisca tudo ao pensar por conta própria.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (14.90, '7ª edição', 'Exemplar em estado ruim, brochura. Possui grifos a lápis.', 2020, 'Ruim', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Admirável Mundo Novo', 'Aldous Huxley', 'Biblioteca Azul', 'Português (BR)', 1932, 312, 'Numa sociedade perfeitamente controlada por condicionamento e prazer, um ''selvagem'' questiona o preço dessa felicidade.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (30.90, '7ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2024, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Fahrenheit 451', 'Ray Bradbury', 'Biblioteca Azul', 'Português (BR)', 1953, 216, 'Num futuro em que livros são proibidos, o bombeiro Montag, pago para queimá-los, começa a duvidar da própria função.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (24.90, '4ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2022, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Duna', 'Frank Herbert', 'Aleph', 'Português (BR)', 1965, 680, 'Paul Atreides se envolve numa disputa por Arrakis, único planeta que produz a especiaria mais valiosa do universo.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (26.90, '6ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2025, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Fundação', 'Isaac Asimov', 'Aleph', 'Português (BR)', 1951, 256, 'O matemático Hari Seldon prevê a queda do Império Galáctico e cria um plano para encurtar a era de trevas.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (39.90, '4ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2025, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Eu, Robô', 'Isaac Asimov', 'Aleph', 'Português (BR)', 1950, 320, 'Contos sobre robôs e as Três Leis da Robótica, contados pela psicóloga Susan Calvin.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (44.90, '3ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2019, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Guia do Mochileiro das Galáxias', 'Douglas Adams', 'Arqueiro', 'Português (BR)', 1979, 208, 'Arthur Dent escapa da destruição da Terra e viaja pelo espaço com um guia eletrônico e um amigo alienígena.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (21.90, '5ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2018, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Neuromancer', 'William Gibson', 'Aleph', 'Português (BR)', 1984, 320, 'Um hacker decadente é recrutado para uma invasão perigosa no ciberespaço, em obra fundadora do cyberpunk.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (28.90, '5ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras. Contém dedicatória na folha de rosto.', 2011, 'Bom', TRUE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Frankenstein', 'Mary Shelley', 'Darkside', 'Português (BR)', 1818, 304, 'O cientista Victor Frankenstein dá vida a uma criatura e depois foge da responsabilidade pelo que criou.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (29.90, '6ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2009, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, @cp_c4);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Solaris', 'Stanisław Lem', 'Aleph', 'Português (BR)', 1961, 288, 'Cientistas em uma estação sobre o oceano pensante de Solaris são confrontados com manifestações de seu passado.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (27.90, '2ª edição', 'Exemplar em estado bom, capa dura. Sem grifos ou rasuras.', 2016, 'Bom', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Androides Sonham com Ovelhas Elétricas?', 'Philip K. Dick', 'Aleph', 'Português (BR)', 1968, 272, 'O caçador de recompensas Rick Deckard precisa ''aposentar'' androides quase indistinguíveis de humanos.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (48.90, '7ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2018, 'Bom', FALSE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (48.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Problema dos Três Corpos', 'Liu Cixin', 'Suma', 'Português (BR)', 2008, 320, 'Um contato com uma civilização alienígena ameaça a humanidade a partir de um jogo de realidade virtual.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (18.90, '7ª edição', 'Exemplar em estado péssimo, brochura. Possui grifos a lápis.', 2025, 'Péssimo', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Perdido em Marte', 'Andy Weir', 'Intrínseca', 'Português (BR)', 2011, 368, 'Abandonado em Marte após uma tempestade, o astronauta Mark Watney usa ciência e humor para sobreviver.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (10.90, '2ª edição', 'Exemplar em estado péssimo, brochura. Possui grifos a lápis.', 2009, 'Péssimo', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Jogos Vorazes', 'Suzanne Collins', 'Rocco', 'Português (BR)', 2008, 400, 'Katniss Everdeen se voluntaria para um torneio mortal televisionado numa nação distópica.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (31.90, '3ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2015, 'Bom', FALSE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Jogo do Exterminador', 'Orson Scott Card', 'Orbit', 'Português (BR)', 1985, 400, 'O jovem Ender Wiggin é treinado numa escola militar espacial para liderar a humanidade contra uma raça alienígena.', @lv_ana, @cat_fc);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (33.90, '1ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2025, 'Médio', FALSE, 'Impressão limitada', 'Brochura', FALSE, NULL, @id_livro, NULL);

-- ===== FANTASIA =====
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Hobbit', 'J. R. R. Tolkien', 'HarperCollins Brasil', 'Português (BR)', 1937, 336, 'Bilbo Bolseiro é arrastado por anões e pelo mago Gandalf numa expedição para recuperar um tesouro guardado por um dragão.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (33.90, '1ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2016, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Senhor dos Anéis: A Sociedade do Anel', 'J. R. R. Tolkien', 'HarperCollins Brasil', 'Português (BR)', 1954, 576, 'Frodo recebe o Um Anel e parte com companheiros numa jornada para destruí-lo.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (11.90, '9ª edição', 'Exemplar em estado péssimo, brochura. Possui grifos a lápis.', 2024, 'Péssimo', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (13.90, 'Estimativa de mercado para um exemplar em estado péssimo (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Senhor dos Anéis: As Duas Torres', 'J. R. R. Tolkien', 'HarperCollins Brasil', 'Português (BR)', 1954, 464, 'A Sociedade se divide enquanto Frodo e Sam avançam rumo a Mordor e a guerra se aproxima.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (44.90, '1ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2009, 'Bom', FALSE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Senhor dos Anéis: O Retorno do Rei', 'J. R. R. Tolkien', 'HarperCollins Brasil', 'Português (BR)', 1955, 544, 'A batalha final decide o destino da Terra-média enquanto o Anel chega perto da Montanha da Perdição.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (20.90, '7ª edição', 'Exemplar em estado péssimo, brochura. Sem grifos ou rasuras.', 2025, 'Péssimo', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Silmarillion', 'J. R. R. Tolkien', 'HarperCollins Brasil', 'Português (BR)', 1977, 480, 'Mitos e histórias da criação e das Eras antigas da Terra-média, muito antes de O Hobbit.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (21.90, '8ª edição', 'Exemplar em estado ruim, brochura. Sem grifos ou rasuras.', 2017, 'Ruim', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Harry Potter e a Pedra Filosofal', 'J. K. Rowling', 'Rocco', 'Português (BR)', 1997, 264, 'Harry descobre que é bruxo e começa a estudar em Hogwarts, onde enfrenta um mistério ligado a uma pedra mágica.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (48.90, '1ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2024, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, @cp_c6);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (50.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Harry Potter e a Câmara Secreta', 'J. K. Rowling', 'Rocco', 'Português (BR)', 1998, 288, 'No segundo ano em Hogwarts, ataques misteriosos ligados a uma câmara secreta aterrorizam a escola.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (35.90, '5ª edição', 'Exemplar em estado perfeito, brochura. Sem grifos ou rasuras.', 2008, 'Perfeito', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Harry Potter e o Prisioneiro de Azkaban', 'J. K. Rowling', 'Rocco', 'Português (BR)', 1999, 368, 'Um perigoso prisioneiro escapa de Azkaban e Harry descobre verdades sobre seu passado.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (47.90, '7ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2024, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'As Crônicas de Nárnia: O Leão, a Feiticeira e o Guarda-Roupa', 'C. S. Lewis', 'WMF Martins Fontes', 'Português (BR)', 1950, 208, 'Quatro irmãos atravessam um guarda-roupa e chegam a Nárnia, dominada por uma feiticeira.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (40.90, '7ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2009, 'Médio', FALSE, 'Vintage', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'A Guerra dos Tronos', 'George R. R. Martin', 'Suma', 'Português (BR)', 1996, 592, 'Famílias nobres disputam o Trono de Ferro enquanto uma ameaça antiga desperta no norte.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (40.90, '5ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2012, 'Médio', FALSE, 'Impressão limitada', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Nome do Vento', 'Patrick Rothfuss', 'Arqueiro', 'Português (BR)', 2007, 656, 'Kvothe, lendário e agora recluso, conta a própria história desde a infância itinerante até a vida na Universidade.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (12.90, '8ª edição', 'Exemplar em estado péssimo, brochura. Sem grifos ou rasuras.', 2025, 'Péssimo', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Eragon', 'Christopher Paolini', 'Rocco', 'Português (BR)', 2002, 544, 'O jovem fazendeiro Eragon encontra um ovo de dragão e se torna Cavaleiro de Dragão.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (43.90, '3ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2024, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Alice no País das Maravilhas', 'Lewis Carroll', 'Zahar', 'Português (BR)', 1865, 224, 'Alice segue um coelho branco e cai num mundo de personagens absurdos e lógica invertida.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (42.90, '2ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2012, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Percy Jackson e o Ladrão de Raios', 'Rick Riordan', 'Intrínseca', 'Português (BR)', 2005, 400, 'Percy descobre ser filho de um deus grego e precisa recuperar o raio de Zeus para evitar uma guerra.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (27.90, '8ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2010, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Mistborn: O Império Final', 'Brandon Sanderson', 'Leya', 'Português (BR)', 2006, 560, 'Num mundo dominado por um imperador imortal, uma jovem ladra descobre o poder da alomancia.', @lv_carlos, @cat_fantasia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (47.90, '8ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2019, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);

-- ===== DIDÁTICO / ACADÊMICO =====
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Cálculo – Volume 1', 'James Stewart', 'Cengage Learning', 'Português (BR)', 1987, 664, 'Texto clássico de cálculo diferencial e integral de uma variável, com muitos exercícios resolvidos.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (79.90, '2ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2016, 'Médio', FALSE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Fundamentos de Física – Volume 1: Mecânica', 'David Halliday, Robert Resnick e Jearl Walker', 'LTC', 'Português (BR)', 1960, 356, 'Introdução à mecânica clássica para cursos de ciências exatas e engenharias.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (60.90, '9ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2023, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Algoritmos: Teoria e Prática', 'Thomas H. Cormen et al.', 'Elsevier', 'Português (BR)', 1990, 1296, 'Referência universitária sobre projeto e análise de algoritmos e estruturas de dados.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (68.90, '6ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2020, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Código Limpo', 'Robert C. Martin', 'Alta Books', 'Português (BR)', 2008, 424, 'Princípios e boas práticas para escrever código legível, simples e fácil de manter.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (95.90, '6ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2022, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, @cp_c3);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Arquitetura Limpa', 'Robert C. Martin', 'Alta Books', 'Português (BR)', 2017, 432, 'Regras de arquitetura de software para criar sistemas flexíveis e independentes de frameworks.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (114.90, '3ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2017, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Sistemas Operacionais Modernos', 'Andrew S. Tanenbaum', 'Pearson', 'Português (BR)', 1992, 864, 'Conceitos de processos, memória, arquivos e segurança em sistemas operacionais.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (94.90, '6ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2023, 'Médio', FALSE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Redes de Computadores', 'Andrew S. Tanenbaum', 'Pearson', 'Português (BR)', 1981, 960, 'Estudo das camadas de rede, protocolos e da arquitetura da Internet.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (80.90, '6ª edição', 'Exemplar em estado ruim, brochura. Possui grifos a lápis.', 2013, 'Ruim', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (72.90, 'Estimativa de mercado para um exemplar em estado ruim (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Engenharia de Software', 'Ian Sommerville', 'Pearson', 'Português (BR)', 1982, 768, 'Processos, requisitos, projeto, testes e gerenciamento de projetos de software.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (62.90, '7ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2023, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (63.90, 'Estimativa de mercado para um exemplar em estado médio (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Padrões de Projeto', 'Erich Gamma et al.', 'Bookman', 'Português (BR)', 1994, 364, 'Catálogo de padrões de projeto orientado a objetos reutilizáveis.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (85.90, '5ª edição', 'Exemplar em estado perfeito, brochura. Sem grifos ou rasuras.', 2022, 'Perfeito', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Programador Pragmático', 'Andrew Hunt e David Thomas', 'Bookman', 'Português (BR)', 1999, 344, 'Dicas práticas de carreira e técnica para se tornar um desenvolvedor mais eficiente.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (93.90, '4ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras. Contém dedicatória na folha de rosto.', 2011, 'Médio', TRUE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Sistemas de Banco de Dados', 'Ramez Elmasri e Shamkant Navathe', 'Pearson', 'Português (BR)', 1989, 788, 'Modelagem, SQL, normalização e transações em bancos de dados relacionais.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (149.90, '3ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2021, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Organização e Projeto de Computadores', 'David Patterson e John Hennessy', 'Elsevier', 'Português (BR)', 1994, 624, 'A interface hardware/software: da linguagem de máquina ao desempenho de processadores.', @lv_rafael, @cat_didatico);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (98.90, '5ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras. Contém dedicatória na folha de rosto.', 2025, 'Médio', TRUE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);

-- ===== HISTÓRIA =====
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Sapiens: Uma Breve História da Humanidade', 'Yuval Noah Harari', 'L&PM', 'Português (BR)', 2011, 464, 'Um panorama da trajetória do Homo sapiens, da Revolução Cognitiva aos dias atuais.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (48.90, '6ª edição', 'Exemplar em estado médio, capa dura. Sem grifos ou rasuras.', 2023, 'Médio', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (47.90, 'Estimativa de mercado para um exemplar em estado médio (capa dura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Homo Deus: Uma Breve História do Amanhã', 'Yuval Noah Harari', 'Companhia das Letras', 'Português (BR)', 2015, 448, 'Reflexão sobre os rumos da humanidade diante da tecnologia, dos dados e da inteligência artificial.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (30.90, '3ª edição', 'Exemplar em estado ruim, brochura. Possui grifos a lápis.', 2016, 'Ruim', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, '21 Lições para o Século 21', 'Yuval Noah Harari', 'Companhia das Letras', 'Português (BR)', 2018, 448, 'Ensaios sobre os desafios atuais, como tecnologia, política, verdade e sentido da vida.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (22.90, '7ª edição', 'Exemplar em estado ruim, brochura. Possui grifos a lápis.', 2021, 'Ruim', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, @cp_c1);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Armas, Germes e Aço', 'Jared Diamond', 'Record', 'Português (BR)', 1997, 472, 'Explica como fatores geográficos e ambientais moldaram o desenvolvimento das sociedades humanas.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (37.90, '2ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2018, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, @cp_c4);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Brasil: Uma Biografia', 'Lilia M. Schwarcz e Heloisa M. Starling', 'Companhia das Letras', 'Português (BR)', 2015, 768, 'Uma história do Brasil desde os primeiros povos até a atualidade, contada em linguagem acessível.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (33.90, '9ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2016, 'Bom', FALSE, 'Fora de catálogo', 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, '1808', 'Laurentino Gomes', 'Planeta', 'Português (BR)', 2007, 400, 'A fuga da corte portuguesa para o Brasil e como esse episódio mudou o país.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (23.90, '4ª edição', 'Exemplar em estado péssimo, capa dura. Possui grifos a lápis.', 2021, 'Péssimo', FALSE, NULL, 'Capa dura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, '1822', 'Laurentino Gomes', 'Nova Fronteira', 'Português (BR)', 2010, 336, 'O processo de Independência do Brasil e as articulações que evitaram a fragmentação do território.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (33.90, '5ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2012, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, '1889', 'Laurentino Gomes', 'Globo Livros', 'Português (BR)', 2013, 400, 'O fim da monarquia e a Proclamação da República contados em tom jornalístico.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (43.90, '7ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2014, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Casa-Grande & Senzala', 'Gilberto Freyre', 'Global', 'Português (BR)', 1933, 720, 'Estudo clássico sobre a formação da sociedade brasileira a partir da família patriarcal e da escravidão.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (41.90, '3ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2009, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (48.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Raízes do Brasil', 'Sérgio Buarque de Holanda', 'Companhia das Letras', 'Português (BR)', 1936, 256, 'Ensaio sobre as origens culturais e políticas do Brasil, incluindo o conceito de ''homem cordial''.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (18.90, '3ª edição', 'Exemplar em estado ruim, brochura. Possui grifos a lápis.', 2019, 'Ruim', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, @cp_c2);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Diário de Anne Frank', 'Anne Frank', 'Record', 'Português (BR)', 1947, 352, 'O relato de uma adolescente judia escondida com a família em Amsterdã durante a ocupação nazista.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (27.90, '3ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2025, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Holocausto Brasileiro', 'Daniela Arbex', 'Geração Editorial', 'Português (BR)', 2013, 256, 'Reportagem sobre o Hospital Colônia de Barbacena e as milhares de mortes ocorridas no manicômio.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (12.90, '2ª edição', 'Exemplar em estado péssimo, brochura. Possui grifos a lápis.', 2012, 'Péssimo', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, @cp_c3);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Quarto de Despejo', 'Carolina Maria de Jesus', 'Ática', 'Português (BR)', 1960, 208, 'Diário de uma moradora da favela do Canindé, em São Paulo, sobre fome e desigualdade.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (40.90, '2ª edição', 'Exemplar em estado bom, capa dura. Sem grifos ou rasuras.', 2016, 'Bom', FALSE, 'Fora de catálogo', 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Príncipe', 'Nicolau Maquiavel', 'Penguin-Companhia', 'Português (BR)', 1532, 160, 'Tratado político sobre a conquista e a manutenção do poder.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (21.90, '2ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2013, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (21.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'A Arte da Guerra', 'Sun Tzu', 'L&PM', 'Português (BR)', NULL, 160, 'Clássico chinês de estratégia militar, aplicado também a negócios e liderança.', @lv_bia, @cat_historia);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (32.90, '1ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2021, 'Médio', FALSE, 'Primeira edição', 'Brochura', FALSE, NULL, @id_livro, @cp_c4);

-- ===== TERROR / SUSPENSE =====
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Iluminado', 'Stephen King', 'Suma', 'Português (BR)', 1977, 464, 'Jack Torrance aceita ser zelador de um hotel isolado no inverno e o lugar começa a afetar sua mente.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (22.90, '8ª edição', 'Exemplar em estado ruim, brochura. Sem grifos ou rasuras.', 2014, 'Ruim', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'It: A Coisa', 'Stephen King', 'Suma', 'Português (BR)', 1986, 1104, 'Um grupo de amigos enfrenta, na infância e na vida adulta, uma entidade maligna que assombra Derry.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (17.90, '3ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2021, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (16.90, 'Estimativa de mercado para um exemplar em estado médio (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Misery', 'Stephen King', 'Suma', 'Português (BR)', 1987, 368, 'Um escritor acidentado é mantido preso por uma fã obcecada.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (26.90, '3ª edição', 'Exemplar em estado ruim, brochura. Sem grifos ou rasuras.', 2017, 'Ruim', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, @cp_c6);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Drácula', 'Bram Stoker', 'Darkside', 'Português (BR)', 1897, 592, 'O conde Drácula viaja da Transilvânia para a Inglaterra e é perseguido por um grupo de caçadores de vampiros.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (18.90, '6ª edição', 'Exemplar em estado bom, capa dura. Sem grifos ou rasuras.', 2012, 'Bom', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Médico e o Monstro', 'Robert Louis Stevenson', 'Zahar', 'Português (BR)', 1886, 128, 'O Dr. Jekyll cria uma poção que libera sua parte sombria, o violento Sr. Hyde.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (37.90, '1ª edição', 'Exemplar em estado médio, capa dura. Sem grifos ou rasuras.', 2018, 'Médio', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Assassinato no Expresso do Oriente', 'Agatha Christie', 'HarperCollins Brasil', 'Português (BR)', 1934, 256, 'Hercule Poirot investiga um assassinato num trem parado pela neve.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (37.90, '6ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2024, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, @cp_c1);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'E Não Sobrou Nenhum', 'Agatha Christie', 'HarperCollins Brasil', 'Português (BR)', 1939, 272, 'Dez desconhecidos são convidados para uma ilha, onde começam a morrer um a um.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (21.90, '2ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2011, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Um Estudo em Vermelho', 'Arthur Conan Doyle', 'Zahar', 'Português (BR)', 1887, 192, 'A primeira aventura de Sherlock Holmes e do Dr. Watson, que investigam um assassinato misterioso.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (36.90, '9ª edição', 'Exemplar em estado bom, capa dura. Possui grifos a lápis.', 2012, 'Bom', FALSE, NULL, 'Capa dura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Cão dos Baskerville', 'Arthur Conan Doyle', 'Zahar', 'Português (BR)', 1902, 224, 'Holmes investiga a lenda de um cão sobrenatural que assombra uma família nobre.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (34.90, '5ª edição', 'Exemplar em estado perfeito, brochura. Possui grifos a lápis. Contém dedicatória na folha de rosto.', 2010, 'Perfeito', TRUE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Código Da Vinci', 'Dan Brown', 'Arqueiro', 'Português (BR)', 2003, 480, 'Um assassinato no Louvre leva o simbologista Robert Langdon a uma busca por segredos históricos e religiosos.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (26.90, '5ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2022, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (30.90, 'Estimativa de mercado para um exemplar em estado médio (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Anjos e Demônios', 'Dan Brown', 'Arqueiro', 'Português (BR)', 2000, 480, 'Langdon corre contra o tempo em Roma para impedir um atentado ligado a uma antiga sociedade secreta.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (32.90, '8ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2014, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (37.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Garota Exemplar', 'Gillian Flynn', 'Intrínseca', 'Português (BR)', 2012, 432, 'No dia do aniversário de casamento, Amy desaparece e o marido vira o principal suspeito.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (28.90, '8ª edição', 'Exemplar em estado médio, capa dura. Sem grifos ou rasuras.', 2009, 'Médio', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'A Garota no Trem', 'Paula Hawkins', 'Record', 'Português (BR)', 2015, 378, 'Rachel observa diariamente um casal da janela do trem e se envolve num caso de desaparecimento.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (33.90, '9ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras.', 2008, 'Médio', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Os Homens que Não Amavam as Mulheres', 'Stieg Larsson', 'Companhia das Letras', 'Português (BR)', 2005, 536, 'Um jornalista e uma hacker investigam o desaparecimento de uma jovem décadas atrás.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (42.90, '2ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2010, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Coraline', 'Neil Gaiman', 'Rocco', 'Português (BR)', 2002, 160, 'Coraline descobre uma porta para um mundo parecido com o seu, mas com uma ''outra mãe'' sinistra.', @lv_ana, @cat_terror);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (25.90, '7ª edição', 'Exemplar em estado médio, brochura. Sem grifos ou rasuras. Contém dedicatória na folha de rosto.', 2014, 'Médio', TRUE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);

-- ===== AUTOAJUDA / NEGÓCIOS =====
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Hábitos Atômicos', 'James Clear', 'Alta Life', 'Português (BR)', 2018, 320, 'Método prático para criar bons hábitos e abandonar os ruins com pequenas mudanças diárias.', @lv_rafael, @cat_autoajuda);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (40.90, '6ª edição', 'Exemplar em estado perfeito, brochura. Sem grifos ou rasuras.', 2009, 'Perfeito', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Pai Rico, Pai Pobre', 'Robert T. Kiyosaki', 'Alta Books', 'Português (BR)', 1997, 336, 'Contrasta duas mentalidades sobre dinheiro e apresenta noções de educação financeira.', @lv_rafael, @cat_autoajuda);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (36.90, '9ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2022, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (43.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Poder do Hábito', 'Charles Duhigg', 'Objetiva', 'Português (BR)', 2012, 408, 'Explica como os hábitos funcionam no cérebro, nas empresas e na sociedade e como mudá-los.', @lv_rafael, @cat_autoajuda);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (31.90, '8ª edição', 'Exemplar em estado médio, brochura. Possui grifos a lápis.', 2010, 'Médio', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Como Fazer Amigos e Influenciar Pessoas', 'Dale Carnegie', 'Companhia Editora Nacional', 'Português (BR)', 1936, 256, 'Princípios de relacionamento e comunicação que se tornaram um clássico do desenvolvimento pessoal.', @lv_rafael, @cat_autoajuda);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (16.90, '5ª edição', 'Exemplar em estado bom, brochura. Possui grifos a lápis.', 2025, 'Bom', FALSE, NULL, 'Brochura', TRUE, NULL, @id_livro, NULL);

-- ===== INFANTOJUVENIL =====
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 'Agir', 'Português (BR)', 1943, 96, 'Um piloto perdido no deserto encontra um menino vindo de outro planeta e aprende com ele sobre amizade e amor.', @lv_joao, @cat_infantojuvenil);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (22.90, '1ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2020, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (23.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'Reinações de Narizinho', 'Monteiro Lobato', 'Globo Livros', 'Português (BR)', 1931, 224, 'Narizinho e a boneca Emília vivem aventuras no Sítio do Picapau Amarelo e no mundo do faz de conta.', @lv_joao, @cat_infantojuvenil);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (9.90, '8ª edição', 'Exemplar em estado bom, capa dura. Sem grifos ou rasuras.', 2015, 'Bom', FALSE, NULL, 'Capa dura', FALSE, NULL, @id_livro, NULL);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'O Menino Maluquinho', 'Ziraldo', 'Melhoramentos', 'Português (BR)', 1980, 128, 'As travessuras de um menino de panela na cabeça que cresce cheio de alegria.', @lv_joao, @cat_infantojuvenil);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (13.90, '3ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras. Contém dedicatória na folha de rosto.', 2010, 'Bom', TRUE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (15.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);
INSERT INTO livro (isbn, nome, autor, editora, idioma, ano_publicacao, numero_paginas, sinopse, id_livreiro, id_categoria)
VALUES (NULL, 'A Droga da Obediência', 'Pedro Bandeira', 'Moderna', 'Português (BR)', 1984, 192, 'O grupo dos Karas investiga uma estranha substância que faz as pessoas obedecerem.', @lv_joao, @cat_infantojuvenil);
SET @id_livro := LAST_INSERT_ID();
INSERT INTO item (preco, edicao, descricao, ano_aquisicao, conservacao, dedicatorio, raridade, tipo_capa, presenca_de_grifos, fotos_item, id_livro, id_comprador)
VALUES (28.90, '8ª edição', 'Exemplar em estado bom, brochura. Sem grifos ou rasuras.', 2018, 'Bom', FALSE, NULL, 'Brochura', FALSE, NULL, @id_livro, NULL);
SET @id_item := LAST_INSERT_ID();
INSERT INTO estimativa (preco_estimado, possivel_descricao, id_item)
VALUES (27.90, 'Estimativa de mercado para um exemplar em estado bom (brochura).', @id_item);

-- ---------------------------------------------------------
-- 5. RECALCULA OS CONTADORES (livros registrados/vendidos, faturamento, compras)
-- ---------------------------------------------------------
UPDATE livreiro lv SET
    lv.livros_registrados = (SELECT COUNT(*) FROM livro l WHERE l.id_livreiro = lv.id_livreiro),
    lv.livros_vendidos = (SELECT COUNT(*) FROM livro l JOIN item i ON i.id_livro = l.id_livro
                          WHERE l.id_livreiro = lv.id_livreiro AND i.id_comprador IS NOT NULL),
    lv.total_faturado = (SELECT COALESCE(SUM(i.preco), 0) FROM livro l JOIN item i ON i.id_livro = l.id_livro
                         WHERE l.id_livreiro = lv.id_livreiro AND i.id_comprador IS NOT NULL)
WHERE lv.id_livreiro > 0;

UPDATE comprador c SET
    c.livros_comprados = (SELECT COUNT(*) FROM item i WHERE i.id_comprador = c.id_comprador)
WHERE c.id_comprador > 0;

-- Conferência rápida:
-- SELECT COUNT(*) FROM livro;     -- esperado: 100 (+ os que você já cadastrou)
-- SELECT COUNT(*) FROM item;
-- SELECT c.nome, COUNT(*) FROM livro l JOIN categoria c ON c.id_categoria = l.id_categoria GROUP BY c.nome;

-- ---------------------------------------------------------
-- DATAS DE VENDA (para o Relatório de vendas): espalha as vendas
-- dos itens que já têm comprador pelos últimos ~60 dias.
-- ---------------------------------------------------------
UPDATE item
   SET data_venda = DATE_SUB(NOW(), INTERVAL FLOOR(1 + RAND() * 60) DAY)
 WHERE id_comprador IS NOT NULL AND data_venda IS NULL;
