/* =========================================================
   main.js — Site behaviors + Services grid (v2, final)
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
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && nav.classList.contains('open')) closeMenu();
    });
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
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSubmenu(); }
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
      if (qs('.main-nav')?.classList.contains('open')) closeMenu();
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

/* ---------- Services: accents + search + category + pagination + tilt/reveal ---------- */
(() => {
  const qs  = (s, r=document)=>r.querySelector(s);
  const qsa = (s, r=document)=>Array.from(r.querySelectorAll(s));

  // Works with either id
  const grid = qs('#treatmentsGrid') || qs('#servicesGrid');
  if (!grid) return;

  // Controls
  const input  = qs('#svcSearch') || qs('#complaintInput') || null;
  const catSel = qs('#svcCategory') || null;

  // Pager (reuse or create)
  let pager = grid.parentElement.querySelector('.treatments-pagination') || null;
  if (!pager) {
    pager = document.createElement('nav');
    pager.className = 'treatments-pagination';
    pager.setAttribute('aria-label','Treatments pages');
    pager.innerHTML = `
      <button id="pgPrev" class="pg-btn" type="button" aria-label="Previous page">‹</button>
      <div id="pgDots" class="pg-dots" role="list"></div>
      <button id="pgNext" class="pg-btn" type="button" aria-label="Next page">›</button>`;
    grid.insertAdjacentElement('afterend', pager);
  }
  const prevBtn = qs('#pgPrev', pager);
  const nextBtn = qs('#pgNext', pager);
  const dots    = qs('#pgDots', pager) || qs('.pg-dots', pager);

  // Helpers
  const getCardEls = () => qsa('.t-card, .service-card', grid);

  const CAT_MAP = {
    whitening:'Cosmetic & Smile', veneers:'Cosmetic & Smile', smile:'Cosmetic & Smile',
    aligners:'Tooth Alignment', braces:'Tooth Alignment',
    implants:'Implants & Replacement',
    crowns:'Prosthodontics', bridges:'Prosthodontics',
    rct:'Tooth Saving', fillings:'Tooth Saving',
    extraction:'Oral Surgery', scaling:'Periodontics'
  };

  const ACCENT = {
    'Tooth Alignment':        [ 72,134,255],
    'Tooth Saving':           [ 84,196,160],
    'Implants & Replacement': [  0,168,145],
    'Prosthodontics':         [255,193, 72],
    'Cosmetic & Smile':       [245,109,168],
    'Oral Surgery':           [255,171, 64],
    'Periodontics':           [ 76,175, 80],
    'Diagnostics':            [ 64,196,255],
    'Sedation & Sleep':       [140,160,255],
    'Special Care':           [255,112,112],
    'General':                [ 14,165,163]
  };

  const setAccentVars = (el, cat='General') => {
    const [r,g,b] = ACCENT[cat] || ACCENT.General;
    el.style.setProperty('--accent',  `rgb(${r} ${g} ${b})`);
    el.style.setProperty('--tint-06', `rgba(${r},${g},${b},.06)`);
    el.style.setProperty('--tint-12', `rgba(${r},${g},${b},.12)`);
    el.style.setProperty('--tint-18', `rgba(${r},${g},${b},.18)`);
    el.style.setProperty('--tint-25', `rgba(${r},${g},${b},.25)`);
    el.style.setProperty('--tint-35', `rgba(${r},${g},${b},.35)`);
  };

  const toModel = (el, i) => {
    const idToken = (el.id||'').replace(/^svc-/, '').toLowerCase();
    const kw = (el.getAttribute('data-keywords')||'').toLowerCase();
    const fromId = CAT_MAP[idToken];
    const keyHit = Object.keys(CAT_MAP).find(k => kw.includes(k));
    const fromKw = keyHit ? CAT_MAP[keyHit] : null;
    const badge  = el.querySelector('.t-badge')?.textContent?.trim();
    const cat    = el.dataset.category || badge || fromId || fromKw || 'General';
    el.dataset.category = cat;
    setAccentVars(el, cat);
    return {
      el,
      index: i,
      title: el.querySelector('.t-title, h3')?.textContent?.trim() || '',
      text:  el.querySelector('.t-desc, p')?.textContent?.trim() || '',
      kw, category: cat
    };
  };

  let allCards = getCardEls().map(toModel);

  // Interactions
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enhanceInteractions = (els) => {
    if (!matchMedia('(pointer:fine)').matches || reduced) return;
    els.forEach(el=>{
      el.classList.add('ripple');
      const onMove = (e)=>{
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const rotY = ((x / r.width) - 0.5) * 10;
        const rotX = -((y / r.height) - 0.5) * 8;
        const dx = Math.min(1, Math.max(-1, (x - r.width/2) / (r.width/2)));
        const dy = Math.min(1, Math.max(-1, (y - r.height/2) / (r.height/2)));
        el.style.setProperty('--ry', rotY.toFixed(2)+'deg');
        el.style.setProperty('--rx', rotX.toFixed(2)+'deg');
        el.style.setProperty('--tx', (dx*6).toFixed(2)+'px');
        el.style.setProperty('--ty', (dy*6).toFixed(2)+'px');
        el.style.setProperty('--ripple-x', (x/r.width*100)+'%');
        el.style.setProperty('--ripple-y', (y/r.height*100)+'%');
      };
      const onLeave = ()=>{
        el.style.setProperty('--ry','0deg');
        el.style.setProperty('--rx','0deg');
        el.style.setProperty('--tx','0px');
        el.style.setProperty('--ty','0px');
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      el.addEventListener('blur', onLeave);
      el.addEventListener('pointerdown', onMove);
    });
  };

  // Reveal
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if (!en.isIntersecting) return;
      en.target.classList.add('in-view');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  const observeVisible = (els)=>{
    if (reduced) { els.forEach(n => n.classList.add('in-view')); return; }
    els.forEach(n => { n.classList.remove('in-view'); io.observe(n); });
  };

  // Search + Category + Pagination
  const normalize = s => (s||'').toLowerCase();
  const score = (c, q) => {
    if (!q) return 0;
    const blob = `${c.title} ${c.text} ${c.kw}`.toLowerCase();
    let s = 0;
    q.split(/[\s,]+/).filter(Boolean).forEach(t=>{
      const term = t.toLowerCase();
      if (c.title.toLowerCase().includes(term)) s += 5;
      if (c.kw.includes(term))                 s += 3;
      if (blob.includes(term))                 s += 1;
    });
    return s;
  };

  const PAGE_SIZE = 6;
  const state = { q:'', cat:'all', page:1, list: allCards };

  const compute = ()=>{
    const { q, cat } = state;
    let pool = allCards.slice();
    if (cat !== 'all') pool = pool.filter(c => c.category === cat);
    state.list = !q ? pool
      : pool.map(c=>({c, s:score(c,q)})).filter(x=>x.s>0)
            .sort((a,b)=> b.s - a.s || a.c.index - b.c.index)
            .map(x=>x.c);
    const maxPage = Math.max(1, Math.ceil(state.list.length / PAGE_SIZE));
    if (state.page > maxPage) state.page = 1;
  };

  const render = ()=>{
    const { page, list } = state;

    // hide all
    allCards.forEach(({el})=>{
      el.style.display='none';
      el.setAttribute('aria-hidden','true');
    });

    // page slice
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);

    slice.forEach(({el}, i)=>{
      el.style.display='block';
      el.removeAttribute('aria-hidden');
      el.classList.add('reveal');
      el.style.setProperty('--delay', (i*70)+'ms');
      setAccentVars(el, el.dataset.category || 'General');
    });

    observeVisible(slice.map(s => s.el));
    enhanceInteractions(slice.map(s => s.el));

    // pager UI
    if (prevBtn && nextBtn && dots) {
      prevBtn.disabled = (page<=1);
      nextBtn.disabled = (page>=pages);
      dots.innerHTML = '';
      for (let i=1;i<=pages;i++){
        const b = document.createElement('button');
        b.type='button'; b.className='pg-dot';
        if (i===page) b.setAttribute('aria-current','page');
        b.addEventListener('click', ()=>{
          state.page=i; render();
          window.scrollTo({ top: grid.offsetTop - 120, behavior: 'smooth' });
        });
        dots.appendChild(b);
      }
    }
  };

  const apply = ()=>{ compute(); render(); };

  // Bind controls (if present)
  let deb;
  input?.addEventListener('input', (e)=>{
    clearTimeout(deb);
    deb = setTimeout(()=>{ state.q = normalize(e.target.value); state.page=1; apply(); }, 160);
  });
  catSel?.addEventListener('change', ()=>{
    state.cat = catSel.value; state.page=1; apply();
  });

  prevBtn?.addEventListener('click', ()=>{ if (state.page>1){ state.page--; render(); } });
  nextBtn?.addEventListener('click', ()=>{
    const pages = Math.max(1, Math.ceil(state.list.length / PAGE_SIZE));
    if (state.page<pages){ state.page++; render(); }
  });

  // Initial pass
  apply();

  // Keep up with dynamic DOM changes
  const mo = new MutationObserver(()=>{
    allCards = getCardEls().map(toModel);
    apply();
  });
  mo.observe(grid, { childList:true, subtree:true });

  // Re-observe on resize
  let rT;
  window.addEventListener('resize', ()=>{
    clearTimeout(rT);
    rT = setTimeout(()=>{
      const visible = getCardEls().filter(el => el.style.display !== 'none');
      observeVisible(visible);
    }, 120);
  });
})();
