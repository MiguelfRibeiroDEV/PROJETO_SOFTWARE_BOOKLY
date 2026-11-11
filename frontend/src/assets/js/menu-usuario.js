/* =========================================================
   menu-usuario.js
   Menu do usuário logado (avatar + dropdown), compartilhado
   por todas as páginas que têm cabeçalho com <nav class="nav-right">.
   - Visitante (sem login): não faz nada (Log in / Sign up continuam).
   - Logado: remove Log in / Sign up e mostra o avatar com o menu.
   Carregar DEPOIS do api.js:
     <script src="../../assets/js/api.js"></script>
     <script src="../../assets/js/menu-usuario.js"></script>
========================================================= */
(function () {
  const script = document.currentScript;
  // pasta "src/" do front-end (este arquivo está em src/assets/js/)
  const RAIZ = new URL("../../", script.src).href;

  const CHAVES = [
    "bookly_usuario_id",
    "bookly_usuario_tipo",
    "bookly_usuario_email",
    "bookly_usuario_nome",
    "bookly_usuario_foto",
    "bookly_livreiro_id",
  ];

  // Opções do menu por tipo de conta.
  const OPCOES = {
    comprador: [
      { rotulo: "Explorar Marketplace", caminho: "pages/marketplace/marketplace.html" },
      { rotulo: "Meu perfil", caminho: "pages/perfil/perfil.html" },
      { rotulo: "Meus pedidos", caminho: "pages/meus-pedidos/meus-pedidos.html" },
      { rotulo: "Favoritos", caminho: "pages/favoritos/favoritos.html" },
      { rotulo: "Carrinho", caminho: "pages/carrinho/carrinho.html" },
    ],
    livreiro: [
      { rotulo: "Explorar Marketplace", caminho: "pages/marketplace/marketplace.html" },
      { rotulo: "Meu perfil", caminho: "pages/perfil/perfil.html" },
      { rotulo: "Painel de vendas", caminho: "pages/painel-vendedor/painel.html" },
      { rotulo: "Meu catálogo", caminho: "pages/meu-catalogo/meu-catalogo.html" },
      { rotulo: "Vender livro", caminho: "pages/cadastro-livro/cadastro.html" },
      { rotulo: "Relatório de vendas", caminho: "pages/relatorio-vendas/relatorio-vendas.html" },
      { rotulo: "Perguntas recebidas", caminho: "pages/perguntas/perguntas.html" },
    ],
  };

  // Cores de fundo do avatar sem foto (tons claros: a inicial escura fica legível).
  // A cor é escolhida pelo nome, então a mesma pessoa sempre tem a mesma cor.
  const CORES_AVATAR = [
    "#fbe98a", "#ff9a76", "#8ec5ff", "#a8e6a3",
    "#f4a6c9", "#c3b1ff", "#7fdbd0", "#ffc86b",
  ];

  function corDoAvatar(nome) {
    const texto = String(nome || "?").trim().toLowerCase();
    let soma = 0;
    for (let i = 0; i < texto.length; i++) soma += texto.charCodeAt(i) * (i + 1);
    return CORES_AVATAR[soma % CORES_AVATAR.length];
  }

  const ROTULO_TIPO = { comprador: "Comprador", livreiro: "Livreiro" };

  const ler = (chave) => {
    try { return localStorage.getItem(chave); } catch (e) { return null; }
  };
  const gravar = (chave, valor) => {
    try {
      if (valor) localStorage.setItem(chave, valor);
      else localStorage.removeItem(chave);
    } catch (e) { /* storage indisponível: segue sem cache */ }
  };

  const tipo = ler("bookly_usuario_tipo");
  const id = ler("bookly_usuario_id");
  if (!tipo || !id || !OPCOES[tipo]) return; // visitante

  const nav = document.querySelector(".nav-right");
  if (!nav) return;

  // CSS do menu (carregado automaticamente, não precisa de <link> em cada página)
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = RAIZ + "styles/base/menu-usuario.css";
  document.head.appendChild(css);

  // Logado: some o Log in / Sign up
  ["nav-login", "nav-signup"].forEach((idEl) => {
    const el = document.getElementById(idEl);
    if (el) el.remove();
  });

  // ---------- monta o componente ----------
  const caixa = document.createElement("div");
  caixa.className = "user-menu";

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "user-avatar";
  botao.setAttribute("aria-haspopup", "true");
  botao.setAttribute("aria-expanded", "false");
  botao.setAttribute("aria-label", "Menu do usuário");

  const dropdown = document.createElement("div");
  dropdown.className = "user-dropdown";
  dropdown.hidden = true;

  const cabecalho = document.createElement("div");
  cabecalho.className = "user-dropdown-head";
  const nomeEl = document.createElement("strong");
  const infoEl = document.createElement("small");
  cabecalho.append(nomeEl, infoEl);
  dropdown.appendChild(cabecalho);

  OPCOES[tipo].forEach((op) => {
    const a = document.createElement("a");
    a.className = "user-dropdown-item";
    a.href = RAIZ + op.caminho;
    a.textContent = op.rotulo;
    dropdown.appendChild(a);
  });

  const separador = document.createElement("div");
  separador.className = "user-dropdown-sep";
  dropdown.appendChild(separador);

  // Opção rápida de alternar tema exclusivamente no dropdown
  const itemTema = document.createElement("button");
  itemTema.type = "button";
  itemTema.className = "user-dropdown-item";
  
  function atualizarTextoTema() {
    const tema = (window.BooklyTheme ? window.BooklyTheme.get() : "dark");
    if (tema === "dark") {
      itemTema.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <span>Modo claro</span>
      `;
    } else {
      itemTema.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <span>Modo escuro</span>
      `;
    }
  }

  atualizarTextoTema();
  window.addEventListener("bookly_theme_changed", atualizarTextoTema);

  itemTema.addEventListener("click", () => {
    if (window.BooklyTheme) {
      window.BooklyTheme.toggle();
      atualizarTextoTema();
    }
  });
  dropdown.appendChild(itemTema);

  const sair = document.createElement("button");
  sair.type = "button";
  sair.className = "user-dropdown-item user-dropdown-sair";
  sair.textContent = "Sair";
  dropdown.appendChild(sair);

  // Remove eventuais atalhos legados
  nav.querySelectorAll(".nav-shortcut").forEach((el) => el.remove());

  // Se não estivermos na página do Marketplace, garante o botão de retorno visível e claro
  const naPaginaMarketplace = window.location.pathname.endsWith("marketplace.html");
  if (!naPaginaMarketplace && !nav.querySelector(".btn-voltar-marketplace")) {
    const btnVoltar = document.createElement("a");
    btnVoltar.className = "btn-voltar-marketplace";
    btnVoltar.href = RAIZ + "pages/marketplace/marketplace.html";
    btnVoltar.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      <span>Marketplace</span>
    `;
    nav.insertBefore(btnVoltar, nav.firstChild);
  }

  // Ícone discreto de carrinho apenas para compradores (e não na própria página do carrinho)
  const naPaginaCarrinho = window.location.pathname.endsWith("carrinho.html");
  if (tipo === "comprador" && !naPaginaCarrinho && !nav.querySelector(".nav-cart-btn")) {
    const btnCart = document.createElement("a");
    btnCart.className = "nav-cart-btn";
    btnCart.href = RAIZ + "pages/carrinho/carrinho.html";
    btnCart.setAttribute("aria-label", "Meu Carrinho");
    btnCart.title = "Meu Carrinho";
    btnCart.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    `;
    nav.appendChild(btnCart);
  }

  caixa.append(botao, dropdown);
  nav.appendChild(caixa);

  // Garante que o theme.js seja carregado caso a página ainda não o tenha
  if (!window.BooklyTheme) {
    const scriptTheme = document.createElement("script");
    scriptTheme.src = RAIZ + "assets/js/theme.js";
    document.head.appendChild(scriptTheme);
  }

  // ---------- preenchimento (nome, e-mail, foto/inicial) ----------
  function atualizar() {
    const nome = ler("bookly_usuario_nome") || "Usuário";
    const email = ler("bookly_usuario_email") || "";
    const foto = ler("bookly_usuario_foto");

    nomeEl.textContent = nome;
    infoEl.textContent = (email ? email + " · " : "") + ROTULO_TIPO[tipo];

    botao.textContent = "";
    if (foto) {
      const img = document.createElement("img");
      img.src = foto;
      img.alt = "Foto de perfil";
      botao.appendChild(img);
    } else {
      botao.textContent = nome.trim().charAt(0).toUpperCase() || "?";
    }
    botao.style.backgroundColor = foto ? "transparent" : corDoAvatar(nome);
  }

  // ---------- abrir / fechar ----------
  function abrir(aberto) {
    dropdown.hidden = !aberto;
    botao.setAttribute("aria-expanded", String(aberto));
  }

  botao.addEventListener("click", (e) => {
    e.stopPropagation();
    abrir(dropdown.hidden);
  });
  document.addEventListener("click", (e) => {
    if (!caixa.contains(e.target)) abrir(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") abrir(false);
  });

  // ---------- logout ----------
  sair.addEventListener("click", () => {
    CHAVES.forEach((chave) => gravar(chave, null));
    window.location.href = RAIZ + "pages/marketplace/marketplace.html";
  });

  // ---------- sincroniza com o servidor (foto/nome atuais) ----------
  async function sincronizar() {
    if (typeof apiRequest !== "function") return;
    try {
      const perfil = await apiRequest(`/perfil/${tipo}/${id}`);
      gravar("bookly_usuario_nome", perfil.primeiro_nome);
      gravar("bookly_usuario_foto", perfil.foto_perfil);
      atualizar();
    } catch (e) { /* offline/erro: mantém o que está em cache */ }
  }

  // permite que a página de perfil atualize o avatar após salvar
  window.BooklyMenu = { atualizar, corDoAvatar };

  atualizar();
  sincronizar();
})();
