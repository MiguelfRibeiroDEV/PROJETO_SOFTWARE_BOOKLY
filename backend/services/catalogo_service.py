from models.livro_model import Livro
from models.livreiro_model import Livreiro
from models.item_model import Item
from models.categoria_model import Categoria


class ListarCatalogoLivreiroService:
    """Caso de uso: montar a lista de anúncios (livro + item) que
    pertencem a um livreiro, para o painel 'Meu catálogo'."""

    def executar(self, id_livreiro):
        if not Livreiro.buscar_por_id(id_livreiro):
            raise ValueError("Livreiro não encontrado.")

        livros = Livro.listar_por_livreiro(id_livreiro)

        catalogo = []
        for livro in livros:
            for item in livro.itens:
                anuncio = livro.to_dict()
                anuncio.update({
                    "id_item": item.id_item,
                    "preco": float(item.preco) if item.preco is not None else None,
                    "conservacao": item.conservacao,
                    "edicao": item.edicao,
                    "raridade": item.raridade,
                    "tipo_capa": item.tipo_capa,
                    "fotos_item": item.fotos_item,
                    "vendido": item.id_comprador is not None,
                })
                catalogo.append(anuncio)

        return catalogo


class AtualizarAnuncioService:
    """Caso de uso: editar, em uma única operação, os dados do livro
    (título, autor, editora, categoria...) e do item (preço, condição)
    de um anúncio do catálogo do livreiro."""

    def executar(self, id_livreiro, id_item, dados):
        item = Item.buscar_por_id(id_item)
        if item is None:
            return None

        livro = Livro.buscar_por_id(item.id_livro)
        if livro is None or livro.id_livreiro != int(id_livreiro):
            raise ValueError("Este anúncio não pertence ao livreiro informado.")

        nova_categoria_id = dados.get("id_categoria")
        if nova_categoria_id and not Categoria.buscar_por_id(nova_categoria_id):
            raise ValueError("Categoria informada não existe.")

        novo_preco = dados.get("preco")
        if novo_preco is not None and float(novo_preco) < 0:
            raise ValueError("O preço não pode ser negativo.")

        livro.atualizar(
            nome=dados.get("nome"),
            autor=dados.get("autor"),
            editora=dados.get("editora"),
            idioma=dados.get("idioma"),
            ano_publicacao=dados.get("ano_publicacao"),
            id_categoria=dados.get("id_categoria"),
        )

        item.atualizar(
            preco=dados.get("preco"),
            conservacao=dados.get("conservacao"),
            fotos_item=dados.get("fotos_item"),
        )

        resultado = livro.to_dict()
        resultado.update({
            "id_item": item.id_item,
            "preco": float(item.preco) if item.preco is not None else None,
            "conservacao": item.conservacao,
            "fotos_item": item.fotos_item,
            "vendido": item.id_comprador is not None,
        })
        return resultado


class RemoverAnuncioService:
    """Caso de uso: remover um anúncio (item) do catálogo do livreiro,
    tirando-o do marketplace."""

    def executar(self, id_livreiro, id_item):
        item = Item.buscar_por_id(id_item)
        if item is None:
            return False

        livro = Livro.buscar_por_id(item.id_livro)
        if livro is None or livro.id_livreiro != int(id_livreiro):
            raise ValueError("Este anúncio não pertence ao livreiro informado.")

        if item.id_comprador is not None:
            raise ValueError("Não é possível remover um item que já foi vendido.")

        item.deletar()
        return True
