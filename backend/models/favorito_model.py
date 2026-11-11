from datetime import datetime

from .database import db


class Favorito(db.Model):
    """Anúncio (item) marcado como favorito por um comprador."""
    __tablename__ = "favorito"
    __table_args__ = (
        db.UniqueConstraint("id_comprador", "id_item", name="uq_favorito_comprador_item"),
    )

    id_favorito = db.Column(db.Integer, primary_key=True)
    id_comprador = db.Column(db.Integer, db.ForeignKey("comprador.id_comprador"), nullable=False)
    id_item = db.Column(db.Integer, db.ForeignKey("item.id_item"), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.now)

    def salvar(self):
        """CREATE: salva um novo favorito."""
        db.session.add(self)
        db.session.commit()

    def deletar(self):
        """DELETE: remove o favorito."""
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def buscar(id_comprador, id_item):
        """READ: busca o favorito de um comprador para um item."""
        return Favorito.query.filter_by(id_comprador=id_comprador, id_item=id_item).first()

    @staticmethod
    def listar_por_comprador(id_comprador):
        return (Favorito.query.filter_by(id_comprador=id_comprador)
                .order_by(Favorito.id_favorito.desc()).all())

    def to_dict(self):
        return {
            "id_favorito": self.id_favorito,
            "id_comprador": self.id_comprador,
            "id_item": self.id_item,
            "data_criacao": self.data_criacao.isoformat() if self.data_criacao else None,
        }
