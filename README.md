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

O BookPrice AI é um sistema desenvolvido para auxiliar sebos e vendedores de livros usados na definição de preços mais adequados para seus produtos.

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

#### - ATUALIZAÇÃO NO DATABASE
#### - ATUALIZAÇÃO NO APP.PY

##  Como executar o backend

Siga os passos abaixo para configurar o ambiente e rodar a API localmente:

### 1. Entre na pasta do backend:
```bash
cd backend
```
### 2. Crie o ambiente virtual:
```bash
python -m venv .venv
```
### 3. Ative o ambiente virtual:
NO WINDOWS:
```bash
.venv\Scripts\activate
```
NO LINUX:
```bash
source .venv/bin/activate
```
### 4. Instale as dependências do projeto:
```bash
pip install flask flask-cors flask-sqlalchemy pymysql python-dotenv
```
### 5. Execute o backend:
```bash
python app.py
```

### 6. API disponível em:
```bash
[http://127.0.0.1:5000](http://127.0.0.1:5000)
```
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







Observação: Caso o projeto ainda esteja em fase de prototipação, algumas funcionalidades poderão estar em desenvolvimento.
