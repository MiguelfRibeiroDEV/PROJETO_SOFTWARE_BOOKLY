import re
from models.database import db
from models.comprador_model import Comprador
from models.livreiro_model import Livreiro


class ValidarDadosRecuperacaoService:
    """Valida se existe uma conta (comprador ou livreiro) associada ao e-mail e CPF informados."""

    def executar(self, dados):
        email_bruto = str(dados.get("email") or "").strip().lower()
        cpf_bruto = str(dados.get("cpf") or "")
        cpf_limpo = re.sub(r"\D", "", cpf_bruto)

        if not email_bruto:
            raise ValueError("Informe o e-mail cadastrado.")
        if not cpf_limpo or len(cpf_limpo) != 11:
            raise ValueError("Informe um CPF válido com 11 dígitos.")

        # 1. Procura em Compradores
        comprador = Comprador.query.filter(
            Comprador.email == email_bruto,
            Comprador.cpf == cpf_limpo
        ).first()

        if comprador:
            return {
                "valido": True,
                "tipo": "comprador",
                "id": comprador.id_comprador,
                "nome": comprador.primeiro_nome,
                "email": comprador.email,
            }

        # 2. Procura em Livreiros
        livreiro = Livreiro.query.filter(
            Livreiro.email == email_bruto,
            Livreiro.cpf == cpf_limpo
        ).first()

        if livreiro:
            return {
                "valido": True,
                "tipo": "livreiro",
                "id": livreiro.id_livreiro,
                "nome": livreiro.primeiro_nome,
                "email": livreiro.email,
            }

        raise ValueError("Nenhuma conta encontrada com o e-mail e CPF informados. Verifique os dados e tente novamente.")


class RedefinirSenhaService:
    """Altera a senha no banco de dados após validação de identidade por e-mail e CPF."""

    def executar(self, dados):
        tipo = dados.get("tipo")
        id_usuario = dados.get("id")
        cpf_bruto = str(dados.get("cpf") or "")
        cpf_limpo = re.sub(r"\D", "", cpf_bruto)
        nova_senha = str(dados.get("nova_senha") or "").strip()

        if not tipo or not id_usuario:
            raise ValueError("Dados de identificação ausentes.")
        if len(nova_senha) < 6:
            raise ValueError("A nova senha deve ter pelo menos 6 caracteres.")

        if tipo == "comprador":
            usuario = db.session.get(Comprador, id_usuario)
            if not usuario or usuario.cpf != cpf_limpo:
                raise ValueError("Identidade não pôde ser confirmada.")
            usuario.senha = nova_senha
            db.session.commit()
            return {"mensagem": "Senha alterada com sucesso! Faça login com sua nova senha."}

        elif tipo == "livreiro":
            usuario = db.session.get(Livreiro, id_usuario)
            if not usuario or usuario.cpf != cpf_limpo:
                raise ValueError("Identidade não pôde ser confirmada.")
            usuario.senha = nova_senha
            db.session.commit()
            return {"mensagem": "Senha alterada com sucesso! Faça login com sua nova senha."}

        raise ValueError("Tipo de usuário inválido.")

