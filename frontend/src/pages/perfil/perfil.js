const tipo = localStorage.getItem("bookly_usuario_tipo");
const id = localStorage.getItem("bookly_usuario_id");

const statusEl = document.getElementById("perfil-status");
const layoutEl = document.getElementById("perfil-layout");
const msgEl = document.getElementById("perfil-msg");
const fotoEl = document.getElementById("perfil-foto");
const fotoInput = document.getElementById("foto-input");

const CAMPOS = [
  "primeiro_nome", "segundo_nome", "usuario", "telefone", "data_nascimento",
  "endereco_cep", "endereco_rua", "endereco_numero", "endereco_complemento",
  "endereco_bairro", "endereco_cidade", "endereco_estado",
];

let perfilAtual = null;
let timerMsg = null;

function mostrarMensagem(texto, erro = false) {
  msgEl.textContent = texto;
  msgEl.className = "perfil-msg " + (erro ? "perfil-msg-erro" : "perfil-msg-ok");
  msgEl.hidden = false;
  clearTimeout(timerMsg);
  timerMsg = setTimeout(() => { msgEl.hidden = true; }, 5000);
  if (window.BooklyToast) {
    if (erro) BooklyToast.error(texto);
    else BooklyToast.success(texto);
  }
}

// ---------- formatação ----------
function formatarCpf(cpf) {
  const d = String(cpf || "").replace(/\D/g, "");
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : (cpf || "");
}

function formatarTelefone(tel) {
  const d = String(tel || "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel || "";
}

function formatarCep(cep) {
  const d = String(cep || "").replace(/\D/g, "");
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : (cep || "");
}

function formatarMoeda(valor) {
  return `R$${Number(valor || 0).toFixed(2).replace(".", ",")}`;
}

function membroDesde(iso) {
  if (!iso) return "-";
  const data = new Date(iso);
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[data.getMonth()]}/${data.getFullYear()}`;
}

// ---------- foto (ou inicial) ----------
function desenharFoto(perfil) {
  fotoEl.textContent = "";
  if (perfil.foto_perfil) {
    const img = document.createElement("img");
    img.src = perfil.foto_perfil;
    img.alt = "Foto de perfil";
    fotoEl.style.backgroundColor = "";
    fotoEl.appendChild(img);
  } else {
    fotoEl.style.backgroundColor = tipo === "livreiro" ? "#ff9a76" : "#fbe98a";
    fotoEl.textContent = (perfil.primeiro_nome || "?").trim().charAt(0).toUpperCase();
  }
  document.getElementById("btn-remover-foto").hidden = !perfil.foto_perfil;
}

function criarStat(valor, rotulo) {
  const div = document.createElement("div");
  const b = document.createElement("b");
  b.textContent = valor;
  div.append(b, rotulo);
  return div;
}

function desenharResumo(perfil) {
  const nomeCompleto = [perfil.primeiro_nome, perfil.segundo_nome].filter(Boolean).join(" ");
  document.getElementById("perfil-nome-completo").textContent = nomeCompleto;
  document.getElementById("perfil-tipo").textContent =
    `@${perfil.usuario} · ${tipo === "livreiro" ? "Livreiro" : "Comprador"}`;

  const stats = document.getElementById("perfil-stats");
  stats.textContent = "";
  if (tipo === "livreiro") {
    stats.append(
      criarStat(perfil.livros_vendidos, "livros vendidos"),
      criarStat(formatarMoeda(perfil.total_faturado), "total faturado"),
    );
  } else {
    stats.append(
      criarStat(perfil.livros_comprados, "livros comprados"),
      criarStat(membroDesde(perfil.data_cadastro), "membro desde"),
    );
  }
}

function preencherFormulario(perfil) {
  CAMPOS.forEach((campo) => {
    document.getElementById(campo).value = perfil[campo] || "";
  });
  document.getElementById("telefone").value = formatarTelefone(perfil.telefone);
  document.getElementById("endereco_cep").value = formatarCep(perfil.endereco_cep);
  document.getElementById("email").value = perfil.email || "";
  document.getElementById("cpf").value = formatarCpf(perfil.cpf);
}

function aplicarPerfil(perfil) {
  perfilAtual = perfil;
  desenharFoto(perfil);
  desenharResumo(perfil);
  preencherFormulario(perfil);

  // mantém o cache usado pelo menu do cabeçalho
  localStorage.setItem("bookly_usuario_nome", perfil.primeiro_nome);
  if (perfil.foto_perfil) localStorage.setItem("bookly_usuario_foto", perfil.foto_perfil);
  else localStorage.removeItem("bookly_usuario_foto");
  if (window.BooklyMenu) window.BooklyMenu.atualizar();

  // Inicializa o Autocomplete de CEP e endereço no perfil
  if (window.BooklyMasks && window.BooklyMasks.configurarAutocompleteEndereco) {
    BooklyMasks.configurarAutocompleteEndereco({
      cep: document.getElementById("endereco_cep"),
      rua: document.getElementById("endereco_rua"),
      bairro: document.getElementById("endereco_bairro"),
      cidade: document.getElementById("endereco_cidade"),
      estado: document.getElementById("endereco_estado"),
      numero: document.getElementById("endereco_numero"),
      complemento: document.getElementById("endereco_complemento"),
    });
  }
}

async function enviarAtualizacao(dados) {
  const perfil = await apiRequest(`/perfil/${tipo}/${id}`, { method: "PUT", body: dados });
  aplicarPerfil(perfil);
  return perfil;
}

// ---------- carregar ----------
async function carregarPerfil() {
  if (!tipo || !id) {
    window.location.href = "../login/login.html";
    return;
  }
  try {
    const perfil = await apiRequest(`/perfil/${tipo}/${id}`);
    statusEl.hidden = true;
    layoutEl.hidden = false;
    aplicarPerfil(perfil);
  } catch (erro) {
    statusEl.textContent = "Não foi possível carregar o perfil agora.";
    console.error(erro);
  }
}

// Auto-completar endereço via ViaCEP no perfil
const cepPerfilInput = document.getElementById("endereco_cep");
async function buscarCepPerfil() {
  if (!cepPerfilInput) return;
  const limpo = cepPerfilInput.value.replace(/\D/g, "");
  if (limpo.length !== 8) return;

  const dados = await (window.BooklyMasks ? window.BooklyMasks.consultarViaCEP(limpo) : null);
  if (dados) {
    if (dados.rua) document.getElementById("endereco_rua").value = dados.rua;
    if (dados.bairro) document.getElementById("endereco_bairro").value = dados.bairro;
    if (dados.cidade) document.getElementById("endereco_cidade").value = dados.cidade;
    if (dados.estado) document.getElementById("endereco_estado").value = dados.estado.toUpperCase();
    document.getElementById("endereco_numero").focus();
  }
}
if (cepPerfilInput) {
  cepPerfilInput.addEventListener("blur", buscarCepPerfil);
  cepPerfilInput.addEventListener("input", () => {
    if (cepPerfilInput.value.replace(/\D/g, "").length === 8) buscarCepPerfil();
  });
}

// ---------- salvar dados ----------
document.getElementById("form-perfil").addEventListener("submit", async (event) => {
  event.preventDefault();
  const botao = document.getElementById("btn-salvar");

  const dados = {};
  CAMPOS.forEach((campo) => { dados[campo] = document.getElementById(campo).value.trim(); });

  if (!dados.primeiro_nome) return mostrarMensagem("Informe o seu nome.", true);
  if (!dados.usuario) return mostrarMensagem("Informe o nome de usuário.", true);

  // Validação de telefone no perfil (se preenchido, mínimo 10 dígitos)
  const telLimpo = (dados.telefone || "").replace(/\D/g, "");
  if (telLimpo.length > 0 && (telLimpo.length < 10 || telLimpo.length > 11)) {
    return mostrarMensagem("Telefone inválido. Informe o DDD e o número completo.", true);
  }

  // Validação de CEP no perfil (se preenchido, 8 dígitos válidos)
  const cepLimpo = (dados.endereco_cep || "").replace(/\D/g, "");
  if (cepLimpo.length > 0 && (window.BooklyMasks ? !window.BooklyMasks.validarCEP(cepLimpo) : cepLimpo.length !== 8)) {
    return mostrarMensagem("CEP inválido. O CEP deve conter 8 dígitos numéricos válidos.", true);
  }

  // Sanitização de dados de endereço e strings
  if (dados.endereco_estado) {
    dados.endereco_estado = dados.endereco_estado.toUpperCase();
  }

  botao.disabled = true;
  try {
    await enviarAtualizacao(dados);
    mostrarMensagem("Alterações salvas com sucesso.");
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botao.disabled = false;
  }
});

// ---------- alterar senha ----------
document.getElementById("form-senha").addEventListener("submit", async (event) => {
  event.preventDefault();
  const atual = document.getElementById("senha_atual").value;
  const nova = document.getElementById("senha_nova").value;
  const confirma = document.getElementById("senha_confirma").value;

  if (!atual || !nova || !confirma) return mostrarMensagem("Preencha os três campos de senha.", true);
  if (nova !== confirma) return mostrarMensagem("A confirmação não confere com a nova senha.", true);

  const botao = document.getElementById("btn-senha");
  botao.disabled = true;
  try {
    await apiRequest(`/perfil/${tipo}/${id}/senha`, {
      method: "PUT",
      body: { senha_atual: atual, senha_nova: nova },
    });
    event.target.reset();
    mostrarMensagem("Senha alterada com sucesso.");
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botao.disabled = false;
  }
});

// ---------- foto: escolher, comprimir (recorte quadrado) e enviar ----------
function comprimirFoto(arquivo, lado = 240, qualidade = 0.8) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("O arquivo escolhido não é uma imagem válida."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = lado;
        canvas.height = lado;
        const ladoOrigem = Math.min(img.width, img.height);
        const sx = (img.width - ladoOrigem) / 2;
        const sy = (img.height - ladoOrigem) / 2;
        canvas.getContext("2d").drawImage(img, sx, sy, ladoOrigem, ladoOrigem, 0, 0, lado, lado);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

document.getElementById("btn-trocar-foto").addEventListener("click", () => fotoInput.click());

fotoInput.addEventListener("change", async () => {
  const arquivo = fotoInput.files[0];
  fotoInput.value = "";
  if (!arquivo) return;
  if (!arquivo.type.startsWith("image/")) return mostrarMensagem("Escolha um arquivo de imagem.", true);

  try {
    const foto = await comprimirFoto(arquivo);
    await enviarAtualizacao({ foto_perfil: foto });
    mostrarMensagem("Foto atualizada.");
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

document.getElementById("btn-remover-foto").addEventListener("click", async () => {
  try {
    await enviarAtualizacao({ foto_perfil: "" });
    mostrarMensagem("Foto removida.");
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

carregarPerfil();
