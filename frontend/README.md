# Bookly - Frontend

Front-end reconstruído em **HTML + CSS + JavaScript puro** (sem frameworks),
seguindo as 5 telas do protótipo: Login/Cadastro de usuário, Cadastro de
livro (wizard de 3 passos), Marketplace (vitrine) e Planos.

## Estrutura de pastas

```
frontend/
├── index.html                     # redireciona para a tela de login
└── src/
    ├── assets/
    │   ├── images/logo.png        # arquivo de logo original (mantido)
    │   └── js/api.js              # helper único de chamadas fetch() à API
    ├── styles/
    │   ├── base/base.css          # reset, variáveis de cor, botões, logo (texto)
    │   ├── login/login.css
    │   ├── register/register.css
    │   ├── cadastro-livro/cadastro.css
    │   ├── marketplace/marketplace.css
    │   └── planos/planos.css
    └── pages/
        ├── login/           (login.html + login.js)
        ├── register/        (register.html + register.js)
        ├── cadastro-livro/  (cadastro.html + cadastro.js)   -> wizard 3 passos
        ├── marketplace/     (marketplace.html + marketplace.js)
        └── planos/          (planos.html)
```

Cada página carrega primeiro `styles/base/base.css` (variáveis/reset/logo
compartilhados) e depois seu próprio CSS. O logo "Bookly" é sempre texto
(`<span class="bookly-logo">`), nunca imagem, conforme pedido.

## Como rodar

Basta abrir `frontend/index.html` no navegador, ou servir a pasta com
qualquer servidor estático (ex: extensão "Live Server" do VS Code). As
páginas que consomem a API apontam para `http://127.0.0.1:5000`
(configurável em `src/assets/js/api.js`), então rode o backend Flask
antes de usar o marketplace/cadastro de livro/registro.

## Integração com o backend (o que já está conectado)

- **Cadastro de usuário** (`register.html`) → `POST /compradores` ou
  `POST /livreiros`, dependendo da aba escolhida.
- **Cadastro de livro** (`cadastro.html`) → `GET /categorias` (para o
  select), `POST /livros`, depois `POST /itens` (um por exemplar,
  conforme a quantidade informada), e usa `GET
  /relatorios/preco-medio-categoria` para montar os cartões de
  recomendação de preço do passo 3 com dados reais, em vez dos números
  fictícios do protótipo.
- **Marketplace** (`marketplace.html`) → `GET /livros/filtro` (que já
  retorna nome, autor, categoria e preço prontos, graças à procedure
  `sp_buscar_livros_filtro`) e `GET /categorias` para o filtro lateral.

## Pontos que eram pendência (já resolvidos)

1. ~~**Login** não tem endpoint no backend~~ — **resolvido.** Existe
   `POST /login` (`auth_controller.py` + `AutenticarUsuarioService`), e
   `login.js` já chama a API de verdade (não é mais modo demonstração).
2. ~~**`id_livreiro` fixo no cadastro de livro**~~ — **resolvido.**
   `cadastro.js` agora exige login real como livreiro antes de liberar a
   tela (redireciona para `login.html` caso contrário). O `id` usado é
   sempre o do livreiro autenticado, salvo em `bookly_livreiro_id` pelo
   `login.js`.
3. ~~**Filtros de Condição e Idioma eram só visuais**~~ — **resolvido.**
   Ambos os filtros agora funcionam de fato no marketplace, comparando
   com os valores reais de `item.conservacao` e `livro.idioma` vindos da
   API. O campo **Idioma** também foi adicionado ao formulário de
   cadastro de livro (antes não existia nenhuma tela para preenchê-lo).
   > Atenção: como a procedure `sp_buscar_livros_filtro` mudou (passou a
   > retornar `idioma`), é preciso rodar novamente
   > `backend/database/procedure.sql` no MySQL (o arquivo agora já tem
   > `DROP PROCEDURE IF EXISTS`, então pode rodar por cima sem erro).
4. ~~**Campo "Gênero" duplicado e não enviado ao backend**~~ —
   **resolvido.** O campo foi removido do formulário; a categorização do
   livro é feita só pela **Categoria**, que já é enviada corretamente à
   API.
