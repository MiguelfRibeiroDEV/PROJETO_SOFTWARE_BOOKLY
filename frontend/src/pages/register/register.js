document.getElementById("register-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const erroEl = document.getElementById("register-error");
  erroEl.hidden = true;

  const role = document.querySelector('input[name="role"]:checked').value;
  const rota = role === "vendedor" ? "/livreiros" : "/compradores";

  const payload = {
    primeiro_nome: document.getElementById("primeiro-nome").value.trim(),
    segundo_nome: document.getElementById("segundo-nome").value.trim(),
    login: document.getElementById("login").value.trim(),
    usuario: document.getElementById("usuario").value.trim(),
    senha: document.getElementById("senha").value,
    cpf: document.getElementById("cpf").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    data_nascimento: document.getElementById("data-nascimento").value || null,
    endereco_cep: document.getElementById("cep").value.trim(),
    endereco_estado: document.getElementById("estado").value,
    endereco_cidade: document.getElementById("cidade").value.trim(),
    endereco_bairro: document.getElementById("bairro").value.trim(),
    endereco_rua: document.getElementById("rua").value.trim(),
    endereco_numero: document.getElementById("numero").value.trim(),
  };

  try {
    await apiRequest(rota, { method: "POST", body: payload });
    window.location.href = "../login/login.html";
  } catch (erro) {
    erroEl.textContent = erro.message;
    erroEl.hidden = false;
  }
});
