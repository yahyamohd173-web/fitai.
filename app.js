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
// ========================================
// FITAI — ALL PREFERENCE BUTTONS
// ========================================

document.addEventListener("click", function (event) {

  const button = event.target.closest(
    ".choice, .chip, .preference-option, [data-choice]"
  );

  if (!button) return;

  // Sirf preference area ke buttons ko handle karo
  const group = button.closest(
    ".choice-group, .choice-grid, .preferences-grid, .panel"
  );

  if (!group) return;

  // Buttons belonging to the same group
  const buttons = group.querySelectorAll(
    ".choice, .chip, .preference-option, [data-choice]"
  );

  // Multiple selection allowed?
  const multiple =
    group.classList.contains("multi") ||
    group.dataset.multiple === "true" ||
    group.dataset.select === "multiple";

  // Single selection
  if (!multiple) {
    buttons.forEach((item) => {
      item.classList.remove("active");
    });
  }

  // Toggle selected button
  button.classList.toggle("active");

  console.log(
    "FITAI selected:",
    button.textContent.trim()
  );

});
