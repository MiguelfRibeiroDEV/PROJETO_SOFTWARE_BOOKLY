import re
from models.livreiro_model import Livreiro
from utils.validadores import (
    validar_cpf, tratar_cpf, tratar_email, tratar_telefone, tratar_cep, tratar_estado,
    tratar_usuario, tratar_nome, tratar_texto_simples
)

class CriarLivreiroService:
    def executar(self, dados):
        campos_obrigatorios = ["login", "senha", "usuario", "cpf", "email", "primeiro_nome"]

        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise ValueError(f"O campo '{campo}' é obrigatório.")

        cpf_limpo = tratar_cpf(dados.get("cpf"))

        email_limpo = tratar_email(dados["email"])
        telefone_formatado = tratar_telefone(dados.get("telefone"))
        cep_formatado = tratar_cep(dados.get("endereco_cep") or dados.get("cep"))
        primeiro_nome = tratar_nome(dados["primeiro_nome"], "Primeiro nome")
        segundo_nome = tratar_nome(dados.get("segundo_nome"), "Sobrenome")
        usuario_limpo = tratar_usuario(dados["usuario"])
        login_limpo = str(dados["login"]).strip()
        if not login_limpo or len(login_limpo) < 3:
            raise ValueError("O login deve ter pelo menos 3 caracteres.")

        cidade_bruta = str(dados.get("endereco_cidade") or dados.get("cidade") or "").split("/")[0]

        if Livreiro.buscar_por_email(email_limpo):
            raise ValueError("Já existe um livreiro cadastrado com este e-mail.")

        if Livreiro.buscar_por_cpf(cpf_limpo):
            raise ValueError("Já existe um livreiro cadastrado com este CPF.")

        if Livreiro.buscar_por_login(login_limpo):
            raise ValueError("Já existe um livreiro cadastrado com este login.")

        if Livreiro.buscar_por_usuario(usuario_limpo):
            raise ValueError("Já existe um livreiro cadastrado com este nome de usuário.")

        livreiro = Livreiro(
            login=login_limpo,
            senha=dados["senha"],
            usuario=usuario_limpo,
            cpf=cpf_limpo,
            email=email_limpo,
            primeiro_nome=primeiro_nome,
            segundo_nome=segundo_nome,
            telefone=telefone_formatado,
            data_nascimento=dados.get("data_nascimento") or None,
            endereco_rua=tratar_texto_simples(dados.get("endereco_rua") or dados.get("rua"), 150),
            endereco_numero=tratar_texto_simples(dados.get("endereco_numero") or dados.get("numero"), 10),
            endereco_complemento=tratar_texto_simples(dados.get("endereco_complemento") or dados.get("complemento"), 100),
            endereco_bairro=tratar_texto_simples(dados.get("endereco_bairro") or dados.get("bairro"), 100),
            endereco_cidade=tratar_texto_simples(cidade_bruta, 100),
            endereco_estado=tratar_estado(dados.get("endereco_estado") or dados.get("estado")),
            endereco_cep=cep_formatado,
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