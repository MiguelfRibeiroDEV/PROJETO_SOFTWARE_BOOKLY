from models.database import db
from sqlalchemy import text


class LivreiroRepository:
    """Repository do Livreiro: usado apenas para a consulta especial de
    ranking de vendas (dashboard), que não é um CRUD simples e portanto
    não pertence à Model."""

    @staticmethod
    def dashboard_vendas(id_livreiro):
        sql = text("CALL sp_dashboard_livreiro(:id_livreiro)")

        resultado = db.session.execute(sql, {"id_livreiro": id_livreiro})

        colunas = resultado.keys()
        ranking = [dict(zip(colunas, linha)) for linha in resultado.fetchall()]
        return ranking
