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

  // Find the closest preference group
  const group = button.closest(
    ".choice-group, .choice-grid, .preferences-grid, .panel"
  );

  if (!group) return;

  // Check if this group allows multiple selections
  const multiple =
    group.classList.contains("multi") ||
    group.dataset.multiple === "true" ||
    group.dataset.select === "multiple";

  // For single-select groups, remove active from only
  // buttons belonging to THIS group
  if (!multiple) {
    group
      .querySelectorAll(
        ":scope > .choice, :scope > .chip, :scope > .preference-option, :scope > [data-choice]"
      )
      .forEach((item) => {
        item.classList.remove("active");
      });
  }

  // Select clicked button
  button.classList.toggle("active");
});
