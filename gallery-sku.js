// Match the stable gallery image ID, independent of its position or filename.
const body = document.getElementById('tab-body');
const style = document.createElement('style');
style.textContent = `.gallery-sku-mark{position:absolute;right:7px;top:7px;display:flex;align-items:center;gap:3px;padding:4px 6px;border-radius:6px;background:#ffffffe6;color:#2c4741;box-shadow:0 1px 4px #0002;font:600 11px Tahoma,sans-serif;pointer-events:none}.gallery-sku-mark svg{width:13px;height:13px}.sku-dialog{width:min(1100px,96vw);max-width:96vw;padding:0;border:0;border-radius:14px;background:#faf6f1;box-shadow:0 15px 60px #0005}.sku-dialog::backdrop{background:#14120ebd}.sku-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 18px}.sku-dialog-head h2{font-size:17px;margin:0}.sku-dialog-head button{padding:8px 14px;cursor:pointer;background:white;border:1px solid #d8cebe;border-radius:8px;font:inherit}.sku-dialog iframe{display:block;width:100%;height:80vh;height:80dvh;border:0}.sku-dialog button:focus-visible{outline:3px solid #bf872c;outline-offset:2px}`;
document.head.append(style);
let mappings = new Map();
function openPhoto(photo) {
  if (document.querySelector('.sku-dialog')) return;
  const dialog = document.createElement('dialog'); dialog.className = 'sku-dialog';
  dialog.setAttribute('aria-labelledby', 'sku-dialog-title');
  dialog.innerHTML = '<div class="sku-dialog-head"><h2 id="sku-dialog-title">เลือกรหัสสินค้าในรูปนี้</h2><button type="button" autofocus>ปิด</button></div><iframe title="รูปสินค้าและปุ่มคัดลอกรหัส" allow="clipboard-write"></iframe>';
  const frame = dialog.querySelector('iframe');
  frame.src = `photos.html?${new URLSearchParams({photo:photo.id, embed:'1'})}`;
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  const onMessage = event => {
    if (event.origin === location.origin && event.source === frame.contentWindow && event.data === 'close-photo-codes') dialog.close();
  };
  const previousOverflow = document.body.style.overflow;
  dialog.addEventListener('close', () => { window.removeEventListener('message', onMessage); document.body.style.overflow = previousOverflow; dialog.remove(); });
  window.addEventListener('message', onMessage);
  document.body.append(dialog); dialog.showModal(); document.body.style.overflow = 'hidden';
}
function decorate() {
  for (const image of body.querySelectorAll('img[data-image-id]')) {
    const photo = mappings.get(image.dataset.imageId);
    if (!photo) continue;
    const tile = image.closest('.img-tile');
    if (tile.querySelector('.gallery-sku-mark')) continue;
    image.tabIndex = 0; image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `เลือกรหัส ${photo.title}`);
    image.style.cursor = 'pointer';
    image.title = `กดรูปเพื่อเลือกรหัสสินค้า (${photo.products.length})`;
    const mark = document.createElement('span'); mark.className = 'gallery-sku-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h8l10 10-8 8L3 11Z"/><circle cx="7.5" cy="7.5" r="1"/></svg>';
    mark.append(document.createTextNode(String(photo.products.length)));
    image.closest('.img-thumb-wrap').append(mark);
  }
}
function activate(event) {
  const image = event.target.closest('img[data-image-id]');
  if (!image || !body.contains(image)) return;
  if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
  const photo = mappings.get(image.dataset.imageId);
  if (!photo) return;
  event.preventDefault(); event.stopImmediatePropagation(); openPhoto(photo);
}
if (body) {
  body.addEventListener('click', activate, true);
  body.addEventListener('keydown', activate, true);
  try {
    const response = await fetch('photo-links.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('load');
    const data = await response.json();
    mappings = new Map(data.photos.filter(p => p.galleryImageId).map(p => [p.galleryImageId, p]));
    new MutationObserver(decorate).observe(body, {childList:true, subtree:true});
    decorate();
  } catch { /* The original image preview remains available if links cannot load. */ }
}
