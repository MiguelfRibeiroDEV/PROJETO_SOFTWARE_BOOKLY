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
* `database.py` *(Instância de inicialização do SQLAlchemy)*

####  CONTROLLERS (`backend/controllers/`)
* `categoria_controller.py`
* `comprador_controller.py`
* `estimativa_controller.py`
* `item_controller.py`
* `livreiro_controller.py`
* `livro_controller.py`

####  SERVICES (`backend/services/`)
* `categoria_service.py`
* `comprador_service.py`
* `estimativa_service.py`
* `item_service.py`
* `livreiro_service.py`
* `livro_service.py`

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

# 4) NOVA: cria a procedure do painel/dashboard do livreiro
mysql -u root -p bookly_db < backend/database/procedure_dashboard_livreiro.sql
```

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

10. **Comprar item / Registrar Pedido** — Tela `marketplace.html` (botão "Buy now") → `POST /pedidos`
    Coordena três entidades em um único caso de uso: marca o `Item` como vendido, atualiza as estatísticas do `Livreiro` (livros vendidos e faturamento) e do `Comprador` (livros comprados).
    - **Controller:** `PedidoController` (`controllers/pedido_controller.py`)
    - **Service:** `RegistrarPedidoService` (`services/pedido_service.py`)
    - **Models:** `Item`, `Livro`, `Livreiro.registrar_venda()`, `Comprador.registrar_compra()`

    Inclui também a consulta do histórico de compras, na nova tela `meus-pedidos.html`:
    - **Rota:** `GET /compradores/<id>/pedidos`
    - **Service:** `ListarPedidosCompradorService`

11. **Painel de Vendas do Livreiro (Dashboard)** — Nova tela `painel-vendedor/painel.html` → `GET /livreiros/<id>/dashboard`
    Mostra as estatísticas gerais do livreiro (livros cadastrados, itens vendidos, total faturado) e um **ranking de livros por receita**, via consulta especial encapsulada no Repository.
    - **Procedure:** `sp_dashboard_livreiro` (`backend/database/procedure_dashboard_livreiro.sql`)
    - **Repository:** `LivreiroRepository.dashboard_vendas` (`repositories/livreiro_repository.py`)
    - **Service:** `DashboardLivreiroService` (`services/dashboard_livreiro_service.py`)
    - **Controller:** `dashboard_controller` (`controllers/dashboard_controller.py`)

12. **Listar meu catálogo (painel exclusivo do livreiro)** — Nova tela `meu-catalogo/meu-catalogo.html` → `GET /livreiros/<id>/catalogo`
    Mostra, apenas para contas de livreiro, todos os livros/itens anunciados por ele no marketplace.
    - **Controller:** `catalogo_controller` (`controllers/catalogo_controller.py`)
    - **Service:** `ListarCatalogoLivreiroService` (`services/catalogo_service.py`)
    - **Models:** `Livro.listar_por_livreiro()`, `Item`

13. **Editar anúncio (livro + item em uma única operação)** — Tela `meu-catalogo.html` (modal de edição) → `PUT /livreiros/<id>/catalogo/<id_item>`
    Permite renomear o livro e alterar autor, editora, idioma, ano, categoria e preço/condição do exemplar, validando que o anúncio pertence ao livreiro logado. A alteração é refletida automaticamente no Marketplace na próxima consulta.
    - **Controller:** `catalogo_controller`
    - **Service:** `AtualizarAnuncioService` (`services/catalogo_service.py`)
    - **Models:** `Livro`, `Item`, `Categoria`

14. **Remover anúncio do catálogo** — Tela `meu-catalogo.html` (botão "Remover") → `DELETE /livreiros/<id>/catalogo/<id_item>`
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

### Busca de livros com filtros combinados

- **Procedure:** `sp_buscar_livros_filtro`
- **Rota:** `GET /livros/filtro?id_categoria=&id_livreiro=&preco_min=&preco_max=`
- **Repository:** `LivroRepository.buscar_livros_filtro`
- **Service:** `BuscarLivrosFiltroService`


```bash
curl "http://localhost:5000/livros/filtro?id_categoria=1&id_livreiro=1&preco_min=20&preco_max=100"
```
### Telas FRONT-END









Observação: Caso o projeto ainda esteja em fase de prototipação, algumas funcionalidades poderão estar em desenvolvimento.
