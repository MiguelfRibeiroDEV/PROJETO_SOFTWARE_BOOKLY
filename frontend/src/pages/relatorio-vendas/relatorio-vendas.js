const tipo = localStorage.getItem("bookly_usuario_tipo");
const idLivreiro = localStorage.getItem("bookly_livreiro_id") || localStorage.getItem("bookly_usuario_id");

const statusEl = document.getElementById("rel-status");
const conteudoEl = document.getElementById("rel-conteudo");
let ultimoRelatorio = null;

function formatarMoeda(valor) {
  return `R$${Number(valor || 0).toFixed(2).replace(".", ",")}`;
}

function formatarData(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

function mostrarStatus(texto) {
  statusEl.textContent = texto;
  statusEl.hidden = !texto;
}

function celula(texto, classe) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (classe) td.className = classe;
  return td;
}

// ---------- gráfico de barras (receita por categoria) ----------
function desenharGrafico(categorias) {
  const box = document.getElementById("grafico-categorias");
  box.textContent = "";

  if (categorias.length === 0) {
    const p = document.createElement("p");
    p.className = "rel-vazio";
    p.textContent = "Nenhuma venda neste período.";
    box.appendChild(p);
    return;
  }

  const maior = Math.max(...categorias.map((c) => c.receita), 1);
  categorias.forEach((c) => {
    const linha = document.createElement("div");
    linha.className = "barra-linha";

    const nome = document.createElement("span");
    nome.className = "barra-nome";
    nome.textContent = c.categoria;
    nome.title = `${c.quantidade} livro(s)`;

    const trilho = document.createElement("div");
    trilho.className = "barra-trilho";
    const preenchimento = document.createElement("i");
    preenchimento.style.width = `${Math.max((c.receita / maior) * 100, 2)}%`;
    trilho.appendChild(preenchimento);

    const valor = document.createElement("span");
    valor.className = "barra-valor";
    valor.textContent = formatarMoeda(c.receita);

    linha.append(nome, trilho, valor);
    box.appendChild(linha);
  });
}

function desenharTabela(vendas) {
  const corpo = document.getElementById("tabela-vendas");
  corpo.textContent = "";

  if (vendas.length === 0) {
    const tr = document.createElement("tr");
    const td = celula("Nenhuma venda neste período.", "rel-vazio");
    td.colSpan = 5;
    tr.appendChild(td);
    corpo.appendChild(tr);
    return;
  }

  vendas.forEach((v) => {
    const tr = document.createElement("tr");
    tr.append(
      celula(formatarData(v.data_venda)),
      celula(v.livro),
      celula(v.categoria),
      celula(v.comprador),
      celula(formatarMoeda(v.preco), "valor"),
    );
    corpo.appendChild(tr);
  });
}

function desenharRelatorio(rel) {
  ultimoRelatorio = rel;
  document.getElementById("card-receita").textContent = formatarMoeda(rel.resumo.receita);
  document.getElementById("card-quantidade").textContent = rel.resumo.quantidade;
  document.getElementById("card-ticket").textContent = formatarMoeda(rel.resumo.ticket_medio);
  document.getElementById("card-lider").textContent = rel.resumo.categoria_lider || "-";
  desenharGrafico(rel.por_categoria);
  desenharTabela(rel.vendas);
  document.getElementById("btn-csv").disabled = rel.vendas.length === 0;
  conteudoEl.hidden = false;
}

// ---------- carregar ----------
async function gerarRelatorio() {
  const params = new URLSearchParams();
  const inicio = document.getElementById("data_inicio").value;
  const fim = document.getElementById("data_fim").value;
  const categoria = document.getElementById("id_categoria").value;
  if (inicio) params.set("data_inicio", inicio);
  if (fim) params.set("data_fim", fim);
  if (categoria) params.set("id_categoria", categoria);

  if (inicio && fim && inicio > fim) {
    mostrarStatus("A data inicial não pode ser maior que a data final.");
    conteudoEl.hidden = true;
    return;
  }

  const botao = document.getElementById("btn-gerar");
  botao.disabled = true;
  mostrarStatus("Gerando relatório...");
  try {
    const consulta = params.toString() ? `?${params}` : "";
    const rel = await apiRequest(`/livreiros/${idLivreiro}/relatorio-vendas${consulta}`);
    mostrarStatus("");
    desenharRelatorio(rel);
  } catch (erro) {
    conteudoEl.hidden = true;
    mostrarStatus(erro.message);
  } finally {
    botao.disabled = false;
  }
}

async function carregarCategorias() {
  try {
    const categorias = await apiRequest("/categorias");
    const select = document.getElementById("id_categoria");
    categorias.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id_categoria;
      opt.textContent = c.nome;
      select.appendChild(opt);
    });
  } catch (erro) {
    console.error("Não foi possível carregar as categorias:", erro);
  }
}

// ---------- exportar CSV ----------
function exportarCsv() {
  if (!ultimoRelatorio || ultimoRelatorio.vendas.length === 0) return;

  const aspas = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = [["Data", "Livro", "Autor", "Categoria", "Comprador", "Valor (R$)"].map(aspas).join(";")];
  ultimoRelatorio.vendas.forEach((v) => {
    linhas.push([
      formatarData(v.data_venda), v.livro, v.autor, v.categoria, v.comprador,
      Number(v.preco).toFixed(2).replace(".", ","),
    ].map(aspas).join(";"));
  });

  const blob = new Blob(["\uFEFF" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "relatorio-de-vendas.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  BooklyToast.success("Relatório CSV baixado com sucesso!");
}

document.getElementById("form-filtros").addEventListener("submit", (e) => {
  e.preventDefault();
  gerarRelatorio();
});

document.getElementById("btn-limpar").addEventListener("click", () => {
  document.getElementById("form-filtros").reset();
  gerarRelatorio();
});

document.getElementById("btn-csv").addEventListener("click", exportarCsv);

// ---------- início ----------
if (tipo !== "livreiro" || !idLivreiro) {
  mostrarStatus("Faça login como livreiro (vendedor) para ver o relatório de vendas.");
  document.getElementById("form-filtros").hidden = true;
} else {
  carregarCategorias();
  gerarRelatorio();
}
