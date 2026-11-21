const dialog=document.querySelector('#image-dialog'),image=document.querySelector('#dialog-image'),title=document.querySelector('#image-title'),download=document.querySelector('#download-image');
let opener;
document.querySelectorAll('[data-image]').forEach(link=>link.addEventListener('click',event=>{
  if(typeof dialog.showModal!=='function')return;
  event.preventDefault();opener=link;image.src=link.href;image.alt=link.querySelector('img')?.alt??'';title.textContent=link.dataset.title;download.href=link.href;dialog.showModal();
}));
document.querySelector('#close-image').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>opener?.focus());
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();});
