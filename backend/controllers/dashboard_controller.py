from flask import Blueprint, jsonify
from sqlalchemy.exc import SQLAlchemyError

from services.dashboard_livreiro_service import DashboardLivreiroService
from models.database import db

dashboard_controller = Blueprint("dashboard_controller", __name__)


@dashboard_controller.get("/livreiros/<int:livreiro_id>/dashboard")
def dashboard_livreiro(livreiro_id):
    try:
        service = DashboardLivreiroService()
        dados = service.executar(livreiro_id)
        return jsonify(dados), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao gerar dashboard no banco de dados."}), 500
