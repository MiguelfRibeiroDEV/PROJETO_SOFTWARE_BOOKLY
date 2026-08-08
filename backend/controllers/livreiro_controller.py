from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.livreiro_service import (
    CriarLivreiroService,
    ListarLivreirosService,
    BuscarLivreiroPorIdService,
    AtualizarLivreiroService,
    DeletarLivreiroService,
)
from models.database import db

livreiro_controller = Blueprint("livreiro_controller", __name__)


@livreiro_controller.post("/livreiros")
def criar_livreiro():
    try:
        dados = request.get_json() or {}
        service = CriarLivreiroService()
        livreiro = service.executar(dados)
        return jsonify(livreiro), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar livreiro no banco de dados."}), 500


@livreiro_controller.get("/livreiros")
def listar_livreiros():
    service = ListarLivreirosService()
    livreiros = service.executar()
    return jsonify(livreiros), 200


@livreiro_controller.get("/livreiros/<int:livreiro_id>")
def buscar_livreiro_por_id(livreiro_id):
    service = BuscarLivreiroPorIdService()
    livreiro = service.executar(livreiro_id)

    if livreiro is None:
        return jsonify({"erro": "Livreiro não encontrado."}), 404

    return jsonify(livreiro), 200


@livreiro_controller.put("/livreiros/<int:livreiro_id>")
def atualizar_livreiro(livreiro_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarLivreiroService()
        livreiro = service.executar(livreiro_id, dados)

        if livreiro is None:
            return jsonify({"erro": "Livreiro não encontrado."}), 404

        return jsonify(livreiro), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar livreiro no banco de dados."}), 500


@livreiro_controller.delete("/livreiros/<int:livreiro_id>")
def deletar_livreiro(livreiro_id):
    try:
        service = DeletarLivreiroService()
        livreiro_deletado = service.executar(livreiro_id)

        if livreiro_deletado is False:
            return jsonify({"erro": "Livreiro não encontrado."}), 404

        return "", 204

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar livreiro no banco de dados."}), 500