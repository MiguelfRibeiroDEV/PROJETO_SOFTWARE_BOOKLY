const cepInput = document.getElementById("cep");
const cepStatus = document.getElementById("cep-status");
const ruaInput = document.getElementById("rua");
const bairroInput = document.getElementById("bairro");
const cidadeInput = document.getElementById("cidade");
const estadoSelect = document.getElementById("estado");
const numeroInput = document.getElementById("numero");
const erroEl = document.getElementById("register-error");

// Controle de visualização de senha (olhinho) no cadastro
const btnToggleReg = document.getElementById("btn-toggle-pass-reg");
const passInputReg = document.getElementById("senha");
if (btnToggleReg && passInputReg) {
  btnToggleReg.addEventListener("click", () => {
    const isPass = passInputReg.type === "password";
    passInputReg.type = isPass ? "text" : "password";
    btnToggleReg.innerHTML = isPass
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  });
}

// Configura o Autocomplete Dinâmico e inteligente do CEP
if (window.BooklyMasks && window.BooklyMasks.configurarAutocompleteEndereco) {
  BooklyMasks.configurarAutocompleteEndereco({
    cep: cepInput,
    rua: ruaInput,
    bairro: bairroInput,
    cidade: cidadeInput,
    estado: estadoSelect,
    numero: numeroInput,
    statusEl: cepStatus,
  });
}

// Envio e validação rigorosa do formulário
document.getElementById("register-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  erroEl.hidden = true;

  const role = document.querySelector('input[name="role"]:checked').value;
  const rota = role === "vendedor" ? "/livreiros" : "/compradores";

  const cpfRaw = document.getElementById("cpf").value.trim();
  const emailRaw = document.getElementById("email").value.trim();
  const telefoneRaw = document.getElementById("telefone").value.trim();
  const cepRaw = cepInput.value.trim();

  // Validação 1: CPF
  if (!BooklyMasks.validarCPF(cpfRaw)) {
    erroEl.textContent = "CPF inválido. Verifique os números digitados.";
    erroEl.hidden = false;
    document.getElementById("cpf").focus();
    return;
  }

  // Validação 2: Email
  if (!BooklyMasks.validarEmail(emailRaw)) {
    erroEl.textContent = "E-mail inválido. Utilize o formato seu@email.com.";
    erroEl.hidden = false;
    document.getElementById("email").focus();
    return;
  }

  // Validação 3: Telefone (opcional, mas se preenchido precisa ter DDD e número válido: 10 ou 11 dígitos)
  const telDigitos = telefoneRaw.replace(/\D/g, "");
  if (telDigitos.length > 0 && (telDigitos.length < 10 || telDigitos.length > 11)) {
    erroEl.textContent = "Telefone inválido. Informe o DDD e o número completo (ex: (11) 98765-4321).";
    erroEl.hidden = false;
    document.getElementById("telefone").focus();
    return;
  }

  // Validação 4: CEP (opcional, mas se preenchido precisa ser válido)
  const cepDigitos = cepRaw.replace(/\D/g, "");
  if (cepDigitos.length > 0 && !BooklyMasks.validarCEP(cepRaw)) {
    erroEl.textContent = "CEP inválido. O CEP deve conter 8 dígitos numéricos válidos.";
    erroEl.hidden = false;
    cepInput.focus();
    return;
  }

  const payload = {
    primeiro_nome: document.getElementById("primeiro-nome").value.trim(),
    segundo_nome: document.getElementById("segundo-nome").value.trim(),
    login: document.getElementById("login").value.trim().toLowerCase(),
    usuario: document.getElementById("usuario").value.trim().toLowerCase(),
    senha: document.getElementById("senha").value,
    cpf: cpfRaw,
    email: emailRaw.toLowerCase(),
    telefone: telefoneRaw,
    data_nascimento: document.getElementById("data-nascimento").value || null,
    endereco_cep: cepRaw,
    endereco_estado: estadoSelect.value,
    endereco_cidade: cidadeInput.value.trim(),
    endereco_bairro: bairroInput.value.trim(),
    endereco_rua: ruaInput.value.trim(),
    endereco_numero: numeroInput.value.trim(),
  };

  const btnSubmit = event.target.querySelector('button[type="submit"]');
  btnSubmit.disabled = true;
  btnSubmit.textContent = "Criando conta...";

  try {
    await apiRequest(rota, { method: "POST", body: payload });
    sessionStorage.setItem("bookly_flash_sucesso", "Conta criada com sucesso! Faça login para começar.");
    window.location.href = "../login/login.html";
  } catch (erro) {
    erroEl.textContent = erro.message;
    erroEl.hidden = false;
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Criar conta";
  }
});
