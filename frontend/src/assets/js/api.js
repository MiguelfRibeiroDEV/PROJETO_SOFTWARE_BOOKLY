/* =========================================================
   api.js
   Configuração central da API + helper de requisição,
   reaproveitado por todas as páginas do front-end.
========================================================= */

// Detecta dinamicamente se está rodando na AWS (IP público / domínio) ou em localhost
const API_BASE_URL = (typeof window !== "undefined" && window.location && window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : "http://127.0.0.1:5000";

/**
 * Faz uma requisição para a API Flask e já trata JSON/erros.
 * @param {string} path - ex: "/livros"
 * @param {object} options - opções do fetch (method, body, etc)
 */
async function apiRequest(path, options = {}) {
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const status = response.status;
  const data = status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem = (data && data.erro) || "Erro ao comunicar com o servidor.";
    throw new Error(mensagem);
  }

  return data;
}
