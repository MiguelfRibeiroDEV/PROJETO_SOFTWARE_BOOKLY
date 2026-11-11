from .database import db


class Carrinho(db.Model):
    """Item que um comprador separou para comprar depois (carrinho de compras)."""
    __tablename__ = "carrinho"

    id_carrinho = db.Column(db.Integer, primary_key=True)
    id_comprador = db.Column(db.Integer, db.ForeignKey("comprador.id_comprador"), nullable=False)
    id_item = db.Column(db.Integer, db.ForeignKey("item.id_item"), nullable=False)
    data_adicao = db.Column(db.DateTime, server_default=db.func.now())

    __table_args__ = (
        db.UniqueConstraint("id_comprador", "id_item", name="uq_carrinho_comprador_item"),
    )

    def salvar(self):
        """CREATE: coloca o item no carrinho."""
        db.session.add(self)
        db.session.commit()

    def deletar(self):
        """DELETE: tira o item do carrinho."""
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def buscar(id_comprador, id_item):
        return Carrinho.query.filter_by(id_comprador=id_comprador, id_item=id_item).first()

    @staticmethod
    def listar_por_comprador(id_comprador):
        return (Carrinho.query.filter_by(id_comprador=id_comprador)
                .order_by(Carrinho.id_carrinho.asc()).all())

    @staticmethod
    def remover_por_item(id_item):
        """Tira o item do carrinho de TODOS os compradores (usado quando ele é vendido)."""
        Carrinho.query.filter_by(id_item=id_item).delete()
        db.session.commit()

    def to_dict(self):
        return {
            "id_carrinho": self.id_carrinho,
            "id_comprador": self.id_comprador,
            "id_item": self.id_item,
            "data_adicao": self.data_adicao.isoformat() if self.data_adicao else None,
        }
