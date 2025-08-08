<script>
document.addEventListener("DOMContentLoaded", () => {
  // ========= NAVIGATION TOGGLE =========
  const menuIcon = document.querySelector(".menu-icon");
  const navLinks = document.querySelector(".nav-links");
  const closeIcon = document.querySelector(".close-icon");

  if (menuIcon && navLinks) {
    menuIcon.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }
  if (closeIcon && navLinks) {
    closeIcon.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  }

  // ========= TREATMENT FILTERING FUNCTION =========
  const searchInput = document.getElementById("treatmentSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const cards = document.querySelectorAll(".service-card");

      cards.forEach((card) => {
        const keywords = card.dataset.keywords?.toLowerCase() || "";
        card.style.display = keywords.includes(query) ? "block" : "none";
      });
    });
  }

  // ========= ANIMATE ON SCROLL =========
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.1 }
  );
  const animatedElements = document.querySelectorAll(".animate-on-scroll");
  animatedElements.forEach((el) => observer.observe(el));

  // ========= READ MORE BUTTON LOGIC =========
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card) => {
    const button = card.querySelector(".read-more-button");
    const url = card.dataset.url;
    if (button && url) {
      button.setAttribute("href", url);
    }
  });

  // ========= SMOOTH SCROLL FOR NAV LINKS =========
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  scrollLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ========= DISABLE RIGHT CLICK / COPY =========
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "x", "v", "s", "p"].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }
  });
  document.addEventListener("copy", (e) => e.preventDefault());

  // ========= DOCTOR SECTION LOGIC =========
  const doctors = [
    {
      name: "Dr. Dhivakaran R",
      image: "images/doctors/dhivakaran.jpg",
      role: "Chief Medical Director",
      experience: "10 years",
      patients: "5,000+",
      rating: "4.9",
      specialities: "General Dentistry, Diagnostics, Digital Health",
      summary: "Expert in diagnostics, digital dental care, and patient management.",
      phone: "8074512305",
      achiev: "🏅",
    },
    {
      name: "Dr. Thik Vijay",
      image: "images/doctors/thikvijay.jpg",
      role: "Aesthetic Cosmetologist",
      experience: "11 years",
      patients: "3,200+",
      rating: "4.8",
      specialities: "Skin, Hair & Dental",
      summary: "Cosmetologist with expertise in skin, hair, and smile transformations.",
      phone: "9999999999",
      achiev: "🏆",
    },
    {
      name: "Dr. Roger Ronaldo",
      image: "images/doctors/roger.jpg",
      role: "Maxillofacial Surgeon",
      experience: "13 years",
      patients: "4,800+",
      rating: "4.9",
      specialities: "Maxillofacial Surgery",
      summary: "Surgeon specialized in complex jaw and facial reconstructive procedures.",
      phone: "8888888888",
      achiev: "🥇",
    },
    {
      name: "Dr. Deepak",
      image: "images/doctors/deepak.jpg",
      role: "Orthodontist",
      experience: "10 years",
      patients: "4,000+",
      rating: "4.7",
      specialities: "Braces, Aligners",
      summary: "Focused on orthodontics for beautiful, healthy smiles.",
      phone: "7777777777",
      achiev: "🎖️",
    },
    {
      name: "Dr. Manoj Reddy",
      image: "images/doctors/manoj.jpg",
      role: "Implantologist",
      experience: "13 years",
      patients: "2,900+",
      rating: "4.8",
      specialities: "Dental Implants, Oral Surgery",
      summary: "Expert in dental implants and restorative oral surgery.",
      phone: "6666666666",
      achiev: "🏵️",
    },
    {
      name: "Dr. Idhaya",
      image: "images/doctors/idhaya.jpg",
      role: "Health Insurance Expert",
      experience: "7 years",
      patients: "2,000+",
      rating: "4.6",
      specialities: "Insurance & Claims",
      summary: "Guiding patients with insurance and treatment claims.",
      phone: "5555555555",
      achiev: "🎗️",
    },
  ];

  // Create Doctor List
  const doctorList = document.getElementById('doctorList');
  if (doctorList) {
    doctorList.innerHTML = doctors.map((doc, idx) => `
      <div class="doctor-card-ui" data-index="${idx}">
        <img src="${doc.image}" class="doctor-avatar-ui" alt="${doc.name}" />
        <div class="doc-info-ui">
          <h4>${doc.name}</h4>
          <p>${doc.role}</p>
        </div>
        <span class="rating-ui">★ ${doc.rating}</span>
      </div>
    `).join('');

    // Show profile for selected doctor
    function showProfile(idx) {
      const d = doctors[idx];
      const profile = `
        <img src="${d.image}" class="profile-avatar-ui" alt="${d.name}">
        <div class="profile-name-ui">${d.name}</div>
        <div class="profile-role-ui">${d.role} &bull; ${d.experience}</div>
        <div class="profile-rating-ui">★ ${d.rating}</div>
        <div class="profile-stats-ui">
          <div>
            <div class="stat-val">${d.patients}</div>
            <div class="stat-label">Patients</div>
          </div>
          <div>
            <div class="stat-val">${d.experience}</div>
            <div class="stat-label">Years Exp</div>
          </div>
          <div>
            <div class="stat-val">${d.achiev}</div>
            <div class="stat-label">Achievements</div>
          </div>
        </div>
        <div class="profile-desc-ui">${d.summary}</div>
        <a class="profile-btn-ui" href="tel:${d.phone}">Book Appointment</a>
      `;
      const profileDiv = document.getElementById('doctorProfile');
      profileDiv.style.opacity = 0;
      profileDiv.style.transform = "translateY(30px)";
      setTimeout(()=>{
        profileDiv.innerHTML = profile;
        profileDiv.style.animation = 'none';
        setTimeout(()=>{
          profileDiv.style.animation = '';
          profileDiv.style.opacity = 1;
          profileDiv.style.transform = "translateY(0)";
        }, 10);
      }, 150);

      // Highlight selected doctor
      document.querySelectorAll('.doctor-card-ui').forEach(card => card.classList.remove('active'));
      document.querySelector(`.doctor-card-ui[data-index="${idx}"]`).classList.add('active');
    }

    // Initial display
    showProfile(0);

    // On click, update card
    document.querySelectorAll('.doctor-card-ui').forEach((card, idx) => {
      card.addEventListener('click', () => showProfile(idx));
    });
  }

});

(function () {
  const slide = document.querySelector('#clinic-gallery .slide');
  if (!slide) return;

  const nextBtn = document.querySelector('#clinic-gallery .next');
  const prevBtn = document.querySelector('#clinic-gallery .prev');

  const slideNext = () => {
    const items = slide.querySelectorAll('.item');
    if (items.length) slide.appendChild(items[0]);
  };
  const slidePrev = () => {
    const items = slide.querySelectorAll('.item');
    if (items.length) slide.prepend(items[items.length - 1]);
  };

  if (nextBtn) nextBtn.addEventListener('click', slideNext);
  if (prevBtn) prevBtn.addEventListener('click', slidePrev);

  // autoplay with pause on hover & when tab is hidden
  let autoplay;
  const startAuto = () => autoplay = setInterval(slideNext, 3000);
  const stopAuto  = () => autoplay && clearInterval(autoplay);

  const gallery = document.getElementById('clinic-gallery');
  if (gallery) {
    gallery.addEventListener('mouseenter', stopAuto);
    gallery.addEventListener('mouseleave', startAuto);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto(); else startAuto();
  });

  // Keyboard accessibility
  gallery?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') slideNext();
    if (e.key === 'ArrowLeft')  slidePrev();
  });
  gallery?.setAttribute('tabindex', '0');

  startAuto();
})();

(function () {
  // ===== Base slider (prev/next + autoplay) =====
  const gallery = document.getElementById('clinic-gallery');
  if (!gallery) return;

  const slide = gallery.querySelector('.slide');
  const btnPrev = gallery.querySelector('.prev');
  const btnNext = gallery.querySelector('.next');

  function slideNext() {
    const items = slide.querySelectorAll('.item');
    if (items.length) slide.appendChild(items[0]);
  }
  function slidePrev() {
    const items = slide.querySelectorAll('.item');
    if (items.length) slide.prepend(items[items.length - 1]);
  }

  btnNext?.addEventListener('click', slideNext);
  btnPrev?.addEventListener('click', slidePrev);

  let timer;
  const startAuto = () => timer = setInterval(slideNext, 3000);
  const stopAuto  = () => timer && clearInterval(timer);
  startAuto();
  gallery.addEventListener('mouseenter', stopAuto);
  gallery.addEventListener('mouseleave', startAuto);
  document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());

  // ===== Lightbox elements =====
  const lb        = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCanvas  = document.getElementById('lbCanvas');
  const btnClose  = lb.querySelector('.lb-close');
  const btnIn     = lb.querySelector('.lb-zoom-in');
  const btnOut    = lb.querySelector('.lb-zoom-out');
  const btnReset  = lb.querySelector('.lb-reset');
  const btnFull   = lb.querySelector('.lb-full');
  const thumbsWrap= document.getElementById('lbThumbs');
  const railPrev  = lb.querySelector('.rail-prev');
  const railNext  = lb.querySelector('.rail-next');

  // Build dataset from slider items (background-image)
  const items = [...slide.querySelectorAll('.item')];
  const data = items.map((el, i) => {
    const bg = getComputedStyle(el).backgroundImage;
    const m  = bg.match(/url\(["']?(.*?)["']?\)/);
    const src = m ? m[1] : "";
    const title = el.dataset.title || `Photo ${i+1}`;
    const progress = parseInt(el.dataset.progress || "0", 10);
    return { src, title, progress: Math.max(0, Math.min(progress, 100)) };
  });

  // Render thumbnails with title chip + progress bar
  thumbsWrap.innerHTML = data.map((d, i) => `
    <button class="lb-thumb" role="option" aria-label="${d.title}" data-idx="${i}">
      <img src="${d.src}" alt="${d.title}">
      <span class="lb-chip">${d.title}</span>
      <span class="lb-progress"><i style="width:${d.progress}%"></i></span>
    </button>
  `).join('');

  let current = 0;
  let scale = 1, tx = 0, ty = 0;
  const minScale = 1, maxScale = 4;
  let isPanning = false, startX = 0, startY = 0;

  function setActiveThumb(i, smooth = true) {
    thumbsWrap.querySelectorAll('.lb-thumb').forEach(t => t.classList.remove('active'));
    const el = thumbsWrap.querySelector(`.lb-thumb[data-idx="${i}"]`);
    if (el) {
      el.classList.add('active');
      const bx = el.getBoundingClientRect();
      const wx = thumbsWrap.getBoundingClientRect();
      const offset = (bx.left + bx.width/2) - (wx.left + wx.width/2);
      thumbsWrap.scrollBy({ left: offset, behavior: smooth ? 'smooth' : 'auto' });
    }
  }

  function applyTransform() {
    lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  function loadIndex(i) {
    current = (i + data.length) % data.length;
    const d = data[current];
    lbImg.src = d.src;
    lbCaption.textContent = d.title;
    scale = 1; tx = 0; ty = 0; applyTransform();
    setActiveThumb(current);
  }

  function openLightbox(i) {
    stopAuto();
    lb.classList.remove('hidden');
    lb.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
    loadIndex(i);
  }

  function closeLightbox() {
    lb.classList.add('hidden');
    lb.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = '';
    startAuto();
  }

  // Open LB from any slide click
  slide.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (!item) return;
    const idx = items.indexOf(item);
    if (idx > -1) openLightbox(idx);
  });

  // Rail controls
  railPrev.addEventListener('click', () => thumbsWrap.scrollBy({left: -thumbsWrap.clientWidth, behavior: 'smooth'}));
  railNext.addEventListener('click', () => thumbsWrap.scrollBy({left: +thumbsWrap.clientWidth, behavior: 'smooth'}));
  thumbsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.lb-thumb');
    if (!btn) return;
    loadIndex(+btn.dataset.idx);
  });

  // LB buttons
  btnClose.addEventListener('click', closeLightbox);
  btnIn.addEventListener('click',  () => { scale = Math.min(maxScale, scale + .3); applyTransform(); });
  btnOut.addEventListener('click', () => { scale = Math.max(minScale, scale - .3); applyTransform(); });
  btnReset.addEventListener('click', () => { scale = 1; tx = 0; ty = 0; applyTransform(); });
  btnFull.addEventListener('click', () => {
    if (!document.fullscreenElement) lb.requestFullscreen?.(); else document.exitFullscreen?.();
  });

  // Wheel zoom
  lbCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? .2 : -.2;
    const prev  = scale;
    scale = Math.max(minScale, Math.min(maxScale, scale + delta));
    const rect = lbImg.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width/2;
    const cy = e.clientY - rect.top  - rect.height/2;
    tx -= cx * (scale/prev - 1);
    ty -= cy * (scale/prev - 1);
    applyTransform();
  }, { passive:false });

  // Double-click zoom
  lbCanvas.addEventListener('dblclick', (e) => {
    if (scale === 1) {
      const rect = lbImg.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width/2;
      const cy = e.clientY - rect.top  - rect.height/2;
      scale = 2; tx -= cx; ty -= cy;
    } else {
      scale = 1; tx = 0; ty = 0;
    }
    applyTransform();
  });

  // Pan with pointer
  lbCanvas.addEventListener('pointerdown', (e) => {
    lbCanvas.setPointerCapture(e.pointerId);
    isPanning = true; startX = e.clientX - tx; startY = e.clientY - ty;
  });
  lbCanvas.addEventListener('pointermove', (e) => {
    if (!isPanning) return;
    tx = e.clientX - startX; ty = e.clientY - startY; applyTransform();
  });
  ['pointerup','pointercancel','pointerleave'].forEach(ev => lbCanvas.addEventListener(ev, () => isPanning = false));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') loadIndex(current + 1);
    if (e.key === 'ArrowLeft')  loadIndex(current - 1);
  });

  function getBgUrl(el) {
    const s = getComputedStyle(el).backgroundImage;
    const m = s.match(/url\(["']?(.*?)["']?\)/);
    return m ? m[1] : "";
  }
})();

(() => {
  const root = document.getElementById("clinic-gallery");
  if (!root) return;

  const track = root.querySelector(".cg-track");
  const items = [...root.querySelectorAll(".cg-item")];
  const btnPrev = root.querySelector(".cg-btn.prev");
  const btnNext = root.querySelector(".cg-btn.next");
  const dotsWrap = root.querySelector(".cg-dots");

  // Build dots
  dotsWrap.innerHTML = items.map((_, i) =>
    `<button aria-label="Go to slide ${i+1}" data-i="${i}"></button>`).join("");
  const dots = [...dotsWrap.querySelectorAll("button")];

  let current = 0;
  const positions = [-2, -1, 0, 1, 2]; // visible slots around center

  function render() {
    // clear classes
    items.forEach(el => el.className = "cg-item");
    // put classes on 5 nearest items around current
    for (let k = 0; k < items.length; k++) {
      const delta = k - current;
      // normalize shortest wrap-around distance
      const wrap = ((delta + items.length) % items.length);
      const short = wrap > items.length/2 ? wrap - items.length : wrap;
      if (positions.includes(short)) {
        items[k].classList.add(`pos${short >= 0 ? "-" : ""}${short}`); // pos-2, pos-1, pos0...
      }
    }
    dots.forEach((d,i)=> d.classList.toggle("active", i===current));
  }
  function next(){ current = (current + 1) % items.length; render(); }
  function prev(){ current = (current - 1 + items.length) % items.length; render(); }

  // init
  render();

  // Buttons
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);

  // Dots
  dotsWrap.addEventListener("click", (e)=>{
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    current = +b.dataset.i;
    render();
  });

  // Autoplay + pause on hover + visibility
  let timer;
  const start = () => timer = setInterval(next, 3000);
  const stop  = () => timer && clearInterval(timer);
  start();
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  document.addEventListener("visibilitychange", ()=> document.hidden ? stop() : start());

  // Drag / swipe
  let dragging = false, startX = 0, dx = 0;
  const onDown = (e) => {
    dragging = true; dx = 0;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    track.style.transition = "none";
  };
  const onMove = (e) => {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    dx = x - startX;
    track.style.transform = `translateX(${dx * 0.4}px)`; // small visual drag
  };
  const onUp = () => {
    if (!dragging) return;
    track.style.transition = "";
    track.style.transform = "";
    if (dx > 60) prev();
    else if (dx < -60) next();
    dragging = false;
  };
  track.addEventListener("mousedown", onDown);
  track.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  track.addEventListener("touchstart", onDown, {passive:true});
  track.addEventListener("touchmove", onMove, {passive:true});
  track.addEventListener("touchend", onUp);

  // Keyboard
  root.setAttribute("tabindex","0");
  root.addEventListener("keydown", (e)=>{
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft")  prev();
  });

  // Lightbox
  const lb = document.getElementById("cg-lightbox");
  const lbImg = lb.querySelector(".cg-lb-img");
  const lbCap = lb.querySelector(".cg-lb-caption");
  const lbPrev = lb.querySelector(".cg-lb-prev");
  const lbNext = lb.querySelector(".cg-lb-next");
  const lbClose = lb.querySelector(".cg-lb-close");

  function openLB(i){
    current = i; render();
    const el = items[current];
    const img = el.querySelector("img");
    lbImg.src = img.src;
    lbCap.textContent = el.dataset.title || img.alt || "";
    lb.classList.remove("hidden");
    lb.setAttribute("aria-hidden","false");
    document.documentElement.style.overflow = "hidden";
  }
  function closeLB(){
    lb.classList.add("hidden");
    lb.setAttribute("aria-hidden","true");
    document.documentElement.style.overflow = "";
  }
  function lbNextFn(){ next(); openLB(current); }
  function lbPrevFn(){ prev(); openLB(current); }

  items.forEach((el,i)=> el.addEventListener("click", ()=> openLB(i)));
  lbClose.addEventListener("click", closeLB);
  lbNext.addEventListener("click", lbNextFn);
  lbPrev.addEventListener("click", lbPrevFn);
  lb.addEventListener("click", (e)=> { if (e.target === lb) closeLB(); });
  document.addEventListener("keydown", (e)=>{
    if (lb.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowRight") lbNextFn();
    if (e.key === "ArrowLeft")  lbPrevFn();
  });
})();
</script>
