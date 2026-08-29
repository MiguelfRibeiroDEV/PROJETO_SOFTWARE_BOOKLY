from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.autenticacao_service import AutenticarUsuarioService
from models.database import db

auth_controller = Blueprint("auth_controller", __name__)


class AutenticacaoController:
    """
    Controller da autenticação, implementado como classe (conforme
    arquitetura da disciplina). Recebe a requisição HTTP, delega a
    regra de negócio ao Service e devolve a resposta da API — sem
    lógica de negócio aqui dentro.
    """

    def __init__(self):
        self.service = AutenticarUsuarioService()

    def login(self):
        try:
            dados = request.get_json() or {}
            usuario = self.service.executar(dados)
            return jsonify(usuario), 200

        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 401

        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao autenticar no banco de dados."}), 500


# Instancia o controller e registra a rota apontando para o método da classe
_controller = AutenticacaoController()
auth_controller.add_url_rule("/login", view_func=_controller.login, methods=["POST"])
