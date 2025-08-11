<script>
/* Main JS for Noble Dental Nallagandla */
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

  /* ========== Specialities dropdown (desktop hover via CSS; mobile tap here) ========== */
  const spItem   = qs('.has-submenu');
  const spToggle = qs('.has-submenu > a');
  const isTouchMode = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

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
  qsa('.main-nav a[href^="#"]').forEach(a => { const id = a.getAttribute('href'); if (id) navLinks.set(id, a); });
  if (sections.length && navLinks.size) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach(link => link.classList.remove('active'));
        navLinks.get(id)?.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(sec => io.observe(sec));
    window.addEventListener('beforeunload', () => io.disconnect());
  }

  /* ========== Services filter + relevance ranking (top 9) ========== */
  const grid         = qs('#servicesGrid');
  const searchInput  = qs('#complaintInput');
  const selectFilter = qs('#serviceFilter');
  const chipBar      = qs('.filter-chips');

  if (grid) {
    const cards = qsa('.service-card', grid);
    cards.forEach((c, i) => (c.dataset.initialIndex ??= String(i)));

    const getActiveFilter = () => (selectFilter?.value || 'all');
    const setActiveChip = (val) => {
      if (!chipBar) return;
      chipBar.querySelectorAll('.chip').forEach(ch => {
        const isActive = (ch.dataset.filter || 'all') === val;
        ch.classList.toggle('is-active', isActive);
        ch.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };
    const normalize = (s) => (s || '').toLowerCase();

    const scoreCard = (card, q) => {
      if (!q) return 0;
      const title = card.querySelector('h3')?.textContent || '';
      const kw    = card.getAttribute('data-keywords') || '';
      const body  = card.querySelector('.text-section')?.textContent || '';
      const tags  = card.getAttribute('data-tags') || '';

      const hayTitle = normalize(title);
      const hayKw    = normalize(kw + ' ' + tags);
      const hayBody  = normalize(body);

      let s = 0;
      const terms = q.split(/[\s,]+/).filter(Boolean).map(normalize);
      for (const t of terms) {
        if (hayTitle.includes(t)) s += 6;
        if (hayKw.includes(t))    s += 3;
        if (hayBody.includes(t))  s += 1;
      }
      return s;
    };

    const matchesFilter = (card, filterVal) => {
      if (!filterVal || filterVal === 'all') return true;
      const tags = (card.getAttribute('data-tags') || '').toLowerCase().split(/\s+/);
      return tags.includes(filterVal.toLowerCase());
    };

    const applyFilters = () => {
      const q = normalize(searchInput?.value || '');
      const f = getActiveFilter();

      const ranked = cards
        .map(card => ({ card, score: scoreCard(card, q) }))
        .filter(({ card }) => matchesFilter(card, f))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const pa = Number(a.card.getAttribute('data-priority') || 999);
          const pb = Number(b.card.getAttribute('data-priority') || 999);
          if (pa !== pb) return pa - pb;
          return Number(a.card.dataset.initialIndex) - Number(b.card.dataset.initialIndex);
        });

      const top = ranked.slice(0, 9).map(r => r.card);
      const topSet = new Set(top);

      // Show/hide
      cards.forEach(c => { c.style.display = topSet.has(c) ? '' : 'none'; });

      // Move top visually
      top.forEach(c => grid.appendChild(c));
    };

    // Events
    selectFilter?.addEventListener('change', (e) => {
      setActiveChip(e.target.value);
      applyFilters();
    });
    chipBar?.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      const val = btn.dataset.filter || 'all';
      if (selectFilter) selectFilter.value = val;
      setActiveChip(val);
      applyFilters();
    });
    searchInput?.addEventListener('input', applyFilters);

    // Init
    setActiveChip(getActiveFilter());
    applyFilters();
  }

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
</script>
