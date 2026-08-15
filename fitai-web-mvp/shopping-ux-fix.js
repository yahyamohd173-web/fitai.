(()=>{
'use strict';
function enhance(){
 const modal=document.querySelector('#productQuickView');
 if(!modal||modal.dataset.fixed==='1')return;
 modal.dataset.fixed='1';
 const link=modal.querySelector('.modal-shop');
 if(!link)return;
 const wrap=link.parentElement;
 link.removeAttribute('target');
 link.removeAttribute('href');
 link.textContent='Keep shopping in FITAI';
 link.classList.add('internal-shop');
 const note=document.createElement('p');
 note.className='muted tiny shopping-note';
 note.textContent='You will