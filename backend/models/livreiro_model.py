from .database import db
 
 
class Livreiro(db.Model):
    __tablename__ = "livreiro"
 
    id_livreiro = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(50), nullable=False, unique=True)
    senha = db.Column(db.String(255), nullable=False)
    usuario = db.Column(db.String(50), nullable=False, unique=True)
    cpf = db.Column(db.String(11), nullable=False, unique=True)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(150), nullable=False, unique=True)
    primeiro_nome = db.Column(db.String(100), nullable=False)
    segundo_nome = db.Column(db.String(100))
    data_nascimento = db.Column(db.Date)
    data_cadastro = db.Column(db.DateTime, server_default=db.func.now())
    livros_registrados = db.Column(db.Integer, default=0)
    livros_vendidos = db.Column(db.Integer, default=0)
    total_faturado = db.Column(db.Numeric(12, 2), default=0)
 
    # atributo composto "endereco" -> colunas prefixadas
    endereco_rua = db.Column(db.String(150))
    endereco_numero = db.Column(db.String(10))
    endereco_complemento = db.Column(db.String(100))
    endereco_bairro = db.Column(db.String(100))
    endereco_cidade = db.Column(db.String(100))
    endereco_estado = db.Column(db.String(2))
    endereco_cep = db.Column(db.String(9))
 
    # 1 LIVREIRO -> N LIVRO
    livros = db.relationship("Livro", backref="livreiro", lazy=True)
 

    def salvar(self):
        """CREATE: salva um novo livreiro no banco."""
        db.session.add(self)
        db.session.commit()


    def atualizar(self, **dados):
        """UPDATE: altera apenas os campos informados."""
        campos_permitidos = {
            "login", "senha", "usuario", "cpf", "telefone", "email",
            "primeiro_nome", "segundo_nome", "data_nascimento",
            "livros_registrados", "livros_vendidos", "total_faturado",
            "endereco_rua", "endereco_numero", "endereco_complemento",
            "endereco_bairro", "endereco_cidade", "endereco_estado", "endereco_cep",
        }   
        for campo, valor in dados.items():
            if campo in campos_permitidos and valor is not None:
                setattr(self, campo, valor)
        db.session.commit()
        return self
 

    def deletar(self):
        """DELETE: remove o livreiro do banco."""
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return Livreiro.query.order_by(Livreiro.id_livreiro.asc()).all()

    @staticmethod
    def buscar_por_id(id_livreiro):
        """READ: busca um livreiro pelo id."""
        return Livreiro.query.get(id_livreiro)

    @staticmethod
    def buscar_por_email(email):
        """READ auxiliar: busca um livreiro pelo e-mail."""
        return Livreiro.query.filter_by(email=email).first()
    

    @  staticmethod
    def buscar_por_cpf(cpf):
        """READ auxiliar: busca um livreiro pelo CPF."""
        return Livreiro.query.filter_by(cpf=cpf).first()

 
    def to_dict(self):
        """Converte o objeto Livreiro para dicionário/JSON """
        return {
            "id_livreiro": self.id_livreiro,
            "login": self.login,
            "usuario": self.usuario,
            "senha": self.senha,
            "cpf": self.cpf,
            "telefone": self.telefone,
            "email": self.email,
            "primeiro_nome": self.primeiro_nome,
            "segundo_nome": self.segundo_nome,
            "data_nascimento": self.data_nascimento.isoformat() if self.data_nascimento else None,
            "data_cadastro": self.data_cadastro.isoformat() if self.data_cadastro else None,
            "livros_registrados": self.livros_registrados,
            "livros_vendidos": self.livros_vendidos,
            "total_faturado": float(self.total_faturado) if self.total_faturado is not None else None,
            "endereco_rua": self.endereco_rua,
            "endereco_numero": self.endereco_numero,
            "endereco_complemento": self.endereco_complemento,
            "endereco_bairro": self.endereco_bairro,
            "endereco_cidade": self.endereco_cidade,
            "endereco_estado": self.endereco_estado,
            "endereco_cep": self.endereco_cep,
        }
 