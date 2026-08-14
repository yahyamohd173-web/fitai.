(()=>{
  "use strict";
  const base={
    Streetwear:"https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=700&q=85",
    Minimal:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85",
    "Old Money":"https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=85",
    Y2K:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
    Vintage:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=85",
    Korean:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85",
    Grunge:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85",
    "Smart Casual":"https://images.unsplash.com/photo-1506629905607-d9c297d8a7b1?auto=format&fit=crop&w=700&q=85",
    Athleisure:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=700&q=85",
    Preppy:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=85"
  };
  const female={
    Streetwear:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85",
    Minimal:"https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=85",
    "Old Money":"https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=700&q=85",
    Y2K:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
    Vintage:"https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=85",
    Korean:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85",
    Grunge:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
    "Smart Casual":"https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=85",
    Athleisure:"https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=85",
    Preppy:"https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=85"
  };
  const neutral={
    Streetwear:"https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=700&q=85",
    Minimal:"https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=85",
    "Old Money":"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85",
    Y2K:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=85",
    Vintage:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=85",
    Korean:"https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=85",
    Grunge:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85",
    "Smart Casual":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=85",
    Athleisure:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=700&q=85",
    Preppy:"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=700&q=85"
  };
  function gender(){const a=document.querySelector('.choice-group[data-group="gender"] .choice.active');return (a?.textContent||'').trim().toLowerCase()}
  function images(){const g=gender();return g.includes('female')||g.includes('woman')||g.includes('girl')?female:g.includes('other')||g.includes('non')||g.includes('unisex')?neutral:base}
  function apply(){
    const map=images();
    document.querySelectorAll('.choice-photo').forEach(img=>{const name=(img.alt||'').replace(/ fashion example$/,'');if(map[name])img.src=map[name]});
    document.querySelectorAll('.trend-photo').forEach(img=>{const name=(img.alt||'').replace(/ fashion example$/,'');if(map[name])img.src=map[name]});
  }
  document.addEventListener('click',e=>{if(e.target.closest('.choice-group[data-group="gender"] .choice'))setTimeout(apply,0)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  const style=document.createElement('style');style.textContent=`
    .visual-choice{display:inline-flex!important;align-items:center;gap:9px;padding:6px 12px 6px 6px!important;overflow:hidden}
    .choice-photo{width:38px;height:38px;object-fit:cover;border-radius:50%;flex:0 0 38px;background:#242428;display:block}
    .visual-choice:hover .choice-photo{transform:scale(1.05)}
    .trend-img{position:relative;overflow:hidden;padding:0!important}
    .trend-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.9);transition:transform .35s ease,filter .35s ease}
    .trend-img:hover .trend-photo{transform:scale(1.04);filter:saturate(1.08)}
    .trend-img>span{position:relative;z-index:2;margin:20px;padding:9px 12px;border-radius:10px;background:#0b0b0ccc;color:#fff;backdrop-filter:blur(8px);font-size:22px;letter-spacing:-.5px}
    .trend-grid article{overflow:hidden;border-radius:var(--radius);border:1px solid var(--line);background:var(--panel)}
    .trend-grid article>h3,.trend-grid article>p{padding-left:20px;padding-right:20px}.trend-grid article>p{padding-bottom:18px}
    @media(max-width:800px){.choice-photo{width:34px;height:34px;flex-basis:34px}.trend-img{height:260px}}
  `;document.head.appendChild(style);
})();
