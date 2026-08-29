const statusEl = document.getElementById("painel-status");
const cardsEl = document.getElementById("painel-cards");
const rankingTituloEl = document.getElementById("ranking-title");
const rankingTabelaEl = document.getElementById("ranking-tabela");
const template = document.getElementById("ranking-linha-template");

function formatarPreco(valor) {
  return `R$${Number(valor || 0).toFixed(2).replace(".", ",")}`;
}

function renderizarPainel(dados) {
  const { livreiro, ranking_livros: ranking } = dados;

  document.getElementById("card-registrados").textContent = livreiro.livros_registrados ?? 0;
  document.getElementById("card-vendidos").textContent = livreiro.livros_vendidos ?? 0;
  document.getElementById("card-faturado").textContent = formatarPreco(livreiro.total_faturado);
  cardsEl.hidden = false;

  rankingTabelaEl.innerHTML = "";

  if (!ranking || ranking.length === 0) {
    rankingTituloEl.hidden = true;
    rankingTabelaEl.innerHTML = '<p class="painel-status">Você ainda não cadastrou nenhum livro.</p>';
    return;
  }

  rankingTituloEl.hidden = false;
  ranking.forEach((linha) => {
    const item = template.content.cloneNode(true);
    item.querySelector(".ranking-nome").textContent = linha.nome;
    item.querySelector(".ranking-autor").textContent = linha.autor;
    item.querySelector(".ranking-anunciados").textContent = `${linha.itens_anunciados} anunciado(s)`;
    item.querySelector(".ranking-vendidos").textContent = `${linha.itens_vendidos} vendido(s)`;
    item.querySelector(".ranking-receita").textContent = formatarPreco(linha.receita_total);
    rankingTabelaEl.appendChild(item);
  });
}

async function carregarPainel() {
  const idLivreiro = localStorage.getItem("bookly_livreiro_id") || localStorage.getItem("bookly_usuario_id");
  const tipoUsuario = localStorage.getItem("bookly_usuario_tipo");

  if (!idLivreiro || tipoUsuario !== "livreiro") {
    statusEl.textContent = "Faça login como livreiro (vendedor) para ver seu painel.";
    return;
  }

  try {
    statusEl.hidden = false;
    statusEl.textContent = "Carregando painel...";

    const dados = await apiRequest(`/livreiros/${idLivreiro}/dashboard`);
    statusEl.hidden = true;
    renderizarPainel(dados);
  } catch (erro) {
    statusEl.hidden = false;
    statusEl.textContent = "Não foi possível carregar o painel agora.";
    console.error(erro);
  }
}

carregarPainel();
