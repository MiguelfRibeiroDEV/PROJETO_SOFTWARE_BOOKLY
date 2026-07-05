const API_URL = "http://127.0.0.1:5000/livros";
const API_LIVREIROS_URL = "http://127.0.0.1:5000/livreiros";
const API_CATEGORIAS_URL = "http://127.0.0.1:5000/categorias";

const formLivro = document.querySelector("#form-livro");
const livroId = document.querySelector("#livro-id");
const campoIsbn = document.querySelector("#isbn");
const campoNome = document.querySelector("#nome");
const campoAutor = document.querySelector("#autor");
const campoEditora = document.querySelector("#editora");
const campoVolume = document.querySelector("#volume");
const campoIdioma = document.querySelector("#idioma");
const campoAnoPublicacao = document.querySelector("#ano_publicacao");
const campoNumeroPaginas = document.querySelector("#numero_paginas");
const campoSinopse = document.querySelector("#sinopse");
const campoIdLivreiro = document.querySelector("#id_livreiro");
const campoIdCategoria = document.querySelector("#id_categoria");
const tabelaLivros = document.querySelector("#tabela-livros");
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
    livroId.value = "";
    campoIsbn.value = "";
    campoNome.value = "";
    campoAutor.value = "";
    campoEditora.value = "";
    campoVolume.value = "";
    campoIdioma.value = "";
    campoAnoPublicacao.value = "";
    campoNumeroPaginas.value = "";
    campoSinopse.value = "";
    campoIdLivreiro.value = "";
    campoIdCategoria.value = "";
    tituloFormulario.textContent = "Cadastrar livro";
    botaoSalvar.textContent = "Salvar";
}

async function carregarOpcoesLivreiro() {
    try {
        const resposta = await fetch(API_LIVREIROS_URL);
        const livreiros = await resposta.json();

        campoIdLivreiro.innerHTML = '<option value="">Selecione...</option>';
        livreiros.forEach((livreiro) => {
            const opcao = document.createElement("option");
            opcao.value = livreiro.id_livreiro;
            opcao.textContent = `${livreiro.primeiro_nome} (#${livreiro.id_livreiro})`;
            campoIdLivreiro.appendChild(opcao);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar a lista de livreiros.", "erro");
    }
}

async function carregarOpcoesCategoria() {
    try {
        const resposta = await fetch(API_CATEGORIAS_URL);
        const categorias = await resposta.json();

        campoIdCategoria.innerHTML = '<option value="">Selecione...</option>';
        categorias.forEach((categoria) => {
            const opcao = document.createElement("option");
            opcao.value = categoria.id_categoria;
            opcao.textContent = categoria.nome;
            campoIdCategoria.appendChild(opcao);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar a lista de categorias.", "erro");
    }
}

async function listarLivros() {
    try {
        const resposta = await fetch(API_URL);
        const livros = await resposta.json();

        tabelaLivros.innerHTML = "";

        if (livros.length === 0) {
            tabelaLivros.innerHTML = `
                <tr>
                    <td colspan="5">Nenhum livro cadastrado.</td>
                </tr>
            `;
            return;
        }

        livros.forEach((livro) => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td data-label="ID">${livro.id_livro}</td>
                <td data-label="ISBN">${livro.isbn}</td>
                <td data-label="Título">${livro.nome}</td>
                <td data-label="Autor">${livro.autor}</td>
                <td data-label="Ações">
                    <div class="acoes-tabela">
                        <button onclick='prepararEdicao(${JSON.stringify(livro)})'>Editar</button>
                        <button class="perigo" onclick="deletarLivro(${livro.id_livro})">Excluir</button>
                    </div>
                </td>
            `;

            tabelaLivros.appendChild(linha);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar os livros. Verifique se a API está rodando.", "erro");
    }
}

function prepararEdicao(livro) {
    livroId.value = livro.id_livro;
    campoIsbn.value = livro.isbn;
    campoNome.value = livro.nome;
    campoAutor.value = livro.autor;
    campoEditora.value = livro.editora ?? "";
    campoVolume.value = livro.volume ?? "";
    campoIdioma.value = livro.idioma ?? "";
    campoAnoPublicacao.value = livro.ano_publicacao ?? "";
    campoNumeroPaginas.value = livro.numero_paginas ?? "";
    campoSinopse.value = livro.sinopse ?? "";
    campoIdLivreiro.value = livro.id_livreiro;
    campoIdCategoria.value = livro.id_categoria;
    tituloFormulario.textContent = "Editar livro";
    botaoSalvar.textContent = "Atualizar";
    mostrarMensagem("Editando livro selecionado.", "sucesso");
}

async function salvarLivro(evento) {
    evento.preventDefault();

    const dados = {
        isbn: campoIsbn.value,
        nome: campoNome.value,
        autor: campoAutor.value,
        editora: campoEditora.value,
        volume: campoVolume.value,
        idioma: campoIdioma.value,
        ano_publicacao: campoAnoPublicacao.value ? Number(campoAnoPublicacao.value) : null,
        numero_paginas: campoNumeroPaginas.value ? Number(campoNumeroPaginas.value) : null,
        sinopse: campoSinopse.value,
        id_livreiro: campoIdLivreiro.value ? Number(campoIdLivreiro.value) : null,
        id_categoria: campoIdCategoria.value ? Number(campoIdCategoria.value) : null,
    };

    const id = livroId.value;
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
            mostrarMensagem(erro.erro || "Erro ao salvar livro.", "erro");
            return;
        }

        mostrarMensagem(id ? "Livro atualizado com sucesso." : "Livro cadastrado com sucesso.", "sucesso");
        limparFormulario();
        listarLivros();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

async function deletarLivro(id) {
    const confirmar = confirm("Deseja realmente excluir este livro?");

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            mostrarMensagem(erro.erro || "Erro ao excluir livro.", "erro");
            return;
        }

        mostrarMensagem("Livro excluído com sucesso.", "sucesso");
        listarLivros();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

formLivro.addEventListener("submit", salvarLivro);
botaoCancelar.addEventListener("click", limparFormulario);
botaoRecarregar.addEventListener("click", listarLivros);

carregarOpcoesLivreiro();
carregarOpcoesCategoria();
listarLivros();