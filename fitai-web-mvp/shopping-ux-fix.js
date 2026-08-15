(()=>{
'use strict';
function enhance(){
 const modal=document.querySelector('#productQuickView');
 if(!modal||modal.dataset.fixed==='1')return;
 modal.dataset.fixed='1';
 const link=modal.querySelector('.modal-shop');
 if(!link)return;
 const original=link.href;
 link.removeAttribute('target');
 link.removeAttribute('href');
 link.textContent='Keep shopping in FITAI';
 link.classList.add('internal-shop');
 const note=document.createElement('p');
 note.className='muted tiny shopping-note';
 note.textContent='Product details, selected piece and price are shown here. Retailer checkout is optional and opens separately.';
 link.parentElement.appendChild(note);
 const external=document.createElement('a');
 external.className='outline modal-retailer';
 external.href=original;
 external.target='_blank';
 external.rel='noopener noreferrer';
 external.textContent='Search this piece on retailer ↗';
 link.parentElement.appendChild(external);
 link.onclick=()=>modal.remove();
}
const obs=new MutationObserver(enhance);
if(document.body)obs.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
const css=document.createElement('style');
css.textContent='.product-modal .modal-shop{display:flex;align-items:center;justify-content:center;text-decoration:none}.product-modal .modal-retailer{display:flex;align-items:center;justify-content:center;text-decoration:none;margin-top:9px}.shopping-note{margin-top:12px;font-size:11px}.product-modal .internal-shop{cursor:pointer}';
document.head.appendChild(css);
})();
