import unittest
from app import create_app
from models.database import db
from models.livreiro_model import Livreiro
from models.comprador_model import Comprador
from models.livro_model import Livro
from models.item_model import Item
from models.categoria_model import Categoria

class BooklyTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config["TESTING"] = True
        cls.client = cls.app.test_client()

    def test_01_home(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("mensagem", data)

    def test_02_login_email(self):
        res = self.client.post("/login", json={"email": "joao@teste.com", "senha": "teste"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["tipo"], "livreiro")
        self.assertNotIn("senha", data)

    def test_03_login_usuario(self):
        res = self.client.post("/login", json={"email": "joaobooks", "senha": "teste"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["tipo"], "livreiro")

    def test_04_login_comprador(self):
        res = self.client.post("/login", json={"email": "lucascomprador", "senha": "teste123"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["tipo"], "comprador")

    def test_05_categorias(self):
        res = self.client.get("/categorias")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_06_livros_filtro(self):
        res = self.client.get("/livros/filtro")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_07_relatorio_preco_medio(self):
        res = self.client.get("/relatorios/preco-medio-categoria")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)

    def test_08_dashboard_livreiro(self):
        res = self.client.get("/livreiros/1/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("livreiro", data)
        self.assertIn("ranking_livros", data)

    def test_09_catalogo_livreiro(self):
        res = self.client.get("/livreiros/1/catalogo")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)

    def test_10_relatorio_vendas(self):
        res = self.client.get("/livreiros/1/relatorio-vendas")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("vendas", data)
        self.assertIn("resumo", data)

    def test_11_perfil_comprador(self):
        res = self.client.get("/perfil/comprador/1")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["tipo"], "comprador")
        self.assertNotIn("senha", data)

    def test_12_carrinho(self):
        res = self.client.get("/compradores/1/carrinho")
        self.assertEqual(res.status_code, 200)

    def test_13_favoritos(self):
        res = self.client.get("/compradores/1/favoritos")
        self.assertEqual(res.status_code, 200)

    def test_14_perguntas(self):
        res = self.client.get("/livreiros/1/perguntas")
        self.assertEqual(res.status_code, 200)

    def test_15_validacao_duplicados(self):
        res = self.client.post("/compradores", json={
            "primeiro_nome": "Teste",
            "login": "novo_login_teste",
            "usuario": "novo_usuario_teste",
            "senha": "password123",
            "cpf": "333.333.333-01",
            "email": "email_novo@teste.com"
        })
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertIn("erro", data)

    def test_16_ciclo_completo_livro_item_carrinho_pedido(self):
        # 1. Cria livro
        res_livro = self.client.post("/livros", json={
            "nome": "Livro de Teste Automatizado",
            "autor": "Autor Teste",
            "id_livreiro": 1,
            "id_categoria": 1,
            "isbn": "9789999999999"
        })
        self.assertEqual(res_livro.status_code, 201)
        livro_id = res_livro.get_json()["id_livro"]

        # 2. Cria item
        res_item = self.client.post("/itens", json={
            "id_livro": livro_id,
            "preco": 35.50,
            "conservacao": "Excelente"
        })
        self.assertEqual(res_item.status_code, 201)
        item_id = res_item.get_json()["id_item"]

        # 3. Adiciona ao carrinho do comprador 1 e lista o carrinho
        res_car = self.client.post("/compradores/1/carrinho", json={"id_item": item_id})
        self.assertEqual(res_car.status_code, 201)
        res_list_car = self.client.get("/compradores/1/carrinho")
        self.assertEqual(res_list_car.status_code, 200)
        self.assertIn("itens", res_list_car.get_json())

        # 4. Adiciona aos favoritos do comprador 1
        res_fav = self.client.post("/compradores/1/favoritos", json={"id_item": item_id})
        self.assertEqual(res_fav.status_code, 201)

        # 5. Faz pergunta sobre o item
        res_perg = self.client.post(f"/itens/{item_id}/perguntas", json={
            "id_comprador": 1,
            "texto": "Está bem conservado?"
        })
        self.assertEqual(res_perg.status_code, 201)

        # 6. Efetua compra direta do item
        res_ped = self.client.post("/pedidos", json={
            "id_item": item_id,
            "id_comprador": 1
        })
        self.assertEqual(res_ped.status_code, 201)

        # 7. Limpa o item e o livro de teste do banco
        with self.app.app_context():
            item_obj = db.session.get(Item, item_id)
            if item_obj:
                item_obj.deletar()
            livro_obj = db.session.get(Livro, livro_id)
            if livro_obj:
                livro_obj.deletar()

    def test_17_validacao_cpf_invalido(self):
        # Tenta cadastrar com CPF com dígitos repetidos ou tamanho incorreto
        res = self.client.post("/compradores", json={
            "primeiro_nome": "Invalido",
            "login": "cpf_invalido_login",
            "usuario": "cpf_invalido_user",
            "senha": "password123",
            "cpf": "11111111111",
            "email": "cpf_invalido_teste@teste.com"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("CPF inválido", res.get_json()["erro"])

    def test_18_validacao_email_invalido(self):
        # Tenta cadastrar com email puramente numérico ou sem @ (da imagem do usuário)
        res = self.client.post("/compradores", json={
            "primeiro_nome": "Invalido",
            "login": "email_invalido_login",
            "usuario": "email_invalido_user",
            "senha": "password123",
            "cpf": "52998224725", # CPF matematicamente válido para teste de isolamento
            "email": "313231231231232313123"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("e-mail", res.get_json()["erro"].lower())

    def test_19_validacao_telefone_perfil(self):
        # Tenta atualizar perfil com telefone com 20 dígitos numéricos aleatórios
        res = self.client.put("/perfil/comprador/1", json={
            "telefone": "32123231331232132321"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("Telefone", res.get_json()["erro"])

    def test_20_sanitizacao_perfil(self):
        # Atualiza com dados válidos porém sem máscara e verifica a padronização no banco
        res = self.client.put("/perfil/comprador/1", json={
            "telefone": "31988887777",
            "endereco_cep": "30130150",
            "endereco_estado": "mg",
            "endereco_numero": " 120 A "
        })
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertEqual(dados["telefone"], "(31) 98888-7777")
        self.assertEqual(dados["endereco_cep"], "30130-150")
        self.assertEqual(dados["endereco_estado"], "MG")
        self.assertEqual(dados["endereco_numero"], "120 A")

    def test_21_faixa_preco(self):
        # Consulta a faixa dinâmica de menor e maior preço real dos itens
        res = self.client.get("/itens/faixa-preco")
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertIn("preco_min", dados)
        self.assertIn("preco_max", dados)
        self.assertLessEqual(dados["preco_min"], dados["preco_max"])

    def test_22_recuperacao_senha_validar(self):
        # 1. Combinação errada deve falhar (400)
        res_err = self.client.post("/recuperar-senha/validar", json={
            "email": "inexistente@teste.com",
            "cpf": "12345678901"
        })
        self.assertEqual(res_err.status_code, 400)

        # 2. Combinação de livreiro existente (joao@teste.com / 12345678900)
        res_ok = self.client.post("/recuperar-senha/validar", json={
            "email": "joao@teste.com",
            "cpf": "123.456.789-00"
        })
        self.assertEqual(res_ok.status_code, 200)
        self.assertEqual(res_ok.get_json()["tipo"], "livreiro")

    def test_23_recuperacao_senha_redefinir(self):
        # 1. Senha curta deve falhar (< 6 chars)
        res_curta = self.client.post("/recuperar-senha/redefinir", json={
            "tipo": "livreiro",
            "id": 1,
            "cpf": "12345678900",
            "nova_senha": "123"
        })
        self.assertEqual(res_curta.status_code, 400)

        try:
            # 2. Senha válida atualiza com sucesso e permite login
            res_ok = self.client.post("/recuperar-senha/redefinir", json={
                "tipo": "livreiro",
                "id": 1,
                "cpf": "12345678900",
                "nova_senha": "nova_senha_teste"
            })
            self.assertEqual(res_ok.status_code, 200)

            # 3. Confirma que login funciona com a nova senha
            res_login = self.client.post("/login", json={
                "email": "joao@teste.com",
                "senha": "nova_senha_teste"
            })
            self.assertEqual(res_login.status_code, 200)
        finally:
            # Garante a restauração da senha 'teste' do seed no banco de dados
            with self.app.app_context():
                l = db.session.get(Livreiro, 1)
                if l:
                    l.senha = "teste"
                    db.session.commit()

    def test_24_consulta_isbn(self):
        # 1. Consulta ISBN real do livro Harry Potter (deve retornar 200 com dados)
        res = self.client.get("/livros/consulta-isbn/9788532511010")
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertIn("titulo", dados)
        self.assertIn("autores", dados)
        self.assertIn("Harry Potter", dados["titulo"])

        # 2. ISBN inválido com poucos dígitos deve retornar 404
        res_inv = self.client.get("/livros/consulta-isbn/123")
        self.assertEqual(res_inv.status_code, 404)

    def test_17_validacao_cpf_invalido(self):
        # Tenta cadastrar com CPF com dígitos repetidos ou tamanho incorreto
        res = self.client.post("/compradores", json={
            "primeiro_nome": "Invalido",
            "login": "cpf_invalido_login",
            "usuario": "cpf_invalido_user",
            "senha": "password123",
            "cpf": "11111111111",
            "email": "cpf_invalido_teste@teste.com"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("CPF inválido", res.get_json()["erro"])

    def test_18_validacao_email_invalido(self):
        # Tenta cadastrar com email puramente numérico ou sem @ (da imagem do usuário)
        res = self.client.post("/compradores", json={
            "primeiro_nome": "Invalido",
            "login": "email_invalido_login",
            "usuario": "email_invalido_user",
            "senha": "password123",
            "cpf": "52998224725", # CPF matematicamente válido para teste de isolamento
            "email": "313231231231232313123"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("e-mail", res.get_json()["erro"].lower())

    def test_19_validacao_telefone_perfil(self):
        # Tenta atualizar perfil com telefone com 20 dígitos numéricos aleatórios
        res = self.client.put("/perfil/comprador/1", json={
            "telefone": "32123231331232132321"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("Telefone", res.get_json()["erro"])

    def test_20_sanitizacao_perfil(self):
        # Atualiza com dados válidos porém sem máscara e verifica a padronização no banco
        res = self.client.put("/perfil/comprador/1", json={
            "telefone": "31988887777",
            "endereco_cep": "30130150",
            "endereco_estado": "mg",
            "endereco_numero": " 120 A "
        })
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertEqual(dados["telefone"], "(31) 98888-7777")
        self.assertEqual(dados["endereco_cep"], "30130-150")
        self.assertEqual(dados["endereco_estado"], "MG")
        self.assertEqual(dados["endereco_numero"], "120 A")

    def test_21_faixa_preco(self):
        # Consulta a faixa dinâmica de menor e maior preço real dos itens
        res = self.client.get("/itens/faixa-preco")
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertIn("preco_min", dados)
        self.assertIn("preco_max", dados)
        self.assertLessEqual(dados["preco_min"], dados["preco_max"])

    def test_22_recuperacao_senha_validar(self):
        # 1. Combinação errada deve falhar (400)
        res_err = self.client.post("/recuperar-senha/validar", json={
            "email": "inexistente@teste.com",
            "cpf": "12345678901"
        })
        self.assertEqual(res_err.status_code, 400)

        # 2. Combinação de livreiro existente (joao@teste.com / 12345678900)
        res_ok = self.client.post("/recuperar-senha/validar", json={
            "email": "joao@teste.com",
            "cpf": "123.456.789-00"
        })
        self.assertEqual(res_ok.status_code, 200)
        self.assertEqual(res_ok.get_json()["tipo"], "livreiro")

    def test_23_recuperacao_senha_redefinir(self):
        # 1. Senha curta deve falhar (< 6 chars)
        res_curta = self.client.post("/recuperar-senha/redefinir", json={
            "tipo": "livreiro",
            "id": 1,
            "cpf": "12345678900",
            "nova_senha": "123"
        })
        self.assertEqual(res_curta.status_code, 400)

        try:
            # 2. Senha válida atualiza com sucesso e permite login
            res_ok = self.client.post("/recuperar-senha/redefinir", json={
                "tipo": "livreiro",
                "id": 1,
                "cpf": "12345678900",
                "nova_senha": "nova_senha_teste"
            })
            self.assertEqual(res_ok.status_code, 200)

            # 3. Confirma que login funciona com a nova senha
            res_login = self.client.post("/login", json={
                "email": "joao@teste.com",
                "senha": "nova_senha_teste"
            })
            self.assertEqual(res_login.status_code, 200)
        finally:
            # Garante a restauração da senha 'teste' do seed no banco de dados
            with self.app.app_context():
                l = db.session.get(Livreiro, 1)
                if l:
                    l.senha = "teste"
                    db.session.commit()

    def test_24_consulta_isbn(self):
        # 1. Consulta ISBN real do livro Harry Potter (deve retornar 200 com dados)
        res = self.client.get("/livros/consulta-isbn/9788532511010")
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertIn("titulo", dados)
        self.assertIn("autores", dados)
        self.assertIn("Harry Potter", dados["titulo"])

        # 2. ISBN inválido com poucos dígitos deve retornar 404
        res_inv = self.client.get("/livros/consulta-isbn/123")
        self.assertEqual(res_inv.status_code, 404)

    def test_25_buscar_sugestoes_livros(self):
        # 1. Busca vazia ou curta (< 2 caracteres)
        res_vazia = self.client.get("/livros/buscar-sugestoes?q=a")
        self.assertEqual(res_vazia.status_code, 200)
        self.assertEqual(res_vazia.get_json(), [])

        # 2. Busca por termo existente
        res = self.client.get("/livros/buscar-sugestoes?q=harry")
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertIsInstance(dados, list)
        if len(dados) > 0:
            self.assertIn("titulo", dados[0])
            self.assertIn("autores", dados[0])

    def test_24_consulta_isbn(self):
        # 1. Consulta ISBN real do livro Harry Potter (deve retornar 200 com dados)
        res = self.client.get("/livros/consulta-isbn/9788532511010")
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertIn("titulo", dados)
        self.assertIn("autores", dados)
        self.assertIn("Harry Potter", dados["titulo"])

        # 2. ISBN inválido com poucos dígitos deve retornar 404
        res_inv = self.client.get("/livros/consulta-isbn/123")
        self.assertEqual(res_inv.status_code, 404)

    def test_25_buscar_sugestoes_livros(self):
        # 1. Busca vazia ou curta (< 2 caracteres)
        res_vazia = self.client.get("/livros/buscar-sugestoes?q=a")
        self.assertEqual(res_vazia.status_code, 200)
        self.assertEqual(res_vazia.get_json(), [])

        # 2. Busca por termo existente
        res = self.client.get("/livros/buscar-sugestoes?q=harry")
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertIsInstance(dados, list)
        if len(dados) > 0:
            self.assertIn("titulo", dados[0])
            self.assertIn("autores", dados[0])

    def test_26_ia_precificar(self):
        payload = {
            "livro": {
                "titulo": "O Cortiço",
                "autor": "Aluísio Azevedo",
                "id_categoria": 1,
                "idioma": "Português (BR)",
            },
            "exemplar": {
                "conservacao": "Bom",
                "tipo_capa": "Brochura",
                "raridade": "Comum",
                "observacoes": "Exemplar em bom estado, sem grifos.",
            },
        }
        res = self.client.post("/estimativas/ia-precificar", json=payload)
        self.assertEqual(res.status_code, 200)
        dados = res.get_json()
        self.assertTrue(dados.get("sucesso"))
        self.assertIn("estimativa", dados)
        self.assertIn("preco_sugerido", dados["estimativa"])
        self.assertGreater(dados["estimativa"]["preco_sugerido"], 0)
        self.assertIn(dados.get("origem"), ["ia", "heuristica_local"])
        self.assertIn("justificativa", dados["estimativa"])

if __name__ == "__main__":
    unittest.main()
