<script>
document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     NAVIGATION TOGGLE
  ========================== */
  const menuIcon  = document.querySelector(".menu-icon");
  const navLinks  = document.querySelector(".nav-links");
  const closeIcon = document.querySelector(".close-icon");

  if (menuIcon && navLinks) {
    menuIcon.addEventListener("click", () => navLinks.classList.toggle("active"));
  }
  if (closeIcon && navLinks) {
    closeIcon.addEventListener("click", () => navLinks.classList.remove("active"));
  }

  /* =========================
     TREATMENT FILTERING
  ========================== */
  const searchInput = document.getElementById("treatmentSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      document.querySelectorAll(".service-card").forEach((card) => {
        const keywords = (card.dataset.keywords || "").toLowerCase();
        card.style.display = keywords.includes(query) ? "block" : "none";
      });
    });
  }

  /* =========================
     ANIMATE ON SCROLL (once)
  ========================== */
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

  /* =========================
     "READ MORE" BUTTON LINKS
  ========================== */
  document.querySelectorAll(".service-card").forEach((card) => {
    const button = card.querySelector(".read-more-button");
    const url = card.dataset.url;
    if (button && url) button.setAttribute("href", url);
  });

  /* =========================
     SMOOTH SCROLL FOR HASH LINKS
  ========================== */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* =========================
     OPTIONAL COPY/DLC GUARD
  ========================== */
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && ["a","c","x","v","s","p"].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });
  document.addEventListener("copy", (e) => e.preventDefault());

  /* =========================
     DOCTOR SECTION (two-pane UI)
  ========================== */
  const doctors = [
    { name:"Dr. Dhivakaran R", image:"images/doctors/dhivakaran.jpg", role:"Chief Medical Director", experience:"10 years", patients:"5,000+", rating:"4.9", specialities:"General Dentistry, Diagnostics, Digital Health", summary:"Expert in diagnostics, digital dental care, and patient management.", phone:"8074512305", achiev:"🏅" },
    { name:"Dr. Thik Vijay",   image:"images/doctors/thikvijay.jpg",   role:"Aesthetic Cosmetologist",  experience:"11 years", patients:"3,200+", rating:"4.8", specialities:"Skin, Hair & Dental", summary:"Cosmetologist with expertise in skin, hair, and smile transformations.", phone:"9999999999", achiev:"🏆" },
    { name:"Dr. Roger Ronaldo",image:"images/doctors/roger.jpg",       role:"Maxillofacial Surgeon",    experience:"13 years", patients:"4,800+", rating:"4.9", specialities:"Maxillofacial Surgery", summary:"Surgeon specialized in complex jaw and facial reconstructive procedures.", phone:"8888888888", achiev:"🥇" },
    { name:"Dr. Deepak",       image:"images/doctors/deepak.jpg",      role:"Orthodontist",             experience:"10 years", patients:"4,000+", rating:"4.7", specialities:"Braces, Aligners", summary:"Focused on orthodontics for beautiful, healthy smiles.", phone:"7777777777", achiev:"🎖️" },
    { name:"Dr. Manoj Reddy",  image:"images/doctors/manoj.jpg",       role:"Implantologist",           experience:"13 years", patients:"2,900+", rating:"4.8", specialities:"Dental Implants, Oral Surgery", summary:"Expert in dental implants and restorative oral surgery.", phone:"6666666666", achiev:"🏵️" },
    { name:"Dr. Idhaya",       image:"images/doctors/idhaya.jpg",      role:"Health Insurance Expert",  experience:"7 years",  patients:"2,000+", rating:"4.6", specialities:"Insurance & Claims", summary:"Guiding patients with insurance and treatment claims.", phone:"5555555555", achiev:"🎗️" }
  ];

  const doctorList = document.getElementById("doctorList");
  const doctorProfile = document.getElementById("doctorProfile");

  if (doctorList && doctorProfile) {
    doctorList.innerHTML = doctors.map((doc, idx) => `
      <div class="doctor-card-ui" data-index="${idx}">
        <img src="${doc.image}" class="doctor-avatar-ui" alt="${doc.name}">
        <div class="doc-info-ui">
          <h4>${doc.name}</h4>
          <p>${doc.role}</p>
        </div>
        <span class="rating-ui">★ ${doc.rating}</span>
      </div>
    `).join("");

    const showProfile = (idx) => {
      const d = doctors[idx];
      const html = `
        <img src="${d.image}" class="profile-avatar-ui" alt="${d.name}">
        <div class="profile-name-ui">${d.name}</div>
        <div class="profile-role-ui">${d.role} &bull; ${d.experience}</div>
        <div class="profile-rating-ui">★ ${d.rating}</div>
        <div class="profile-stats-ui">
          <div><div class="stat-val">${d.patients}</div><div class="stat-label">Patients</div></div>
          <div><div class="stat-val">${d.experience}</div><div class="stat-label">Years Exp</div></div>
          <div><div class="stat-val">${d.achiev}</div><div class="stat-label">Achievements</div></div>
        </div>
        <div class="profile-desc-ui">${d.summary}</div>
        <a class="profile-btn-ui" href="tel:${d.phone}">Book Appointment</a>
      `;
      doctorProfile.style.opacity = 0;
      doctorProfile.style.transform = "translateY(30px)";
      setTimeout(() => {
        doctorProfile.innerHTML = html;
        doctorProfile.style.animation = "none";
        setTimeout(() => {
          doctorProfile.style.animation = "";
          doctorProfile.style.opacity = 1;
          doctorProfile.style.transform = "translateY(0)";
        }, 10);
      }, 150);

      document.querySelectorAll(".doctor-card-ui").forEach(c => c.classList.remove("active"));
      const active = doctorList.querySelector(`.doctor-card-ui[data-index="${idx}"]`);
      active && active.classList.add("active");
    };

    showProfile(0);
    doctorList.querySelectorAll(".doctor-card-ui").forEach((card, idx) => {
      card.addEventListener("click", () => showProfile(idx));
    });
  }

/* =========================
   COVERFLOW GALLERY (.cg-*)
========================= */
const cgRoot = document.getElementById('clinic-gallery');
if (cgRoot) {
  const track   = cgRoot.querySelector('.cg-track');
  const items   = [...cgRoot.querySelectorAll('.cg-item')];
  const prevBtn = cgRoot.querySelector('.cg-prev');
  const nextBtn = cgRoot.querySelector('.cg-next');
  const dotsWrap= cgRoot.querySelector('.cg-dots');

  // Dots
  if (dotsWrap) {
    dotsWrap.innerHTML = items.map((_,i)=>`<button aria-label="Go to slide ${i+1}" data-i="${i}"></button>`).join('');
  }
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll('button')] : [];

  let current = 0;
  const visible = [-2,-1,0,1,2];

  function render(){
    items.forEach(el => el.className = 'cg-item');
    items.forEach((el, i) => {
      const wrap = (i - current + items.length) % items.length;
      const shortest = wrap > items.length/2 ? wrap - items.length : wrap; // -N..+N
      if (visible.includes(shortest)) el.classList.add(`cg-pos${shortest}`);
    });
    dots.forEach((d,i)=> d.classList.toggle('active', i === current));
  }

  const next = () => { current = (current + 1) % items.length; render(); };
  const prev = () => { current = (current - 1 + items.length) % items.length; render(); };

  render();
  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);

  dotsWrap?.addEventListener('click', (e)=>{
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    current = +b.dataset.i;
    render();
  });

  // Autoplay + pause on hover / hidden tab
  let timer;
  const start = () => (timer = setInterval(next, 3000));
  const stop  = () => timer && clearInterval(timer);
  start();
  cgRoot.addEventListener('mouseenter', stop);
  cgRoot.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

  // Drag / swipe (parallax feel)
  let dragging = false, sx = 0, dx = 0;
  const onDown = (e) => { dragging = true; dx = 0; sx = (e.touches?e.touches[0].clientX:e.clientX); track.style.transition='none'; };
  const onMove = (e) => {
    if (!dragging) return;
    const x = (e.touches?e.touches[0].clientX:e.clientX);
    dx = x - sx;
    track.style.transform = `translateX(${Math.max(-60, Math.min(60, dx)) * 0.3}px)`;
  };
  const onUp = () => {
    if (!dragging) return;
    track.style.transition=''; track.style.transform='';
    if (dx > 60) prev(); else if (dx < -60) next();
    dragging = false;
  };
  track.addEventListener('mousedown', onDown);
  track.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  track.addEventListener('touchstart', onDown, {passive:true});
  track.addEventListener('touchmove', onMove, {passive:true});
  track.addEventListener('touchend', onUp);

  /* -------- Lightbox (cg-*) -------- */
  const lb       = document.getElementById('cg-lightbox');
  const lbImg    = lb?.querySelector('.cg-lb-img');
  const lbCap    = lb?.querySelector('.cg-lb-caption');
  const lbCanvas = lb?.querySelector('#cg-lb-canvas');
  const lbClose  = lb?.querySelector('.cg-lb-close');
  const lbPrev   = lb?.querySelector('.cg-lb-prev');
  const lbNext   = lb?.querySelector('.cg-lb-next');
  const lbZBtns  = lb ? [...lb.querySelectorAll('.cg-lb-zo')] : [];
  const lbReset  = lb?.querySelector('.cg-lb-reset');

  let scale=1, tx=0, ty=0;
  const apply = () => { if (lbImg) lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; };

  function openLB(i){
    current = i; render();
    const el = items[current];
    const img = el.querySelector('img');
    if (!lb || !lbImg || !lbCap || !img) return;
    lbImg.src = img.src;
    lbCap.textContent = el.dataset.title || img.alt || '';
    lb.classList.remove('cg-hidden');          // IMPORTANT: cg-hidden
    lb.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
    scale=1; tx=0; ty=0; apply();
  }
  function closeLB(){
    if (!lb) return;
    lb.classList.add('cg-hidden');             // IMPORTANT: cg-hidden
    lb.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = '';
  }
  function lbNextFn(){ next(); openLB(current); }
  function lbPrevFn(){ prev(); openLB(current); }

  items.forEach((el,i)=> el.addEventListener('click', ()=> openLB(i)));
  lbClose?.addEventListener('click', closeLB);
  lbNext?.addEventListener('click', lbNextFn);
  lbPrev?.addEventListener('click', lbPrevFn);
  lb?.addEventListener('click', (e)=> { if (e.target === lb) closeLB(); });

  document.addEventListener('keydown', (e)=>{
    if (!lb || lb.classList.contains('cg-hidden')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowRight') lbNextFn();
    if (e.key === 'ArrowLeft')  lbPrevFn();
  });

  lbZBtns.forEach(b => b.addEventListener('click', ()=>{
    const dir = b.dataset.zo === '+' ? 0.2 : -0.2;
    scale = Math.max(1, Math.min(4, scale + dir)); apply();
  }));
  lbReset?.addEventListener('click', ()=> { scale=1; tx=0; ty=0; apply(); });

  lbCanvas?.addEventListener('wheel', (e)=>{
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    const prev = scale;
    scale = Math.max(1, Math.min(4, scale + delta));
    const rect = lbImg.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width/2;
    const cy = e.clientY - rect.top  - rect.height/2;
    tx -= cx * (scale/prev - 1);
    ty -= cy * (scale/prev - 1);
    apply();
  }, {passive:false});

  let pan=false, sxp=0, syp=0;
  lbCanvas?.addEventListener('pointerdown', (e)=>{ pan=true; lbCanvas.setPointerCapture(e.pointerId); sxp=e.clientX - tx; syp=e.clientY - ty; });
  lbCanvas?.addEventListener('pointermove', (e)=>{ if(!pan) return; tx = e.clientX - sxp; ty = e.clientY - syp; apply(); });
  ['pointerup','pointercancel','pointerleave'].forEach(ev=> lbCanvas?.addEventListener(ev, ()=> pan=false));
}

/* =========================
   TESTIMONIAL SLIDER
========================== */
const track   = document.getElementById('ndTestimonialsTrack');
const cards   = track ? [...track.querySelectorAll('.nd-testimonials__card')] : [];
const prevBtn = document.querySelector('.nd-testimonials__nav--prev');
const nextBtn = document.querySelector('.nd-testimonials__nav--next');
const dotsWrap= document.getElementById('ndTestimonialsDots');
if (track && cards.length && dotsWrap) {
  
  // build dots
  dotsWrap.innerHTML = cards.map((_, i) =>
    `<button type="button" aria-label="Go to slide ${i+1}" data-i="${i}"></button>`
  ).join('');
  const dots = [...dotsWrap.querySelectorAll('button')];

  let current = 0;
  let perView = 1;
  let autoplay;

  const updatePerView = () => {
    const w = window.innerWidth;
    perView = w >= 1024 ? 3 : w >= 720 ? 2 : 1;
  };

  const clampIndex = (i) => {
    const maxIndex = Math.max(0, cards.length - perView);
    return Math.min(Math.max(0, i), maxIndex);
  };

  const render = () => {
    const cardWidth = cards[0].getBoundingClientRect().width + 22;
    const x = -(cardWidth * current);
    track.style.transform = `translate3d(${x}px,0,0)`;
    dots.forEach((d, i) => d.setAttribute('aria-current', (i === current) ? 'true' : 'false'));
  };

  const next = () => { current = clampIndex(current + 1); render(); };
  const prev = () => { current = clampIndex(current - 1); render(); };

  updatePerView();
  render();

  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);

  dotsWrap.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    current = clampIndex(+b.dataset.i);
    render();
  });

  const start = () => { autoplay = setInterval(() => {
    const maxIndex = Math.max(0, cards.length - perView);
    current = current >= maxIndex ? 0 : current + 1;
    render();
  }, 3500); };
  const stop  = () => autoplay && clearInterval(autoplay);
  start();

  const viewport = document.querySelector('.nd-testimonials__viewport');
  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

  let dragging = false, sx = 0, dx = 0, baseX = 0;
  viewport.addEventListener('mousedown', (e) => {
    dragging = true; sx = e.clientX; dx = 0;
    baseX = parseFloat(getComputedStyle(track).transform.split(',')[4]) || 0;
    track.style.transition = 'none';
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    dx = e.clientX - sx;
    track.style.transform = `translate3d(${baseX + dx}px,0,0)`;
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    track.style.transition = '';
    if (dx > 60) prev(); else if (dx < -60) next(); else render();
    dragging = false;
  });
  viewport.addEventListener('touchstart', (e) => {
    dragging = true; sx = e.touches[0].clientX; dx = 0;
    baseX = parseFloat(getComputedStyle(track).transform.split(',')[4]) || 0;
    track.style.transition = 'none';
  }, { passive: true });
  viewport.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    dx = e.touches[0].clientX - sx;
    track.style.transform = `translate3d(${baseX + dx}px,0,0)`;
  }, { passive: true });
  viewport.addEventListener('touchend', () => {
    if (!dragging) return;
    track.style.transition = '';
    if (dx > 50) prev(); else if (dx < -50) next(); else render();
    dragging = false;
  });

  window.addEventListener('resize', () => {
    const oldPerView = perView;
    updatePerView();
    if (oldPerView !== perView) {
      current = clampIndex(current);
      render()
    } else {
      render();
    }
  });

  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });
}
</script>
