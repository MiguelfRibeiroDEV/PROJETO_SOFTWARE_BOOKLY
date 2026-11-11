const grid = document.getElementById("book-grid");
const statusEl = document.getElementById("storefront-status");
const template = document.getElementById("book-card-template");

let todosOsLivros = [];
let favoritosIds = new Set();
let carrinhoIds = new Set();
const filtros = { id_categoria: "", preco_min: 0, preco_max: 999999, busca: "", conservacao: "", idioma: "" };
let precoLimites = { min: 0, max: 999999 };

const CORES_CAPA = ["#5b6ee1", "#e2637b", "#3fae7a", "#d1a13c", "#8158d6", "#3ea0c9"];

function corParaTitulo(titulo) {
  const soma = [...(titulo || "?")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CORES_CAPA[soma % CORES_CAPA.length];
}

// Gera uma capa "placeholder" offline (SVG em data-URI) já que o backend
// ainda não retorna URLs de imagens reais na rota de filtro de livros.
function capaPlaceholder(titulo) {
  const cor = corParaTitulo(titulo);
  const inicial = (titulo || "?").trim().charAt(0).toUpperCase() || "?";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">
      <rect width="300" height="400" fill="${cor}"/>
      <text x="50%" y="54%" font-size="120" font-family="Arial, sans-serif"
            fill="white" fill-opacity="0.85" text-anchor="middle" dominant-baseline="middle">${inicial}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function formatarPreco(valor) {
  return `R$${Number(valor).toFixed(2).replace(".", ",")}`;
}

function renderizarLivros(lista) {
  grid.innerHTML = "";

  if (lista.length === 0) {
    statusEl.hidden = false;
    statusEl.innerHTML = `
      <div style="padding: 36px 20px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: 14px; border: 1px solid var(--border-color);">
        <p style="font-size: 1.05rem; margin-bottom: 12px; color: var(--text-main); font-weight: 600;">Nenhum livro encontrado com esses filtros.</p>
        <p style="font-size: 0.88rem; margin-bottom: 16px; color: var(--text-muted);">Tente ajustar as palavras-chave ou remover os filtros aplicados.</p>
        <button type="button" class="btn btn-outline btn-sm" id="btn-limpar-filtros">Limpar todos os filtros</button>
      </div>
    `;
    const btnLimpar = document.getElementById("btn-limpar-filtros");
    if (btnLimpar) {
      btnLimpar.addEventListener("click", () => {
        limparTodosOsFiltros();
      });
    }
    return;
  }
  statusEl.hidden = true;

  lista.forEach((livro) => {
    const card = template.content.cloneNode(true);

    card.querySelector(".book-cover img").src = livro.fotos_item || capaPlaceholder(livro.nome);
    card.querySelector(".book-title").textContent = livro.nome;
    card.querySelector(".book-price").textContent = formatarPreco(livro.preco);
    card.querySelector(".book-author").textContent = livro.autor;
    card.querySelector(".book-meta").textContent = `${livro.categoria} · ${livro.conservacao || "—"}`;
    card.querySelector(".btn-buy-now").dataset.idItem = livro.id_item;
    card.querySelector(".btn-buy-now").dataset.nome = livro.nome;
    const btnFavorito = card.querySelector(".btn-favorito");
    btnFavorito.dataset.idItem = livro.id_item;
    marcarCoracao(btnFavorito, favoritosIds.has(Number(livro.id_item)));
    const btnCarrinho = card.querySelector(".btn-add-cart");
    btnCarrinho.dataset.idItem = livro.id_item;
    marcarCarrinho(btnCarrinho, carrinhoIds.has(Number(livro.id_item)));
    const btnPerguntar = card.querySelector(".btn-perguntar");
    btnPerguntar.dataset.idItem = livro.id_item;
    btnPerguntar.dataset.nome = livro.nome;

    grid.appendChild(card);
  });
}

function aplicarFiltrosLocais() {
  const buscaLower = (filtros.busca || "").trim().toLowerCase();
  const selectElem = document.getElementById("search-select");
  const tipoBusca = selectElem ? selectElem.value : "all";

  const filtrados = todosOsLivros.filter((livro) => {
    const passaCategoria = !filtros.id_categoria || Number(livro.id_categoria) === Number(filtros.id_categoria);
    const preco = Number(livro.preco || 0);
    const passaPreco = preco >= Number(filtros.preco_min) && preco <= Number(filtros.preco_max);
    const passaConservacao = !filtros.conservacao || livro.conservacao === filtros.conservacao;
    const passaIdioma = !filtros.idioma || livro.idioma === filtros.idioma;
    
    let passaBusca = true;
    if (buscaLower) {
      const nome = (livro.nome || "").toLowerCase();
      const autor = (livro.autor || "").toLowerCase();
      if (tipoBusca === "titulo") {
        passaBusca = nome.includes(buscaLower);
      } else if (tipoBusca === "autor") {
        passaBusca = autor.includes(buscaLower);
      } else {
        passaBusca = nome.includes(buscaLower) || autor.includes(buscaLower);
      }
    }
    return passaCategoria && passaPreco && passaConservacao && passaIdioma && passaBusca;
  });

  renderizarLivros(filtrados);
  return filtrados;
}

async function carregarLivros() {
  try {
    statusEl.hidden = false;
    statusEl.textContent = "Carregando livros...";

    // A procedure sp_buscar_livros_filtro já devolve nome da categoria e
    // do livreiro junto com o preço do item, ideal para a vitrine.
    todosOsLivros = await apiRequest("/livros/filtro");
    aplicarFiltrosLocais();
  } catch (erro) {
    statusEl.hidden = false;
    statusEl.textContent = "Não foi possível carregar os livros agora. Verifique se o backend está rodando.";
    console.error(erro);
  }
}

async function carregarCategoriasNoFiltro() {
  const lista = document.getElementById("filtro-categoria");
  try {
    const categorias = await apiRequest("/categorias");
    categorias.forEach((cat) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "javascript:void(0)";
      a.setAttribute("role", "button");
      a.textContent = cat.nome;
      a.dataset.idCategoria = cat.id_categoria;
      li.appendChild(a);
      lista.appendChild(li);
    });
  } catch (erro) {
    console.error("Não foi possível carregar categorias no filtro:", erro);
  }
}

document.getElementById("filtro-categoria").addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  event.preventDefault();

  document.querySelectorAll("#filtro-categoria a").forEach((a) => a.classList.remove("active"));
  link.classList.add("active");

  filtros.id_categoria = link.dataset.idCategoria || "";
  aplicarFiltrosLocais();
});

document.getElementById("filtro-condicao").addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  event.preventDefault();

  document.querySelectorAll("#filtro-condicao a").forEach((a) => a.classList.remove("active"));
  link.classList.add("active");

  filtros.conservacao = link.dataset.conservacao || "";
  aplicarFiltrosLocais();
});

document.getElementById("filtro-idioma").addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  event.preventDefault();

  document.querySelectorAll("#filtro-idioma a").forEach((a) => a.classList.remove("active"));
  link.classList.add("active");

  filtros.idioma = link.dataset.idioma || "";
  aplicarFiltrosLocais();
});

const slider = document.getElementById("preco-slider");
const precoMinInput = document.getElementById("preco-min-input");
const precoMaxInput = document.getElementById("preco-max-input");
const btnAplicarPreco = document.getElementById("btn-aplicar-preco");
const btnLimparPreco = document.getElementById("btn-limpar-preco");

function aplicarFiltroPreco(mostrarFeedback = true) {
  let min = precoMinInput && precoMinInput.value !== "" ? Number(precoMinInput.value) : (precoLimites.min || 0);
  let max = precoMaxInput && precoMaxInput.value !== "" ? Number(precoMaxInput.value) : (Number(slider ? slider.value : 500) || precoLimites.max || 500);

  if (min < 0) min = 0;
  if (max < min) {
    const temp = min;
    min = max;
    max = temp;
  }
  if (precoMinInput) precoMinInput.value = min;
  if (precoMaxInput) precoMaxInput.value = max;

  filtros.preco_min = min;
  filtros.preco_max = max;

  if (slider) slider.value = Math.min(max, Number(slider.max || 500));
  const maxLabel = document.getElementById("preco-max-label");
  if (maxLabel) maxLabel.textContent = `R$${max}`;

  const filtrados = aplicarFiltrosLocais();

  if (mostrarFeedback && window.BooklyToast) {
    BooklyToast.info(`Filtro aplicado: ${filtrados.length} livro(s) encontrado(s).`);
  }
}

function limparFiltroPreco() {
  // Limpa apenas os filtros da barra lateral, mantendo a busca da barra superior independente
  filtros.id_categoria = "";
  document.querySelectorAll("#filtro-categoria a").forEach((a) => a.classList.remove("active"));
  const catTodos = document.querySelector('#filtro-categoria a[data-id-categoria=""]');
  if (catTodos) catTodos.classList.add("active");

  filtros.conservacao = "";
  document.querySelectorAll("#filtro-condicao a").forEach((a) => a.classList.remove("active"));
  const condTodos = document.querySelector('#filtro-condicao a[data-conservacao=""]');
  if (condTodos) condTodos.classList.add("active");

  filtros.idioma = "";
  document.querySelectorAll("#filtro-idioma a").forEach((a) => a.classList.remove("active"));
  const idioTodos = document.querySelector('#filtro-idioma a[data-idioma=""]');
  if (idioTodos) idioTodos.classList.add("active");

  const minDefault = precoLimites.min || 0;
  const maxDefault = Math.max(500, precoLimites.max || 500);

  filtros.preco_min = minDefault;
  filtros.preco_max = maxDefault;

  if (slider) {
    slider.min = minDefault;
    slider.max = maxDefault;
    slider.value = maxDefault;
  }
  if (precoMinInput) precoMinInput.value = minDefault;
  if (precoMaxInput) precoMaxInput.value = maxDefault;

  const precoMinLabel = document.getElementById("preco-min-label");
  const precoMaxLabel = document.getElementById("preco-max-label");
  if (precoMinLabel) precoMinLabel.textContent = `R$${minDefault}`;
  if (precoMaxLabel) precoMaxLabel.textContent = `R$${maxDefault}`;

  aplicarFiltrosLocais();

  if (window.BooklyToast) {
    BooklyToast.info("Filtros laterais resetados.");
  }
}

function limparTodosOsFiltros() {
  // 1. Limpar barra de busca superior e esconder botão X
  const searchInput = document.getElementById("search-input");
  const searchClearBtn = document.getElementById("search-clear-btn");
  if (searchInput) searchInput.value = "";
  if (searchClearBtn) searchClearBtn.hidden = true;
  filtros.busca = "";

  // 2. Resetar filtros da barra lateral para "Todos"
  filtros.id_categoria = "";
  document.querySelectorAll("#filtro-categoria a").forEach((a) => a.classList.remove("active"));
  const catTodos = document.querySelector('#filtro-categoria a[data-id-categoria=""]');
  if (catTodos) catTodos.classList.add("active");

  filtros.conservacao = "";
  document.querySelectorAll("#filtro-condicao a").forEach((a) => a.classList.remove("active"));
  const condTodos = document.querySelector('#filtro-condicao a[data-conservacao=""]');
  if (condTodos) condTodos.classList.add("active");

  filtros.idioma = "";
  document.querySelectorAll("#filtro-idioma a").forEach((a) => a.classList.remove("active"));
  const idioTodos = document.querySelector('#filtro-idioma a[data-idioma=""]');
  if (idioTodos) idioTodos.classList.add("active");

  // 3. Resetar os DOIS campos de preço (Mín R$ e Máx R$), slider e labels
  const minDefault = precoLimites.min || 0;
  const maxDefault = Math.max(500, precoLimites.max || 500);

  filtros.preco_min = minDefault;
  filtros.preco_max = maxDefault;

  if (precoMinInput) precoMinInput.value = minDefault;
  if (precoMaxInput) precoMaxInput.value = maxDefault;

  if (slider) {
    slider.min = minDefault;
    slider.max = maxDefault;
    slider.value = maxDefault;
  }

  const precoMinLabel = document.getElementById("preco-min-label");
  const precoMaxLabel = document.getElementById("preco-max-label");
  if (precoMinLabel) precoMinLabel.textContent = `R$${minDefault}`;
  if (precoMaxLabel) precoMaxLabel.textContent = `R$${maxDefault}`;

  // 4. Reaplicar e mostrar todos os livros
  aplicarFiltrosLocais();

  if (window.BooklyToast) {
    BooklyToast.info("Todos os filtros foram limpos.");
  }
}

if (slider) {
  slider.addEventListener("input", () => {
    document.getElementById("preco-max-label").textContent = `R$${slider.value}`;
    if (precoMaxInput) precoMaxInput.value = slider.value;
  });

  // Ao soltar o slider, aplica o filtro automaticamente
  slider.addEventListener("change", () => {
    aplicarFiltroPreco(false);
  });
}

if (btnAplicarPreco) {
  btnAplicarPreco.addEventListener("click", () => aplicarFiltroPreco(true));
}

if (btnLimparPreco) {
  btnLimparPreco.addEventListener("click", limparFiltroPreco);
}

[precoMinInput, precoMaxInput].forEach((input) => {
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        aplicarFiltroPreco(true);
      }
    });
  }
});

async function carregarFaixaPrecoDoBanco() {
  try {
    const faixa = await apiRequest("/itens/faixa-preco");
    const minReal = Math.floor(faixa.preco_min || 0);
    const maxReal = Math.ceil(faixa.preco_max || 100);

    // O máximo da barra do slider agora é de pelo menos 500 (ou o maior do banco se passar de 500)
    const maxSlider = Math.max(500, maxReal);

    precoLimites = { min: minReal, max: maxSlider };
    filtros.preco_min = minReal;
    filtros.preco_max = maxSlider;

    slider.min = minReal;
    slider.max = maxSlider;
    slider.value = maxSlider;

    document.getElementById("preco-min-label").textContent = `R$${minReal}`;
    document.getElementById("preco-max-label").textContent = `R$${maxSlider}`;

    if (precoMinInput) {
      precoMinInput.min = minReal;
      precoMinInput.placeholder = minReal;
      precoMinInput.value = minReal;
    }
    if (precoMaxInput) {
      precoMaxInput.placeholder = maxSlider;
      precoMaxInput.value = maxSlider;
    }
  } catch (e) {
    console.warn("Não foi possível carregar faixa de preço:", e);
    slider.min = 0;
    slider.max = 500;
    slider.value = 500;
    document.getElementById("preco-min-label").textContent = "R$0";
    document.getElementById("preco-max-label").textContent = "R$500";
    if (precoMinInput) precoMinInput.value = 0;
    if (precoMaxInput) precoMaxInput.value = 500;
  }
}

// =========================================================
// BARRA DE PESQUISA SUPERIOR (Independente dos filtros laterais)
// =========================================================
const searchInput = document.getElementById("search-input");
const searchClearBtn = document.getElementById("search-clear-btn");
const searchSelect = document.getElementById("search-select");
const searchBtn = document.getElementById("search-btn");

function atualizarVisibilidadeClearBtn() {
  if (searchClearBtn && searchInput) {
    searchClearBtn.hidden = searchInput.value.trim().length === 0;
  }
}

function buscar() {
  if (searchInput) filtros.busca = searchInput.value;
  atualizarVisibilidadeClearBtn();
  // Busca não reseta nem altera os filtros laterais
  aplicarFiltrosLocais();
}

function limparBusca() {
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  atualizarVisibilidadeClearBtn();
  filtros.busca = "";
  // Não afeta os filtros laterais (categoria, conservação, idioma e preços permanecem ativos)
  aplicarFiltrosLocais();
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    atualizarVisibilidadeClearBtn();
    filtros.busca = searchInput.value;
    aplicarFiltrosLocais();
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscar();
    } else if (e.key === "Escape") {
      limparBusca();
    }
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    limparBusca();
  });
}

if (searchBtn) {
  searchBtn.addEventListener("click", buscar);
}

if (searchSelect) {
  searchSelect.addEventListener("change", () => {
    if (filtros.busca) {
      aplicarFiltrosLocais();
    }
  });
}

// =========================================================
// FUNCIONALIDADE: Registrar Pedido (comprar um item)
// POST /pedidos -> Controller -> RegistrarPedidoService -> Models
// =========================================================
async function comprarItem(idItem, nomeLivro, botao) {
  const idComprador = localStorage.getItem("bookly_usuario_id");
  const tipoUsuario = localStorage.getItem("bookly_usuario_tipo");

  if (!idComprador || tipoUsuario !== "comprador") {
    BooklyToast.warning("Faça login como comprador para finalizar a compra.", "Acesso Restrito", {
      action: { text: "Fazer Login", url: "../login/login.html" }
    });
    return;
  }

  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = "Comprando...";

  try {
    await apiRequest("/pedidos", {
      method: "POST",
      body: { id_item: Number(idItem), id_comprador: Number(idComprador) },
    });

    BooklyToast.success(`Compra de "${nomeLivro}" registrada com sucesso!`, "Pedido Confirmado");
    carrinhoIds.delete(Number(idItem));
    carregarLivros();
    carregarFavoritos();
  } catch (erro) {
    BooklyToast.error(erro.message, "Erro na Compra");
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

grid.addEventListener("click", (event) => {
  const botao = event.target.closest(".btn-buy-now");
  if (!botao) return;

  const { idItem, nome } = botao.dataset;
  comprarItem(idItem, nome, botao);
});


// =========================================================
// FUNCIONALIDADES: Favoritar / desfavoritar / listar favoritos
// =========================================================
function marcarCoracao(botao, ativo) {
  botao.classList.toggle("ativo", ativo);
  botao.innerHTML = ativo ? "&#9829;" : "&#9825;";
  botao.setAttribute("aria-label", ativo ? "Remover dos favoritos" : "Favoritar");
}

async function carregarFavoritos() {
  const idComprador = localStorage.getItem("bookly_usuario_id");
  if (localStorage.getItem("bookly_usuario_tipo") !== "comprador" || !idComprador) return;

  try {
    const favoritos = await apiRequest(`/compradores/${idComprador}/favoritos`);
    favoritosIds = new Set(favoritos.map((f) => Number(f.id_item)));
    if (todosOsLivros.length > 0) aplicarFiltrosLocais();
  } catch (erro) {
    console.error("Não foi possível carregar favoritos:", erro);
  }
}

async function alternarFavorito(botao) {
  const idComprador = localStorage.getItem("bookly_usuario_id");
  if (localStorage.getItem("bookly_usuario_tipo") !== "comprador" || !idComprador) {
    BooklyToast.warning("Faça login como comprador para favoritar livros.", "Acesso Restrito", {
      action: { text: "Fazer Login", url: "../login/login.html" }
    });
    return;
  }

  const idItem = Number(botao.dataset.idItem);
  const jaFavorito = favoritosIds.has(idItem);

  try {
    if (jaFavorito) {
      await apiRequest(`/compradores/${idComprador}/favoritos/${idItem}`, { method: "DELETE" });
      favoritosIds.delete(idItem);
      BooklyToast.info("Livro removido dos favoritos.");
    } else {
      await apiRequest(`/compradores/${idComprador}/favoritos`, {
        method: "POST",
        body: { id_item: idItem },
      });
      favoritosIds.add(idItem);
      BooklyToast.success("Livro adicionado aos favoritos!", "Favoritos");
    }
    marcarCoracao(botao, !jaFavorito);
  } catch (erro) {
    BooklyToast.error(erro.message);
  }
}

grid.addEventListener("click", (event) => {
  const botao = event.target.closest(".btn-favorito");
  if (botao) alternarFavorito(botao);
});


// =========================================================
// FUNCIONALIDADE: Carrinho de compras
// POST /compradores/<id>/carrinho -> Controller -> Service -> Model
// =========================================================
function marcarCarrinho(botao, ativo) {
  botao.classList.toggle("no-carrinho", ativo);
  botao.querySelector(".add-cart-texto").textContent = ativo ? "No carrinho" : "Add cart";
}

async function carregarCarrinho() {
  const idComprador = localStorage.getItem("bookly_usuario_id");
  if (localStorage.getItem("bookly_usuario_tipo") !== "comprador" || !idComprador) return;

  try {
    const carrinho = await apiRequest(`/compradores/${idComprador}/carrinho`);
    carrinhoIds = new Set(carrinho.itens.filter((i) => i.disponivel).map((i) => Number(i.id_item)));
    if (todosOsLivros.length > 0) aplicarFiltrosLocais();
  } catch (erro) {
    console.error("Não foi possível carregar o carrinho:", erro);
  }
}

async function adicionarAoCarrinho(botao) {
  const idComprador = localStorage.getItem("bookly_usuario_id");
  if (localStorage.getItem("bookly_usuario_tipo") !== "comprador" || !idComprador) {
    BooklyToast.warning("Faça login como comprador para usar o carrinho.", "Acesso Restrito", {
      action: { text: "Fazer Login", url: "../login/login.html" }
    });
    return;
  }

  const idItem = Number(botao.dataset.idItem);
  if (carrinhoIds.has(idItem)) {
    window.location.href = "../carrinho/carrinho.html";
    return;
  }

  botao.disabled = true;
  try {
    await apiRequest(`/compradores/${idComprador}/carrinho`, { method: "POST", body: { id_item: idItem } });
    carrinhoIds.add(idItem);
    marcarCarrinho(botao, true);
    BooklyToast.success("Item adicionado ao seu carrinho!", "Carrinho", {
      action: { text: "Ver Carrinho", url: "../carrinho/carrinho.html" }
    });
  } catch (erro) {
    BooklyToast.error(erro.message);
  } finally {
    botao.disabled = false;
  }
}

grid.addEventListener("click", (event) => {
  const botao = event.target.closest(".btn-add-cart");
  if (botao) adicionarAoCarrinho(botao);
});


// =========================================================
// FUNCIONALIDADE: Perguntas ao vendedor
// POST /itens/<id>/perguntas -> Controller -> Service -> Model
// =========================================================
const perguntaModal = document.getElementById("pergunta-modal");
const perguntaForm = document.getElementById("pergunta-form");
const perguntaTexto = document.getElementById("pergunta-texto");
const perguntaErro = document.getElementById("pergunta-erro");
const perguntaHistorico = document.getElementById("pergunta-historico");
let itemDaPergunta = null;

function mostrarErroPergunta(texto) {
  perguntaErro.textContent = texto;
  perguntaErro.hidden = !texto;
}

function desenharHistoricoPerguntas(perguntas) {
  perguntaHistorico.textContent = "";
  if (perguntas.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "pergunta-vazio";
    vazio.textContent = "Ninguém perguntou nada sobre este livro ainda. Seja o primeiro!";
    perguntaHistorico.appendChild(vazio);
    return;
  }

  perguntas.forEach((p) => {
    const bloco = document.createElement("div");
    bloco.className = "pergunta-item";

    const quem = document.createElement("p");
    quem.className = "pergunta-pergunta";
    const nome = document.createElement("b");
    nome.textContent = p.comprador + ": ";
    quem.append(nome, document.createTextNode(p.texto_pergunta));

    const resposta = document.createElement("p");
    resposta.className = p.texto_resposta ? "pergunta-resposta" : "pergunta-resposta pendente";
    resposta.textContent = p.texto_resposta ? "Vendedor: " + p.texto_resposta : "Aguardando resposta do vendedor";

    bloco.append(quem, resposta);
    perguntaHistorico.appendChild(bloco);
  });
}

async function abrirPergunta(botao) {
  itemDaPergunta = Number(botao.dataset.idItem);
  document.getElementById("pergunta-modal-livro").textContent = botao.dataset.nome;
  perguntaTexto.value = "";
  mostrarErroPergunta("");
  perguntaHistorico.textContent = "Carregando...";
  perguntaModal.hidden = false;
  perguntaTexto.focus();

  try {
    desenharHistoricoPerguntas(await apiRequest(`/itens/${itemDaPergunta}/perguntas`));
  } catch (erro) {
    perguntaHistorico.textContent = "Não foi possível carregar as perguntas.";
  }
}

function fecharPergunta() {
  perguntaModal.hidden = true;
  itemDaPergunta = null;
}

grid.addEventListener("click", (event) => {
  const botao = event.target.closest(".btn-perguntar");
  if (botao) abrirPergunta(botao);
});

document.getElementById("pergunta-fechar").addEventListener("click", fecharPergunta);
document.getElementById("pergunta-cancelar").addEventListener("click", fecharPergunta);
perguntaModal.addEventListener("click", (event) => {
  if (event.target === perguntaModal) fecharPergunta();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !perguntaModal.hidden) fecharPergunta();
});

perguntaForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const idComprador = localStorage.getItem("bookly_usuario_id");
  if (localStorage.getItem("bookly_usuario_tipo") !== "comprador" || !idComprador) {
    mostrarErroPergunta("Faça login como comprador para perguntar ao vendedor.");
    return;
  }

  const texto = perguntaTexto.value.trim();
  if (texto.length < 3) {
    mostrarErroPergunta("Escreva uma pergunta com pelo menos 3 caracteres.");
    return;
  }

  const botao = document.getElementById("pergunta-enviar");
  botao.disabled = true;
  try {
    await apiRequest(`/itens/${itemDaPergunta}/perguntas`, {
      method: "POST",
      body: { id_comprador: Number(idComprador), texto },
    });
    perguntaTexto.value = "";
    mostrarErroPergunta("");
    desenharHistoricoPerguntas(await apiRequest(`/itens/${itemDaPergunta}/perguntas`));
  } catch (erro) {
    mostrarErroPergunta(erro.message);
  } finally {
    botao.disabled = false;
  }
});

carregarFaixaPrecoDoBanco();
carregarCategoriasNoFiltro();
carregarLivros();
carregarCarrinho();
carregarFavoritos();
