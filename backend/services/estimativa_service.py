from models.estimativa_model import Estimativa
from models.item_model import Item


class CriarEstimativaService:
    def executar(self, dados):
        if not dados.get("id_item"):
            raise ValueError("O campo 'id_item' é obrigatório.")

        if not Item.buscar_por_id(dados["id_item"]):
            raise ValueError("Item informado não existe.")

        estimativa = Estimativa(
            id_item=dados["id_item"],
            preco_estimado=dados.get("preco_estimado"),
            possivel_descricao=dados.get("possivel_descricao"),
        )

        estimativa.salvar()
        return estimativa.to_dict()


class ListarEstimativasService:
    def executar(self):
        estimativas = Estimativa.listar_todos()
        return [estimativa.to_dict() for estimativa in estimativas]


class BuscarEstimativaPorIdService:
    def executar(self, estimativa_id):
        estimativa = Estimativa.buscar_por_id(estimativa_id)

        if estimativa is None:
            return None

        return estimativa.to_dict()


class AtualizarEstimativaService:
    def executar(self, estimativa_id, dados):
        estimativa = Estimativa.buscar_por_id(estimativa_id)

        if estimativa is None:
            return None

        novo_item_id = dados.get("id_item")
        if novo_item_id and not Item.buscar_por_id(novo_item_id):
            raise ValueError("Item informado não existe.")

        estimativa.atualizar(
            preco_estimado=dados.get("preco_estimado"),
            possivel_descricao=dados.get("possivel_descricao"),
            id_item=dados.get("id_item"),
        )

        return estimativa.to_dict()


class DeletarEstimativaService:
    def executar(self, estimativa_id):
        estimativa = Estimativa.buscar_por_id(estimativa_id)

        if estimativa is None:
            return False

        estimativa.deletar()
        return True