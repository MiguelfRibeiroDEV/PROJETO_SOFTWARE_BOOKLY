const grid = document.getElementById("book-grid");
const statusEl = document.getElementById("storefront-status");
const template = document.getElementById("book-card-template");

let todosOsLivros = [];
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

    grid.appendChild(card);
  });
}

function aplicarFiltrosLocais() {
  const buscaLower = filtros.busca.trim().toLowerCase();

  const filtrados = todosOsLivros.filter((livro) => {
    const passaCategoria = !filtros.id_categoria || livro.id_categoria === filtros.id_categoria;
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
    carregarLivros();
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

function atualizarNavPorLogin() {
  const tipoUsuario = localStorage.getItem("bookly_usuario_tipo");

  if (tipoUsuario === "comprador") {
    document.getElementById("nav-meus-pedidos").hidden = false;
  } else if (tipoUsuario === "livreiro") {
    document.getElementById("nav-painel").hidden = false;
    document.getElementById("nav-catalogo").hidden = false;
  }

  if (tipoUsuario) {
    document.getElementById("nav-login").hidden = true;
    document.getElementById("nav-signup").hidden = true;
  }
}

atualizarNavPorLogin();
carregarCategoriasNoFiltro();
carregarLivros();
