from models.item_model import Item
from models.livro_model import Livro
from models.livreiro_model import Livreiro
from models.comprador_model import Comprador


class RegistrarPedidoService:
    """Caso de uso: um comprador adquire (compra) um item disponível no
    marketplace. Coordena a atualização do Item (marca o comprador) e das
    estatísticas do Livreiro vendedor e do Comprador."""

    def executar(self, dados):
        id_item = dados.get("id_item")
        id_comprador = dados.get("id_comprador")

        if not id_item or not id_comprador:
            raise ValueError("Os campos 'id_item' e 'id_comprador' são obrigatórios.")

        item = Item.buscar_por_id(id_item)
        if item is None:
            raise ValueError("Item informado não existe.")

        if item.id_comprador is not None:
            raise ValueError("Este item já foi vendido.")

        comprador = Comprador.buscar_por_id(id_comprador)
        if comprador is None:
            raise ValueError("Comprador informado não existe.")

        livro = Livro.buscar_por_id(item.id_livro)
        if livro is None:
            raise ValueError("Livro relacionado ao item não foi encontrado.")

        livreiro = Livreiro.buscar_por_id(livro.id_livreiro)
        if livreiro is None:
            raise ValueError("Livreiro relacionado ao item não foi encontrado.")

        # --- EFETIVA A COMPRA (coordena as 3 entidades envolvidas) ---
        preco_pago = item.preco

        item.atualizar(id_comprador=id_comprador)
        livreiro.registrar_venda(preco_pago)
        comprador.registrar_compra()

        pedido = item.to_dict()
        pedido["livro_nome"] = livro.nome
        pedido["livro_autor"] = livro.autor

        return {
            "mensagem": "Compra registrada com sucesso.",
            "pedido": pedido,
        }


class ListarPedidosCompradorService:
    """Caso de uso: consultar o histórico de pedidos (itens comprados) de
    um comprador específico."""

    def executar(self, id_comprador):
        comprador = Comprador.buscar_por_id(id_comprador)
        if comprador is None:
            raise ValueError("Comprador não encontrado.")

        itens_comprados = Item.query.filter_by(id_comprador=id_comprador) \
            .order_by(Item.id_item.desc()).all()

        pedidos = []
        for item in itens_comprados:
            livro = Livro.buscar_por_id(item.id_livro)
            pedido = item.to_dict()
            pedido["livro_nome"] = livro.nome if livro else None
            pedido["livro_autor"] = livro.autor if livro else None
            pedidos.append(pedido)

        return pedidos
