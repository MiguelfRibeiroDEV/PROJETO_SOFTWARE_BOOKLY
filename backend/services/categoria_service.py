from models.categoria_model import Categoria


class CriarCategoriaService:
    def executar(self, dados):
        # --- TRATAMENTO DOS DADOS ---
        
        # 1. Trata o campo 'nome'
        nome_bruto = dados.get("nome")
        nome_limpo = nome_bruto.strip() if nome_bruto else ""

        if not nome_limpo:
            raise ValueError("O campo 'nome' é obrigatório.")

        # 2. Trata 'descricao' (remove espaços sobrando)
        descricao_bruta = dados.get("descricao")
        descricao_limpa = descricao_bruta.strip() if descricao_bruta else None

        # 3. Trata 'codigo_index' (garante formato numérico/limpo se enviado)
        codigo_index_raw = dados.get("codigo_index")
        codigo_index_limpo = None
        
        if codigo_index_raw is not None and str(codigo_index_raw).strip() != "":
            try:
                codigo_index_limpo = int(str(codigo_index_raw).strip())
            except ValueError:
                raise ValueError("O campo 'codigo_index' deve ser um número válido.")

        # --- INSTÂNCIA DO MODELO COM DADOS TRATADOS ---
        categoria = Categoria(
            nome=nome_limpo,
            descricao=descricao_limpa,
            codigo_index=codigo_index_limpo,
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

        # --- TRATAMENTO DOS DADOS NA ATUALIZAÇÃO ---
        
        nome_bruto = dados.get("nome")
        nome_limpo = nome_bruto.strip() if nome_bruto is not None else categoria.nome

        if nome_limpo == "":
            raise ValueError("O campo 'nome' não pode ser vazio.")

        descricao_bruta = dados.get("descricao")
        descricao_limpa = (
            descricao_bruta.strip() if descricao_bruta is not None else categoria.descricao
        )

        codigo_index_raw = dados.get("codigo_index")
        codigo_index_limpo = categoria.codigo_index

        if codigo_index_raw is not None and str(codigo_index_raw).strip() != "":
            try:
                codigo_index_limpo = int(str(codigo_index_raw).strip())
            except ValueError:
                raise ValueError("O campo 'codigo_index' deve ser um número válido.")

        # --- ATUALIZAÇÃO NO BANCO ---
        categoria.atualizar(
            nome=nome_limpo,
            descricao=descricao_limpa,
            codigo_index=codigo_index_limpo,
        )

        return categoria.to_dict()


class DeletarCategoriaService:
    def executar(self, categoria_id):
        categoria = Categoria.buscar_por_id(categoria_id)

        if categoria is None:
            return False

        categoria.deletar()
        return True