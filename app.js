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
    });
  });

  // Preference buttons.
  $$(".choice-group").forEach(group => {
    const buttons = $$(".choice", group);
    const multiple = group.classList.contains("multi");

    buttons.forEach(button => {
      button.addEventListener("click", () => {
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
      budget: Number(budgetButton?.dataset.value || 3000),
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

  $("#savePreferences")?.addEventListener("click", () => {
    savePreferences();
  });

  $("#clearPreferences")?.addEventListener("click", () => {
    state.preferences = { gender: "", styles: [], colors: [], budget: 3000, occasions: [], fit: "" };
    localStorage.removeItem(STORAGE.preferences);
    applyPreferencesToUI();
    setStatus("Preferences reset.", "#preferenceStatus");
  });

  // Photo preview with size/type validation and object URL cleanup.
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
    $("#photoInfo").textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    removePhoto?.classList.remove("hidden");
    updateStep(1);
  });

  removePhoto?.addEventListener("click", () => {
    if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
    state.photoUrl = "";
    if (photoInput) photoInput.value = "";
    if (preview) {
      preview.removeAttribute("src");
      preview.style.display = "none";
    }
    $("#photoInfo").textContent = "";
    removePhoto.classList.add("hidden");
  });

  // Generate demo recommendations.
  $("#generateBtn")?.addEventListener("click", () => {
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
    results.innerHTML = "";

    setTimeout(() => {
      const fits = demoFits.map((fit, index) => ({
        ...fit,
        tag: style,
        occasion,
        price: Math.min(fit.price, budget, quickBudget),
        index
      }));

      results.innerHTML = fits.map(fit => `
        <article class="outfit">
          <div class="outfit-visual" aria-hidden="true">${fit.emoji}</div>
          <div class="outfit-body">
            <small class="muted">AI MATCH · ${fit.tag} · ${fit.occasion}</small>
            <h3>${fit.name}</h3>
            <p class="muted">${fit.items}</p>
            <div class="price">₹${fit.price.toLocaleString("en-IN")}</div>
            <div class="actions">
              <button type="button" data-save="${fit.index}">♡ Save</button>
              <button type="button" data-remix="${fit.index}">↻ Remix</button>
              <button type="button" data-shop="${fit.index}">Shop →</button>
            </div>
          </div>
        </article>
      `).join("");

      setStatus("✦ 3 personalized looks ready.");
      updateStep(4);
      bindResultActions(fits);
    }, 650);
  });

  function bindResultActions(fits) {
    $$("[data-save]", $("#results")).forEach(button => {
      button.addEventListener("click", () => {
        const fit = fits[Number(button.dataset.save)];
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
      button.addEventListener("click", () => {
        alert("Shopping links are not connected yet. Add approved affiliate/product APIs before using live links.");
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
    list.innerHTML = saved.slice().reverse().map(item => `
      <article class="panel saved-card">
        <div>
          <b>${item.name}</b>
          <p class="muted">${item.items}</p>
          <span class="price">₹${Number(item.price).toLocaleString("en-IN")}</span>
        </div>
        <button class="outline" type="button" data-remove-saved="${encodeURIComponent(item.name)}">Remove</button>
      </article>
    `).join("");
    clear?.classList.remove("hidden");

    $$('[data-remove-saved]', list).forEach(button => {
      button.addEventListener("click", () => {
        const name = decodeURIComponent(button.dataset.removeSaved);
        const next = saved.filter(item => item.name !== name);
        localStorage.setItem(STORAGE.saved, JSON.stringify(next));
        renderSaved();
      });
    });
  }

  $("#clearSaved")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE.saved);
    renderSaved();
  });

  // Demo login: browser-only and deliberately not a real authentication system.
  const loginDialog = $("#loginDialog");
  $("#loginBtn")?.addEventListener("click", () => {
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
