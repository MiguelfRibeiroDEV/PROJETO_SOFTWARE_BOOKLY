from .database import db



class Livro(db.Model):
    __tablename__ = "livro"

    id_livro = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(20), nullable=False, unique=True)
    nome = db.Column(db.String(200), nullable=False)
    autor = db.Column(db.String(150), nullable=False)
    editora = db.Column(db.String(150))
    volume = db.Column(db.String(20))
    idioma = db.Column(db.String(50))
    ano_publicacao = db.Column(db.Integer)
    numero_paginas = db.Column(db.Integer)
    sinopse = db.Column(db.Text)

    # FKs: LIVREIRO (1) --- TEM --- (N) LIVRO | CATEGORIA (1) --- TEM --- (N) LIVRO
    id_livreiro = db.Column(db.Integer, db.ForeignKey("livreiro.id_livreiro"), nullable=False)
    id_categoria = db.Column(db.Integer, db.ForeignKey("categoria.id_categoria"), nullable=False)

    categoria = db.relationship("Categoria", backref="livros", lazy=True)
    # 1 LIVRO -> N ITEM
    itens = db.relationship("Item", backref="livro", lazy=True)

    def salvar(self):
        """CREATE: salva um novo livro no banco."""
        db.session.add(self)
        db.session.commit()


    def atualizar(self, **dados):
        """UPDATE: altera apenas os campos informados."""
        campos_permitidos = {
            "isbn", "nome", "autor", "editora", "volume", "idioma",
            "ano_publicacao", "numero_paginas", "sinopse",
            "id_livreiro", "id_categoria",
        }
        for campo, valor in dados.items():
            if campo in campos_permitidos and valor is not None:
                setattr(self, campo, valor)
        db.session.commit()
        return self
    
    def deletar(self):
        """DELETE: remove o livro do banco."""
        db.session.delete(self)
        db.session.commit()


    @staticmethod
    def listar_todos():
        return Livro.query.order_by(Livro.id_livro.asc()).all()

    @staticmethod
    def buscar_por_isbn(isbn):
        return Livro.query.filter_by(isbn=isbn).first()
    

    @staticmethod
    def buscar_por_id(id_livro):
        """READ: busca um livro pelo id."""
        return Livro.query.get(id_livro) 

    def to_dict(self):
        return {
            "id_livro": self.id_livro,
            "isbn": self.isbn,
            "nome": self.nome,
            "autor": self.autor,
            "editora": self.editora,
            "volume": self.volume,
            "idioma": self.idioma,
            "ano_publicacao": self.ano_publicacao,
            "numero_paginas": self.numero_paginas,
            "sinopse": self.sinopse,
            "id_livreiro": self.id_livreiro,
            "id_categoria": self.id_categoria,
        }