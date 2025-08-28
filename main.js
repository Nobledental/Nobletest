/* ===== Reduced motion for hero (works with poster or <video>) ===== */
(() => {
  const vid = document.querySelector('.blackhole-video');
  if (!vid) return;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const apply = () => { if (mq.matches) { vid.pause?.(); vid.removeAttribute?.('autoplay'); } };
  mq.addEventListener?.('change', apply) ?? mq.addListener?.(apply);
  apply();
})();

/* ===== Treatments: data + renderer (single, browser-safe) ===== */
(() => {
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  const grid   = $('#tGrid');
  if (!grid) return;

  const status = $('#tStatus');
  const search = $('#tSearch');
  const catSel = $('#tCategory');
  const chips  = $$('.t-chip');
  const prev   = $('#tPrev');
  const next   = $('#tNext');
  const dots   = $('#tDots');

  // Placeholder images that work anywhere (swap to /images/treat-*.jpg on Netlify)
  const PIC = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`;

  // Data
  const T = [
    {id:'rct', title:'Root Canal Treatment (RCT)', category:'Tooth Saving',
      desc:'Painless single-visit RCT with RVG & apex locator to save infected teeth.',
      url:'/specialities/root-canal.html', img:PIC('rct'), w:800, h:500,
      keywords:'root canal pain swelling abscess nallagandla hyderabad'},
    {id:'implants', title:'Dental Implants', category:'Implants & Replacement',
      desc:'Replace missing teeth with guided digital planning and long-term stability.',
      url:'/specialities/implants.html', img:PIC('implants'), w:800, h:500,
      keywords:'implants missing tooth all-on-4 full arch'},
    {id:'braces', title:'Braces (Metal/Ceramic)', category:'Tooth Alignment',
      desc:'Correct crowding, gaps, and bite issues with regular reviews.',
      url:'/specialities/braces.html', img:PIC('braces'), w:800, h:500,
      keywords:'braces orthodontics crowding spacing'},
    {id:'aligners', title:'Clear Aligners (Invisalign®)', category:'Tooth Alignment',
      desc:'Nearly invisible trays with 3D simulation—comfortable and hygienic.',
      url:'/specialities/invisalign.html', img:PIC('aligners'), w:800, h:500,
      keywords:'aligners invisalign trays'},
    {id:'wisdom', title:'Wisdom Tooth Extraction', category:'Oral Surgery',
      desc:'Safe removal of impacted or painful third molars.',
      url:'/specialities/extraction.html', img:PIC('wisdom'), w:800, h:500,
      keywords:'wisdom tooth extraction pericoronitis'},
    {id:'whitening', title:'Teeth Whitening', category:'Cosmetic & Smile',
      desc:'In-clinic and take-home whitening with sensitivity control.',
      url:'/specialities/scaling-whitening.html', img:PIC('whitening'), w:800, h:500,
      keywords:'whitening bleaching stains'},
    {id:'gums', title:'Gum Treatment (Periodontics)', category:'Gum & Periodontics',
      desc:'Deep cleaning, laser therapy, and grafts for healthy gums.',
      url:'/specialities/gum-surgeries.html', img:PIC('gums'), w:800, h:500,
      keywords:'gum bleeding periodontitis scaling'},
    {id:'kids', title:'Kids Dentistry', category:'Kids & Family',
      desc:'Gentle pediatric care, sealants, and habit counseling.',
      url:'/specialities/kids-dentistry.html', img:PIC('kids'), w:800, h:500,
      keywords:'kids pediatric cavities'},
    {id:'crowns', title:'Crowns & Bridges', category:'Prosthodontics',
      desc:'Restore strength and aesthetics with zirconia/ceramic options.',
      url:'/specialities/crowns-bridges.html', img:PIC('crowns'), w:800, h:500,
      keywords:'crown bridge zirconia'},
    {id:'fillings', title:'Tooth Fillings (Bonding)', category:'Tooth Saving',
      desc:'Fix cavities and cracks with tooth-colored composites.',
      url:'/specialities/fillings.html', img:PIC('fillings'), w:800, h:500,
      keywords:'filling cavity bonding'},
    {id:'dentures', title:'Dentures & Implant Dentures', category:'Prosthodontics',
      desc:'Comfortable partial/full dentures; upgrade to implant support.',
      url:'/specialities/dentures.html', img:PIC('dentures'), w:800, h:500,
      keywords:'dentures partial complete'},
    {id:'smile', title:'Smile Designing / Veneers', category:'Cosmetic & Smile',
      desc:'Shape, color, and alignment refinements with minimal prep.',
      url:'/specialities/smile-design.html', img:PIC('smile'), w:800, h:500,
      keywords:'veneers smile makeover'}
  ];

  // State
  const state = { q:'', cat:'all', page:1, per:8, items:T };

  // Helpers
  const card = (t) => `
    <article class="t-card" data-id="${t.id}">
      <div class="t-media">
        <img src="${t.img}" width="${t.w}" height="${t.h}" alt="${t.title}" loading="lazy" decoding="async">
      </div>
      <div class="t-body">
        <div class="t-title">${t.title}</div>
        <p class="t-desc">${t.desc}</p>
        <div class="t-actions">
          <a class="t-btn" href="${t.url}"><i class="bx bx-link-external" aria-hidden="true"></i> Learn more</a>
          <a class="t-btn" href="#ndc-appointment"><i class="bx bx-calendar" aria-hidden="true"></i> Book</a>
        </div>
      </div>
    </article>`;

  const paginate = (arr,p,per) => arr.slice((p-1)*per, p*per);

  const applyFilters = () => {
    const q = state.q.trim().toLowerCase();
    const cat = state.cat;
    state.items = T.filter(t => {
      const okCat = cat==='all' || t.category===cat;
      const blob = `${t.title} ${t.desc} ${t.category} ${t.keywords}`.toLowerCase();
      const okQ = !q || blob.includes(q);
      return okCat && okQ;
    });
    state.page = 1;
    render();
  };

  const render = () => {
    const {items, page, per} = state;
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / per));
    state.page = Math.min(page, pages);

    grid.setAttribute('aria-busy','true');
    grid.innerHTML = (paginate(items, state.page, per).map(card).join('')) || '<p>No treatments found.</p>';
    grid.setAttribute('aria-busy','false');

    status.textContent = total
      ? `${total} treatment${total!==1?'s':''}${state.q?` for “${state.q}”`:''}${state.cat!=='all'?` in ${state.cat}`:''}`
      : 'No treatments match — try “implants”, “pain”, “kids”, “whitening”.';

    prev.disabled = state.page===1;
    next.disabled = state.page===pages;

    dots.innerHTML = Array.from({length: pages}, (_,i)=>{
      const cur = (i+1)===state.page;
      return `<span class="dot" role="listitem" aria-current="${cur?'true':'false'}" data-page="${i+1}"></span>`;
    }).join('');
  };

  // Events
  search?.addEventListener('input', e => { state.q = e.target.value; applyFilters(); });
  catSel?.addEventListener('change', e => { state.cat = e.target.value; applyFilters(); });
  chips.forEach(ch => ch.addEventListener('click', () => {
    if (!search) return;
    state.q = ch.dataset.chip || '';
    search.value = state.q;
    applyFilters();
    search.focus();
  }));
  prev?.addEventListener('click', () => { state.page = Math.max(1, state.page-1); render(); });
  next?.addEventListener('click', () => { state.page = state.page+1; render(); });
  dots?.addEventListener('click', e => {
    const dot = e.target.closest('[data-page]');
    if (!dot) return;
    state.page = Number(dot.dataset.page)||1;
    render();
    grid.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // Initial paint
  render();
})();
