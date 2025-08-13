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

   const setSectionAccent = (cat='General') => {
  const box = document.querySelector('.svc');
  if (!box) return;
  const [r,g,b] = (ACCENT[cat] || ACCENT.General);
  box.style.setProperty('--accent', `rgb(${r} ${g} ${b})`);
  box.style.setProperty('--tint-06', `rgba(${r},${g},${b},.06)`);
  box.style.setProperty('--tint-12', `rgba(${r},${g},${b},.12)`);
  box.style.setProperty('--tint-18', `rgba(${r},${g},${b},.18)`);
  box.style.setProperty('--tint-25', `rgba(${r},${g},${b},.25)`);
  box.style.setProperty('--tint-35', `rgba(${r},${g},${b},.35)`);
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

const apply = ()=>{
  compute();
  setSectionAccent(state.cat === 'all' ? 'General' : state.cat);
  render();
};

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

<!-- Doctors Dashboard Component (scoped) — include ONCE -->
<script>
const DoctorDashboard = (() => {
  const CURRENT_YEAR = new Date().getFullYear();
  const BOOK_COVER = "https://limasy.com/limcms/uploads/products/triumphs-complete-review-of-dentistry-2-volume-set_1709201366_22611.png";

  const DOCTORS = [
    { id:"dhivakaran", name:"Dr Dhivakaran", rating:4.9,
      specialty:"Chief Medical Director, Noble Dental Care · Director, Healthflo",
      expertise:["CMD — Noble Dental Care","Director — Healthflo (557 hospitals)","Networks: Bengaluru, Chennai, Hyderabad, TN, Mumbai, Delhi, Indore, Pune, AP"],
      experience:{startYear:CURRENT_YEAR-10},
      bio:"Dental leader focused on seamless, outcome‑driven care across India via Noble Dental Care and Healthflo.",
      phones:["8610425342","8074512305"],
      consultation:["Walk‑in","Appointment Booking","Tele‑consultation"],
      cities:["Nallagandla","Tellapur","Lingampally","Serilingampally","Gopanpally"],
      books:[{title:"Triumph’s Complete Review of Dentistry (2 Vol Set), Ed. 1",cover:BOOK_COVER,link:"https://play.google.com/store/books/details/Triumph_s_Complete_Review_of_Dentistry?id=ZTjvDwAAQBAJ&hl=en_US&pli=1",publisher:"Wolters Kluwer · Oct 2018"}],
      avatar:"https://i.imgur.com/1X5v8X2.png"},
    { id:"roger", name:"Dr Roger Ronaldo", rating:4.8,
      specialty:"Consultant Oral & Maxillofacial Surgeon — Implantology, Facial Reconstruction",
      expertise:["Implantology","Orthognathic & Reconstruction","Trauma Surgery"],
      experience:{startYear:CURRENT_YEAR-13},
      bio:"Precision implantology and reconstructive care with calm, clear guidance.",
      phones:["8610425342","8074512305"],
      consultation:["Appointment Booking","Tele‑consultation"],
      cities:["Nallagandla","Tellapur","Lingampally"],
      books:[{title:"Triumph’s Complete Review of Dentistry (2 Vol Set), Ed. 1",cover:BOOK_COVER,link:"https://play.google.com/store/books/details/Triumph_s_Complete_Review_of_Dentistry?id=ZTjvDwAAQBAJ&hl=en_US&pli=1",publisher:"Wolters Kluwer · Oct 2018"}],
      avatar:"https://i.imgur.com/7M2Qm1W.png"},
    { id:"thikvijay", name:"Dr Thik Vijay", rating:4.6,
      specialty:"FMC., (Germany) — Trichology, Aesthetic & Medical Cosmetology (ISHR)",
      expertise:["Trichology","Aesthetic & Medical Cosmetology","Hair & Scalp Restoration"],
      experience:{startYear:CURRENT_YEAR-11},
      bio:"Evidence‑based trichology and aesthetic treatments with natural finish.",
      phones:["8610425342","8074512305"],
      consultation:["Appointment Booking","Tele‑consultation"],
      cities:["Lingampally","Serilingampally"],
      books:[], avatar:"https://i.imgur.com/y6w2m8a.png"},
    { id:"deepak", name:"Dr Deepak", rating:4.7,
      specialty:"Orthodontist (Assistant Professor)",
      expertise:["Orthodontics","Smile Design & Aligners","Complex Malocclusion"],
      experience:{startYear:CURRENT_YEAR-10},
      bio:"Academic orthodontist crafting balanced smiles with modern appliances.",
      phones:["8610425342","8074512305"],
      consultation:["Appointment Booking","Tele‑consultation"],
      cities:["Tellapur","Gopanpally"], books:[], avatar:"https://i.imgur.com/1X5v8X2.png"},
    { id:"manoj", name:"Dr Manoj Reddy", rating:4.5,
      specialty:"Oral & Maxillofacial Surgeon — Implantology",
      expertise:["Dental Implants","Maxillofacial Surgery","Full‑mouth Rehab"],
      experience:{startYear:CURRENT_YEAR-9},
      bio:"Implant and maxillofacial care focused on function and long‑term results.",
      phones:["8610425342","8074512305"],
      consultation:["Appointment Booking","Tele‑consultation"],
      cities:["Nallagandla","Serilingampally","Gopanpally"], books:[], avatar:"https://i.imgur.com/7M2Qm1W.png"},
    { id:"idhaya", name:"Dr Idhaya", rating:4.4,
      specialty:"General Dentistry · Health Insurance · Medical Tourism",
      expertise:["Preventive Dentistry","Insurance Advisory","Tourism Coordination"],
      experience:{startYear:CURRENT_YEAR-8},
      bio:"Friendly general dentist guiding families through care, insurance and travel.",
      phones:["8610425342","8074512305"],
      consultation:["Tele‑consultation"],
      cities:["Tellapur","Lingampally"], books:[], avatar:"https://i.imgur.com/y6w2m8a.png"}
  ];

  const qs = (root, sel) => root.querySelector(sel);
  const qsa = (root, sel) => Array.from(root.querySelectorAll(sel));

  const cityLink = (name) => {
    const DIRECT = {
      Nallagandla:"https://maps.app.goo.gl/xWyPi9pwkcM6hjYRA",
      Tellapur:"https://maps.app.goo.gl/uxtsDV7hR6iCp5Uq8",
      Lingampally:"https://maps.app.goo.gl/LQDetRYN3ednqDLn7",
      Serilingampally:"https://maps.app.goo.gl/pLukMFtAPwzdoE9N8",
      Gopanpally:"https://maps.app.goo.gl/EhtpSoxcchtQxG8E9"
    };
    return DIRECT[name] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Best dentist in '+name)}`;
  };
  const experienceLabel = (conf) => conf?.startYear ? `${Math.max(0, new Date().getFullYear() - conf.startYear)} Years`
                                                   : (conf?.baseYears ? `${conf.baseYears} Years` : "Years of Experience");
  const starBadge = (r) => `★ ${r.toFixed(1)}`;
  const starsDetail = (r) => {const f=Math.floor(r), h=r-f>=.5?1:0, e=5-f-h; return "★".repeat(f)+(h?"½":"")+"☆".repeat(e)+`  ${r.toFixed(1)}`;};

  function toLabel(h,m){const p=h>=12?"PM":"AM";const hr=((h+11)%12)+1;return `${hr.toString().padStart(2,"0")}:${m===0?"00":"30"} ${p}`;}
  function labelsEvery30min(start,end,wrap=false){
    const out=[]; const push=(h,m)=>out.push(toLabel(h,m));
    if(!wrap){for(let h=start;h<=end;h++){push(h,0); if(h!==end) push(h,30);}}
    else {for(let h=start;h<=23;h++){push(h,0); if(h<23) push(h,30);} for(let h=0;h<=end;h++){push(h,0); if(h<end) push(h,30);}}
    return out;
  }

  function renderSlots(root){
    const slotsRegularEl = qs(root,'[data-dd="timeSlotsRegular"]');
    const slotsEmergencyEl = qs(root,'[data-dd="timeSlotsEmergency"]');
    const timeSelectEl = qs(root,'[data-dd="timeSelect"]');

    function renderButtons(container, labels, emergency=false){
      container.innerHTML="";
      labels.forEach(lbl=>{
        const b=document.createElement('button');
        b.type='button'; b.className='dd-slot'+(emergency?' dd-slot--emergency':''); b.textContent=lbl;
        b.addEventListener('click',()=>{
          qsa(root,'.dd-slot').forEach(x=>x.classList.remove('dd-active'));
          b.classList.add('dd-active');
          timeSelectEl.value=lbl;
        });
        container.appendChild(b);
      });
    }

    const regular=labelsEvery30min(11,22,false);
    const emergency=labelsEvery30min(22,2,true);
    renderButtons(slotsRegularEl,regular,false);
    renderButtons(slotsEmergencyEl,emergency,true);

    timeSelectEl.innerHTML="";
    [...regular,...emergency].forEach(lbl=>{
      const o=document.createElement('option'); o.value=o.textContent=lbl; timeSelectEl.appendChild(o);
    });
    timeSelectEl.addEventListener('change',()=>{
      const chosen=timeSelectEl.value;
      qsa(root,'.dd-slot').forEach(s=>s.classList.toggle('dd-active', s.textContent===chosen));
    });
    timeSelectEl.selectedIndex=0;
    qs(root,'.dd-slot')?.classList.add('dd-active');
  }

  function fillProfile(root, doc){
    // Header & media
    qs(root,'[data-dd="docAvatar"]').src = doc.avatar;
    qs(root,'[data-dd="docNameTop"]').textContent = doc.name;
    qs(root,'[data-dd="docSpecialtyTop"]').textContent = doc.specialty;
    qs(root,'[data-dd="docRatingPill"]').textContent = starBadge(doc.rating);

    const img = qs(root,'[data-dd="docImage"]');
    img.src = doc.avatar; img.alt = `${doc.name} portrait`;

    // Caption
    qs(root,'[data-dd="docName"]').textContent = doc.name;
    qs(root,'[data-dd="docBio"]').textContent = doc.bio;

    // Facts, cities, phones
    qs(root,'[data-dd="docExperience"]').textContent = `Experience: ${experienceLabel(doc.experience)}`;
    qs(root,'[data-dd="docConsultation"]').textContent = doc.consultation.join(" · ");

    const citiesEl = qs(root,'[data-dd="docCities"]');
    citiesEl.innerHTML = doc.cities.map(c=>`<a class="dd-chip" href="${cityLink(c)}" target="_blank" rel="noopener" title="Best dentist in ${c}">${c}</a>`).join(" ");

    const phonesEl = qs(root,'[data-dd="docPhones"]');
    phonesEl.innerHTML = doc.phones.map(n=>`<a class="dd-chip" href="tel:${n.replace(/\s+/g,'')}">${n}</a>`).join(" ");

    // About + expertise + books
    qs(root,'[data-dd="docBioFull"]').textContent = `${doc.bio} — Rating: ${starsDetail(doc.rating)}`;

    const expList = qs(root,'[data-dd="docExpertise"]');
    expList.innerHTML = ""; doc.expertise.forEach(x=>{const li=document.createElement('li'); li.textContent=x; expList.appendChild(li);});

    const books = qs(root,'[data-dd="docBooks"]');
    books.innerHTML = "";
    if (doc.books.length){
      doc.books.forEach(b=>{
        const tile=document.createElement('div');
        tile.className='dd-book-tile';
        tile.innerHTML = `<img src="${b.cover}" alt="${b.title} cover">
                          <a href="${b.link}" target="_blank" rel="noopener">${b.title}</a>
                          <div class="dd-small">${b.publisher||""}</div>`;
        books.appendChild(tile);
      });
    } else {
      const none=document.createElement('p'); none.className='dd-muted'; none.textContent='No books added yet.'; books.appendChild(none);
    }

    // Quick actions
    qs(root,'[data-dd="callBtn"]').onclick = ()=> window.location.href = `tel:${doc.phones[0]}`;
    qs(root,'[data-dd="callBtnMiddle"]').onclick = ()=> window.location.href = `tel:${doc.phones[0]}`;

    const citiesModal = qs(root,'[data-dd="citiesModal"]');
    const citiesList = qs(root,'[data-dd="citiesList"]');
    const openCities = qs(root,'[data-dd="openCities"]');
    const openMapsBtn = qs(root,'[data-dd="openMapsBtn"]');
    const closeModalBtn = qs(root,'[data-dd="closeModalBtn"]');

    openCities.onclick = ()=>{
      citiesList.innerHTML = "";
      doc.cities.forEach(c=>{
        const li=document.createElement('li');
        li.innerHTML = `<a href="${cityLink(c)}" target="_blank" rel="noopener">${c}</a>`;
        citiesList.appendChild(li);
      });
      openMapsBtn.onclick = ()=> window.open(cityLink(doc.cities[0]),'_blank');
      citiesModal.showModal();
    };
    closeModalBtn.onclick = ()=> citiesModal.close();
  }

  function renderList(root){
    const wrap = qs(root,'[data-dd="doctorsList"]');
    const fallback = qs(root,'[data-dd="listFallback"]');
    wrap.innerHTML = "";
    DOCTORS.forEach(doc=>{
      const card = document.createElement('article');
      card.className = 'dd-card';
      card.dataset.id = doc.id;
      card.innerHTML = `
        <div class="dd-avatar"><img src="${doc.avatar}" alt="${doc.name}"></div>
        <div class="dd-card-body">
          <h3 class="dd-card-title" title="${doc.name}">${doc.name}</h3>
          <div class="dd-card-rating">${starBadge(doc.rating)}</div>
        </div>
        <div class="dd-card-actions">
          <button class="dd-icon-btn" data-action="call" title="Call">Call</button>
          <button class="dd-icon-btn" data-action="map" title="Map">Map</button>
          <button class="dd-icon-btn" data-action="select" title="View">View</button>
        </div>`;
      wrap.appendChild(card);
    });
    fallback.hidden = true;

    // interactions (delegate)
    wrap.addEventListener('click',(e)=>{
      const card = e.target.closest('.dd-card'); if(!card) return;
      const doc = DOCTORS.find(d=>d.id===card.dataset.id); if(!doc) return;

      const act = e.target.dataset.action;
      if (act === 'call'){ window.location.href = `tel:${doc.phones[0]}`; return; }
      if (act === 'map'){
        const modal = qs(root,'[data-dd="citiesModal"]');
        const list  = qs(root,'[data-dd="citiesList"]');
        const btn   = qs(root,'[data-dd="openMapsBtn"]');
        list.innerHTML = doc.cities.map(c=>`<li><a href="${cityLink(c)}" target="_blank" rel="noopener">${c}</a></li>`).join("");
        btn.onclick = ()=> window.open(cityLink(doc.cities[0]),'_blank');
        modal.showModal(); return;
      }
      // select/view
      qs(root,'[data-dd="doctorSelect"]').value = doc.id;
      fillProfile(root, doc);
      toast(root, `${doc.name} selected`);
    });
  }

  function renderSelect(root){
    const sel = qs(root,'[data-dd="doctorSelect"]');
    sel.innerHTML = "";
    DOCTORS.forEach(d=>{ const o=document.createElement('option'); o.value=d.id; o.textContent=d.name; sel.appendChild(o); });
    sel.addEventListener('change', ()=>{
      const d=DOCTORS.find(x=>x.id===sel.value);
      if(d) fillProfile(root,d);
    });
  }

  function toast(root, msg){
    const t = qs(root,'[data-dd="toast"]');
    t.textContent = msg; t.classList.add('dd-show');
    setTimeout(()=>t.classList.remove('dd-show'), 2600);
  }

  function bindConfirm(root){
    const btn = qs(root,'[data-dd="confirmBtn"]');
    btn.addEventListener('click', ()=>{
      const sel = qs(root,'[data-dd="doctorSelect"]');
      const doc = DOCTORS.find(d=>d.id===sel.value);
      const date = qs(root,'[data-dd="appointmentDate"]').value || "";
      const time = qs(root,'[data-dd="timeSelect"]').value || "";
      const name = (qs(root,'[data-dd="patientName"]').value||"").trim();
      const age = (qs(root,'[data-dd="patientAge"]').value||"").trim();
      const type = qs(root,'[data-dd="appointmentType"]').value;
      const notes = (qs(root,'[data-dd="reason"]').value||"").trim();

      if(!doc) return toast(root,"Please select a doctor.");
      if(!name) return toast(root,"Please enter patient name.");
      if(!age) return toast(root,"Please enter age.");
      if(!date||!time) return toast(root,"Please choose date & time.");

      const summary = `Appointment Request
Doctor: ${doc.name}
Type: ${type}
Patient: ${name} (Age ${age})
Date: ${date}
Time: ${time}
Phone(s): ${doc.phones.join(', ')}
City Options: ${doc.cities.join(', ')}

Notes: ${notes}`;

      const subject = `Appointment: ${type} | ${name} | ${date} ${time}`;
      const mailto  = `mailto:dr.dhivakaran@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
      window.open(mailto,'_blank');

      const waNumber="91861425342";
      const waLink=`https://wa.me/${waNumber}?text=${encodeURIComponent("Hello, I'd like to confirm an appointment.\n\n"+summary)}`;
      window.open(waLink,'_blank');

      toast(root,"Appointment info prepared in Email & WhatsApp.");
    });
  }

  function init(selector){
    const root = document.querySelector(selector);
    if(!root){ console.error("DoctorDashboard: root not found:", selector); return; }

    renderSlots(root);
    renderList(root);
    renderSelect(root);

    const first = DOCTORS[0];
    qs(root,'[data-dd="doctorSelect"]').value = first.id;
    fillProfile(root, first);
    bindConfirm(root);
  }

  return { init };
})();
</script>

<script>
  // Initialize after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    DoctorDashboard.init('#doctorDashboard');
  });
</script>
