// =========================================
// FITAI - APP.JS
// =========================================


// =========================================
// PREFERENCE BUTTONS
// =========================================

document.addEventListener("click", function (event) {

  const button = event.target.closest(
    ".choice-group .choice"
  );

  if (!button) return;

  const group = button.closest(
    ".choice-group"
  );

  if (!group) return;

  const isMultiple =
    group.classList.contains("multi");


  // SINGLE SELECTION
  if (!isMultiple) {

    group
      .querySelectorAll(".choice")
      .forEach(function (item) {

        item.classList.remove("active");

      });

    button.classList.add("active");

  }


  // MULTIPLE SELECTION
  else {

    button.classList.toggle("active");

  }


  console.log(
    "FITAI:",
    group.dataset.group,
    button.textContent.trim()
  );

});


// =========================================
// SAVE MY STYLE
// =========================================

function savePreferences() {

  const groups =
    document.querySelectorAll(
      ".choice-group"
    );

  const preferences = {};


  groups.forEach(function (group) {

    const groupName =
      group.dataset.group;

    const selected = [];


    group
      .querySelectorAll(
        ".choice.active"
      )
      .forEach(function (button) {

        selected.push(
          button.textContent.trim()
        );

      });


    preferences[groupName] =
      selected;

  });


  localStorage.setItem(
    "fitaiPreferences",
    JSON.stringify(preferences)
  );


  const status =
    document.getElementById(
      "preferenceStatus"
    );


  if (status) {

    status.textContent =
      "Your style has been saved ✓";

  }


  console.log(
    "FITAI Preferences:",
    preferences
  );

}


// Save button

document.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        "#savePreferences"
      );

    if (!button) return;

    event.preventDefault();

    savePreferences();

  }
);


// =========================================
// LOGIN BUTTON
// =========================================

document.addEventListener(
  "click",
  function (event) {

    const loginButton =
      event.target.closest(
        "#loginBtn"
      );

    if (!loginButton) return;

    event.preventDefault();


    const dialog =
      document.getElementById(
        "loginDialog"
      );


    if (!dialog) {

      const modal =
        document.querySelector(
          ".modal"
        );


      if (modal) {

        modal.style.display =
          "flex";

      } else {

        alert(
          "Login window not found."
        );

      }

      return;

    }


    if (
      typeof dialog.showModal ===
      "function"
    ) {

      if (!dialog.open) {

        dialog.showModal();

      }

    } else {

      dialog.style.display =
        "flex";

    }

  }
);


// =========================================
// LOGIN CONTINUE
// =========================================

document.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        "#demoLogin"
      );

    if (!button) return;

    event.preventDefault();


    const email =
      document.querySelector(
        'input[type="email"]'
      );


    const password =
      document.querySelector(
        'input[type="password"]'
      );


    // Email validation

    if (
      email &&
      !email.value.trim()
    ) {

      alert(
        "Please enter your email."
      );

      email.focus();

      return;

    }


    // Password validation

    if (
      password &&
      !password.value.trim()
    ) {

      alert(
        "Please enter your password."
      );

      password.focus();

      return;

    }


    alert(
      "Login Continue is working!"
    );


    // Close dialog after successful demo login

    const dialog =
      document.getElementById(
        "loginDialog"
      );


    if (
      dialog &&
      typeof dialog.close ===
      "function"
    ) {

      dialog.close();

    }

  }
);


// =========================================
// PHOTO PREVIEW
// =========================================

document.addEventListener(
  "change",
  function (event) {

    const input =
      event.target.closest(
        "#photoInput"
      );

    if (!input) return;


    const file =
      input.files &&
      input.files[0];


    if (!file) return;


    const preview =
      document.getElementById(
        "preview"
      );


    if (!preview) return;


    const reader =
      new FileReader();


    reader.onload =
      function (e) {

        preview.src =
          e.target.result;

        preview.style.display =
          "block";

      };


    reader.readAsDataURL(file);

  }
);


// =========================================
// STYLE CHIPS
// =========================================

document.addEventListener(
  "click",
  function (event) {

    const chip =
      event.target.closest(
        "#styleChips .chip"
      );

    if (!chip) return;

    event.preventDefault();


    document
      .querySelectorAll(
        "#styleChips .chip"
      )
      .forEach(function (item) {

        item.classList.remove(
          "active"
        );

      });


    chip.classList.add(
      "active"
    );

  }
);


// =========================================
// HERO SCROLL BUTTON
// =========================================

document.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        "[data-scroll]"
      );

    if (!button) return;

    event.preventDefault();


    const targetSelector =
      button.dataset.scroll;


    const target =
      document.querySelector(
        targetSelector
      );


    if (target) {

      target.scrollIntoView({
        behavior: "smooth"
      });

    }

  }
);


// =========================================
// GENERATE BUTTON
// =========================================

document.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        "#generateBtn"
      );

    if (!button) return;

    event.preventDefault();


    const status =
      document.getElementById(
        "status"
      );


    if (status) {

      status.textContent =
        "FITAI is preparing your personalized outfit...";

    }


    console.log(
      "FITAI Generate clicked"
    );

  }
);
