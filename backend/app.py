import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

# Importa a instância do banco de dados
from models.database import db

# Importa as suas models para que o SQLAlchemy as reconheça ao iniciar o app
from models.livreiro_model import Livreiro
from models.livro_model import Livro
from models.categoria_model import Categoria
from models.comprador_model import Comprador
from models.item_model import Item
from models.estimativa_model import Estimativa

# Importa os controllers (Blueprints) com as rotas da API
from controllers.livreiro_controller import livreiro_controller
from controllers.livro_controller import livro_controller
from controllers.categoria_controller import categoria_controller
from controllers.comprador_controller import comprador_controller
from controllers.item_controller import item_controller
from controllers.estimativa_controller import estimativa_controller


def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app)

    # Configuração de conexão com o MySQL do WampServer
    mysql_padrao = "mysql+pymysql://root:@localhost/bookly_db"
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", mysql_padrao)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Inicializa o banco no Flask
    db.init_app(app)

    # Registra as rotas de cada entidade
    app.register_blueprint(livreiro_controller)
    app.register_blueprint(livro_controller)
    app.register_blueprint(categoria_controller)
    app.register_blueprint(comprador_controller)
    app.register_blueprint(item_controller)
    app.register_blueprint(estimativa_controller)

    @app.get("/")
    def home():
        return jsonify({
            "mensagem": "API Bookly + Flask + MySQL rodando com sucesso!",
            "status": "Conectado",
            "rotas": {
                "livreiros": {
                    "listar": "GET /livreiros",
                    "buscar": "GET /livreiros/<id>",
                    "criar": "POST /livreiros",
                    "atualizar": "PUT /livreiros/<id>",
                    "deletar": "DELETE /livreiros/<id>",
                },
                "compradores": {
                    "listar": "GET /compradores",
                    "buscar": "GET /compradores/<id>",
                    "criar": "POST /compradores",
                    "atualizar": "PUT /compradores/<id>",
                    "deletar": "DELETE /compradores/<id>",
                },
                "categorias": {
                    "listar": "GET /categorias",
                    "buscar": "GET /categorias/<id>",
                    "criar": "POST /categorias",
                    "atualizar": "PUT /categorias/<id>",
                    "deletar": "DELETE /categorias/<id>",
                },
                "livros": {
                    "listar": "GET /livros",
                    "buscar": "GET /livros/<id>",
                    "criar": "POST /livros",
                    "atualizar": "PUT /livros/<id>",
                    "deletar": "DELETE /livros/<id>",
                },
                "itens": {
                    "listar": "GET /itens",
                    "buscar": "GET /itens/<id>",
                    "criar": "POST /itens",
                    "atualizar": "PUT /itens/<id>",
                    "deletar": "DELETE /itens/<id>",
                },
                "estimativas": {
                    "listar": "GET /estimativas",
                    "buscar": "GET /estimativas/<id>",
                    "criar": "POST /estimativas",
                    "atualizar": "PUT /estimativas/<id>",
                    "deletar": "DELETE /estimativas/<id>",
                },
            },
        })

    with app.app_context():
        # Sincroniza o mapeamento com as tabelas já existentes no MySQL
        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "True") == "True"
    app.run(debug=debug, host="0.0.0.0", port=5000)