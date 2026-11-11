from sqlalchemy import text

from models.database import db


class RelatorioVendasRepository:
    """Repository do relatório de vendas: consultas especiais feitas por
    stored procedures (ver backend/database/procedure_relatorio_vendas.sql)."""

    @staticmethod
    def _executar(procedure, id_livreiro, data_inicio, data_fim, id_categoria):
        sql = text(f"CALL {procedure}(:id_livreiro, :data_inicio, :data_fim, :id_categoria)")
        resultado = db.session.execute(sql, {
            "id_livreiro": id_livreiro,
            "data_inicio": data_inicio,
            "data_fim": data_fim,
            "id_categoria": id_categoria,
        })
        colunas = resultado.keys()
        return [dict(zip(colunas, linha)) for linha in resultado.fetchall()]

    @staticmethod
    def vendas_detalhe(id_livreiro, data_inicio=None, data_fim=None, id_categoria=None):
        """Uma linha por livro vendido no período."""
        return RelatorioVendasRepository._executar(
            "sp_relatorio_vendas_detalhe", id_livreiro, data_inicio, data_fim, id_categoria)

    @staticmethod
    def vendas_por_categoria(id_livreiro, data_inicio=None, data_fim=None, id_categoria=None):
        """Receita e quantidade vendida agrupadas por categoria."""
        return RelatorioVendasRepository._executar(
            "sp_relatorio_vendas_categoria", id_livreiro, data_inicio, data_fim, id_categoria)
