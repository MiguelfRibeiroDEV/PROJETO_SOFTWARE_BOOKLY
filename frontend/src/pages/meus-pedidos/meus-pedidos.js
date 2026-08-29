const statusEl = document.getElementById("pedidos-status");
const listaEl = document.getElementById("pedidos-lista");
const template = document.getElementById("pedido-card-template");

function formatarPreco(valor) {
  return `R$${Number(valor).toFixed(2).replace(".", ",")}`;
}

function renderizarPedidos(pedidos) {
  listaEl.innerHTML = "";

  if (pedidos.length === 0) {
    statusEl.hidden = false;
    statusEl.textContent = "Você ainda não comprou nenhum livro.";
    return;
  }
  statusEl.hidden = true;

  pedidos.forEach((pedido) => {
    const card = template.content.cloneNode(true);
    card.querySelector(".pedido-livro").textContent = pedido.livro_nome || "Livro";
    card.querySelector(".pedido-autor").textContent = pedido.livro_autor || "";
    card.querySelector(".pedido-detalhes").textContent =
      `Condição: ${pedido.conservacao || "—"} · Edição: ${pedido.edicao || "—"}`;
    card.querySelector(".pedido-preco").textContent = formatarPreco(pedido.preco);
    listaEl.appendChild(card);
  });
}

async function carregarPedidos() {
  const idComprador = localStorage.getItem("bookly_usuario_id");
  const tipoUsuario = localStorage.getItem("bookly_usuario_tipo");

  if (!idComprador || tipoUsuario !== "comprador") {
    statusEl.textContent = "Faça login como comprador para ver seus pedidos.";
    return;
  }

  try {
    statusEl.hidden = false;
    statusEl.textContent = "Carregando pedidos...";

    const pedidos = await apiRequest(`/compradores/${idComprador}/pedidos`);
    renderizarPedidos(pedidos);
  } catch (erro) {
    statusEl.hidden = false;
    statusEl.textContent = "Não foi possível carregar seus pedidos agora.";
    console.error(erro);
  }
}

carregarPedidos();
