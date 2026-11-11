from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from models.database import db
from services.recuperar_senha_service import (
    ValidarDadosRecuperacaoService,
    RedefinirSenhaService,
)

recuperar_senha_controller = Blueprint("recuperar_senha_controller", __name__)


@recuperar_senha_controller.post("/recuperar-senha/validar")
def validar_dados():
    try:
        dados = request.get_json() or {}
        service = ValidarDadosRecuperacaoService()
        resultado = service.executar(dados)
        return jsonify(resultado), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao consultar o banco de dados."}), 500


@recuperar_senha_controller.post("/recuperar-senha/redefinir")
def redefinir_senha():
    try:
        dados = request.get_json() or {}
        service = RedefinirSenhaService()
        resultado = service.executar(dados)
        return jsonify(resultado), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar senha no banco de dados."}), 500

