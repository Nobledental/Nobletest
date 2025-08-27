function renderPagination(pageCount){
  prevBtn.disabled = page<=1;
  nextBtn.disabled = page>=pageCount;
  dots.innerHTML = '';
  for (let i=1;i<=pageCount;i++){
    const dot = document.createElement('button');
    dot.className = 'pg-dot' + (i===page ? ' is-active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to page ${i}`);
    dot.addEventListener('click', ()=>{
      page = i; render();
      grid.scrollIntoView({behavior:'smooth', block:'start'});
    });
    dots.appendChild(dot);
  }
}

/* Progressive enhancement for Services:
   - filters the pre-rendered cards already in the DOM
   - adds pagination (hides/shows cards)
   - keeps everything indexable / usable without JS
*/
(() => {
  const root   = document.getElementById('services');
  if (!root) return;
  root.classList.add('js-ready');

  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  const grid    = $('#treatmentsGrid', root);
  const status  = $('#treatmentsStatus', root);
  const search  = $('#svcSearch', root);
  const catSel  = $('#svcCategory', root);
  const chips   = $$('.chip[data-chip]', root);
  const prevBtn = $('#pgPrev', root);
  const nextBtn = $('#pgNext', root);
  const dots    = $('#pgDots', root);

  const cards = $$('.t-card', grid); // static cards
  if (!cards.length) return;

  // Page size by breakpoint
  const getPageSize = () => {
    if (matchMedia('(min-width:1200px)').matches) return 8;
    if (matchMedia('(min-width:900px)').matches)  return 6;
    if (matchMedia('(min-width:640px)').matches)  return 4;
    return 3;
  };
  let PAGE_SIZE = getPageSize();
  let page = 1;

  // Helpers
  const norm = s => (s||'').toLowerCase();
  const LOCAL_BOOST = ['nallagandla','lingampally','tellapur','hyderabad'];

  const score = (card, q, cat) => {
    const title = $('.t-title', card)?.textContent || '';
    const desc  = $('.t-desc', card)?.textContent || '';
    const kw    = card.getAttribute('data-keywords') || '';
    const category = card.getAttribute('data-category') || '';

    if (!q && (cat==='all' || cat===category)) return 0.0001;

    const hay = `${title} ${desc} ${kw} ${category}`.toLowerCase();
    const terms = q.split(/[\s,]+/).filter(Boolean).map(norm);
    let s = 0;
    terms.forEach(t=>{
      if (title.toLowerCase().includes(t)) s += 6;
      if (kw.toLowerCase().includes(t))    s += 4;
      if (hay.includes(t))                 s += 1.5;
      if (LOCAL_BOOST.includes(t))         s += 3;
    });
    if (cat !== 'all' && category === cat) s += 2;
    return s;
  };

  let filtered = cards.slice();

  function applyFilters(){
    const q   = norm(search?.value || '');
    const cat = catSel?.value || 'all';

    const pool = (cat==='all') ? cards.slice()
                               : cards.filter(c => c.getAttribute('data-category') === cat);

    if (!q) {
      filtered = pool;
    } else {
      filtered = pool
        .map(c => ({ c, s: score(c, q, cat) }))
        .filter(x => x.s > 0)
        .sort((a,b) => b.s - a.s ||
                       a.c.getAttribute('data-id').localeCompare(b.c.getAttribute('data-id')))
        .map(x => x.c);
    }
    page = 1;
  }

  function render(){
    // hide all, then show current page of filtered
    cards.forEach(c => c.style.display = 'none');

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > pageCount) page = pageCount;

    const start = (page-1)*PAGE_SIZE;
    const slice = filtered.slice(start, start+PAGE_SIZE);

    slice.forEach(c => c.style.display = '');

    // status + pagination
    if (!filtered.length){
      status.textContent = 'No treatments match your search—try “implants”, “pain”, “kids”, or “whitening”.';
    } else {
      status.textContent = `${filtered.length} result${filtered.length>1?'s':''} — page ${page} of ${pageCount}`;
    }

    prevBtn.disabled = page<=1;
    nextBtn.disabled = page>=pageCount;
    dots.innerHTML = '';
    for (let i=1;i<=pageCount;i++){
      const dot = document.createElement('button');
      dot.className = 'pg-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to page ${i}`);
      if (i===page) dot.setAttribute('aria-current','page');
      dot.addEventListener('click', ()=>{
        page=i; render(); grid.scrollIntoView({behavior:'smooth', block:'start'});
      });
      dots.appendChild(dot);
    }
  }

  // Events
  let t;
  search?.addEventListener('input', ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{ applyFilters(); render(); }, 150);
  });
  catSel?.addEventListener('change', ()=>{ applyFilters(); render(); });

  chips.forEach(ch => ch.addEventListener('click', ()=>{
    if (!search) return;
    search.value = ch.dataset.chip || '';
    applyFilters(); render(); search.focus();
  }));

  prevBtn?.addEventListener('click', ()=>{ if (page>1){ page--; render(); } });
  nextBtn?.addEventListener('click', ()=>{
    const pages = Math.ceil(filtered.length / PAGE_SIZE);
    if (page<pages){ page++; render(); }
  });

  document.addEventListener('keydown', (e)=>{
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key === 'ArrowLeft' && page>1){ page--; render(); }
    if (e.key === 'ArrowRight'){
      const pages = Math.ceil(filtered.length / PAGE_SIZE);
      if (page<pages){ page++; render(); }
    }
  });

  // Responsive PAGE_SIZE
  const mqHandler = () => {
    const newSize = getPageSize();
    if (newSize !== PAGE_SIZE){ PAGE_SIZE = newSize; render(); }
  };
  ['(min-width:1200px)','(min-width:900px)','(min-width:640px)'].forEach(q=>{
    const mq = matchMedia(q);
    (mq.addEventListener ? mq.addEventListener('change', mqHandler) : mq.addListener(mqHandler));
  });

  // Deep-link support (e.g., #svc-implants)
  function jumpTo(id){
    const idx = cards.findIndex(c => c.getAttribute('data-id') === id);
    if (idx < 0) return;
    page = Math.floor(idx / PAGE_SIZE) + 1;
    render();
    requestAnimationFrame(()=>{
      const card = cards[idx];
      if (card){
        card.scrollIntoView({behavior:'smooth', block:'center'});
        card.style.outline = '2px solid var(--brand,#57c0b9)';
        setTimeout(()=> card.style.outline = '', 1400);
      }
    });
  }

  // Intercept in-page links like <a href="#svc-rct">
  ([ '#svc-rct','#svc-wisdom','#svc-implants','#svc-crowns','#svc-dentures','#svc-scaling','#svc-gum' ])
    .forEach(href=>{
      document.querySelectorAll(`a[href="${href}"]`).forEach(a=>{
        a.addEventListener('click', (e)=>{ e.preventDefault(); jumpTo(href.slice(1)); });
      });
    });

  // Initial paint
  applyFilters(); render();

  // Hash on load
  if (location.hash && location.hash.startsWith('#svc-')){
    setTimeout(()=> jumpTo(location.hash.slice(1)), 80);
  }
})();

  // Hero
(() => {
  const vid = document.querySelector('.blackhole-video');
  if (!vid) return;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const apply = () => { if (mq.matches) { vid.pause(); vid.removeAttribute('autoplay'); } else { vid.play().catch(()=>{}); } };
  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
  apply();
})();

  // for Image standardization
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const srcDir = 'src-images', outDir = 'public/images';
const widths = [320, 480, 640, 800, 960, 1200, 1600];

await fs.mkdir(outDir, { recursive: true });
const files = (await fs.readdir(srcDir)).filter(f => /\.(jpe?g|png)$/i.test(f));

for (const file of files) {
  const base = file.replace(/\.(jpe?g|png)$/i,'');
  const input = path.join(srcDir, file);
  const meta = await sharp(input).metadata();

  for (const w of widths) {
    if (!meta.width || w > meta.width) continue;
    await sharp(input).resize(w).toFormat('avif',{quality:50}).toFile(`${outDir}/${base}-${w}.avif`);
    await sharp(input).resize(w).toFormat('webp',{quality:70}).toFile(`${outDir}/${base}-${w}.webp`);
    await sharp(input).resize(w).jpeg({quality:78, mozjpeg:true}).toFile(`${outDir}/${base}-${w}.jpg`);
  }

  await sharp(input).toFormat('avif',{quality:50}).toFile(`${outDir}/${base}.avif`);
  await sharp(input).toFormat('webp',{quality:70}).toFile(`${outDir}/${base}.webp`);
  await sharp(input).jpeg({quality:78, mozjpeg:true}).toFile(`${outDir}/${base}.jpg`);

  // Store natural size for width/height
  await fs.writeFile(`${outDir}/${base}.json`, JSON.stringify({width: meta.width, height: meta.height}));
}
console.log('✅ images built');
