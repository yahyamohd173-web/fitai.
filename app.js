document.addEventListener("DOMContentLoaded", () => {

  // =========================================
  // FITAI - PREFERENCES
  // =========================================

  const groups = document.querySelectorAll(".choice-group");

  groups.forEach((group) => {

    const buttons = group.querySelectorAll(".choice");

    buttons.forEach((button) => {

      button.addEventListener("click", () => {

        // Check if multiple selections are allowed
        const multiple = group.classList.contains("multi");

        // Single selection
        if (!multiple) {
          buttons.forEach((item) => {
            item.classList.remove("active");
          });
        }

        // Select / deselect clicked button
        button.classList.toggle("active");

        console.log(
          "Selected:",
          button.textContent.trim()
        );

      });

    });

  });


  // =========================================
  // SAVE MY STYLE
  // =========================================

  const saveButton = document.getElementById("savePreferences");

  if (saveButton) {

    saveButton.addEventListener("click", () => {

      const preferences = {};

      groups.forEach((group) => {

        const groupName = group.dataset.group;

        const selected = [...group.querySelectorAll(".choice.active")]
          .map((button) => button.textContent.trim());

        preferences[groupName] = selected;

      });

      console.log("FITAI Preferences:", preferences);

      // Save in browser
      localStorage.setItem(
        "fitaiPreferences",
        JSON.stringify(preferences)
      );

      const status = document.getElementById("preferenceStatus");

      if (status) {
        status.textContent = "Your style has been saved ✓";
      }

    });

  }


  // =========================================
  // LOGIN BUTTON
  // =========================================

  const loginButton = document.getElementById("loginBtn");

  if (loginButton) {

    loginButton.addEventListener("click", () => {

      // Try common login elements
      const loginDialog =
        document.getElementById("loginDialog") ||
        document.querySelector("dialog") ||
        document.querySelector(".modal");

      if (loginDialog) {

        if (typeof loginDialog.showModal === "function") {
          loginDialog.showModal();
        } else {
          loginDialog.style.display = "flex";
        }

      } else {

        console.log("Login dialog not found.");

      }

    });

  }


  // =========================================
  // LOGIN - CONTINUE BUTTON
  // =========================================

  document.addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) return;

    const text = button.textContent.trim().toLowerCase();

    if (
      text === "continue" ||
      text === "continue →" ||
      text === "continue >"
    ) {

      event.preventDefault();

      const email =
        document.querySelector(
          'input[type="email"]'
        );

      const password =
        document.querySelector(
          'input[type="password"]'
        );

      if (email && email.value.trim() === "") {

        alert("Please enter your email.");

        email.focus();

        return;

      }

      if (password && password.value.trim() === "") {

        alert("Please enter your password.");

        password.focus();

        return;

      }

      console.log("Login Continue clicked.");

      alert("Login button is working!");

    }

  });


});
