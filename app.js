console.log("🔥 FITAI APP.JS IS LOADED 🔥");
alert("FITAI JS LOADED");
// =========================================
// FITAI - APP.JS
// FINAL VERSION
// =========================================

document.addEventListener("DOMContentLoaded", function () {

  // =========================================
  // PREFERENCE BUTTONS
  // =========================================

  const groups = document.querySelectorAll(".choice-group");

  console.log("FITAI: groups found =", groups.length);

  groups.forEach(function (group) {

    const buttons = group.querySelectorAll(".choice");

    buttons.forEach(function (button) {

      button.addEventListener("click", function (event) {

        event.preventDefault();

        const isMultiple = group.classList.contains("multi");

        // Single selection
        if (!isMultiple) {

          buttons.forEach(function (item) {
            item.classList.remove("active");
          });

          button.classList.add("active");

        }

        // Multiple selection
        else {

          button.classList.toggle("active");

        }

        console.log(
          "FITAI selected:",
          group.dataset.group,
          button.textContent.trim()
        );

      });

    });

  });


  // =========================================
  // SAVE MY STYLE
  // =========================================

  const saveButton =
    document.getElementById("savePreferences");

  if (saveButton) {

    saveButton.addEventListener("click", function (event) {

      event.preventDefault();

      const preferences = {};

      document
        .querySelectorAll(".choice-group")
        .forEach(function (group) {

          const groupName = group.dataset.group;

          const selected = [];

          group
            .querySelectorAll(".choice.active")
            .forEach(function (button) {

              selected.push(
                button.textContent.trim()
              );

            });

          preferences[groupName] = selected;

        });

      localStorage.setItem(
        "fitaiPreferences",
        JSON.stringify(preferences)
      );

      const status =
        document.getElementById("preferenceStatus");

      if (status) {

        status.textContent =
          "Your style has been saved ✓";

      }

      console.log(
        "FITAI Preferences:",
        preferences
      );

    });

  }


  // =========================================
  // LOGIN BUTTON
  // =========================================

  const loginButton =
    document.getElementById("loginBtn");

  const loginDialog =
    document.getElementById("loginDialog");

  if (loginButton && loginDialog) {

    loginButton.addEventListener("click", function (event) {

      event.preventDefault();

      if (!loginDialog.open) {
        loginDialog.showModal();
      }

    });

  }


  // =========================================
  // LOGIN CONTINUE
  // =========================================

  const loginForm =
    document.querySelector("#loginDialog form");

  const demoLogin =
    document.getElementById("demoLogin");

  if (loginForm && demoLogin) {

    loginForm.addEventListener("submit", function (event) {

      event.preventDefault();

      const email =
        document.getElementById("email");

      const password =
        loginForm.querySelector(
          'input[type="password"]'
        );

      if (!email || !email.value.trim()) {

        alert("Please enter your email.");

        if (email) {
          email.focus();
        }

        return;

      }

      if (!password || !password.value.trim()) {

        alert("Please enter your password.");

        if (password) {
          password.focus();
        }

        return;

      }

      console.log(
        "FITAI: Login successful",
        email.value
      );

      alert("Login successful ✓");

      loginDialog.close();

    });

  }


  // =========================================
  // PHOTO PREVIEW
  // =========================================

  const photoInput =
    document.getElementById("photoInput");

  const preview =
    document.getElementById("preview");

  if (photoInput && preview) {

    photoInput.addEventListener("change", function () {

      const file =
        photoInput.files &&
        photoInput.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = function (event) {

        preview.src =
          event.target.result;

        preview.style.display =
          "block";

      };

      reader.readAsDataURL(file);

    });

  }


  // =========================================
  // EXPLORE STYLE CHIPS
  // =========================================

  const chips =
    document.querySelectorAll(
      "#styleChips .chip"
    );

  chips.forEach(function (chip) {

    chip.addEventListener("click", function () {

      chips.forEach(function (item) {
        item.classList.remove("active");
      });

      chip.classList.add("active");

    });

  });


  // =========================================
  // HERO SCROLL
  // =========================================

  const scrollButtons =
    document.querySelectorAll("[data-scroll]");

  scrollButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {

      event.preventDefault();

      const selector =
        button.dataset.scroll;

      const target =
        document.querySelector(selector);

      if (target) {

        target.scrollIntoView({
          behavior: "smooth"
        });

      }

    });

  });


  // =========================================
  // GENERATE OUTFIT
  // =========================================

  const generateButton =
    document.getElementById("generateBtn");

  if (generateButton) {

    generateButton.addEventListener("click", function () {

      const status =
        document.getElementById("status");

      const results =
        document.getElementById("results");

      if (status) {

        status.textContent =
          "FITAI is preparing your personalized outfit...";

      }

      if (results) {

        results.innerHTML = `
          <article class="outfit">
            <div class="outfit-visual">✦</div>

            <div class="outfit-body">

              <p class="eyebrow">FITAI MATCH</p>

              <h3>Your personalized fit</h3>

              <p class="muted">
                Your selected preferences have been received.
              </p>

              <p class="price">
                Ready to style
              </p>

              <div class="actions">
                <button type="button">
                  Save
                </button>

                <button type="button">
                  Shop
                </button>
              </div>

            </div>
          </article>
        `;

      }

      console.log(
        "FITAI: Generate clicked"
      );

    });

  }


  // =========================================
  // LOAD SAVED PREFERENCES
  // =========================================

  try {

    const saved =
      localStorage.getItem(
        "fitaiPreferences"
      );

    if (saved) {

      const preferences =
        JSON.parse(saved);

      Object.keys(preferences).forEach(function (groupName) {

        const group =
          document.querySelector(
            '.choice-group[data-group="' +
            groupName +
            '"]'
          );

        if (!group) return;

        const selected =
          preferences[groupName];

        group
          .querySelectorAll(".choice")
          .forEach(function (button) {

            const text =
              button.textContent.trim();

            if (selected.includes(text)) {

              button.classList.add("active");

            }

          });

      });

    }

  } catch (error) {

    console.log(
      "FITAI: Could not load saved preferences"
    );

  }


  // =========================================
  // READY
  // =========================================

  console.log(
    "FITAI: APP.JS loaded successfully ✓"
  );

});
