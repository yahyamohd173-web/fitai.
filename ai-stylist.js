(() => {
  "use strict";

  const STORAGE = "fitai_saved_v2";
  const $ = (selector, root = document) => root?.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root?.querySelectorAll(selector) || []);
  const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const parseJSON = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };

  let requestId = 0;
  let activeController = null;
  let currentLooks = [];

  const FALLBACK = [
    {name:"Midnight Street",emoji:"🖤",style:"Streetwear",items:"Oversized black tee · Baggy cargos · White sneakers",price:2499,reasons:["relaxed silhouette","easy everyday styling"]},
    {name:"Clean Signal",emoji:"🤍",style:"Minimal",items:"Cream shirt · Straight trousers · Minimal sneakers",price:2199,reasons:["clean proportions","easy to dress up"]},
    {name:"City Y2K",emoji:"🕶️",style:"Y2K",items:"Graphic tee · Wide jeans · Retro sneakers",price:2899,reasons:["wide-leg silhouette","Gen-Z street styling"]}
  ];

  function collectPreferences() {
    const group = name => $(`.choice-group[data-group="${name}"]`);
    const one = name => {
      const g = group(name); if (!g) return "";
      const active = $(".choice.active", g); return active ? active.textContent.trim() : "";
    };
    const many = name => {
      const g = group(name); return g ? $$(".choice.active", g).map(x => x.textContent.trim()) : [];
    };
    const budgetButton = $(".choice-group[data-group=\"budget\"] .choice.active");
    return {
      gender: one("gender"),
      styles: many("styles"),
      colors: many("colors"),
      occasions: many("occasions"),
      fit: one("fit"),
      budget: Number(budgetButton?.dataset.value || $("#budget")?.value || 3000),
      quickStyle: $("#style")?.value || "Streetwear",
      quickOccasion: $("#occasion")?.value || "Casual"
    };
  }

  function localFallback(preferences) {
    const style = preferences.styles?.[0] || preferences.quickStyle || "Streetwear";
    const budget = Number(preferences.budget || 3000);
    const color = preferences.colors?.[0] || "Black";
    const fit = preferences.fit || "Relaxed";
    const occasion = preferences.occasions?.[0] || preferences.quickOccasion || "Casual";
    const templates = [
      {name:`${style} Essential`,emoji:"🖤",top:`${color} ${fit.toLowerCase()}-fit cotton shirt`,bottom:"Straight-fit black trousers",shoe:"Minimal white sneakers",price:2500},
      {name:`${style} Clean Fit`,emoji:"🤍",top:"Cream oversized textured shirt",bottom:"Dark straight-fit jeans",shoe:"Black low-top sneakers",price:2600},
      {name:`${style} Statement`,emoji:"🕶️",top:"Oversized graphic tee",bottom:"Wide-leg cargo pants",shoe:"Retro chunky sneakers",price:2700}
    ];
    return templates.map((x,i) => ({
      ...x, style, tag: style, occasion, match: 92-i,
      items: `${x.top} · ${x.bottom} · ${x.shoe}`,
      price: Math.min(x.price, budget),
      reasons: [`${fit} fit`, `${occasion} ready`, budget >= x.price ? "within budget" : "budget-adjusted"]
    }));
  }

  function normalizeLooks(looks, preferences) {
    if (!Array.isArray(looks) || !looks.length) return null;
    const budget = Number(preferences.budget || 3000);
    return looks.slice(0,3).map((look,i) => {
      const shirt = look.shirt?.name || "";
      const pant = look.pant?.name || "";
      const shoes = look.shoes?.name || "";
      const items = [shirt,pant,shoes].filter(Boolean).join(" · ") || String(look.items || "");
      const calculated = Number(look.shirt?.price||0)+Number(look.pant?.price||0)+Number(look.shoes?.price||0);
      return {
        name: String(look.name || `FITAI Look ${i+1}`).slice(0,80),
        emoji: String(look.emoji || ["🖤","🤍","🕶️"][i]),
        match: Math.max(70,Math.min(99,Number(look.match)||90)),
        style: String(look.style || preferences.styles?.[0] || preferences.quickStyle || "Personalized"),
        tag: String(look.style || preferences.styles?.[0] || preferences.quickStyle || "Personalized"),
        occasion: String(look.occasion || preferences.occasions?.[0] || preferences.quickOccasion || "Casual"),
        fit: String(look.fit || preferences.fit || "Relaxed"),
        items,
        price: Math.min(budget, Number(look.total_price)||calculated||budget),
        reasons: [String(look.reason || "Matched to your preferences.")],
        shirt: look.shirt || null,
        pant: look.pant || null,
        shoes: look.shoes || null
      };
    });
  }

  function setStatus(message) {
    const status = $("#status"); if (status) status.textContent = message;
  }

  function renderLooks(looks) {
    const results = $("#results"); if (!results) return;
    currentLooks = looks;
    results.innerHTML = looks.map((look,index) => `
      <article class="outfit">
        <div class="outfit-visual" aria-hidden="true">${escapeHTML(look.emoji || "✨")}</div>
        <div class="outfit-body">
          <small class="muted">AI MATCH · ${Number(look.match)||90}% · ${escapeHTML(look.tag || "Personalized")}</small>
          <h3>${escapeHTML(look.name)}</h3>
          <div class="item-list">
            <p><b>TOP</b><br>${escapeHTML(look.shirt?.name || String(look.items||"").split(" · ")[0] || "Selected top")}</p>
            <p><b>BOTTOM</b><br>${escapeHTML(look.pant?.name || String(look.items||"").split(" · ")[1] || "Selected bottom")}</p>
            <p><b>SHOES</b><br>${escapeHTML(look.shoes?.name || String(look.items||"").split(" · ")[2] || "Selected shoes")}</p>
          </div>
          <p class="muted tiny">${escapeHTML((look.reasons || []).join(" · "))}</p>
          <div class="price">${money(look.price)}</div>
          <div class="actions">
            <button type="button" data-ai-save="${index}">♡ Save</button>
            <button type="button" data-ai-remix="${index}">↻ Remix</button>
            <button type="button" data-ai-shop="${index}">Shop →</button>
          </div>
        </div>
      </article>`).join("");
    bindActions(looks);
  }

  function marketplaceURL(platform, query) {
    const q = encodeURIComponent(`${query} India`);
    return platform === "amazon" ? `https://www.amazon.in/s?k=${q}` : `https://www.flipkart.com/search?q=${q}`;
  }

  function openShop(look) {
    let modal = $("#aiShopModal");
    if (!modal) {
      modal = document.createElement("div"); modal.id = "aiShopModal";
      modal.innerHTML = `<div class="ai-shop-dialog"><button type="button" class="ai-shop-close" aria-label="Close">×</button><div id="aiShopContent"></div></div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click", e => { if (e.target === modal || e.target.closest(".ai-shop-close")) modal.classList.remove("open"); });
    }
    const items = [look.shirt?.name,look.pant?.name,look.shoes?.name].filter(Boolean);
    if (!items.length) items.push(...String(look.items||"").split(" · ").filter(Boolean));
    $("#aiShopContent",modal).innerHTML = `
      <p class="eyebrow">SHOP THIS AI LOOK</p><h2>${escapeHTML(look.name)}</h2>
      <p class="muted">One top, one bottom and one pair of shoes — no clutter.</p>
      <div class="ai-shop-items">${items.map(item => `<div class="ai-shop-item"><b>${escapeHTML(item)}</b><div class="ai-shop-links"><a href="${marketplaceURL("amazon",item)}" target="_blank" rel="noopener noreferrer">Amazon ↗</a><a href="${marketplaceURL("flipkart",item)}" target="_blank" rel="noopener noreferrer">Flipkart ↗</a></div></div>`).join("")}</div>
      <p class="muted tiny">FITAI opens live marketplace searches. Prices and availability are controlled by the marketplace.</p>`;
    modal.classList.add("open");
  }

  function renderSaved() {
    const list = $("#savedList"); const clear = $("#clearSaved"); if (!list) return;
    const saved = parseJSON(localStorage.getItem(STORAGE),[]);
    if (!saved.length) { list.innerHTML=`<p class="muted">No saved outfits yet. Generate a look and tap Save.</p>`; clear?.classList.add("hidden"); return; }
    clear?.classList.remove("hidden");
    list.innerHTML = saved.slice().reverse().map((item,index)=>`<article class="panel saved-card"><div><b>${escapeHTML(item.name)}</b><p class="muted">${escapeHTML(item.items)}</p><span class="price">${money(item.price)}</span></div><div class="actions"><button class="outline" type="button" data-ai-saved-shop="${index}">Shop →</button><button class="outline" type="button" data-ai-remove="${index}">Remove</button></div></article>`).join("");
    $$('[data-ai-remove]',list).forEach(b=>b.addEventListener("click",()=>{const i=Number(b.dataset.aiRemove);const next=saved.slice().reverse().filter((_,n)=>n!==i).reverse();localStorage.setItem(STORAGE,JSON.stringify(next));renderSaved();}));
    $$('[data-ai-saved-shop]',list).forEach(b=>b.addEventListener("click",()=>{const item=saved.slice().reverse()[Number(b.dataset.aiSavedShop)];if(item)openShop(item);}));
  }

  function bindActions(looks) {
    const results=$("#results");
    $$('[data-ai-save]',results).forEach(b=>b.addEventListener("click",()=>{const look=looks[Number(b.dataset.aiSave)];if(!look)return;const saved=parseJSON(localStorage.getItem(STORAGE),[]);if(!saved.some(x=>x.name===look.name)){saved.push(look);localStorage.setItem(STORAGE,JSON.stringify(saved.slice(-12)));}b.textContent="✓ Saved";renderSaved();}));
    $$('[data-ai-shop]',results).forEach(b=>b.addEventListener("click",()=>{const look=looks[Number(b.dataset.aiShop)];if(look)openShop(look);}));
    $$('[data-ai-remix]',results).forEach(b=>b.addEventListener("click",async()=>{b.disabled=true;b.textContent="Remixing…";const p=collectPreferences();const result=await requestAI(p,"Create a fresh alternative combination. Keep the same preferences and budget.");b.disabled=false;b.textContent="↻ Remix";if(result.ok){renderLooks(result.looks);setStatus("↻ Fresh AI look ready.");}else setStatus(`⚠ ${result.error}`);}));
  }

  async function imageAsDataURL() {
    const file=$("#photoInput")?.files?.[0];
    if(!file || !file.type.startsWith("image/")) return "";
    if(file.size > 8*1024*1024) return "";
    return new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>{const value=String(reader.result||"");resolve(value.length<=1800000?value:"");};reader.onerror=()=>resolve("");reader.readAsDataURL(file);});
  }

  async function requestAI(preferences, extraInstruction="") {
    const id=++requestId;
    if(activeController) activeController.abort();
    activeController=new AbortController();
    const timeout=setTimeout(()=>activeController?.abort(),6000);
    try {
      const photoDataUrl=await imageAsDataURL();
      const response=await fetch("/api/stylist",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({preferences,photoDataUrl,extraInstruction}),signal:activeController.signal,cache:"no-store"});
      const data=await response.json().catch(()=>({}));
      if(id!==requestId) return {ok:false,error:"A newer styling request is already running."};
      if(!response.ok) throw new Error(data.error||`Server error ${response.status}`);
      const looks=normalizeLooks(data.looks,preferences);
      if(!looks) throw new Error("The stylist returned an invalid outfit.");
      return {ok:true,looks,source:data.source||"ai"};
    } catch(error) {
      console.warn("FITAI request fallback:",error);
      // Never leave the user waiting: a local recommendation is always available.
      return {ok:true,looks:localFallback(preferences),source:"instant-fallback"};
    } finally {
      clearTimeout(timeout);
      if(id===requestId) activeController=null;
    }
  }

  function interceptGenerate(event) {
    const button=event.target.closest?.("#generateBtn"); if(!button)return;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
    const results=$("#results"); const preferences=collectPreferences();
    button.disabled=true; button.textContent="✦ Styling…";
    setStatus("✦ FITAI is styling you…");
    results?.scrollIntoView({behavior:"smooth",block:"start"});
    if(results) results.innerHTML=`<div class="panel"><b>FITAI is styling you…</b><p class="muted">Matching your style, fit, occasion and budget.</p></div>`;
    requestAI(preferences).then(result=>{renderLooks(result.looks);setStatus(result.source==="instant-fallback"?`✦ ${result.looks.length} instant personalized looks ready.`:`✦ ${result.looks.length} AI-personalized looks ready.`);$(".steps span[data-step=\"4\"]")?.classList.add("active");}).finally(()=>{button.disabled=false;button.textContent="✦ Style me with AI";});
  }

  document.addEventListener("click",interceptGenerate,true);
  $("#clearSaved")?.addEventListener("click",()=>{localStorage.removeItem(STORAGE);renderSaved();});
  renderSaved();

  const style=document.createElement("style");
  style.textContent=`
    .item-list{display:grid;gap:8px;margin:14px 0}.item-list p{margin:0;padding:10px 12px;border:1px solid #2b2b30;border-radius:12px;background:#101012}.item-list b{font-size:10px;letter-spacing:1.5px;color:#d9ff5a}
    #aiShopModal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.82);backdrop-filter:blur(10px)}#aiShopModal.open{display:flex}.ai-shop-dialog{width:min(820px,96vw);max-height:90vh;overflow:auto;background:#141416;color:#f4f4f0;border:1px solid #2b2b30;border-radius:24px;padding:28px;box-shadow:0 25px 80px #000a;position:relative}.ai-shop-close{position:absolute;right:14px;top:8px;border:0;background:transparent;color:#aaa;font-size:30px;cursor:pointer}.ai-shop-dialog h2{font-size:40px;letter-spacing:-2px;margin:5px 0 10px}.ai-shop-items{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}.ai-shop-item{background:#1a1a1d;border:1px solid #2b2b30;border-radius:18px;padding:18px;min-height:150px;display:flex;flex-direction:column;justify-content:space-between}.ai-shop-links{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}.ai-shop-links a{padding:10px;text-align:center;border-radius:10px;background:#0f0f11;border:1px solid #2b2b30;color:#f4f4f0;font-size:12px;font-weight:800}.ai-shop-links a:hover{border-color:#d9ff5a;color:#d9ff5a}@media(max-width:700px){.ai-shop-items{grid-template-columns:1fr}.ai-shop-dialog{padding:20px}.ai-shop-dialog h2{font-size:32px}}
  `;
  document.head.appendChild(style);
})();
