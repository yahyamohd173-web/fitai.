(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE = {
    preferences: "fitai_preferences_v2",
    saved: "fitai_saved_v2",
    user: "fitai_demo_user_v2"
  };

  const demoFits = [
    { name: "Midnight Street", emoji: "🖤", price: 2499, items: "Oversized black tee · Baggy cargos · White sneakers" },
    { name: "Clean Signal", emoji: "🤍", price: 2199, items: "Cream shirt · Straight trousers · Minimal sneakers" },
    { name: "City Y2K", emoji: "🕶️", price: 2899, items: "Graphic tee · Wide jeans · Retro sneakers" }
  ];

  const state = {
    photoUrl: "",
    preferences: {
      gender: "",
      styles: [],
      colors: [],
      budget: 3000,
      occasions: [],
      fit: ""
    }
  };

  function safeJSONParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>\"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function setStatus(message = "", target = "#status") {
    const el = $(target);
    if (el) el.textContent = message;
  }

  function updateStep(step) {
    $$(".steps span").forEach((el, index) => {
      el.classList.toggle("active", index < step);
    });
  }

  // Smooth navigation.
  $$('[data-scroll]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      const target = $(button.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Explore chips.
  $$("#styleChips .chip").forEach(button => {
    button.addEventListener("click", () => {
      $$("#styleChips .chip").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      const style = button.textContent.trim();
      const select = $("#style");
      if (select && Array.from(select.options).some(option => option.value === style)) {
        select.value = style;
      }
    });
  });

  // Preference buttons.
  $$(".choice-group").forEach(group => {
    const buttons = $$(".choice", group);
    const multiple = group.classList.contains("multi");

    buttons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        if (multiple) {
          button.classList.toggle("active");
        } else {
          buttons.forEach(item => item.classList.remove("active"));
          button.classList.add("active");
        }
        syncPreferencesFromUI();
        updateStep(2);
      });
    });
  });

  function syncPreferencesFromUI() {
    const activeText = group => $$(".choice.active", group).map(button => button.textContent.trim());
    const one = name => {
      const group = $(`.choice-group[data-group="${name}"]`);
      return group ? $(".choice.active", group)?.textContent.trim() || "" : "";
    };
    const many = name => {
      const group = $(`.choice-group[data-group="${name}"]`);
      return group ? activeText(group) : [];
    };
    const budgetGroup = $('.choice-group[data-group="budget"]');
    const budgetButton = budgetGroup ? $(".choice.active", budgetGroup) : null;

    state.preferences = {
      gender: one("gender"),
      styles: many("styles"),
      colors: many("colors"),
      budget: Number(budgetButton?.dataset.value || $("#budget")?.value || 3000),
      occasions: many("occasions"),
      fit: one("fit")
    };
  }

  function applyPreferencesToUI() {
    const p = state.preferences;
    $$(".choice").forEach(button => button.classList.remove("active"));

    const activate = (groupName, values) => {
      const group = $(`.choice-group[data-group="${groupName}"]`);
      if (!group) return;
      const list = Array.isArray(values) ? values : [values];
      $$(".choice", group).forEach(button => {
        const matches = groupName === "budget"
          ? Number(button.dataset.value) === Number(p.budget)
          : list.includes(button.textContent.trim());
        if (matches) button.classList.add("active");
      });
    };

    activate("gender", p.gender);
    activate("styles", p.styles);
    activate("colors", p.colors);
    activate("budget", p.budget);
    activate("occasions", p.occasions);
    activate("fit", p.fit);
  }

  function savePreferences() {
    syncPreferencesFromUI();
    localStorage.setItem(STORAGE.preferences, JSON.stringify(state.preferences));
    setStatus("✓ Your style has been saved.", "#preferenceStatus");
  }

  $("#savePreferences")?.addEventListener("click", event => {
    event.preventDefault();
    savePreferences();
  });

  $("#clearPreferences")?.addEventListener("click", event => {
    event.preventDefault();
    state.preferences = { gender: "", styles: [], colors: [], budget: 3000, occasions: [], fit: "" };
    localStorage.removeItem(STORAGE.preferences);
    applyPreferencesToUI();
    setStatus("Preferences reset.", "#preferenceStatus");
  });

  // Photo preview with size/type validation.
  const photoInput = $("#photoInput");
  const preview = $("#preview");
  const removePhoto = $("#removePhoto");

  photoInput?.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please choose a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("Please choose an image under 8MB.");
      event.target.value = "";
      return;
    }

    if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
    state.photoUrl = URL.createObjectURL(file);
    if (preview) {
      preview.src = state.photoUrl;
      preview.style.display = "block";
    }
    const info = $("#photoInfo");
    if (info) info.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    removePhoto?.classList.remove("hidden");
    updateStep(1);
  });

  removePhoto?.addEventListener("click", event => {
    event.preventDefault();
    if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
    state.photoUrl = "";
    if (photoInput) photoInput.value = "";
    if (preview) {
      preview.removeAttribute("src");
      preview.style.display = "none";
    }
    const info = $("#photoInfo");
    if (info) info.textContent = "";
    removePhoto.classList.add("hidden");
  });

  // Generate demo recommendations.
  $("#generateBtn")?.addEventListener("click", event => {
    event.preventDefault();
    syncPreferencesFromUI();
    const p = state.preferences;
    const quickStyle = $("#style")?.value || "Streetwear";
    const quickBudget = Number($("#budget")?.value || p.budget || 3000);
    const occasion = $("#occasion")?.value || "Casual";
    const style = p.styles[0] || quickStyle;
    const budget = p.budget || quickBudget;

    updateStep(3);
    setStatus("✦ Analyzing preferences · matching colors · building outfits…");
    const results = $("#results");
    if (!results) return;
    results.innerHTML = "<div class=\"panel\"><b>FITAI is styling you…</b><p class=\"muted\">Finding the best matches for your preferences.</p></div>";

    setTimeout(() => {
      const fits = demoFits.map((fit, index) => ({
        ...fit,
        tag: style,
        occasion,
        price: Math.min(fit.price, budget, quickBudget),
        index
      }));

      results.innerHTML = fits.map((fit, position) => `
        <article class="outfit">
          <div class="outfit-visual" aria-hidden="true">${fit.emoji}</div>
          <div class="outfit-body">
            <small class="muted">AI MATCH · ${escapeHTML(fit.tag)} · ${escapeHTML(fit.occasion)}</small>
            <h3>${escapeHTML(fit.name)}</h3>
            <p class="muted">${escapeHTML(fit.items)}</p>
            <div class="price">₹${fit.price.toLocaleString("en-IN")}</div>
            <div class="actions">
              <button type="button" data-save="${position}">♡ Save</button>
              <button type="button" data-remix="${position}">↻ Remix</button>
              <button type="button" data-shop="${position}">Shop →</button>
            </div>
          </div>
        </article>
      `).join("");

      setStatus("✦ 3 personalized looks ready.");
      updateStep(4);
      bindResultActions(fits);
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 650);
  });

  // =========================================
  // REAL SHOPPING LINKS
  // =========================================

  function marketplaceUrl(platform, query) {
    const encoded = encodeURIComponent(`${query} men fashion India`);
    if (platform === "amazon") return `https://www.amazon.in/s?k=${encoded}`;
    return `https://www.flipkart.com/search?q=${encoded}`;
  }

  function itemIcon(item) {
    const text = item.toLowerCase();
    if (/shoe|sneaker|loafer|trainer/.test(text)) return "👟";
    if (/cargo|jean|trouser|chino|denim|pant/.test(text)) return "👖";
    if (/tee|shirt|polo|hoodie|sweater|overshirt/.test(text)) return "👕";
    return "🧥";
  }

  function ensureShopModal() {
    let modal = $("#fitaiShopModal");
    if (modal) return modal;

    const style = document.createElement("style");
    style.id = "fitai-shop-style";
    style.textContent = `
      #fitaiShopModal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.82);backdrop-filter:blur(8px)}
      #fitaiShopModal.open{display:flex}
      .fitai-shop-dialog{width:min(900px,96vw);max-height:90vh;overflow:auto;background:#141416;color:#f4f4f0;border:1px solid #2b2b30;border-radius:24px;padding:26px;box-shadow:0 25px 80px #000b;position:relative}
      .fitai-shop-close{position:absolute;right:14px;top:8px;background:transparent;border:0;color:#aaa;font-size:30px;cursor:pointer}
      .fitai-shop-dialog h2{font-size:clamp(28px,5vw,44px);margin:6px 35px 8px 0;letter-spacing:-2px}
      .fitai-shop-total{color:#d9ff5a;font-weight:850;font-size:18px;margin-top:8px}
      .fitai-shop-items{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}
      .fitai-shop-item{background:#1a1a1d;border:1px solid #2b2b30;border-radius:18px;padding:16px;display:flex;flex-direction:column;min-height:210px}
      .fitai-shop-icon{font-size:34px}.fitai-shop-item h3{font-size:15px;margin:8px 0}.fitai-shop-price{color:#d9ff5a;font-weight:850;margin-bottom:12px}
      .fitai-shop-links{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:auto}.fitai-shop-link{padding:10px 6px;text-align:center;text-decoration:none;border-radius:10px;background:#0f0f11;border:1px solid #2b2b30;color:#f4f4f0;font-size:12px;font-weight:750}.fitai-shop-link:hover{border-color:#d9ff5a;color:#d9ff5a}
      .fitai-shop-note{border-top:1px solid #2b2b30;margin-top:18px;padding-top:16px;color:#a5a5aa;font-size:12px;line-height:1.6}
      @media(max-width:700px){.fitai-shop-items{grid-template-columns:1fr}.fitai-shop-dialog{padding:18px}}
    `;
    document.head.appendChild(style);

    modal = document.createElement("div");
    modal.id = "fitaiShopModal";
    modal.innerHTML = `
      <div class="fitai-shop-dialog" role="dialog" aria-modal="true" aria-label="Shop this look">
        <button class="fitai-shop-close" type="button" aria-label="Close">×</button>
        <div id="fitaiShopContent"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.classList.remove("open");
    $(".fitai-shop-close", modal).addEventListener("click", close);
    modal.addEventListener("click", event => { if (event.target === modal) close(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    return modal;
  }

  function openShop(fit) {
    const modal = ensureShopModal();
    const content = $("#fitaiShopContent", modal);
    if (!content || !fit) return;

    const items = String(fit.items || "").split(" · ").map(item => item.trim()).filter(Boolean);
    const count = Math.max(items.length, 1);
    const total = Number(fit.price || 0);
    const itemPrices = items.map((_, index) => {
      if (count === 3) {
        if (index === 0) return Math.round(total * .28 / 100) * 100;
        if (index === 1) return Math.round(total * .38 / 100) * 100;
        return Math.max(299, total - Math.round(total * .28 / 100) * 100 - Math.round(total * .38 / 100) * 100);
      }
      return Math.max(299, Math.round(total / count / 100) * 100);
    });

    content.innerHTML = `
      <p class="eyebrow">SHOP THIS LOOK</p>
      <h2>${escapeHTML(fit.name)}</h2>
      <p class="muted">${escapeHTML(fit.items)}</p>
      <div class="fitai-shop-total">Estimated total · ₹${itemPrices.reduce((a,b) => a+b, 0).toLocaleString("en-IN")}</div>
      <div class="fitai-shop-items">
        ${items.map((item, index) => {
          const query = encodeURIComponent(`${item} ${fit.tag || ""} men fashion India`);
          const amazon = `https://www.amazon.in/s?k=${query}`;
          const flipkart = `https://www.flipkart.com/search?q=${query}`;
          return `
            <article class="fitai-shop-item">
              <div class="fitai-shop-icon">${itemIcon(item)}</div>
              <h3>${escapeHTML(item)}</h3>
              <div class="fitai-shop-price">₹${itemPrices[index].toLocaleString("en-IN")} estimated</div>
              <div class="fitai-shop-links">
                <a class="fitai-shop-link" href="${amazon}" target="_blank" rel="noopener noreferrer">Amazon ↗</a>
                <a class="fitai-shop-link" href="${flipkart}" target="_blank" rel="noopener noreferrer">Flipkart ↗</a>
              </div>
            </article>`;
        }).join("")}
      </div>
      <div class="fitai-shop-note">These buttons open live marketplace search results in a new tab. FITAI does not claim the marketplace prices shown here; current price, seller and availability are shown by Amazon or Flipkart.</div>
    `;
    modal.classList.add("open");
  }

  function bindResultActions(fits) {
    $$("[data-save]", $("#results")).forEach(button => {
      button.addEventListener("click", () => {
        const fit = fits[Number(button.dataset.save)];
        if (!fit) return;
        const saved = safeJSONParse(localStorage.getItem(STORAGE.saved), []);
        const duplicate = saved.some(item => item.name === fit.name && item.tag === fit.tag);
        if (!duplicate) saved.push(fit);
        localStorage.setItem(STORAGE.saved, JSON.stringify(saved.slice(-12)));
        button.textContent = "✓ Saved";
        renderSaved();
      });
    });

    $$("[data-remix]", $("#results")).forEach(button => {
      button.addEventListener("click", () => {
        button.disabled = true;
        const old = button.textContent;
        button.textContent = "Remixing…";
        setTimeout(() => {
          button.disabled = false;
          button.textContent = old;
        }, 650);
      });
    });

    $$("[data-shop]", $("#results")).forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        const fit = fits[Number(button.dataset.shop)];
        if (fit) openShop(fit);
      });
    });
  }

  function renderSaved() {
    const list = $("#savedList");
    const clear = $("#clearSaved");
    if (!list) return;
    const saved = safeJSONParse(localStorage.getItem(STORAGE.saved), []);
    if (!saved.length) {
      list.innerHTML = '<p class="muted">No saved outfits yet. Generate a look and tap Save.</p>';
      clear?.classList.add("hidden");
      return;
    }
    list.innerHTML = saved.slice().reverse().map((item, index) => `
      <article class="panel saved-card">
        <div>
          <b>${escapeHTML(item.name)}</b>
          <p class="muted">${escapeHTML(item.items)}</p>
          <span class="price">₹${Number(item.price).toLocaleString("en-IN")}</span>
        </div>
        <div class="actions">
          <button class="outline" type="button" data-saved-shop="${index}">Shop →</button>
          <button class="outline" type="button" data-remove-saved="${index}">Remove</button>
        </div>
      </article>
    `).join("");
    clear?.classList.remove("hidden");

    $$('[data-remove-saved]', list).forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.removeSaved);
        const reversed = saved.slice().reverse();
        const item = reversed[index];
        const next = item ? saved.filter(savedItem => savedItem !== item) : saved;
        localStorage.setItem(STORAGE.saved, JSON.stringify(next));
        renderSaved();
      });
    });

    $$('[data-saved-shop]', list).forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.savedShop);
        const item = saved.slice().reverse()[index];
        if (item) openShop(item);
      });
    });
  }

  $("#clearSaved")?.addEventListener("click", event => {
    event.preventDefault();
    localStorage.removeItem(STORAGE.saved);
    renderSaved();
  });

  // Demo login: browser-only.
  const loginDialog = $("#loginDialog");
  $("#loginBtn")?.addEventListener("click", event => {
    event.preventDefault();
    if (loginDialog && !loginDialog.open) loginDialog.showModal();
  });

  $("#loginForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const email = $("#email")?.value.trim();
    const password = $("#password")?.value || "";
    if (!email) { alert("Please enter your email."); $("#email")?.focus(); return; }
    if (password.length < 4) { alert("Password must be at least 4 characters."); $("#password")?.focus(); return; }

    const user = { email, name: email.split("@")[0] };
    localStorage.setItem(STORAGE.user, JSON.stringify(user));
    $("#loginBtn").textContent = user.name;
    loginDialog?.close();
    setStatus(`Welcome back, ${user.name}.`, "#preferenceStatus");
  });

  // Restore UI state.
  const savedPreferences = safeJSONParse(localStorage.getItem(STORAGE.preferences), null);
  if (savedPreferences) {
    state.preferences = { ...state.preferences, ...savedPreferences };
    applyPreferencesToUI();
  }

  const user = safeJSONParse(localStorage.getItem(STORAGE.user), null);
  if (user?.name) $("#loginBtn").textContent = user.name;

  renderSaved();
  updateStep(1);
})();
