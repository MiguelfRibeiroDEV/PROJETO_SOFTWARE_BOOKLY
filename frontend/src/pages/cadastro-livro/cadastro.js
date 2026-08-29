// =========================================================
// Estado do wizard
// =========================================================
let currentStep = 1;
const TOTAL_STEPS = 3;

const estado = {
  conservacao: "Médio",
  tipoCapa: "Capa dura",
  raridade: "Impressão limitada",
};

// TODO: quando o backend tiver autenticação/sessão real, troque esta
// constante por algo como Number(localStorage.getItem("bookly_livreiro_id")).
// Por enquanto usamos o livreiro de teste (id 1) semeado em create_database.sql.
const ID_LIVREIRO_ATUAL = Number(localStorage.getItem("bookly_livreiro_id")) || 1;

// =========================================================
// Guarda de acesso: só permite cadastrar livro se houver um
// livreiro (vendedor) de fato logado, evitando que a tela caia
// silenciosamente no livreiro de teste (id 1).
// =========================================================
(function garantirLivreiroLogado() {
  const idLivreiro = localStorage.getItem("bookly_livreiro_id");
  const tipoUsuario = localStorage.getItem("bookly_usuario_tipo");

  if (!idLivreiro || tipoUsuario !== "livreiro") {
    alert("Faça login como vendedor (livreiro) para cadastrar um livro.");
    window.location.href = "../login/login.html";
  }
})();

// =========================================================
// Navegação entre passos
// =========================================================
function atualizarIndicador() {
  document.querySelectorAll(".step").forEach((el) => {
    const n = Number(el.dataset.step);
    el.classList.remove("is-current", "is-done");
    if (n < currentStep) el.classList.add("is-done");
    if (n === currentStep) el.classList.add("is-current");
  });

  document.querySelectorAll(".step-line").forEach((el) => {
    const n = Number(el.dataset.line);
    el.classList.toggle("is-done", n < currentStep);
  });

  document.querySelectorAll(".step-panel").forEach((panel, i) => {
    panel.hidden = i + 1 !== currentStep;
  });

  document.getElementById("step-counter").textContent = `Passo ${currentStep} de ${TOTAL_STEPS}`;
  document.getElementById("btn-continuar").textContent = currentStep === TOTAL_STEPS ? "Registrar" : "Continuar";
  document.getElementById("wizard-title").textContent =
    currentStep === 1 ? "Cadastre seu livro" : "Estado e Detalhes do Exemplar";

  esconderErro();
}

function mostrarErro(mensagem) {
  const el = document.getElementById("wizard-error");
  el.textContent = mensagem;
  el.hidden = false;
}

function esconderErro() {
  document.getElementById("wizard-error").hidden = true;
}

function validarPasso1() {
  if (!document.getElementById("titulo").value.trim()) return "Informe o título do livro.";
  if (!document.getElementById("autores").value.trim()) return "Informe o(s) autor(es).";
  if (!document.getElementById("categoria").value) return "Escolha uma categoria.";
  const possuiIsbn = document.getElementById("possui-isbn").checked;
  if (possuiIsbn && !document.getElementById("isbn").value.trim()) return "Informe o ISBN ou marque 'não possui'.";
  return null;
}

function validarPasso3() {
  const preco = document.getElementById("preco-final").value;
  if (!preco || Number(preco) <= 0) return "Informe o preço final do exemplar.";
  return null;
}

document.getElementById("btn-voltar").addEventListener("click", () => {
  if (currentStep === 1) {
    window.location.href = "../marketplace/marketplace.html";
    return;
  }
  currentStep -= 1;
  atualizarIndicador();
});

document.getElementById("btn-continuar").addEventListener("click", async () => {
  let erro = null;
  if (currentStep === 1) erro = validarPasso1();
  if (currentStep === 3) erro = validarPasso3();

  if (erro) {
    mostrarErro(erro);
    return;
  }

  if (currentStep < TOTAL_STEPS) {
    currentStep += 1;
    atualizarIndicador();
    if (currentStep === 3) carregarRecomendacaoDePreco();
    return;
  }

  await registrarLivro();
});

// =========================================================
// ISBN: alterna entre "possui" / "não possui"
// =========================================================
const possuiIsbnEl = document.getElementById("possui-isbn");
const naoPossuiIsbnEl = document.getElementById("nao-possui-isbn");
const isbnInput = document.getElementById("isbn");

function sincronizarIsbn(origem) {
  if (origem === "possui" && possuiIsbnEl.checked) naoPossuiIsbnEl.checked = false;
  if (origem === "nao-possui" && naoPossuiIsbnEl.checked) possuiIsbnEl.checked = false;
  isbnInput.disabled = naoPossuiIsbnEl.checked;
  if (isbnInput.disabled) isbnInput.value = "";
}
possuiIsbnEl.addEventListener("change", () => sincronizarIsbn("possui"));
naoPossuiIsbnEl.addEventListener("change", () => sincronizarIsbn("nao-possui"));

// =========================================================
// Chips (passo 2): conservação / capa / raridade
// =========================================================
function configurarGrupoChip(seletor, chaveEstado, exclusivo = true) {
  const botoes = document.querySelectorAll(seletor);
  botoes.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (exclusivo) {
        botoes.forEach((b) => b.classList.remove("chip-selected"));
      }
      btn.classList.toggle("chip-selected");
      estado[chaveEstado] = btn.classList.contains("chip-selected") ? btn.dataset.value : null;
    });
  });
}

configurarGrupoChip("#conservacao-group .chip", "conservacao");
configurarGrupoChip("#capa-group .chip", "tipoCapa");
configurarGrupoChip("#raridade-group .chip", "raridade");

// =========================================================
// Foto do livro: lê o arquivo escolhido, redimensiona/comprime
// no navegador (para não estourar o tamanho salvo no banco) e
// guarda o resultado em base64 para enviar junto com o item.
// =========================================================
let fotoBase64 = null;

function comprimirImagem(arquivo, larguraMax = 500, qualidade = 0.75) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      imagem.onload = () => {
        const escala = Math.min(1, larguraMax / imagem.width);
        const canvas = document.createElement("canvas");
        canvas.width = imagem.width * escala;
        canvas.height = imagem.height * escala;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      imagem.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

document.getElementById("foto-input").addEventListener("change", async (event) => {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  try {
    fotoBase64 = await comprimirImagem(arquivo);

    const preview = document.getElementById("photo-preview");
    preview.src = fotoBase64;
    preview.hidden = false;
    document.getElementById("photo-icon").hidden = true;
  } catch (erro) {
    mostrarErro(erro.message);
    console.error(erro);
  }
});

// =========================================================
// Carrega categorias do backend (GET /categorias)
// =========================================================
async function carregarCategorias() {
  const select = document.getElementById("categoria");
  try {
    const categorias = await apiRequest("/categorias");
    categorias.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id_categoria;
      option.textContent = cat.nome;
      select.appendChild(option);
    });
  } catch (erro) {
    console.error("Não foi possível carregar categorias:", erro);
  }
}
carregarCategorias();

// =========================================================
// Passo 3: recomendação de preço a partir do relatório real
// (GET /relatorios/preco-medio-categoria) filtrado pela categoria
// escolhida no passo 1.
// =========================================================
async function carregarRecomendacaoDePreco() {
  const idCategoria = Number(document.getElementById("categoria").value);
  const chartEmpty = document.getElementById("chart-empty");
  const barsEl = document.getElementById("bars");

  try {
    const relatorio = await apiRequest("/relatorios/preco-medio-categoria");
    const linha = relatorio.find((r) => Number(r.id_categoria) === idCategoria);

    if (!linha) {
      ["card-medio", "card-minimo", "card-maximo", "card-total"].forEach(
        (id) => (document.getElementById(id).textContent = "—")
      );
      chartEmpty.hidden = false;
      barsEl.style.visibility = "hidden";
      return;
    }

    chartEmpty.hidden = true;
    barsEl.style.visibility = "visible";

    const fmt = (v) => `R$ ${Number(v).toFixed(2)}`;
    document.getElementById("card-medio").textContent = fmt(linha.preco_medio);
    document.getElementById("card-minimo").textContent = fmt(linha.preco_minimo);
    document.getElementById("card-maximo").textContent = fmt(linha.preco_maximo);
    document.getElementById("card-total").textContent = linha.total_itens;

    const max = Number(linha.preco_maximo) || 1;
    document.getElementById("bar-minimo").style.height = `${(linha.preco_minimo / max) * 100}%`;
    document.getElementById("bar-medio").style.height = `${(linha.preco_medio / max) * 100}%`;
    document.getElementById("bar-maximo").style.height = `100%`;

    // Sugere o preço médio como ponto de partida no campo final
    const precoFinalEl = document.getElementById("preco-final");
    if (!precoFinalEl.value) precoFinalEl.value = Number(linha.preco_medio).toFixed(2);
    atualizarDiferencaDePreco(linha.preco_medio);

    precoFinalEl.oninput = () => atualizarDiferencaDePreco(linha.preco_medio);
  } catch (erro) {
    console.error("Não foi possível carregar o relatório de preços:", erro);
    chartEmpty.hidden = false;
    chartEmpty.textContent = "Não foi possível carregar a recomendação de preço agora.";
  }
}

function atualizarDiferencaDePreco(precoMedio) {
  const precoFinal = Number(document.getElementById("preco-final").value);
  const diffEl = document.getElementById("price-diff");
  if (!precoMedio || !precoFinal) {
    diffEl.textContent = "";
    return;
  }
  const diferenca = ((precoFinal - precoMedio) / precoMedio) * 100;
  const sinal = diferenca >= 0 ? "acima" : "abaixo";
  diffEl.textContent = `${Math.abs(diferenca).toFixed(0)}% ${sinal} da média da categoria`;
}

// =========================================================
// Registro final: cria o Livro e, em seguida, um Item por
// exemplar informado na quantidade (POST /livros + POST /itens)
// =========================================================
async function registrarLivro() {
  esconderErro();

  const isbnFinal = naoPossuiIsbnEl.checked ? "" : isbnInput.value.trim();

  const payloadLivro = {
    nome: document.getElementById("titulo").value.trim(),
    autor: document.getElementById("autores").value.trim(),
    editora: document.getElementById("editora").value.trim() || null,
    id_categoria: Number(document.getElementById("categoria").value),
    idioma: document.getElementById("idioma").value || null,
    ano_publicacao: Number(document.getElementById("ano-publicacao").value) || null,
    isbn: isbnFinal,
    id_livreiro: ID_LIVREIRO_ATUAL,
  };

  const preco = Number(document.getElementById("preco-final").value);
  const quantidade = Number(document.getElementById("quantidade").value) || 1;
  const descricao = document.getElementById("observacoes").value.trim() || null;

  try {
    const livroCriado = await apiRequest("/livros", { method: "POST", body: payloadLivro });

    const criacoesDeItem = Array.from({ length: quantidade }, () =>
      apiRequest("/itens", {
        method: "POST",
        body: {
          id_livro: livroCriado.id_livro,
          preco,
          conservacao: estado.conservacao,
          tipo_capa: estado.tipoCapa,
          raridade: estado.raridade,
          descricao,
          fotos_item: fotoBase64,
        },
      })
    );
    await Promise.all(criacoesDeItem);

    window.location.href = "../marketplace/marketplace.html";
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

atualizarIndicador();
