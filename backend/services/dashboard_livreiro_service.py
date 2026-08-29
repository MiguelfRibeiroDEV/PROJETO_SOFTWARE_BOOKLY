from models.livreiro_model import Livreiro
from repositories.livreiro_repository import LivreiroRepository


class DashboardLivreiroService:
    """Caso de uso: montar o painel de vendas de um livreiro, com suas
    estatísticas gerais e o ranking de livros mais vendidos."""

    @staticmethod
    def executar(id_livreiro):
        livreiro = Livreiro.buscar_por_id(id_livreiro)

        if livreiro is None:
            raise ValueError("Livreiro não encontrado.")

        ranking_livros = LivreiroRepository.dashboard_vendas(id_livreiro)

        return {
            "livreiro": {
                "id_livreiro": livreiro.id_livreiro,
                "usuario": livreiro.usuario,
                "primeiro_nome": livreiro.primeiro_nome,
                "livros_registrados": livreiro.livros_registrados,
                "livros_vendidos": livreiro.livros_vendidos,
                "total_faturado": float(livreiro.total_faturado) if livreiro.total_faturado is not None else 0.0,
            },
            "ranking_livros": ranking_livros,
        }
