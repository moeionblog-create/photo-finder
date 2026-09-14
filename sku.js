const el = id => document.getElementById(id);
const catalog = el('catalog');
let data;
let noticeTimer;
const normalize = s => String(s || '').normalize('NFC').toLocaleLowerCase('th');
function notify(message) {
  clearTimeout(noticeTimer);
  el('notice').textContent = message;
  el('notice').classList.add('visible');
  noticeTimer = setTimeout(() => el('notice').classList.remove('visible'), 3000);
}
async function copyCode(input, button) {
  button.disabled = true;
  const value = input.value;
  try {
    try { await navigator.clipboard.writeText(value); }
    catch {
      input.focus(); input.select(); input.setSelectionRange(0, value.length);
      if (!document.execCommand('copy')) throw new Error('manual');
    }
    notify(`คัดลอกแล้ว: ${value}`);
  } catch {
    input.focus(); input.select();
    notify('คัดลอกอัตโนมัติไม่ได้ กรุณาคัดลอกข้อความที่เลือกไว้');
  } finally { button.disabled = false; }
}
function makeCard(product, index) {
  const card = document.createElement('article'); card.className = 'product';
  // All catalog text is assigned through textContent/value, never interpreted as markup.
  card.innerHTML = `<div class="photo"><img loading="lazy" decoding="async" width="300" height="300"><span class="photo-error" hidden>ไม่สามารถโหลดรูปนี้ได้</span></div><div class="product-body"><h2></h2><label class="code-label"></label><input class="code" readonly spellcheck="false"><button class="copy" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg><span>คัดลอกรหัส</span></button></div>`;
  const image = card.querySelector('img');
  image.alt = product.code;
  image.addEventListener('error', () => { image.hidden = true; card.querySelector('.photo-error').hidden = false; });
  try { const url = new URL(product.image); if (url.protocol !== 'https:') throw new Error('scheme'); image.src = url.href; }
  catch { image.hidden = true; card.querySelector('.photo-error').hidden = false; }
  card.querySelector('h2').textContent = product.code;
  const body = card.querySelector('.product-body');
  const input = card.querySelector('.code'); input.id = `code-${index}`; input.value = product.code;
  const label = card.querySelector('.code-label'); label.htmlFor = input.id;
  const hasSizes = product.variants.some(v => v.size);
  label.textContent = hasSizes ? 'รหัสแบบ / สี (ไม่รวมไซซ์)' : 'SKU Merchant';
  const button = card.querySelector('.copy');
  button.setAttribute('aria-label', `คัดลอกรหัส ${product.code}`);
  button.addEventListener('click', () => copyCode(input, button));
  if (hasSizes) {
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = `เพิ่มไซซ์ (${product.variants.length} ตัวเลือก)`;
    const sizeLabel = document.createElement('label'); sizeLabel.textContent = 'เลือกไซซ์'; sizeLabel.htmlFor = `size-${index}`;
    const select = document.createElement('select'); select.id = sizeLabel.htmlFor;
    select.add(new Option('ไม่รวมไซซ์', ''));
    product.variants.forEach((v, i) => select.add(new Option(v.size ? v.size.toUpperCase() : 'รหัสไม่มีไซซ์', String(i))));
    select.addEventListener('change', () => {
      const variant = select.value === '' ? null : product.variants[Number(select.value)];
      input.value = variant ? variant.sku : product.code;
      label.textContent = variant ? 'SKU Merchant พร้อมไซซ์' : 'รหัสแบบ / สี (ไม่รวมไซซ์)';
      button.querySelector('span').textContent = variant ? 'คัดลอกพร้อมไซซ์' : 'คัดลอกรหัส';
      button.setAttribute('aria-label', `คัดลอกรหัส ${input.value}`);
      summary.textContent = variant ? `ไซซ์ ${variant.size?.toUpperCase() || 'ไม่ระบุ'} · เปลี่ยนได้` : `เพิ่มไซซ์ (${product.variants.length} ตัวเลือก)`;
    });
    details.append(summary, sizeLabel, select); body.append(details);
  } else {
    const note = document.createElement('p'); note.className = 'single'; note.textContent = 'ใช้รหัสเต็มจาก BigSeller'; body.append(note);
  }
  return card;
}
function render() {
  if (!data) return;
  let query = normalize(el('search').value).trim();
  // Common name used by the owner for Galant / PG09.
  query = query.replace(/กาแลน(?:ด์|ด|ท์)?|galant/g, 'pg09');
  const words = query.split(/\s+/).filter(Boolean);
  const filtered = data.products.filter(p => (el('scope').value === 'all' || p.panisa) && words.every(w => normalize([p.code, p.name, ...p.variants.map(v => v.sku)].join(' ')).includes(w)));
  catalog.replaceChildren(...filtered.map(makeCard));
  el('empty').hidden = filtered.length !== 0;
  const skuCount = filtered.reduce((sum, p) => sum + p.variants.length, 0);
  el('count').textContent = `${filtered.length.toLocaleString('th-TH')} แบบ / สี · รวม ${skuCount.toLocaleString('th-TH')} SKU`;
}
async function load() {
  el('error').hidden = true; el('empty').hidden = true;
  el('count').textContent = 'กำลังโหลดสินค้า…';
  try {
    const response = await fetch('./sku-catalog.json', { cache:'no-cache' });
    if (!response.ok) throw new Error('load');
    data = await response.json();
    if (!Array.isArray(data.products)) throw new Error('format');
    el('source').textContent = `BigSeller · ข้อมูล ${new Intl.DateTimeFormat('th-TH', {day:'numeric',month:'short',year:'numeric'}).format(new Date(data.updated + 'T00:00:00+07:00'))}`;
    render();
  } catch { data = null; catalog.replaceChildren(); el('error').hidden = false; el('count').textContent = 'ยังโหลดข้อมูลไม่ได้'; }
}
el('search').addEventListener('input', render);
el('scope').addEventListener('change', render);
el('reset').addEventListener('click', () => { el('search').value = ''; render(); el('search').focus(); });
el('retry').addEventListener('click', load);
load();
