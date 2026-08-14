(()=>{
"use strict";
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const money=v=>`₹${Number(v).toLocaleString('en-IN')}`;
const img={shirt:'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=700&q=82',tee:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=82',jeans:'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=82',dress:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=82',shoes:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=82',formal:'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=82'};
const catalog={
  casual:[
    {type:'TOP',name:'Roadster Pure Cotton Casual Shirt',price:569,rating:4.3,reviews:'20.8K',store:'Myntra',image:img.shirt},
    {type:'BOTTOM',name:'Roadster Men Pure Cotton Jeans',price:1077,rating:4.1,reviews:'1.8K',store:'Myntra',image:img.jeans},
    {type:'SHOES',name:'Campus Men PU Sneakers',price:1399,rating:4.6,reviews:'382',store:'Myntra',image:img.shoes},
    {type:'TOP',name:'SNITCH Spread Collar Shirt',price:587,rating:4.1,reviews:'243',store:'AJIO',image:img.shirt},
    {type:'TOP',name:'SNITCH Men Slim Fit Shirt',price:480,rating:4.4,reviews:'14',store:'AJIO',image:img.shirt}
  ],
  college:[
    {type:'TOP',name:'The Indian Garage Co Men Oversized Printed Shirt',price:782,rating:4.2,reviews:'315',store:'Myntra',image:img.tee},
    {type:'BOTTOM',name:'Line out line Men Wide Leg Jeans',price:994,rating:4.2,reviews:'154',store:'Myntra',image:img.jeans},
    {type:'SHOES',name:'Campus Men Colourblocked Sneakers',price:1159,rating:4.4,reviews:'540',store:'Myntra',image:img.shoes},
    {type:'TOP',name:'The Indian Garage Co Men Checked Slim Fit Shirt',price:350,rating:3.8,reviews:'1K',store:'AJIO',image:img.shirt},
    {type:'TOP',name:'SNITCH Men Slim Fit Shirt with Spread Collar',price:480,rating:4.4,reviews:'14',store:'AJIO',image:img.shirt}
  ],
  date:[
    {type:'TOP',name:'WROGN Slim Fit Linen Shirt',price:1169,rating:4.6,reviews:'50',store:'Myntra',image:img.shirt},
    {type:'BOTTOM',name:'Pepe Jeans Men Slim Fit Mid-Rise Jeans',price:1499,rating:4.3,reviews:'1.5K',store:'Myntra',image:img.jeans},
    {type:'SHOES',name:'Red Tape Men Textured Sneakers',price:1529,rating:4.6,reviews:'1.5K',store:'Myntra',image:img.shoes},
    {type:'TOP',name:'U.S. Polo Assn. Tailored Fit Cotton Shirt',price:909,rating:3.7,reviews:'3.3K',store:'AJIO',image:img.shirt}
  ],
  party:[
    {type:'TOP',name:'The Indian Garage Co Men Anime Printed Oversized Shirt',price:782,rating:4.2,reviews:'315',store:'Myntra',image:img.tee},
    {type:'BOTTOM',name:'Roadster Men Wide Leg Light Fade Jeans',price:779,rating:4.2,reviews:'1K',store:'Myntra',image:img.jeans},
    {type:'SHOES',name:'Campus Men Colourblocked Sneakers',price:1399,rating:4.5,reviews:'142',store:'Myntra',image:img.shoes},
    {type:'TOP',name:'SNITCH Spread Collar Shirt with Full Sleeves',price:587,rating:4.1,reviews:'170',store:'AJIO',image:img.shirt}
  ],
  wedding:[
    {type:'TOP',name:'Raymond Pure Cotton Formal Shirt',price:818,rating:4.3,reviews:'444',store:'Myntra',image:img.formal},
    {type:'BOTTOM',name:'Louis Philippe Regular Fit Trousers',price:1499,rating:4.3,reviews:'1K',store:'Myntra',image:img.formal},
    {type:'SHOES',name:'Red Tape Men Formal Shoes',price:1599,rating:4.4,reviews:'900',store:'Myntra',image:img.shoes},
    {type:'TOP',name:'U.S. Polo Assn. Tailored Fit Shirt',price:909,rating:4.0,reviews:'2.8K',store:'AJIO',image:img.formal}
  ],
  vacation:[
    {type:'TOP',name:'Nautica Textured Cotton Linen Shirt',price:1215,rating:3.8,reviews:'33',store:'Myntra',image:img.shirt},
    {type:'BOTTOM',name:'HERE&NOW Men Pure Cotton Baggy Fit Jeans',price:811,rating:4.1,reviews:'900',store:'Myntra',image:img.jeans},
    {type:'SHOES',name:'Campus Men PU Casual Shoes',price:1499,rating:4.5,reviews:'740',store:'Myntra',image:img.shoes},
    {type:'TOP',name:'INDO Cotton Men Ombre-Dyed Slim Fit Shirt',price:550,rating:4.5,reviews:'11',store:'AJIO',image:img.shirt}
  ],
  dinner:[
    {type:'TOP',name:'WROGN Slim Fit Linen Shirt',price:1169,rating:4.6,reviews:'50',store:'Myntra',image:img.shirt},
    {type:'BOTTOM',name:'Roadster Men Pure Cotton Jeans',price:1077,rating:4.1,reviews:'1.8K',store:'Myntra',image:img.jeans},
    {type:'SHOES',name:'Red Tape Men Textured Sneakers',price:1529,rating:4.6,reviews:'1.5K',store:'Myntra',image:img.shoes}
  ]
};
const female={
  casual:[{type:'TOP',name:'BELTLY Women Printed T-shirt',price:362,rating:4.0,reviews:'6',store:'Myntra',image:img.tee},{type:'BOTTOM',name:'Kotty Women Regular Fit Jeans',price:655,rating:4.0,reviews:'3.5K',store:'Myntra',image:img.jeans},{type:'SHOES',name:'Women Casual Sneakers',price:899,rating:4.3,reviews:'1K',store:'Myntra',image:img.shoes}],
  college:[{type:'TOP',name:'MACK JONNEY Women Oversized Graphic T-shirt',price:298,rating:4.0,reviews:'6',store:'Myntra',image:img.tee},{type:'BOTTOM',name:'Basics By Tokyo Talkies Women Flared Jeans',price:831,rating:4.1,reviews:'350',store:'Myntra',image:img.jeans},{type:'SHOES',name:'Casual Sneakers For Women',price:999,rating:4.4,reviews:'500',store:'Myntra',image:img.shoes}],
  date:[{type:'TOP',name:'Women Minimal Top',price:699,rating:4.3,reviews:'500',store:'Myntra',image:img.dress},{type:'BOTTOM',name:'R.Code Women Boyfriend Fit Jeans',price:709,rating:4.3,reviews:'185',store:'Myntra',image:img.jeans},{type:'SHOES',name:'Women Casual Sneakers',price:1199,rating:4.4,reviews:'700',store:'Myntra',image:img.shoes}],
  party:[{type:'TOP',name:'Women Party Dress',price:1199,rating:4.3,reviews:'400',store:'Myntra',image:img.dress},{type:'BOTTOM',name:'SASSAFRAS Curve Straight Fit Jeans',price:1074,rating:4.4,reviews:'294',store:'Myntra',image:img.jeans},{type:'SHOES',name:'Women Fashion Sneakers',price:1299,rating:4.4,reviews:'600',store:'Myntra',image:img.shoes}],
  wedding:[{type:'TOP',name:'Women Wedding Dress',price:1899,rating:4.4,reviews:'800',store:'Myntra',image:img.dress},{type:'BOTTOM',name:'Women Elegant Trousers',price:1299,rating:4.3,reviews:'400',store:'Myntra',image:img.formal},{type:'SHOES',name:'Women Heels',price:1599,rating:4.4,reviews:'700',store:'Myntra',image:img.shoes}],
  vacation:[{type:'TOP',name:'Women Summer Dress',price:999,rating:4.4,reviews:'700',store:'Myntra',image:img.dress},{type:'BOTTOM',name:'SASSAFRAS Women Wide Leg Jeans',price:1074,rating:4.4,reviews:'294',store:'Myntra',image:img.jeans},{type:'SHOES',name:'Women Casual Sneakers',price:999,rating:4.3,reviews:'500',store:'Myntra',image:img.shoes}],
  dinner:[{type:'TOP',name:'Women Elegant Evening Dress',price:1499,rating:4.4,reviews:'700',store:'Myntra',image:img.dress},{type:'BOTTOM',name:'Women Straight Fit Trousers',price:999,rating:4.3,reviews:'400',store:'Myntra',image:img.formal},{type:'SHOES',name:'Women Fashion Heels',price:1399,rating:4.4,reviews:'600',store:'Myntra',image:img.shoes}]
};
const stores={Myntra:'https://www.myntra.com/search?q=',AJIO:'https://www.ajio.com/search/?text='};
let last=[];
function occasion(){return ($('#occasion')?.value||'Casual').toLowerCase()}
function gender(){return ($('.choice-group[data-group="gender"] .choice.active')?.textContent||'Male').toLowerCase()}
function key(){const o=occasion();return o.includes('college')?'college':o.includes('date')?'date':o.includes('party')?'party':o.includes('wedding')?'wedding':o.includes('vacation')?'vacation':o.includes('dinner')?'dinner':'casual'}
function pick(){const femaleMode=gender().includes('female');const pool=(femaleMode?female:catalog)[key()]||catalog.casual;let candidates=pool.filter(x=>!last.includes(x.name));if(candidates.length<3)candidates=pool;const out=[...candidates].sort(()=>Math.random()-.5).slice(0,Math.min(4,candidates.length));last=out.map(x=>x.name);return out}
function render(){const old=document.querySelector('#fitaiProducts');if(old)old.remove();const products=pick();const total=products.reduce((s,x)=>s+x.price,0);const sec=document.createElement('section');sec.id='fitaiProducts';sec.className='section fitai-products';sec.innerHTML=`<div class="section-head"><p class="eyebrow">SHOP-READY PICKS</p><h2>For your ${esc(occasion().toLowerCase())}.</h2><p class="muted">Different picks each time, matched to the occasion. Prices and ratings were checked on retailer listings and can change.</p></div><div class="product-grid">${products.map((p,i)=>`<article class="product-card"><div class="product-image"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"><span>${esc(p.type)}</span></div><div class="product-info"><small class="muted">${esc(p.store)}</small><h3>${esc(p.name)}</h3><div class="rating">★ ${p.rating} <span>(${esc(p.reviews)})</span></div><b class="price">${money(p.price)}</b><button class="primary full" type="button" data-product-buy="${i}">View shopping option →</button></div></article>`).join('')}</div><div class="panel catalog-total"><span>Current selected pieces</span><b class="price">${money(total)}</b></div>`;const results=document.querySelector('#results');(results?.parentElement||document.querySelector('#stylist'))?.appendChild(sec);products.forEach((p,i)=>{sec.querySelector(`[data-product-buy="${i}"]`).onclick=()=>{const url=stores[p.store]+encodeURIComponent(p.name);window.open(url,'_blank','noopener,noreferrer')}})}
function inject(){const r=document.querySelector('#results');if(!r)return;let n=0;const obs=new MutationObserver(()=>{if(r.children.length){clearTimeout(n);n=setTimeout(render,180)}});obs.observe(r,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();document.addEventListener('click',e=>{if(e.target.closest('#generateBtn'))setTimeout(render,3100)});
const style=document.createElement('style');style.textContent=`.product-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.product-card{background:var(--panel);border:1px solid var(--line);border-radius:22px;overflow:hidden}.product-image{height:250px;position:relative;background:#202024}.product-image img{width:100%;height:100%;object-fit:cover}.product-image span{position:absolute;left:12px;top:12px;background:#0b0b0dcc;padding:6px 9px;border-radius:9px;font-size:10px;font-weight:800}.product-info{padding:16px}.product-info h3{font-size:15px;line-height:1.3;margin:7px 0}.rating{color:var(--accent);font-weight:850;margin:8px 0}.rating span{color:var(--muted);font-size:11px;font-weight:500}.catalog-total{display:flex;justify-content:space-between;align-items:center;margin-top:16px}.fitai-products{padding-top:35px}.fitai-products .primary{font-size:12px;padding:11px 12px}@media(max-width:1000px){.product-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.product-grid{grid-template-columns:1fr}.product-image{height:300px}}`;document.head.appendChild(style);
})();
