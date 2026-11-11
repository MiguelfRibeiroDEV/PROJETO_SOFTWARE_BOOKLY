from models.favorito_model import Favorito
from models.item_model import Item
from models.livro_model import Livro
from models.livreiro_model import Livreiro
from models.comprador_model import Comprador


def _montar_favorito(favorito):
    """Junta os dados do favorito com o livro/item para exibir na tela."""
    item = Item.buscar_por_id(favorito.id_item)
    livro = Livro.buscar_por_id(item.id_livro) if item else None
    if item is None or livro is None:
        return None

    livreiro = Livreiro.buscar_por_id(livro.id_livreiro)
    return {
        "id_favorito": favorito.id_favorito,
        "id_item": item.id_item,
        "id_livro": livro.id_livro,
        "nome": livro.nome,
        "autor": livro.autor,
        "categoria": livro.categoria.nome if livro.categoria else None,
        "livreiro": livreiro.usuario if livreiro else None,
        "preco": float(item.preco) if item.preco is not None else None,
        "conservacao": item.conservacao,
        "fotos_item": item.fotos_item,
        "disponivel": item.id_comprador is None,
    }


class AdicionarFavoritoService:
    """Caso de uso: o comprador marca um anúncio como favorito."""

    def executar(self, id_comprador, dados):
        id_item = dados.get("id_item")
        if not id_item:
            raise ValueError("O campo 'id_item' é obrigatório.")

        if Comprador.buscar_por_id(id_comprador) is None:
            raise ValueError("Comprador não encontrado.")

        item = Item.buscar_por_id(id_item)
        if item is None:
            raise ValueError("Item informado não existe.")

        if item.id_comprador is not None:
            raise ValueError("Este item já foi vendido e não pode ser favoritado.")

        if Favorito.buscar(id_comprador, id_item) is not None:
            raise ValueError("Este item já está nos seus favoritos.")

        favorito = Favorito(id_comprador=id_comprador, id_item=id_item)
        favorito.salvar()
        return favorito.to_dict()


class RemoverFavoritoService:
    """Caso de uso: o comprador remove um anúncio dos favoritos."""

    def executar(self, id_comprador, id_item):
        favorito = Favorito.buscar(id_comprador, id_item)
        if favorito is None:
            return False

        favorito.deletar()
        return True


class ListarFavoritosService:
    """Caso de uso: listar os anúncios favoritos de um comprador."""

    def executar(self, id_comprador):
        if Comprador.buscar_por_id(id_comprador) is None:
            raise ValueError("Comprador não encontrado.")

        favoritos = []
        for favorito in Favorito.listar_por_comprador(id_comprador):
            dados = _montar_favorito(favorito)
            if dados is not None:
                favoritos.append(dados)
        return favoritos
