from models.livreiro_model import Livreiro

class CriarLivreiroService:
    def executar(self, dados):
        campos_obrigatorios = ["login", "senha", "usuario", "cpf", "email", "primeiro_nome"]

        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise ValueError(f"O campo '{campo}' é obrigatório.")

        livreiro_com_email = Livreiro.buscar_por_email(dados["email"])
        if livreiro_com_email:
            raise ValueError("Já existe um livreiro cadastrado com este e-mail.")

        livreiro_com_cpf = Livreiro.buscar_por_cpf(dados["cpf"])
        if livreiro_com_cpf:
            raise ValueError("Já existe um livreiro cadastrado com este CPF.")

        livreiro = Livreiro(
            login=dados["login"],
            senha=dados["senha"],
            usuario=dados["usuario"],
            cpf=dados["cpf"],
            email=dados["email"],
            primeiro_nome=dados["primeiro_nome"],
            segundo_nome=dados.get("segundo_nome"),
            telefone=dados.get("telefone"),
            data_nascimento=dados.get("data_nascimento"),
            endereco_rua=dados.get("endereco_rua"),
            endereco_numero=dados.get("endereco_numero"),
            endereco_complemento=dados.get("endereco_complemento"),
            endereco_bairro=dados.get("endereco_bairro"),
            endereco_cidade=dados.get("endereco_cidade"),
            endereco_estado=dados.get("endereco_estado"),
            endereco_cep=dados.get("endereco_cep"),
        )

        livreiro.salvar()
        return livreiro.to_dict()


class ListarLivreirosService:
    def executar(self):
        livreiros = Livreiro.listar_todos()
        return [livreiro.to_dict() for livreiro in livreiros]


class BuscarLivreiroPorIdService:
    def executar(self, livreiro_id):
        livreiro = Livreiro.buscar_por_id(livreiro_id)

        if livreiro is None:
            return None

        return livreiro.to_dict()


class AtualizarLivreiroService:
    def executar(self, livreiro_id, dados):
        livreiro = Livreiro.buscar_por_id(livreiro_id)

        if livreiro is None:
            return None

        novo_email = dados.get("email")
        if novo_email:
            livreiro_com_email = Livreiro.buscar_por_email(novo_email)
            if livreiro_com_email and livreiro_com_email.id_livreiro != livreiro.id_livreiro:
                raise ValueError("Já existe outro livreiro cadastrado com este e-mail.")

        novo_cpf = dados.get("cpf")
        if novo_cpf:
            livreiro_com_cpf = Livreiro.buscar_por_cpf(novo_cpf)
            if livreiro_com_cpf and livreiro_com_cpf.id_livreiro != livreiro.id_livreiro:
                raise ValueError("Já existe outro livreiro cadastrado com este CPF.")

        livreiro.atualizar(
            login=dados.get("login"),
            senha=dados.get("senha"),
            usuario=dados.get("usuario"),
            cpf=dados.get("cpf"),
            email=dados.get("email"),
            primeiro_nome=dados.get("primeiro_nome"),
            segundo_nome=dados.get("segundo_nome"),
            telefone=dados.get("telefone"),
            data_nascimento=dados.get("data_nascimento"),
            endereco_rua=dados.get("endereco_rua"),
            endereco_numero=dados.get("endereco_numero"),
            endereco_complemento=dados.get("endereco_complemento"),
            endereco_bairro=dados.get("endereco_bairro"),
            endereco_cidade=dados.get("endereco_cidade"),
            endereco_estado=dados.get("endereco_estado"),
            endereco_cep=dados.get("endereco_cep"),
        )

        return livreiro.to_dict()


class DeletarLivreiroService:
    def executar(self, livreiro_id):
        livreiro = Livreiro.buscar_por_id(livreiro_id)

        if livreiro is None:
            return False

        livreiro.deletar()
        return True