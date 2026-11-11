from models.livreiro_model import Livreiro
from models.comprador_model import Comprador


class AutenticarUsuarioService:
    """Caso de uso: autenticar uma pessoa (livreiro ou comprador) por e-mail, usuário ou login."""

    def executar(self, dados):
        identificador = str(dados.get("email") or dados.get("usuario") or dados.get("login") or "").strip()
        senha = str(dados.get("senha") or "")

        if not identificador or not senha:
            raise ValueError("Informe e-mail (ou usuário) e senha.")

        # 1. Tenta autenticar como Livreiro (por e-mail, nome de usuário ou login)
        identificador_lower = identificador.lower()
        livreiro = (
            Livreiro.buscar_por_email(identificador_lower)
            or Livreiro.buscar_por_usuario(identificador)
            or Livreiro.buscar_por_login(identificador)
        )
        if livreiro and livreiro.senha == senha:
            return {
                "tipo": "livreiro",
                "id": livreiro.id_livreiro,
                "usuario": livreiro.usuario,
                "primeiro_nome": livreiro.primeiro_nome,
                "email": livreiro.email,
            }

        # 2. Tenta autenticar como Comprador (por e-mail, nome de usuário ou login)
        comprador = (
            Comprador.buscar_por_email(identificador_lower)
            or Comprador.buscar_por_usuario(identificador)
            or Comprador.buscar_por_login(identificador)
        )
        if comprador and comprador.senha == senha:
            return {
                "tipo": "comprador",
                "id": comprador.id_comprador,
                "usuario": comprador.usuario,
                "primeiro_nome": comprador.primeiro_nome,
                "email": comprador.email,
            }

        raise ValueError("E-mail ou senha inválidos.")
