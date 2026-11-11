/* =========================================================
   toast.js - Sistema Central de Notificações e Confirmações
   Substitui alert() e confirm() por componentes elegantes.
========================================================= */

(function () {
  // Localiza a raiz "src/" do front-end
  const script = document.currentScript;
  const RAIZ = script ? new URL("../../", script.src).href : "../../";

  // Injeta automaticamente o CSS de toast caso não esteja carregado
  if (!document.getElementById("bookly-toast-style")) {
    const link = document.createElement("link");
    link.id = "bookly-toast-style";
    link.rel = "stylesheet";
    link.href = RAIZ + "styles/base/toast.css";
    document.head.appendChild(link);
  }

  // Garante o container dos toasts
  function getContainer() {
    let container = document.getElementById("bookly-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "bookly-toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    success: `<svg class="bookly-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg class="bookly-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="bookly-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg class="bookly-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  /**
   * Normaliza opções flexíveis passadas para os métodos BooklyToast.*
   */
  function normalizarOpcoes(titleOrOptions, maybeOptions) {
    let opts = {};
    if (typeof titleOrOptions === "string") {
      opts.title = titleOrOptions;
      if (maybeOptions && typeof maybeOptions === "object") {
        Object.assign(opts, maybeOptions);
      }
    } else if (titleOrOptions && typeof titleOrOptions === "object") {
      opts = { ...titleOrOptions };
    }

    // Desenrola action caso tenha sido passada como { action: { text, url } } ou diretamente { text, url }
    if (opts.action && typeof opts.action === "object" && opts.action.action) {
      opts.action = opts.action.action;
    }
    return opts;
  }

  /**
   * Mostra um Toast não bloqueante na tela.
   * @param {string} message - Texto principal.
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'.
   * @param {object} [options] - { title, duration, action: { text, url, onClick } }
   */
  function showToast(message, type = "info", options = {}) {
    const container = getContainer();
    const toast = document.createElement("div");
    toast.className = `bookly-toast toast-${type}`;

    const iconHtml = ICONS[type] || ICONS.info;
    const titleHtml = options.title ? `<div class="bookly-toast-title">${options.title}</div>` : "";

    // Tratamento estrito e seguro da ação do toast
    let action = options.action;
    if (action && typeof action === "object" && action.action) {
      action = action.action;
    }

    let actionHtml = "";
    if (action && typeof action === "object") {
      const text = String(action.text || "Acessar").trim();
      const rawUrl = String(action.url || "").trim();
      const urlValida = rawUrl && rawUrl !== "#" && !rawUrl.startsWith("javascript:");

      if (urlValida) {
        actionHtml = `<a class="bookly-toast-action" href="${rawUrl}">${text}</a>`;
      } else if (typeof action.onClick === "function") {
        actionHtml = `<button type="button" class="bookly-toast-action">${text}</button>`;
      }
      // Se não tiver nem url válida nem onClick, NUNCA renderiza <a> vazio ou com href="#"
    }

    toast.innerHTML = `
      ${iconHtml}
      <div class="bookly-toast-content">
        ${titleHtml}
        <div class="bookly-toast-message">${message}</div>
        ${actionHtml}
      </div>
      <button type="button" class="bookly-toast-close" aria-label="Fechar">&times;</button>
    `;

    // Handler de clique caso a ação seja uma função (onClick)
    if (action && typeof action.onClick === "function") {
      const actBtn = toast.querySelector(".bookly-toast-action");
      if (actBtn) {
        actBtn.addEventListener("click", (e) => {
          e.preventDefault();
          action.onClick();
          fechar();
        });
      }
    }

    const closeBtn = toast.querySelector(".bookly-toast-close");
    function fechar() {
      toast.classList.remove("is-visible");
      setTimeout(() => {
        toast.remove();
      }, 250);
    }
    closeBtn.addEventListener("click", fechar);

    container.appendChild(toast);

    // Animação de entrada
    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    // Auto dismiss
    const duration = options.duration || (type === "error" ? 5000 : 3800);
    if (duration > 0) {
      setTimeout(fechar, duration);
    }

    return toast;
  }

  /**
   * Modal elegante de confirmação assíncrona (Promise<boolean>).
   * Substitui confirm(...) sem travar o navegador.
   */
  function showConfirm(title, message, options = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "bookly-modal-overlay";

      const confirmText = options.confirmText || "Confirmar";
      const cancelText = options.cancelText || "Cancelar";
      const isDanger = options.danger !== false;

      overlay.innerHTML = `
        <div class="bookly-modal-card" role="dialog" aria-modal="true">
          <div class="bookly-modal-header">
            <h3>${title || 'Confirmação'}</h3>
          </div>
          <div class="bookly-modal-body">
            ${message}
          </div>
          <div class="bookly-modal-actions">
            <button type="button" class="bookly-modal-btn bookly-modal-cancel">${cancelText}</button>
            <button type="button" class="bookly-modal-btn bookly-modal-confirm ${isDanger ? 'danger' : ''}">${confirmText}</button>
          </div>
        </div>
      `;

      function finalizar(resposta) {
        overlay.classList.remove("is-active");
        setTimeout(() => {
          overlay.remove();
          resolve(resposta);
        }, 200);
      }

      overlay.querySelector(".bookly-modal-cancel").addEventListener("click", () => finalizar(false));
      overlay.querySelector(".bookly-modal-confirm").addEventListener("click", () => finalizar(true));

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) finalizar(false);
      });

      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.classList.add("is-active");
      });
    });
  }

  // Exporta globalmente com sobrecarga flexível de parâmetros
  window.BooklyToast = {
    show: showToast,
    success(msg, titleOrOptions, maybeOptions) {
      return showToast(msg, "success", normalizarOpcoes(titleOrOptions, maybeOptions));
    },
    error(msg, titleOrOptions, maybeOptions) {
      return showToast(msg, "error", normalizarOpcoes(titleOrOptions, maybeOptions));
    },
    warning(msg, titleOrOptions, maybeOptions) {
      return showToast(msg, "warning", normalizarOpcoes(titleOrOptions, maybeOptions));
    },
    info(msg, titleOrOptions, maybeOptions) {
      return showToast(msg, "info", normalizarOpcoes(titleOrOptions, maybeOptions));
    },
    confirm: showConfirm,
  };

  // Dispara mensagens flash pendentes entre páginas
  function checarFlash() {
    const flashSucesso = sessionStorage.getItem("bookly_flash_sucesso");
    if (flashSucesso) {
      sessionStorage.removeItem("bookly_flash_sucesso");
      showToast(flashSucesso, "success");
    }
    const flashAviso = sessionStorage.getItem("bookly_flash_aviso");
    if (flashAviso) {
      sessionStorage.removeItem("bookly_flash_aviso");
      showToast(flashAviso, "warning");
    }
    const flashErro = sessionStorage.getItem("bookly_flash_erro");
    if (flashErro) {
      sessionStorage.removeItem("bookly_flash_erro");
      showToast(flashErro, "error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checarFlash);
  } else {
    checarFlash();
  }
})();
