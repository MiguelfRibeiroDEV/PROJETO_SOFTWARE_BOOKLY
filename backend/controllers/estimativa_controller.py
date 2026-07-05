from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.estimativa_service import (
    CriarEstimativaService,
    ListarEstimativasService,
    BuscarEstimativaPorIdService,
    AtualizarEstimativaService,
    DeletarEstimativaService,
)
from models.database import db

estimativa_controller = Blueprint("estimativa_controller", __name__)


@estimativa_controller.post("/estimativas")
def criar_estimativa():
    try:
        dados = request.get_json() or {}
        service = CriarEstimativaService()
        estimativa = service.executar(dados)
        return jsonify(estimativa), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar estimativa no banco de dados."}), 500


@estimativa_controller.get("/estimativas")
def listar_estimativas():
    service = ListarEstimativasService()
    estimativas = service.executar()
    return jsonify(estimativas), 200


@estimativa_controller.get("/estimativas/<int:estimativa_id>")
def buscar_estimativa_por_id(estimativa_id):
    service = BuscarEstimativaPorIdService()
    estimativa = service.executar(estimativa_id)

    if estimativa is None:
        return jsonify({"erro": "Estimativa não encontrada."}), 404

    return jsonify(estimativa), 200


@estimativa_controller.put("/estimativas/<int:estimativa_id>")
def atualizar_estimativa(estimativa_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarEstimativaService()
        estimativa = service.executar(estimativa_id, dados)

        if estimativa is None:
            return jsonify({"erro": "Estimativa não encontrada."}), 404

        return jsonify(estimativa), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar estimativa no banco de dados."}), 500


@estimativa_controller.delete("/estimativas/<int:estimativa_id>")
def deletar_estimativa(estimativa_id):
    try:
        service = DeletarEstimativaService()
        estimativa_deletada = service.executar(estimativa_id)

        if estimativa_deletada is False:
            return jsonify({"erro": "Estimativa não encontrada."}), 404

        return "", 204

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar estimativa no banco de dados."}), 500