const phase=JSON.parse(document.getElementById('phase-data').textContent);
for(const el of document.querySelectorAll('[data-stat]'))el.textContent=Number(phase.stats[el.dataset.stat]).toLocaleString('en-US');
for(const el of document.querySelectorAll('[data-date]'))el.textContent=phase.as_of;
const guideDialog=document.getElementById('guide-dialog');
document.getElementById('open-guide').addEventListener('click',()=>guideDialog.showModal());
document.getElementById('close-guide').addEventListener('click',()=>guideDialog.close());
guideDialog.addEventListener('click',e=>{if(e.target===guideDialog)guideDialog.close();});
