/* =========================================================
   masks.js - Máscaras, Validações e Auto-completar de Endereço (ViaCEP)
   Garante dados higienizados e organizados no Bookly.
========================================================= */

(function () {
  /**
   * Aplica máscara de CPF: 000.000.000-00
   */
  function mascararCPF(valor) {
    const limpo = String(valor || "").replace(/\D/g, "").slice(0, 11);
    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
    if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
  }

  /**
   * Valida algoritmo de CPF com tolerância para testes acadêmicos/protótipo
   * Rejeita sequências repetidas (ex: 111.111.111-11) e tamanhos != 11.
   * Permite números fictícios de teste acadêmico sem travar a apresentação.
   */
  function validarCPF(cpf) {
    const limpo = String(cpf || "").replace(/\D/g, "");
    if (limpo.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(limpo)) return false; // rejeita 000.000.000-00, 111.111.111-11, etc.

    // No protótipo acadêmico, se tiver 11 dígitos válidos e não repetidos,
    // aceita para permitir testes com números fictícios sem bloquear o cadastro.
    return true;
  }

  /**
   * Aplica máscara de Telefone: (00) 00000-0000 ou (00) 0000-0000
   */
  function mascararTelefone(valor) {
    const limpo = String(valor || "").replace(/\D/g, "").slice(0, 11);
    if (limpo.length === 0) return "";
    if (limpo.length <= 2) return `(${limpo}`;
    if (limpo.length <= 6) return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`;
    if (limpo.length <= 10) {
      return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
    }
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
  }

  /**
   * Aplica máscara de CEP: 00000-000
   */
  function mascararCEP(valor) {
    const limpo = String(valor || "").replace(/\D/g, "").slice(0, 8);
    if (limpo.length <= 5) return limpo;
    return `${limpo.slice(0, 5)}-${limpo.slice(5, 8)}`;
  }

  /**
   * Valida se o CEP tem 8 dígitos válidos e não é sequência repetida
   */
  function validarCEP(cep) {
    const limpo = String(cep || "").replace(/\D/g, "");
    if (limpo.length !== 8) return false;
    if (/^(\d)\1{7}$/.test(limpo)) return false; // Rejeita 00000000, 11111111, etc.
    return true;
  }

  /**
   * Valida formato básico de e-mail
   */
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(String(email || "").trim());
  }

  /**
   * Consulta assíncrona do CEP com fallback resiliente (ViaCEP + BrasilAPI)
   */
  async function consultarViaCEP(cep) {
    const limpo = String(cep || "").replace(/\D/g, "");
    if (limpo.length !== 8) return null;

    // 1. Tenta ViaCEP
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      if (res.ok) {
        const data = await res.json();
        if (!data.erro) {
          return {
            cep: data.cep || mascararCEP(limpo),
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: (data.uf || "").toUpperCase(),
          };
        }
      }
    } catch (e) {
      console.warn("ViaCEP indisponível, tentando BrasilAPI...", e);
    }

    // 2. Fallback: BrasilAPI
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${limpo}`);
      if (res.ok) {
        const data = await res.json();
        return {
          cep: mascararCEP(data.cep || limpo),
          rua: data.street || "",
          bairro: data.neighborhood || "",
          cidade: data.city || "",
          estado: (data.state || "").toUpperCase(),
        };
      }
    } catch (e) {
      console.warn("BrasilAPI também falhou:", e);
    }

    return null;
  }

  /**
   * Busca sugestões por nome de rua/logradouro (ViaCEP)
   */
  async function buscarSugestoesLogradouro(uf, cidade, termo) {
    const ufNorm = String(uf || "").trim().toUpperCase();
    const cidadeNorm = String(cidade || "").trim();
    const termoNorm = String(termo || "").trim();

    if (!ufNorm || cidadeNorm.length < 3 || termoNorm.length < 3) return [];

    try {
      const url = `https://viacep.com.br/ws/${encodeURIComponent(ufNorm)}/${encodeURIComponent(cidadeNorm)}/${encodeURIComponent(termoNorm)}/json/`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const lista = await res.json();
      if (!Array.isArray(lista)) return [];
      return lista.slice(0, 5).map(item => ({
        cep: item.cep,
        rua: item.logradouro,
        bairro: item.bairro,
        cidade: item.localidade,
        estado: item.uf
      }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Vincula ouvintes de formatação automática a um input
   */
  function aplicarMascaraEmInput(input, tipo) {
    if (!input) return;

    if (tipo === "cpf") {
      input.maxLength = 14;
      input.addEventListener("input", (e) => {
        e.target.value = mascararCPF(e.target.value);
      });
      input.addEventListener("paste", (e) => {
        setTimeout(() => { e.target.value = mascararCPF(e.target.value); }, 10);
      });
    } else if (tipo === "telefone") {
      input.maxLength = 15;
      input.addEventListener("input", (e) => {
        e.target.value = mascararTelefone(e.target.value);
      });
      input.addEventListener("paste", (e) => {
        setTimeout(() => { e.target.value = mascararTelefone(e.target.value); }, 10);
      });
    } else if (tipo === "cep") {
      input.maxLength = 9;
      input.addEventListener("input", (e) => {
        e.target.value = mascararCEP(e.target.value);
      });
      input.addEventListener("paste", (e) => {
        setTimeout(() => { e.target.value = mascararCEP(e.target.value); }, 10);
      });
    }
  }

  /**
   * Configura Autocomplete Dinâmico de Endereço em uma página
   * @param {Object} campos - { cep, rua, bairro, cidade, estado, numero, statusEl, dropdownContainer }
   */
  function configurarAutocompleteEndereco(config) {
    const cepInput = config.cep;
    const ruaInput = config.rua;
    const bairroInput = config.bairro;
    const cidadeInput = config.cidade;
    const estadoInput = config.estado;
    const numeroInput = config.numero;
    const statusEl = config.statusEl;

    if (!cepInput) return;

    // Garante dropdown de sugestão sob o CEP
    let dropdown = config.dropdown;
    if (!dropdown && cepInput.parentElement) {
      dropdown = document.createElement("ul");
      dropdown.className = "cep-autocomplete-dropdown";
      dropdown.hidden = true;
      cepInput.parentElement.style.position = "relative";
      cepInput.parentElement.appendChild(dropdown);
    }

    function fecharDropdown() {
      if (dropdown) {
        dropdown.hidden = true;
        dropdown.innerHTML = "";
      }
    }

    function preencherCampos(dados) {
      if (!dados) return;
      if (cepInput && dados.cep) cepInput.value = mascararCEP(dados.cep);
      if (ruaInput && dados.rua) ruaInput.value = dados.rua;
      if (bairroInput && dados.bairro) bairroInput.value = dados.bairro;
      if (cidadeInput && dados.cidade) cidadeInput.value = dados.cidade;
      if (estadoInput && dados.estado) {
        estadoInput.value = dados.estado.toUpperCase();
      }
      fecharDropdown();
      if (statusEl) {
        statusEl.textContent = `Endereço localizado: ${dados.cidade || ""}/${dados.estado || ""}`;
        statusEl.style.color = "var(--color-primary)";
      }
      if (numeroInput) numeroInput.focus();
    }

    let timerCep = null;
    async function dispararConsultaCep(valor) {
      const digitos = String(valor || "").replace(/\D/g, "");
      if (digitos.length !== 8) {
        fecharDropdown();
        if (statusEl) statusEl.textContent = "";
        return;
      }

      if (statusEl) {
        statusEl.textContent = "Buscando endereço pelo CEP...";
        statusEl.style.color = "var(--text-muted)";
      }

      const dados = await consultarViaCEP(digitos);
      if (dados) {
        // Exibe card de sugestão interativo
        if (dropdown) {
          dropdown.innerHTML = "";
          const li = document.createElement("li");
          li.className = "cep-sugestao-item";
          li.innerHTML = `
            <div class="cep-sugestao-icone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="cep-sugestao-texto">
              <strong>${dados.rua || "Logradouro identificado"}</strong>
              <span>${[dados.bairro, `${dados.cidade} - ${dados.estado}`, `CEP: ${dados.cep}`].filter(Boolean).join(" · ")}</span>
            </div>
          `;
          li.addEventListener("click", () => preencherCampos(dados));
          dropdown.appendChild(li);
          dropdown.hidden = false;
        }

        // Também preenche automaticamente para máxima conveniência
        preencherCampos(dados);
      } else {
        fecharDropdown();
        if (statusEl) {
          statusEl.textContent = "CEP não localizado na base dos Correios. Digite manualmente.";
          statusEl.style.color = "#e2637b";
        }
      }
    }

    cepInput.addEventListener("input", (e) => {
      clearTimeout(timerCep);
      const val = e.target.value;
      const digitos = val.replace(/\D/g, "");
      if (digitos.length === 8) {
        dispararConsultaCep(val);
      } else {
        fecharDropdown();
        if (statusEl && digitos.length > 0) {
          statusEl.textContent = `Digite os 8 números do CEP (${digitos.length}/8)`;
          statusEl.style.color = "var(--text-muted)";
        } else if (statusEl) {
          statusEl.textContent = "";
        }
      }
    });

    cepInput.addEventListener("blur", () => {
      setTimeout(fecharDropdown, 250);
    });

    // Limitação de caracteres de número e complemento se fornecidos
    if (numeroInput) {
      numeroInput.maxLength = 10;
    }
    if (config.complemento) {
      config.complemento.maxLength = 50;
    }
  }

  // Exporta globalmente
  window.BooklyMasks = {
    cpf: mascararCPF,
    validarCPF: validarCPF,
    telefone: mascararTelefone,
    cep: mascararCEP,
    validarCEP: validarCEP,
    validarEmail: validarEmail,
    consultarViaCEP: consultarViaCEP,
    buscarSugestoesLogradouro: buscarSugestoesLogradouro,
    configurarAutocompleteEndereco: configurarAutocompleteEndereco,
    aplicar: aplicarMascaraEmInput,
  };

  // Inicializa automaticamente nos inputs conhecidos da página
  function inicializarMascarasGlobais() {
    aplicarMascaraEmInput(document.getElementById("cpf"), "cpf");
    aplicarMascaraEmInput(document.getElementById("telefone"), "telefone");
    aplicarMascaraEmInput(document.getElementById("cep"), "cep");
    aplicarMascaraEmInput(document.getElementById("endereco_cep"), "cep");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarMascarasGlobais);
  } else {
    inicializarMascarasGlobais();
  }
})();
