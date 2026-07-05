const API_URL = "http://127.0.0.1:5000/compradores";

const formComprador = document.querySelector("#form-comprador");
const compradorId = document.querySelector("#comprador-id");
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
const tabelaCompradores = document.querySelector("#tabela-compradores");
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
    compradorId.value = "";
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
    tituloFormulario.textContent = "Cadastrar comprador";
    botaoSalvar.textContent = "Salvar";
}

async function listarCompradores() {
    try {
        const resposta = await fetch(API_URL);
        const compradores = await resposta.json();

        tabelaCompradores.innerHTML = "";

        if (compradores.length === 0) {
            tabelaCompradores.innerHTML = `
                <tr>
                    <td colspan="5">Nenhum comprador cadastrado.</td>
                </tr>
            `;
            return;
        }

        compradores.forEach((comprador) => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td data-label="ID">${comprador.id_comprador}</td>
                <td data-label="Nome">${comprador.primeiro_nome} ${comprador.segundo_nome ?? ""}</td>
                <td data-label="E-mail">${comprador.email}</td>
                <td data-label="CPF">${comprador.cpf}</td>
                <td data-label="Ações">
                    <div class="acoes-tabela">
                        <button onclick='prepararEdicao(${JSON.stringify(comprador)})'>Editar</button>
                        <button class="perigo" onclick="deletarComprador(${comprador.id_comprador})">Excluir</button>
                    </div>
                </td>
            `;

            tabelaCompradores.appendChild(linha);
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível carregar os compradores. Verifique se a API está rodando.", "erro");
    }
}

function prepararEdicao(comprador) {
    compradorId.value = comprador.id_comprador;
    campoLogin.value = comprador.login;
    campoSenha.value = "";
    campoSenha.required = false;
    campoSenha.placeholder = "Deixe em branco para manter a senha atual";
    campoUsuario.value = comprador.usuario;
    campoCpf.value = comprador.cpf;
    campoTelefone.value = comprador.telefone ?? "";
    campoEmail.value = comprador.email;
    campoPrimeiroNome.value = comprador.primeiro_nome;
    campoSegundoNome.value = comprador.segundo_nome ?? "";
    campoDataNascimento.value = comprador.data_nascimento ?? "";
    campoEnderecoRua.value = comprador.endereco_rua ?? "";
    campoEnderecoNumero.value = comprador.endereco_numero ?? "";
    campoEnderecoComplemento.value = comprador.endereco_complemento ?? "";
    campoEnderecoBairro.value = comprador.endereco_bairro ?? "";
    campoEnderecoCidade.value = comprador.endereco_cidade ?? "";
    campoEnderecoEstado.value = comprador.endereco_estado ?? "";
    campoEnderecoCep.value = comprador.endereco_cep ?? "";
    tituloFormulario.textContent = "Editar comprador";
    botaoSalvar.textContent = "Atualizar";
    mostrarMensagem("Editando comprador selecionado.", "sucesso");
}

async function salvarComprador(evento) {
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

    const id = compradorId.value;
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
            mostrarMensagem(erro.erro || "Erro ao salvar comprador.", "erro");
            return;
        }

        mostrarMensagem(id ? "Comprador atualizado com sucesso." : "Comprador cadastrado com sucesso.", "sucesso");
        limparFormulario();
        listarCompradores();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

async function deletarComprador(id) {
    const confirmar = confirm("Deseja realmente excluir este comprador?");

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            mostrarMensagem(erro.erro || "Erro ao excluir comprador.", "erro");
            return;
        }

        mostrarMensagem("Comprador excluído com sucesso.", "sucesso");
        listarCompradores();
    } catch (erro) {
        mostrarMensagem("Erro de conexão com a API.", "erro");
    }
}

formComprador.addEventListener("submit", salvarComprador);
botaoCancelar.addEventListener("click", limparFormulario);
botaoRecarregar.addEventListener("click", listarCompradores);

listarCompradores();