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

#### 🎛️ CONTROLLERS (`backend/controllers/`)
* `categoria_controller.py`
* `comprador_controller.py`
* `estimativa_controller.py`
* `item_controller.py`
* `livreiro_controller.py`
* `livro_controller.py`

#### 🧠 SERVICES (`backend/services/`)
* `categoria_service.py`
* `comprador_service.py`
* `estimativa_service.py`
* `item_service.py`
* `livreiro_service.py`
* `livro_service.py`

#### ATUALIZAÇÃO NO DATABASE
#### ATUALIZAÇÃO NO APP.PY

## 🚀 Como executar o backend

Siga os passos abaixo para configurar o ambiente e rodar a API localmente:

### 1. Entre na pasta do backend:
```bash
cd backend

###2 2. Crie o ambiente virtual:

python -m venv .venv




Observação: Caso o projeto ainda esteja em fase de prototipação, algumas funcionalidades poderão estar em desenvolvimento.
