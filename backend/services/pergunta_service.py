from datetime import datetime

from models.pergunta_model import Pergunta
from models.item_model import Item
from models.livro_model import Livro
from models.comprador_model import Comprador
from models.livreiro_model import Livreiro
from models.database import db

LIMITE_TEXTO = 500
MINIMO_TEXTO = 3


def _texto_valido(texto, rotulo):
    texto = str(texto or "").strip()
    if len(texto) < MINIMO_TEXTO:
        raise ValueError(f"Escreva {rotulo} (mínimo de {MINIMO_TEXTO} caracteres).")
    if len(texto) > LIMITE_TEXTO:
        raise ValueError(f"O texto pode ter no máximo {LIMITE_TEXTO} caracteres.")
    return texto


def _linha(pergunta):
    """Pergunta + dados do livro e do comprador, prontos para a tela."""
    item = Item.buscar_por_id(pergunta.id_item)
    livro = Livro.buscar_por_id(item.id_livro) if item else None
    comprador = Comprador.buscar_por_id(pergunta.id_comprador)
    dados = pergunta.to_dict()
    dados["livro_nome"] = livro.nome if livro else None
    dados["livro_autor"] = livro.autor if livro else None
    dados["comprador"] = comprador.primeiro_nome if comprador else "Comprador"
    return dados


class CriarPerguntaService:
    """Caso de uso: o comprador pergunta algo ao livreiro sobre um item."""

    def executar(self, id_item, dados):
        id_comprador = dados.get("id_comprador")
        if not id_comprador:
            raise ValueError("O campo 'id_comprador' é obrigatório.")

        texto = _texto_valido(dados.get("texto"), "a sua pergunta")

        if Item.buscar_por_id(id_item) is None:
            raise ValueError("Item informado não existe.")
        if Comprador.buscar_por_id(id_comprador) is None:
            raise ValueError("Comprador informado não existe.")

        pergunta = Pergunta(id_item=id_item, id_comprador=id_comprador, texto_pergunta=texto)
        pergunta.salvar()
        return _linha(pergunta)


class ListarPerguntasItemService:
    """Caso de uso: ver as perguntas (e respostas) feitas sobre um item."""

    def executar(self, id_item):
        if Item.buscar_por_id(id_item) is None:
            raise ValueError("Item informado não existe.")
        return [_linha(p) for p in Pergunta.listar_por_item(id_item)]


class ListarPerguntasLivreiroService:
    """Caso de uso: o livreiro vê as perguntas recebidas nos seus livros."""

    STATUS = ("pendentes", "respondidas", "todas")

    def executar(self, id_livreiro, status="pendentes"):
        if Livreiro.buscar_por_id(id_livreiro) is None:
            raise ValueError("Livreiro não encontrado.")
        if status not in self.STATUS:
            raise ValueError("Status inválido. Use: pendentes, respondidas ou todas.")

        base = (Pergunta.query
                .join(Item, Item.id_item == Pergunta.id_item)
                .join(Livro, Livro.id_livro == Item.id_livro)
                .filter(Livro.id_livreiro == id_livreiro))

        pendentes = base.filter(Pergunta.texto_resposta.is_(None)).count()
        respondidas = base.filter(Pergunta.texto_resposta.isnot(None)).count()

        consulta = base
        if status == "pendentes":
            consulta = base.filter(Pergunta.texto_resposta.is_(None))
        elif status == "respondidas":
            consulta = base.filter(Pergunta.texto_resposta.isnot(None))

        perguntas = consulta.order_by(Pergunta.id_pergunta.desc()).all()
        return {
            "perguntas": [_linha(p) for p in perguntas],
            "pendentes": pendentes,
            "respondidas": respondidas,
        }


class ResponderPerguntaService:
    """Caso de uso: o livreiro dono do livro responde a uma pergunta."""

    def executar(self, id_pergunta, dados):
        id_livreiro = dados.get("id_livreiro")
        if not id_livreiro:
            raise ValueError("O campo 'id_livreiro' é obrigatório.")

        pergunta = Pergunta.buscar_por_id(id_pergunta)
        if pergunta is None:
            return None

        item = Item.buscar_por_id(pergunta.id_item)
        livro = Livro.buscar_por_id(item.id_livro) if item else None
        if livro is None or int(livro.id_livreiro) != int(id_livreiro):
            raise ValueError("Você só pode responder perguntas sobre os seus livros.")

        if pergunta.texto_resposta:
            raise ValueError("Esta pergunta já foi respondida.")

        texto = _texto_valido(dados.get("texto_resposta"), "a sua resposta")
        pergunta.responder(texto, datetime.now())
        return _linha(pergunta)
