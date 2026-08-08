from models.database import db
from sqlalchemy import text

class CategoriaRepository:

    @staticmethod
    def relatorio_preco_medio():
        sql = text("CALL sp_relatorio_preco_medio_categoria()")

        resultado = db.session.execute(sql)

        colunas = resultado.keys()
        relatorio = [dict(zip(colunas, linha)) for linha in resultado.fetchall()]
        return relatorio