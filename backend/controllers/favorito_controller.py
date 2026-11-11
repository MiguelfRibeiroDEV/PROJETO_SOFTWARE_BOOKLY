from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.favorito_service import (
    AdicionarFavoritoService,
    RemoverFavoritoService,
    ListarFavoritosService,
)
from models.database import db

favorito_controller = Blueprint("favorito_controller", __name__)


class FavoritoController:
    """
    Controller dos favoritos, implementado como classe. Recebe a
    requisição HTTP, delega a regra de negócio ao Service de cada caso
    de uso e devolve a resposta da API (sem regra de negócio aqui).
    """

    def adicionar(self, comprador_id):
        try:
            dados = request.get_json() or {}
            favorito = AdicionarFavoritoService().executar(comprador_id, dados)
            return jsonify(favorito), 201

        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400

        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao salvar favorito no banco de dados."}), 500

    def remover(self, comprador_id, item_id):
        try:
            removido = RemoverFavoritoService().executar(comprador_id, item_id)
            if removido is False:
                return jsonify({"erro": "Favorito não encontrado."}), 404
            return "", 204

        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao remover favorito no banco de dados."}), 500

    def listar(self, comprador_id):
        try:
            favoritos = ListarFavoritosService().executar(comprador_id)
            return jsonify(favoritos), 200

        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404

        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao consultar favoritos no banco de dados."}), 500


# Registra as rotas apontando para os métodos da classe
_controller = FavoritoController()
favorito_controller.add_url_rule(
    "/compradores/<int:comprador_id>/favoritos", view_func=_controller.adicionar, methods=["POST"])
favorito_controller.add_url_rule(
    "/compradores/<int:comprador_id>/favoritos", view_func=_controller.listar, methods=["GET"])
favorito_controller.add_url_rule(
    "/compradores/<int:comprador_id>/favoritos/<int:item_id>", view_func=_controller.remover, methods=["DELETE"])
