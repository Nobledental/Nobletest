/* Main JS for Noble Dental Nallagandla
   - AOS init (if present)
   - Sticky header elevation
   - Mobile menu (slide-in) + focus trap + Esc/outside click + body scroll lock
   - Specialities dropdown (desktop hover / mobile tap)
   - Smooth scroll for in-page links with fixed-header offset
   - Active link highlight on scroll (robust IO)
   - Services search / relevance sort (stable, debounced) + card click
   - Footer year
   - Motion preferences for video (with Safari fallback)
*/
(() => {
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ========== AOS init (safe) ========== */
  window.addEventListener('load', () => {
    if (window.AOS) AOS.init({ once: true, duration: 700, easing: 'ease-out' });
  });

  /* ========== Sticky header elevation ========== */
  const header = qs('.site-header');
  const onScroll = () => header?.classList.toggle('elevated', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ========== Mobile menu (drawer) ========== */
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
    document.body.classList.add('nav-open');            // lock background scroll
    menuBtn?.setAttribute('aria-expanded', 'true');
    (qs(focusSel, nav) || nav).focus();
    document.addEventListener('keydown', trapTab, true);
    document.addEventListener('keydown', onEscClose, true);
  };
  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');         // unlock background scroll
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', trapTab, true);
    document.removeEventListener('keydown', onEscClose, true);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => (nav.classList.contains('open') ? closeMenu() : openMenu()));

    // Close on link click (drawer)
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

  /* ========== Specialities dropdown ========== */
  const spItem   = qs('.has-submenu');
  const spToggle = qs('.has-submenu > a'); // has aria-expanded + aria-controls

  // Detect touch/pen (Android/iOS tablets/phones)
  const isTouchMode = () =>
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const toggleSubmenu = (open) => {
    if (!spItem || !spToggle) return;
    const willOpen = (typeof open === 'boolean') ? open : !spItem.classList.contains('open-submenu');
    spItem.classList.toggle('open-submenu', willOpen);
    spToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  };

  if (spItem && spToggle) {
    // Tap to open on mobile / when drawer is open
    spToggle.addEventListener('click', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (isTouchMode() || drawerOpen) {
        e.preventDefault(); // prevent navigating parent link
        toggleSubmenu();
      }
    });

    // Keyboard support (Space/Enter) in mobile context
    spToggle.addEventListener('keydown', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (!(isTouchMode() || drawerOpen)) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleSubmenu();
      }
    });

    // Close submenu on outside tap in mobile context
    document.addEventListener('click', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (!(isTouchMode() || drawerOpen)) return;
      const inside = spItem.contains(e.target);
      if (!inside) toggleSubmenu(false);
    });

    // Close on Esc
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleSubmenu(false); });

    // Reset on resize/orientation change so desktop hover can take over
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => toggleSubmenu(false), 120);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
  }

  /* ========== Smooth scroll for same-page links (offset for fixed header) ========== */
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
      // If user came from the drawer, close it
      if (nav?.classList.contains('open')) closeMenu();
    });
  });

  /* ========== Active link highlight on scroll ========== */
  const sections = qsa('section[id]');
  const navLinks = new Map();
  qsa('.main-nav a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (id) navLinks.set(id, a);
  });

  if (sections.length && navLinks.size) {
    const io = new IntersectionObserver((entries) => {
      // pick the entry with the highest intersection ratio
      const best = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!best) return;
      const id = `#${best.target.id}`;
      navLinks.forEach(link => link.classList.remove('active'));
      const active = navLinks.get(id);
      if (active) active.classList.add('active');
    }, { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

    sections.forEach(sec => io.observe(sec));
    window.addEventListener('pagehide', () => io.disconnect());
  }

 /* ===== Services 2025 logic (6-per-page, search + filter, Android states) ===== */
(() => {
  const $ = (s, r=document)=>r.querySelector(s);
  const $$= (s, r=document)=>Array.from(r.querySelectorAll(s));

  // ---------- Data (extend freely) ----------
  /** tip: image can be local CDN; using placeholders for demo */
  const TREATMENTS = [
    // Tooth Alignment
    {id:'braces', title:'Braces & Aligners', category:'Tooth Alignment',
      keywords:'braces aligners orthodontics tooth alignment crooked bite dhriti invisalign',
      desc:'Metal braces and certified clear aligners (including Invisalign) for a confident, aligned smile.',
      url:'/specialities/braces.html', img:'https://via.placeholder.com/800x500?text=Braces+%26+Aligners'},
    {id:'invisalign', title:'Invisalign / Clear Aligners', category:'Tooth Alignment',
      keywords:'invisible orthodontics clear aligners inman aligners esthetics teen adult',
      desc:'Nearly invisible trays to straighten teeth with comfort and flexibility for busy schedules.',
      url:'/specialities/invisalign.html', img:'https://via.placeholder.com/800x500?text=Clear+Aligners'},
    {id:'orthodontics', title:'Orthodontic Treatment', category:'Tooth Alignment',
      keywords:'crowded teeth forward teeth bite correction jaw growth orthodontist',
      desc:'Diagnosis and correction of dentofacial irregularities—crowding, spacing, and bite issues.',
      url:'/specialities/braces.html', img:'https://via.placeholder.com/800x500?text=Orthodontics'},

    // Tooth Saving
    {id:'rct', title:'Root Canal Treatment', category:'Tooth Saving',
      keywords:'root canal pain infection decay sensitivity endodontic save tooth',
      desc:'Removes infected tissue, relieves pain, and saves your natural tooth with precise care.',
      url:'/specialities/root-canal.html', img:'https://via.placeholder.com/800x500?text=Root+Canal+Treatment'},
    {id:'fillings', title:'Restorations & Fillings', category:'Tooth Saving',
      keywords:'filling composite gic caries cavity restoration inlays onlays',
      desc:'Tooth-coloured composite fillings and aesthetic restorations to restore form & function.',
      url:'/specialities/fillings.html', img:'https://via.placeholder.com/800x500?text=Tooth+Fillings'},
    {id:'trauma', title:'Dental Trauma Care', category:'Tooth Saving',
      keywords:'fracture knocked tooth emergency splinting pain',
      desc:'Rapid management for chipped, fractured, or avulsed teeth to maximize tooth survival.',
      url:'/specialities/emergency.html', img:'https://via.placeholder.com/800x500?text=Dental+Trauma'},

    // Implants & Replacement
    {id:'implants', title:'Dental Implants', category:'Implants & Replacement',
      keywords:'dental implants titanium tooth replacement missing teeth crown bridge',
      desc:'Titanium implants replace missing roots and support natural-looking crowns or bridges.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Dental+Implants'},
    {id:'all-on-4', title:'All-on-4® Full Arch', category:'Implants & Replacement',
      keywords:'all on 4 fixed teeth full arch immediate loading',
      desc:'4 implants supporting a full-arch fixed bridge—confidence and comfort restored.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=All-on-4'},
    {id:'zygomatic', title:'Zygoma Implants', category:'Implants & Replacement',
      keywords:'zygomatic implant atrophic maxilla no bone graft',
      desc:'For severe upper-jaw bone loss—zygomatic anchorage avoids hipbone grafts.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Zygoma+Implants'},
    {id:'sinus-lift', title:'Sinus Lift Surgery', category:'Implants & Replacement',
      keywords:'sinus lift augmentation graft posterior maxilla',
      desc:'Adds bone in the upper jaw to enable predictable implant placement.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Sinus+Lift'},
    {id:'semi-fixed-dentures', title:'Semi-fixed Dentures (Overdentures)', category:'Implants & Replacement',
      keywords:'overdenture locator implant denture stability',
      desc:'Implant-retained dentures provide excellent fit and confidence in daily use.',
      url:'/specialities/dentures.html', img:'https://via.placeholder.com/800x500?text=Overdenture'},
    {id:'crowns-bridges', title:'Crowns & Bridges', category:'Implants & Replacement',
      keywords:'crown bridge fixed artificial teeth prosthodontics',
      desc:'Strengthen damaged teeth or replace missing ones with precise fixed prosthetics.',
      url:'/specialities/crowns-bridges.html', img:'https://via.placeholder.com/800x500?text=Crowns+%26+Bridges'},
    {id:'dentures', title:'Dentures (Removable & Implant-supported)', category:'Implants & Replacement',
      keywords:'complete denture partial cast metal flexible implant supported',
      desc:'Acrylic, cast-metal, flexible, and implant-supported options for comfort and function.',
      url:'/specialities/dentures.html', img:'https://via.placeholder.com/800x500?text=Dentures'},
    {id:'bone-graft', title:'Bone Grafting', category:'Implants & Replacement',
      keywords:'grafting ridge preservation augmentation',
      desc:'Builds support where bone is thin—improving long-term implant success.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Bone+Grafting'},

    // Cosmetic & Smile
    {id:'smile-makeover', title:'Smile Makeover', category:'Cosmetic & Smile',
      keywords:'veneers whitening bonding esthetics celebrity smile smile design',
      desc:'Customized combo—veneers, whitening & alignment—for a radiant, confident smile.',
      url:'/specialities/smile-design.html', img:'https://via.placeholder.com/800x500?text=Smile+Makeover'},
    {id:'veneers', title:'Dental Veneers', category:'Cosmetic & Smile',
      keywords:'porcelain laminate veneer minimal prep esthetic',
      desc:'Ultra-thin shells to refine shape, colour, and symmetry with minimal prep.',
      url:'/specialities/smile-design.html', img:'https://via.placeholder.com/800x500?text=Veneers'},
    {id:'whitening', title:'Teeth Whitening', category:'Cosmetic & Smile',
      keywords:'bleaching whitening stains colour shade',
      desc:'Safe, effective brightening—clinic power whitening or guided take-home kits.',
      url:'/specialities/scaling-whitening.html', img:'https://via.placeholder.com/800x500?text=Teeth+Whitening'},
    {id:'gum-depig', title:'Gum Depigmentation', category:'Cosmetic & Smile',
      keywords:'dark gums laser depigmentation esthetic pink gums',
      desc:'Laser-assisted lightening for uniformly pink, healthy-looking gums.',
      url:'/specialities/gum-surgeries.html', img:'https://via.placeholder.com/800x500?text=Gum+Depigmentation'},
    {id:'laser-dentistry', title:'Laser Dentistry', category:'Cosmetic & Smile',
      keywords:'laser minimally invasive soft tissue healing',
      desc:'From gum contouring to ulcer relief—gentle, precise and quick healing.',
      url:'/specialities/gum-surgeries.html', img:'https://via.placeholder.com/800x500?text=Laser+Dentistry'},

    // Oral Surgery
    {id:'wisdom', title:'Wisdom Tooth Extractions', category:'Oral Surgery',
      keywords:'third molar surgical extraction pain swelling impaction',
      desc:'Removes painful/impacted third molars—prevents decay, gum inflammation, crowding.',
      url:'/specialities/extraction.html', img:'https://via.placeholder.com/800x500?text=Wisdom+Tooth+Extraction'},
    {id:'orthognathic', title:'Corrective Jaw (Orthognathic) Surgery', category:'Oral Surgery',
      keywords:'jaw surgery bite correction profile tmj skeletal',
      desc:'Improves bite, function and facial balance when jaw positions need correction.',
      url:'/specialities/face-surgery.html', img:'https://via.placeholder.com/800x500?text=Jaw+Surgery'},

    // Kids & Family
    {id:'peds', title:'Pediatric Dentistry', category:'Kids & Family',
      keywords:'kids child care pulpectomy crown sealants fluoride',
      desc:'Kid-friendly care: sealants, fillings, pulpectomy & crowns in a comforting setting.',
      url:'/specialities/kids-dentistry.html', img:'https://via.placeholder.com/800x500?text=Pediatric+Dentistry'},
    {id:'sealants', title:'Pit & Fissure Sealants', category:'Kids & Family',
      keywords:'preventive sealant cavity decay kids',
      desc:'Protective coating for cavity-prone grooves—simple, painless prevention.',
      url:'/specialities/kids-dentistry.html', img:'https://via.placeholder.com/800x500?text=Sealants'},

    // Periodontics
    {id:'scaling', title:'Scaling & Polishing', category:'Periodontics',
      keywords:'cleaning prophylaxis tartar plaque gum health fresh breath',
      desc:'Removes plaque & tartar above/below gumline and finishes with a smooth polish.',
      url:'/specialities/scaling-whitening.html', img:'https://via.placeholder.com/800x500?text=Scaling+%26+Polishing'},
    {id:'gum-treat', title:'Gum Treatment', category:'Periodontics',
      keywords:'gingivitis periodontitis deep cleaning flap surgery pockets',
      desc:'Treats gum inflammation & bone loss—deep cleaning to regenerative surgery.',
      url:'/specialities/gum-surgeries.html', img:'https://via.placeholder.com/800x500?text=Gum+Treatment'},

    // Diagnostics
    {id:'ct-scan', title:'Dental CT Scan (CBCT)', category:'Diagnostics',
      keywords:'3d scan cbct implant planning endodontics tmj',
      desc:'3D imaging for precise diagnosis & surgical planning—see roots, nerves & bone clearly.',
      url:'/specialities/diagnostics.html', img:'https://via.placeholder.com/800x500?text=Dental+CT+Scan'},
    {id:'cancer-screen', title:'Oral Cancer Screening', category:'Diagnostics',
      keywords:'early detection oral cancer surgeon checkup',
      desc:'Early detection saves lives—routine screening by our maxillofacial specialist.',
      url:'/specialities/oral-cancer.html', img:'https://via.placeholder.com/800x500?text=Oral+Cancer+Screening'},

    // Sedation & Sleep
    {id:'iv-sedation', title:'IV Sedation (Conscious)', category:'Sedation & Sleep',
      keywords:'iv sedation twilight sleep dentistry anxious phobia day care',
      desc:'Relaxed, semi-awake care with amnesia—ideal for long or anxiety-provoking visits.',
      url:'/specialities/sedation.html', img:'https://via.placeholder.com/800x500?text=IV+Sedation'},
    {id:'general-anesthesia', title:'General Anesthesia (Pediatric/Select Cases)', category:'Sedation & Sleep',
      keywords:'general anesthesia pediatric special needs hospital day care',
      desc:'One-visit completion for extensive pediatric/special cases under hospital settings.',
      url:'/specialities/sedation.html', img:'https://via.placeholder.com/800x500?text=General+Anesthesia'},
    {id:'sleep-dentistry', title:'Snoring Remedies & Sleep Dentistry', category:'Sedation & Sleep',
      keywords:'snoring osa splints sleep apnea',
      desc:'Custom oral appliances and care pathways for snoring and obstructive sleep apnea.',
      url:'/specialities/sleep-dentistry.html', img:'https://via.placeholder.com/800x500?text=Sleep+Dentistry'},

    // Special Care
    {id:'pregnancy', title:'Pregnancy Dental Care', category:'Special Care',
      keywords:'pregnancy trimester safe care preventive',
      desc:'Trimester-wise safe protocols for mom & baby—preventive and urgent care.',
      url:'/specialities/pregnancy-dental-care.html', img:'https://via.placeholder.com/800x500?text=Pregnancy+Dental+Care'},
    {id:'diabetic', title:'Diabetic Dental Care', category:'Special Care',
      keywords:'diabetes perio infection healing sugar control',
      desc:'Gum-systemic link management: tailored cleanings, infection control & healing support.',
      url:'/specialities/diabetic-dental-care.html', img:'https://via.placeholder.com/800x500?text=Diabetic+Dental+Care'},
    {id:'geriatric', title:'Geriatric Dentistry', category:'Special Care',
      keywords:'elderly dentures dry mouth root caries caregiver',
      desc:'Comfort-first care for seniors—denture tuning, root-caries prevention & home tips.',
      url:'/specialities/geriatric.html', img:'https://via.placeholder.com/800x500?text=Geriatric+Dentistry'},
    {id:'home-care', title:'Home Dental Care', category:'Special Care',
      keywords:'home visit bedside immobilized special needs',
      desc:'Clinical-grade care at home for immobile/special-needs patients (by appointment).',
      url:'/specialities/home-care.html', img:'https://via.placeholder.com/800x500?text=Home+Dental+Care'}
  ];

  // ---------- DOM ----------
  const grid = $('#treatmentsGrid');
  const status = $('#treatmentsStatus');
  const search = $('#svcSearch');
  const catSel = $('#svcCategory');
  const chipRow = $$('.chip');
  const prevBtn = $('#pgPrev');
  const nextBtn = $('#pgNext');
  const dots = $('#pgDots');

  // ---------- Config ----------
  const PAGE_SIZE = 6;

  // ---------- Utils ----------
  const norm = s => (s||'').toLowerCase();
  const scoreItem = (it, q, cat) => {
    if (!q && (cat==='all' || cat===it.category)) return 0.0001; // keep stable order
    const hay = `${it.title} ${it.keywords} ${it.desc} ${it.category}`.toLowerCase();
    const terms = q.split(/[\s,]+/).filter(Boolean).map(norm);
    let score = 0;
    // weights
    terms.forEach(t=>{
      if (norm(it.title).includes(t)) score += 5;
      if (norm(it.keywords).includes(t)) score += 3;
      if (norm(it.desc).includes(t)) score += 1;
    });
    if (cat !== 'all' && it.category === cat) score += 2;
    return score;
  };

  const paginate = (arr, page, size) => {
    const start = (page-1)*size;
    return arr.slice(start, start+size);
  };

  // ---------- State ----------
  let filtered = TREATMENTS.slice();
  let page = 1;

  // ---------- Render ----------
  function renderGrid(){
    grid.setAttribute('aria-busy','true');
    grid.innerHTML = '';
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > pageCount) page = pageCount;

    const items = paginate(filtered, page, PAGE_SIZE);
    if (!items.length){
      status.textContent = 'No treatments match your search. Try broader terms (e.g., “implants”, “pain”, “kids”).';
      dots.innerHTML = ''; prevBtn.disabled = nextBtn.disabled = true;
      grid.setAttribute('aria-busy','false');
      return;
    }

    status.textContent = `${filtered.length} result${filtered.length>1?'s':''} — page ${page} of ${pageCount}`;

    // Cards
    const frag = document.createDocumentFragment();
    items.forEach(it=>{
      const card = document.createElement('article');
      card.className = 't-card ripple';
      card.setAttribute('data-id', it.id);
      card.innerHTML = `
        <div class="t-media">
          <span class="t-badge">${it.category}</span>
          <img loading="lazy" src="${it.img}" alt="${it.title}">
        </div>
        <div class="t-body">
          <h3 class="t-title">${it.title}</h3>
          <p class="t-desc">${it.desc}</p>
          <div class="t-meta"><i class='bx bx-check-shield'></i> Dhriti Dental</div>
          <div class="t-actions">
            <a class="t-btn" href="${it.url}"><i class='bx bx-info-circle'></i> Learn more</a>
            <a class="t-btn secondary" href="tel:+918610425342"><i class='bx bxs-phone' ></i> Call</a>
          </div>
        </div>
      `;
      // ripple origin (Android feel)
      card.addEventListener('pointerdown', (e)=>{
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--ripple-x', ((e.clientX-rect.left)/rect.width*100)+'%');
        card.style.setProperty('--ripple-y', ((e.clientY-rect.top)/rect.height*100)+'%');
      });
      frag.appendChild(card);
    });
    grid.appendChild(frag);

    // Pagination UI
    renderPagination(pageCount);
    grid.setAttribute('aria-busy','false');
  }

  function renderPagination(pageCount){
    prevBtn.disabled = page<=1;
    nextBtn.disabled = page>=pageCount;
    dots.innerHTML = '';
    for (let i=1;i<=pageCount;i++){
      const dot = document.createElement('button');
      dot.className = 'pg-dot';
      dot.type = 'button';
      dot.setAttribute('role','listitem');
      if (i===page) dot.setAttribute('aria-current','page');
      dot.addEventListener('click', ()=>{ page=i; renderGrid(); window.scrollTo({top: grid.offsetTop-120, behavior:'smooth'}); });
      dots.appendChild(dot);
    }
  }

  // ---------- Filter / Search ----------
  const apply = ()=>{
    const q = norm(search.value);
    const cat = catSel.value;
    const pool = (cat==='all') ? TREATMENTS.slice() : TREATMENTS.filter(it=>it.category===cat);
    if (!q){
      filtered = pool; // no sort necessary, keep source order
    } else {
      filtered = pool
        .map(it=>({it, s: scoreItem(it,q,cat)}))
        .filter(x=>x.s>0)
        .sort((a,b)=> b.s - a.s || a.it.title.localeCompare(b.it.title))
        .map(x=>x.it);
    }
    page = 1;
    renderGrid();
  };

  // Debounce search input
  let t;
  search?.addEventListener('input', ()=>{
    clearTimeout(t); t = setTimeout(apply, 160);
  });
  catSel?.addEventListener('change', apply);
  // Chips set search and/or category quickly
  chipRow.forEach(ch => ch.addEventListener('click', ()=>{
    search.value = ch.dataset.chip || '';
    apply();
    search.focus();
  }));

  // Pagination events
  prevBtn?.addEventListener('click', ()=>{ if (page>1){ page--; renderGrid(); } });
  nextBtn?.addEventListener('click', ()=>{ const pages=Math.ceil(filtered.length/PAGE_SIZE); if (page<pages){ page++; renderGrid(); } });

  // Init
  apply();
})();

  /* ========== Footer year ========== */
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ========== Motion preferences for video (w/ Safari fallback) ========== */
  const video = qs('.blackhole-video');
  const mq    = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPref = () => {
    if (!video) return;
    if (mq.matches) { video.pause(); video.removeAttribute('autoplay'); }
    else { if (video.paused) video.play().catch(() => {}); }
  };
  if (mq.addEventListener) mq.addEventListener('change', applyMotionPref);
  else if (mq.addListener) mq.addListener(applyMotionPref); // Safari <14
  applyMotionPref();
})();
