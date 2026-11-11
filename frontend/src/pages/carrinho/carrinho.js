const tipo = localStorage.getItem("bookly_usuario_tipo");
const idComprador = localStorage.getItem("bookly_usuario_id");

const subtituloEl = document.getElementById("carrinho-subtitle");
const msgEl = document.getElementById("carrinho-msg");
const layoutEl = document.getElementById("carrinho-layout");
const vazioEl = document.getElementById("carrinho-vazio");
const listaEl = document.getElementById("carrinho-lista");
const template = document.getElementById("carrinho-item-template");
const btnFinalizar = document.getElementById("btn-finalizar");

const CORES_CAPA = ["#5b6ee1", "#e2637b", "#3fae7a", "#d1a13c", "#8158d6", "#3ea0c9"];

function capaPlaceholder(titulo) {
  const soma = [...(titulo || "?")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cor = CORES_CAPA[soma % CORES_CAPA.length];
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

function mostrarMensagem(texto, erro = false) {
  msgEl.textContent = texto;
  msgEl.className = "carrinho-msg " + (erro ? "carrinho-msg-erro" : "carrinho-msg-ok");
  msgEl.hidden = !texto;
}

function desenharGrupo(titulo) {
  const h = document.createElement("p");
  h.className = "carrinho-grupo";
  h.textContent = "Vendido por ";
  const b = document.createElement("b");
  b.textContent = titulo;
  h.appendChild(b);
  return h;
}

function desenharCarrinho(dados) {
  listaEl.textContent = "";

  if (dados.itens.length === 0) {
    layoutEl.hidden = true;
    vazioEl.hidden = false;
    subtituloEl.textContent = "Nenhum livro por aqui ainda.";
    return;
  }

  vazioEl.hidden = true;
  layoutEl.hidden = false;

  const nVendedores = dados.vendedores.length;
  subtituloEl.textContent =
    `${dados.quantidade} ${dados.quantidade === 1 ? "livro" : "livros"} de ` +
    `${nVendedores} ${nVendedores === 1 ? "vendedor" : "vendedores"}. ` +
    "Cada livro usado é único, por isso a quantidade é sempre 1.";

  // agrupa os itens por vendedor, na ordem em que aparecem
  const grupos = new Map();
  dados.itens.forEach((it) => {
    const chave = it.id_livreiro ?? "x";
    if (!grupos.has(chave)) grupos.set(chave, { nome: it.livreiro || "Vendedor", itens: [] });
    grupos.get(chave).itens.push(it);
  });

  grupos.forEach((grupo) => {
    listaEl.appendChild(desenharGrupo(grupo.nome));
    grupo.itens.forEach((it) => {
      const card = template.content.cloneNode(true);
      const raiz = card.querySelector(".carrinho-item");
      card.querySelector(".carrinho-capa img").src = it.fotos_item || capaPlaceholder(it.nome);
      card.querySelector(".carrinho-livro").textContent = it.nome;
      card.querySelector(".carrinho-autor").textContent = it.autor;
      card.querySelector(".carrinho-conservacao").textContent = it.disponivel
        ? (it.conservacao || "—")
        : "Indisponível (já foi vendido)";
      card.querySelector(".carrinho-valor").textContent = formatarPreco(it.preco);
      card.querySelector(".carrinho-remover").dataset.idItem = it.id_item;
      if (!it.disponivel) raiz.classList.add("indisponivel");
      listaEl.appendChild(card);
    });
  });

  // resumo
  const resumo = document.getElementById("resumo-vendedores");
  resumo.textContent = "";
  dados.vendedores.forEach((v) => {
    const linha = document.createElement("div");
    linha.className = "resumo-linha";
    const nome = document.createElement("span");
    nome.textContent = `${v.livreiro} (${v.quantidade} ${v.quantidade === 1 ? "livro" : "livros"})`;
    const valor = document.createElement("span");
    valor.textContent = formatarPreco(v.subtotal);
    linha.append(nome, valor);
    resumo.appendChild(linha);
  });
  document.getElementById("resumo-total").textContent = formatarPreco(dados.total);
  btnFinalizar.disabled = dados.quantidade === 0;
}

async function carregarCarrinho() {
  try {
    desenharCarrinho(await apiRequest(`/compradores/${idComprador}/carrinho`));
  } catch (erro) {
    subtituloEl.textContent = "";
    mostrarMensagem(erro.message || "Não foi possível carregar o carrinho agora.", true);
  }
}

listaEl.addEventListener("click", async (event) => {
  const botao = event.target.closest(".carrinho-remover");
  if (!botao) return;
  botao.disabled = true;
  try {
    await apiRequest(`/compradores/${idComprador}/carrinho/${botao.dataset.idItem}`, { method: "DELETE" });
    mostrarMensagem("");
    await carregarCarrinho();
  } catch (erro) {
    botao.disabled = false;
    mostrarMensagem(erro.message, true);
  }
});

btnFinalizar.addEventListener("click", async () => {
  btnFinalizar.disabled = true;
  const textoOriginal = btnFinalizar.textContent;
  btnFinalizar.textContent = "Finalizando...";
  try {
    const r = await apiRequest(`/compradores/${idComprador}/carrinho/finalizar`, { method: "POST" });
    let texto = `${r.mensagem} Total: ${formatarPreco(r.total)}. Veja em "Meus pedidos".`;
    if (r.falhas.length > 0) {
      texto += ` Não foi possível comprar: ${r.falhas.map((f) => `${f.nome} (${f.motivo})`).join("; ")}.`;
    }
    mostrarMensagem(texto, r.comprados.length === 0);
    await carregarCarrinho();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    btnFinalizar.textContent = textoOriginal;
    btnFinalizar.disabled = false;
  }
});

if (tipo !== "comprador" || !idComprador) {
  subtituloEl.textContent = "";
  mostrarMensagem("Faça login como comprador para usar o carrinho.", true);
} else {
  carregarCarrinho();
}
