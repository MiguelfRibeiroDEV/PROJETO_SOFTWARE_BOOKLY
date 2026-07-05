from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.livro_service import (
    CriarLivroService,
    ListarLivrosService,
    BuscarLivroPorIdService,
    AtualizarLivroService,
    DeletarLivroService,
)
from models.database import db

livro_controller = Blueprint("livro_controller", __name__)


@livro_controller.post("/livros")
def criar_livro():
    try:
        dados = request.get_json() or {}
        service = CriarLivroService()
        livro = service.executar(dados)
        return jsonify(livro), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar livro no banco de dados."}), 500


@livro_controller.get("/livros")
def listar_livros():
    service = ListarLivrosService()
    livros = service.executar()
    return jsonify(livros), 200


@livro_controller.get("/livros/<int:livro_id>")
def buscar_livro_por_id(livro_id):
    service = BuscarLivroPorIdService()
    livro = service.executar(livro_id)

    if livro is None:
        return jsonify({"erro": "Livro não encontrado."}), 404

    return jsonify(livro), 200


@livro_controller.put("/livros/<int:livro_id>")
def atualizar_livro(livro_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarLivroService()
        livro = service.executar(livro_id, dados)

        if livro is None:
            return jsonify({"erro": "Livro não encontrado."}), 404

        return jsonify(livro), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar livro no banco de dados."}), 500


@livro_controller.delete("/livros/<int:livro_id>")
def deletar_livro(livro_id):
    try:
        service = DeletarLivroService()
        livro_deletado = service.executar(livro_id)

        if livro_deletado is False:
            return jsonify({"erro": "Livro não encontrado."}), 404

        return "", 204

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar livro no banco de dados."}), 500