from datetime import date, datetime

from models.livreiro_model import Livreiro
from repositories.relatorio_vendas_repository import RelatorioVendasRepository


def _converter_data(valor, rotulo):
    if not valor:
        return None
    try:
        return datetime.strptime(valor, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"Data inválida em '{rotulo}'. Use o formato AAAA-MM-DD.")


def _iso(valor):
    return valor.isoformat() if isinstance(valor, (date, datetime)) else valor


class BuscarRelatorioVendasService:
    """Caso de uso: relatório de vendas do livreiro por categoria e período.
    Valida os filtros, chama o Repository (stored procedures) e monta o resumo."""

    def executar(self, id_livreiro, data_inicio=None, data_fim=None, id_categoria=None):
        if Livreiro.buscar_por_id(id_livreiro) is None:
            raise ValueError("Livreiro não encontrado.")

        inicio = _converter_data(data_inicio, "data_inicio")
        fim = _converter_data(data_fim, "data_fim")
        if inicio and fim and inicio > fim:
            raise ValueError("A data inicial não pode ser maior que a data final.")

        if id_categoria in (None, ""):
            categoria = None
        else:
            try:
                categoria = int(id_categoria)
            except (TypeError, ValueError):
                raise ValueError("Categoria inválida.")

        detalhe = RelatorioVendasRepository.vendas_detalhe(id_livreiro, inicio, fim, categoria)
        por_categoria = RelatorioVendasRepository.vendas_por_categoria(id_livreiro, inicio, fim, categoria)

        vendas = [{
            "id_item": v["id_item"],
            "data_venda": _iso(v["data_venda"]),
            "livro": v["livro"],
            "autor": v["autor"],
            "categoria": v["categoria"],
            "comprador": v["comprador"],
            "preco": float(v["preco"]),
        } for v in detalhe]

        categorias = [{
            "id_categoria": c["id_categoria"],
            "categoria": c["categoria"],
            "quantidade": int(c["quantidade"]),
            "receita": float(c["receita"]),
        } for c in por_categoria]

        receita = round(sum(v["preco"] for v in vendas), 2)
        quantidade = len(vendas)
        return {
            "filtros": {
                "data_inicio": inicio.isoformat() if inicio else None,
                "data_fim": fim.isoformat() if fim else None,
                "id_categoria": categoria,
            },
            "resumo": {
                "receita": receita,
                "quantidade": quantidade,
                "ticket_medio": round(receita / quantidade, 2) if quantidade else 0.0,
                "categoria_lider": categorias[0]["categoria"] if categorias else None,
            },
            "por_categoria": categorias,
            "vendas": vendas,
        }
