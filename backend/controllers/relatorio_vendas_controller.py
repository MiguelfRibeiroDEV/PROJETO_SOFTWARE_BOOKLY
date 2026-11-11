from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.relatorio_vendas_service import BuscarRelatorioVendasService
from models.database import db

relatorio_vendas_controller = Blueprint("relatorio_vendas_controller", __name__)


class RelatorioVendasController:
    """
    Controller do relatório de vendas do livreiro (classe). Recebe os filtros
    por query string, delega ao Service e devolve o JSON do relatório.
    """

    def __init__(self):
        self.service = BuscarRelatorioVendasService()

    def buscar(self, livreiro_id):
        try:
            resultado = self.service.executar(
                livreiro_id,
                data_inicio=request.args.get("data_inicio"),
                data_fim=request.args.get("data_fim"),
                id_categoria=request.args.get("id_categoria"),
            )
            return jsonify(resultado), 200
        except ValueError as erro:
            mensagem = str(erro)
            status = 404 if "não encontrado" in mensagem else 400
            return jsonify({"erro": mensagem}), status
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao gerar o relatório. Rode procedure_relatorio_vendas.sql no banco."}), 500


_controller = RelatorioVendasController()
relatorio_vendas_controller.add_url_rule(
    "/livreiros/<int:livreiro_id>/relatorio-vendas",
    view_func=_controller.buscar,
    methods=["GET"],
)
