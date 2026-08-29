from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.catalogo_service import (
    ListarCatalogoLivreiroService,
    AtualizarAnuncioService,
    RemoverAnuncioService,
)
from models.database import db

catalogo_controller = Blueprint("catalogo_controller", __name__)


@catalogo_controller.get("/livreiros/<int:livreiro_id>/catalogo")
def listar_catalogo(livreiro_id):
    try:
        service = ListarCatalogoLivreiroService()
        catalogo = service.executar(livreiro_id)
        return jsonify(catalogo), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404


@catalogo_controller.put("/livreiros/<int:livreiro_id>/catalogo/<int:item_id>")
def atualizar_anuncio(livreiro_id, item_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarAnuncioService()
        anuncio = service.executar(livreiro_id, item_id, dados)

        if anuncio is None:
            return jsonify({"erro": "Anúncio não encontrado."}), 404

        return jsonify(anuncio), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar anúncio no banco de dados."}), 500


@catalogo_controller.delete("/livreiros/<int:livreiro_id>/catalogo/<int:item_id>")
def remover_anuncio(livreiro_id, item_id):
    try:
        service = RemoverAnuncioService()
        removido = service.executar(livreiro_id, item_id)

        if removido is False:
            return jsonify({"erro": "Anúncio não encontrado."}), 404

        return "", 204

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao remover anúncio no banco de dados."}), 500
