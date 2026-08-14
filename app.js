(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE = {
    preferences: "fitai_preferences_v2",
    saved: "fitai_saved_v2",
    user: "fitai_demo_user_v2"
  };

  const state = {
    photoUrl: "",
    preferences: {
      gender: "",
      styles: [],
      colors: [],
      budget: 3000,
      occasions: [],
      fit: ""
    },
    lastFits: []
  };

  // Local recommendation catalog. This is the MVP AI-style engine: it scores
  // complete outfit recipes against the user's preferences instead of returning
  // the same three outfits every time.
  const outfitCatalog = [
    { name: "Midnight Street", emoji: "🖤", price: 2499, styles: ["Streetwear","Grunge","Y2K"], colors: ["Black","Grey","White"], occasions: ["College","Casual","Party"], fits: ["Baggy","Oversized","Relaxed"], items: "Oversized black tee · Baggy cargos · White sneakers" },
    { name: "Clean Signal", emoji: "🤍", price: 2199, styles: ["Minimal","Smart Casual","Old Money"], colors: ["White","Beige","Grey"], occasions: ["College","Casual","Date","Dinner"], fits: ["Regular","Relaxed","Slim"], items: "Cream shirt · Straight trousers · Minimal sneakers" },
    { name: "City Y2K", emoji: "🕶️", price: 2899, styles: ["Y2K","Streetwear"], colors: ["Blue","Black","White"], occasions: ["Party","Casual","College"], fits: ["Baggy","Oversized"], items: "Graphic tee · Wide jeans · Retro sneakers" },
    { name: "Seoul Layer", emoji: "🇰🇷", price: 2799, styles: ["Korean","Minimal","Smart Casual"], colors: ["Black","White","Grey","Beige"], occasions: ["College","Casual","Date","Dinner"], fits: ["Oversized","Regular","Relaxed"], items: "Boxy overshirt · Wide trousers · Clean sneakers" },
    { name: "Quiet Luxury", emoji: "🕊️", price: 3199, styles: ["Old Money","Minimal","Smart Casual"], colors: ["Beige","White","Brown","Grey"], occasions: ["Date","Dinner","Wedding","Vacation"], fits: ["Regular","Slim","Relaxed"], items: "Textured polo · Pleated trousers · Loafers" },
    { name: "Retro Weekend", emoji: "📼", price: 2399, styles: ["Vintage","Y2K","Streetwear"], colors: ["Blue","Brown","White","Red"], occasions: ["Casual","College","Party","Vacation"], fits: ["Baggy","Relaxed","Oversized"], items: "Vintage graphic tee · Washed denim · Retro trainers" },
    { name: "Dark Academia", emoji: "📚", price: 2999, styles: ["Vintage","Old Money","Korean"], colors: ["Brown","Black","Beige","Grey"], occasions: ["College","Date","Dinner","Casual"], fits: ["Regular","Relaxed"], items: "Knit sweater · Brown trousers · Leather loafers" },
    { name: "Active Mode", emoji: "⚡", price: 1999, styles: ["Athleisure","Streetwear","Korean"], colors: ["Black","Grey","White","Blue"], occasions: ["College","Casual","Vacation"], fits: ["Oversized","Relaxed","Regular"], items: "Relaxed hoodie · Track pants · Chunky sneakers" },
    { name: "Weekend Prep", emoji: "🎓", price: 2599, styles: ["Preppy","Old Money","Smart Casual"], colors: ["White","Blue","Beige","Brown"], occasions: ["College","Date","Vacation","Dinner"], fits: ["Regular","Relaxed"], items: "Oxford shirt · Chinos · Clean sneakers" },
    { name: "Grunge Core", emoji: "🎸", price: 2299, styles: ["Grunge","Vintage","Streetwear"], colors: ["Black","Red","Grey","White"], occasions: ["Party","Casual","College"], fits: ["Oversized","Baggy","Relaxed"], items: "Washed band tee · Distressed denim · High-top sneakers" }
  ];

  const colorFallback = {
    Black: "black", White: "white", Grey: "grey", Blue: "blue",
    Brown: "brown", Green: "green", Red: "red", Beige: "beige"
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

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function money(value) {
    return `₹${Number(value).toLocaleString("en-IN")}`;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
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
      const styleSelect = $("#style");
      if (styleSelect && Array.from(styleSelect.options).some(option => option.value === style)) {
        styleSelect.value = style;
      }
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

  $("#savePreferences")?.addEventListener("click", savePreferences);

  $("#clearPreferences")?.addEventListener("click", () => {
    state.preferences = { gender: "", styles: [], colors: [], budget: 3000, occasions: [], fit: "" };
    localStorage.removeItem(STORAGE.preferences);
    applyPreferencesToUI();
    setStatus("Preferences reset.", "#preferenceStatus");
  });

  // Photo preview.
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

  removePhoto?.addEventListener("click", () => {
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

  function getQuickInputs() {
    return {
      style: $("#style")?.value || "Streetwear",
      budget: Number($("#budget")?.value || 3000),
      occasion: $("#occasion")?.value || "Casual"
    };
  }

  function scoreOutfit(outfit, p, quick) {
    let score = 42;
    const reasons = [];
    const preferredStyles = p.styles.length ? p.styles : [quick.style];
    const preferredColors = p.colors;
    const preferredOccasions = p.occasions.length ? p.occasions : [quick.occasion];
    const preferredFit = p.fit;
    const budget = p.budget || quick.budget;

    const styleHits = outfit.styles.filter(style => preferredStyles.some(value => normalize(value) === normalize(style))).length;
    const colorHits = outfit.colors.filter(color => preferredColors.some(value => normalize(value) === normalize(color))).length;
    const occasionHits = outfit.occasions.filter(value => preferredOccasions.some(pref => normalize(pref) === normalize(value))).length;
    const fitHit = preferredFit && outfit.fits.some(value => normalize(value) === normalize(preferredFit));

    score += Math.min(styleHits * 18, 36);
    score += Math.min(colorHits * 8, 24);
    score += occasionHits ? 12 : 0;
    score += fitHit ? 12 : 0;

    if (outfit.price <= budget) {
      score += 12;
      reasons.push("within your budget");
    } else {
      score -= Math.min(30, Math.ceil((outfit.price - budget) / 100));
    }

    if (styleHits) reasons.push(`${outfit.styles.find(style => preferredStyles.some(pref => normalize(pref) === normalize(style))) || styleHits + " style matches"}`);
    if (colorHits) reasons.push(`${colorHits} color match${colorHits > 1 ? "es" : ""}`);
    if (occasionHits) reasons.push("fits your occasion");
    if (fitHit) reasons.push(`${preferredFit.toLowerCase()} fit`);

    return { score: Math.max(1, Math.min(99, Math.round(score))), reasons };
  }

  function buildRecommendations() {
    syncPreferencesFromUI();
    const p = state.preferences;
    const quick = getQuickInputs();

    return outfitCatalog
      .map((outfit, index) => {
        const result = scoreOutfit(outfit, p, quick);
        const maxBudget = p.budget || quick.budget;
        return {
          ...outfit,
          index,
          tag: p.styles[0] || quick.style,
          occasion: p.occasions[0] || quick.occasion,
          match: result.score,
          reasons: result.reasons.length ? result.reasons.slice(0, 3) : ["balanced with your preferences"],
          overBudget: outfit.price > maxBudget
        };
      })
      .sort((a, b) => b.match - a.match || a.price - b.price)
      .slice(0, 3);
  }

  function renderRecommendations(fits) {
    const results = $("#results");
    if (!results) return;
    results.innerHTML = fits.map((fit, position) => `
      <article class="outfit">
        <div class="outfit-visual" aria-hidden="true">${fit.emoji}</div>
        <div class="outfit-body">
          <small class="muted">AI MATCH · ${fit.match}% · ${escapeHTML(fit.tag)}</small>
          <h3>${escapeHTML(fit.name)}</h3>
          <p class="muted">${escapeHTML(fit.items)}</p>
          <p class="muted tiny">Why: ${escapeHTML(fit.reasons.join(" · "))}</p>
          <div class="price">${money(fit.price)}${fit.overBudget ? " · above budget" : ""}</div>
          <div class="actions">
            <button type="button" data-save="${position}">♡ Save</button>
            <button type="button" data-remix="${position}">↻ Remix</button>
            <button type="button" data-shop="${position}">Shop →</button>
          </div>
        </div>
      </article>
    `).join("");
    bindResultActions(fits);
  }

  // Generate personalized recommendations.
  $("#generateBtn")?.addEventListener("click", () => {
    const results = $("#results");
    syncPreferencesFromUI();

    if (!state.preferences.styles.length && !$("#style")?.value) {
      setStatus("Choose at least a style before generating.");
      return;
    }

    updateStep(3);
    setStatus("✦ Analyzing your preferences · scoring styles · matching colors · checking budget…");
    if (results) results.innerHTML = '<div class="panel"><b>FITAI is styling you…</b><p class="muted">Finding the best matches from your preferences.</p></div>';

    window.setTimeout(() => {
      const fits = buildRecommendations();
      state.lastFits = fits;
      renderRecommendations(fits);
      setStatus(`✦ ${fits.length} personalized looks ready. Your best match is ${fits[0].match}%.`);
      updateStep(4);
      results?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        button.textContent = "Remixing…";
        window.setTimeout(() => {
          const current = state.lastFits.length ? state.lastFits : buildRecommendations();
          const rotated = current.slice(1).concat(current.slice(0, 1));
          state.lastFits = rotated;
          renderRecommendations(rotated);
          setStatus(`↻ Remix complete. ${rotated[0].name} is now your top match.`);
        }, 450);
      });
    });

    $$("[data-shop]", $("#results")).forEach(button => {
      button.addEventListener("click", () => {
        alert("Live shopping is the next integration. Product/affiliate APIs can be connected here without changing the recommendation engine.");
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
          <b>${escapeHTML(item.name)}</b>
          <p class="muted">${escapeHTML(item.items)}</p>
          <span class="price">${money(item.price)}</span>
          ${item.match ? `<p class="muted tiny">${item.match}% AI match · ${escapeHTML(item.tag || "Personalized")}</p>` : ""}
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

  // Demo login: browser-only, not real authentication.
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

  // Restore state.
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
