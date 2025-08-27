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

