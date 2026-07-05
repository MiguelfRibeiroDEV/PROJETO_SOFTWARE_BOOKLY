// Configuração de cada entidade: usada pelo crud.js para montar
// a listagem e o formulário sem precisar de nenhuma sintaxe do Flask/Jinja.
//
// tipo pode ser: text, textarea, number, date, password, checkbox, select
// quando tipo === "select", é preciso informar:
//   fonte        -> endpoint da API para buscar as opções
//   fonte_valor  -> campo usado como value (chave primária)
//   fonte_label  -> campo usado como texto exibido

window.ENTIDADES = {
  categorias: {
    titulo: "Categorias",
    api: "/categorias",
    pk: "id_categoria",
    colunas: [
      { campo: "id_categoria", label: "ID" },
      { campo: "nome", label: "Nome" },
      { campo: "codigo_index", label: "Código" },
    ],
    campos: [
      { nome: "nome", label: "Nome", tipo: "text", obrigatorio: true },
      { nome: "descricao", label: "Descrição", tipo: "textarea" },
      { nome: "codigo_index", label: "Código de índice", tipo: "text" },
    ],
  },

  livreiros: {
    titulo: "Livreiros",
    api: "/livreiros",
    pk: "id_livreiro",
    colunas: [
      { campo: "id_livreiro", label: "ID" },
      { campo: "primeiro_nome", label: "Nome" },
      { campo: "email", label: "E-mail" },
      { campo: "cpf", label: "CPF" },
      { campo: "telefone", label: "Telefone" },
    ],
    campos: [
      { nome: "primeiro_nome", label: "Primeiro nome", tipo: "text", obrigatorio: true },
      { nome: "segundo_nome", label: "Segundo nome", tipo: "text" },
      { nome: "login", label: "Login", tipo: "text", obrigatorio: true },
      { nome: "senha", label: "Senha", tipo: "password", obrigatorio: true },
      { nome: "usuario", label: "Usuário", tipo: "text", obrigatorio: true },
      { nome: "cpf", label: "CPF", tipo: "text", obrigatorio: true },
      { nome: "email", label: "E-mail", tipo: "text", obrigatorio: true },
      { nome: "telefone", label: "Telefone", tipo: "text" },
      { nome: "data_nascimento", label: "Data de nascimento", tipo: "date" },
      { nome: "endereco_rua", label: "Rua", tipo: "text" },
      { nome: "endereco_numero", label: "Número", tipo: "text" },
      { nome: "endereco_complemento", label: "Complemento", tipo: "text" },
      { nome: "endereco_bairro", label: "Bairro", tipo: "text" },
      { nome: "endereco_cidade", label: "Cidade", tipo: "text" },
      { nome: "endereco_estado", label: "Estado (UF)", tipo: "text" },
      { nome: "endereco_cep", label: "CEP", tipo: "text" },
    ],
  },

  compradores: {
    titulo: "Compradores",
    api: "/compradores",
    pk: "id_comprador",
    colunas: [
      { campo: "id_comprador", label: "ID" },
      { campo: "primeiro_nome", label: "Nome" },
      { campo: "email", label: "E-mail" },
      { campo: "cpf", label: "CPF" },
      { campo: "telefone", label: "Telefone" },
    ],
    campos: [
      { nome: "primeiro_nome", label: "Primeiro nome", tipo: "text", obrigatorio: true },
      { nome: "segundo_nome", label: "Segundo nome", tipo: "text" },
      { nome: "login", label: "Login", tipo: "text", obrigatorio: true },
      { nome: "senha", label: "Senha", tipo: "password", obrigatorio: true },
      { nome: "usuario", label: "Usuário", tipo: "text", obrigatorio: true },
      { nome: "cpf", label: "CPF", tipo: "text", obrigatorio: true },
      { nome: "email", label: "E-mail", tipo: "text", obrigatorio: true },
      { nome: "telefone", label: "Telefone", tipo: "text" },
      { nome: "data_nascimento", label: "Data de nascimento", tipo: "date" },
      { nome: "endereco_rua", label: "Rua", tipo: "text" },
      { nome: "endereco_numero", label: "Número", tipo: "text" },
      { nome: "endereco_complemento", label: "Complemento", tipo: "text" },
      { nome: "endereco_bairro", label: "Bairro", tipo: "text" },
      { nome: "endereco_cidade", label: "Cidade", tipo: "text" },
      { nome: "endereco_estado", label: "Estado (UF)", tipo: "text" },
      { nome: "endereco_cep", label: "CEP", tipo: "text" },
    ],
  },

  livros: {
    titulo: "Livros",
    api: "/livros",
    pk: "id_livro",
    colunas: [
      { campo: "id_livro", label: "ID" },
      { campo: "isbn", label: "ISBN" },
      { campo: "nome", label: "Título" },
      { campo: "autor", label: "Autor" },
      { campo: "ano_publicacao", label: "Ano" },
    ],
    campos: [
      { nome: "isbn", label: "ISBN", tipo: "text", obrigatorio: true },
      { nome: "nome", label: "Título", tipo: "text", obrigatorio: true },
      { nome: "autor", label: "Autor", tipo: "text", obrigatorio: true },
      { nome: "editora", label: "Editora", tipo: "text" },
      { nome: "volume", label: "Volume", tipo: "text" },
      { nome: "idioma", label: "Idioma", tipo: "text" },
      { nome: "ano_publicacao", label: "Ano de publicação", tipo: "number" },
      { nome: "numero_paginas", label: "Número de páginas", tipo: "number" },
      { nome: "sinopse", label: "Sinopse", tipo: "textarea" },
      {
        nome: "id_livreiro", label: "Livreiro", tipo: "select", obrigatorio: true,
        fonte: "/livreiros", fonte_valor: "id_livreiro", fonte_label: "primeiro_nome",
      },
      {
        nome: "id_categoria", label: "Categoria", tipo: "select", obrigatorio: true,
        fonte: "/categorias", fonte_valor: "id_categoria", fonte_label: "nome",
      },
    ],
  },

  itens: {
    titulo: "Itens (exemplares à venda)",
    api: "/itens",
    pk: "id_item",
    colunas: [
      { campo: "id_item", label: "ID" },
      { campo: "id_livro", label: "ID Livro" },
      { campo: "preco", label: "Preço" },
      { campo: "conservacao", label: "Conservação" },
      { campo: "id_comprador", label: "ID Comprador" },
    ],
    campos: [
      { nome: "preco", label: "Preço", tipo: "number", obrigatorio: true },
      { nome: "edicao", label: "Edição", tipo: "text" },
      { nome: "descricao", label: "Descrição", tipo: "textarea" },
      { nome: "ano_aquisicao", label: "Ano de aquisição", tipo: "number" },
      { nome: "conservacao", label: "Conservação", tipo: "text" },
      { nome: "tipo_capa", label: "Tipo de capa", tipo: "text" },
      { nome: "raridade", label: "Raridade", tipo: "text" },
      { nome: "dedicatorio", label: "Possui dedicatória?", tipo: "checkbox" },
      { nome: "presenca_de_grifos", label: "Possui grifos?", tipo: "checkbox" },
      { nome: "fotos_item", label: "URLs das fotos", tipo: "text" },
      {
        nome: "id_livro", label: "Livro", tipo: "select", obrigatorio: true,
        fonte: "/livros", fonte_valor: "id_livro", fonte_label: "nome",
      },
      {
        nome: "id_comprador", label: "Comprador (se já vendido)", tipo: "select",
        fonte: "/compradores", fonte_valor: "id_comprador", fonte_label: "primeiro_nome",
      },
    ],
  },

  estimativas: {
    titulo: "Estimativas de preço",
    api: "/estimativas",
    pk: "id_estimativa",
    colunas: [
      { campo: "id_estimativa", label: "ID" },
      { campo: "id_item", label: "ID Item" },
      { campo: "preco_estimado", label: "Preço estimado" },
      { campo: "date_time", label: "Data/Hora" },
    ],
    campos: [
      { nome: "preco_estimado", label: "Preço estimado", tipo: "number" },
      { nome: "possivel_descricao", label: "Possível descrição", tipo: "textarea" },
      {
        nome: "id_item", label: "Item", tipo: "select", obrigatorio: true,
        fonte: "/itens", fonte_valor: "id_item", fonte_label: "descricao",
      },
    ],
  },
};