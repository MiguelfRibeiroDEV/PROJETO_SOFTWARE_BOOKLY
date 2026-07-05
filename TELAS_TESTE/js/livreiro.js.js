const API_URL = "http://127.0.0.1:5000/livreiros";

const formLivreiro = document.querySelector("#form-livreiro");
const livreiroId = document.querySelector("#livreiro-id");
const campoLogin = document.querySelector("#login");
const campoSenha = document.querySelector("#senha");
const campoUsuario = document.querySelector("#usuario");
const campoCpf = document.querySelector("#cpf");
const campoTelefone = document.querySelector("#telefone");
const campoEmail = document.querySelector("#email");
const campoPrimeiroNome = document.querySelector("#primeiro_nome");
const campoSegundoNome = document.querySelector("#segundo_nome");
const campoDataNascimento = document.querySelector("#data_nascimento");
const campoEnderecoRua = document.querySelector("#endereco_rua");
const campoEnderecoNumero = document.querySelector("#endereco_numero");
const campoEnderecoComplemento = document.querySelector("#endereco_complemento");
const campoEnderecoBairro = document.querySelector("#endereco_bairro");
const campoEnderecoCidade = document.querySelector("#endereco_cidade");
const campoEnderecoEstado = document.querySelector("#endereco_estado");
const campoEnderecoCep = document.querySelector("#endereco_cep");
const tabelaLivreiros = document.querySelector("#tabela-livreiros");
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
    livreiroId.value = "";
    campoLogin.value = "";
    campoSenha.value = "";
    campoUsuario.value = "";
    campoCpf.value = "";
    campoTelefone.value = "";
    campoEmail.value = "";
    campoPrimeiroNome.value = "";
    campoSegundoNome.value = "";
    campoDataNascimento.value = "";
    campoEnderecoRua.value = "";
    campoEnderecoNumero.value = "";
    campoEnderecoComplemento.value = "";
    campoEnderecoBairro.value = "";
    campoEnderecoCidade.value = "";
    campoEnderecoEstado.value = "";
    campoEnderecoCep.value = "";
    campoSenha.required = true;
    campoSenha.placeholder = "";
    tituloFormulario.textContent = "Cadastrar livreiro";
    botaoSalvar.textContent = "Salvar";
}

async function listarLivreiros() {
    try {
        const resposta = await fetch(API_URL);
        const livreiros = await resposta.json();

        tabelaLivreiros.innerHTML = "";

        if (livreiros.length === 0) {
            tabelaLivreiros.innerHTML = `
                <tr>
                    <td colspan="5">Nenhum livreiro cadastrado.</td>
                </tr>
            `;
            return;
        }

        livreiros.forEach((livreiro) => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td data-label="ID">${livreiro.id_livreiro}</td>
                <td data-label="Nome">${livreiro.primeiro_nome} ${livreiro.segundo_nome ?? ""}</td>
                <td data-label="E-mail">${livreiro.email}</td>
                <td data-label="CPF">${livreiro.cpf}</td>
                <td data-label="Ações">
                    <div class="acoes-tabela">
                        <button onclick='prepararEdicao(${JSON.stringify(livreiro)})'>Editar</button>
                        <button class="perigo" onclick="deletarLivreiro(${livreiro.id_livreiro})">Excluir</button>
                    </div>
                </td>
            `;

            tabelaLivreiros.appendChild(linha);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar os livreiros. Verifique se a API está rodando.", "erro");
    }
}

function prepararEdicao(livreiro) {
    livreiroId.value = livreiro.id_livreiro;
    campoLogin.value = livreiro.login;
    campoSenha.value = "";
    campoSenha.required = false;
    campoSenha.placeholder = "Deixe em branco para manter a senha atual";
    campoUsuario.value = livreiro.usuario;
    campoCpf.value = livreiro.cpf;
    campoTelefone.value = livreiro.telefone ?? "";
    campoEmail.value = livreiro.email;
    campoPrimeiroNome.value = livreiro.primeiro_nome;
    campoSegundoNome.value = livreiro.segundo_nome ?? "";
    campoDataNascimento.value = livreiro.data_nascimento ?? "";
    campoEnderecoRua.value = livreiro.endereco_rua ?? "";
    campoEnderecoNumero.value = livreiro.endereco_numero ?? "";
    campoEnderecoComplemento.value = livreiro.endereco_complemento ?? "";
    campoEnderecoBairro.value = livreiro.endereco_bairro ?? "";
    campoEnderecoCidade.value = livreiro.endereco_cidade ?? "";
    campoEnderecoEstado.value = livreiro.endereco_estado ?? "";
    campoEnderecoCep.value = livreiro.endereco_cep ?? "";
    tituloFormulario.textContent = "Editar livreiro";
    botaoSalvar.textContent = "Atualizar";
    mostrarMensagem("Editando livreiro selecionado.", "sucesso");
}

async function salvarLivreiro(evento) {
    evento.preventDefault();

    const dados = {
        login: campoLogin.value,
        usuario: campoUsuario.value,
        cpf: campoCpf.value,
        telefone: campoTelefone.value,
        email: campoEmail.value,
        primeiro_nome: campoPrimeiroNome.value,
        segundo_nome: campoSegundoNome.value,
        data_nascimento: campoDataNascimento.value,
        endereco_rua: campoEnderecoRua.value,
        endereco_numero: campoEnderecoNumero.value,
        endereco_complemento: campoEnderecoComplemento.value,
        endereco_bairro: campoEnderecoBairro.value,
        endereco_cidade: campoEnderecoCidade.value,
        endereco_estado: campoEnderecoEstado.value,
        endereco_cep: campoEnderecoCep.value,
    };

    // só envia a senha se o campo foi preenchido (na edição pode ficar em branco)
    if (campoSenha.value) {
        dados.senha = campoSenha.value;
    }

    const id = livreiroId.value;
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
            mostrarMensagem(erro.erro || "Erro ao salvar livreiro.", "erro");
            return;
        }

        mostrarMensagem(id ? "Livreiro atualizado com sucesso." : "Livreiro cadastrado com sucesso.", "sucesso");
        limparFormulario();
        listarLivreiros();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

async function deletarLivreiro(id) {
    const confirmar = confirm("Deseja realmente excluir este livreiro?");

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            mostrarMensagem(erro.erro || "Erro ao excluir livreiro.", "erro");
            return;
        }

        mostrarMensagem("Livreiro excluído com sucesso.", "sucesso");
        listarLivreiros();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

formLivreiro.addEventListener("submit", salvarLivreiro);
botaoCancelar.addEventListener("click", limparFormulario);
botaoRecarregar.addEventListener("click", listarLivreiros);

listarLivreiros();