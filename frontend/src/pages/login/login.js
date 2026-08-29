document.getElementById("login-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const erroEl = document.getElementById("login-error");
  erroEl.hidden = true;

  try {
    const usuario = await apiRequest("/login", {
      method: "POST",
      body: { email, senha: password },
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
  }
});
