from .database import db



class Item(db.Model):
    __tablename__ = "item"

    id_item = db.Column(db.Integer, primary_key=True)
    preco = db.Column(db.Numeric(10, 2), nullable=False)
    edicao = db.Column(db.String(50))
    descricao = db.Column(db.Text)
    ano_aquisicao = db.Column(db.Integer)
    conservacao = db.Column(db.String(50))
    dedicatorio = db.Column(db.Boolean, default=False)
    raridade = db.Column(db.String(50))
    tipo_capa = db.Column(db.String(50))
    presenca_de_grifos = db.Column(db.Boolean, default=False)
    fotos_item = db.Column(db.Text)  # URLs separadas por vírgula

    # FKs: LIVRO (1) --- TEM --- (N) ITEM | COMPRADOR (1) --- COMPRA --- (N) ITEM
    id_livro = db.Column(db.Integer, db.ForeignKey("livro.id_livro"), nullable=False)
    id_comprador = db.Column(db.Integer, db.ForeignKey("comprador.id_comprador"), nullable=True)

    comprador = db.relationship("Comprador", backref="itens_comprados", lazy=True)
    # 1 ITEM -> N ESTIMATIVA
    estimativas = db.relationship("Estimativa", backref="item", lazy=True)


    def salvar(self):
        """CREATE: salva um novo item no banco."""
        db.session.add(self)
        db.session.commit()


    def atualizar(self, **dados):
        """UPDATE: altera apenas os campos informados."""
        campos_permitidos = {
            "preco", "edicao", "descricao", "ano_aquisicao", "conservacao",
            "dedicatorio", "raridade", "tipo_capa", "presenca_de_grifos",
            "fotos_item", "id_livro", "id_comprador",
        }
        for campo, valor in dados.items():
            if campo in campos_permitidos and valor is not None:
                setattr(self, campo, valor)
        db.session.commit()
        return self
    

    def deletar(self):
        """DELETE: remove o item do banco."""
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return Item.query.order_by(Item.id_item.asc()).all()
    

    @staticmethod
    def buscar_por_id(id_item):
        """READ: busca um livreiro pelo id."""
        return Item.query.get(id_item)

    @staticmethod
    def listar_disponiveis():
        """Itens ainda não vendidos (sem comprador associado)."""
        return Item.query.filter_by(id_comprador=None).order_by(Item.id_item.asc()).all()

    def to_dict(self):
        return {
            "id_item": self.id_item,
            "preco": float(self.preco) if self.preco is not None else None,
            "edicao": self.edicao,
            "descricao": self.descricao,
            "ano_aquisicao": self.ano_aquisicao,
            "conservacao": self.conservacao,
            "dedicatorio": self.dedicatorio,
            "raridade": self.raridade,
            "tipo_capa": self.tipo_capa,
            "presenca_de_grifos": self.presenca_de_grifos,
            "fotos_item": self.fotos_item,
            "id_livro": self.id_livro,
            "id_comprador": self.id_comprador,
        }