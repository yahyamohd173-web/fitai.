(()=>{
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const picks=[
    {type:"TOP",name:"Snitch Men Boxy Fit Solid Curved Collar Casual Shirt",rating:4.5,reviews:8,price:628,url:"https://www.flipkart.com/snitch-men-self-design-casual-black-shirt/p/itm014028ebde384"},
    {type:"TOP",name:"Blackberrys Men Printed Formal Black Shirt",rating:4.6,reviews:11,price:1319,url:"https://www.flipkart.com/mens-shirts/blackberrys~brand/pr?droppedD2%5B%5D=be1a1120-a82f-4344-9ccb-43c363df9199%2C14de50aa-5e25-4921-8e33-8988f199b9c2&sid=clo%2Cash%2Caxc%2Cmmk"},
    {type:"BOTTOM",name:"U.S. Polo Assn. Denim Co. Straight Fit Men Blue Jeans",rating:4.5,reviews:19,price:1439,url:"https://www.flipkart.com/clothing-and-accessories/bottomwear/jeans/men-jeans/pr?sid=clo%2Cvua%2Ck58%2Ci51"},
    {type:"SHOES",name:"Bond Street By Red Tape Men's Casual Sneakers",rating:4.5,reviews:172,price:854,url:"https://www.flipkart.com/all/footwear/bond-street-by-red-tape~brand/pr?sid=all%2Cosp"},
    {type:"SHOES",name:"Asics GEL-ZARACA 5 B Sneakers For Men",rating:4.5,reviews:391,price:2863,url:"https://www.flipkart.com/q/asics-gel-zaraca"}
  ];
  function render(){const results=$("#results");if(!results||!results.parentElement)return;let box=$("#highRatedPicks");if(!box){box=document.createElement("section");box.id="highRatedPicks";box.className="section";results.parentElement.appendChild(box)}box.innerHTML=`<div class="section-head"><p class="eyebrow">TRUSTED PICKS</p><h2>Highly rated pieces.</h2><p class="muted">FITAI prioritizes pieces with strong customer ratings. Ratings shown below were checked on retailer pages; prices and availability can change.</p></div><div class="high-rated-grid">${picks.map(p=>`<article class="panel high-rated-card"><small class="muted">${p.type}</small><h3>${p.name}</h3><div class="rating">★ ${p.rating.toFixed(1)} <span>(${p.reviews} ratings)</span></div><b class="price">₹${p.price.toLocaleString("en-IN")}</b><a class="primary full" target="_blank" rel="noopener noreferrer" href="${p.url}">View product →</a></article>`).join("")}</div>`}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
  new MutationObserver(()=>render()).observe(document.body,{childList:true,subtree:true});
  const s=document.createElement("style");s.textContent=`#highRatedPicks{padding-top:25px}.high-rated-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.high-rated-card h3{margin:8px 0 10px}.high-rated-card .rating{font-weight:850;color:#d9ff5a;margin-bottom:8px}.high-rated-card .rating span{font-weight:500;color:#a5a5aa;font-size:12px}.high-rated-card .full{display:block;text-align:center;margin-top:14px}@media(max-width:800px){.high-rated-grid{grid-template-columns:1fr}}`;document.head.appendChild(s);
})();
