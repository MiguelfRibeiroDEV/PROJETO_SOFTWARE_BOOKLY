// Exibe mensagem de boas-vindas/flash se veio do cadastro com sucesso
const flash = sessionStorage.getItem("bookly_flash_sucesso");
if (flash) {
  if (window.BooklyToast) {
    BooklyToast.success(flash, "Bem-vindo ao Bookly!");
  }
  sessionStorage.removeItem("bookly_flash_sucesso");
}

// Controle de visualização de senha (olhinho)
const btnToggle = document.getElementById("btn-toggle-pass");
const passInput = document.getElementById("password");
if (btnToggle && passInput) {
  btnToggle.addEventListener("click", () => {
    const isPass = passInput.type === "password";
    passInput.type = isPass ? "text" : "password";
    btnToggle.innerHTML = isPass
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  });
}

document.getElementById("login-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const identificadorInput = document.getElementById("email");
  const rawId = identificadorInput.value.trim();
  const emailOrUser = rawId.includes("@") ? rawId.toLowerCase() : rawId;
  const password = document.getElementById("password").value.trim();
  const erroEl = document.getElementById("login-error");
  erroEl.hidden = true;

  if (!emailOrUser || !password) {
    erroEl.textContent = "Preencha o e-mail (ou usuário) e a senha.";
    erroEl.hidden = false;
    return;
  }

  const btnSubmit = event.target.querySelector('button[type="submit"]');
  const textoOriginal = btnSubmit ? btnSubmit.textContent : "Entrar";
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Entrando...";
  }

  try {
    const usuario = await apiRequest("/login", {
      method: "POST",
      body: { email: emailOrUser, senha: password },
    });

    // Guarda os dados da pessoa autenticada para as próximas telas
    localStorage.setItem("bookly_usuario_id", usuario.id);
    localStorage.setItem("bookly_usuario_tipo", usuario.tipo);
    localStorage.setItem("bookly_usuario_email", usuario.email);
    localStorage.setItem("bookly_usuario_nome", usuario.primeiro_nome);

    // Mantém compatibilidade com o cadastro de livro, que usa
    // especificamente o id do livreiro logado.
    if (usuario.tipo === "livreiro") {
      localStorage.setItem("bookly_livreiro_id", usuario.id);
    }

    window.location.href = "../marketplace/marketplace.html";
  } catch (erro) {
    erroEl.textContent = erro.message;
    erroEl.hidden = false;
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = textoOriginal;
    }
  }
});
