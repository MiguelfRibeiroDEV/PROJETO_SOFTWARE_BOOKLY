from models.livro_model import Livro
from models.livreiro_model import Livreiro
from models.categoria_model import Categoria


class CriarLivroService:
    def executar(self, dados):
        campos_obrigatorios = ["isbn", "nome", "autor", "id_livreiro", "id_categoria"]

        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise ValueError(f"O campo '{campo}' é obrigatório.")

        livro_existente = Livro.buscar_por_isbn(dados["isbn"])
        if livro_existente:
            raise ValueError("Já existe um livro cadastrado com este ISBN.")

        if not Livreiro.buscar_por_id(dados["id_livreiro"]):
            raise ValueError("Livreiro informado não existe.")

        if not Categoria.buscar_por_id(dados["id_categoria"]):
            raise ValueError("Categoria informada não existe.")

        livro = Livro(
            isbn=dados["isbn"],
            nome=dados["nome"],
            autor=dados["autor"],
            id_livreiro=dados["id_livreiro"],
            id_categoria=dados["id_categoria"],
            editora=dados.get("editora"),
            volume=dados.get("volume"),
            idioma=dados.get("idioma"),
            ano_publicacao=dados.get("ano_publicacao"),
            numero_paginas=dados.get("numero_paginas"),
            sinopse=dados.get("sinopse"),
        )

        livro.salvar()
        return livro.to_dict()


class ListarLivrosService:
    def executar(self):
        livros = Livro.listar_todos()
        return [livro.to_dict() for livro in livros]


class BuscarLivroPorIdService:
    def executar(self, livro_id):
        livro = Livro.buscar_por_id(livro_id)

        if livro is None:
            return None

        return livro.to_dict()


class AtualizarLivroService:
    def executar(self, livro_id, dados):
        livro = Livro.buscar_por_id(livro_id)

        if livro is None:
            return None

        novo_isbn = dados.get("isbn")
        if novo_isbn:
            livro_com_isbn = Livro.buscar_por_isbn(novo_isbn)
            if livro_com_isbn and livro_com_isbn.id_livro != livro.id_livro:
                raise ValueError("Já existe outro livro cadastrado com este ISBN.")

        novo_livreiro_id = dados.get("id_livreiro")
        if novo_livreiro_id and not Livreiro.buscar_por_id(novo_livreiro_id):
            raise ValueError("Livreiro informado não existe.")

        nova_categoria_id = dados.get("id_categoria")
        if nova_categoria_id and not Categoria.buscar_por_id(nova_categoria_id):
            raise ValueError("Categoria informada não existe.")

        livro.atualizar(
            isbn=dados.get("isbn"),
            nome=dados.get("nome"),
            autor=dados.get("autor"),
            editora=dados.get("editora"),
            volume=dados.get("volume"),
            idioma=dados.get("idioma"),
            ano_publicacao=dados.get("ano_publicacao"),
            numero_paginas=dados.get("numero_paginas"),
            sinopse=dados.get("sinopse"),
            id_livreiro=dados.get("id_livreiro"),
            id_categoria=dados.get("id_categoria"),
        )

        return livro.to_dict()


class DeletarLivroService:
    def executar(self, livro_id):
        livro = Livro.buscar_por_id(livro_id)

        if livro is None:
            return False

        livro.deletar()
        return True