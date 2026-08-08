from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.item_service import (
    CriarItemService,
    ListarItensService,
    BuscarItemPorIdService,
    AtualizarItemService,
    DeletarItemService,
)
from models.database import db

item_controller = Blueprint("item_controller", __name__)


@item_controller.post("/itens")
def criar_item():
    try:
        dados = request.get_json() or {}
        service = CriarItemService()
        item = service.executar(dados)
        return jsonify(item), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar item no banco de dados."}), 500


@item_controller.get("/itens")
def listar_itens():
    service = ListarItensService()
    itens = service.executar()
    return jsonify(itens), 200


@item_controller.get("/itens/<int:item_id>")
def buscar_item_por_id(item_id):
    service = BuscarItemPorIdService()
    item = service.executar(item_id)

    if item is None:
        return jsonify({"erro": "Item não encontrado."}), 404

    return jsonify(item), 200


@item_controller.put("/itens/<int:item_id>")
def atualizar_item(item_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarItemService()
        item = service.executar(item_id, dados)

        if item is None:
            return jsonify({"erro": "Item não encontrado."}), 404

        return jsonify(item), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar item no banco de dados."}), 500


@item_controller.delete("/itens/<int:item_id>")
def deletar_item(item_id):
    try:
        service = DeletarItemService()
        item_deletado = service.executar(item_id)

        if item_deletado is False:
            return jsonify({"erro": "Item não encontrado."}), 404

        return "", 204

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar item no banco de dados."}), 500