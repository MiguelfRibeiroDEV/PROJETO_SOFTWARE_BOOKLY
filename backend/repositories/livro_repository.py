from models.database import db
from sqlalchemy import text

class LivroRepository:

    @staticmethod
    def buscar_livros_filtro(id_categoria=None, id_livreiro=None, preco_min=None, preco_max=None):
        sql = text("CALL sp_buscar_livros_filtro(:id_categoria, :id_livreiro, :preco_min, :preco_max)")

        resultado = db.session.execute(sql, {
            "id_categoria": id_categoria,
            "id_livreiro": id_livreiro,
            "preco_min": preco_min,
            "preco_max": preco_max
        })

        colunas = resultado.keys()
        livros = [dict(zip(colunas, linha)) for linha in resultado.fetchall()]
        return livros