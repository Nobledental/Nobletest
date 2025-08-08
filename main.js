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
  // Hook into the existing slider
  const gallery = document.getElementById('clinic-gallery');
  const slide   = gallery?.querySelector('.slide');
  if (!gallery || !slide) return;

  // LIGHTBOX elements
  const lb        = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCanvas  = document.getElementById('lbCanvas');
  const btnClose  = lb.querySelector('.lb-close');
  const btnIn     = lb.querySelector('.lb-zoom-in');
  const btnOut    = lb.querySelector('.lb-zoom-out');
  const btnReset  = lb.querySelector('.lb-reset');
  const btnFull   = lb.querySelector('.lb-full');

  let scale = 1, minScale = 1, maxScale = 4, tx = 0, ty = 0;
  let isPanning = false, startX = 0, startY = 0;
  let autoTimer; // reuse to pause slider if needed

  const getBgUrl = (el) => {
    const s = getComputedStyle(el).backgroundImage;
    // background-image: url("...") -> extract
    const m = s.match(/url\(["']?(.*?)["']?\)/);
    return m ? m[1] : "";
  };

  const openLightbox = (src, caption = "") => {
    // Pause slider autoplay (if you used the start/stop funcs)
    document.dispatchEvent(new CustomEvent('slider:pause'));

    lbImg.src = src;
    lbCaption.textContent = caption;
    scale = 1; tx = 0; ty = 0;
    applyTransform();

    lb.classList.remove('hidden');
    lb.setAttribute('aria-hidden', 'false');

    // Prevent page from scrolling in background
    document.documentElement.style.overflow = 'hidden';
    lb.focus();
  };

  const closeLightbox = () => {
    lb.classList.add('hidden');
    lb.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    // Resume slider autoplay
    document.dispatchEvent(new CustomEvent('slider:resume'));
  };

  const applyTransform = () => {
    lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // Zoom helpers
  const zoomBy = (delta, centerX, centerY) => {
    const prev = scale;
    scale = clamp(scale + delta, minScale, maxScale);

    // Zoom towards cursor (Netflix-y smoothness)
    if (centerX != null && centerY != null) {
      // convert pointer to image space
      const rect = lbImg.getBoundingClientRect();
      const cx = centerX - rect.left - rect.width / 2;
      const cy = centerY - rect.top  - rect.height / 2;
      tx -= cx * (scale/prev - 1);
      ty -= cy * (scale/prev - 1);
    }

    applyTransform();
  };

  // Click any visible slide item to open lightbox
  slide.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (!item) return;
    const url = getBgUrl(item);
    const cap = item.querySelector('.name')?.textContent?.trim() || 'Clinic photo';
    if (url) openLightbox(url, cap);
  });

  // Buttons
  btnClose.addEventListener('click', closeLightbox);
  btnIn.addEventListener('click', () => zoomBy(0.3));
  btnOut.addEventListener('click', () => zoomBy(-0.3));
  btnReset.addEventListener('click', () => { scale=1; tx=0; ty=0; applyTransform(); });
  btnFull.addEventListener('click', () => {
    const el = lb.requestFullscreen ? lb : document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  // Wheel to zoom
  lbCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 0.2 : -0.2, e.clientX, e.clientY);
  }, { passive:false });

  // Double-click / double-tap to zoom
  lbCanvas.addEventListener('dblclick', (e) => zoomBy( scale === 1 ? 1 : - (scale-1), e.clientX, e.clientY ));

  // Pointer pan (mouse/touch)
  const startPan = (x, y) => { isPanning = true; startX = x - tx; startY = y - ty; };
  const movePan  = (x, y) => { if(!isPanning) return; tx = x - startX; ty = y - startY; applyTransform(); };
  const endPan   = () => { isPanning = false; };

  lbCanvas.addEventListener('pointerdown', (e) => { lbCanvas.setPointerCapture(e.pointerId); startPan(e.clientX, e.clientY); });
  lbCanvas.addEventListener('pointermove', (e) => movePan(e.clientX, e.clientY));
  lbCanvas.addEventListener('pointerup', endPan);
  lbCanvas.addEventListener('pointercancel', endPan);
  lbCanvas.addEventListener('pointerleave', endPan);

  // Close with backdrop / Esc
  lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') document.querySelector('#clinic-gallery .next')?.click();
    if (e.key === 'ArrowLeft')  document.querySelector('#clinic-gallery .prev')?.click();
  });

  /* === Talk to your slider's autoplay (from previous step) === */
  let sliderTimer;
  const startAuto = () => sliderTimer = setInterval(() => {
    document.querySelector('#clinic-gallery .next')?.click();
  }, 3000);
  const stopAuto = () => sliderTimer && clearInterval(sliderTimer);

  // If you already had autoplay elsewhere, remove these two and keep your originals.
  startAuto();
  gallery.addEventListener('mouseenter', stopAuto);
  gallery.addEventListener('mouseleave', startAuto);
  document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());

  // Pause/resume when lightbox opens/closes
  document.addEventListener('slider:pause', stopAuto);
  document.addEventListener('slider:resume', startAuto);
})();
</script>
