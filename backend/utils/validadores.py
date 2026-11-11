"""
Validações, higienização e tratamento uniforme de dados para o Bookly.
Garante integridade e consistência antes de salvar no banco de dados MySQL.
"""

import re

UFS_VALIDAS = {
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
}

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
USUARIO_REGEX = re.compile(r"^[a-zA-Z0-9_.-]{3,50}$")


def validar_cpf(cpf: str) -> bool:
    """Valida se o CPF possui 11 dígitos numéricos e não é repetido (amigável a protótipos acadêmicos)."""
    if not cpf:
        return False
    numeros = re.sub(r"\D", "", str(cpf))
    if len(numeros) != 11:
        return False
    # Rejeita CPFs com todos os dígitos iguais (ex: 000.000.000-00, 111.111.111-11)
    if numeros == numeros[0] * 11:
        return False
    return True


def tratar_cpf(cpf: str) -> str:
    """Retorna o CPF contendo estritamente os 11 dígitos numéricos válidos."""
    limpo = re.sub(r"\D", "", str(cpf or ""))
    if len(limpo) != 11:
        raise ValueError("CPF inválido: deve conter 11 dígitos numéricos.")
    if limpo == limpo[0] * 11:
        raise ValueError("CPF inválido: dígitos repetidos não representam um CPF válido.")
    return limpo


def formatar_cpf(cpf: str) -> str:
    """Formata CPF como 000.000.000-00."""
    numeros = re.sub(r"\D", "", str(cpf or ""))
    if len(numeros) == 11:
        return f"{numeros[:3]}.{numeros[3:6]}.{numeros[6:9]}-{numeros[9:]}"
    return numeros


def tratar_email(email: str) -> str:
    """Valida formato do e-mail e normaliza em minúsculas sem espaços."""
    limpo = str(email or "").strip().lower()
    if not limpo:
        raise ValueError("O campo de e-mail é obrigatório.")
    if not EMAIL_REGEX.match(limpo):
        raise ValueError(f"Formato de e-mail inválido: '{limpo}'. Use o formato nome@dominio.com.")
    if len(limpo) > 150:
        raise ValueError("O e-mail excede o limite de 150 caracteres.")
    return limpo


def tratar_telefone(telefone: str) -> str:
    """Valida se o telefone tem 10 ou 11 dígitos e formata como (XX) XXXXX-XXXX."""
    if not telefone:
        return None
    numeros = re.sub(r"\D", "", str(telefone))
    if not numeros:
        return None
    if len(numeros) not in (10, 11):
        raise ValueError("Telefone inválido: deve conter DDD + número (10 ou 11 dígitos).")
    
    # Formatação padronizada
    ddd = numeros[:2]
    if len(numeros) == 11:
        return f"({ddd}) {numeros[2:7]}-{numeros[7:]}"
    return f"({ddd}) {numeros[2:6]}-{numeros[6:]}"


def tratar_cep(cep: str) -> str:
    """Valida se o CEP tem 8 dígitos, não é nulo/zerado e formata como XXXXX-XXX."""
    if not cep:
        return None
    numeros = re.sub(r"\D", "", str(cep))
    if not numeros:
        return None
    if len(numeros) != 8:
        raise ValueError("CEP inválido: deve conter exatamente 8 dígitos numéricos.")
    if numeros == numeros[0] * 8:
        raise ValueError("CEP inválido: dígitos repetidos não representam um CEP real.")
    return f"{numeros[:5]}-{numeros[5:]}"


def tratar_estado(uf: str) -> str:
    """Valida a sigla da Unidade Federativa (UF)."""
    if not uf:
        return None
    limpo = str(uf).strip().upper()[:2]
    if limpo and limpo not in UFS_VALIDAS:
        raise ValueError(f"UF de estado inválida: '{limpo}'. Use uma sigla válida (ex: SP, MG, RJ).")
    return limpo or None


def tratar_usuario(usuario: str) -> str:
    """Valida e normaliza o nome de usuário (minúsculo, 3 a 50 caracteres)."""
    limpo = str(usuario or "").strip().lower()
    if not limpo:
        raise ValueError("O nome de usuário é obrigatório.")
    if len(limpo) < 3 or len(limpo) > 50:
        raise ValueError("O nome de usuário deve ter entre 3 e 50 caracteres.")
    if not USUARIO_REGEX.match(limpo):
        raise ValueError("Nome de usuário inválido: use apenas letras, números, ponto e sublinhado.")
    return limpo


def tratar_nome(nome: str, campo: str = "Nome") -> str:
    """Normaliza nome de pessoas em Title Case e remove espaços extras."""
    limpo = " ".join(str(nome or "").strip().split())
    if not limpo and campo == "Nome":
        raise ValueError(f"O campo '{campo}' não pode ficar vazio.")
    if len(limpo) > 100:
        raise ValueError(f"O campo '{campo}' não pode ultrapassar 100 caracteres.")
    return limpo.title() if limpo else None


def tratar_texto_simples(texto: str, max_len: int = 100) -> str:
    """Remove espaços excessivos e respeita limite de tamanho do banco."""
    if not texto:
        return None
    limpo = " ".join(str(texto).strip().split())
    if len(limpo) > max_len:
        limpo = limpo[:max_len].strip()
    return limpo or None
