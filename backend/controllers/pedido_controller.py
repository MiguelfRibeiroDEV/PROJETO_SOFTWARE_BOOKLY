from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.pedido_service import RegistrarPedidoService, ListarPedidosCompradorService
from models.database import db

pedido_controller = Blueprint("pedido_controller", __name__)


class PedidoController:
    """Controller de Pedidos, implementado como classe. Relacionado ao
    caso de uso de compra (Item + Comprador + Livreiro). Recebe a
    requisição HTTP, delega ao Service e devolve a resposta da API —
    sem regra de negócio aqui dentro."""

    def __init__(self):
        self.registrar_service = RegistrarPedidoService()
        self.listar_service = ListarPedidosCompradorService()

    def registrar_pedido(self):
        try:
            dados = request.get_json() or {}
            resultado = self.registrar_service.executar(dados)
            return jsonify(resultado), 201

        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400

        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao registrar pedido no banco de dados."}), 500

    def listar_pedidos_comprador(self, comprador_id):
        try:
            pedidos = self.listar_service.executar(comprador_id)
            return jsonify(pedidos), 200

        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404

        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao consultar pedidos no banco de dados."}), 500


# Instancia o controller e registra as rotas apontando para os métodos da classe
_controller = PedidoController()
pedido_controller.add_url_rule("/pedidos", view_func=_controller.registrar_pedido, methods=["POST"])
pedido_controller.add_url_rule(
    "/compradores/<int:comprador_id>/pedidos",
    view_func=_controller.listar_pedidos_comprador,
    methods=["GET"],
)
