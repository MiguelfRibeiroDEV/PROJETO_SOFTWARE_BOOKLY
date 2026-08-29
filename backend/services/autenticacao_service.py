from models.livreiro_model import Livreiro
from models.comprador_model import Comprador


class AutenticarUsuarioService:
    """Caso de uso: autenticar uma pessoa (livreiro ou comprador) por e-mail/senha."""

    def executar(self, dados):
        email = str(dados.get("email") or "").strip().lower()
        senha = dados.get("senha")

        if not email or not senha:
            raise ValueError("Informe e-mail e senha.")

        livreiro = Livreiro.buscar_por_email(email)
        if livreiro and livreiro.senha == senha:
            return {
                "tipo": "livreiro",
                "id": livreiro.id_livreiro,
                "usuario": livreiro.usuario,
                "primeiro_nome": livreiro.primeiro_nome,
                "email": livreiro.email,
            }

        comprador = Comprador.buscar_por_email(email)
        if comprador and comprador.senha == senha:
            return {
                "tipo": "comprador",
                "id": comprador.id_comprador,
                "usuario": comprador.usuario,
                "primeiro_nome": comprador.primeiro_nome,
                "email": comprador.email,
            }

        raise ValueError("E-mail ou senha inválidos.")
