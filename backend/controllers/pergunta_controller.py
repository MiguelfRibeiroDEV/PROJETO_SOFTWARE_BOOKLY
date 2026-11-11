from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.pergunta_service import (
    CriarPerguntaService,
    ListarPerguntasItemService,
    ListarPerguntasLivreiroService,
    ResponderPerguntaService,
)
from models.database import db

pergunta_controller = Blueprint("pergunta_controller", __name__)


class PerguntaController:
    """
    Controller das perguntas ao livreiro (classe). Recebe a requisição HTTP,
    delega ao Service do caso de uso e devolve a resposta da API.
    """

    def __init__(self):
        self.criar_service = CriarPerguntaService()
        self.listar_item_service = ListarPerguntasItemService()
        self.listar_livreiro_service = ListarPerguntasLivreiroService()
        self.responder_service = ResponderPerguntaService()

    def criar(self, item_id):
        try:
            dados = request.get_json() or {}
            return jsonify(self.criar_service.executar(item_id, dados)), 201
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao registrar a pergunta."}), 500

    def listar_por_item(self, item_id):
        try:
            return jsonify(self.listar_item_service.executar(item_id)), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao consultar as perguntas."}), 500

    def listar_por_livreiro(self, livreiro_id):
        try:
            status = request.args.get("status", "pendentes")
            return jsonify(self.listar_livreiro_service.executar(livreiro_id, status)), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao consultar as perguntas."}), 500

    def responder(self, pergunta_id):
        try:
            dados = request.get_json() or {}
            resultado = self.responder_service.executar(pergunta_id, dados)
            if resultado is None:
                return jsonify({"erro": "Pergunta não encontrada."}), 404
            return jsonify(resultado), 200
        except ValueError as erro:
            db.session.rollback()
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao registrar a resposta."}), 500


_controller = PerguntaController()
pergunta_controller.add_url_rule("/itens/<int:item_id>/perguntas", view_func=_controller.criar, methods=["POST"])
pergunta_controller.add_url_rule("/itens/<int:item_id>/perguntas", view_func=_controller.listar_por_item, methods=["GET"])
pergunta_controller.add_url_rule("/livreiros/<int:livreiro_id>/perguntas", view_func=_controller.listar_por_livreiro, methods=["GET"])
pergunta_controller.add_url_rule("/perguntas/<int:pergunta_id>/resposta", view_func=_controller.responder, methods=["PUT"])
