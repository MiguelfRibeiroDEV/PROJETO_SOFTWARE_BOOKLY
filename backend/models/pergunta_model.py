from .database import db


class Pergunta(db.Model):
    """Pergunta de um comprador sobre um item; o livreiro dono responde depois."""
    __tablename__ = "pergunta"

    id_pergunta = db.Column(db.Integer, primary_key=True)
    id_item = db.Column(db.Integer, db.ForeignKey("item.id_item"), nullable=False)
    id_comprador = db.Column(db.Integer, db.ForeignKey("comprador.id_comprador"), nullable=False)
    texto_pergunta = db.Column(db.String(500), nullable=False)
    data_pergunta = db.Column(db.DateTime, server_default=db.func.now())
    texto_resposta = db.Column(db.String(500))
    data_resposta = db.Column(db.DateTime)

    def salvar(self):
        """CREATE: registra uma nova pergunta."""
        db.session.add(self)
        db.session.commit()

    def responder(self, texto, data):
        """UPDATE: registra a resposta do livreiro."""
        self.texto_resposta = texto
        self.data_resposta = data
        db.session.commit()
        return self

    @staticmethod
    def buscar_por_id(id_pergunta):
        return Pergunta.query.get(id_pergunta)

    @staticmethod
    def listar_por_item(id_item):
        return (Pergunta.query.filter_by(id_item=id_item)
                .order_by(Pergunta.id_pergunta.desc()).all())

    def to_dict(self):
        return {
            "id_pergunta": self.id_pergunta,
            "id_item": self.id_item,
            "id_comprador": self.id_comprador,
            "texto_pergunta": self.texto_pergunta,
            "data_pergunta": self.data_pergunta.isoformat() if self.data_pergunta else None,
            "texto_resposta": self.texto_resposta,
            "data_resposta": self.data_resposta.isoformat() if self.data_resposta else None,
        }
