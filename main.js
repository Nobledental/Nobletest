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


  // Hero
(() => {
  const vid = document.querySelector('.blackhole-video');
  if (!vid) return;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const apply = () => { if (mq.matches) { vid.pause(); vid.removeAttribute('autoplay'); } else { vid.play().catch(()=>{}); } };
  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
  apply();
})();

/* === Treatments: browser-only renderer (CodePen-safe) === */
(() => {
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  const grid = $('#tGrid'); if (!grid) return;
  const status = $('#tStatus'), search = $('#tSearch'), catSel = $('#tCategory');
  const chips = $$('.t-chip'), prev = $('#tPrev'), next = $('#tNext'), dots = $('#tDots');

  // use placeholder images that work on CodePen (swap to your /images/... on your site)
  const P = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`;

  const T = [
    {id:'rct',      title:'Root Canal Treatment (RCT)',   category:'Tooth Saving',           desc:'Painless single-visit RCT with RVG & apex locator.',            url:'#', img:P('rct'),      w:800,h:500, keywords:'root canal pain swelling abscess'},
    {id:'implants', title:'Dental Implants',              category:'Implants & Replacement', desc:'Replace missing teeth with guided digital planning.',            url:'#', img:P('implants'), w:800,h:500, keywords:'implants missing tooth all-on-4'},
    {id:'braces',   title:'Braces (Metal/Ceramic)',       category:'Tooth Alignment',        desc:'Fix crowding, gaps, and bite issues.',                           url:'#', img:P('braces'),   w:800,h:500, keywords:'braces orthodontics bite'},
    {id:'aligners', title:'Clear Aligners (Invisalign®)', category:'Tooth Alignment',        desc:'Nearly invisible trays with 3D simulation.',                    url:'#', img:P('aligners'), w:800,h:500, keywords:'aligners invisalign trays'},
    {id:'wisdom',   title:'Wisdom Tooth Extraction',      category:'Oral Surgery',           desc:'Safe removal of impacted third molars.',                        url:'#', img:P('wisdom'),   w:800,h:500, keywords:'wisdom tooth extraction'},
    {id:'whitening',title:'Teeth Whitening',              category:'Cosmetic & Smile',       desc:'In-clinic and take-home options.',                              url:'#', img:P('whitening'),w:800,h:500, keywords:'whitening bleaching stains'},
    {id:'gums',     title:'Gum Treatment (Periodontics)', category:'Gum & Periodontics',     desc:'Deep cleaning, laser therapy, grafts.',                         url:'#', img:P('gums'),     w:800,h:500, keywords:'gum disease bleeding'},
    {id:'kids',     title:'Kids Dentistry',               category:'Kids & Family',          desc:'Gentle pediatric care and sealants.',                           url:'#', img:P('kids'),     w:800,h:500, keywords:'kids pediatric'},
    {id:'crowns',   title:'Crowns & Bridges',             category:'Prosthodontics',         desc:'Restore strength & aesthetics.',                                url:'#', img:P('crowns'),   w:800,h:500, keywords:'crown bridge zirconia'},
    {id:'fillings', title:'Tooth Fillings (Bonding)',     category:'Tooth Saving',           desc:'Fix cavities with composites.',                                 url:'#', img:P('fillings'), w:800,h:500, keywords:'filling cavity bonding'},
    {id:'dentures', title:'Dentures & Implant Dentures',  category:'Prosthodontics',         desc:'Comfortable dentures; implant support.',                        url:'#', img:P('dentures'), w:800,h:500, keywords:'dentures partial complete'},
    {id:'smile',    title:'Smile Designing / Veneers',    category:'Cosmetic & Smile',       desc:'Shape, color, alignment refinements.',                          url:'#', img:P('smile'),    w:800,h:500, keywords:'veneers smile makeover'}
  ];

  const state = { q:'', cat:'all', page:1, per:8, items:T };

  const card = (t) => `
    <article class="t-card">
      <div class="t-media"><img src="${t.img}" width="${t.w}" height="${t.h}" alt="${t.title}" loading="lazy" decoding="async"></div>
      <div class="t-body">
        <div class="t-title">${t.title}</div>
        <p class="t-desc">${t.desc}</p>
        <div class="t-actions">
          <a class="t-btn" href="${t.url}"><i class="bx bx-link-external" aria-hidden="true"></i> Learn more</a>
          <a class="t-btn" href="#ndc-appointment"><i class="bx bx-calendar" aria-hidden="true"></i> Book</a>
        </div>
      </div>
    </article>`;

  const paginate = (arr,p,per)=>arr.slice((p-1)*per, p*per);

  const applyFilters = () => {
    const q = state.q.trim().toLowerCase(), cat = state.cat;
    state.items = T.filter(t => {
      const okCat = cat==='all' || t.category===cat;
      const blob = `${t.title} ${t.desc} ${t.category} ${t.keywords}`.toLowerCase();
      const okQ = !q || blob.includes(q);
      return okCat && okQ;
    });
    state.page = 1; render();
  };

  const render = () => {
    const {items,page,per} = state;
    const total = items.length, pages = Math.max(1, Math.ceil(total/per));
    state.page = Math.min(page, pages);

    grid.setAttribute('aria-busy','true');
    grid.innerHTML = paginate(items, state.page, per).map(card).join('') || '<p>No treatments found.</p>';
    grid.setAttribute('aria-busy','false');

    status.textContent = `${total} treatment${total!==1?'s':''}${state.q?` for “${state.q}”`:''}${state.cat!=='all'?` in ${state.cat}`:''}`;
    prev.disabled = state.page===1; next.disabled = state.page===pages;

    dots.innerHTML = Array.from({length: pages}, (_,i)=>{
      const cur = (i+1)===state.page;
      return `<span class="dot" role="listitem" aria-current="${cur?'true':'false'}" data-page="${i+1}"></span>`;
    }).join('');
  };

  search?.addEventListener('input', e => { state.q = e.target.value; applyFilters(); });
  catSel?.addEventListener('change', e => { state.cat = e.target.value; applyFilters(); });
  chips.forEach(ch => ch.addEventListener('click', () => { state.q = ch.dataset.chip; search.value = state.q; applyFilters(); }));
  prev?.addEventListener('click', () => { state.page = Math.max(1, state.page-1); render(); });
  next?.addEventListener('click', () => { state.page = state.page+1; render(); });
  dots?.addEventListener('click', e => { const d = e.target.closest('.dot'); if (!d) return; state.page = +d.dataset.page || 1; render(); });

  render();
})();
