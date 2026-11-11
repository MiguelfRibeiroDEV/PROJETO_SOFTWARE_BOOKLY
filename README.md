# Nome do Projeto

**BOOKLY**

# Integrantes da Equipe

* [Miguel Figueiredo Ribeiro]
* [Eduardo Mendes Valgas]
* [João Vitor Macedo]
* [Matheus Filipe]
* [João Carlos]
* [André Antunes]

# Stack Utilizada

## Frontend

* HTML5
* JavaScript
* CSS

## Backend

* Python
* Flask

## Banco de Dados

* MySql

# Breve Descrição do Sistema

O Bookly AI é um sistema desenvolvido para auxiliar sebos e vendedores de livros usados na definição de preços mais adequados para seus produtos.

A plataforma busca reduzir a dificuldade de precificação enfrentada por esses vendedores, considerando fatores como estado de conservação do livro, raridade, demanda e preços praticados no mercado. O objetivo é apoiar a tomada de decisão, tornando o processo de precificação mais rápido, consistente e baseado em dados.

Com isso, espera-se aumentar a competitividade dos vendedores, reduzir erros de precificação e melhorar a margem de lucro dos negócios.

# Funcionalidades implementadas no projeto


##### CRUD BOOKLY (FUNCIONALIDADE CRUD FUNCIONANDO)
####  MODELS (`backend/models/`)
* `categoria_model.py`
* `comprador_model.py`
* `estimativa_model.py`
* `item_model.py`
* `livreiro_model.py`
* `livro_model.py`
* `carrinho_model.py`
* `favorito_model.py`
* `pergunta_model.py`
* `database.py` *(Instância de inicialização do SQLAlchemy)*

####  CONTROLLERS (`backend/controllers/`)
* `categoria_controller.py`
* `comprador_controller.py`
* `estimativa_controller.py`
* `item_controller.py`
* `livreiro_controller.py`
* `livro_controller.py`
* `carrinho_controller.py`
* `dashboard_controller.py`
* `catalogo_controller.py`
* `pedido_controller.py`
* `perfil_controller.py`
* `pergunta_controller.py`
* `relatorio_vendas_controller.py`
* `recuperar_senha_controller.py`

####  SERVICES (`backend/services/`)
* `categoria_service.py`
* `comprador_service.py`
* `estimativa_service.py`
* `item_service.py`
* `livreiro_service.py`
* `livro_service.py`
* `autenticacao_service.py`
* `carrinho_service.py`
* `catalogo_service.py`
* `dashboard_livreiro_service.py`
* `favorito_service.py`
* `pedido_service.py`
* `perfil_service.py`
* `pergunta_service.py`
* `relatorio_vendas_service.py`
* `recuperar_senha_service.py`

####  UTILITÁRIOS E TRATAMENTO DE DADOS (`backend/utils/`)
* `validadores.py` *(Algoritmo Módulo 11 de CPF, validações de e-mail, telefone, CEP, nomes e sanitização de dados)*

####  BIBLIOTECAS COMPARTILHADAS DO FRONTEND (`frontend/src/assets/js/`)
* `masks.js` *(Máscaras de digitação, validação de CPF e auto-preenchimento de endereço com ViaCEP)*
* `theme.js` *(Gerenciador do Modo Escuro / Claro com persistência)*
* `toast.js` *(Sistema moderno de notificações e modais que substitui alert() e confirm())*
* `menu-usuario.js` *(Cabeçalho dinâmico do usuário com avatar e dropdown)*
* `api.js` *(Cliente HTTP padronizado com tratamento de erros)*

## Como executar o projeto (passo a passo completo)

### Pré-requisitos

- **Python 3.10+** instalado
- **MySQL** rodando localmente (ex: WampServer, XAMPP ou MySQL Server + Workbench)
- Um navegador para abrir o frontend (não precisa de Node/npm — é HTML/JS puro)

### 1. Crie o banco de dados

Abra seu cliente MySQL (Workbench, phpMyAdmin, ou o terminal `mysql`) e execute, **nesta ordem**:

```bash
# 1) Cria o banco, as tabelas e os dados iniciais (categorias + livreiro de teste)
mysql -u root -p < backend/database/create_database.sql

# 2) Cria a procedure de busca de livros com filtros (usada no marketplace)
mysql -u root -p bookly_db < backend/database/procedure.sql
# 3) Cria a procedure de relatório de preço médio por categoria
mysql -u root -p bookly_db < backend/database/procedure_relatorio.sql

# 4) Cria a procedure do painel/dashboard do livreiro
mysql -u root -p bookly_db < backend/database/procedure_dashboard_livreiro.sql

# 5) NOVA: cria as procedures do relatório de vendas (por categoria e período)
mysql -u root -p bookly_db < backend/database/procedure_relatorio_vendas.sql

# 6) (Opcional) Popula o banco com 100 livros reais, livreiros e compradores de teste
#    (senha de todos: teste123) — rode apenas UMA vez
mysql -u root -p bookly_db < backend/database/seed_dados.sql
```

> **Já tinha o banco criado antes das últimas funcionalidades?** Não precisa recriá-lo:
> rode `backend/database/migracao_novas_funcionalidades.sql` (adiciona a foto de perfil,
> a data da venda e as tabelas `favorito`, `carrinho` e `pergunta`) e depois rode de novo
> o `procedure.sql` e o `procedure_relatorio_vendas.sql`. Se aparecer "Duplicate column name"
> ou "already exists", é só porque aquilo já existia: pode ignorar.

> Se você já tinha criado o banco antes desta atualização, basta rodar
> o `procedure.sql` de novo — ele agora começa com `DROP PROCEDURE IF
> EXISTS`, então substitui a versão antiga sem erro (a mudança foi
> passar a retornar também o `idioma` do livro, usado no filtro do
> marketplace).

> Se preferir, pode simplesmente abrir cada um desses 4 arquivos `.sql` no MySQL Workbench (ou phpMyAdmin) e executá-los na ordem acima, um de cada vez, sobre o schema `bookly_db`.

### 2. Configure e rode o backend (API Flask)

```bash
cd backend
```

Crie o ambiente virtual:
```bash
python -m venv .venv
```

Ative o ambiente virtual:

NO WINDOWS:
```bash
.venv\Scripts\activate
```
NO LINUX/MAC:
```bash
source .venv/bin/activate
```

Instale as dependências do projeto:
```bash
pip install flask flask-cors flask-sqlalchemy pymysql python-dotenv
```

(Opcional) Se sua conexão MySQL não for `root` sem senha em `localhost`, crie um arquivo `backend/.env` com:
```
DATABASE_URL=mysql+pymysql://usuario:senha@localhost/bookly_db
```

Execute o backend:
```bash
python app.py
```

A API ficará disponível em:
```
http://127.0.0.1:5000
```

Você pode conferir se subiu certo abrindo essa URL no navegador — ela lista todas as rotas da API, incluindo as novas `/pedidos` e `/livreiros/<id>/dashboard`.

### 3. Abra o frontend

O frontend é HTML/JS/CSS puro, sem build. Basta abrir o arquivo diretamente ou servir a pasta:

```bash
cd frontend
```

**Opção A — abrir direto no navegador:** dê duplo clique em `index.html` (ele redireciona para a tela de login).

**Opção B — servidor local simples (recomendado, evita problemas de CORS/caminho):**
```bash
python -m http.server 5500
```
E acesse `http://127.0.0.1:5500` no navegador.

> Importante: o backend precisa estar rodando (`python app.py`) **ao mesmo tempo** que você usa o frontend, pois todas as telas consomem a API em `http://127.0.0.1:5000`.

### 4. Fluxo de teste sugerido (para validar tudo funcionando)

1. Acesse a tela de **Cadastro** e crie um livreiro (vendedor) e um comprador.
2. Faça **login** com o livreiro criado.
3. Em **"Vender livro"**, cadastre um livro e um exemplar (item) com preço.
4. Faça **logout** (ou abra uma aba anônima) e faça **login com o comprador**.
5. No **Marketplace**, clique em **"Buy now"** no livro cadastrado — isso registra o pedido.
6. Acesse **"Meus pedidos"** (menu superior) e veja a compra no histórico.
7. Faça login novamente como o **livreiro** e acesse **"Painel de vendas"** para ver o item vendido e o faturamento atualizados.
8. Clique no **avatar** (canto superior direito): o menu dá acesso a **Meu perfil** (troque a foto e os dados), **Relatório de vendas**, **Perguntas recebidas** etc.
9. Como comprador, use **"Add cart"** em alguns livros, abra o **Carrinho** pelo menu e **finalize a compra**; use **"Perguntar ao vendedor"** em um livro e responda como livreiro.
### BONUS. TESTES ATRAVÉS DO TERMINAL:
```bash
# 1) Criar livreiro
curl -X POST http://localhost:5000/livreiros -H "Content-Type: application/json" -d "{\"login\":\"joao123\",\"senha\":\"123456\",\"usuario\":\"joaovendedor\",\"cpf\":\"12345678900\",\"email\":\"joao@teste.com\",\"primeiro_nome\":\"João\"}"

# 2) Criar categoria
curl -X POST http://localhost:5000/categorias -H "Content-Type: application/json" -d "{\"nome\":\"Ficção Científica\",\"codigo_index\":\"FC01\"}"

# 3) Criar livro (ajuste os ids conforme retornado acima)
curl -X POST http://localhost:5000/livros -H "Content-Type: application/json" -d "{\"isbn\":\"9780000000001\",\"nome\":\"Duna\",\"autor\":\"Frank Herbert\",\"id_livreiro\":1,\"id_categoria\":1}"

# 4) Listar
curl http://localhost:5000/livros

# 5) Atualizar
curl -X PUT http://localhost:5000/livros/1 -H "Content-Type: application/json" -d "{\"ano_publicacao\":1965}"

# 6) Deletar
curl -X DELETE http://localhost:5000/livros/1
```

## Funcionalidades Implementadas

Todas as funcionalidades abaixo estão implementadas de ponta a ponta:
**Interface → API Flask → Controller → Service → Model/Repository → Banco de Dados.**

1. **Cadastrar livreiro (vendedor)** — Tela `register.html` → `POST /livreiros`
2. **Cadastrar comprador** — Tela `register.html` → `POST /compradores`
3. **Autenticar usuário (login)** — Tela `login.html` → `POST /login`
4. **Listar categorias** — Telas `marketplace.html` e `cadastro.html` → `GET /categorias`
5. **Cadastrar livro** — Tela `cadastro.html` (wizard) → `POST /livros`
6. **Cadastrar item (exemplar do livro à venda)** — Tela `cadastro.html` (wizard) → `POST /itens`
7. **Buscar livros com filtros combinados (marketplace)** — Tela `marketplace.html` → `GET /livros/filtro` (Stored Procedure `sp_buscar_livros_filtro` via `LivroRepository`)
8. **Gerar relatório de preço médio por categoria** — Tela `cadastro.html` (passo 3, recomendação de preço) → `GET /relatorios/preco-medio-categoria` (Stored Procedure `sp_relatorio_preco_medio_categoria` via `CategoriaRepository`)
9. **Atualizar e excluir cadastros** (livro, livreiro, comprador, categoria, item, estimativa) — `PUT`/`DELETE` para cada recurso
10. Favoritar um livro - tela marketplace (coracao) -> POST /compradores/<id>/favoritos -> FavoritoController -> AdicionarFavoritoService -> Favorito (Model)
- Listar favoritos - tela favoritos.html -> GET /compradores/<id>/favoritos -> FavoritoController -> ListarFavoritosService -> Favorito, Item, Livro
- Remover favorito - coracao ou botao "Remover" -> DELETE /compradores/<id>/favoritos/<id_item> -> FavoritoController -> RemoverFavoritoService -> Favorito

### ✨ Novas funcionalidades adicionadas

11. **Comprar item / Registrar Pedido** — Tela `marketplace.html` (botão "Buy now") → `POST /pedidos`
    Coordena três entidades em um único caso de uso: marca o `Item` como vendido, atualiza as estatísticas do `Livreiro` (livros vendidos e faturamento) e do `Comprador` (livros comprados).
    - **Controller:** `PedidoController` (`controllers/pedido_controller.py`)
    - **Service:** `RegistrarPedidoService` (`services/pedido_service.py`)
    - **Models:** `Item`, `Livro`, `Livreiro.registrar_venda()`, `Comprador.registrar_compra()`

    Inclui também a consulta do histórico de compras, na nova tela `meus-pedidos.html`:
    - **Rota:** `GET /compradores/<id>/pedidos`
    - **Service:** `ListarPedidosCompradorService`

12. **Painel de Vendas do Livreiro (Dashboard)** — Nova tela `painel-vendedor/painel.html` → `GET /livreiros/<id>/dashboard`
    Mostra as estatísticas gerais do livreiro (livros cadastrados, itens vendidos, total faturado) e um **ranking de livros por receita**, via consulta especial encapsulada no Repository.
    - **Procedure:** `sp_dashboard_livreiro` (`backend/database/procedure_dashboard_livreiro.sql`)
    - **Repository:** `LivreiroRepository.dashboard_vendas` (`repositories/livreiro_repository.py`)
    - **Service:** `DashboardLivreiroService` (`services/dashboard_livreiro_service.py`)
    - **Controller:** `dashboard_controller` (`controllers/dashboard_controller.py`)

13. **Listar meu catálogo (painel exclusivo do livreiro)** — Nova tela `meu-catalogo/meu-catalogo.html` → `GET /livreiros/<id>/catalogo`
    Mostra, apenas para contas de livreiro, todos os livros/itens anunciados por ele no marketplace.
    - **Controller:** `catalogo_controller` (`controllers/catalogo_controller.py`)
    - **Service:** `ListarCatalogoLivreiroService` (`services/catalogo_service.py`)
    - **Models:** `Livro.listar_por_livreiro()`, `Item`

14. **Editar anúncio (livro + item em uma única operação)** — Tela `meu-catalogo.html` (modal de edição) → `PUT /livreiros/<id>/catalogo/<id_item>`
    Permite renomear o livro e alterar autor, editora, idioma, ano, categoria e preço/condição do exemplar, validando que o anúncio pertence ao livreiro logado. A alteração é refletida automaticamente no Marketplace na próxima consulta.
    - **Controller:** `catalogo_controller`
    - **Service:** `AtualizarAnuncioService` (`services/catalogo_service.py`)
    - **Models:** `Livro`, `Item`, `Categoria`

15. **Remover anúncio do catálogo** — Tela `meu-catalogo.html` (botão "Remover") → `DELETE /livreiros/<id>/catalogo/<id_item>`
    Remove o item do marketplace, bloqueando a remoção de itens já vendidos.
    - **Controller:** `catalogo_controller`
    - **Service:** `RemoverAnuncioService` (`services/catalogo_service.py`)
    - **Model:** `Item`

```bash
# Testando a compra de um item pelo terminal
curl -X POST http://localhost:5000/pedidos -H "Content-Type: application/json" -d "{\"id_item\":1,\"id_comprador\":1}"

# Histórico de pedidos do comprador 1
curl http://localhost:5000/compradores/1/pedidos

# Painel de vendas do livreiro 1
curl http://localhost:5000/livreiros/1/dashboard

# Meu catálogo do livreiro 1
curl http://localhost:5000/livreiros/1/catalogo

# Editar um anúncio (livro 1 / item 1) do livreiro 1
curl -X PUT http://localhost:5000/livreiros/1/catalogo/1 -H "Content-Type: application/json" -d "{\"nome\":\"Duna (edição revisada)\",\"autor\":\"Frank Herbert\",\"id_categoria\":1,\"preco\":59.90,\"conservacao\":\"Bom\"}"

# Remover um anúncio (item 1) do catálogo do livreiro 1
curl -X DELETE http://localhost:5000/livreiros/1/catalogo/1
```

### ✨ Funcionalidades da última etapa

16. **Editar perfil (foto, nome e dados) + menu do usuário** — Nova tela `perfil/perfil.html`, aberta pelo avatar do cabeçalho (menu com as opções de cada tipo de conta) → `GET` e `PUT /perfil/<comprador|livreiro>/<id>`
    O usuário troca a foto de perfil (comprimida no navegador e guardada em `foto_perfil`), o nome, o telefone, a data de nascimento e o endereço. Sem foto, o avatar mostra a inicial do nome. E-mail e CPF não são editáveis.
    - **Controller:** `PerfilController` (`controllers/perfil_controller.py`)
    - **Services:** `BuscarPerfilService` e `AtualizarPerfilService` (`services/perfil_service.py`)
    - **Models:** `Comprador`, `Livreiro` (coluna `foto_perfil`)

17. **Alterar senha** — Tela `perfil.html` (seção "Alterar senha") → `PUT /perfil/<tipo>/<id>/senha`
    Exige a senha atual, a nova senha com 6+ caracteres e diferente da atual.
    - **Controller:** `PerfilController`
    - **Service:** `AlterarSenhaService` (`services/perfil_service.py`)

18. **Carrinho de compras** — Botão "Add cart" do `marketplace.html` e nova tela `carrinho/carrinho.html` (com tela de carrinho vazio)
    - `POST /compradores/<id>/carrinho` (adicionar) · `GET /compradores/<id>/carrinho` (listar, com subtotal por vendedor e total) · `DELETE /compradores/<id>/carrinho/<id_item>` (remover) · `POST /compradores/<id>/carrinho/finalizar` (comprar tudo)
    - **Controller:** `CarrinhoController` (`controllers/carrinho_controller.py`)
    - **Services:** `AdicionarAoCarrinhoService`, `ListarCarrinhoService`, `RemoverDoCarrinhoService`, `FinalizarCompraCarrinhoService` (`services/carrinho_service.py`; a finalização reaproveita `RegistrarPedidoService`)
    - **Model:** `Carrinho` (tabela `carrinho`). Quando um item é vendido, ele sai do carrinho de todos os compradores.

19. **Perguntas ao livreiro** — Comprador: botão "Perguntar ao vendedor" no `marketplace.html`. Livreiro: nova tela `perguntas/perguntas.html` (abas Pendentes / Respondidas / Todas)
    - `POST /itens/<id_item>/perguntas` · `GET /itens/<id_item>/perguntas` · `GET /livreiros/<id>/perguntas?status=` · `PUT /perguntas/<id>/resposta`
    - **Controller:** `PerguntaController` (`controllers/pergunta_controller.py`)
    - **Services:** `CriarPerguntaService`, `ListarPerguntasItemService`, `ListarPerguntasLivreiroService`, `ResponderPerguntaService` (`services/pergunta_service.py`)
    - **Model:** `Pergunta` (tabela `pergunta`). Só o livreiro dono do livro consegue responder.

20. **Relatório de vendas por categoria e período** — Nova tela `relatorio-vendas/relatorio-vendas.html` → `GET /livreiros/<id>/relatorio-vendas?data_inicio=&data_fim=&id_categoria=`
    Mostra receita, livros vendidos, ticket médio, categoria líder, gráfico de receita por categoria e a lista de vendas, com exportação em CSV. A data da venda (`item.data_venda`) passa a ser gravada na compra.
    - **Procedures:** `sp_relatorio_vendas_detalhe` e `sp_relatorio_vendas_categoria` (`backend/database/procedure_relatorio_vendas.sql`)
    - **Repository:** `RelatorioVendasRepository` (`repositories/relatorio_vendas_repository.py`, com `CALL` das procedures)
    - **Service:** `BuscarRelatorioVendasService` (`services/relatorio_vendas_service.py`)
    - **Controller:** `RelatorioVendasController` (`controllers/relatorio_vendas_controller.py`)

Outros ajustes: a página de **Planos foi removida**; a procedure `sp_buscar_livros_filtro` agora devolve `id_categoria` e `id_livreiro` e **não lista mais itens já vendidos**.

```bash
# Perfil do comprador 1
curl http://localhost:5000/perfil/comprador/1

# Colocar o item 1 no carrinho do comprador 1 e finalizar a compra
curl -X POST http://localhost:5000/compradores/1/carrinho -H "Content-Type: application/json" -d "{\"id_item\":1}"
curl -X POST http://localhost:5000/compradores/1/carrinho/finalizar

# Perguntar sobre o item 2 e responder (como livreiro dono do livro)
curl -X POST http://localhost:5000/itens/2/perguntas -H "Content-Type: application/json" -d "{\"id_comprador\":1,\"texto\":\"A capa tem algum rasgo?\"}"
curl "http://localhost:5000/livreiros/1/perguntas?status=pendentes"
curl -X PUT http://localhost:5000/perguntas/1/resposta -H "Content-Type: application/json" -d "{\"id_livreiro\":1,\"texto_resposta\":\"Está em ótimo estado.\"}"

# Relatório de vendas do livreiro 1 em outubro
curl "http://localhost:5000/livreiros/1/relatorio-vendas?data_inicio=2026-10-01&data_fim=2026-10-31"
```

### Busca de livros com filtros combinados

- **Procedure:** `sp_buscar_livros_filtro`
- **Rota:** `GET /livros/filtro?id_categoria=&id_livreiro=&preco_min=&preco_max=`
- **Repository:** `LivroRepository.buscar_livros_filtro`
- **Service:** `BuscarLivrosFiltroService`


```bash
curl "http://localhost:5000/livros/filtro?id_categoria=1&id_livreiro=1&preco_min=20&preco_max=100"
```
### ✨ Novas Funcionalidades e Melhorias de Arquitetura

21. **Tratamento, Higienização e Validação Uniforme de Dados**
    - **Backend (`backend/utils/validadores.py`):**
      - **CPF:** Máscara dinâmica em tempo real `000.000.000-00`, validação de 11 dígitos numéricos, rejeição de sequências repetidas (ex: `111.111.111-11`) e compatibilidade total para testes acadêmicos e números fictícios durante a apresentação do protótipo.
      - **E-mail:** Validação com Regex estrito (`EMAIL_REGEX`), normalização em minúsculas e remoção de espaços em branco.
      - **Telefone:** Validação de DDD e quantidade de dígitos (10 ou 11 dígitos), formatado e armazenado como `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`.
      - **CEP:** Validação de 8 dígitos numéricos, formatado como `00000-000`.
      - **Estado (UF):** Validação contra o conjunto oficial das 27 Unidades Federativas do Brasil (`UFS_VALIDAS`).
      - **Nomes e Textos:** Remoção de espaços duplicados, limitação de caracteres e proteção contra poluição de dados nas tabelas `comprador` e `livreiro`.
    - **Frontend (`frontend/src/assets/js/masks.js`):**
      - Máscaras em tempo real nos campos de CPF, Telefone e CEP.
      - Validação prévia de CPF (Módulo 11) e formato de e-mail antes da submissão no cadastro e perfil.
      - **Integração com ViaCEP:** Consulta assíncrona automática ao digitar o CEP no Cadastro (`register.html`) e no Perfil (`perfil.html`), preenchendo rua, bairro, cidade e estado automaticamente e focando no campo de número.

22. **Sistema de Temas: Modo Escuro e Modo Claro (Dark/Light Mode)**
    - Implementação modular em `theme.js` com tokens semânticos em `base.css` (`[data-theme="dark"]` e `[data-theme="light"]`).
    - **Alternância exclusiva pelo Menu Dropdown do usuário:** O botão solto no topo foi removido, centralizando o controle no dropdown do avatar com indicação visual dinâmica ("Modo claro" / "Modo escuro").
    - **Contraste de Alta Legibilidade:** Ajuste rigoroso de contraste com WCAG AAA no modo claro, eliminando textos cinza-claro invisíveis no fundo branco e aplicando variáveis padronizadas em todas as telas (Marketplace, Login, Cadastro, Perfil, Catálogo, Relatório de Vendas).

23. **Sistema de Feedback e Notificações (BooklyToast & BooklyModal)**
    - Substituição completa de todos os diálogos bloqueantes e nativos do navegador (`window.alert` e `window.confirm`) por componentes visuais modernos (`toast.js` e `toast.css`).
    - Suporte a mensagens informativas, avisos de sucesso, erros da API e modal de confirmação assíncrona (`await BooklyToast.confirm(...)`).
    - Ações rápidas com links seguros (sem âncoras vazias `href="#"`).

24. **Sistema Integrado de Filtros e Busca no Marketplace**
    - **Filtro Lateral Completo:**
      - Seleção dinâmica e combinada de **Categoria / Gênero**, **Condição / Estado de Conservação**, **Idioma** e **Faixa de Preço (BRL)**.
      - **Leitura dinâmica do Banco:** Menor e maior preço lidos via `GET /itens/faixa-preco`, com régua do slider expandida para teto de pelo menos **R$ 500,00** (ou mais se houver livros de valor superior).
      - **Botão "Aplicar filtro":** Aplica todos os critérios do menu lateral simultaneamente ao catálogo de livros com feedback toast instantâneo.
      - **Botão "Limpar filtros":** Reseta as seleções do menu lateral (Categoria, Condição, Idioma e os 2 campos de preço Mín/Máx e Slider) de volta para os padrões sem limpar a busca da barra superior.
    - **Barra de Pesquisa com Botão "X" de Limpeza Rápida:**
      - Campo de busca superior com botão de limpeza rápida (`&times;`) que surge dinamicamente ao digitar e permite apagar o texto com um único clique ou pressionando `Escape`.
      - **Independência dos Filtros:** Digitar ou limpar a busca superior não interfere nem reseta os filtros ativos no menu lateral (e vice-versa).
    - **Botão "Limpar todos os filtros" no Estado Vazio:**
      - Quando nenhum livro corresponde à combinação de filtros, o card do catálogo exibe botão para resetar **completamente** todos os campos: limpa a barra de pesquisa superior, redefine os dois campos de preço (`preco-min-input` e `preco-max-input`), restaura o slider para o valor máximo e seleciona "Todos" em categoria, condição e idioma.

25. **Sistema de Recuperação de Senha ("Esqueceu a senha?") Integrado ao Banco**
    - Fluxo seguro de redefinição de senha em duas etapas (`recuperar-senha.html`):
      1. **Validação de Identidade:** O usuário informa seu e-mail cadastrado e seu CPF. A rota `POST /recuperar-senha/validar` confirma se a combinação existe na tabela `comprador` ou `livreiro`.
      2. **Redefinição:** Confirmada a identidade, o sistema solicita a nova senha (mínimo de 6 caracteres) e confirmação, atualizando com segurança o banco via `POST /recuperar-senha/redefinir`.
    - Link de acesso rápido integrado diretamente na tela de login (`login.html`).

26. **Consulta Automática e Preenchimento por ISBN**
    - **Backend (`ConsultarIsbnService` e rota `GET /livros/consulta-isbn/<isbn>`):**
      - Sistema multi-provedor com fallback: consulta BrasilAPI e Open Library.
      - Retorna título oficial, autor(es), editora, ano de publicação, quantidade de páginas, idioma, sinopse e foto da capa original.
    - **Frontend (`cadastro-livro/cadastro.html` e `cadastro.js`):**
      - Campo de ISBN inteligente com botão *"Buscar dados"*, busca automática ao atingir 10 ou 13 dígitos numéricos, com fallback resiliente diretamente no cliente.
      - Controle de redundância: memoriza o último ISBN consultado para evitar recarregamentos repetidos ao clicar fora do campo (evento blur).
      - Preenche instantaneamente todos os campos do formulário e insere o preview da foto oficial da capa.

27. **Autocomplete Dinâmico em Tempo Real (Livros, Título e CEP/Endereço)**
    - **Autocomplete de Livros e Títulos (`cadastro.html`):**
      - Endpoint `GET /livros/buscar-sugestoes?q=<termo>` que combina o banco de dados local MySQL com a base global da Open Library.
      - Ao digitar parte do título do livro (debounce de 250ms), um dropdown flutuante exibe miniaturas das capas, títulos, autores, editoras e anos.
      - Selecionar uma opção preenche instantaneamente Título, Autor, Editora, Ano de publicação, Páginas, ISBN e Capa.
      - Suporte completo a navegação via teclado (setas para cima/baixo, Enter e Escape).
    - **Autocomplete de CEP e Endereço (`register.html` e `perfil.html`):**
      - Função universal `BooklyMasks.configurarAutocompleteEndereco` em `masks.js`.
      - Enquanto o usuário digita o CEP, um card/dropdown flutuante de sugestão surge com o logradouro e bairro correspondentes.
      - Preenchimento em um clique ou ao completar os 8 dígitos numéricos, focando automaticamente no campo de número.
      - Higienização e limitação de caracteres em todos os campos para prevenir poluição do banco de dados MySQL.

28. **Bookly AI: Precificação Inteligente de Livros com Google Gemini**
    - **Integração Real com IA Generativa (`gemini-3.5-flash-lite`):**
      - Endpoint dedicado `POST /estimativas/ia-precificar` que orquestra a precificação inteligente.
      - Envia os metadados do livro (título, autor, editora, ano, ISBN), as características físicas do exemplar (estado de conservação, tipo de capa, raridade e avarias detalhadas) e os valores de mercado da categoria registrados no MySQL.
      - **Controle Total do Usuário (Sob Demanda):** A chamada à IA não é automática, preservando a cota gratuita da API e dando a escolha ao livreiro através do botão dedicado *"✨ Precificar com IA"*.
      - **Adoção Rápida em 1 Clique:**
        - Botão *"✓ Adotar este preço"* preenche instantaneamente o campo de preço final e recalcula a porcentagem de comparação com o mercado.
        - Botão *"📝 Aproveitar descrição comercial da IA"* copia o texto persuasivo de venda gerado pela IA direto para o campo de observações do exemplar.
      - **Persistência no Banco:** Ao concluir o cadastro, a estimativa sugerida pela IA é salva na tabela `estimativa` do MySQL e associada ao exemplar.
      - **Fallback Heurístico Anti-Falhas:** Caso a cota gratuita expire, ocorra lentidão na internet ou erro na chave, o sistema aciona automaticamente o cálculo estatístico ponderado local com base no MySQL, garantindo que o protótipo nunca trave nem apresente erro para os professores.

29. **Suíte de Testes Automatizados de Integração e Unidade (`test_api.py`)**
    - **26 testes automatizados** cobrindo todo o ciclo da aplicação:
      1. Home e status da API
      2. Autenticação por e-mail, login e nome de usuário
      3. Listagem de categorias e catálogo
      4. Stored procedures (busca com filtros, preço médio, ranking de vendas e dashboard)
      5. Relatório de vendas por categoria e período
      6. Validação de duplicidade de registros
      7. Ciclo completo: criação de livro → exemplar → carrinho → favoritos → perguntas → finalização de pedido
      8. Rejeição estrita de dados malformados (CPF com checksum inválido, e-mails numéricos e telefones fora do padrão)
      9. Sanitização e gravação padronizada no perfil
      10. Faixa dinâmica de menor e maior preço do banco (`GET /itens/faixa-preco`)
      11. Validação de e-mail e CPF na recuperação de senha (`POST /recuperar-senha/validar`)
      12. Redefinição e login com a nova senha (`POST /recuperar-senha/redefinir`)
      13. Consulta de livro por ISBN na API externa com fallback (`GET /livros/consulta-isbn/<isbn>`)
      14. Busca de sugestões de livros para autocomplete (`GET /livros/buscar-sugestoes?q=...`)
      15. Precificação inteligente com Bookly AI e fallback estatístico (`POST /estimativas/ia-precificar`)

```bash
# Para executar a bateria completa de 26 testes automatizados:
python backend/test_api.py
```









Observação: Caso o projeto ainda esteja em fase de prototipação, algumas funcionalidades poderão estar em desenvolvimento.
