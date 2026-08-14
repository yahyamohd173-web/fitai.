

  // =========================================
  // FITAI - ALL PREFERENCE BUTTONS
  // =========================================

  const groups = document.querySelectorAll(".choice-group");

  groups.forEach((group) => {

    const buttons = group.querySelectorAll(".choice");

    buttons.forEach((button) => {

      button.addEventListener("click", (event) => {

        event.preventDefault();

        // Multiple selection?
        const multiple = group.classList.contains("multi");

        // Single selection group
        if (!multiple) {
          buttons.forEach((item) => {
            item.classList.remove("active");
          });
        }

        // Toggle clicked button
      button.classList.add("active");

        console.log(
          "FITAI:",
          group.dataset.group,
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

    saveButton.addEventListener("click", (event) => {

      event.preventDefault();

      const preferences = {};

      groups.forEach((group) => {

        const groupName = group.dataset.group;

        const selected = [];

        group.querySelectorAll(".choice.active").forEach((button) => {
          selected.push(button.textContent.trim());
        });

        preferences[groupName] = selected;

      });

      localStorage.setItem(
        "fitaiPreferences",
        JSON.stringify(preferences)
      );

      const status = document.getElementById("preferenceStatus");

      if (status) {
        status.textContent = "Your style has been saved ✓";
      }

      console.log("FITAI Preferences:", preferences);

    });

  }


  // =========================================
  // LOGIN BUTTON
  // =========================================

  const loginButton = document.getElementById("loginBtn");

  if (loginButton) {

    loginButton.addEventListener("click", (event) => {

      event.preventDefault();

      const dialog = document.getElementById("loginDialog");

      if (dialog) {

        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.style.display = "flex";
        }

      } else {

        const modal = document.querySelector(".modal");

        if (modal) {
          modal.style.display = "flex";
        } else {
          alert("Login window not found.");
        }

      }

    });

  }


  // =========================================
  // LOGIN CONTINUE
  // =========================================

  document.addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) return;

    const text = button.textContent
      .trim()
      .toLowerCase();

    if (text !== "continue" && !text.startsWith("continue")) {
      return;
    }

    event.preventDefault();

    const email = document.querySelector(
      'input[type="email"]'
    );

    const password = document.querySelector(
      'input[type="password"]'
    );

    if (email && !email.value.trim()) {
      alert("Please enter your email.");
      email.focus();
      return;
    }

    if (password && !password.value.trim()) {
      alert("Please enter your password.");
      password.focus();
      return;
    }

    alert("Login Continue is working!");

  });
// FITAI preference buttons
document.querySelectorAll(".choice-group").forEach((group) => {

  group.querySelectorAll(".choice").forEach((button) => {

    button.addEventListener("click", function () {

      const isMultiple =
        group.classList.contains("multi");

      if (!isMultiple) {
        group
          .querySelectorAll(".choice")
          .forEach((item) => {
            item.classList.remove("active");
          });
      }

      this.classList.add("active");

    });

  });

});
