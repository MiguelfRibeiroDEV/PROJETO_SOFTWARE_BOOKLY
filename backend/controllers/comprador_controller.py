from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.comprador_service import (
    CriarCompradorService,
    ListarCompradoresService,
    BuscarCompradorPorIdService,
    AtualizarCompradorService,
    DeletarCompradorService,
)
from models.database import db

comprador_controller = Blueprint("comprador_controller", __name__)


@comprador_controller.post("/compradores")
def criar_comprador():
    try:
        dados = request.get_json() or {}
        service = CriarCompradorService()
        comprador = service.executar(dados)
        return jsonify(comprador), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar comprador no banco de dados."}), 500


@comprador_controller.get("/compradores")
def listar_compradores():
    service = ListarCompradoresService()
    compradores = service.executar()
    return jsonify(compradores), 200


@comprador_controller.get("/compradores/<int:comprador_id>")
def buscar_comprador_por_id(comprador_id):
    service = BuscarCompradorPorIdService()
    comprador = service.executar(comprador_id)

    if comprador is None:
        return jsonify({"erro": "Comprador não encontrado."}), 404

    return jsonify(comprador), 200


@comprador_controller.put("/compradores/<int:comprador_id>")
def atualizar_comprador(comprador_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarCompradorService()
        comprador = service.executar(comprador_id, dados)

        if comprador is None:
            return jsonify({"erro": "Comprador não encontrado."}), 404

        return jsonify(comprador), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar comprador no banco de dados."}), 500


@comprador_controller.delete("/compradores/<int:comprador_id>")
def deletar_comprador(comprador_id):
    try:
        service = DeletarCompradorService()
        comprador_deletado = service.executar(comprador_id)

        if comprador_deletado is False:
            return jsonify({"erro": "Comprador não encontrado."}), 404

        return "", 204

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar comprador no banco de dados."}), 500