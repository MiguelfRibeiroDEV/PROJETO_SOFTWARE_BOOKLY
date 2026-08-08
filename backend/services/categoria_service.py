from models.categoria_model import Categoria


class CriarCategoriaService:
    def executar(self, dados):
        if not dados.get("nome"):
            raise ValueError("O campo 'nome' é obrigatório.")

        categoria = Categoria(
            nome=dados["nome"],
            descricao=dados.get("descricao"),
            codigo_index=dados.get("codigo_index"),
        )

        categoria.salvar()
        return categoria.to_dict()


class ListarCategoriasService:
    def executar(self):
        categorias = Categoria.listar_todos()
        return [categoria.to_dict() for categoria in categorias]


class BuscarCategoriaPorIdService:
    def executar(self, categoria_id):
        categoria = Categoria.buscar_por_id(categoria_id)

        if categoria is None:
            return None

        return categoria.to_dict()


class AtualizarCategoriaService:
    def executar(self, categoria_id, dados):
        categoria = Categoria.buscar_por_id(categoria_id)

        if categoria is None:
            return None

        categoria.atualizar(
            nome=dados.get("nome"),
            descricao=dados.get("descricao"),
            codigo_index=dados.get("codigo_index"),
        )

        return categoria.to_dict()


class DeletarCategoriaService:
    def executar(self, categoria_id):
        categoria = Categoria.buscar_por_id(categoria_id)

        if categoria is None:
            return False

        categoria.deletar()
        return True