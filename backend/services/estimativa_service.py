import json
import os
import urllib.error
import urllib.request

from models.estimativa_model import Estimativa
from models.item_model import Item
from repositories.categoria_repository import CategoriaRepository


class PrecificarComIaService:
    """Serviço inteligente que consulta o modelo Google Gemini (gemini-3.5-flash-lite)
    para precificar exemplares de livros com base em conservação, raridade, tipo de capa,
    avarias e dados de mercado do banco local. Inclui fallback heurístico local resiliente
    para garantir 100% de estabilidade e proteger o plano gratuito da chave."""

    def executar(self, dados):
        livro = dados.get("livro") or {}
        exemplar = dados.get("exemplar") or {}
        id_categoria = livro.get("id_categoria")

        # 1. Obter dados de mercado da categoria a partir do banco local
        ref_mercado = {"preco_medio": 22.0, "preco_minimo": 10.0, "preco_maximo": 45.0}
        try:
            relatorio = CategoriaRepository.relatorio_preco_medio()
            if id_categoria:
                linha = next((r for r in relatorio if str(r.get("id_categoria")) == str(id_categoria)), None)
                if linha:
                    ref_mercado = {
                        "preco_medio": float(linha.get("preco_medio") or 22.0),
                        "preco_minimo": float(linha.get("preco_minimo") or 10.0),
                        "preco_maximo": float(linha.get("preco_maximo") or 45.0),
                    }
        except Exception as e:
            print("Aviso ao buscar relatório da categoria:", e)

        # 2. Tentar chamar a API do Gemini
        api_key = os.getenv("GEMINI_API_KEY") or "AQ.Ab8RN6LBnd2exiGHKF1I7HilHwunDdnXwSprAjEdQvTIr7EW_A"
        model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

        if api_key:
            try:
                resultado_ia = self._chamar_gemini(api_key, model, livro, exemplar, ref_mercado)
                if resultado_ia and "preco_sugerido" in resultado_ia:
                    return {
                        "sucesso": True,
                        "origem": "ia",
                        "estimativa": resultado_ia,
                    }
            except Exception as e:
                print("Gemini API falhou ou cota gratuita excedida, acionando fallback local:", e)

        # 3. Fallback Heurístico Local (sempre garante resposta e nunca trava o protótipo)
        estimativa_local = self._calcular_fallback_local(livro, exemplar, ref_mercado)
        return {
            "sucesso": True,
            "origem": "heuristica_local",
            "estimativa": estimativa_local,
        }

    def _chamar_gemini(self, api_key, model, livro, exemplar, ref_mercado):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        system_prompt = (
            "Você é o motor de precificação inteligente do Bookly AI, especialista no mercado editorial brasileiro, "
            "sebos, livrarias e marketplaces de livros usados (Estante Virtual, Amazon Usados, Mercado Livre).\n"
            "Seu objetivo é sugerir o preço mais justo e competitivo em Reais (BRL) para um livro usado, analisando "
            "dados bibliográficos, conservação, avarias e referência do banco.\n"
            "Responda ESTRITAMENTE em formato JSON puro, sem blocos ```json ou ```, contendo as chaves: "
            "preco_sugerido (float com 2 casas decimais), faixa_preco (objeto com minimo e maximo float), "
            "nivel_confianca (alta/media/baixa), fatores_avaliados (array de objetos com fator, impacto e porcentagem), "
            "justificativa (string com 2 a 3 frases) e descricao_comercial (string pronta para anúncio)."
        )

        payload_input = {
            "livro": livro,
            "exemplar": exemplar,
            "referencia_mercado_bookly": ref_mercado,
        }

        body = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": json.dumps(payload_input, ensure_ascii=False)}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )

        with urllib.request.urlopen(req, timeout=12) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            content = res["candidates"][0]["content"]["parts"][0]["text"].strip()
            if content.startswith("```"):
                content = content.strip("`").replace("json\n", "", 1).strip()
            return json.loads(content)

    def _calcular_fallback_local(self, livro, exemplar, ref_mercado):
        base = ref_mercado.get("preco_medio") or 22.0
        conservacao = (exemplar.get("conservacao") or "Bom").lower()
        capa = (exemplar.get("tipo_capa") or "Brochura").lower()
        raridade = (exemplar.get("raridade") or "Comum").lower()

        multiplicador = 0.85
        if "perfeito" in conservacao:
            multiplicador = 1.05
        elif "bom" in conservacao:
            multiplicador = 0.85
        elif "médio" in conservacao or "medio" in conservacao:
            multiplicador = 0.65
        elif "ruim" in conservacao:
            multiplicador = 0.45
        elif "péssimo" in conservacao or "pessimo" in conservacao:
            multiplicador = 0.25

        if "dura" in capa:
            multiplicador += 0.15

        if "raro" in raridade:
            multiplicador += 0.35
        elif "esgotado" in raridade:
            multiplicador += 0.20

        preco_final = round(max(base * multiplicador, 8.00), 2)
        minimo = round(max(preco_final * 0.80, 5.00), 2)
        maximo = round(preco_final * 1.25, 2)

        titulo = livro.get("titulo") or "Livro"
        autor = livro.get("autor") or "Autor"
        obs = exemplar.get("observacoes") or "Sem avarias graves relatadas."

        return {
            "preco_sugerido": preco_final,
            "faixa_preco": {"minimo": minimo, "maximo": maximo},
            "nivel_confianca": "media",
            "fatores_avaliados": [
                {
                    "fator": f"Conservação ({exemplar.get('conservacao', 'Bom')})",
                    "impacto": "positivo" if multiplicador >= 0.8 else "negativo",
                    "porcentagem": f"{int((multiplicador - 1) * 100)}%",
                },
                {
                    "fator": f"Encadernação ({exemplar.get('tipo_capa', 'Brochura')})",
                    "impacto": "positivo" if "dura" in capa else "neutro",
                    "porcentagem": "+15%" if "dura" in capa else "0%",
                },
            ],
            "justificativa": (
                f"Estimativa calculada a partir do preço de referência da categoria (R$ {base:.2f}), "
                f"ponderada pelo estado de conservação '{exemplar.get('conservacao', 'Bom')}' e tipo de capa."
            ),
            "descricao_comercial": (
                f"Exemplar de '{titulo}' ({autor}) em estado {exemplar.get('conservacao', 'Bom')}, "
                f"encadernação {exemplar.get('tipo_capa', 'Brochura')}. {obs}"
            ),
        }


class CriarEstimativaService:
    def executar(self, dados):
        if not dados.get("id_item"):
            raise ValueError("O campo 'id_item' é obrigatório.")

        if not Item.buscar_por_id(dados["id_item"]):
            raise ValueError("Item informado não existe.")

        estimativa = Estimativa(
            id_item=dados["id_item"],
            preco_estimado=dados.get("preco_estimado"),
            possivel_descricao=dados.get("possivel_descricao"),
        )

        estimativa.salvar()
        return estimativa.to_dict()


class ListarEstimativasService:
    def executar(self):
        estimativas = Estimativa.listar_todos()
        return [estimativa.to_dict() for estimativa in estimativas]


class BuscarEstimativaPorIdService:
    def executar(self, estimativa_id):
        estimativa = Estimativa.buscar_por_id(estimativa_id)

        if estimativa is None:
            return None

        return estimativa.to_dict()


class AtualizarEstimativaService:
    def executar(self, estimativa_id, dados):
        estimativa = Estimativa.buscar_por_id(estimativa_id)

        if estimativa is None:
            return None

        novo_item_id = dados.get("id_item")
        if novo_item_id and not Item.buscar_por_id(novo_item_id):
            raise ValueError("Item informado não existe.")

        estimativa.atualizar(
            preco_estimado=dados.get("preco_estimado"),
            possivel_descricao=dados.get("possivel_descricao"),
            id_item=dados.get("id_item"),
        )

        return estimativa.to_dict()


class DeletarEstimativaService:
    def executar(self, estimativa_id):
        estimativa = Estimativa.buscar_por_id(estimativa_id)

        if estimativa is None:
            return False

        estimativa.deletar()
        return True