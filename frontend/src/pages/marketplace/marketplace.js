const grid = document.getElementById("book-grid");
const statusEl = document.getElementById("storefront-status");
const template = document.getElementById("book-card-template");

let todosOsLivros = [];
let favoritosIds = new Set();
let carrinhoIds = new Set();
const filtros = { id_categoria: "", preco_max: 789, busca: "", conservacao: "", idioma: "" };

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
    statusEl.textContent = "Nenhum livro encontrado com esses filtros.";
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
  const buscaLower = filtros.busca.trim().toLowerCase();

  const filtrados = todosOsLivros.filter((livro) => {
    const passaCategoria = !filtros.id_categoria || Number(livro.id_categoria) === Number(filtros.id_categoria);
    const passaPreco = Number(livro.preco) <= Number(filtros.preco_max);
    const passaConservacao = !filtros.conservacao || livro.conservacao === filtros.conservacao;
    const passaIdioma = !filtros.idioma || livro.idioma === filtros.idioma;
    const passaBusca =
      !buscaLower ||
      livro.nome.toLowerCase().includes(buscaLower) ||
      livro.autor.toLowerCase().includes(buscaLower);
    return passaCategoria && passaPreco && passaConservacao && passaIdioma && passaBusca;
  });

  renderizarLivros(filtrados);
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
      a.href = "#";
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
slider.addEventListener("input", () => {
  filtros.preco_max = slider.value;
  document.getElementById("preco-max-label").textContent = `R$${slider.value}`;
  aplicarFiltrosLocais();
});

document.getElementById("search-btn").addEventListener("click", buscar);
document.getElementById("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") buscar();
});

function buscar() {
  filtros.busca = document.getElementById("search-input").value;
  aplicarFiltrosLocais();
}

// =========================================================
// FUNCIONALIDADE: Registrar Pedido (comprar um item)
// POST /pedidos -> Controller -> RegistrarPedidoService -> Models
// =========================================================
async function comprarItem(idItem, nomeLivro, botao) {
  const idComprador = localStorage.getItem("bookly_usuario_id");
  const tipoUsuario = localStorage.getItem("bookly_usuario_tipo");

  if (!idComprador || tipoUsuario !== "comprador") {
    alert("Faça login como comprador para finalizar a compra.");
    window.location.href = "../login/login.html";
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

    alert(`Compra de "${nomeLivro}" registrada com sucesso!`);
    carrinhoIds.delete(Number(idItem));
    carregarLivros();
    carregarFavoritos();
  } catch (erro) {
    alert(erro.message);
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
    alert("Faça login como comprador para favoritar livros.");
    window.location.href = "../login/login.html";
    return;
  }

  const idItem = Number(botao.dataset.idItem);
  const jaFavorito = favoritosIds.has(idItem);

  try {
    if (jaFavorito) {
      await apiRequest(`/compradores/${idComprador}/favoritos/${idItem}`, { method: "DELETE" });
      favoritosIds.delete(idItem);
    } else {
      await apiRequest(`/compradores/${idComprador}/favoritos`, {
        method: "POST",
        body: { id_item: idItem },
      });
      favoritosIds.add(idItem);
    }
    marcarCoracao(botao, !jaFavorito);
  } catch (erro) {
    alert(erro.message);
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
    alert("Faça login como comprador para usar o carrinho.");
    window.location.href = "../login/login.html";
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
  } catch (erro) {
    alert(erro.message);
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

carregarCategoriasNoFiltro();
carregarLivros();
carregarCarrinho();
carregarFavoritos();
