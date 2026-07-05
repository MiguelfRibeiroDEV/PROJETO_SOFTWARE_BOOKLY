// CRUD genérico em JS puro. Não depende de nenhuma variável injetada pelo Flask/Jinja:
// a entidade e o id do registro são lidos direto da URL da página.
//
// Padrão de URLs das telas:
//   /telas/<entidade>/            -> listagem
//   /telas/<entidade>/novo        -> formulário de criação
//   /telas/<entidade>/<id>/editar -> formulário de edição

function obterContextoUrl() {
  const partes = window.location.pathname.split("/").filter(Boolean);
  // partes[0] é sempre "telas"
  const entidade = partes[1];

  let modo = "lista";
  let id = null;

  if (partes[2] === "novo") {
    modo = "novo";
  } else if (partes.length >= 4 && partes[3] === "editar") {
    modo = "editar";
    id = partes[2];
  }

  return { entidade, modo, id };
}

async function apiFetch(url, opcoes = {}) {
  const resposta = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem = (dados && dados.erro) || "Erro na requisição.";
    throw new Error(mensagem);
  }

  return dados;
}

// ---------------------------------------------------------------
// MENU (presente em todas as páginas)
// ---------------------------------------------------------------
function montarMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;

  menu.innerHTML = "";
  Object.keys(window.ENTIDADES).forEach((chave) => {
    const link = document.createElement("a");
    link.href = `/telas/${chave}/`;
    link.textContent = window.ENTIDADES[chave].titulo;
    menu.appendChild(link);
  });
}

// ---------------------------------------------------------------
// PÁGINA INICIAL
// ---------------------------------------------------------------
function montarCardsHome() {
  const container = document.getElementById("cards-home");
  if (!container) return;

  container.innerHTML = "";
  Object.keys(window.ENTIDADES).forEach((chave) => {
    const link = document.createElement("a");
    link.className = "card";
    link.href = `/telas/${chave}/`;
    link.textContent = window.ENTIDADES[chave].titulo;
    container.appendChild(link);
  });
}

// ---------------------------------------------------------------
// LISTAGEM
// ---------------------------------------------------------------
async function carregarListagem() {
  montarMenu();

  const { entidade } = obterContextoUrl();
  const cfg = window.ENTIDADES[entidade];

  if (!cfg) {
    document.getElementById("titulo-pagina").textContent = "Entidade não encontrada";
    return;
  }

  document.getElementById("titulo-pagina").textContent = cfg.titulo;
  document.getElementById("link-novo").href = `/telas/${entidade}/novo`;

  const cabecalho = document.getElementById("tabela-cabecalho");
  cabecalho.innerHTML = "";
  cfg.colunas.forEach((coluna) => {
    const th = document.createElement("th");
    th.textContent = coluna.label;
    cabecalho.appendChild(th);
  });
  const thAcoes = document.createElement("th");
  thAcoes.textContent = "Ações";
  cabecalho.appendChild(thAcoes);

  const corpo = document.getElementById("tabela-corpo");
  corpo.innerHTML = `<tr><td colspan="${cfg.colunas.length + 1}">Carregando...</td></tr>`;

  try {
    const registros = await apiFetch(cfg.api);
    corpo.innerHTML = "";

    if (!registros.length) {
      corpo.innerHTML = `<tr><td colspan="${cfg.colunas.length + 1}">Nenhum registro encontrado.</td></tr>`;
      return;
    }

    registros.forEach((registro) => {
      const linha = document.createElement("tr");

      cfg.colunas.forEach((coluna) => {
        const celula = document.createElement("td");
        const valor = registro[coluna.campo];
        celula.textContent = valor === null || valor === undefined || valor === "" ? "-" : valor;
        linha.appendChild(celula);
      });

      const celulaAcoes = document.createElement("td");
      celulaAcoes.innerHTML = `
        <a href="/telas/${entidade}/${registro[cfg.pk]}/editar" class="btn btn-editar">Editar</a>
        <button type="button" class="btn btn-excluir" data-id="${registro[cfg.pk]}">Excluir</button>
      `;
      linha.appendChild(celulaAcoes);
      corpo.appendChild(linha);
    });

    corpo.querySelectorAll(".btn-excluir").forEach((botao) => {
      botao.addEventListener("click", async () => {
        if (!confirm("Confirma a exclusão deste registro?")) return;
        try {
          await apiFetch(`${cfg.api}/${botao.dataset.id}`, { method: "DELETE" });
          carregarListagem();
        } catch (erro) {
          alert(erro.message);
        }
      });
    });
  } catch (erro) {
    corpo.innerHTML = `<tr><td colspan="${cfg.colunas.length + 1}">Erro ao carregar dados: ${erro.message}</td></tr>`;
  }
}

// ---------------------------------------------------------------
// FORMULÁRIO (criar/editar)
// ---------------------------------------------------------------
async function montarFormulario() {
  montarMenu();

  const { entidade, modo, id } = obterContextoUrl();
  const cfg = window.ENTIDADES[entidade];

  if (!cfg) {
    document.getElementById("titulo-pagina").textContent = "Entidade não encontrada";
    return;
  }

  document.getElementById("titulo-pagina").textContent = `${cfg.titulo} - ${modo === "editar" ? "Editar" : "Novo"}`;
  document.getElementById("link-cancelar").href = `/telas/${entidade}/`;

  const container = document.getElementById("form-campos");
  container.innerHTML = "";

  for (const campo of cfg.campos) {
    const grupo = document.createElement("div");
    grupo.className = "campo-formulario";

    const rotulo = document.createElement("label");
    rotulo.textContent = campo.label + (campo.obrigatorio ? " *" : "");
    rotulo.setAttribute("for", campo.nome);
    grupo.appendChild(rotulo);

    let input;

    if (campo.tipo === "textarea") {
      input = document.createElement("textarea");
    } else if (campo.tipo === "select") {
      input = document.createElement("select");

      const opcaoVazia = document.createElement("option");
      opcaoVazia.value = "";
      opcaoVazia.textContent = "Selecione...";
      input.appendChild(opcaoVazia);

      try {
        const opcoes = await apiFetch(campo.fonte);
        opcoes.forEach((opcao) => {
          const elementoOpcao = document.createElement("option");
          elementoOpcao.value = opcao[campo.fonte_valor];
          elementoOpcao.textContent = opcao[campo.fonte_label] ?? `#${opcao[campo.fonte_valor]}`;
          input.appendChild(elementoOpcao);
        });
      } catch (erro) {
        console.error(`Erro ao carregar opções de "${campo.nome}":`, erro);
      }
    } else if (campo.tipo === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
    } else {
      input = document.createElement("input");
      input.type = campo.tipo === "password" ? "password" : campo.tipo || "text";
    }

    input.name = campo.nome;
    input.id = campo.nome;

    const ehSenhaNaEdicao = campo.tipo === "password" && modo === "editar";
    if (campo.obrigatorio && campo.tipo !== "checkbox" && !ehSenhaNaEdicao) {
      input.required = true;
    }

    grupo.appendChild(input);
    container.appendChild(grupo);
  }

  if (modo === "editar" && id) {
    try {
      const registro = await apiFetch(`${cfg.api}/${id}`);
      cfg.campos.forEach((campo) => {
        const input = document.getElementById(campo.nome);
        if (!input) return;

        if (campo.tipo === "checkbox") {
          input.checked = !!registro[campo.nome];
        } else if (campo.tipo === "password") {
          // nunca preenche a senha por segurança; deixar em branco = manter a atual
        } else {
          input.value = registro[campo.nome] ?? "";
        }
      });
    } catch (erro) {
      document.getElementById("mensagem-erro").textContent = erro.message;
    }
  }
}

async function salvarFormulario(evento) {
  evento.preventDefault();

  const { entidade, modo, id } = obterContextoUrl();
  const cfg = window.ENTIDADES[entidade];
  const mensagemErro = document.getElementById("mensagem-erro");
  mensagemErro.textContent = "";

  const dados = {};
  cfg.campos.forEach((campo) => {
    const input = document.getElementById(campo.nome);
    if (!input) return;

    if (campo.tipo === "checkbox") {
      dados[campo.nome] = input.checked;
    } else if (campo.tipo === "password" && !input.value) {
      // não envia senha em branco (mantém a atual na edição)
    } else if (input.value !== "") {
      dados[campo.nome] = campo.tipo === "number" ? Number(input.value) : input.value;
    }
  });

  try {
    if (modo === "editar") {
      await apiFetch(`${cfg.api}/${id}`, { method: "PUT", body: JSON.stringify(dados) });
    } else {
      await apiFetch(cfg.api, { method: "POST", body: JSON.stringify(dados) });
    }
    window.location.href = `/telas/${entidade}/`;
  } catch (erro) {
    mensagemErro.textContent = erro.message;
  }
}
