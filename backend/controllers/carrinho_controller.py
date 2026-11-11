from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.carrinho_service import (
    AdicionarAoCarrinhoService,
    RemoverDoCarrinhoService,
    ListarCarrinhoService,
    FinalizarCompraCarrinhoService,
)
from models.database import db

carrinho_controller = Blueprint("carrinho_controller", __name__)


class CarrinhoController:
    """
    Controller do carrinho de compras (classe). Recebe a requisição HTTP,
    delega ao Service do caso de uso e devolve a resposta da API.
    """

    def __init__(self):
        self.adicionar_service = AdicionarAoCarrinhoService()
        self.remover_service = RemoverDoCarrinhoService()
        self.listar_service = ListarCarrinhoService()
        self.finalizar_service = FinalizarCompraCarrinhoService()

    def adicionar(self, comprador_id):
        try:
            dados = request.get_json() or {}
            return jsonify(self.adicionar_service.executar(comprador_id, dados)), 201
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao adicionar ao carrinho."}), 500

    def listar(self, comprador_id):
        try:
            return jsonify(self.listar_service.executar(comprador_id)), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao consultar o carrinho."}), 500

    def remover(self, comprador_id, item_id):
        try:
            if not self.remover_service.executar(comprador_id, item_id):
                return jsonify({"erro": "Item não está no carrinho."}), 404
            return "", 204
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao remover do carrinho."}), 500

    def finalizar(self, comprador_id):
        try:
            return jsonify(self.finalizar_service.executar(comprador_id)), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao finalizar a compra."}), 500


_controller = CarrinhoController()
carrinho_controller.add_url_rule("/compradores/<int:comprador_id>/carrinho", view_func=_controller.adicionar, methods=["POST"])
carrinho_controller.add_url_rule("/compradores/<int:comprador_id>/carrinho", view_func=_controller.listar, methods=["GET"])
carrinho_controller.add_url_rule("/compradores/<int:comprador_id>/carrinho/finalizar", view_func=_controller.finalizar, methods=["POST"])
carrinho_controller.add_url_rule("/compradores/<int:comprador_id>/carrinho/<int:item_id>", view_func=_controller.remover, methods=["DELETE"])
