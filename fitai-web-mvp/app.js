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
  if(!email){alert("Enter an email for the demo.");return}
  $("#loginBtn").textContent=email.split("@")[0];
  $("#loginDialog").close();
});
