import re

from models.comprador_model import Comprador
from models.livreiro_model import Livreiro
from models.database import db

TIPOS = {"comprador": Comprador, "livreiro": Livreiro}
LIMITE_FOTO = 400_000  # caracteres do data-URL (a foto já chega comprimida)


def _buscar_usuario(tipo, usuario_id):
    """Localiza o comprador/livreiro pelo tipo + id (ids são independentes)."""
    modelo = TIPOS.get(tipo)
    if modelo is None:
        raise ValueError("Tipo de usuário inválido.")
    return modelo.query.get(usuario_id)


def _montar_perfil(tipo, usuario):
    """Dicionário seguro para o front-end (nunca devolve a senha)."""
    perfil = {
        "tipo": tipo,
        "id": usuario.id_comprador if tipo == "comprador" else usuario.id_livreiro,
        "usuario": usuario.usuario,
        "primeiro_nome": usuario.primeiro_nome,
        "segundo_nome": usuario.segundo_nome,
        "email": usuario.email,
        "cpf": usuario.cpf,
        "telefone": usuario.telefone,
        "data_nascimento": usuario.data_nascimento.isoformat() if usuario.data_nascimento else None,
        "data_cadastro": usuario.data_cadastro.isoformat() if usuario.data_cadastro else None,
        "endereco_rua": usuario.endereco_rua,
        "endereco_numero": usuario.endereco_numero,
        "endereco_complemento": usuario.endereco_complemento,
        "endereco_bairro": usuario.endereco_bairro,
        "endereco_cidade": usuario.endereco_cidade,
        "endereco_estado": usuario.endereco_estado,
        "endereco_cep": usuario.endereco_cep,
        "foto_perfil": usuario.foto_perfil,
    }
    if tipo == "comprador":
        perfil["livros_comprados"] = usuario.livros_comprados or 0
    else:
        perfil["livros_vendidos"] = usuario.livros_vendidos or 0
        perfil["total_faturado"] = float(usuario.total_faturado or 0)
    return perfil


class BuscarPerfilService:
    """Caso de uso: consultar os dados do perfil de um usuário."""

    def executar(self, tipo, usuario_id):
        usuario = _buscar_usuario(tipo, usuario_id)
        if usuario is None:
            return None
        return _montar_perfil(tipo, usuario)


class AtualizarPerfilService:
    """Caso de uso: editar nome, foto, telefone, endereço etc. (só o que vier no JSON)."""

    CAMPOS_TEXTO = (
        "segundo_nome", "endereco_rua", "endereco_numero",
        "endereco_complemento", "endereco_bairro", "endereco_cidade",
    )

    def executar(self, tipo, usuario_id, dados):
        usuario = _buscar_usuario(tipo, usuario_id)
        if usuario is None:
            return None

        if "primeiro_nome" in dados:
            nome = str(dados.get("primeiro_nome") or "").strip()
            if not nome:
                raise ValueError("O nome não pode ficar vazio.")
            usuario.primeiro_nome = nome

        if "usuario" in dados:
            novo_usuario = str(dados.get("usuario") or "").strip()
            if not novo_usuario:
                raise ValueError("O nome de usuário não pode ficar vazio.")
            existente = type(usuario).query.filter_by(usuario=novo_usuario).first()
            if existente and existente is not usuario:
                raise ValueError("Este nome de usuário já está em uso.")
            usuario.usuario = novo_usuario

        for campo in self.CAMPOS_TEXTO:
            if campo in dados:
                setattr(usuario, campo, str(dados.get(campo) or "").strip() or None)

        if "telefone" in dados:
            usuario.telefone = re.sub(r"\D", "", str(dados.get("telefone") or "")) or None

        if "endereco_cep" in dados:
            usuario.endereco_cep = re.sub(r"\D", "", str(dados.get("endereco_cep") or "")) or None

        if "endereco_estado" in dados:
            usuario.endereco_estado = str(dados.get("endereco_estado") or "").strip().upper()[:2] or None

        if "data_nascimento" in dados:
            usuario.data_nascimento = dados.get("data_nascimento") or None

        if "foto_perfil" in dados:
            foto = dados.get("foto_perfil")
            if not foto:
                usuario.foto_perfil = None  # remover foto
            else:
                if not str(foto).startswith("data:image/"):
                    raise ValueError("A foto enviada não é uma imagem válida.")
                if len(foto) > LIMITE_FOTO:
                    raise ValueError("A foto é muito grande. Escolha uma imagem menor.")
                usuario.foto_perfil = foto

        db.session.commit()
        return _montar_perfil(tipo, usuario)


class AlterarSenhaService:
    """Caso de uso: trocar a senha informando a senha atual."""

    def executar(self, tipo, usuario_id, dados):
        usuario = _buscar_usuario(tipo, usuario_id)
        if usuario is None:
            return False

        atual = dados.get("senha_atual")
        nova = dados.get("senha_nova")

        if not atual or not nova:
            raise ValueError("Informe a senha atual e a nova senha.")
        if usuario.senha != atual:
            raise ValueError("A senha atual está incorreta.")
        if len(str(nova)) < 6:
            raise ValueError("A nova senha deve ter pelo menos 6 caracteres.")
        if nova == atual:
            raise ValueError("A nova senha deve ser diferente da atual.")

        usuario.senha = nova
        db.session.commit()
        return True
