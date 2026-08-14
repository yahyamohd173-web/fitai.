(() => {
  "use strict";

  // =========================================
  // FITAI — APP.JS
  // FINAL MVP VERSION
  // =========================================

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

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


  // =========================================
  // OUTFIT CATALOG
  // =========================================

  const outfitCatalog = [

    {
      name: "Midnight Street",
      emoji: "🖤",
      price: 2499,
      styles: ["Streetwear", "Grunge", "Y2K"],
      colors: ["Black", "Grey", "White"],
      occasions: ["College", "Casual", "Party"],
      fits: ["Baggy", "Oversized", "Relaxed"],
      items: "Oversized black tee · Baggy cargos · White sneakers"
    },

    {
      name: "Clean Signal",
      emoji: "🤍",
      price: 2199,
      styles: ["Minimal", "Smart Casual", "Old Money"],
      colors: ["White", "Beige", "Grey"],
      occasions: ["College", "Casual", "Date", "Dinner"],
      fits: ["Regular", "Relaxed", "Slim"],
      items: "Cream shirt · Straight trousers · Minimal sneakers"
    },

    {
      name: "City Y2K",
      emoji: "🕶️",
      price: 2899,
      styles: ["Y2K", "Streetwear"],
      colors: ["Blue", "Black", "White"],
      occasions: ["Party", "Casual", "College"],
      fits: ["Baggy", "Oversized"],
      items: "Graphic tee · Wide jeans · Retro sneakers"
    },

    {
      name: "Seoul Layer",
      emoji: "🇰🇷",
      price: 2799,
      styles: ["Korean", "Minimal", "Smart Casual"],
      colors: ["Black", "White", "Grey", "Beige"],
      occasions: ["College", "Casual", "Date", "Dinner"],
      fits: ["Oversized", "Regular", "Relaxed"],
      items: "Boxy overshirt · Wide trousers · Clean sneakers"
    },

    {
      name: "Quiet Luxury",
      emoji: "🕊️",
      price: 3199,
      styles: ["Old Money", "Minimal", "Smart Casual"],
      colors: ["Beige", "White", "Brown", "Grey"],
      occasions: ["Date", "Dinner", "Wedding", "Vacation"],
      fits: ["Regular", "Slim", "Relaxed"],
      items: "Textured polo · Pleated trousers · Loafers"
    },

    {
      name: "Retro Weekend",
      emoji: "📼",
      price: 2399,
      styles: ["Vintage", "Y2K", "Streetwear"],
      colors: ["Blue", "Brown", "White", "Red"],
      occasions: ["Casual", "College", "Party", "Vacation"],
      fits: ["Baggy", "Relaxed", "Oversized"],
      items: "Vintage graphic tee · Washed denim · Retro trainers"
    },

    {
      name: "Dark Academia",
      emoji: "📚",
      price: 2999,
      styles: ["Vintage", "Old Money", "Korean"],
      colors: ["Brown", "Black", "Beige", "Grey"],
      occasions: ["College", "Date", "Dinner", "Casual"],
      fits: ["Regular", "Relaxed"],
      items: "Knit sweater · Brown trousers · Leather loafers"
    },

    {
      name: "Active Mode",
      emoji: "⚡",
      price: 1999,
      styles: ["Athleisure", "Streetwear", "Korean"],
      colors: ["Black", "Grey", "White", "Blue"],
      occasions: ["College", "Casual", "Vacation"],
      fits: ["Oversized", "Relaxed", "Regular"],
      items: "Relaxed hoodie · Track pants · Chunky sneakers"
    },

    {
      name: "Weekend Prep",
      emoji: "🎓",
      price: 2599,
      styles: ["Preppy", "Old Money", "Smart Casual"],
      colors: ["White", "Blue", "Beige", "Brown"],
      occasions: ["College", "Date", "Vacation", "Dinner"],
      fits: ["Regular", "Relaxed"],
      items: "Oxford shirt · Chinos · Clean sneakers"
    },

    {
      name: "Grunge Core",
      emoji: "🎸",
      price: 2299,
      styles: ["Grunge", "Vintage", "Streetwear"],
      colors: ["Black", "Red", "Grey", "White"],
      occasions: ["Party", "Casual", "College"],
      fits: ["Oversized", "Baggy", "Relaxed"],
      items: "Washed band tee · Distressed denim · High-top sneakers"
    }

  ];


  // =========================================
  // HELPERS
  // =========================================

  function safeJSONParse(value, fallback) {

    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }

  }


  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }


  function money(value) {

    return `₹${Number(value).toLocaleString("en-IN")}`;

  }


  function escapeHTML(value) {

    return String(value).replace(/[&<>'"]/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[char]));

  }


  function setStatus(message = "", target = "#status") {

    const element = $(target);

    if (element) {
      element.textContent = message;
    }

  }


  function updateStep(step) {

    $$(".steps span").forEach((element, index) => {

      element.classList.toggle(
        "active",
        index < step
      );

    });

  }


  // =========================================
  // HERO SCROLL
  // =========================================

  $$("[data-scroll]").forEach(button => {

    button.addEventListener("click", event => {

      event.preventDefault();

      const target = $(button.dataset.scroll);

      if (target) {

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    });

  });


  // =========================================
  // STYLE CHIPS
  // =========================================

  $$("#styleChips .chip").forEach(chip => {

    chip.addEventListener("click", () => {

      $$("#styleChips .chip").forEach(item => {
        item.classList.remove("active");
      });

      chip.classList.add("active");

      const style = chip.textContent.trim();

      const select = $("#style");

      if (
        select &&
        Array.from(select.options).some(
          option => option.value === style
        )
      ) {

        select.value = style;

      }

    });

  });


  // =========================================
  // PREFERENCE BUTTONS
  // =========================================

  function syncPreferencesFromUI() {

    const getGroup = name =>
      $(`.choice-group[data-group="${name}"]`);

    const getOne = name => {

      const group = getGroup(name);

      if (!group) return "";

      const active =
        $(".choice.active", group);

      return active
        ? active.textContent.trim()
        : "";

    };


    const getMany = name => {

      const group = getGroup(name);

      if (!group) return [];

      return $$(".choice.active", group)
        .map(button => button.textContent.trim());

    };


    const budgetGroup =
      getGroup("budget");

    const budgetButton =
      budgetGroup
        ? $(".choice.active", budgetGroup)
        : null;


    state.preferences = {

      gender: getOne("gender"),

      styles: getMany("styles"),

      colors: getMany("colors"),

      budget:
        Number(
          budgetButton?.dataset.value ||
          $("#budget")?.value ||
          3000
        ),

      occasions: getMany("occasions"),

      fit: getOne("fit")

    };

  }


  $$(".choice-group").forEach(group => {

    const buttons =
      $$(".choice", group);

    const multiple =
      group.classList.contains("multi");


    buttons.forEach(button => {

      button.addEventListener("click", event => {

        event.preventDefault();

        if (!multiple) {

          buttons.forEach(item => {
            item.classList.remove("active");
          });

          button.classList.add("active");

        } else {

          button.classList.toggle("active");

        }

        syncPreferencesFromUI();

        updateStep(2);

      });

    });

  });


  // =========================================
  // APPLY SAVED PREFERENCES
  // =========================================

  function applyPreferencesToUI() {

    const preferences =
      state.preferences;


    $$(".choice").forEach(button => {
      button.classList.remove("active");
    });


    function activate(groupName, values) {

      const group =
        $(`.choice-group[data-group="${groupName}"]`);

      if (!group) return;

      const list =
        Array.isArray(values)
          ? values
          : [values];


      $$(".choice", group).forEach(button => {

        let matches = false;

        if (groupName === "budget") {

          matches =
            Number(button.dataset.value) ===
            Number(preferences.budget);

        } else {

          matches =
            list.includes(
              button.textContent.trim()
            );

        }


        if (matches) {
          button.classList.add("active");
        }

      });

    }


    activate(
      "gender",
      preferences.gender
    );

    activate(
      "styles",
      preferences.styles
    );

    activate(
      "colors",
      preferences.colors
    );

    activate(
      "budget",
      preferences.budget
    );

    activate(
      "occasions",
      preferences.occasions
    );

    activate(
      "fit",
      preferences.fit
    );

  }


  // =========================================
  // SAVE PREFERENCES
  // =========================================

  function savePreferences() {

    syncPreferencesFromUI();

    localStorage.setItem(
      STORAGE.preferences,
      JSON.stringify(state.preferences)
    );


    setStatus(
      "✓ Your style has been saved.",
      "#preferenceStatus"
    );

  }


  $("#savePreferences")?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      savePreferences();

    }
  );


  // =========================================
  // PHOTO UPLOAD
  // =========================================

  const photoInput =
    $("#photoInput");

  const preview =
    $("#preview");

  const removePhoto =
    $("#removePhoto");


  photoInput?.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];

      if (!file) return;


      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];


      if (!allowed.includes(file.type)) {

        alert(
          "Please choose a JPG, PNG or WebP image."
        );

        event.target.value = "";

        return;

      }


      if (file.size > 8 * 1024 * 1024) {

        alert(
          "Please choose an image under 8MB."
        );

        event.target.value = "";

        return;

      }


      if (state.photoUrl) {

        URL.revokeObjectURL(
          state.photoUrl
        );

      }


      state.photoUrl =
        URL.createObjectURL(file);


      if (preview) {

        preview.src =
          state.photoUrl;

        preview.style.display =
          "block";

      }


      const info =
        $("#photoInfo");

      if (info) {

        info.textContent =
          `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;

      }


      removePhoto?.classList.remove(
        "hidden"
      );

      updateStep(1);

    }
  );


  removePhoto?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      if (state.photoUrl) {

        URL.revokeObjectURL(
          state.photoUrl
        );

      }

      state.photoUrl = "";

      if (photoInput) {
        photoInput.value = "";
      }

      if (preview) {

        preview.removeAttribute(
          "src"
        );

        preview.style.display =
          "none";

      }

      const info =
        $("#photoInfo");

      if (info) {
        info.textContent = "";
      }

      removePhoto?.classList.add(
        "hidden"
      );

    }
  );


  // =========================================
  // QUICK FORM
  // =========================================

  function getQuickInputs() {

    return {

      style:
        $("#style")?.value ||
        "Streetwear",

      budget:
        Number(
          $("#budget")?.value ||
          3000
        ),

      occasion:
        $("#occasion")?.value ||
        "Casual"

    };

  }


  // =========================================
  // OUTFIT SCORING
  // =========================================

  function scoreOutfit(
    outfit,
    preferences,
    quick
  ) {

    let score = 42;

    const reasons = [];

    const preferredStyles =
      preferences.styles.length
        ? preferences.styles
        : [quick.style];


    const preferredColors =
      preferences.colors;


    const preferredOccasions =
      preferences.occasions.length
        ? preferences.occasions
        : [quick.occasion];


    const preferredFit =
      preferences.fit;


    const budget =
      preferences.budget ||
      quick.budget;


    const styleHits =
      outfit.styles.filter(style =>
        preferredStyles.some(
          value =>
            normalize(value) ===
            normalize(style)
        )
      ).length;


    const colorHits =
      outfit.colors.filter(color =>
        preferredColors.some(
          value =>
            normalize(value) ===
            normalize(color)
        )
      ).length;


    const occasionHits =
      outfit.occasions.filter(value =>
        preferredOccasions.some(
          pref =>
            normalize(pref) ===
            normalize(value)
        )
      ).length;


    const fitHit =
      preferredFit &&
      outfit.fits.some(
        value =>
          normalize(value) ===
          normalize(preferredFit)
      );


    score +=
      Math.min(
        styleHits * 18,
        36
      );


    score +=
      Math.min(
        colorHits * 8,
        24
      );


    if (occasionHits) {
      score += 12;
    }


    if (fitHit) {
      score += 12;
    }


    if (outfit.price <= budget) {

      score += 12;

      reasons.push(
        "within your budget"
      );

    } else {

      score -= Math.min(
        30,
        Math.ceil(
          (outfit.price - budget) / 100
        )
      );

    }


    if (styleHits) {

      reasons.push(
        `${styleHits} style match${styleHits > 1 ? "es" : ""}`
      );

    }


    if (colorHits) {

      reasons.push(
        `${colorHits} color match${colorHits > 1 ? "es" : ""}`
      );

    }


    if (occasionHits) {

      reasons.push(
        "fits your occasion"
      );

    }


    if (fitHit) {

      reasons.push(
        `${preferredFit.toLowerCase()} fit`
      );

    }


    return {

      score:
        Math.max(
          1,
          Math.min(
            99,
            Math.round(score)
          )
        ),

      reasons

    };

  }


  // =========================================
  // BUILD RECOMMENDATIONS
  // =========================================

  function buildRecommendations() {

    syncPreferencesFromUI();

    const preferences =
      state.preferences;

    const quick =
      getQuickInputs();


    return outfitCatalog

      .map((outfit, index) => {

        const result =
          scoreOutfit(
            outfit,
            preferences,
            quick
          );


        const maxBudget =
          preferences.budget ||
          quick.budget;


        return {

          ...outfit,

          index,

          tag:
            preferences.styles[0] ||
            quick.style,

          occasion:
            preferences.occasions[0] ||
            quick.occasion,

          match:
            result.score,

          reasons:
            result.reasons.length
              ? result.reasons.slice(0, 3)
              : [
                  "balanced with your preferences"
                ],

          overBudget:
            outfit.price > maxBudget

        };

      })

      .sort(
        (a, b) =>
          b.match - a.match ||
          a.price - b.price
      )

      .slice(0, 3);

  }


  // =========================================
  // RENDER RESULTS
  // =========================================

  function renderRecommendations(
    fits
  ) {

    const results =
      $("#results");

    if (!results) return;


    results.innerHTML =
      fits.map(
        (fit, position) => `

        <article class="outfit">

          <div
            class="outfit-visual"
            aria-hidden="true"
          >
            ${fit.emoji}
          </div>


          <div class="outfit-body">

            <small class="muted">
              AI MATCH · ${fit.match}% ·
              ${escapeHTML(fit.tag)}
            </small>


            <h3>
              ${escapeHTML(fit.name)}
            </h3>


            <p class="muted">
              ${escapeHTML(fit.items)}
            </p>


            <p class="muted tiny">
              Why:
              ${escapeHTML(
                fit.reasons.join(" · ")
              )}
            </p>


            <div class="price">

              ${money(fit.price)}

              ${
                fit.overBudget
                  ? " · above budget"
                  : ""
              }

            </div>


            <div class="actions">

              <button
                type="button"
                data-save="${position}"
              >
                ♡ Save
              </button>


              <button
                type="button"
                data-remix="${position}"
              >
                ↻ Remix
              </button>


              <button
                type="button"
                data-shop="${position}"
              >
                Shop →
              </button>

            </div>

          </div>

        </article>

      `
      ).join("");


    bindResultActions(fits);

  }


  // =========================================
  // GENERATE
  // =========================================

  $("#generateBtn")?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      const results =
        $("#results");


      syncPreferencesFromUI();


      updateStep(3);


      setStatus(
        "✦ Analyzing your preferences · matching styles · checking budget…"
      );


      if (results) {

        results.innerHTML = `

          <div class="panel">

            <b>
              FITAI is styling you…
            </b>

            <p class="muted">
              Finding the best matches
              for your preferences.
            </p>

          </div>

        `;

      }


      setTimeout(() => {

        const fits =
          buildRecommendations();


        state.lastFits =
          fits;


        renderRecommendations(
          fits
        );


        if (fits.length) {

          setStatus(
            `✦ ${fits.length} personalized looks ready. Your best match is ${fits[0].match}%.`
          );

        }


        updateStep(4);


        results?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }, 650);

    }
  );


  // =========================================
  // RESULT BUTTONS
  // =========================================

  function bindResultActions(fits) {


    // SAVE
    $$(
      "[data-save]",
      $("#results")
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const fit =
            fits[
              Number(
                button.dataset.save
              )
            ];


          if (!fit) return;


          const saved =
            safeJSONParse(
              localStorage.getItem(
                STORAGE.saved
              ),
              []
            );


          const duplicate =
            saved.some(
              item =>
                item.name === fit.name
            );


          if (!duplicate) {

            saved.push(fit);

            localStorage.setItem(
              STORAGE.saved,
              JSON.stringify(
                saved.slice(-12)
              )
            );

          }


          button.textContent =
            "✓ Saved";


          renderSaved();

        }
      );

    });


    // REMIX
    $$(
      "[data-remix]",
      $("#results")
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          button.disabled = true;

          button.textContent =
            "Remixing…";


          setTimeout(() => {

            const current =
              state.lastFits.length
                ? state.lastFits
                : buildRecommendations();


            const rotated =
              current
                .slice(1)
                .concat(
                  current.slice(0, 1)
                );


            state.lastFits =
              rotated;


            renderRecommendations(
              rotated
            );


            setStatus(
              `↻ Remix complete. ${rotated[0].name} is now your top match.`
            );

          }, 450);

        }
      );

    });


    // SHOP
    $$(
      "[data-shop]",
      $("#results")
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const fit =
            fits[
              Number(
                button.dataset.shop
              )
            ];


          if (fit) {

            openShop(fit);

          }

        }
      );

    });

  }


  // =========================================
  // SAVED LOOKS
  // =========================================

  function renderSaved() {

    const list =
      $("#savedList");

    if (!list) return;


    const saved =
      safeJSONParse(
        localStorage.getItem(
          STORAGE.saved
        ),
        []
      );


    if (!saved.length) {

      list.innerHTML = `
        <p class="muted">
          No saved outfits yet.
          Generate a look and tap Save.
        </p>
      `;

      return;

    }


    list.innerHTML =
      saved
        .slice()
        .reverse()
        .map(
          (item, index) => `

          <article class="panel saved-card">

            <div>

              <b>
                ${escapeHTML(
                  item.name
                )}
              </b>

              <p class="muted">
                ${escapeHTML(
                  item.items
                )}
              </p>

              <span class="price">
                ${money(item.price)}
              </span>

            </div>


            <div class="actions">

              <button
                class="outline"
                type="button"
                data-saved-shop="${index}"
              >
                Shop →
              </button>


              <button
                class="outline"
                type="button"
                data-remove-saved="${index}"
              >
                Remove
              </button>

            </div>

          </article>

        `
        )
        .join("");


    $$(
      "[data-remove-saved]",
      list
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.removeSaved
            );


          const next =
            saved.filter(
              (_, i) =>
                i !==
                saved.length -
                1 -
                index
            );


          localStorage.setItem(
            STORAGE.saved,
            JSON.stringify(next)
          );


          renderSaved();

        }
      );

    });


    $$(
      "[data-saved-shop]",
      list
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.savedShop
            );


          const item =
            saved
              .slice()
              .reverse()[index];


          if (item) {

            openShop(item);

          }

        }
      );

    });

  }


  // =========================================
  // SHOP MODAL
  // =========================================

  function ensureShopModal() {

    let modal =
      $("#shopModal");


    if (modal) {
      return modal;
    }


    const css =
      document.createElement(
        "style"
      );


    css.id =
      "fitai-shop-css";


    css.textContent = `

      #shopModal {

        position: fixed;

        inset: 0;

        z-index: 9999;

        display: none;

        align-items: center;

        justify-content: center;

        padding: 20px;

        background:
          rgba(0,0,0,.80);

        backdrop-filter:
          blur(10px);

      }


      #shopModal.open {

        display: flex;

      }


      .shop-dialog {

        position: relative;

        width:
          min(900px,96vw);

        max-height: 90vh;

        overflow-y: auto;

        background:
          #141416;

        color:
          #f4f4f0;

        border:
          1px solid #2b2b30;

        border-radius:
          24px;

        padding:
          26px;

        box-shadow:
          0 25px 80px
          rgba(0,0,0,.65);

      }


      .shop-close {

        position:
          absolute;

        right:
          14px;

        top:
          8px;

        border:
          0;

        background:
          transparent;

        color:
          #aaa;

        font-size:
          30px;

        cursor:
          pointer;

      }


      .shop-head {

        padding-right:
          35px;

      }


      .shop-head h2 {

        font-size:
          clamp(28px,5vw,44px);

        margin:
          5px 0;

      }


      .shop-total {

        color:
          #d9ff5a;

        font-weight:
          850;

        font-size:
          18px;

        margin-top:
          8px;

      }


      .shop-items {

        display:
          grid;

        grid-template-columns:
          repeat(3,1fr);

        gap:
          12px;

        margin-top:
          20px;

      }


      .shop-item {

        background:
          #1a1a1d;

        border:
          1px solid #2b2b30;

        border-radius:
          18px;

        padding:
          16px;

        display:
          flex;

        flex-direction:
          column;

        min-height:
          190px;

      }


      .shop-icon {

        font-size:
          34px;

      }


      .shop-item h3 {

        font-size:
          15px;

        margin:
          8px 0;

      }


      .shop-price {

        color:
          #d9ff5a;

        font-weight:
          850;

        margin-bottom:
          12px;

      }


      .shop-links {

        display:
          grid;

        grid-template-columns:
          1fr 1fr;

        gap:
          7px;

        margin-top:
          auto;

      }


      .shop-link {

        padding:
          9px 6px;

        text-align:
          center;

        text-decoration:
          none;

        border-radius:
          10px;

        background:
          #0f0f11;

        border:
          1px solid #2b2b30;

        color:
          #f4f4f0;

        font-size:
          12px;

        font-weight:
          750;

      }


      .shop-link:hover {

        border-color:
          #d9ff5a;

        color:
          #d9ff5a;

      }


      .shop-footer {

        border-top:
          1px solid #2b2b30;

        margin-top:
          18px;

        padding-top:
          16px;

        display:
          flex;

        gap:
          12px;

        align-items:
          center;

        justify-content:
          space-between;

        flex-wrap:
          wrap;

      }


      .shop-note {

        color:
          #a5a5aa;

        font-size:
          12px;

        max-width:
          540px;

      }


      .shop-all {

        background:
          #d9ff5a;

        color:
          #111;

        text-decoration:
          none;

        border-radius:
          999px;

        padding:
          11px 16px;

        font-weight:
          850;

      }


      @media(max-width:700px) {

        .shop-items {

          grid-template-columns:
            1fr;

        }

        .shop-dialog {

          padding:
            18px;

        }

      }

    `;


    document.head.appendChild(
      css
    );


    modal =
      document.createElement(
        "div"
      );


    modal.id =
      "shopModal";


    modal.setAttribute(
      "role",
      "dialog"
    );


    modal.setAttribute(
      "aria-modal",
      "true"
    );


    modal.innerHTML = `

      <div class="shop-dialog">

        <button
          type="button"
          class="shop-close"
          aria-label="Close shop"
        >
          ×
        </button>

        <div id="shopContent"></div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    function closeShop() {

      modal.classList.remove(
        "open"
      );

    }


    $(".shop-close", modal)
      .addEventListener(
        "click",
        closeShop
      );


    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          closeShop();

        }

      }
    );


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          modal.classList.contains(
            "open"
          )
        ) {

          closeShop();

        }

      }
    );


    return modal;

  }


  // =========================================
  // MARKETPLACE SEARCH URLS
  // =========================================

  function shopSearchUrl(
    platform,
    query
  ) {

    const q =
      encodeURIComponent(
        query
      );


    if (
      platform === "amazon"
    ) {

      return (
        "https://www.amazon.in/s?k=" +
        q
      );

    }


    return (
      "https://www.flipkart.com/search?q=" +
      q
    );

  }


  // =========================================
  // ITEM ICON
  // =========================================

  function itemIcon(item) {

    const text =
      normalize(item);


    if (
      /shoe|sneaker|loafer|trainer/
        .test(text)
    ) {

      return "👟";

    }


    if (
      /cargo|jean|trouser|chino|denim|pant/
        .test(text)
    ) {

      return "👖";

    }


    if (
      /tee|shirt|polo|hoodie|sweater|overshirt/
        .test(text)
    ) {

      return "👕";

    }


    return "🧥";

  }


  // =========================================
  // OPEN SHOP
  // =========================================

  function openShop(fit) {

    const modal =
      ensureShopModal();


    const content =
      $("#shopContent", modal);


    if (!content) return;


    const items =
      String(
        fit.items || ""
      )
      .split(" · ")
      .map(
        item => item.trim()
      )
      .filter(Boolean);


    const count =
      items.length || 1;


    const basePrice =
      Number(fit.price || 0);


    const prices =
      items.map(
        (_, index) => {

          if (count === 3) {

            if (index === 0) {
              return Math.round(
                basePrice * .28 / 100
              ) * 100;
            }

            if (index === 1) {
              return Math.round(
                basePrice * .38 / 100
              ) * 100;
            }

            return Math.max(
              299,
              basePrice
              -
              Math.round(
                basePrice * .28 / 100
              ) * 100
              -
              Math.round(
                basePrice * .38 / 100
              ) * 100
            );

          }


          return Math.max(
            299,
            Math.round(
              basePrice /
              count /
              100
            ) * 100
          );

        }
      );


    const total =
      prices.reduce(
        (sum, value) =>
          sum + value,
        0
      );


    const fullQuery =
      `${items.join(" ")} ${fit.tag || ""} men fashion`;


    content.innerHTML = `

      <div class="shop-head">

        <div class="eyebrow">
          SHOP THIS LOOK
        </div>


        <h2>
          ${escapeHTML(fit.name)}
        </h2>


        <p class="muted">
          ${escapeHTML(fit.items)}
        </p>


        <div class="shop-total">
          Estimated total ·
          ${money(total)}
        </div>

      </div>


      <div class="shop-items">

        ${
          items.map(
            (item, index) => {

              const query =
                `${item} men fashion India`;


              return `

                <article class="shop-item">

                  <div class="shop-icon">
                    ${itemIcon(item)}
                  </div>


                  <h3>
                    ${escapeHTML(item)}
                  </h3>


                  <div class="shop-price">
                    ${money(
                      prices[index]
                    )}
                  </div>


                  <div class="shop-links">

                    <a
                      class="shop-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="${shopSearchUrl(
                        "amazon",
                        query
                      )}"
                    >
                      Amazon ↗
                    </a>


                    <a
                      class="shop-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="${shopSearchUrl(
                        "flipkart",
                        query
                      )}"
                    >
                      Flipkart ↗
                    </a>

                  </div>

                </article>

              `;

            }
          ).join("")
        }

      </div>


      <div class="shop-footer">

        <div class="shop-note">

          FITAI opens live marketplace
          searches. Prices shown here
          are estimates. Amazon/Flipkart
          will show the current price,
          seller and availability.

        </div>


        <a
          class="shop-all"
          target="_blank"
          rel="noopener noreferrer"
          href="${shopSearchUrl(
            "amazon",
            fullQuery
          )}"
        >
          Shop full look on Amazon ↗
        </a>

      </div>

    `;


    modal.classList.add(
      "open"
    );

  }


  // =========================================
  // LOGIN
  // =========================================

  const loginDialog =
    $("#loginDialog");


  $("#loginBtn")?.addEventListener(
    "click",
    event => {

      event.preventDefault();


      if (
        loginDialog &&
        !loginDialog.open
      ) {

        if (
          typeof loginDialog.showModal ===
          "function"
        ) {

          loginDialog.showModal();

        } else {

          loginDialog.style.display =
            "flex";

        }

      }

    }
  );


  // =========================================
  // LOGIN CONTINUE
  // =========================================

  const loginButton =
    $("#demoLogin");


  loginButton?.addEventListener(
    "click",
    event => {

      event.preventDefault();


      const email =
        $("#email")?.value.trim();


      const password =
        $('input[type="password"]')
          ?.value || "";


      if (!email) {

        alert(
          "Please enter your email."
        );

        $("#email")?.focus();

        return;

      }


      if (!password) {

        alert(
          "Please enter your password."
        );

        $('input[type="password"]')
          ?.focus();

        return;

      }


      if (password.length < 4) {

        alert(
          "Password must be at least 4 characters."
        );

        return;

      }


      const user = {

        email,

        name:
          email
            .split("@")[0]

      };


      localStorage.setItem(
        STORAGE.user,
        JSON.stringify(user)
      );


      const loginBtn =
        $("#loginBtn");


      if (loginBtn) {

        loginBtn.textContent =
          user.name;

      }


      if (loginDialog) {

        loginDialog.close();

      }


      setStatus(
        `Welcome back, ${user.name}.`,
        "#preferenceStatus"
      );

    }
  );


  // =========================================
  // RESTORE SAVED DATA
  // =========================================

  const savedPreferences =
    safeJSONParse(
      localStorage.getItem(
        STORAGE.preferences
      ),
      null
    );


  if (savedPreferences) {

    state.preferences = {

      ...state.preferences,

      ...savedPreferences

    };


    applyPreferencesToUI();

  }


  const savedUser =
    safeJSONParse(
      localStorage.getItem(
        STORAGE.user
      ),
      null
    );


  if (savedUser?.name) {

    const loginBtn =
      $("#loginBtn");


    if (loginBtn) {

      loginBtn.textContent =
        savedUser.name;

    }

  }


  // =========================================
  // INITIALIZE
  // =========================================

  renderSaved();

  updateStep(1);


  console.log(
    "FITAI APP.JS loaded successfully ✓"
  );

})();
