const formVerificar = document.getElementById("form-verificar");
const formRedefinir = document.getElementById("form-redefinir");
const emailInput = document.getElementById("rec-email");
const cpfInput = document.getElementById("rec-cpf");
const erroVerificar = document.getElementById("verificar-erro");
const erroRedefinir = document.getElementById("redefinir-erro");
const msgIdentidade = document.getElementById("msg-identidade");
const passoInstrucao = document.getElementById("passo-instrucao");

// Aplica máscara de CPF no input
if (window.BooklyMasks) {
  BooklyMasks.aplicar(cpfInput, "cpf");
}

let contaVerificada = null;

// ETAPA 1: Verificar dados no banco de dados
formVerificar.addEventListener("submit", async (e) => {
  e.preventDefault();
  erroVerificar.hidden = true;

  const email = emailInput.value.trim().toLowerCase();
  const cpf = cpfInput.value.trim();

  if (!email || !cpf) {
    erroVerificar.textContent = "Preencha o e-mail e o CPF.";
    erroVerificar.hidden = false;
    return;
  }

  const btnVerificar = document.getElementById("btn-verificar");
  const textoOriginal = btnVerificar.textContent;
  btnVerificar.disabled = true;
  btnVerificar.textContent = "Verificando...";

  try {
    const res = await apiRequest("/recuperar-senha/validar", {
      method: "POST",
      body: { email, cpf },
    });

    contaVerificada = {
      tipo: res.tipo,
      id: res.id,
      cpf: cpf,
      nome: res.nome,
    };

    // Transição para a Etapa 2
    formVerificar.hidden = true;
    formRedefinir.hidden = false;
    msgIdentidade.textContent = `Olá, ${res.nome}! Identidade confirmada. Defina sua nova senha:`;
    passoInstrucao.textContent = "Crie uma senha forte e segura com pelo menos 6 caracteres.";
    document.getElementById("nova-senha").focus();

    if (window.BooklyToast) {
      BooklyToast.success("Identidade confirmada com sucesso!", "Conta Localizada");
    }
  } catch (erro) {
    erroVerificar.textContent = erro.message;
    erroVerificar.hidden = false;
  } finally {
    btnVerificar.disabled = false;
    btnVerificar.textContent = textoOriginal;
  }
});

// ETAPA 2: Redefinir a senha
formRedefinir.addEventListener("submit", async (e) => {
  e.preventDefault();
  erroRedefinir.hidden = true;

  if (!contaVerificada) {
    erroRedefinir.textContent = "Sessão expirada. Recomece o processo.";
    erroRedefinir.hidden = false;
    return;
  }

  const novaSenha = document.getElementById("nova-senha").value;
  const confirmaSenha = document.getElementById("confirma-senha").value;

  if (novaSenha.length < 6) {
    erroRedefinir.textContent = "A nova senha deve ter no mínimo 6 caracteres.";
    erroRedefinir.hidden = false;
    return;
  }

  if (novaSenha !== confirmaSenha) {
    erroRedefinir.textContent = "A confirmação de senha não confere com a nova senha.";
    erroRedefinir.hidden = false;
    return;
  }

  const btnRedefinir = document.getElementById("btn-redefinir");
  const textoOriginal = btnRedefinir.textContent;
  btnRedefinir.disabled = true;
  btnRedefinir.textContent = "Salvando...";

  try {
    await apiRequest("/recuperar-senha/redefinir", {
      method: "POST",
      body: {
        tipo: contaVerificada.tipo,
        id: contaVerificada.id,
        cpf: contaVerificada.cpf,
        nova_senha: novaSenha,
      },
    });

    sessionStorage.setItem("bookly_flash_sucesso", "Senha redefinida com sucesso! Faça login com sua nova senha.");
    window.location.href = "../login/login.html";
  } catch (erro) {
    erroRedefinir.textContent = erro.message;
    erroRedefinir.hidden = false;
    btnRedefinir.disabled = false;
    btnRedefinir.textContent = textoOriginal;
  }
});

