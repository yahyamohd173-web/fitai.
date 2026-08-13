const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Smooth scroll buttons
document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scroll);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// ================================
// FITAI - PREFERENCE BUTTONS
// ================================

function setupPreferenceButtons() {
  const buttons = document.querySelectorAll(
    ".choice, .chip, .preference-option, [data-choice]"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      // Find the nearest individual preference group
      const group =
        this.closest(".choice-group") ||
        this.closest(".choice-grid") ||
        this.closest(".panel");

      if (!group) {
        this.classList.toggle("active");
        return;
      }

      // Check whether this group allows multiple selections
      const multiple =
        group.classList.contains("multi") ||
        group.dataset.multiple === "true" ||
        group.dataset.select === "multiple";

      // Single-select group
      if (!multiple) {
        const groupButtons = group.querySelectorAll(
          ".choice, .chip, .preference-option, [data-choice]"
        );

        groupButtons.forEach((item) => {
          item.classList.remove("active");
        });
      }

      // Activate clicked button
      this.classList.add("active");
    });
  });
}

setupPreferenceButtons();


// ================================
// PHOTO UPLOAD
// ================================

const photoInput = $("#photoInput");

if (photoInput) {
  photoInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Please choose an image under 8MB.");
      event.target.value = "";
      return;
    }

    const preview = $("#preview");

    if (preview) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });
}


// ================================
// DEMO OUTFITS
// ================================

const demoFits = [
  {
    name: "Midnight Street",
    emoji: "🖤",
    price: 2499,
    items: "Oversized black tee · Baggy cargos · White sneakers",
    tag: "Streetwear"
  },
  {
    name: "Clean Signal",
    emoji: "🤍",
    price: 2199,
    items: "Cream shirt · Straight trousers · Minimal sneakers",
    tag: "Minimal"
  },
  {
    name: "City Y2K",
    emoji: "🕶️",
    price: 2899,
    items: "Graphic tee · Wide jeans · Retro sneakers",
    tag: "Y2K"
  }
];


// ================================
// STYLE CHIPS
// ================================

document.querySelectorAll(".chips").forEach((container) => {
  container.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");

    if (!chip) return;

    container.querySelectorAll(".chip").forEach((item) => {
      item.classList.remove("active");
    });

    chip.classList.add("active");
  });
});


// ================================
// SAVE MY STYLE
// ================================

const saveButton = $("#savePreferences");

if (saveButton) {
  saveButton.addEventListener("click", () => {

    const selected = {};

    // Find every preference panel
    document.querySelectorAll(".panel").forEach((panel) => {

      const active = panel.querySelector(".active");

      if (active) {
        const title = panel.querySelector("h3");

        if (title) {
          selected[title.textContent.trim()] =
            active.textContent.trim();
        }
      }
    });

    // Save in browser
    localStorage.setItem(
      "fitaiPreferences",
      JSON.stringify(selected)
    );

    const status = $("#preferenceStatus");

    if (status) {
      status.textContent = "✓ Your style has been saved.";
    }
  });
}


// ================================
// LOAD SAVED PREFERENCES
// ================================

function loadPreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("fitaiPreferences")
    );

    if (!saved) return;

    document.querySelectorAll(".panel").forEach((panel) => {

      const title = panel.querySelector("h3");

      if (!title) return;

      const key = title.textContent.trim();
      const value = saved[key];

      if (!value) return;

      panel.querySelectorAll(
        ".choice, .chip, .preference-option, [data-choice]"
      ).forEach((button) => {

        if (button.textContent.trim() === value) {
          button.classList.add("active");
        }
      });
    });

  } catch (error) {
    console.log("Could not load saved preferences.");
  }
}

loadPreferences();


// ================================
// LOGIN BUTTON
// ================================

const loginButton = $("#loginBtn");

if (loginButton) {
  loginButton.addEventListener("click", () => {
    const loginDialog = $("#loginDialog");

    if (loginDialog) {
      loginDialog.showModal();
    } else {
      alert("Login will be available soon.");
    }
  });
}


// ================================
// CLOSE LOGIN DIALOG
// ================================

const closeLogin = $("#closeLogin");

if (closeLogin) {
  closeLogin.addEventListener("click", () => {
    const loginDialog = $("#loginDialog");

    if (loginDialog) {
      loginDialog.close();
    }
  });
}
