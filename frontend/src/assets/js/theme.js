/* =========================================================
   theme.js - Gerenciador Global de Tema (Dark / Light Mode)
   Aplica o tema salvo no localStorage e expõe a troca de tema
   exclusivamente para o menu dropdown do usuário.
========================================================= */

(function () {
  const CHAVE_TEMA = "bookly_theme";

  function getTemaAtual() {
    return localStorage.getItem(CHAVE_TEMA) || "dark";
  }

  function aplicarTema(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem(CHAVE_TEMA, tema);

    // Notifica eventuais menus ou ouvintes
    window.dispatchEvent(new CustomEvent("bookly_theme_changed", { detail: { tema } }));
  }

  function alternarTema() {
    const atual = getTemaAtual();
    const proximo = atual === "dark" ? "light" : "dark";
    aplicarTema(proximo);
    if (window.BooklyToast) {
      BooklyToast.info(
        proximo === "dark" ? "Modo escuro ativado." : "Modo claro ativado.",
        "Tema"
      );
    }
    return proximo;
  }

  // Aplica imediatamente para evitar flash de estilo incorreto
  aplicarTema(getTemaAtual());

  // Exporta globalmente
  window.BooklyTheme = {
    get: getTemaAtual,
    set: aplicarTema,
    toggle: alternarTema,
  };
})();
