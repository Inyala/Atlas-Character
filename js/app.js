(() => {
  "use strict";

  // Remplace ces URL par les liens de téléchargement publiés dans GitHub Releases.
  // Évite de placer les fichiers JSON/XML de plus de 100 Mo dans le dépôt Git classique.
  const DATA_URLS = {
    json: "https://github.com/Inyala/Atlas-Character/releases/download/v1_0/character_db.json",
    xml: "https://github.com/Inyala/Atlas-Character/releases/download/v1_0/character_db.xml",
    sqlite: "https://github.com/Inyala/Atlas-Character/releases/download/v1_0/character_db.sqlite",
    csv: "https://github.com/Inyala/Atlas-Character/releases/download/v1_0/character_db.csv",
    zip: "https://github.com/Inyala/Atlas-Character/releases/download/v1_0/character_db.zip"
  };

  const TOTAL_UNICODE = 1114111;
  const MAX_VISIBLE_RESULTS = Math.floor(TOTAL_UNICODE * 0.15);
  const PREVIEW_URL = "./data/preview.json";
  const state = { data: [], filtered: [], page: 1, pageSize: 48, query: "", sort: "decimal-asc" };
  const $ = (id) => document.getElementById(id);
  const grid = $("character-grid");
  const searchInput = $("search-input");
  const toast = $("toast");
  let toastTimer;

  const fmt = (value) => Number(value).toLocaleString("fr-FR");
  const safeText = (value) => String(value ?? "");
  const normalize = (value) => safeText(value).normalize("NFKC").toLocaleLowerCase("fr");

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      showToast("Copié dans le presse-papiers : " + value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand("copy");
      input.remove();
      showToast(ok ? "Copié dans le presse-papiers." : "Copie impossible dans ce navigateur.");
    }
  }

  function visibleCharacter(item) {
    const cp = Number(item.decimal);
    if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f) || (cp >= 0xd800 && cp <= 0xdfff)) return "·";
    try {
      return String.fromCodePoint(cp);
    } catch {
      return "�";
    }
  }

  function searchMatches(item, query) {
    if (!query) return true;
    const q = normalize(query).replace(/^u\+/, "");
    const hex = normalize(item.hexadecimal);
    const unicode = normalize(item.unicode).replace(/^u\+/, "");
    const decimal = String(item.decimal);
    const binary = String(item.binary);
    const character = normalize(visibleCharacter(item));
    return hex.includes(q) || unicode.includes(q) || decimal.includes(q) ||
      binary.includes(q) || character.includes(normalize(query)) ||
      normalize(item.id).includes(q);
  }

  function applyFilter() {
    state.query = searchInput.value.trim();
    state.page = 1;
    const query = state.query;
    const result = state.data.filter((item) => searchMatches(item, query));
    if (state.sort === "decimal-desc") result.sort((a, b) => Number(b.decimal) - Number(a.decimal));
    else if (state.sort === "character") result.sort((a, b) => visibleCharacter(a).localeCompare(visibleCharacter(b)));
    else result.sort((a, b) => Number(a.decimal) - Number(b.decimal));
    state.filtered = result.slice(0, MAX_VISIBLE_RESULTS);
    render();
  }

  function render() {
    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * state.pageSize;
    const pageItems = state.filtered.slice(start, start + state.pageSize);

    $("result-summary").textContent = `${fmt(total)} résultat${total > 1 ? "s" : ""} dans l’échantillon` +
      (state.query ? ` pour « ${state.query} »` : "");
    $("page-label").textContent = `Page ${state.page} / ${pages}`;
    $("prev-page").disabled = state.page <= 1;
    $("next-page").disabled = state.page >= pages;

    if (!pageItems.length) {
      grid.innerHTML = '<div class="empty">Aucun résultat dans l’échantillon. Essaie un autre code ou caractère.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const item of pageItems) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "character-card";
      button.title = `Copier ${item.unicode}`;
      const glyph = document.createElement("span");
      glyph.className = "character-glyph";
      glyph.textContent = visibleCharacter(item);
      const code = document.createElement("span");
      code.className = "character-code";
      code.textContent = item.unicode;
      const decimal = document.createElement("span");
      decimal.className = "character-decimal";
      decimal.textContent = `DEC ${item.decimal}`;
      const copy = document.createElement("span");
      copy.className = "copy-indicator";
      copy.textContent = "⧉";
      button.append(glyph, code, decimal, copy);
      button.addEventListener("click", () => copyText(item.unicode));
      fragment.appendChild(button);
    }
    grid.replaceChildren(fragment);
  }

  function setupDownloads() {
    document.querySelectorAll(".download-link").forEach((link) => {
      const format = link.dataset.format;
      link.href = DATA_URLS[format] || "#";
      link.addEventListener("click", (event) => {
        if (!DATA_URLS[format] || DATA_URLS[format].includes("TON-COMPTE/TON-DEPOT")) {
          event.preventDefault();
          $("link-status").textContent = "Configure d’abord les URL DATA_URLS dans js/app.js avec les liens de tes GitHub Releases.";
          showToast("Les liens de téléchargement doivent être configurés dans js/app.js.");
        }
      });
    });
    document.querySelectorAll("[data-copy-format]").forEach((button) => {
      button.addEventListener("click", async () => {
        const url = DATA_URLS[button.dataset.copyFormat];
        if (!url || url.includes("TON-COMPTE/TON-DEPOT")) {
          $("link-status").textContent = "Lien non configuré : remplace TON-COMPTE/TON-DEPOT dans js/app.js.";
          showToast("Configure d’abord le lien de cette base.");
          return;
        }
        await copyText(url);
      });
    });
  }

  async function init() {
    setupDownloads();
    $("total-count").textContent = fmt(TOTAL_UNICODE);
    try {
      const response = await fetch(PREVIEW_URL, { cache: "force-cache" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      state.data = await response.json();
      $("preview-count").textContent = fmt(state.data.length);
      applyFilter();
    } catch (error) {
      grid.innerHTML = '<div class="empty">Impossible de charger data/preview.json. Vérifie que le fichier existe et que le site est ouvert via un serveur HTTP ou GitHub Pages, pas en ouvrant directement index.html.</div>';
      $("preview-count").textContent = "Indisponible";
      $("result-summary").textContent = "Échec du chargement de l’échantillon.";
      console.error(error);
    }
  }

  searchInput.addEventListener("input", applyFilter);
  $("page-size").addEventListener("change", (event) => {
    state.pageSize = Number(event.target.value) || 48;
    state.page = 1;
    render();
  });
  $("sort-by").addEventListener("change", (event) => {
    state.sort = event.target.value;
    applyFilter();
  });
  $("clear-search").addEventListener("click", () => {
    searchInput.value = "";
    applyFilter();
    searchInput.focus();
  });
  $("prev-page").addEventListener("click", () => { state.page--; render(); });
  $("next-page").addEventListener("click", () => { state.page++; render(); });

  init();
})();
