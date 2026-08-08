from datetime import datetime

from .database import db



class Estimativa(db.Model):
    __tablename__ = "estimativa"

    id_estimativa = db.Column(db.Integer, primary_key=True)
    date_time = db.Column(db.DateTime, default=datetime.utcnow)
    preco_estimado = db.Column(db.Numeric(10, 2))
    possivel_descricao = db.Column(db.Text)

    # FK: ITEM (1) --- TEM --- (N) ESTIMATIVA
    id_item = db.Column(db.Integer, db.ForeignKey("item.id_item"), nullable=False)

    def salvar(self):
        """CREATE: salva uma nova estimativa no banco."""
        db.session.add(self)
        db.session.commit()


    def atualizar(self, **dados):
        """UPDATE: altera apenas os campos informados."""
        campos_permitidos = {"preco_estimado", "possivel_descricao", "id_item"}
        for campo, valor in dados.items():
            if campo in campos_permitidos and valor is not None:
                setattr(self, campo, valor)
        db.session.commit()
        return self
    
    def deletar(self):
        """DELETE: remove a estimativa do banco."""
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def buscar_por_id(id_estimativa):
        """READ: busca um livreiro pelo id."""
        return Estimativa.query.get(id_estimativa)

    @staticmethod
    def listar_todos():
        return Estimativa.query.order_by(Estimativa.id_estimativa.asc()).all()

    @staticmethod
    def listar_por_item(id_item):
        return Estimativa.query.filter_by(id_item=id_item).order_by(Estimativa.date_time.desc()).all()

    def to_dict(self):
        return {
            "id_estimativa": self.id_estimativa,
            "date_time": self.date_time.isoformat() if self.date_time else None,
            "preco_estimado": float(self.preco_estimado) if self.preco_estimado is not None else None,
            "possivel_descricao": self.possivel_descricao,
            "id_item": self.id_item,
        }