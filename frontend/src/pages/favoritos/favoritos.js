const listaEl = document.getElementById("favoritos-lista");
const statusEl = document.getElementById("favoritos-status");
const template = document.getElementById("favorito-card-template");

const CORES_CAPA = ["#5b6ee1", "#e2637b", "#3fae7a", "#d1a13c", "#8158d6", "#3ea0c9"];

function corParaTitulo(titulo) {
  const soma = [...(titulo || "?")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CORES_CAPA[soma % CORES_CAPA.length];
}

// Capa "placeholder" (SVG em data-URI) usada quando o anúncio não tem foto.
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
  return `R$${Number(valor || 0).toFixed(2).replace(".", ",")}`;
}

function renderizarFavoritos(favoritos) {
  listaEl.innerHTML = "";

  if (favoritos.length === 0) {
    statusEl.hidden = false;
    statusEl.textContent = "Você ainda não favoritou nenhum livro. Clique no coração de um livro no marketplace.";
    return;
  }
  statusEl.hidden = true;

  favoritos.forEach((fav) => {
    const card = template.content.cloneNode(true);

    card.querySelector(".favorito-cover img").src = fav.fotos_item || capaPlaceholder(fav.nome);
    card.querySelector(".favorito-titulo").textContent = fav.nome;
    card.querySelector(".favorito-autor").textContent = fav.autor;
    card.querySelector(".favorito-preco").textContent = formatarPreco(fav.preco);
    card.querySelector(".favorito-meta").textContent =
      `${fav.categoria || "—"} · ${fav.conservacao || "—"} · ${fav.disponivel ? "Disponível" : "Vendido"}`;

    const btnComprar = card.querySelector(".btn-comprar");
    const btnRemover = card.querySelector(".btn-remover");
    btnComprar.dataset.idItem = fav.id_item;
    btnComprar.dataset.nome = fav.nome;
    btnRemover.dataset.idItem = fav.id_item;

    if (!fav.disponivel) {
      btnComprar.disabled = true;
      btnComprar.textContent = "Vendido";
    }

    listaEl.appendChild(card);
  });
}

function pegarComprador() {
  const idComprador = localStorage.getItem("bookly_usuario_id");
  const tipoUsuario = localStorage.getItem("bookly_usuario_tipo");
  return idComprador && tipoUsuario === "comprador" ? idComprador : null;
}

// =========================================================
// FUNCIONALIDADE: Listar favoritos
// GET /compradores/<id>/favoritos -> FavoritoController -> ListarFavoritosService -> Models
// =========================================================
async function carregarFavoritos() {
  const idComprador = pegarComprador();
  if (!idComprador) {
    statusEl.textContent = "Faça login como comprador para ver seus favoritos.";
    return;
  }

  try {
    statusEl.hidden = false;
    statusEl.textContent = "Carregando favoritos...";
    const favoritos = await apiRequest(`/compradores/${idComprador}/favoritos`);
    renderizarFavoritos(favoritos);
  } catch (erro) {
    statusEl.hidden = false;
    statusEl.textContent = "Não foi possível carregar seus favoritos agora.";
    console.error(erro);
  }
}

// =========================================================
// FUNCIONALIDADE: Remover favorito
// DELETE /compradores/<id>/favoritos/<id_item> -> FavoritoController -> RemoverFavoritoService
// =========================================================
async function removerFavorito(idItem) {
  const idComprador = pegarComprador();
  try {
    await apiRequest(`/compradores/${idComprador}/favoritos/${idItem}`, { method: "DELETE" });
    BooklyToast.info("Item removido dos favoritos.");
    carregarFavoritos();
  } catch (erro) {
    BooklyToast.error(erro.message);
  }
}

// Compra direta a partir dos favoritos (reaproveita POST /pedidos)
async function comprarFavorito(idItem, nome, botao) {
  const idComprador = pegarComprador();
  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = "Comprando...";

  try {
    await apiRequest("/pedidos", {
      method: "POST",
      body: { id_item: Number(idItem), id_comprador: Number(idComprador) },
    });
    BooklyToast.success(`Compra de "${nome}" registrada com sucesso!`, "Pedido Confirmado");
    carregarFavoritos();
  } catch (erro) {
    BooklyToast.error(erro.message, "Erro na Compra");
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

listaEl.addEventListener("click", (event) => {
  const btnRemover = event.target.closest(".btn-remover");
  if (btnRemover) {
    removerFavorito(btnRemover.dataset.idItem);
    return;
  }

  const btnComprar = event.target.closest(".btn-comprar");
  if (btnComprar && !btnComprar.disabled) {
    comprarFavorito(btnComprar.dataset.idItem, btnComprar.dataset.nome, btnComprar);
  }
});

carregarFavoritos();
