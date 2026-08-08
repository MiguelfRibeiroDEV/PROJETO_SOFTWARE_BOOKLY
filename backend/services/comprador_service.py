from models.comprador_model import Comprador


class CriarCompradorService:
    def executar(self, dados):
        campos_obrigatorios = ["login", "senha", "usuario", "cpf", "email", "primeiro_nome"]

        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise ValueError(f"O campo '{campo}' é obrigatório.")

        comprador_com_email = Comprador.buscar_por_email(dados["email"])
        if comprador_com_email:
            raise ValueError("Já existe um comprador cadastrado com este e-mail.")

        comprador_com_cpf = Comprador.buscar_por_cpf(dados["cpf"])
        if comprador_com_cpf:
            raise ValueError("Já existe um comprador cadastrado com este CPF.")

        comprador = Comprador(
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

        comprador.salvar()
        return comprador.to_dict()


class ListarCompradoresService:
    def executar(self):
        compradores = Comprador.listar_todos()
        return [comprador.to_dict() for comprador in compradores]


class BuscarCompradorPorIdService:
    def executar(self, comprador_id):
        comprador = Comprador.buscar_por_id(comprador_id)

        if comprador is None:
            return None

        return comprador.to_dict()


class AtualizarCompradorService:
    def executar(self, comprador_id, dados):
        comprador = Comprador.buscar_por_id(comprador_id)

        if comprador is None:
            return None

        novo_email = dados.get("email")
        if novo_email:
            comprador_com_email = Comprador.buscar_por_email(novo_email)
            if comprador_com_email and comprador_com_email.id_comprador != comprador.id_comprador:
                raise ValueError("Já existe outro comprador cadastrado com este e-mail.")

        novo_cpf = dados.get("cpf")
        if novo_cpf:
            comprador_com_cpf = Comprador.buscar_por_cpf(novo_cpf)
            if comprador_com_cpf and comprador_com_cpf.id_comprador != comprador.id_comprador:
                raise ValueError("Já existe outro comprador cadastrado com este CPF.")

        comprador.atualizar(
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

        return comprador.to_dict()


class DeletarCompradorService:
    def executar(self, comprador_id):
        comprador = Comprador.buscar_por_id(comprador_id)

        if comprador is None:
            return False

        comprador.deletar()
        return True