from repositories.categoria_repository import CategoriaRepository

class RelatorioPrecoMedioService:

    @staticmethod
    def executar():
        return CategoriaRepository.relatorio_preco_medio()