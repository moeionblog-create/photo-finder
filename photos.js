const el = id => document.getElementById(id);
const pageOptions = new URLSearchParams(location.search);
document.documentElement.classList.toggle('embedded', pageOptions.get('embed') === '1');
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && pageOptions.get('embed') === '1' && parent !== window) parent.postMessage('close-photo-codes', location.origin);
});
const normalize = value => String(value).normalize('NFC').toLocaleLowerCase('th');
let photos = [], products = new Map(), noticeTimer;
function node(tag, text, className) {
  const result = document.createElement(tag);
  if (text) result.textContent = text;
  if (className) result.className = className;
  return result;
}
function notice(text) {
  clearTimeout(noticeTimer); el('notice').textContent = text;
  el('notice').classList.add('visible');
  noticeTimer = setTimeout(() => el('notice').classList.remove('visible'), 3000);
}
async function copy(input) {
  try {
    try { await navigator.clipboard.writeText(input.value); }
    catch {
      input.focus(); input.select(); input.setSelectionRange(0, input.value.length);
      if (!document.execCommand('copy')) throw new Error('copy');
    }
    notice(`คัดลอกแล้ว: ${input.value}`);
  } catch { input.focus(); input.select(); notice('กรุณาคัดลอกข้อความที่เลือกไว้'); }
}
function codeRow(link, id) {
  const product = products.get(link.code);
  const row = node('section', '', 'linked-code');
  const shortLabel = link.label.startsWith('เซต') ? 'เซต' : link.label;
  const title = node('h3', shortLabel);
  const input = node('input', '', 'code'); input.readOnly = true; input.spellcheck = false;
  input.id = id; input.value = link.code;
  input.setAttribute('aria-label', `รหัส${shortLabel}`);
  const button = node('button', 'คัดลอก', 'copy'); button.type = 'button';
  button.setAttribute('aria-label', `คัดลอกรหัส${shortLabel}`);
  button.addEventListener('click', () => copy(input));
  const copyRow = node('div', '', 'quick-copy'); copyRow.append(input, button);
  row.append(title, copyRow);
  if (product.variants.some(v => v.size)) {
    const sizes = node('div', '', 'size-buttons');
    sizes.setAttribute('role', 'group'); sizes.setAttribute('aria-label', `ไซส์${shortLabel} — กดเพื่อคัดลอก`);
    const options = [{text:'ไม่รวมไซส์', sku:link.code}, ...product.variants.map(v => ({text:v.size ? v.size.toUpperCase() : 'ไม่ระบุ', sku:v.sku}))];
    options.forEach((option, i) => {
      const sizeButton = node('button', option.text); sizeButton.type = 'button';
      sizeButton.setAttribute('aria-pressed', String(i === 0));
      sizeButton.setAttribute('aria-label', `${shortLabel} ${option.text} — คัดลอกรหัส`);
      sizeButton.addEventListener('click', () => {
        input.value = option.sku;
        for (const other of sizes.children) other.setAttribute('aria-pressed', String(other === sizeButton));
        copy(input);
      });
      sizes.append(sizeButton);
    });
    row.append(sizes);
  }
  return row;
}
function photoCard(photo) {
  const article = node('article', '', 'linked-photo'); article.id = photo.id;
  const figure = node('figure', '', 'linked-image'); const image = node('img');
  image.src = new URL(photo.file, location.href).href; image.alt = photo.title;
  image.width = 768; image.height = 1152;
  image.addEventListener('error', () => { image.hidden = true; figure.prepend(node('p', 'โหลดรูปไม่สำเร็จ กรุณาลองใหม่')); });
  figure.append(image, node('figcaption', `ชื่อไฟล์เดิม: ${photo.file}`));
  const info = node('div', '', 'linked-info'); const tags = node('div', '', 'photo-tags');
  for (const tag of photo.tags) {
    const button = node('button', tag, 'tag-chip'); button.type = 'button';
    button.addEventListener('click', () => { el('search').value = tag; render(); el('search').focus(); });
    tags.append(button);
  }
  const codes = node('div', '', 'linked-codes');
  photo.products.forEach((link, i) => codes.append(codeRow(link, `${photo.id}-${i}`)));
  info.append(node('h2', photo.title), tags, node('p', 'กดไซส์ = คัดลอกรหัสทันที', 'help'), codes);
  article.append(figure, info); return article;
}
function render() {
  const words = normalize(el('search').value).trim().split(/\s+/).filter(Boolean);
  const filtered = photos.filter(photo => {
    const text = normalize([photo.title, photo.file, ...photo.tags, ...photo.products.flatMap(p => [p.code, p.label, ...products.get(p.code).variants.map(v => v.sku)])].join(' '));
    return words.every(word => text.includes(word));
  });
  el('photos').replaceChildren(...filtered.map(photoCard));
  el('count').textContent = `${filtered.length} รูป · ${filtered.reduce((n, p) => n + p.products.length, 0)} รหัสแบบ / สีที่ผูกไว้`;
  el('empty').hidden = filtered.length !== 0;
}
async function load() {
  el('error').hidden = true; el('empty').hidden = true;
  try {
    const responses = await Promise.all(['photo-links.json', 'sku-catalog.json'].map(file => fetch(file, {cache:'no-cache'})));
    if (responses.some(r => !r.ok)) throw new Error('load');
    const [links, catalog] = await Promise.all(responses.map(r => r.json()));
    products = new Map(catalog.products.map(p => [p.code, p]));
    photos = links.photos.filter(photo => !pageOptions.has('photo') || photo.id === pageOptions.get('photo'));
    if (photos.some(p => p.products.some(link => !products.has(link.code)))) throw new Error('unknown code');
    render();
  } catch { el('photos').replaceChildren(); el('error').hidden = false; el('count').textContent = 'ยังโหลดข้อมูลไม่ได้'; }
}
el('search').addEventListener('input', render);
el('clear').addEventListener('click', () => { el('search').value = ''; render(); el('search').focus(); });
el('retry').addEventListener('click', load);
load();
