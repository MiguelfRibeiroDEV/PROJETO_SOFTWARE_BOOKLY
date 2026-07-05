const API_URL = "http://127.0.0.1:5000/itens";
const API_LIVROS_URL = "http://127.0.0.1:5000/livros";
const API_COMPRADORES_URL = "http://127.0.0.1:5000/compradores";

const formItem = document.querySelector("#form-item");
const itemId = document.querySelector("#item-id");
const campoPreco = document.querySelector("#preco");
const campoEdicao = document.querySelector("#edicao");
const campoDescricao = document.querySelector("#descricao");
const campoAnoAquisicao = document.querySelector("#ano_aquisicao");
const campoConservacao = document.querySelector("#conservacao");
const campoTipoCapa = document.querySelector("#tipo_capa");
const campoRaridade = document.querySelector("#raridade");
const campoDedicatorio = document.querySelector("#dedicatorio");
const campoPresencaDeGrifos = document.querySelector("#presenca_de_grifos");
const campoFotosItem = document.querySelector("#fotos_item");
const campoIdLivro = document.querySelector("#id_livro");
const campoIdComprador = document.querySelector("#id_comprador");
const tabelaItens = document.querySelector("#tabela-itens");
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
    itemId.value = "";
    campoPreco.value = "";
    campoEdicao.value = "";
    campoDescricao.value = "";
    campoAnoAquisicao.value = "";
    campoConservacao.value = "";
    campoTipoCapa.value = "";
    campoRaridade.value = "";
    campoDedicatorio.checked = false;
    campoPresencaDeGrifos.checked = false;
    campoFotosItem.value = "";
    campoIdLivro.value = "";
    campoIdComprador.value = "";
    tituloFormulario.textContent = "Cadastrar item";
    botaoSalvar.textContent = "Salvar";
}

async function carregarOpcoesLivro() {
    try {
        const resposta = await fetch(API_LIVROS_URL);
        const livros = await resposta.json();

        campoIdLivro.innerHTML = '<option value="">Selecione...</option>';
        livros.forEach((livro) => {
            const opcao = document.createElement("option");
            opcao.value = livro.id_livro;
            opcao.textContent = `${livro.nome} (#${livro.id_livro})`;
            campoIdLivro.appendChild(opcao);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar a lista de livros.", "erro");
    }
}

async function carregarOpcoesComprador() {
    try {
        const resposta = await fetch(API_COMPRADORES_URL);
        const compradores = await resposta.json();

        campoIdComprador.innerHTML = '<option value="">Ainda não vendido</option>';
        compradores.forEach((comprador) => {
            const opcao = document.createElement("option");
            opcao.value = comprador.id_comprador;
            opcao.textContent = `${comprador.primeiro_nome} (#${comprador.id_comprador})`;
            campoIdComprador.appendChild(opcao);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar a lista de compradores.", "erro");
    }
}

async function listarItens() {
    try {
        const resposta = await fetch(API_URL);
        const itens = await resposta.json();

        tabelaItens.innerHTML = "";

        if (itens.length === 0) {
            tabelaItens.innerHTML = `
                <tr>
                    <td colspan="5">Nenhum item cadastrado.</td>
                </tr>
            `;
            return;
        }

        itens.forEach((item) => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td data-label="ID">${item.id_item}</td>
                <td data-label="ID Livro">${item.id_livro}</td>
                <td data-label="Preço">${item.preco}</td>
                <td data-label="Conservação">${item.conservacao ?? ""}</td>
                <td data-label="Ações">
                    <div class="acoes-tabela">
                        <button onclick='prepararEdicao(${JSON.stringify(item)})'>Editar</button>
                        <button class="perigo" onclick="deletarItem(${item.id_item})">Excluir</button>
                    </div>
                </td>
            `;

            tabelaItens.appendChild(linha);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar os itens. Verifique se a API está rodando.", "erro");
    }
}

function prepararEdicao(item) {
    itemId.value = item.id_item;
    campoPreco.value = item.preco;
    campoEdicao.value = item.edicao ?? "";
    campoDescricao.value = item.descricao ?? "";
    campoAnoAquisicao.value = item.ano_aquisicao ?? "";
    campoConservacao.value = item.conservacao ?? "";
    campoTipoCapa.value = item.tipo_capa ?? "";
    campoRaridade.value = item.raridade ?? "";
    campoDedicatorio.checked = !!item.dedicatorio;
    campoPresencaDeGrifos.checked = !!item.presenca_de_grifos;
    campoFotosItem.value = item.fotos_item ?? "";
    campoIdLivro.value = item.id_livro;
    campoIdComprador.value = item.id_comprador ?? "";
    tituloFormulario.textContent = "Editar item";
    botaoSalvar.textContent = "Atualizar";
    mostrarMensagem("Editando item selecionado.", "sucesso");
}

async function salvarItem(evento) {
    evento.preventDefault();

    const dados = {
        preco: campoPreco.value ? Number(campoPreco.value) : null,
        edicao: campoEdicao.value,
        descricao: campoDescricao.value,
        ano_aquisicao: campoAnoAquisicao.value ? Number(campoAnoAquisicao.value) : null,
        conservacao: campoConservacao.value,
        tipo_capa: campoTipoCapa.value,
        raridade: campoRaridade.value,
        dedicatorio: campoDedicatorio.checked,
        presenca_de_grifos: campoPresencaDeGrifos.checked,
        fotos_item: campoFotosItem.value,
        id_livro: campoIdLivro.value ? Number(campoIdLivro.value) : null,
        id_comprador: campoIdComprador.value ? Number(campoIdComprador.value) : null,
    };

    const id = itemId.value;
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
            mostrarMensagem(erro.erro || "Erro ao salvar item.", "erro");
            return;
        }

        mostrarMensagem(id ? "Item atualizado com sucesso." : "Item cadastrado com sucesso.", "sucesso");
        limparFormulario();
        listarItens();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

async function deletarItem(id) {
    const confirmar = confirm("Deseja realmente excluir este item?");

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            mostrarMensagem(erro.erro || "Erro ao excluir item.", "erro");
            return;
        }

        mostrarMensagem("Item excluído com sucesso.", "sucesso");
        listarItens();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

formItem.addEventListener("submit", salvarItem);
botaoCancelar.addEventListener("click", limparFormulario);
botaoRecarregar.addEventListener("click", listarItens);

carregarOpcoesLivro();
carregarOpcoesComprador();
listarItens();