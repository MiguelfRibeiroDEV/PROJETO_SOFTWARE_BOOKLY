from .database import db



class Categoria(db.Model):
    __tablename__ = "categoria"

    id_categoria = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text)
    codigo_index = db.Column(db.String(20), unique=True)


    def salvar(self):
        """CREATE: salva uma nova categoria no banco."""
        db.session.add(self)
        db.session.commit()


    def atualizar(self, **dados):
        """UPDATE: altera apenas os campos informados."""
        campos_permitidos = {"nome", "descricao", "codigo_index"}
        for campo, valor in dados.items():
            if campo in campos_permitidos and valor is not None:
                setattr(self, campo, valor)
        db.session.commit()
        return self
      

    def deletar(self):
        """DELETE: remove a categoria do banco."""
        db.session.delete(self)
        db.session.commit()


    @staticmethod
    def listar_todos():
        return Categoria.query.order_by(Categoria.id_categoria.asc()).all()


    @staticmethod
    def buscar_por_nome(nome):
        return Categoria.query.filter_by(nome=nome).first()
    

    @staticmethod
    def buscar_por_id(id_categoria):
        """READ: busca um comprador pelo id."""
        return Categoria.query.get(id_categoria)



    def to_dict(self):
        return {
            "id_categoria": self.id_categoria,
            "nome": self.nome,
            "descricao": self.descricao,
            "codigo_index": self.codigo_index,
        }