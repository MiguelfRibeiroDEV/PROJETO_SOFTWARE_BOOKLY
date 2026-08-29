import re
from sqlalchemy.exc import SQLAlchemyError
from models.comprador_model import Comprador
from models.database import db


class CriarCompradorService:
    def executar(self, dados):
        # --- TRATAMENTO E HIGIENIZAÇÃO DOS DADOS ---

        # 1. TRATAMENTO DO CEP: Remove ponto, hífen e espaços (ex: "30.850-470" -> "30850470")
        cep_bruto = str(dados.get("endereco_cep") or dados.get("cep") or "")
        cep_limpo = re.sub(r"\D", "", cep_bruto)

        # 2. TRATAMENTO DA CIDADE: Se vier "BELO HORIZONTE / MG", pega só "BELO HORIZONTE"
        cidade_bruta = str(dados.get("endereco_cidade") or dados.get("cidade") or "")
        cidade_limpa = cidade_bruta.split("/")[0].strip()

        # 3. TRATAMENTO DO CPF E TELEFONE: Garante apenas números
        cpf_bruto = str(dados.get("cpf") or "")
        cpf_limpo = re.sub(r"\D", "", cpf_bruto)

        telefone_bruto = str(dados.get("telefone") or "")
        telefone_limpo = re.sub(r"\D", "", telefone_bruto)

        # 4. TRATAMENTO DE TEXTOS (remove espaços desnecessários nas pontas)
        primeiro_nome = str(dados.get("primeiro_nome") or "").strip()
        segundo_nome = str(dados.get("segundo_nome") or "").strip()
        email_limpo = str(dados.get("email") or "").strip().lower()

        # --- CRIAÇÃO DO MODELO COMPRADOR ---
        comprador = Comprador(
            login=dados.get("login") or email_limpo,
            senha=dados.get("senha"),
            usuario=dados.get("usuario"),
            cpf=cpf_limpo,
            telefone=telefone_limpo,
            email=email_limpo,
            primeiro_nome=primeiro_nome,
            segundo_nome=segundo_nome,
            data_nascimento=dados.get("data_nascimento") or None,
            livros_comprados=dados.get("livros_comprados", 0),
            endereco_rua=str(dados.get("endereco_rua") or dados.get("rua") or "").strip(),
            endereco_numero=str(dados.get("endereco_numero") or dados.get("numero") or "").strip(),
            endereco_complemento=str(dados.get("endereco_complemento") or dados.get("complemento") or "").strip(),
            endereco_bairro=str(dados.get("endereco_bairro") or dados.get("bairro") or "").strip(),
            endereco_cidade=cidade_limpa,
            endereco_estado=str(dados.get("endereco_estado") or dados.get("estado") or "").strip().upper(),
            endereco_cep=cep_limpo,  # CEP tratado com no máximo 8 dígitos
        )

        # Salva no banco de dados
        db.session.add(comprador)
        db.session.commit()

        return comprador.to_dict()


class ListarCompradoresService:
    def executar(self):
        compradores = Comprador.query.all()
        return [c.to_dict() for c in compradores]


class BuscarCompradorPorIdService:
    def executar(self, comprador_id):
        comprador = Comprador.query.get(comprador_id)
        if not comprador:
            return None
        return comprador.to_dict()


class AtualizarCompradorService:
    def executar(self, comprador_id, dados):
        comprador = Comprador.query.get(comprador_id)
        if not comprador:
            return None

        # Tratamento de CEP/CPF caso sejam atualizados
        if "endereco_cep" in dados or "cep" in dados:
            cep_bruto = str(dados.get("endereco_cep") or dados.get("cep") or "")
            comprador.endereco_cep = re.sub(r"\D", "", cep_bruto)

        if "cpf" in dados:
            comprador.cpf = re.sub(r"\D", "", str(dados.get("cpf")))

        if "telefone" in dados:
            comprador.telefone = re.sub(r"\D", "", str(dados.get("telefone")))

        if "primeiro_nome" in dados:
            comprador.primeiro_nome = str(dados.get("primeiro_nome")).strip()

        if "segundo_nome" in dados:
            comprador.segundo_nome = str(dados.get("segundo_nome")).strip()

        db.session.commit()
        return comprador.to_dict()


class DeletarCompradorService:
    def executar(self, comprador_id):
        comprador = Comprador.query.get(comprador_id)
        if not comprador:
            return False

        db.session.delete(comprador)
        db.session.commit()
        return True