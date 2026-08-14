(() => {
  "use strict";

  const STORAGE = "fitai_saved_v2";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const money = value => `₹${Number(value).toLocaleString("en-IN")}`;

  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));

  const parseJSON = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  };

  function collectPreferences() {
    const group = name => $(`.choice-group[data-group="${name}"]`);
    const one = name => {
      const active = $(".choice.active", group(name));
      return active ? active.textContent.trim() : "";
    };
    const many = name => $$(".choice.active", group(name)).map(x => x.textContent.trim());
    const budget = $(".choice-group[data-group=\"budget\"] .choice.active");

    return {
      gender: one("gender"),
      styles: many("styles"),
      colors: many("colors"),
      occasions: many("occasions"),
      fit: one("fit"),
      budget: Number(budget?.dataset.value || $("#budget")?.value || 3000),
      quickStyle: $("#style")?.value || "Streetwear",
      quickOccasion: $("#occasion")?.value || "Casual"
    };
  }

  function imageAsDataURL() {
    const input = $("#photoInput");
    const file = input?.files?.[0];
    if (!file || !file.type.startsWith("image/")) return Promise.resolve("");

    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        // Keep the request small enough for a normal serverless request.
        resolve(result.length <= 2_500_000 ? result : "");
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  }

  function setStatus(message) {
    const status = $("#status");
    if (status) status.textContent = message;
  }

  function renderLooks(looks) {
    const results = $("#results");
    if (!results) return;

    results.innerHTML = looks.map((look, index) => `
      <article class="outfit">
        <div class="outfit-visual" aria-hidden="true">${escapeHTML(look.emoji || "✨")}</div>
        <div class="outfit-body">
          <small class="muted">AI MATCH · ${Number(look.match) || 88}% · ${escapeHTML(look.tag || "Personalized")}</small>
          <h3>${escapeHTML(look.name)}</h3>
          <p class="muted">${escapeHTML(look.items)}</p>
          <p class="muted tiny">Why: ${escapeHTML((look.reasons || []).join(" · "))}</p>
          <div class="price">${money(look.price)}</div>
          <div class="actions">
            <button type="button" data-ai-save="${index}">♡ Save</button>
            <button type="button" data-ai-remix="${index}">↻ Remix</button>
            <button type="button" data-ai-shop="${index}">Shop →</button>
          </div>
        </div>
      </article>
    `).join("");

    bindActions(looks);
  }

  function marketplaceURL(platform, query) {
    const q = encodeURIComponent(`${query} India`);
    return platform === "amazon"
      ? `https://www.amazon.in/s?k=${q}`
      : `https://www.flipkart.com/search?q=${q}`;
  }

  function openShop(look) {
    let modal = $("#aiShopModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "aiShopModal";
      modal.innerHTML = `
        <div class="ai-shop-dialog">
          <button type="button" class="ai-shop-close" aria-label="Close">×</button>
          <div id="aiShopContent"></div>
        </div>`;
      document.body.appendChild(modal);

      modal.addEventListener("click", event => {
        if (event.target === modal || event.target.closest(".ai-shop-close")) modal.classList.remove("open");
      });
    }

    const items = String(look.items || "").split(" · ").map(x => x.trim()).filter(Boolean);
    $("#aiShopContent", modal).innerHTML = `
      <p class="eyebrow">SHOP THIS AI LOOK</p>
      <h2>${escapeHTML(look.name)}</h2>
      <p class="muted">${escapeHTML(look.items)}</p>
      <div class="ai-shop-items">
        ${items.map(item => `
          <div class="ai-shop-item">
            <b>${escapeHTML(item)}</b>
            <div class="ai-shop-links">
              <a href="${marketplaceURL("amazon", item)}" target="_blank" rel="noopener noreferrer">Amazon ↗</a>
              <a href="${marketplaceURL("flipkart", item)}" target="_blank" rel="noopener noreferrer">Flipkart ↗</a>
            </div>
          </div>`).join("")}
      </div>
      <p class="muted tiny">FITAI opens live marketplace searches. Prices and availability are controlled by the marketplace.</p>`;

    modal.classList.add("open");
  }

  function renderSavedAI() {
    const list = $("#savedList");
    if (!list) return;
    const saved = parseJSON(localStorage.getItem(STORAGE), []);
    if (!saved.length) {
      list.innerHTML = `<p class="muted">No saved outfits yet. Generate a look and tap Save.</p>`;
      return;
    }
    list.innerHTML = saved.slice().reverse().map((item, index) => `
      <article class="panel saved-card">
        <div>
          <b>${escapeHTML(item.name)}</b>
          <p class="muted">${escapeHTML(item.items)}</p>
          <span class="price">${money(item.price)}</span>
        </div>
        <div class="actions">
          <button class="outline" type="button" data-ai-saved-shop="${index}">Shop →</button>
          <button class="outline" type="button" data-ai-remove="${index}">Remove</button>
        </div>
      </article>`).join("");

    $$('[data-ai-remove]', list).forEach(button => button.addEventListener("click", () => {
      const index = Number(button.dataset.aiRemove);
      const next = saved.slice().reverse().filter((_, i) => i !== index).reverse();
      localStorage.setItem(STORAGE, JSON.stringify(next));
      renderSavedAI();
    }));

    $$('[data-ai-saved-shop]', list).forEach(button => button.addEventListener("click", () => {
      const item = saved.slice().reverse()[Number(button.dataset.aiSavedShop)];
      if (item) openShop(item);
    }));
  }

  function bindActions(looks) {
    $$("[data-ai-save]", $("#results")).forEach(button => button.addEventListener("click", () => {
      const look = looks[Number(button.dataset.aiSave)];
      if (!look) return;
      const saved = parseJSON(localStorage.getItem(STORAGE), []);
      if (!saved.some(item => item.name === look.name)) {
        saved.push(look);
        localStorage.setItem(STORAGE, JSON.stringify(saved.slice(-12)));
      }
      button.textContent = "✓ Saved";
      renderSavedAI();
    }));

    $$("[data-ai-shop]", $("#results")).forEach(button => button.addEventListener("click", () => {
      const look = looks[Number(button.dataset.aiShop)];
      if (look) openShop(look);
    }));

    $$("[data-ai-remix]", $("#results")).forEach(button => button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Remixing…";
      const preferences = collectPreferences();
      const response = await requestAI(preferences, "Create a fresh alternative to the current looks. Keep the same user preferences and budget but change the combinations.");
      if (response.ok) {
        renderLooks(response.looks);
        setStatus("↻ AI remix complete.");
      } else {
        button.disabled = false;
        button.textContent = "↻ Remix";
        setStatus(response.error);
      }
    }));
  }

  async function requestAI(preferences, extraInstruction = "") {
    const photoDataUrl = await imageAsDataURL();
    const response = await fetch("/api/stylist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ preferences, photoDataUrl, extraInstruction })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.looks)) {
      return { ok: false, error: data.error || "AI stylist is unavailable right now." };
    }
    return { ok: true, looks: data.looks };
  }

  function interceptGenerate(event) {
    const button = event.target.closest?.("#generateBtn");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const results = $("#results");
    const preferences = collectPreferences();

    setStatus("✦ FITAI AI is analyzing your style…");
    if (results) results.innerHTML = `<div class="panel"><b>FITAI AI is styling you…</b><p class="muted">Analyzing your preferences and building three outfits.</p></div>`;

    requestAI(preferences).then(response => {
      if (!response.ok) {
        setStatus(`⚠ ${response.error}`);
        if (results) results.innerHTML = `<div class="panel"><b>AI setup needed</b><p class="muted">${escapeHTML(response.error)}</p></div>`;
        return;
      }
      renderLooks(response.looks);
      setStatus(`✦ ${response.looks.length} AI-personalized looks ready.`);
      results?.scrollIntoView({ behavior: "smooth", block: "start" });
    }).catch(error => {
      console.error(error);
      setStatus("⚠ Could not connect to FITAI AI.");
    });
  }

  document.addEventListener("click", interceptGenerate, true);
  renderSavedAI();

  const style = document.createElement("style");
  style.textContent = `
    #aiShopModal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.82);backdrop-filter:blur(10px)}
    #aiShopModal.open{display:flex}
    .ai-shop-dialog{width:min(820px,96vw);max-height:90vh;overflow:auto;background:#141416;color:#f4f4f0;border:1px solid #2b2b30;border-radius:24px;padding:28px;box-shadow:0 25px 80px #000a;position:relative}
    .ai-shop-close{position:absolute;right:14px;top:8px;border:0;background:transparent;color:#aaa;font-size:30px;cursor:pointer}
    .ai-shop-dialog h2{font-size:40px;letter-spacing:-2px;margin:5px 0 10px}
    .ai-shop-items{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}
    .ai-shop-item{background:#1a1a1d;border:1px solid #2b2b30;border-radius:18px;padding:18px;min-height:150px;display:flex;flex-direction:column;justify-content:space-between}
    .ai-shop-links{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}
    .ai-shop-links a{padding:10px;text-align:center;border-radius:10px;background:#0f0f11;border:1px solid #2b2b30;color:#f4f4f0;font-size:12px;font-weight:800}
    .ai-shop-links a:hover{border-color:#d9ff5a;color:#d9ff5a}
    @media(max-width:700px){.ai-shop-items{grid-template-columns:1fr}.ai-shop-dialog{padding:20px}.ai-shop-dialog h2{font-size:32px}}
  `;
  document.head.appendChild(style);
})();
