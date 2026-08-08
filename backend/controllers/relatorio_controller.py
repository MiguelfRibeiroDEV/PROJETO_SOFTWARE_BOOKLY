from flask import Blueprint, jsonify
from sqlalchemy.exc import SQLAlchemyError

from services.relatorio_preco_medio_service import RelatorioPrecoMedioService
from models.database import db

relatorio_controller = Blueprint("relatorio_controller", __name__)


@relatorio_controller.get("/relatorios/preco-medio-categoria")
def relatorio_preco_medio_categoria():
    try:
        service = RelatorioPrecoMedioService()
        dados = service.executar()
        return jsonify(dados), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao gerar relatório no banco de dados."}), 500