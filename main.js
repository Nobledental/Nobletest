/* =========================================================
   main.js — Site behaviors + Services grid (v2)
   ========================================================= */

/* ---------- Core site behaviors ---------- */
(() => {
  const qs  = (s, r=document)=>r.querySelector(s);
  const qsa = (s, r=document)=>Array.from(r.querySelectorAll(s));

  /* AOS init (safe) */
  window.addEventListener('load', () => {
    if (window.AOS) AOS.init({ once: true, duration: 700, easing: 'ease-out' });
  });

  /* Sticky header elevation */
  const header = qs('.site-header');
  const onScroll = () => header?.classList.toggle('elevated', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu (drawer) + focus trap + Esc/outside + body lock */
  const nav      = qs('.main-nav');
  const menuBtn  = qs('.menu-toggle');
  const focusSel = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let prevFocus = null;

  const trapTab = (e) => {
    if (!nav?.classList.contains('open') || e.key !== 'Tab') return;
    const nodes = qsa(focusSel, nav).filter(el => !el.hasAttribute('disabled'));
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const onEscClose = (e) => { if (e.key === 'Escape') closeMenu(); };

  const openMenu = () => {
    if (!nav) return;
    prevFocus = document.activeElement;
    nav.classList.add('open');
    document.body.classList.add('nav-open');
    menuBtn?.setAttribute('aria-expanded', 'true');
    (qs(focusSel, nav) || nav).focus();
    document.addEventListener('keydown', trapTab, true);
    document.addEventListener('keydown', onEscClose, true);
  };
  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', trapTab, true);
    document.removeEventListener('keydown', onEscClose, true);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => (nav.classList.contains('open') ? closeMenu() : openMenu()));

    // Close on link click
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && nav.classList.contains('open')) closeMenu();
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const inside = e.target.closest('.main-nav') || e.target.closest('.menu-toggle');
      if (!inside) closeMenu();
    });
  }

  /* Specialities dropdown (tap on mobile) */
  const spItem   = qs('.has-submenu');
  const spToggle = qs('.has-submenu > a');

  const isTouchMode = () =>
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const toggleSubmenu = (open) => {
    if (!spItem || !spToggle) return;
    const willOpen = (typeof open === 'boolean') ? open : !spItem.classList.contains('open-submenu');
    spItem.classList.toggle('open-submenu', willOpen);
    spToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  };

  if (spItem && spToggle) {
    spToggle.addEventListener('click', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (isTouchMode() || drawerOpen) {
        e.preventDefault();
        toggleSubmenu();
      }
    });
    spToggle.addEventListener('keydown', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (!(isTouchMode() || drawerOpen)) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); toggleSubmenu();
      }
    });
    document.addEventListener('click', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (!(isTouchMode() || drawerOpen)) return;
      if (!spItem.contains(e.target)) toggleSubmenu(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleSubmenu(false); });
    let resizeTimer;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => toggleSubmenu(false), 120); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
  }

  /* Smooth scroll with fixed-header offset */
  const scrollWithOffset = (el) => {
    const h = header ? header.getBoundingClientRect().height : 0;
    const y = el.getBoundingClientRect().top + window.scrollY - h - 8;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.startsWith('#!')) return;
      const el = qs(id);
      if (!el) return;
      e.preventDefault();
      scrollWithOffset(el);
      history.replaceState(null, '', id);
      if (nav?.classList.contains('open')) closeMenu();
    });
  });

  /* Active link highlight on scroll */
  const sections = qsa('section[id]');
  const navLinks = new Map();
  qsa('.main-nav a[href^="#"]').forEach(a => { const id = a.getAttribute('href'); if (id) navLinks.set(id, a); });
  if (sections.length && navLinks.size) {
    const io = new IntersectionObserver((entries) => {
      const best = entries.filter(e => e.isIntersecting).sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0];
      if (!best) return;
      const id = `#${best.target.id}`;
      navLinks.forEach(link => link.classList.remove('active'));
      const active = navLinks.get(id);
      if (active) active.classList.add('active');
    }, { rootMargin: '-45% 0px -50% 0px', threshold: [0, .25, .5, .75, 1] });
    sections.forEach(sec => io.observe(sec));
    window.addEventListener('pagehide', () => io.disconnect());
  }

  /* Footer year */
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Motion preferences for hero video */
  const video = qs('.blackhole-video');
  const mq    = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPref = () => {
    if (!video) return;
    if (mq.matches) { video.pause(); video.removeAttribute('autoplay'); }
    else { if (video.paused) video.play().catch(()=>{}); }
  };
  if (mq.addEventListener) mq.addEventListener('change', applyMotionPref);
  else if (mq.addListener) mq.addListener(applyMotionPref);
  applyMotionPref();
})();

/* ---------- Services grid v2: 6-per-page + search + category + tilt/ripple/reveal ---------- */
(() => {
  const qs  = (s, r=document)=>r.querySelector(s);
  const qsa = (s, r=document)=>Array.from(r.querySelectorAll(s));

  const grid   = qs('#servicesGrid');
  const input  = qs('#complaintInput');
  if (!grid) return;

  /* Toolbar (category) */
  const toolbar = document.createElement('div');
  toolbar.className = 'svc-toolbar';
  toolbar.innerHTML = `
    <div class="select">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" stroke="#475569" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <label for="svcCategory" class="visually-hidden">Filter by topic</label>
      <select id="svcCategory">
        <option value="all">All topics</option>
        <option value="Tooth Alignment">Tooth Alignment</option>
        <option value="Tooth Saving">Tooth Saving</option>
        <option value="Implants & Replacement">Implants & Replacement</option>
        <option value="Prosthodontics">Prosthodontics</option>
        <option value="Cosmetic & Smile">Cosmetic & Smile</option>
        <option value="Oral Surgery">Oral Surgery</option>
        <option value="Periodontics">Gum & Periodontics</option>
      </select>
    </div>
  `;
  input?.insertAdjacentElement('afterend', toolbar);
  const catSel = qs('#svcCategory', toolbar);

  /* Pager UI */
  const pager = document.createElement('nav');
  pager.id = 'svcPager';
  pager.setAttribute('aria-label','Treatments pages');
  pager.innerHTML = `
    <button id="pgPrev" class="pg-btn" type="button" aria-label="Previous page">‹</button>
    <div class="pg-dots" role="list"></div>
    <button id="pgNext" class="pg-btn" type="button" aria-label="Next page">›</button>
  `;
  grid.insertAdjacentElement('afterend', pager);
  const prevBtn = qs('#pgPrev', pager);
  const nextBtn = qs('#pgNext', pager);
  const dots    = qs('.pg-dots', pager);

  /* Collect cards (keep your original markup) */
  const allCards = qsa('.service-card', grid).map((el, i)=>({
    el,
    index: i,
    title: el.querySelector('h3')?.textContent?.trim() || '',
    text:  el.querySelector('p')?.textContent?.trim() || '',
    kw:    (el.getAttribute('data-keywords') || '').toLowerCase(),
    id:    el.id || ''
  }));

  const CAT_MAP = {
    'whitening':'Cosmetic & Smile',
    'veneers':'Cosmetic & Smile',
    'smile':'Cosmetic & Smile',
    'aligners':'Tooth Alignment',
    'braces':'Tooth Alignment',
    'implants':'Implants & Replacement',
    'crowns':'Prosthodontics',
    'bridges':'Prosthodontics',
    'rct':'Tooth Saving',
    'fillings':'Tooth Saving',
    'extraction':'Oral Surgery',
    'scaling':'Periodontics',
  };
  allCards.forEach(c=>{
    const token = c.id.replace(/^svc-/, '');
    const byId  = CAT_MAP[token];
    const byKw  = Object.keys(CAT_MAP).find(k => c.kw.includes(k));
    c.category  = byId || (byKw && CAT_MAP[byKw]) || 'General';
    c.el.dataset.category = c.category;
    c.el.classList.add('reveal'); // for entrance animation
  });

  /* Fancy interactions: tilt + magnetic + ripple origin */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n,min,max)=> Math.min(max, Math.max(min, n));
  const setOrigin = (card, e)=>{
    const r = card.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top ) / r.height)* 100;
    card.style.setProperty('--px', px + '%');
    card.style.setProperty('--py', py + '%');
  };

  allCards.forEach(({el})=>{
    el.classList.add('ripple');
    el.addEventListener('pointermove', (e)=>{
      if (reduced) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rotY = ((x / r.width) - 0.5) * 10;    // -5..5
      const rotX = -((y / r.height) - 0.5) * 8;   // -4..4
      const strength = 6;
      const dx = Math.min(1, Math.max(-1, (x - r.width/2) / (r.width/2)));
      const dy = Math.min(1, Math.max(-1, (y - r.height/2) / (r.height/2)));
      const tx = dx * strength;
      const ty = dy * strength;

      el.style.setProperty('--ry', rotY.toFixed(2)+'deg');
      el.style.setProperty('--rx', rotX.toFixed(2)+'deg');
      el.style.setProperty('--tx', tx.toFixed(2)+'px');
      el.style.setProperty('--ty', ty.toFixed(2)+'px');
      setOrigin(el, e);
    });
    ['pointerleave','blur'].forEach(ev=>{
      el.addEventListener(ev, ()=>{
        el.style.setProperty('--ry','0deg');
        el.style.setProperty('--rx','0deg');
        el.style.setProperty('--tx','0px');
        el.style.setProperty('--ty','0px');
      });
    });
    el.addEventListener('pointerdown', (e)=> setOrigin(el, e));
  });

  /* Search + Category + Pagination */
  const PAGE_SIZE = 6;
  let state = { q:'', cat:'all', page:1, list: allCards };

  const normalize = s => (s||'').toLowerCase();
  const score = (c, q) => {
    if (!q) return 0;
    const blob = `${c.title} ${c.text} ${c.kw}`.toLowerCase();
    let s = 0;
    q.split(/[\s,]+/).filter(Boolean).forEach(t=>{
      t = t.toLowerCase();
      if (c.title.toLowerCase().includes(t)) s += 5;
      if (c.kw.includes(t)) s += 3;
      if (blob.includes(t)) s += 1;
    });
    return s;
  };

  const compute = ()=>{
    const {q, cat} = state;
    let pool = allCards.slice();
    if (cat !== 'all') pool = pool.filter(c => c.category === cat);
    state.list = !q ? pool
      : pool.map(c=>({c, s: score(c,q)})).filter(x=>x.s>0)
             .sort((a,b)=> b.s - a.s || a.c.index - b.c.index)
             .map(x=>x.c);
    const maxPage = Math.max(1, Math.ceil(state.list.length / PAGE_SIZE));
    if (state.page > maxPage) state.page = 1;
  };

  /* Reveal on scroll (with stagger) */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in-view');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  const observeVisible = (nodes)=>{
    if (reduced) { nodes.forEach(n => n.classList.add('in-view')); return; }
    nodes.forEach(n => { n.classList.remove('in-view'); io.observe(n); });
  };

  const prevBtn = qs('#pgPrev', pager);
  const nextBtn = qs('#pgNext', pager);
  const dots    = qs('.pg-dots', pager);

  const render = ()=>{
    const {page, list} = state;

    // hide all
    allCards.forEach(({el})=>{
      el.style.display='none';
      el.setAttribute('aria-hidden','true');
    });

    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);

    // show page + set stagger delays
    slice.forEach(({el}, i)=>{
      el.style.display='block';
      el.removeAttribute('aria-hidden');
      el.style.setProperty('--delay', (i*70)+'ms');
      el.classList.remove('in-view');
      el.classList.add('reveal');
    });

    // observe visible for reveal
    observeVisible(slice.map(s => s.el));

    // pager UI
    prevBtn.disabled = (page<=1);
    nextBtn.disabled = (page>=pages);
    dots.innerHTML = '';
    for (let i=1;i<=pages;i++){
      const b = document.createElement('button');
      b.type='button'; b.className='pg-dot'; if (i===page) b.setAttribute('aria-current','page');
      b.addEventListener('click', ()=>{
        state.page=i; render();
        window.scrollTo({ top: grid.offsetTop - 120, behavior: 'smooth' });
      });
      dots.appendChild(b);
    }
  };

  const apply = ()=>{ compute(); render(); };

  // Bind controls
  let t;
  input?.addEventListener('input', (e)=>{
    clearTimeout(t);
    t = setTimeout(()=>{ state.q = normalize(e.target.value); state.page=1; apply(); }, 160);
  });
  catSel?.addEventListener('change', ()=>{ state.cat = catSel.value; state.page=1; apply(); });

  // Pager buttons
  prevBtn.addEventListener('click', ()=>{ if (state.page>1){ state.page--; render(); } });
  nextBtn.addEventListener('click', ()=>{
    const pages = Math.max(1, Math.ceil(state.list.length / PAGE_SIZE));
    if (state.page<pages){ state.page++; render(); }
  });

  // Initial render
  apply();

  // Re-observe on resize
  let rT;
  window.addEventListener('resize', ()=>{
    clearTimeout(rT);
    rT = setTimeout(()=>{
      const visible = qsa('.service-card', grid).filter(el => el.style.display !== 'none');
      observeVisible(visible);
    }, 120);
  });
})();
