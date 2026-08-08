from repositories.livro_repository import LivroRepository

class BuscarLivrosFiltroService:

    @staticmethod
    def executar(id_categoria, id_livreiro, preco_min, preco_max):
        if preco_min and preco_max and preco_min > preco_max:
            raise ValueError("Preço mínimo não pode ser maior que o preço máximo")

        return LivroRepository.buscar_livros_filtro(
            id_categoria=id_categoria,
            id_livreiro=id_livreiro,
            preco_min=preco_min,
            preco_max=preco_max
        )