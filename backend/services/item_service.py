from models.item_model import Item
from models.livro_model import Livro
from models.comprador_model import Comprador


class CriarItemService:
    def executar(self, dados):
        campos_obrigatorios = ["preco", "id_livro"]

        for campo in campos_obrigatorios:
            if dados.get(campo) in (None, ""):
                raise ValueError(f"O campo '{campo}' é obrigatório.")

        if not Livro.buscar_por_id(dados["id_livro"]):
            raise ValueError("Livro informado não existe.")

        if dados.get("id_comprador") and not Comprador.buscar_por_id(dados["id_comprador"]):
            raise ValueError("Comprador informado não existe.")

        item = Item(
            preco=dados["preco"],
            id_livro=dados["id_livro"],
            id_comprador=dados.get("id_comprador"),
            edicao=dados.get("edicao"),
            descricao=dados.get("descricao"),
            ano_aquisicao=dados.get("ano_aquisicao"),
            conservacao=dados.get("conservacao"),
            dedicatorio=dados.get("dedicatorio", False),
            raridade=dados.get("raridade"),
            tipo_capa=dados.get("tipo_capa"),
            presenca_de_grifos=dados.get("presenca_de_grifos", False),
            fotos_item=dados.get("fotos_item"),
        )

        item.salvar()
        return item.to_dict()


class ListarItensService:
    def executar(self):
        itens = Item.listar_todos()
        return [item.to_dict() for item in itens]


class BuscarItemPorIdService:
    def executar(self, item_id):
        item = Item.buscar_por_id(item_id)

        if item is None:
            return None

        return item.to_dict()


class AtualizarItemService:
    def executar(self, item_id, dados):
        item = Item.buscar_por_id(item_id)

        if item is None:
            return None

        novo_livro_id = dados.get("id_livro")
        if novo_livro_id and not Livro.buscar_por_id(novo_livro_id):
            raise ValueError("Livro informado não existe.")

        novo_comprador_id = dados.get("id_comprador")
        if novo_comprador_id and not Comprador.buscar_por_id(novo_comprador_id):
            raise ValueError("Comprador informado não existe.")

        item.atualizar(
            preco=dados.get("preco"),
            id_livro=dados.get("id_livro"),
            id_comprador=dados.get("id_comprador"),
            edicao=dados.get("edicao"),
            descricao=dados.get("descricao"),
            ano_aquisicao=dados.get("ano_aquisicao"),
            conservacao=dados.get("conservacao"),
            dedicatorio=dados.get("dedicatorio"),
            raridade=dados.get("raridade"),
            tipo_capa=dados.get("tipo_capa"),
            presenca_de_grifos=dados.get("presenca_de_grifos"),
            fotos_item=dados.get("fotos_item"),
        )

        return item.to_dict()


class DeletarItemService:
    def executar(self, item_id):
        item = Item.buscar_por_id(item_id)

        if item is None:
            return False

        item.deletar()
        return True