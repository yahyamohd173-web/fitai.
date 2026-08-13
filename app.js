const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

document.querySelectorAll("[data-scroll]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.scroll).scrollIntoView({behavior:"smooth"})));

function setupChips(){
  $$(".chips .chip").forEach(btn=>btn.addEventListener("click",()=>{
    const group=btn.parentElement;
    group.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
  }));
}
setupChips();

$("#photoInput").addEventListener("change",e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  if(file.size>8*1024*1024){alert("Please choose an image under 8MB.");e.target.value="";return}
  const img=$("#preview");
  img.src=URL.createObjectURL(file);
  img.style.display="block";
});

const demoFits=[
  {name:"Midnight Street",emoji:"🖤",price:2499,items:"Oversized black tee · Baggy cargos · White sneakers",tag:"Streetwear"},
  {name:"Clean Signal",emoji:"🤍",price:2199,items:"Cream shirt · Straight trousers · Minimal sneakers",tag:"Minimal"},
  {name:"City Y2K",emoji:"🕶️",price:2899,items:"Graphic tee · Wide jeans · Retro sneakers",tag:"Y2K"}
];

function renderResults(){
  const style=$("#style").value, budget=Number($("#budget").value), results=$("#results");
  const fits=demoFits.map((x,i)=>({...x,tag:style,price:Math.min(x.price,budget)}));
  results.innerHTML=fits.map((x,i)=>`
    <article class="outfit">
      <div class="outfit-visual">${x.emoji}</div>
      <div class="outfit-body">
        <small class="muted">AI MATCH · ${x.tag}</small>
        <h3>${x.name}</h3>
        <p class="muted">${x.items}</p>
        <div class="price">₹${x.price.toLocaleString("en-IN")}</div>
        <div class="actions">
          <button data-save="${i}">♡ Save</button>
          <button data-remix="${i}">↻ Remix</button>
          <button data-shop="${i}">Shop →</button>
        </div>
      </div>
    </article>`).join("");

  results.querySelectorAll("[data-save]").forEach(b=>b.addEventListener("click",()=>{
    const fit=fits[Number(b.dataset.save)];
    const saved=JSON.parse(localStorage.getItem("fitai_saved")||"[]");
    saved.push(fit); localStorage.setItem("fitai_saved",JSON.stringify(saved));
    b.textContent="✓ Saved"; renderSaved();
  }));
  results.querySelectorAll("[data-remix]").forEach(b=>b.addEventListener("click",()=>{
    b.textContent="Remixing…";
    setTimeout(()=>{b.textContent="↻ Remix";alert("Demo remix complete. Connect your AI recommendation API for real regeneration.");},700);
  }));
  results.querySelectorAll("[data-shop]").forEach(b=>b.addEventListener("click",()=>{
    alert("Shopping integration placeholder. Connect approved Amazon/Flipkart/Myntra affiliate APIs or product feeds before publishing live links.");
  }));
}

$("#generateBtn").addEventListener("click",()=>{
  const status=$("#status");
  status.textContent="✦ Analyzing your preferences · matching colors · building outfits…";
  $("#results").innerHTML="";
  setTimeout(()=>{status.textContent="✦ 3 personalized looks ready.";renderResults()},1100);
});

function renderSaved(){
  const list=$("#savedList"), saved=JSON.parse(localStorage.getItem("fitai_saved")||"[]");
  if(!saved.length){list.innerHTML='<p class="muted">No saved outfits yet. Generate a look and tap Save.</p>';return}
  list.innerHTML=saved.slice(-6).reverse().map(x=>`<div class="panel" style="margin:10px 0"><b>${x.name}</b><span class="muted"> · ${x.items}</span><strong class="price"> · ₹${x.price.toLocaleString("en-IN")}</strong></div>`).join("");
}
renderSaved();

$("#loginBtn").addEventListener("click",()=>$("#loginDialog").showModal());
$("#demoLogin").addEventListener("click",e=>{
  e.preventDefault();
  const email=$("#email").value.trim();
  // ========================================
// FITAI — STYLE PREFERENCES
// ========================================

const preferenceState = {
  gender: "",
  styles: [],
  colors: [],
  budget: 3000,
  occasions: [],
  fit: ""
};


// ----------------------------------------
// SELECT / DESELECT BUTTONS
// ----------------------------------------

document.querySelectorAll(".choice-group").forEach((group) => {

  group.querySelectorAll(".choice").forEach((button) => {

    button.addEventListener("click", () => {

      const isMulti = group.classList.contains("multi");

      if (isMulti) {
        button.classList.toggle("active");
      } else {

        group.querySelectorAll(".choice").forEach((item) => {
          item.classList.remove("active");
        });

        button.classList.add("active");
      }

      updatePreferenceState();

    });

  });

});


// ----------------------------------------
// READ CURRENT SELECTIONS
// ----------------------------------------

function updatePreferenceState() {

  const genderGroup =
    document.querySelector('[data-group="gender"]');

  const genderButton =
    genderGroup?.querySelector(".choice.active");

  preferenceState.gender =
    genderButton?.textContent.trim() || "";


  const stylesGroup =
    document.querySelector('[data-group="styles"]');

  preferenceState.styles =
    Array.from(
      stylesGroup?.querySelectorAll(".choice.active") || []
    ).map((button) => button.textContent.trim());


  const colorsGroup =
    document.querySelector('[data-group="colors"]');

  preferenceState.colors =
    Array.from(
      colorsGroup?.querySelectorAll(".choice.active") || []
    ).map((button) => button.textContent.trim());


  const budgetGroup =
    document.querySelector('[data-group="budget"]');

  const budgetButton =
    budgetGroup?.querySelector(".choice.active");

  preferenceState.budget =
    Number(budgetButton?.dataset.value || 3000);


  const occasionsGroup =
    document.querySelector('[data-group="occasions"]');

  preferenceState.occasions =
    Array.from(
      occasionsGroup?.querySelectorAll(".choice.active") || []
    ).map((button) => button.textContent.trim());


  const fitGroup =
    document.querySelector('[data-group="fit"]');

  const fitButton =
    fitGroup?.querySelector(".choice.active");

  preferenceState.fit =
    fitButton?.textContent.trim() || "";

}


// ----------------------------------------
// SAVE TO SUPABASE
// ----------------------------------------

document
  .querySelector("#savePreferences")
  ?.addEventListener("click", async () => {

    const status =
      document.querySelector("#preferenceStatus");

    if (!status) return;


    if (
      typeof supabaseClient === "undefined" ||
      !supabaseClient
    ) {

      status.textContent =
        "Supabase is not configured.";

      return;
    }


    status.textContent =
      "Checking your account…";


    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

      status.textContent =
        "Please log in first.";

      return;
    }


    updatePreferenceState();


    status.textContent =
      "Saving your style…";


    const { error } =
      await supabaseClient
        .from("style_preferences")
        .upsert(
          {
            user_id: user.id,

            gender:
              preferenceState.gender,

            styles:
              preferenceState.styles,

            colors:
              preferenceState.colors,

            budget:
              preferenceState.budget,

            occasions:
              preferenceState.occasions,

            fit:
              preferenceState.fit,

            updated_at:
              new Date().toISOString()
          },
          {
            onConflict: "user_id"
          }
        );


    if (error) {

      console.error(
        "FITAI preference save error:",
        error
      );

      status.textContent =
        "Could not save: " + error.message;

      return;
    }


    status.textContent =
      "✓ Your style has been saved.";

  });


// ----------------------------------------
// LOAD SAVED PREFERENCES
// ----------------------------------------

async function loadPreferences() {

  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    return;
  }


  const {
    data: { user }
  } = await supabaseClient.auth.getUser();


  if (!user) return;


  const { data, error } =
    await supabaseClient
      .from("style_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();


  if (error) {

    console.error(
      "FITAI preference load error:",
      error
    );

    return;
  }


  if (!data) return;


  preferenceState.gender =
    data.gender || "";

  preferenceState.styles =
    data.styles || [];

  preferenceState.colors =
    data.colors || [];

  preferenceState.budget =
    data.budget || 3000;

  preferenceState.occasions =
    data.occasions || [];

  preferenceState.fit =
    data.fit || "";


  applyPreferencesToUI();

}


// ----------------------------------------
// APPLY SAVED VALUES TO BUTTONS
// ----------------------------------------

function applyPreferencesToUI() {

  document.querySelectorAll(".choice")
    .forEach((button) => {

      button.classList.remove("active");


      const text =
        button.textContent.trim();


      const group =
        button.closest(".choice-group");


      const groupName =
        group?.dataset.group;


      if (
        groupName === "gender" &&
        text === preferenceState.gender
      ) {

        button.classList.add("active");

      }


      if (
        groupName === "styles" &&
        preferenceState.styles.includes(text)
      ) {

        button.classList.add("active");

      }


      if (
        groupName === "colors" &&
        preferenceState.colors.includes(text)
      ) {

        button.classList.add("active");

      }


      if (
        groupName === "budget" &&
        Number(button.dataset.value) ===
        Number(preferenceState.budget)
      ) {

        button.classList.add("active");

      }


      if (
        groupName === "occasions" &&
        preferenceState.occasions.includes(text)
      ) {

        button.classList.add("active");

      }


      if (
        groupName === "fit" &&
        text === preferenceState.fit
      ) {

        button.classList.add("active");

      }

    });

}


// ----------------------------------------
// LOAD AFTER LOGIN
// ----------------------------------------

if (
  typeof supabaseClient !== "undefined" &&
  supabaseClient
) {

  supabaseClient.auth.onAuthStateChange(
    (event, session) => {

      if (session) {

        setTimeout(() => {
          loadPreferences();
        }, 100);

      }

    }
  );

}


// Initial load
loadPreferences();
  if(!email){alert("Enter an email for the demo.");return}
  $("#loginBtn").textContent=email.split("@")[0];
  $("#loginDialog").close();
});
