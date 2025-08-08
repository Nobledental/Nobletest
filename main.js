<script>
document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     NAV TOGGLE
  ========================== */
  const menuIcon = document.querySelector(".menu-icon");
  const navLinks = document.querySelector(".nav-links");
  const closeIcon = document.querySelector(".close-icon");
  menuIcon && navLinks && menuIcon.addEventListener("click", () => navLinks.classList.toggle("active"));
  closeIcon && navLinks && closeIcon.addEventListener("click", () => navLinks.classList.remove("active"));

  /* =========================
     TREATMENT FILTER
  ========================== */
  const searchInput = document.getElementById("treatmentSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const q = this.value.toLowerCase();
      document.querySelectorAll(".service-card").forEach(card => {
        const kw = (card.dataset.keywords || "").toLowerCase();
        card.style.display = kw.includes(q) ? "block" : "none";
      });
    });
  }

  /* =========================
     ANIMATE ON SCROLL
  ========================== */
  const animatedElements = document.querySelectorAll(".animate-on-scroll");
  if (animatedElements.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => io.observe(el));
  }

  /* =========================
     READ MORE BUTTONS
  ========================== */
  document.querySelectorAll(".service-card").forEach(card => {
    const btn = card.querySelector(".read-more-button");
    const url = card.dataset.url;
    if (btn && url) btn.href = url;
  });

  /* =========================
     DOCTORS: LIST + PROFILE
  ========================== */
  const doctors = [
    { name:"Dr. Dhivakaran R", image:"images/doctors/dhivakaran.jpg", role:"Chief Medical Director", experience:"10 years", patients:"5,000+", rating:"4.9", summary:"Expert in diagnostics, digital dental care, and patient management.", phone:"8074512305", achiev:"🏅" },
    { name:"Dr. Thik Vijay", image:"images/doctors/thikvijay.jpg", role:"Aesthetic Cosmetologist", experience:"11 years", patients:"3,200+", rating:"4.8", summary:"Cosmetologist with expertise in skin, hair, and smile transformations.", phone:"9999999999", achiev:"🏆" },
    { name:"Dr. Roger Ronaldo", image:"images/doctors/roger.jpg", role:"Maxillofacial Surgeon", experience:"13 years", patients:"4,800+", rating:"4.9", summary:"Surgeon specialized in complex jaw and facial reconstructive procedures.", phone:"8888888888", achiev:"🥇" },
    { name:"Dr. Deepak", image:"images/doctors/deepak.jpg", role:"Orthodontist", experience:"10 years", patients:"4,000+", rating:"4.7", summary:"Focused on orthodontics for beautiful, healthy smiles.", phone:"7777777777", achiev:"🎖️" },
    { name:"Dr. Manoj Reddy", image:"images/doctors/manoj.jpg", role:"Implantologist", experience:"13 years", patients:"2,900+", rating:"4.8", summary:"Expert in dental implants and restorative oral surgery.", phone:"6666666666", achiev:"🏵️" },
    { name:"Dr. Idhaya", image:"images/doctors/idhaya.jpg", role:"Health Insurance Expert", experience:"7 years", patients:"2,000+", rating:"4.6", summary:"Guiding patients with insurance and treatment claims.", phone:"5555555555", achiev:"🎗️" }
  ];

  const doctorList = document.getElementById("doctorList");
  const doctorProfile = document.getElementById("doctorProfile");

  if (doctorList && doctorProfile) {
    doctorList.innerHTML = doctors.map((d, i) => `
      <div class="doctor-card-ui" data-index="${i}">
        <img src="${d.image}" class="doctor-avatar-ui" alt="${d.name}" />
        <div class="doc-info-ui">
          <h4>${d.name}</h4>
          <p>${d.role}</p>
        </div>
        <span class="rating-ui">★ ${d.rating}</span>
      </div>
    `).join("");

    const showProfile = (i) => {
      const d = doctors[i];
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
        requestAnimationFrame(() => {
          doctorProfile.style.animation = "";
          doctorProfile.style.opacity = 1;
          doctorProfile.style.transform = "translateY(0)";
        });
      }, 120);

      document.querySelectorAll(".doctor-card-ui").forEach(c => c.classList.remove("active"));
      const active = doctorList.querySelector(`.doctor-card-ui[data-index="${i}"]`);
      active && active.classList.add("active");
    };

    showProfile(0);
    doctorList.querySelectorAll(".doctor-card-ui").forEach((card, i) => {
      card.addEventListener("click", () => showProfile(i));
    });
  }

  /* =======================================
     CLINIC GALLERY: SLIDER + LIGHTBOX
     Requires HTML structure:
     <section id="clinic-gallery">
       <div class="slide">
         <div class="item" style="background-image:url(...)" data-title="..."></div>
         ...
       </div>
       <button class="prev"></button>
       <button class="next"></button>
     </section>
     <!-- Lightbox -->
     <div id="lightbox" class="hidden" aria-hidden="true">
       <div class="lb-toolbar">
         <button class="lb-close"></button>
         <button class="lb-zoom-out"></button>
         <button class="lb-zoom-in"></button>
         <button class="lb-reset"></button>
         <button class="lb-full"></button>
       </div>
       <div id="lbCanvas"><img id="lbImg"><div id="lbCaption"></div></div>
       <button class="rail-prev"></button>
       <div id="lbThumbs"></div>
       <button class="rail-next"></button>
     </div>
  ======================================== */
  const gallery = document.getElementById("clinic-gallery");
  if (gallery) {
    const slide = gallery.querySelector(".slide");
    const btnPrev = gallery.querySelector(".prev");
    const btnNext = gallery.querySelector(".next");

    const slideNext = () => {
      const items = slide.querySelectorAll(".item");
      if (items.length) slide.appendChild(items[0]);
    };
    const slidePrev = () => {
      const items = slide.querySelectorAll(".item");
      if (items.length) slide.prepend(items[items.length - 1]);
    };

    btnNext && btnNext.addEventListener("click", slideNext);
    btnPrev && btnPrev.addEventListener("click", slidePrev);

    // autoplay with pause on hover + tab hidden
    let timer;
    const startAuto = () => (timer = setInterval(slideNext, 3000));
    const stopAuto  = () => timer && clearInterval(timer);
    startAuto();
    gallery.addEventListener("mouseenter", stopAuto);
    gallery.addEventListener("mouseleave", startAuto);
    document.addEventListener("visibilitychange", () => (document.hidden ? stopAuto() : startAuto()));

    // Lightbox bits
    const lb        = document.getElementById("lightbox");
    const lbImg     = document.getElementById("lbImg");
    const lbCaption = document.getElementById("lbCaption");
    const lbCanvas  = document.getElementById("lbCanvas");
    const btnClose  = lb?.querySelector(".lb-close");
    const btnIn     = lb?.querySelector(".lb-zoom-in");
    const btnOut    = lb?.querySelector(".lb-zoom-out");
    const btnReset  = lb?.querySelector(".lb-reset");
    const btnFull   = lb?.querySelector(".lb-full");
    const thumbsWrap= document.getElementById("lbThumbs");
    const railPrev  = lb?.querySelector(".rail-prev");
    const railNext  = lb?.querySelector(".rail-next");

    // Build dataset
    const items = [...slide.querySelectorAll(".item")];
    const data = items.map((el, i) => {
      const bg = getComputedStyle(el).backgroundImage;
      const m  = bg.match(/url\(["']?(.*?)["']?\)/);
      return { src: m ? m[1] : "", title: el.dataset.title || `Photo ${i+1}` };
    });

    // Render thumbs
    if (thumbsWrap) {
      thumbsWrap.innerHTML = data.map((d, i) => `
        <button class="lb-thumb" role="option" aria-label="${d.title}" data-idx="${i}">
          <img src="${d.src}" alt="${d.title}">
          <span class="lb-chip">${d.title}</span>
        </button>
      `).join("");
    }

    let current = 0, scale = 1, tx = 0, ty = 0;
    const minScale = 1, maxScale = 4;
    let isPanning = false, startX = 0, startY = 0;

    const setActiveThumb = (i, smooth = true) => {
      thumbsWrap?.querySelectorAll(".lb-thumb").forEach(t => t.classList.remove("active"));
      const el = thumbsWrap?.querySelector(`.lb-thumb[data-idx="${i}"]`);
      if (el && thumbsWrap) {
        el.classList.add("active");
        const bx = el.getBoundingClientRect();
        const wx = thumbsWrap.getBoundingClientRect();
        const offset = (bx.left + bx.width/2) - (wx.left + wx.width/2);
        thumbsWrap.scrollBy({ left: offset, behavior: smooth ? "smooth" : "auto" });
      }
    };

    const applyTransform = () => {
      if (lbImg) lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    };

    const loadIndex = (i) => {
      if (!lbImg || !lbCaption) return;
      current = (i + data.length) % data.length;
      const d = data[current];
      lbImg.src = d.src;
      lbCaption.textContent = d.title;
      scale = 1; tx = 0; ty = 0; applyTransform();
      setActiveThumb(current);
    };

    const openLightbox = (i) => {
      if (!lb) return;
      stopAuto();
      lb.classList.remove("hidden");
      lb.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      loadIndex(i);
    };
    const closeLightbox = () => {
      if (!lb) return;
      lb.classList.add("hidden");
      lb.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
      startAuto();
    };

    slide.addEventListener("click", (e) => {
      const item = e.target.closest(".item");
      if (!item) return;
      const idx = items.indexOf(item);
      if (idx > -1) openLightbox(idx);
    });

    railPrev && railPrev.addEventListener("click", () => thumbsWrap?.scrollBy({left: -(thumbsWrap.clientWidth || 300), behavior: "smooth"}));
    railNext && railNext.addEventListener("click", () => thumbsWrap?.scrollBy({left: +(thumbsWrap.clientWidth || 300), behavior: "smooth"}));
    thumbsWrap && thumbsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".lb-thumb");
      if (btn) loadIndex(+btn.dataset.idx);
    });

    btnClose && btnClose.addEventListener("click", closeLightbox);
    btnIn    && btnIn.addEventListener("click",  () => { scale = Math.min(maxScale, scale + .3); applyTransform(); });
    btnOut   && btnOut.addEventListener("click", () => { scale = Math.max(minScale, scale - .3); applyTransform(); });
    btnReset && btnReset.addEventListener("click", () => { scale = 1; tx = 0; ty = 0; applyTransform(); });
    btnFull  && btnFull.addEventListener("click", () => {
      if (!document.fullscreenElement) lb?.requestFullscreen?.(); else document.exitFullscreen?.();
    });

    lbCanvas && lbCanvas.addEventListener("wheel", (e) => {
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

    lbCanvas && lbCanvas.addEventListener("dblclick", (e) => {
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

    lbCanvas && lbCanvas.addEventListener("pointerdown", (e) => {
      lbCanvas.setPointerCapture(e.pointerId);
      isPanning = true; startX = e.clientX - tx; startY = e.clientY - ty;
    });
    lbCanvas && lbCanvas.addEventListener("pointermove", (e) => {
      if (!isPanning) return;
      tx = e.clientX - startX; ty = e.clientY - startY; applyTransform();
    });
    ["pointerup","pointercancel","pointerleave"].forEach(ev =>
      lbCanvas && lbCanvas.addEventListener(ev, () => isPanning = false)
    );

    document.addEventListener("keydown", (e) => {
      if (!lb || lb.classList.contains("hidden")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") loadIndex(current + 1);
      if (e.key === "ArrowLeft")  loadIndex(current - 1);
    });
  }
});
</script>
