from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.categoria_service import (
    CriarCategoriaService,
    ListarCategoriasService,
    BuscarCategoriaPorIdService,
    AtualizarCategoriaService,
    DeletarCategoriaService,
)
from models.database import db

categoria_controller = Blueprint("categoria_controller", __name__)


@categoria_controller.post("/categorias")
def criar_categoria():
    try:
        dados = request.get_json() or {}
        service = CriarCategoriaService()
        categoria = service.executar(dados)
        return jsonify(categoria), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar categoria no banco de dados."}), 500


@categoria_controller.get("/categorias")
def listar_categorias():
    service = ListarCategoriasService()
    categorias = service.executar()
    return jsonify(categorias), 200


@categoria_controller.get("/categorias/<int:categoria_id>")
def buscar_categoria_por_id(categoria_id):
    service = BuscarCategoriaPorIdService()
    categoria = service.executar(categoria_id)

    if categoria is None:
        return jsonify({"erro": "Categoria não encontrada."}), 404

    return jsonify(categoria), 200


@categoria_controller.put("/categorias/<int:categoria_id>")
def atualizar_categoria(categoria_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarCategoriaService()
        categoria = service.executar(categoria_id, dados)

        if categoria is None:
            return jsonify({"erro": "Categoria não encontrada."}), 404

        return jsonify(categoria), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar categoria no banco de dados."}), 500


@categoria_controller.delete("/categorias/<int:categoria_id>")
def deletar_categoria(categoria_id):
    try:
        service = DeletarCategoriaService()
        categoria_deletada = service.executar(categoria_id)

        if categoria_deletada is False:
            return jsonify({"erro": "Categoria não encontrada."}), 404

        return "", 204

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar categoria no banco de dados."}), 500