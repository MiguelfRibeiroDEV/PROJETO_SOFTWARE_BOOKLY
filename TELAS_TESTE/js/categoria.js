const API_URL = "http://127.0.0.1:5000/categorias";

const formCategoria = document.querySelector("#form-categoria");
const categoriaId = document.querySelector("#categoria-id");
const campoNome = document.querySelector("#nome");
const campoDescricao = document.querySelector("#descricao");
const campoCodigoIndex = document.querySelector("#codigo_index");
const tabelaCategorias = document.querySelector("#tabela-categorias");
const mensagem = document.querySelector("#mensagem");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const botaoRecarregar = document.querySelector("#botao-recarregar");

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

function limparFormulario() {
    categoriaId.value = "";
    campoNome.value = "";
    campoDescricao.value = "";
    campoCodigoIndex.value = "";
    tituloFormulario.textContent = "Cadastrar categoria";
    botaoSalvar.textContent = "Salvar";
}

async function listarCategorias() {
    try {
        const resposta = await fetch(API_URL);
        const categorias = await resposta.json();

        tabelaCategorias.innerHTML = "";

        if (categorias.length === 0) {
            tabelaCategorias.innerHTML = `
                <tr>
                    <td colspan="4">Nenhuma categoria cadastrada.</td>
                </tr>
            `;
            return;
        }

        categorias.forEach((categoria) => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td data-label="ID">${categoria.id_categoria}</td>
                <td data-label="Nome">${categoria.nome}</td>
                <td data-label="Código">${categoria.codigo_index ?? ""}</td>
                <td data-label="Ações">
                    <div class="acoes-tabela">
                        <button onclick='prepararEdicao(${JSON.stringify(categoria)})'>Editar</button>
                        <button class="perigo" onclick="deletarCategoria(${categoria.id_categoria})">Excluir</button>
                    </div>
                </td>
            `;

            tabelaCategorias.appendChild(linha);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar as categorias. Verifique se a API está rodando.", "erro");
    }
}

function prepararEdicao(categoria) {
    categoriaId.value = categoria.id_categoria;
    campoNome.value = categoria.nome;
    campoDescricao.value = categoria.descricao ?? "";
    campoCodigoIndex.value = categoria.codigo_index ?? "";
    tituloFormulario.textContent = "Editar categoria";
    botaoSalvar.textContent = "Atualizar";
    mostrarMensagem("Editando categoria selecionada.", "sucesso");
}

async function salvarCategoria(evento) {
    evento.preventDefault();

    const dados = {
        nome: campoNome.value,
        descricao: campoDescricao.value,
        codigo_index: campoCodigoIndex.value,
    };

    const id = categoriaId.value;
    const metodo = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            mostrarMensagem(erro.erro || "Erro ao salvar categoria.", "erro");
            return;
        }

        mostrarMensagem(id ? "Categoria atualizada com sucesso." : "Categoria cadastrada com sucesso.", "sucesso");
        limparFormulario();
        listarCategorias();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

async function deletarCategoria(id) {
    const confirmar = confirm("Deseja realmente excluir esta categoria?");

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            mostrarMensagem(erro.erro || "Erro ao excluir categoria.", "erro");
            return;
        }

        mostrarMensagem("Categoria excluída com sucesso.", "sucesso");
        listarCategorias();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

formCategoria.addEventListener("submit", salvarCategoria);
botaoCancelar.addEventListener("click", limparFormulario);
botaoRecarregar.addEventListener("click", listarCategorias);

listarCategorias();