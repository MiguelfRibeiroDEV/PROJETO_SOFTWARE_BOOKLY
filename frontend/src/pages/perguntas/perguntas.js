const tipo = localStorage.getItem("bookly_usuario_tipo");
const idLivreiro = localStorage.getItem("bookly_livreiro_id") || localStorage.getItem("bookly_usuario_id");

const listaEl = document.getElementById("perg-lista");
const statusEl = document.getElementById("perg-status");
const msgEl = document.getElementById("perg-msg");
const abasEl = document.getElementById("perg-abas");
const contadorEl = document.getElementById("contador-pendentes");
const template = document.getElementById("pergunta-template");

let statusAtual = "pendentes";
let timerMsg = null;

function mostrarMensagem(texto, erro = false) {
  msgEl.textContent = texto;
  msgEl.className = "perg-msg " + (erro ? "perg-msg-erro" : "perg-msg-ok");
  msgEl.hidden = !texto;
  clearTimeout(timerMsg);
  if (texto) timerMsg = setTimeout(() => { msgEl.hidden = true; }, 5000);
}

function formatarDataHora(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function desenharPerguntas(perguntas) {
  listaEl.textContent = "";

  if (perguntas.length === 0) {
    statusEl.hidden = false;
    statusEl.textContent = statusAtual === "pendentes"
      ? "Nenhuma pergunta pendente. Você está em dia!"
      : "Nenhuma pergunta por aqui ainda.";
    return;
  }
  statusEl.hidden = true;

  perguntas.forEach((p) => {
    const card = template.content.cloneNode(true);
    const raiz = card.querySelector(".pergunta-card");
    raiz.dataset.idPergunta = p.id_pergunta;

    card.querySelector(".pergunta-livro").textContent = `${p.livro_nome} · ${p.livro_autor}`;
    card.querySelector(".pergunta-quem").textContent = `${p.comprador} · ${formatarDataHora(p.data_pergunta)}`;
    card.querySelector(".pergunta-texto").textContent = p.texto_pergunta;

    const tag = card.querySelector(".pergunta-tag");
    const respondida = Boolean(p.texto_resposta);
    tag.textContent = respondida ? "Respondida" : "Pendente";
    tag.classList.add(respondida ? "tag-respondida" : "tag-pendente");

    const form = card.querySelector(".pergunta-form");
    const resposta = card.querySelector(".pergunta-resposta");
    if (respondida) {
      form.hidden = true;
      resposta.hidden = false;
      card.querySelector(".pergunta-resposta-texto").textContent = p.texto_resposta;
    }

    listaEl.appendChild(card);
  });
}

async function carregarPerguntas() {
  statusEl.hidden = false;
  statusEl.textContent = "Carregando perguntas...";
  listaEl.textContent = "";
  try {
    const dados = await apiRequest(`/livreiros/${idLivreiro}/perguntas?status=${statusAtual}`);
    contadorEl.textContent = dados.pendentes;
    contadorEl.hidden = dados.pendentes === 0;
    desenharPerguntas(dados.perguntas);
  } catch (erro) {
    statusEl.textContent = "Não foi possível carregar as perguntas agora.";
    console.error(erro);
  }
}

abasEl.addEventListener("click", (event) => {
  const aba = event.target.closest(".perg-aba");
  if (!aba) return;
  abasEl.querySelectorAll(".perg-aba").forEach((a) => a.classList.remove("ativa"));
  aba.classList.add("ativa");
  statusAtual = aba.dataset.status;
  carregarPerguntas();
});

// contador de caracteres
listaEl.addEventListener("input", (event) => {
  const area = event.target.closest("textarea");
  if (!area) return;
  area.closest(".pergunta-form").querySelector(".pergunta-contador").textContent = `${area.value.length}/500`;
});

// responder
listaEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target.closest(".pergunta-form");
  if (!form) return;

  const card = form.closest(".pergunta-card");
  const texto = form.querySelector("textarea").value.trim();
  if (texto.length < 3) {
    mostrarMensagem("Escreva uma resposta com pelo menos 3 caracteres.", true);
    return;
  }

  const botao = form.querySelector("button[type=submit]");
  botao.disabled = true;
  try {
    await apiRequest(`/perguntas/${card.dataset.idPergunta}/resposta`, {
      method: "PUT",
      body: { id_livreiro: Number(idLivreiro), texto_resposta: texto },
    });
    mostrarMensagem("Resposta enviada.");
    await carregarPerguntas();
  } catch (erro) {
    botao.disabled = false;
    mostrarMensagem(erro.message, true);
  }
});

if (tipo !== "livreiro" || !idLivreiro) {
  abasEl.hidden = true;
  statusEl.textContent = "Faça login como livreiro (vendedor) para ver as perguntas recebidas.";
} else {
  carregarPerguntas();
}
