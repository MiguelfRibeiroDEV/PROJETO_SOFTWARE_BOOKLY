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
    sessionStorage.setItem("bookly_flash_aviso", "Faça login como vendedor (livreiro) para cadastrar um livro.");
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
// ISBN: alterna entre "possui" / "não possui" e busca automática
// =========================================================
const possuiIsbnEl = document.getElementById("possui-isbn");
const naoPossuiIsbnEl = document.getElementById("nao-possui-isbn");
const isbnInput = document.getElementById("isbn");
const btnBuscarIsbn = document.getElementById("btn-buscar-isbn");
const isbnStatus = document.getElementById("isbn-status");

function sincronizarIsbn(origem) {
  if (origem === "possui" && possuiIsbnEl.checked) naoPossuiIsbnEl.checked = false;
  if (origem === "nao-possui" && naoPossuiIsbnEl.checked) possuiIsbnEl.checked = false;
  isbnInput.disabled = naoPossuiIsbnEl.checked;
  if (btnBuscarIsbn) btnBuscarIsbn.disabled = naoPossuiIsbnEl.checked;
  if (isbnInput.disabled) {
    isbnInput.value = "";
    if (isbnStatus) isbnStatus.textContent = "";
  }
}
possuiIsbnEl.addEventListener("change", () => sincronizarIsbn("possui"));
naoPossuiIsbnEl.addEventListener("change", () => sincronizarIsbn("nao-possui"));

// Função reutilizável de preenchimento dos dados do livro
function aplicarDadosLivroFormulario(dados) {
  if (!dados) return;

  if (dados.titulo) {
    document.getElementById("titulo").value = dados.titulo;
  }
  if (dados.autores) {
    document.getElementById("autores").value = dados.autores;
  }
  if (dados.editora) {
    document.getElementById("editora").value = dados.editora;
  }
  if (dados.ano_publicacao) {
    document.getElementById("ano-publicacao").value = dados.ano_publicacao;
  }
  if (dados.isbn && possuiIsbnEl) {
    possuiIsbnEl.checked = true;
    naoPossuiIsbnEl.checked = false;
    isbnInput.disabled = false;
    isbnInput.value = dados.isbn;
  }
  if (dados.idioma) {
    const selectIdioma = document.getElementById("idioma");
    for (let opt of selectIdioma.options) {
      if (opt.text.toLowerCase().includes(dados.idioma.toLowerCase())) {
        selectIdioma.value = opt.value;
        break;
      }
    }
  }
  if (dados.numero_paginas) {
    const pagInput = document.getElementById("num-paginas");
    if (pagInput) pagInput.value = dados.numero_paginas;
  }
  if (dados.sinopse) {
    const sinopseInput = document.getElementById("sinopse");
    if (sinopseInput) sinopseInput.value = dados.sinopse;
  }

  // Capa do livro
  if (dados.foto_capa && !fotoBase64) {
    const preview = document.getElementById("photo-preview");
    const icon = document.getElementById("photo-icon");
    if (preview) {
      preview.src = dados.foto_capa;
      preview.hidden = false;
    }
    if (icon) {
      icon.style.display = "none";
    }
    fotoBase64 = dados.foto_capa;
  }
}

// Fallback direto no navegador para consulta de ISBN se o backend falhar
async function consultarIsbnFallback(isbnLimpo) {
  // 1. Tenta BrasilAPI direto
  try {
    const res = await fetch(`https://brasilapi.com.br/api/isbn/v1/${isbnLimpo}`);
    if (res.ok) {
      const d = await res.json();
      if (d.title) {
        return {
          titulo: d.title,
          autores: (d.authors || []).join(", "),
          editora: d.publisher || "",
          ano_publicacao: d.year,
          numero_paginas: d.page_count,
          sinopse: d.synopsis || "",
          foto_capa: `https://covers.openlibrary.org/b/isbn/${isbnLimpo}-M.jpg`
        };
      }
    }
  } catch (e) {
    // segue para Open Library
  }

  // 2. Tenta Open Library direto
  try {
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbnLimpo}&format=json&jscmd=data`);
    if (res.ok) {
      const d = await res.json();
      const info = d[`ISBN:${isbnLimpo}`];
      if (info && info.title) {
        return {
          titulo: info.title,
          autores: (info.authors || []).map(a => a.name).join(", "),
          editora: (info.publishers || []).map(p => p.name).join(", "),
          numero_paginas: info.number_of_pages,
          ano_publicacao: info.publish_date ? parseInt(info.publish_date) || null : null,
          foto_capa: info.cover ? (info.cover.medium || info.cover.large) : `https://covers.openlibrary.org/b/isbn/${isbnLimpo}-M.jpg`
        };
      }
    }
  } catch (e) {
    // segue
  }

  return null;
}

// Função de consulta e auto-preenchimento por ISBN
let ultimoIsbnConsultado = "";

async function buscarLivroPorIsbn(forcar = false) {
  if (naoPossuiIsbnEl.checked || !isbnInput.value.trim()) return;

  const isbnLimpo = isbnInput.value.replace(/[^0-9X]/gi, "");
  if (isbnLimpo.length < 10) {
    if (isbnStatus) {
      isbnStatus.textContent = "Digite os 10 ou 13 dígitos numéricos do ISBN.";
      isbnStatus.style.color = "var(--color-red, #ff6b6b)";
    }
    return;
  }

  // Previne recarregamento desnecessário se já consultou exatamente esse ISBN
  if (!forcar && isbnLimpo === ultimoIsbnConsultado) {
    return;
  }

  if (isbnStatus) {
    isbnStatus.textContent = "Consultando catálogo por ISBN...";
    isbnStatus.style.color = "var(--text-muted)";
  }
  if (btnBuscarIsbn) {
    btnBuscarIsbn.disabled = true;
    btnBuscarIsbn.textContent = "Buscando...";
  }

  try {
    let dados = null;
    try {
      dados = await apiRequest(`/livros/consulta-isbn/${isbnLimpo}`);
    } catch (errApi) {
      console.warn("Backend falhou no ISBN, tentando fallback direto:", errApi);
      dados = await consultarIsbnFallback(isbnLimpo);
      if (!dados) throw errApi;
    }

    aplicarDadosLivroFormulario(dados);
    ultimoIsbnConsultado = isbnLimpo;

    if (isbnStatus) {
      isbnStatus.textContent = `Dados encontrados: "${dados.titulo}" (${dados.autores || "Autor informado"})`;
      isbnStatus.style.color = "var(--color-green, #1fbf6b)";
    }

    if (window.BooklyToast) {
      BooklyToast.success(`Livro "${dados.titulo}" localizado com sucesso!`, "ISBN Localizado");
    }
  } catch (erro) {
    ultimoIsbnConsultado = "";
    if (isbnStatus) {
      isbnStatus.textContent = erro.message || "Livro não encontrado pelo ISBN. Preencha manualmente.";
      isbnStatus.style.color = "var(--color-red, #ff6b6b)";
    }
  } finally {
    if (btnBuscarIsbn) {
      btnBuscarIsbn.disabled = false;
      btnBuscarIsbn.textContent = "Buscar dados";
    }
  }
}

if (btnBuscarIsbn) {
  btnBuscarIsbn.addEventListener("click", () => buscarLivroPorIsbn(true));
}

isbnInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    buscarLivroPorIsbn(true);
  }
});

// Busca automática apenas se o usuário alterar o ISBN digitado
isbnInput.addEventListener("input", () => {
  const limpo = isbnInput.value.replace(/[^0-9X]/gi, "");
  if (limpo !== ultimoIsbnConsultado && (limpo.length === 10 || limpo.length === 13)) {
    buscarLivroPorIsbn(false);
  }
});

// =========================================================
// AUTOCOMPLETE DINÂMICO DE TÍTULO DO LIVRO
// =========================================================
const tituloInput = document.getElementById("titulo");
const dropdownSugestoes = document.getElementById("titulo-sugestoes");
const spinnerTitulo = document.getElementById("titulo-spinner");

let timerAutocomplete = null;
let indiceAtivoSugestao = -1;
let sugestoesAtuais = [];

function fecharDropdownSugestoes() {
  if (dropdownSugestoes) {
    dropdownSugestoes.hidden = true;
    dropdownSugestoes.innerHTML = "";
  }
  indiceAtivoSugestao = -1;
  sugestoesAtuais = [];
}

function renderizarSugestoes(sugestoes) {
  if (!dropdownSugestoes) return;
  dropdownSugestoes.innerHTML = "";
  sugestoesAtuais = sugestoes;
  indiceAtivoSugestao = -1;

  if (!sugestoes || sugestoes.length === 0) {
    fecharDropdownSugestoes();
    return;
  }

  sugestoes.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "autocomplete-item";
    li.dataset.idx = idx;

    const capaHtml = item.foto_capa
      ? `<img src="${item.foto_capa}" class="autocomplete-capa-thumb" alt="Capa" onerror="this.style.display='none'">`
      : `<div class="autocomplete-capa-thumb"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>`;

    const tagOrigem = item.origem === "catalogo_bookly"
      ? `<span class="autocomplete-tag">Catálogo Bookly</span>`
      : `<span class="autocomplete-tag">Base Global</span>`;

    const detalhes = [item.autores, item.editora, item.ano_publicacao ? `(${item.ano_publicacao})` : ""]
      .filter(Boolean)
      .join(" · ");

    li.innerHTML = `
      ${capaHtml}
      <div class="autocomplete-info">
        <div class="autocomplete-item-titulo">${item.titulo} ${tagOrigem}</div>
        <div class="autocomplete-item-detalhes">${detalhes || "Autor não informado"}</div>
      </div>
    `;

    li.addEventListener("click", () => {
      selecionarSugestao(item);
    });

    dropdownSugestoes.appendChild(li);
  });

  dropdownSugestoes.hidden = false;
}

function selecionarSugestao(item) {
  aplicarDadosLivroFormulario(item);
  fecharDropdownSugestoes();
  if (window.BooklyToast) {
    BooklyToast.success(`Dados de "${item.titulo}" preenchidos automaticamente!`, "Livro Selecionado");
  }
}

async function buscarSugestoesTitulo(termo) {
  if (!termo || termo.length < 2) {
    fecharDropdownSugestoes();
    return;
  }

  if (spinnerTitulo) spinnerTitulo.hidden = false;

  try {
    const resultados = await apiRequest(`/livros/buscar-sugestoes?q=${encodeURIComponent(termo)}`);
    renderizarSugestoes(resultados);
  } catch (err) {
    console.warn("Falha ao buscar sugestões:", err);
  } finally {
    if (spinnerTitulo) spinnerTitulo.hidden = true;
  }
}

if (tituloInput) {
  tituloInput.addEventListener("input", (e) => {
    const termo = e.target.value.trim();
    clearTimeout(timerAutocomplete);
    if (termo.length < 2) {
      fecharDropdownSugestoes();
      return;
    }
    timerAutocomplete = setTimeout(() => {
      buscarSugestoesTitulo(termo);
    }, 250);
  });

  tituloInput.addEventListener("keydown", (e) => {
    if (!dropdownSugestoes || dropdownSugestoes.hidden || sugestoesAtuais.length === 0) return;

    const itens = dropdownSugestoes.querySelectorAll(".autocomplete-item");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      indiceAtivoSugestao = (indiceAtivoSugestao + 1) % itens.length;
      itens.forEach((el, i) => el.classList.toggle("is-active", i === indiceAtivoSugestao));
      itens[indiceAtivoSugestao]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      indiceAtivoSugestao = (indiceAtivoSugestao - 1 + itens.length) % itens.length;
      itens.forEach((el, i) => el.classList.toggle("is-active", i === indiceAtivoSugestao));
      itens[indiceAtivoSugestao]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      if (indiceAtivoSugestao >= 0 && sugestoesAtuais[indiceAtivoSugestao]) {
        e.preventDefault();
        selecionarSugestao(sugestoesAtuais[indiceAtivoSugestao]);
      }
    } else if (e.key === "Escape") {
      fecharDropdownSugestoes();
    }
  });
}

// Fechar autocomplete ao clicar fora
document.addEventListener("click", (e) => {
  if (!e.target.closest(".autocomplete-group")) {
    fecharDropdownSugestoes();
  }
});

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
    const hMin = Math.max((linha.preco_minimo / max) * 100, 16);
    const hMed = Math.max((linha.preco_medio / max) * 100, 22);
    document.getElementById("bar-minimo").style.height = `${hMin}%`;
    document.getElementById("bar-medio").style.height = `${hMed}%`;
    document.getElementById("bar-maximo").style.height = `100%`;

    const elValMin = document.getElementById("val-bar-minimo");
    const elValMed = document.getElementById("val-bar-medio");
    const elValMax = document.getElementById("val-bar-maximo");
    if (elValMin) elValMin.textContent = fmt(linha.preco_minimo);
    if (elValMed) elValMed.textContent = fmt(linha.preco_medio);
    if (elValMax) elValMax.textContent = fmt(linha.preco_maximo);

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
// BOOKLY AI: PRECIFICAÇÃO INTELIGENTE (OPCIONAL DO USUÁRIO)
// =========================================================
let ultimaRecomendacaoIa = null;

async function solicitarRecomendacaoIa() {
  const btnPedirIa = document.getElementById("btn-pedir-ia");
  const aiLoading = document.getElementById("ai-loading");
  const aiResult = document.getElementById("ai-result");
  const aiLoadingText = document.getElementById("ai-loading-text");

  btnPedirIa.disabled = true;
  aiLoading.hidden = false;
  aiResult.hidden = true;
  if (aiLoadingText) aiLoadingText.textContent = "Analisando dados do livro e conservação com a Bookly AI...";

  const payload = {
    livro: {
      titulo: document.getElementById("titulo").value.trim(),
      autor: document.getElementById("autores").value.trim(),
      editora: document.getElementById("editora").value.trim() || null,
      id_categoria: Number(document.getElementById("categoria").value) || null,
      idioma: document.getElementById("idioma").value || null,
      ano_publicacao: Number(document.getElementById("ano-publicacao").value) || null,
      isbn: naoPossuiIsbnEl.checked ? "" : isbnInput.value.trim(),
    },
    exemplar: {
      conservacao: estado.conservacao,
      tipo_capa: estado.tipoCapa,
      raridade: estado.raridade,
      quantidade_paginas: Number(document.getElementById("quantidade-paginas")?.value) || null,
      observacoes: document.getElementById("observacoes").value.trim() || null,
    },
  };

  try {
    const resposta = await apiRequest("/estimativas/ia-precificar", {
      method: "POST",
      body: payload,
    });

    if (resposta && resposta.estimativa) {
      ultimaRecomendacaoIa = {
        ...resposta.estimativa,
        origem: resposta.origem,
      };
      exibirRecomendacaoIa(ultimaRecomendacaoIa);
      if (window.BooklyToast) {
        BooklyToast.success("Sugestão de preço gerada com sucesso pela Bookly AI!");
      }
    } else {
      throw new Error("Não foi possível gerar estimativa.");
    }
  } catch (erro) {
    console.error("Erro na solicitação de IA:", erro);
    if (window.BooklyToast) {
      BooklyToast.warning("Não foi possível conectar à IA no momento. Você pode definir o preço manualmente.");
    }
  } finally {
    btnPedirIa.disabled = false;
    aiLoading.hidden = true;
  }
}

function exibirRecomendacaoIa(est) {
  const aiResult = document.getElementById("ai-result");
  const aiPrecoVal = document.getElementById("ai-preco-val");
  const aiFaixaVal = document.getElementById("ai-faixa-val");
  const aiJustificativaVal = document.getElementById("ai-justificativa-val");
  const aiBadgeConfianca = document.getElementById("ai-badge-confianca");
  const aiBadgeOrigem = document.getElementById("ai-badge-origem");
  const aiFatoresTags = document.getElementById("ai-fatores-tags");

  aiResult.hidden = false;
  aiPrecoVal.textContent = `R$ ${Number(est.preco_sugerido || 0).toFixed(2)}`;

  if (est.faixa_preco && est.faixa_preco.minimo && est.faixa_preco.maximo) {
    aiFaixaVal.textContent = `Faixa recomendada: R$ ${Number(est.faixa_preco.minimo).toFixed(2)} a R$ ${Number(est.faixa_preco.maximo).toFixed(2)}`;
  } else {
    aiFaixaVal.textContent = "Preço competitivo para venda rápida";
  }

  aiJustificativaVal.textContent = est.justificativa || "Avaliação baseada no estado de conservação do livro e dados da categoria.";

  if (aiBadgeConfianca) {
    const conf = (est.nivel_confianca || "Alta").toUpperCase();
    aiBadgeConfianca.textContent = `Confiança ${conf}`;
  }

  if (aiBadgeOrigem) {
    aiBadgeOrigem.textContent = est.origem === "ia" ? "Gemini 3.5" : "Heurística Bookly";
  }

  if (aiFatoresTags) {
    aiFatoresTags.innerHTML = "";
    if (Array.isArray(est.fatores_avaliados)) {
      est.fatores_avaliados.forEach((f) => {
        const span = document.createElement("span");
        const impacto = (f.impacto || "").toLowerCase();
        let cls = "ai-fator-tag";
        if (impacto.includes("pos") || String(f.porcentagem).includes("+")) cls += " pos";
        else if (impacto.includes("neg") || String(f.porcentagem).includes("-")) cls += " neg";
        span.className = cls;
        span.textContent = `${f.fator} (${f.porcentagem || f.impacto})`;
        aiFatoresTags.appendChild(span);
      });
    }
  }

  const btnAdotar = document.getElementById("btn-adotar-preco-ia");
  if (btnAdotar) {
    btnAdotar.textContent = `Adotar R$ ${Number(est.preco_sugerido).toFixed(2)}`;
  }
}

const btnPedirIaEl = document.getElementById("btn-pedir-ia");
if (btnPedirIaEl) {
  btnPedirIaEl.addEventListener("click", solicitarRecomendacaoIa);
}

const btnAdotarPrecoIaEl = document.getElementById("btn-adotar-preco-ia");
if (btnAdotarPrecoIaEl) {
  btnAdotarPrecoIaEl.addEventListener("click", () => {
    if (ultimaRecomendacaoIa && ultimaRecomendacaoIa.preco_sugerido) {
      const precoFinalEl = document.getElementById("preco-final");
      precoFinalEl.value = Number(ultimaRecomendacaoIa.preco_sugerido).toFixed(2);

      const precoMedioTxt = document.getElementById("card-medio").textContent;
      const numMedio = Number(precoMedioTxt.replace("R$", "").replace(",", ".").trim()) || 0;
      atualizarDiferencaDePreco(numMedio);

      if (window.BooklyToast) {
        BooklyToast.success(`Preço sugerido de R$ ${Number(ultimaRecomendacaoIa.preco_sugerido).toFixed(2)} adotado!`);
      }
    }
  });
}

const btnAdotarDescIaEl = document.getElementById("btn-adotar-desc-ia");
if (btnAdotarDescIaEl) {
  btnAdotarDescIaEl.addEventListener("click", () => {
    if (ultimaRecomendacaoIa && ultimaRecomendacaoIa.descricao_comercial) {
      const obsEl = document.getElementById("observacoes");
      obsEl.value = ultimaRecomendacaoIa.descricao_comercial;
      if (window.BooklyToast) {
        BooklyToast.info("Descrição comercial recomendada pela IA copiada para as observações do exemplar!");
      }
    }
  });
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
    const itensCriados = await Promise.all(criacoesDeItem);

    // Se houve recomendação gerada pela IA, registra na tabela estimativa para o item criado
    if (ultimaRecomendacaoIa && itensCriados.length > 0 && itensCriados[0].id_item) {
      try {
        await apiRequest("/estimativas", {
          method: "POST",
          body: {
            id_item: itensCriados[0].id_item,
            preco_estimado: ultimaRecomendacaoIa.preco_sugerido,
            possivel_descricao: (ultimaRecomendacaoIa.justificativa || "").slice(0, 500),
          },
        });
      } catch (errEst) {
        console.warn("Aviso ao registrar estimativa no banco:", errEst);
      }
    }

    sessionStorage.setItem("bookly_flash_sucesso", `Livro "${payloadLivro.nome}" cadastrado com sucesso!`);
    window.location.href = "../marketplace/marketplace.html";
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

atualizarIndicador();
