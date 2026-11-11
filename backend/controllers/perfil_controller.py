from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.perfil_service import (
    BuscarPerfilService,
    AtualizarPerfilService,
    AlterarSenhaService,
)
from models.database import db

perfil_controller = Blueprint("perfil_controller", __name__)


class PerfilController:
    """
    Controller do perfil do usuário (comprador ou livreiro), implementado como
    classe: recebe a requisição HTTP, delega ao Service e devolve a resposta.
    """

    def __init__(self):
        self.buscar_service = BuscarPerfilService()
        self.atualizar_service = AtualizarPerfilService()
        self.senha_service = AlterarSenhaService()

    def buscar(self, tipo, usuario_id):
        try:
            perfil = self.buscar_service.executar(tipo, usuario_id)
            if perfil is None:
                return jsonify({"erro": "Usuário não encontrado."}), 404
            return jsonify(perfil), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400

    def atualizar(self, tipo, usuario_id):
        try:
            dados = request.get_json() or {}
            perfil = self.atualizar_service.executar(tipo, usuario_id, dados)
            if perfil is None:
                return jsonify({"erro": "Usuário não encontrado."}), 404
            return jsonify(perfil), 200
        except ValueError as erro:
            db.session.rollback()
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao atualizar o perfil no banco de dados."}), 500

    def alterar_senha(self, tipo, usuario_id):
        try:
            dados = request.get_json() or {}
            alterou = self.senha_service.executar(tipo, usuario_id, dados)
            if alterou is False:
                return jsonify({"erro": "Usuário não encontrado."}), 404
            return jsonify({"mensagem": "Senha alterada com sucesso."}), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao alterar a senha no banco de dados."}), 500


_controller = PerfilController()
perfil_controller.add_url_rule("/perfil/<tipo>/<int:usuario_id>", view_func=_controller.buscar, methods=["GET"])
perfil_controller.add_url_rule("/perfil/<tipo>/<int:usuario_id>", view_func=_controller.atualizar, methods=["PUT"])
perfil_controller.add_url_rule("/perfil/<tipo>/<int:usuario_id>/senha", view_func=_controller.alterar_senha, methods=["PUT"])
