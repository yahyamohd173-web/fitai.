(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const STORAGE = { preferences: "fitai_preferences_v2", saved: "fitai_saved_v2", user: "fitai_demo_user_v2" };

  const state = {
    photoDataUrl: "",
    preferences: { gender: "", styles: [], colors: [], budget: 3000, occasions: [], fit: "" },
    lastFits: []
  };

  const esc = value => String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
  const parse = (v, fallback) => { try { return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const status = (msg, id = "#status") => { const el = $(id); if (el) el.textContent = msg; };

  function syncPreferences() {
    const group = name => $(`.choice-group[data-group="${name}"]`);
    const one = name => { const g = group(name); return g ? $(".choice.active", g)?.textContent.trim() || "" : ""; };
    const many = name => { const g = group(name); return g ? $$(".choice.active", g).map(b => b.textContent.trim()) : []; };
    const bg = group("budget");
    const bb = bg ? $(".choice.active", bg) : null;
    state.preferences = { gender: one("gender"), styles: many("styles"), colors: many("colors"), budget: Number(bb?.dataset.value || $("#budget")?.value || 3000), occasions: many("occasions"), fit: one("fit") };
    return state.preferences;
  }

  function updateSteps(n) { $$(".steps span").forEach((el, i) => el.classList.toggle("active", i < n)); }

  document.addEventListener("click", e => {
    const button = e.target.closest(".choice-group .choice");
    if (!button) return;
    e.preventDefault();
    const group = button.closest(".choice-group");
    if (!group) return;
    if (group.classList.contains("multi")) button.classList.toggle("active");
    else { $$(".choice", group).forEach(x => x.classList.remove("active")); button.classList.add("active"); }
    syncPreferences(); updateSteps(2);
  });

  document.addEventListener("click", e => {
    const chip = e.target.closest("#styleChips .chip");
    if (!chip) return;
    e.preventDefault();
    $$("#styleChips .chip").forEach(x => x.classList.remove("active"));
    chip.classList.add("active");
    const select = $("#style");
    if (select && [...select.options].some(o => o.value === chip.textContent.trim())) select.value = chip.textContent.trim();
  });

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-scroll]");
    if (!b) return;
    e.preventDefault();
    $(b.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
  });

  $("#savePreferences")?.addEventListener("click", e => {
    e.preventDefault();
    syncPreferences();
    localStorage.setItem(STORAGE.preferences, JSON.stringify(state.preferences));
    status("✓ Your style has been saved.", "#preferenceStatus");
  });

  const photoInput = $("#photoInput");
  photoInput?.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { alert("Please choose a JPG, PNG or WebP image."); e.target.value = ""; return; }
    if (file.size > 7 * 1024 * 1024) { alert("Please choose an image under 7MB."); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      state.photoDataUrl = String(reader.result || "");
      const preview = $("#preview");
      if (preview) { preview.src = state.photoDataUrl; preview.style.display = "block"; }
      const info = $("#photoInfo"); if (info) info.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
      $("#removePhoto")?.classList.remove("hidden"); updateSteps(1);
    };
    reader.readAsDataURL(file);
  });

  $("#removePhoto")?.addEventListener("click", e => {
    e.preventDefault(); state.photoDataUrl = ""; if (photoInput) photoInput.value = "";
    const preview = $("#preview"); if (preview) { preview.removeAttribute("src"); preview.style.display = "none"; }
    const info = $("#photoInfo"); if (info) info.textContent = "";
    $("#removePhoto")?.classList.add("hidden");
  });

  function quick() { return { style: $("#style")?.value || "Streetwear", occasion: $("#occasion")?.value || "Casual", budget: Number($("#budget")?.value || 3000) }; }

  function normalizeItem(item) {
    if (!item) return null;
    if (typeof item === "string") return { name: item, price: 0, search_query: item };
    return { name: String(item.name || "").trim(), price: Number(item.price || 0), search_query: String(item.search_query || item.name || "").trim() };
  }

  function normalizeFit(fit, i) {
    return {
      ...fit,
      name: String(fit.name || `FITAI Look ${i + 1}`),
      emoji: String(fit.emoji || ["🖤", "🤍", "🕶️"][i] || "✨"),
      match: Math.max(70, Math.min(99, Number(fit.match) || 90)),
      total_price: Number(fit.total_price || fit.price || 0),
      shirt: normalizeItem(fit.shirt),
      pant: normalizeItem(fit.pant),
      shoes: normalizeItem(fit.shoes),
      accessory: normalizeItem(fit.accessory)
    };
  }

  async function generateAI() {
    const p = syncPreferences(), q = quick();
    const preferences = { ...p, quickStyle: q.style, quickOccasion: q.occasion, budget: p.budget || q.budget };
    const results = $("#results");
    updateSteps(3);
    status("✦ FITAI is analyzing your photo, proportions and preferences…");
    if (results) results.innerHTML = `<div class="panel"><b>FITAI is styling you…</b><p class="muted">Choosing one shirt, one pant and one pair of shoes for each look.</p></div>`;

    try {
      const response = await fetch("/api/stylist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferences, photoDataUrl: state.photoDataUrl || "" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(data.looks)) throw new Error(data.error || "AI could not generate your outfit.");
      state.lastFits = data.looks.map(normalizeFit);
      renderResults(state.lastFits);
      updateSteps(4);
      status(`✦ ${state.lastFits.length} AI-styled complete outfits ready.`);
      results?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error(error);
      status(`⚠ ${error.message || "Something went wrong. Please try again."}`);
      if (results) results.innerHTML = `<div class="panel"><b>AI styling couldn't be completed.</b><p class="muted">${esc(error.message || "Please try again.")}</p><button type="button" class="primary" id="retryAI">Try again</button></div>`;
      $("#retryAI")?.addEventListener("click", generateAI);
    }
  }

  $("#generateBtn")?.addEventListener("click", e => { e.preventDefault(); generateAI(); });

  function pieceRow(icon, label, item) {
    if (!item?.name) return "";
    return `<div class="fitai-piece"><span>${icon}</span><div><small class="muted">${label}</small><strong>${esc(item.name)}</strong></div><b>${item.price ? money(item.price) : ""}</b></div>`;
  }

  function addResultCSS() {
    if ($("#fitai-result-css")) return;
    const style = document.createElement("style"); style.id = "fitai-result-css";
    style.textContent = `.fitai-piece-list{display:grid;gap:8px;margin:14px 0}.fitai-piece{display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:8px;background:#101012;border:1px solid #2b2b30;border-radius:12px;padding:9px}.fitai-piece div{display:grid}.fitai-piece strong{font-size:13px}.fitai-piece span{font-size:20px}.fitai-piece>b{color:#d9ff5a;font-size:12px}`;
    document.head.appendChild(style);
  }

  function renderResults(fits) {
    const results = $("#results"); if (!results) return;
    addResultCSS();
    results.innerHTML = fits.map((fit, i) => `
      <article class="outfit"><div class="outfit-visual" aria-hidden="true">${esc(fit.emoji)}</div><div class="outfit-body">
        <small class="muted">AI MATCH · ${fit.match}% · ${esc(fit.style || "Personalized")}</small>
        <h3>${esc(fit.name)}</h3><p class="muted">${esc(fit.reason || "Built around your preferences and proportions.")}</p>
        <div class="fitai-piece-list">${pieceRow("👕", "Shirt / Top", fit.shirt)}${pieceRow("👖", "Pant / Bottom", fit.pant)}${pieceRow("👟", "Shoes", fit.shoes)}${fit.accessory ? pieceRow("🧢", "Accessory", fit.accessory) : ""}</div>
        <div class="price">${money(fit.total_price)}</div>
        <div class="actions"><button type="button" data-save="${i}">♡ Save</button><button type="button" data-remix="${i}">↻ Remix</button><button type="button" data-shop="${i}">Shop this look →</button></div>
      </div></article>`).join("");
    bindResults(fits);
  }

  function marketplace(platform, query) {
    const q = encodeURIComponent(query);
    return platform === "amazon" ? `https://www.amazon.in/s?k=${q}` : `https://www.flipkart.com/search?q=${q}`;
  }

  function ensureShopModal() {
    let modal = $("#fitaiShopModal"); if (modal) return modal;
    const css = document.createElement("style"); css.id = "fitai-shop-css";
    css.textContent = `#fitaiShopModal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;background:#000c;backdrop-filter:blur(8px)}#fitaiShopModal.open{display:flex}.fitai-shop-dialog{width:min(920px,96vw);max-height:90vh;overflow:auto;background:#141416;color:#f4f4f0;border:1px solid #2b2b30;border-radius:24px;padding:26px;position:relative;box-shadow:0 25px 80px #000b}.fitai-shop-close{position:absolute;right:14px;top:8px;border:0;background:none;color:#aaa;font-size:30px;cursor:pointer}.fitai-shop-dialog h2{font-size:clamp(28px,5vw,44px);margin:5px 35px 8px 0}.fitai-shop-total{color:#d9ff5a;font-weight:850;font-size:18px}.fitai-shop-items{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}.fitai-shop-item{background:#1a1a1d;border:1px solid #2b2b30;border-radius:18px;padding:16px;display:flex;flex-direction:column;min-height:210px}.fitai-shop-icon{font-size:34px}.fitai-shop-item h3{font-size:14px;margin:8px 0}.fitai-shop-price{color:#d9ff5a;font-weight:850;margin-bottom:12px}.fitai-shop-links{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:auto}.fitai-shop-link{padding:10px 6px;text-align:center;text-decoration:none;border-radius:10px;background:#0f0f11;border:1px solid #2b2b30;color:#f4f4f0;font-size:12px;font-weight:750}.fitai-shop-link:hover{border-color:#d9ff5a;color:#d9ff5a}.fitai-shop-note{border-top:1px solid #2b2b30;margin-top:18px;padding-top:16px;color:#a5a5aa;font-size:12px;line-height:1.6}@media(max-width:700px){.fitai-shop-items{grid-template-columns:1fr}.fitai-shop-dialog{padding:18px}}`;
    document.head.appendChild(css);
    modal = document.createElement("div"); modal.id = "fitaiShopModal";
    modal.innerHTML = `<div class="fitai-shop-dialog" role="dialog" aria-modal="true"><button class="fitai-shop-close" type="button">×</button><div id="fitaiShopContent"></div></div>`;
    document.body.appendChild(modal);
    const close = () => modal.classList.remove("open");
    $(".fitai-shop-close", modal).addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    return modal;
  }

  function openShop(fit) {
    if (!fit) return;
    const modal = ensureShopModal(), content = $("#fitaiShopContent", modal);
    const pieces = [
      ["👕", "SHIRT / TOP", fit.shirt],
      ["👖", "PANT / BOTTOM", fit.pant],
      ["👟", "SHOES", fit.shoes],
      ["🧢", "ACCESSORY", fit.accessory]
    ].filter(x => x[2]?.name);

    content.innerHTML = `<p class="eyebrow">SHOP THIS EXACT OUTFIT</p><h2>${esc(fit.name)}</h2><p class="muted">One exact piece for every part of the outfit. No alternatives.</p><div class="fitai-shop-total">Estimated total · ${money(fit.total_price)}</div><div class="fitai-shop-items">${pieces.map(([icon, label, item]) => {
      const query = item.search_query || item.name;
      return `<article class="fitai-shop-item"><div class="fitai-shop-icon">${icon}</div><small class="muted">${label}</small><h3>${esc(item.name)}</h3><div class="fitai-shop-price">${item.price ? money(item.price) : "Price varies"}</div><div class="fitai-shop-links"><a class="fitai-shop-link" href="${marketplace("amazon", query)}" target="_blank" rel="noopener noreferrer">Amazon ↗</a><a class="fitai-shop-link" href="${marketplace("flipkart", query)}" target="_blank" rel="noopener noreferrer">Flipkart ↗</a></div></article>`;
    }).join("")}</div><div class="fitai-shop-note">Amazon/Flipkart show current sellers, availability and prices. FITAI opens a search for the AI-selected item and does not guarantee a particular seller or listing.</div>`;
    modal.classList.add("open");
  }

  function bindResults(fits) {
    $$("[data-save]", $("#results")).forEach(b => b.addEventListener("click", () => {
      const fit = fits[Number(b.dataset.save)]; if (!fit) return;
      const saved = parse(localStorage.getItem(STORAGE.saved), []);
      if (!saved.some(x => x.name === fit.name)) saved.push(fit);
      localStorage.setItem(STORAGE.saved, JSON.stringify(saved.slice(-12))); b.textContent = "✓ Saved"; renderSaved();
    }));

    $$("[data-remix]", $("#results")).forEach(b => b.addEventListener("click", async () => {
      b.disabled = true; b.textContent = "Remixing…";
      await generateAI(); b.disabled = false;
    }));

    $$("[data-shop]", $("#results")).forEach(b => b.addEventListener("click", () => openShop(fits[Number(b.dataset.shop)])));
  }

  function renderSaved() {
    const list = $("#savedList"); if (!list) return;
    const saved = parse(localStorage.getItem(STORAGE.saved), []);
    if (!saved.length) { list.innerHTML = `<p class="muted">No saved outfits yet. Generate a look and tap Save.</p>`; return; }
    list.innerHTML = saved.slice().reverse().map((fit, i) => `<article class="panel"><b>${esc(fit.name)}</b><p class="muted">${esc(fit.shirt?.name || "")} · ${esc(fit.pant?.name || "")} · ${esc(fit.shoes?.name || "")}</p><span class="price">${money(fit.total_price || fit.price)}</span><div class="actions"><button type="button" data-saved-shop="${i}">Shop →</button><button type="button" data-remove-saved="${i}">Remove</button></div></article>`).join("");
    $$('[data-saved-shop]', list).forEach(b => b.addEventListener("click", () => openShop(saved.slice().reverse()[Number(b.dataset.savedShop)])));
    $$('[data-remove-saved]', list).forEach(b => b.addEventListener("click", () => { const reversed = saved.slice().reverse(); const item = reversed[Number(b.dataset.removeSaved)]; localStorage.setItem(STORAGE.saved, JSON.stringify(saved.filter(x => x !== item))); renderSaved(); }));
  }

  $("#loginBtn")?.addEventListener("click", e => { e.preventDefault(); const d = $("#loginDialog"); if (d && !d.open) d.showModal(); });
  $("#demoLogin")?.addEventListener("click", e => {
    e.preventDefault(); const email = $("#email")?.value.trim(); const password = $('input[type="password"]')?.value || "";
    if (!email) { alert("Please enter your email."); return; }
    if (password.length < 4) { alert("Password must be at least 4 characters."); return; }
    const user = { email, name: email.split("@")[0] }; localStorage.setItem(STORAGE.user, JSON.stringify(user)); $("#loginBtn").textContent = user.name; $("#loginDialog")?.close();
  });

  const savedPreferences = parse(localStorage.getItem(STORAGE.preferences), null);
  if (savedPreferences) state.preferences = { ...state.preferences, ...savedPreferences };
  const user = parse(localStorage.getItem(STORAGE.user), null); if (user?.name) $("#loginBtn").textContent = user.name;
  renderSaved(); updateSteps(1);
  console.log("FITAI AI + exact outfit shopping loaded ✓");
})();
