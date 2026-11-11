from models.carrinho_model import Carrinho
from models.item_model import Item
from models.livro_model import Livro
from models.livreiro_model import Livreiro
from models.categoria_model import Categoria
from models.comprador_model import Comprador
from services.pedido_service import RegistrarPedidoService


def _montar_linha(entrada):
    """Dados do item do carrinho prontos para a tela."""
    item = Item.buscar_por_id(entrada.id_item)
    livro = Livro.buscar_por_id(item.id_livro) if item else None
    livreiro = Livreiro.buscar_por_id(livro.id_livreiro) if livro else None
    categoria = Categoria.query.get(livro.id_categoria) if livro else None
    return {
        "id_item": entrada.id_item,
        "nome": livro.nome if livro else None,
        "autor": livro.autor if livro else None,
        "categoria": categoria.nome if categoria else None,
        "id_livreiro": livreiro.id_livreiro if livreiro else None,
        "livreiro": f"{livreiro.primeiro_nome} {livreiro.segundo_nome or ''}".strip() if livreiro else None,
        "preco": float(item.preco) if item and item.preco is not None else 0.0,
        "conservacao": item.conservacao if item else None,
        "fotos_item": item.fotos_item if item else None,
        "disponivel": bool(item and item.id_comprador is None),
    }


class AdicionarAoCarrinhoService:
    """Caso de uso: o comprador coloca um item disponível no carrinho."""

    def executar(self, id_comprador, dados):
        id_item = dados.get("id_item")
        if not id_item:
            raise ValueError("O campo 'id_item' é obrigatório.")

        if Comprador.buscar_por_id(id_comprador) is None:
            raise ValueError("Comprador informado não existe.")

        item = Item.buscar_por_id(id_item)
        if item is None:
            raise ValueError("Item informado não existe.")
        if item.id_comprador is not None:
            raise ValueError("Este item já foi vendido.")

        if Carrinho.buscar(id_comprador, id_item) is not None:
            raise ValueError("Este item já está no seu carrinho.")

        entrada = Carrinho(id_comprador=id_comprador, id_item=id_item)
        entrada.salvar()
        return entrada.to_dict()


class RemoverDoCarrinhoService:
    """Caso de uso: tirar um item do carrinho."""

    def executar(self, id_comprador, id_item):
        entrada = Carrinho.buscar(id_comprador, id_item)
        if entrada is None:
            return False
        entrada.deletar()
        return True


class ListarCarrinhoService:
    """Caso de uso: ver o carrinho do comprador, com subtotal por vendedor e total."""

    def executar(self, id_comprador):
        if Comprador.buscar_por_id(id_comprador) is None:
            raise ValueError("Comprador não encontrado.")

        itens = [_montar_linha(e) for e in Carrinho.listar_por_comprador(id_comprador)]

        por_vendedor = {}
        total = 0.0
        for linha in itens:
            if not linha["disponivel"]:
                continue
            total += linha["preco"]
            bloco = por_vendedor.setdefault(
                linha["id_livreiro"],
                {"id_livreiro": linha["id_livreiro"], "livreiro": linha["livreiro"], "quantidade": 0, "subtotal": 0.0},
            )
            bloco["quantidade"] += 1
            bloco["subtotal"] = round(bloco["subtotal"] + linha["preco"], 2)

        return {
            "itens": itens,
            "vendedores": list(por_vendedor.values()),
            "total": round(total, 2),
            "quantidade": sum(1 for l in itens if l["disponivel"]),
        }


class FinalizarCompraCarrinhoService:
    """Caso de uso: finaliza a compra de tudo que está no carrinho.
    Reaproveita o caso de uso de pedido (RegistrarPedidoService) para cada item."""

    def executar(self, id_comprador):
        if Comprador.buscar_por_id(id_comprador) is None:
            raise ValueError("Comprador não encontrado.")

        entradas = Carrinho.listar_por_comprador(id_comprador)
        if not entradas:
            raise ValueError("Seu carrinho está vazio.")

        registrar = RegistrarPedidoService()
        comprados, falhas, total = [], [], 0.0

        for entrada in entradas:
            id_item = entrada.id_item
            linha = _montar_linha(entrada)
            try:
                registrar.executar({"id_item": id_item, "id_comprador": id_comprador})
                comprados.append({"id_item": id_item, "nome": linha["nome"], "preco": linha["preco"]})
                total += linha["preco"]
            except ValueError as erro:
                falhas.append({"id_item": id_item, "nome": linha["nome"], "motivo": str(erro)})
                restante = Carrinho.buscar(id_comprador, id_item)
                if restante is not None:
                    restante.deletar()

        return {
            "mensagem": f"{len(comprados)} livro(s) comprado(s) com sucesso.",
            "comprados": comprados,
            "falhas": falhas,
            "total": round(total, 2),
        }
