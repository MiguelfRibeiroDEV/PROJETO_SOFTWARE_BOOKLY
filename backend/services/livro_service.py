from models.livro_model import Livro
from models.livreiro_model import Livreiro
from models.categoria_model import Categoria
from models.database import db


class CriarLivroService:
    def executar(self, dados):
        campos_obrigatorios = ["nome", "autor", "id_livreiro", "id_categoria"]

        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise ValueError(f"O campo '{campo}' é obrigatório.")

        # ISBN é opcional (o banco permite NULL). Normaliza string vazia
        # para None, para não violar a constraint UNIQUE com vários
        # livros "sem ISBN" cadastrados como "".
        isbn_informado = (dados.get("isbn") or "").strip() or None

        if isbn_informado:
            livro_existente = Livro.buscar_por_isbn(isbn_informado)
            if livro_existente:
                raise ValueError("Já existe um livro cadastrado com este ISBN.")

        if not Livreiro.buscar_por_id(dados["id_livreiro"]):
            raise ValueError("Livreiro informado não existe.")

        if not Categoria.buscar_por_id(dados["id_categoria"]):
            raise ValueError("Categoria informada não existe.")

        livro = Livro(
            isbn=isbn_informado,
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

        livreiro = Livreiro.buscar_por_id(dados["id_livreiro"])
        if livreiro:
            livreiro.livros_registrados = len(livreiro.livros)
            db.session.commit()

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


class ConsultarIsbnService:
    """Consulta dados cadastrais de livros por ISBN (BrasilAPI + Open Library com fallback robusto)."""

    def executar(self, isbn_raw):
        import re
        import json
        import urllib.request

        limpo = re.sub(r"[^0-9X]", "", str(isbn_raw or "").upper())
        if len(limpo) not in (10, 13):
            raise ValueError("O ISBN deve conter 10 ou 13 dígitos numéricos.")

        resultado = {
            "isbn": limpo,
            "titulo": "",
            "autores": "",
            "editora": "",
            "ano_publicacao": None,
            "numero_paginas": None,
            "sinopse": "",
            "idioma": "Português (BR)",
            "foto_capa": "",
        }

        # 1. Tenta primeiro BrasilAPI (focada em títulos e editoras em português)
        try:
            url = f"https://brasilapi.com.br/api/isbn/v1/{limpo}"
            req = urllib.request.Request(url, headers={"User-Agent": "Bookly/1.0 (Mozilla/5.0)"})
            with urllib.request.urlopen(req, timeout=4) as res:
                d = json.loads(res.read().decode("utf-8"))
                if d.get("title"):
                    resultado["titulo"] = str(d.get("title")).title()
                    resultado["autores"] = ", ".join(d.get("authors") or [])
                    resultado["editora"] = d.get("publisher") or ""
                    resultado["ano_publicacao"] = d.get("year")
                    resultado["numero_paginas"] = d.get("page_count")
                    resultado["sinopse"] = d.get("synopsis") or ""
        except Exception:
            pass

        # 2. Open Library (catálogo mundial com capas em alta qualidade, sem taxa de bloqueio)
        try:
            url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{limpo}&format=json&jscmd=data"
            req = urllib.request.Request(url, headers={"User-Agent": "Bookly/1.0 (Mozilla/5.0)"})
            with urllib.request.urlopen(req, timeout=4) as res:
                d = json.loads(res.read().decode("utf-8"))
                chave = f"ISBN:{limpo}"
                if chave in d:
                    info = d[chave]
                    if not resultado["titulo"] and info.get("title"):
                        resultado["titulo"] = info.get("title")
                    if not resultado["autores"] and info.get("authors"):
                        resultado["autores"] = ", ".join(a.get("name") for a in info.get("authors") if a.get("name"))
                    if not resultado["editora"] and info.get("publishers"):
                        resultado["editora"] = ", ".join(p.get("name") for p in info.get("publishers") if p.get("name"))
                    if not resultado["numero_paginas"] and info.get("number_of_pages"):
                        resultado["numero_paginas"] = info.get("number_of_pages")
                    if not resultado["ano_publicacao"] and info.get("publish_date"):
                        ano_match = re.search(r"\b(19\d\d|20\d\d)\b", str(info.get("publish_date")))
                        if ano_match:
                            resultado["ano_publicacao"] = int(ano_match.group(1))
                    if not resultado["foto_capa"] and info.get("cover") and info["cover"].get("medium"):
                        resultado["foto_capa"] = info["cover"]["medium"]
        except Exception:
            pass

        # 3. Se ainda faltar capa, tenta montar pela Open Library pelo ISBN
        if not resultado["foto_capa"] and resultado["titulo"]:
            resultado["foto_capa"] = f"https://covers.openlibrary.org/b/isbn/{limpo}-M.jpg"

        if not resultado["titulo"]:
            raise ValueError(f"Não encontramos dados automáticos para o ISBN {limpo}. Preencha os campos manualmente.")

        return resultado


class BuscarSugestoesLivroService:
    """Busca sugestões de livros para autocomplete em tempo real (Banco Local + Open Library)."""

    def executar(self, termo: str):
        import re
        import json
        import urllib.request
        import urllib.parse

        termo_limpo = str(termo or "").strip()
        if len(termo_limpo) < 2:
            return []

        sugestoes = []
        titulos_vistos = set()

        # 1. Busca primeiro no banco de dados local (livros já existentes no catálogo Bookly)
        try:
            livros_locais = Livro.query.filter(Livro.nome.ilike(f"%{termo_limpo}%")).limit(4).all()
            for l in livros_locais:
                nome_norm = l.nome.strip().lower()
                if nome_norm not in titulos_vistos:
                    titulos_vistos.add(nome_norm)
                    sugestoes.append({
                        "titulo": l.nome,
                        "autores": l.autor or "",
                        "editora": l.editora or "",
                        "ano_publicacao": l.ano_publicacao,
                        "numero_paginas": l.numero_paginas,
                        "isbn": l.isbn or "",
                        "sinopse": l.sinopse or "",
                        "foto_capa": l.foto or (f"https://covers.openlibrary.org/b/isbn/{l.isbn}-M.jpg" if l.isbn else ""),
                        "origem": "catalogo_bookly"
                    })
        except Exception:
            pass

        # 2. Busca na Open Library Search API
        try:
            url = f"https://openlibrary.org/search.json?q={urllib.parse.quote(termo_limpo)}&limit=6"
            req = urllib.request.Request(url, headers={"User-Agent": "Bookly/1.0 (Mozilla/5.0)"})
            with urllib.request.urlopen(req, timeout=3.5) as res:
                data = json.loads(res.read().decode("utf-8"))
                for doc in data.get("docs", []):
                    title = doc.get("title")
                    if not title:
                        continue
                    nome_norm = title.strip().lower()
                    if nome_norm in titulos_vistos:
                        continue
                    titulos_vistos.add(nome_norm)

                    autores = ", ".join(doc.get("author_name") or [])
                    editora = (doc.get("publisher") or [""])[0]
                    ano = doc.get("first_publish_year")
                    isbns = doc.get("isbn") or []
                    primeiro_isbn = isbns[0] if isbns else ""
                    cover_id = doc.get("cover_i")
                    foto_capa = f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg" if cover_id else ""
                    if not foto_capa and primeiro_isbn:
                        foto_capa = f"https://covers.openlibrary.org/b/isbn/{primeiro_isbn}-M.jpg"

                    sugestoes.append({
                        "titulo": title,
                        "autores": autores,
                        "editora": editora,
                        "ano_publicacao": ano,
                        "numero_paginas": doc.get("number_of_pages_median"),
                        "isbn": primeiro_isbn,
                        "sinopse": "",
                        "foto_capa": foto_capa,
                        "origem": "open_library"
                    })

                    if len(sugestoes) >= 6:
                        break
        except Exception:
            pass

        return sugestoes
