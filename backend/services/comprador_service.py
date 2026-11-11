import re
from sqlalchemy.exc import SQLAlchemyError
from models.comprador_model import Comprador
from models.database import db
from utils.validadores import (
    validar_cpf, tratar_cpf, tratar_email, tratar_telefone, tratar_cep, tratar_estado,
    tratar_usuario, tratar_nome, tratar_texto_simples
)


class CriarCompradorService:
    def executar(self, dados):
        campos_obrigatorios = ["login", "senha", "usuario", "cpf", "email", "primeiro_nome"]

        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise ValueError(f"O campo '{campo}' é obrigatório.")

        # --- HIGIENIZAÇÃO E TRATAMENTO DOS DADOS ---
        cpf_limpo = tratar_cpf(dados.get("cpf"))

        email_limpo = tratar_email(dados.get("email"))
        telefone_formatado = tratar_telefone(dados.get("telefone"))
        cep_formatado = tratar_cep(dados.get("endereco_cep") or dados.get("cep"))
        primeiro_nome = tratar_nome(dados.get("primeiro_nome"), "Primeiro nome")
        segundo_nome = tratar_nome(dados.get("segundo_nome"), "Sobrenome")
        usuario_limpo = tratar_usuario(dados.get("usuario"))
        login_limpo = str(dados.get("login") or "").strip()
        if not login_limpo or len(login_limpo) < 3:
            raise ValueError("O login deve ter pelo menos 3 caracteres.")

        cidade_bruta = str(dados.get("endereco_cidade") or dados.get("cidade") or "").split("/")[0]

        # Validações de unicidade no banco
        if Comprador.buscar_por_email(email_limpo):
            raise ValueError("Já existe um comprador cadastrado com este e-mail.")

        if Comprador.buscar_por_cpf(cpf_limpo):
            raise ValueError("Já existe um comprador cadastrado com este CPF.")

        if Comprador.buscar_por_login(login_limpo):
            raise ValueError("Já existe um comprador cadastrado com este login.")

        if Comprador.buscar_por_usuario(usuario_limpo):
            raise ValueError("Já existe um comprador cadastrado com este nome de usuário.")

        # --- CRIAÇÃO DO MODELO COMPRADOR ---
        comprador = Comprador(
            login=login_limpo,
            senha=dados.get("senha"),
            usuario=usuario_limpo,
            cpf=cpf_limpo,
            telefone=telefone_formatado,
            email=email_limpo,
            primeiro_nome=primeiro_nome,
            segundo_nome=segundo_nome,
            data_nascimento=dados.get("data_nascimento") or None,
            livros_comprados=dados.get("livros_comprados", 0),
            endereco_rua=tratar_texto_simples(dados.get("endereco_rua") or dados.get("rua"), 150),
            endereco_numero=tratar_texto_simples(dados.get("endereco_numero") or dados.get("numero"), 10),
            endereco_complemento=tratar_texto_simples(dados.get("endereco_complemento") or dados.get("complemento"), 100),
            endereco_bairro=tratar_texto_simples(dados.get("endereco_bairro") or dados.get("bairro"), 100),
            endereco_cidade=tratar_texto_simples(cidade_bruta, 100),
            endereco_estado=tratar_estado(dados.get("endereco_estado") or dados.get("estado")),
            endereco_cep=cep_formatado,
        )

        comprador.salvar()
        return comprador.to_dict()


class ListarCompradoresService:
    def executar(self):
        return [c.to_dict() for c in Comprador.listar_todos()]


class BuscarCompradorPorIdService:
    def executar(self, comprador_id):
        comprador = Comprador.buscar_por_id(comprador_id)
        if not comprador:
            return None
        return comprador.to_dict()


class AtualizarCompradorService:
    def executar(self, comprador_id, dados):
        comprador = Comprador.buscar_por_id(comprador_id)
        if not comprador:
            return None

        # Tratamento de CEP/CPF caso sejam atualizados
        if "endereco_cep" in dados or "cep" in dados:
            cep_bruto = str(dados.get("endereco_cep") or dados.get("cep") or "")
            comprador.endereco_cep = re.sub(r"\D", "", cep_bruto) or None

        if "cpf" in dados:
            cpf_limpo = re.sub(r"\D", "", str(dados.get("cpf")))
            if cpf_limpo and len(cpf_limpo) != 11:
                raise ValueError("O CPF deve conter exatamente 11 dígitos numéricos.")
            comprador.cpf = cpf_limpo

        if "telefone" in dados:
            comprador.telefone = re.sub(r"\D", "", str(dados.get("telefone"))) or None

        if "primeiro_nome" in dados:
            comprador.primeiro_nome = str(dados.get("primeiro_nome")).strip()

        if "segundo_nome" in dados:
            comprador.segundo_nome = str(dados.get("segundo_nome")).strip() or None

        db.session.commit()
        return comprador.to_dict()


class DeletarCompradorService:
    def executar(self, comprador_id):
        comprador = Comprador.buscar_por_id(comprador_id)
        if not comprador:
            return False

        comprador.deletar()
        return True