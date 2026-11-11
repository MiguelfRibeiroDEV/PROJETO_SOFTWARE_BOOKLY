const listaEl = document.getElementById("catalogo-lista");
const statusEl = document.getElementById("catalogo-status");
const template = document.getElementById("catalogo-card-template");

const modal = document.getElementById("modal-editar");
const formEditar = document.getElementById("form-editar");
const modalErro = document.getElementById("modal-erro");

let idLivreiro = null;
let catalogoAtual = [];
let fotoBase64Editar = null;

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

const CORES_CAPA = ["#5b6ee1", "#e2637b", "#3fae7a", "#d1a13c", "#8158d6", "#3ea0c9"];

function corParaTitulo(titulo) {
  const soma = [...(titulo || "?")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CORES_CAPA[soma % CORES_CAPA.length];
}

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

function renderizarCatalogo(lista) {
  listaEl.innerHTML = "";

  if (lista.length === 0) {
    statusEl.hidden = false;
    statusEl.textContent = "Você ainda não tem nenhum anúncio no marketplace.";
    return;
  }
  statusEl.hidden = true;

  lista.forEach((anuncio) => {
    const card = template.content.cloneNode(true);

    card.querySelector(".catalogo-cover img").src = anuncio.fotos_item || capaPlaceholder(anuncio.nome);
    card.querySelector(".catalogo-titulo").textContent = anuncio.nome;
    card.querySelector(".catalogo-autor").textContent = anuncio.autor;
    card.querySelector(".catalogo-preco").textContent = formatarPreco(anuncio.preco);
    card.querySelector(".catalogo-meta").textContent =
      `${anuncio.conservacao || "—"} · ${anuncio.vendido ? "Vendido" : "Anunciado no marketplace"}`;

    const btnEditar = card.querySelector(".btn-editar");
    const btnExcluir = card.querySelector(".btn-excluir");
    btnEditar.dataset.idItem = anuncio.id_item;
    btnExcluir.dataset.idItem = anuncio.id_item;
    btnExcluir.dataset.nome = anuncio.nome;

    if (anuncio.vendido) {
      btnExcluir.disabled = true;
      btnExcluir.title = "Itens já vendidos não podem ser removidos.";
    }

    listaEl.appendChild(card);
  });
}

async function carregarCatalogo() {
  try {
    statusEl.hidden = false;
    statusEl.textContent = "Carregando seu catálogo...";

    catalogoAtual = await apiRequest(`/livreiros/${idLivreiro}/catalogo`);
    renderizarCatalogo(catalogoAtual);
  } catch (erro) {
    statusEl.hidden = false;
    statusEl.textContent = "Não foi possível carregar seu catálogo agora.";
    console.error(erro);
  }
}

async function carregarCategoriasNoModal() {
  const select = document.getElementById("editar-categoria");
  try {
    const categorias = await apiRequest("/categorias");
    select.innerHTML = "";
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria.id_categoria;
      option.textContent = categoria.nome;
      select.appendChild(option);
    });
  } catch (erro) {
    console.error("Não foi possível carregar categorias:", erro);
  }
}

function abrirModalEdicao(idItem) {
  const anuncio = catalogoAtual.find((a) => String(a.id_item) === String(idItem));
  if (!anuncio) return;

  modalErro.hidden = true;
  fotoBase64Editar = null;

  const preview = document.getElementById("editar-photo-preview");
  const icone = document.getElementById("editar-photo-icon");
  if (anuncio.fotos_item) {
    preview.src = anuncio.fotos_item;
    preview.hidden = false;
    icone.hidden = true;
  } else {
    preview.hidden = true;
    icone.hidden = false;
  }

  document.getElementById("editar-id-item").value = anuncio.id_item;
  document.getElementById("editar-titulo").value = anuncio.nome;
  document.getElementById("editar-autor").value = anuncio.autor;
  document.getElementById("editar-editora").value = anuncio.editora || "";
  document.getElementById("editar-idioma").value = anuncio.idioma || "";
  document.getElementById("editar-ano").value = anuncio.ano_publicacao || "";
  document.getElementById("editar-categoria").value = anuncio.id_categoria;
  document.getElementById("editar-preco").value = anuncio.preco;
  document.getElementById("editar-conservacao").value = anuncio.conservacao || "";

  modal.hidden = false;
}

function fecharModal() {
  modal.hidden = true;
}

listaEl.addEventListener("click", (event) => {
  const btnEditar = event.target.closest(".btn-editar");
  if (btnEditar) {
    abrirModalEdicao(btnEditar.dataset.idItem);
    return;
  }

  const btnExcluir = event.target.closest(".btn-excluir");
  if (btnExcluir && !btnExcluir.disabled) {
    excluirAnuncio(btnExcluir.dataset.idItem, btnExcluir.dataset.nome);
  }
});

document.getElementById("btn-fechar-modal").addEventListener("click", fecharModal);
document.getElementById("btn-cancelar-modal").addEventListener("click", fecharModal);

document.getElementById("editar-foto-input").addEventListener("change", async (event) => {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  try {
    fotoBase64Editar = await comprimirImagem(arquivo);

    const preview = document.getElementById("editar-photo-preview");
    preview.src = fotoBase64Editar;
    preview.hidden = false;
    document.getElementById("editar-photo-icon").hidden = true;
  } catch (erro) {
    modalErro.hidden = false;
    modalErro.textContent = erro.message;
    console.error(erro);
  }
});

// =========================================================
// FUNCIONALIDADE: Editar anúncio (livro + item juntos)
// PUT /livreiros/<id>/catalogo/<id_item> -> Controller -> AtualizarAnuncioService -> Models
// =========================================================
formEditar.addEventListener("submit", async (event) => {
  event.preventDefault();
  modalErro.hidden = true;

  const idItem = document.getElementById("editar-id-item").value;
  const dados = {
    nome: document.getElementById("editar-titulo").value.trim(),
    autor: document.getElementById("editar-autor").value.trim(),
    editora: document.getElementById("editar-editora").value.trim() || null,
    idioma: document.getElementById("editar-idioma").value || null,
    ano_publicacao: document.getElementById("editar-ano").value
      ? Number(document.getElementById("editar-ano").value)
      : null,
    id_categoria: Number(document.getElementById("editar-categoria").value),
    preco: Number(document.getElementById("editar-preco").value),
    conservacao: document.getElementById("editar-conservacao").value || null,
    fotos_item: fotoBase64Editar,
  };

  const btnSalvar = document.getElementById("btn-salvar-modal");
  const textoOriginal = btnSalvar.textContent;
  btnSalvar.disabled = true;
  btnSalvar.textContent = "Salvando...";

  try {
    await apiRequest(`/livreiros/${idLivreiro}/catalogo/${idItem}`, {
      method: "PUT",
      body: dados,
    });

    fecharModal();
    BooklyToast.success("Anúncio atualizado com sucesso!");
    carregarCatalogo();
  } catch (erro) {
    modalErro.hidden = false;
    modalErro.textContent = erro.message;
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = textoOriginal;
  }
});

// =========================================================
// FUNCIONALIDADE: Remover anúncio do catálogo
// DELETE /livreiros/<id>/catalogo/<id_item> -> Controller -> RemoverAnuncioService -> Models
// =========================================================
async function excluirAnuncio(idItem, nome) {
  const confirmou = await BooklyToast.confirm(
    "Remover anúncio",
    `Deseja realmente remover <strong>"${nome}"</strong> do marketplace? Essa ação não pode ser desfeita.`,
    { confirmText: "Remover", cancelText: "Cancelar", danger: true }
  );
  if (!confirmou) return;

  try {
    await apiRequest(`/livreiros/${idLivreiro}/catalogo/${idItem}`, { method: "DELETE" });
    BooklyToast.success(`"${nome}" removido com sucesso.`);
    carregarCatalogo();
  } catch (erro) {
    BooklyToast.error(erro.message);
  }
}

// =========================================================
// FUNCIONALIDADE: Listar meu catálogo
// GET /livreiros/<id>/catalogo -> Controller -> ListarCatalogoLivreiroService -> Models
// =========================================================
function iniciar() {
  idLivreiro = localStorage.getItem("bookly_livreiro_id") || localStorage.getItem("bookly_usuario_id");
  const tipoUsuario = localStorage.getItem("bookly_usuario_tipo");

  if (!idLivreiro || tipoUsuario !== "livreiro") {
    statusEl.hidden = false;
    statusEl.textContent = "Faça login como livreiro (vendedor) para gerenciar seu catálogo.";
    return;
  }

  carregarCategoriasNoModal();
  carregarCatalogo();
}

iniciar();
