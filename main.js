/* Main JS for Noble Dental Nallagandla
   - AOS init (if present)
   - Mobile menu (slide-in)
   - Smooth scroll for in-page links
   - Active link highlight on scroll
   - Services search / relevance sort
   - Footer year
   - Accessibility niceties (Esc to close menu, focus trap)
   - Motion preferences for video
*/

(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== AOS init safely =====
  window.addEventListener('load', () => {
    if (window.AOS) {
      AOS.init({ once: true, duration: 700, easing: 'ease-out' });
    }
  });

  // ===== Sticky header helpers =====
  const header = qs('.site-header');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (!header) return;
    header.classList.toggle('elevated', y > 8);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Mobile menu =====
  const nav = qs('.main-nav');
  const menuBtn = qs('.menu-toggle');
  const focusableSel = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let prevFocus = null;

  const openMenu = () => {
    if (!nav) return;
    prevFocus = document.activeElement;
    nav.classList.add('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    // focus first link
    const first = qs(focusableSel, nav);
    if (first) first.focus();
    document.addEventListener('keydown', trapTab, true);
    document.addEventListener('keydown', onEscClose, true);
  };
  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', trapTab, true);
    document.removeEventListener('keydown', onEscClose, true);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };
  const trapTab = (e) => {
    if (!nav?.classList.contains('open')) return;
    if (e.key !== 'Tab') return;
    const nodes = qsa(focusableSel, nav).filter(el => !el.hasAttribute('disabled'));
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  const onEscClose = (e) => {
    if (e.key === 'Escape') closeMenu();
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.contains('open') ? closeMenu() : openMenu();
    });
    // Close menu when clicking a link
    nav.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (target) closeMenu();
    });
  }

  // ===== Smooth scroll for same-page links =====
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

  // ===== Active link highlight on scroll =====
  const sections = qsa('section[id]');
  const navLinks = new Map();
  qsa('.main-nav a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (id) navLinks.set(id, a);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach(link => link.classList.remove('active'));
      const active = navLinks.get(id);
      if (active) active.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sections.forEach(sec => io.observe(sec));

  // ===== Services search / relevance sort =====
  const grid = qs('#servicesGrid');
  const input = qs('#complaintInput');
  const cards = grid ? qsa('.service-card', grid) : [];

  const normalize = (s) => (s || '').toLowerCase();
  const score = (card, q) => {
    if (!q) return 0;
    const blob = `${card.getAttribute('data-keywords') || ''} ${card.textContent}`;
    let sc = 0; q.split(/[\s,]+/).filter(Boolean).forEach(t => { if (normalize(blob).includes(normalize(t))) sc++; });
    return -sc; // negative for asc sort
  };
  const reorder = (query) => {
    if (!grid) return;
    const q = normalize(query);
    const sorted = cards.slice().sort((a,b) => score(a,q) - score(b,q));
    sorted.forEach(card => grid.appendChild(card));
  };
  if (input) {
    // initial order preserved; on input reorder
    input.addEventListener('input', (e) => reorder(e.target.value));
  }

  // ===== Footer year =====
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ===== Motion preferences: pause looping video =====
  const video = qs('.blackhole-video');
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPref = () => {
    if (!video) return;
    if (mediaQuery.matches) { video.pause(); video.removeAttribute('autoplay'); }
    else { if (video.paused) video.play().catch(()=>{}); }
  };
  mediaQuery.addEventListener('change', applyMotionPref);
  applyMotionPref();
})();


<script>
  // Mobile submenu toggle for Specialities
  const specialitiesToggle = document.querySelector('.has-submenu > a');
  const specialitiesItem = document.querySelector('.has-submenu');

  if (specialitiesToggle && specialitiesItem) {
    specialitiesToggle.addEventListener('click', (e) => {
      // Only intercept when in mobile drawer
      const isMobile = window.matchMedia('(max-width: 900px)').matches;
      const navOpen = document.querySelector('.main-nav')?.classList.contains('open');
      if (isMobile || navOpen) {
        e.preventDefault();
        const open = specialitiesItem.classList.toggle('open-submenu');
        specialitiesToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    });
  }
</script>
