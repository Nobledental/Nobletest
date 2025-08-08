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
     CLINIC GALLERY + LIGHTBOX
  ========================== */
  const galleryRoot = document.getElementById("clinic-gallery");
  if (galleryRoot) {
    const slide   = galleryRoot.querySelector(".slide"); // holds .item cards
    const btnPrev = galleryRoot.querySelector(".prev");
    const btnNext = galleryRoot.querySelector(".next");

    // --- Slider (reorders children) ---
    const slideNext = () => {
      const items = slide.querySelectorAll(".item");
      if (items.length) slide.appendChild(items[0]);
    };
    const slidePrev = () => {
      const items = slide.querySelectorAll(".item");
      if (items.length) slide.prepend(items[items.length - 1]);
    };

    btnNext?.addEventListener("click", slideNext);
    btnPrev?.addEventListener("click", slidePrev);

    // Autoplay (pause on hover + hidden tab)
    let autoTimer;
    const startAuto = () => (autoTimer = setInterval(slideNext, 3000));
    const stopAuto  = () => autoTimer && clearInterval(autoTimer);
    startAuto();
    galleryRoot.addEventListener("mouseenter", stopAuto);
    galleryRoot.addEventListener("mouseleave", startAuto);
    document.addEventListener("visibilitychange", () => (document.hidden ? stopAuto() : startAuto()));

    // --- Lightbox ---
    const lb        = document.getElementById("xdevLightbox");
    const lbImg     = document.getElementById("lbImg");
    const lbCap     = document.getElementById("lbCaption");
    const lbCanvas  = document.getElementById("lbCanvas");
    const lbClose   = lb?.querySelector(".lb-close");
    const lbIn      = lb?.querySelector(".lb-zoom-in");
    const lbOut     = lb?.querySelector(".lb-zoom-out");
    const lbReset   = lb?.querySelector(".lb-reset");
    const lbPrev    = lb?.querySelector(".lb-prev");
    const lbNext2   = lb?.querySelector(".lb-next");

    const itemsArr = [...slide.querySelectorAll(".item")];
    let current = 0, scale = 1, tx = 0, ty = 0;

    const getBgUrl = (el) => {
      const m = getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      return m ? m[1] : "";
    };
    const applyTransform = () => {
      if (lbImg) lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    };
    const loadIndex = (i) => {
      current = (i + itemsArr.length) % itemsArr.length;
      const el = itemsArr[current];
      if (!el) return;
      if (lbImg) lbImg.src = getBgUrl(el);
      if (lbCap) lbCap.textContent = el.dataset.title || "";
      scale = 1; tx = 0; ty = 0; applyTransform();
    };
    const openLB = (i) => {
      if (!lb) return;
      stopAuto();
      lb.classList.remove("hidden");
      lb.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      loadIndex(i);
    };
    const closeLB = () => {
      if (!lb) return;
      lb.classList.add("hidden");
      lb.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
      startAuto();
    };

    // Open on item click
    slide.addEventListener("click", (e) => {
      const item = e.target.closest(".item");
      if (!item) return;
      const idx = itemsArr.indexOf(item);
      if (idx > -1) openLB(idx);
    });

    // Lightbox controls
    lbClose?.addEventListener("click", closeLB);
    lbNext2?.addEventListener("click", () => loadIndex(current + 1));
    lbPrev?.addEventListener("click", () => loadIndex(current - 1));

    lbIn?.addEventListener("click", () => { scale = Math.min(4, scale + 0.3); applyTransform(); });
    lbOut?.addEventListener("click", () => { scale = Math.max(1, scale - 0.3); applyTransform(); });
    lbReset?.addEventListener("click", () => { scale = 1; tx = 0; ty = 0; applyTransform(); });

    // Wheel zoom
    lbCanvas?.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      const prev  = scale;
      scale = Math.max(1, Math.min(4, scale + delta));
      const rect = lbImg.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top  - rect.height / 2;
      tx -= cx * (scale / prev - 1);
      ty -= cy * (scale / prev - 1);
      applyTransform();
    }, { passive: false });

    // Double-click zoom toggle
    lbCanvas?.addEventListener("dblclick", (e) => {
      if (scale === 1) {
        const rect = lbImg.getBoundingClientRect();
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top  - rect.height / 2;
        scale = 2; tx -= cx; ty -= cy;
      } else {
        scale = 1; tx = 0; ty = 0;
      }
      applyTransform();
    });

    // Drag/Pan (fixed typo here)
    let panning = false, sx = 0, sy = 0;
    lbCanvas?.addEventListener("pointerdown", (e) => {
      lbCanvas.setPointerCapture(e.pointerId);
      panning = true; sx = e.clientX - tx; sy = e.clientY - ty; // <-- was using 'sy' before, now correct
    });
    lbCanvas?.addEventListener("pointermove", (e) => {
      if (!panning) return;
      tx = e.clientX - sx; ty = e.clientY - sy; applyTransform();
    });
    ["pointerup","pointercancel","pointerleave"].forEach(ev =>
      lbCanvas?.addEventListener(ev, () => panning = false)
    );

    // Close on backdrop click
    lb?.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });

    // Keyboard inside lightbox
    document.addEventListener("keydown", (e) => {
      if (!lb || lb.classList.contains("hidden")) return;
      if (e.key === "Escape") closeLB();
      if (e.key === "ArrowRight") loadIndex(current + 1);
      if (e.key === "ArrowLeft")  loadIndex(current - 1);
    });

    // Keyboard for gallery (when focused)
    galleryRoot.setAttribute("tabindex", "0");
    galleryRoot.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") slideNext();
      if (e.key === "ArrowLeft")  slidePrev();
    });
  }
}); // <-- CLOSES DOMContentLoaded
</script>
