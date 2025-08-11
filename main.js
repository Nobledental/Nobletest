/* Main JS for Noble Dental Nallagandla
   - AOS init (if present)
   - Sticky header elevation
   - Mobile menu (slide-in) + focus trap + Esc/outside click
   - Specialities dropdown (desktop hover / mobile tap)
   - Smooth scroll for in-page links
   - Active link highlight on scroll
   - Services search / relevance sort (stable)
   - Footer year
   - Motion preferences for video
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
    menuBtn?.setAttribute('aria-expanded', 'true');
    qs(focusSel, nav)?.focus();
    document.addEventListener('keydown', trapTab, true);
    document.addEventListener('keydown', onEscClose, true);
  };
  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove('open');
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

  /* ========== Smooth scroll for same-page links ========== */
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.startsWith('#!')) return;
      const el = qs(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
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
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = #${entry.target.id};
        navLinks.forEach(link => link.classList.remove('active'));
        const active = navLinks.get(id);
        if (active) active.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(sec => io.observe(sec));
    window.addEventListener('beforeunload', () => io.disconnect());
  }

  /* ========== Services search / relevance sort (stable) ========== */
  const grid  = qs('#servicesGrid');
  const input = qs('#complaintInput');
  const cards = grid ? qsa('.service-card', grid) : [];
  cards.forEach((c, i) => c.dataset.initialIndex = String(i)); // stable baseline

  const normalize = (s) => (s || '').toLowerCase();
  const relevance = (card, q) => {
    if (!q) return 0;
    const blob = ${card.getAttribute('data-keywords') || ''} ${card.textContent};
    let score = 0;
    q.split(/[\s,]+/).filter(Boolean).forEach(t => {
      if (normalize(blob).includes(normalize(t))) score++;
    });
    return score;
  };
  const reorder = (query) => {
    if (!grid) return;
    const q = normalize(query);
    const sorted = cards.slice().sort((a, b) => {
      const sa = relevance(a, q);
      const sb = relevance(b, q);
      if (sa === sb) return Number(a.dataset.initialIndex) - Number(b.dataset.initialIndex);
      return sb - sa; // higher first
    });
    sorted.forEach(card => grid.appendChild(card));
  };
  input?.addEventListener('input', (e) => reorder(e.target.value));


   
  /* ========== Footer year ========== */
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ========== Motion preferences for video ========== */
  const video = qs('.blackhole-video');
  const mq    = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPref = () => {
    if (!video) return;
    if (mq.matches) { video.pause(); video.removeAttribute('autoplay'); }
    else { if (video.paused) video.play().catch(() => {}); }
  };
  mq.addEventListener('change', applyMotionPref);
  applyMotionPref();
})();
