document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     NAV: burger toggle + focus trap + ESC
  ========================== */
  const menuIcon  = document.querySelector(".menu-icon");
  const navLinks  = document.querySelector(".nav-links");
  const closeIcon = document.querySelector(".close-icon");

  if (menuIcon && navLinks) {
    const openDrawer = () => {
      navLinks.classList.add("active");
      setTimeout(() => firstFocusable()?.focus(), 50);
    };
    const closeDrawer = () => {
      navLinks.classList.remove("active");
      menuIcon?.focus();
    };
    menuIcon.addEventListener("click", () => {
      navLinks.classList.contains("active") ? closeDrawer() : openDrawer();
    });
    closeIcon?.addEventListener("click", closeDrawer);

    const firstFocusable = () =>
      navLinks.querySelector('a,button,[tabindex]:not([tabindex="-1"])');

    // trap focus + ESC to close
    document.addEventListener("keydown", (e) => {
      if (!navLinks.classList.contains("active")) return;
      if (e.key === "Escape") return closeDrawer();
      if (e.key !== "Tab") return;

      const focusables = [
        ...navLinks.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])'),
      ];
      if (!focusables.length) return;

      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus(); e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus(); e.preventDefault();
      }
    });

    // close drawer when any drawer link is clicked
    navLinks.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", closeDrawer)
    );
  }

  /* =========================
     SERVICES FILTER (optional #complaintInput)
  ========================== */
  const complaintInput = document.getElementById("complaintInput");
  const servicesGrid = document.getElementById("servicesGrid");

  function shuffleCards(query = "") {
    const q = (query || "").toLowerCase().trim();
    if (!servicesGrid) return;
    servicesGrid.querySelectorAll(".service-card").forEach(card => {
      const keywords = (card.dataset.keywords || "").toLowerCase();
      const show = q === "" || keywords.includes(q);
      card.hidden = !show;
    });
  }
  if (complaintInput) {
    complaintInput.addEventListener("input", (e) => shuffleCards(e.target.value));
  }
  // keep global for HTML inline handlers if any
  window.shuffleCards = shuffleCards;

  /* =========================
     Animate-on-scroll (once)
  ========================== */
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".animate-on-scroll").forEach(el => io.observe(el));

  /* =========================
     Read More buttons: use data-url on .service-card
  ========================== */
  document.querySelectorAll(".service-card").forEach(card => {
    const btn = card.querySelector(".read-more-button");
    const url = card.dataset.url;
    if (btn && url) btn.setAttribute("href", url);
  });

  /* =========================
     Smooth scroll for hash links (skip href="#")
  ========================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      if (location.hash === href) return; // already at target
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      navLinks?.classList.remove("active");
    });
  });

  /* =========================
     Motion preference
  ========================== */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================
     DOCTOR LIST + PROFILE (two-pane)
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
    doctorList.innerHTML = doctors.map((d, i) => `
      <div class="doctor-card-ui" data-index="${i}">
        <img src="${d.image}" class="doctor-avatar-ui" alt="${d.name}">
        <div class="doc-info-ui">
          <h4>${d.name}</h4>
          <p>${d.role}</p>
        </div>
        <span class="rating-ui">★ ${d.rating}</span>
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

      doctorList.querySelectorAll(".doctor-card-ui").forEach(c => c.classList.remove("active"));
      doctorList.querySelector(`.doctor-card-ui[data-index="${idx}"]`)?.classList.add("active");
    };

    showProfile(0);
    doctorList.querySelectorAll(".doctor-card-ui").forEach((card, idx) => {
      card.addEventListener("click", () => showProfile(idx));
    });
  }

  /* =========================
     CLINIC GALLERY (coverflow) + Lightbox
  ========================== */
  const cgRoot = document.getElementById("clinic-gallery");
  if (cgRoot) {
    const track   = cgRoot.querySelector(".cg-track");
    const items   = [...cgRoot.querySelectorAll(".cg-item")];
    const prevBtn = cgRoot.querySelector(".cg-prev");
    const nextBtn = cgRoot.querySelector(".cg-next");
    const dotsWrap= cgRoot.querySelector(".cg-dots");

    if (track && items.length && prevBtn && nextBtn && dotsWrap) {
      dotsWrap.innerHTML = items.map((_,i)=>`<button aria-label="Go to slide ${i+1}" data-i="${i}"></button>`).join("");
      const dots = [...dotsWrap.querySelectorAll("button")];

      let current = 0;
      const visible = [-2,-1,0,1,2];

      const render = () => {
        items.forEach(el => el.className = "cg-item");
        items.forEach((el, i) => {
          const wrap = ((i - current + items.length) % items.length);
          const shortest = wrap > items.length/2 ? wrap - items.length : wrap;
          if (visible.includes(shortest)) el.classList.add(`cg-pos${shortest}`);
        });
        dots.forEach((d,i)=> d.classList.toggle("active", i === current));
      };

      const next = () => { current = (current + 1) % items.length; render(); };
      const prev = () => { current = (current - 1 + items.length) % items.length; render(); };

      render();
      nextBtn.addEventListener("click", next);
      prevBtn.addEventListener("click", prev);
      dotsWrap.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-i]");
        if (!b) return;
        current = +b.dataset.i;
        render();
      });

      // autoplay (respect reduced motion)
      let timer = null;
      const start = () => { if (prefersReduced || timer) return; timer = setInterval(next, 3000); };
      const stop  = () => { if (!timer) return; clearInterval(timer); timer = null; };
      if (!prefersReduced) start();
      cgRoot.addEventListener("mouseenter", stop);
      cgRoot.addEventListener("mouseleave", start);
      document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

      // drag/swipe with click-guard
      let dragging = false, sx = 0, dx = 0, dragStartTime = 0;
      const onDown = (e) => {
        dragging = true; dx = 0; dragStartTime = Date.now();
        sx = (e.touches?e.touches[0].clientX:e.clientX);
        track.style.transition='none';
      };
      const onMove = (e) => {
        if (!dragging) return;
        const x = (e.touches?e.touches[0].clientX:e.clientX);
        dx = x - sx;
        track.style.transform = `translateX(${Math.max(-60, Math.min(60, dx)) * 0.3}px)`;
      };
      const onUp = () => {
        if (!dragging) return;
        track.style.transition=''; track.style.transform='';
        const quick = Date.now() - dragStartTime < 250;
        if (!quick && dx > 60) prev();
        else if (!quick && dx < -60) next();
        dragging = false;
      };
      track.addEventListener("mousedown", onDown);
      track.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      track.addEventListener("touchstart", onDown, {passive:true});
      track.addEventListener("touchmove", onMove, {passive:true});
      track.addEventListener("touchend", onUp);

      // lightbox
      const lb = document.getElementById("cg-lightbox");
      if (lb) {
        const lbImg    = lb.querySelector(".cg-lb-img");
        const lbCap    = lb.querySelector(".cg-lb-caption");
        const lbCanvas = lb.querySelector("#cg-lb-canvas");
        const lbClose  = lb.querySelector(".cg-lb-close");
        const lbPrev   = lb.querySelector(".cg-lb-prev");
        const lbNext   = lb.querySelector(".cg-lb-next");
        const lbZBtns  = [...lb.querySelectorAll(".cg-lb-zo, .cg-lb-zoom")];
        const lbReset  = lb.querySelector(".cg-lb-reset");

        if (lbImg && lbCap && lbCanvas && lbClose && lbPrev && lbNext) {
          function openLB(i){
            current = i; render();
            const el = items[current];
            const img = el.querySelector("img");
            lbImg.src = img?.src || "";
            lbCap.textContent = el.dataset.title || img?.alt || "";
            lb.classList.remove("cg-hidden");
            lb.setAttribute("aria-hidden","false");
            document.documentElement.style.overflow = "hidden";
            scale=1; tx=0; ty=0; apply();
          }
          function closeLB(){
            lb.classList.add("cg-hidden");
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
            if (lb.classList.contains("cg-hidden")) return;
            if (e.key === "Escape") closeLB();
            if (e.key === "ArrowRight") lbNextFn();
            if (e.key === "ArrowLeft")  lbPrevFn();
          });

          // zoom/pan
          let scale=1, tx=0, ty=0;
          function apply(){ lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; }
          lbZBtns.forEach(b => b.addEventListener("click", ()=>{
            const dir = b.dataset.zo === "+" ? 0.2 : -0.2;
            scale = Math.max(1, Math.min(4, scale + dir)); apply();
          }));
          lbReset?.addEventListener("click", ()=> { scale=1; tx=0; ty=0; apply(); });

          lbCanvas.addEventListener("wheel", (e)=>{
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
          lbCanvas.addEventListener("pointerdown", (e)=>{ pan=true; lbCanvas.setPointerCapture(e.pointerId); sxp=e.clientX - tx; syp=e.clientY - ty; });
          lbCanvas.addEventListener("pointermove", (e)=>{ if(!pan) return; tx = e.clientX - sxp; ty = e.clientY - syp; apply(); });
          ["pointerup","pointercancel","pointerleave"].forEach(ev=> lbCanvas.addEventListener(ev, ()=> pan=false));
        }
      }
    }
  }

  /* =========================
     TESTIMONIALS SLIDER
  ========================== */
  const tTrack = document.getElementById("ndTestimonialsTrack");
  const tViewport = document.querySelector(".nd-testimonials__viewport");
  const tCards = tTrack ? [...tTrack.querySelectorAll(".nd-testimonials__card")] : [];
  const tPrev = document.querySelector(".nd-testimonials__nav--prev");
  const tNext = document.querySelector(".nd-testimonials__nav--next");
  const tDotsWrap = document.getElementById("ndTestimonialsDots");

  if (tTrack && tViewport && tCards.length && tDotsWrap && tPrev && tNext) {
    // dots per card (simple)
    tDotsWrap.innerHTML = tCards.map((_, i) =>
      `<button type="button" aria-label="Go to slide ${i + 1}" data-i="${i}"></button>`
    ).join("");
    const dots = [...tDotsWrap.querySelectorAll("button")];

    let current = 0, perView = 1;
    let autoplay = null;

    const updatePerView = () => {
      const w = window.innerWidth;
      perView = w >= 1024 ? 3 : w >= 720 ? 2 : 1;
    };

    const clampIndex = (i) => {
      const maxIndex = Math.max(0, tCards.length - perView);
      return Math.min(Math.max(0, i), maxIndex);
    };

    const cardGap = 22; // keep in sync with CSS gap
    const render = () => {
      const cardW = tCards[0].getBoundingClientRect().width + cardGap;
      const x = -(cardW * current);
      tTrack.style.transform = `translate3d(${x}px,0,0)`;
      dots.forEach((d, i) => d.setAttribute("aria-current", i === current ? "true" : "false"));
    };

    const next = () => { current = clampIndex(current + 1); render(); };
    const prev = () => { current = clampIndex(current - 1); render(); };

    updatePerView();
    render();

    tNext.addEventListener("click", next);
    tPrev.addEventListener("click", prev);

    tDotsWrap.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (!b) return;
      current = clampIndex(+b.dataset.i);
      render();
    });

    const start = () => {
      if (prefersReduced || autoplay) return;
      autoplay = setInterval(() => {
        const maxIndex = Math.max(0, tCards.length - perView);
        current = current >= maxIndex ? 0 : current + 1;
        render();
      }, 3500);
    };
    const stop = () => { if (!autoplay) return; clearInterval(autoplay); autoplay = null; };

    if (!prefersReduced) start();
    tViewport.addEventListener("mouseenter", stop);
    tViewport.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

    // --- Drag / Swipe ---
    const getCurrentX = () => {
      const t = getComputedStyle(tTrack).transform;
      if (!t || t === "none") return 0;
      if (t.startsWith("matrix3d(")) {
        const m = t.match(/matrix3d\(([^)]+)\)/);
        return m ? parseFloat(m[1].split(",")[12]) || 0 : 0;
      }
      const m = t.match(/matrix\(([^)]+)\)/);
      return m ? parseFloat(m[1].split(",")[4]) || 0 : 0;
    };

    let dragging = false, sx = 0, dx = 0, baseX = 0;

    tViewport.addEventListener("mousedown", (e) => {
      dragging = true; sx = e.clientX; dx = 0;
      baseX = getCurrentX();
      tTrack.style.transition = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      dx = e.clientX - sx;
      tTrack.style.transform = `translate3d(${baseX + dx}px,0,0)`;
    });

    window.addEventListener("mouseup", () => {
      if (!dragging) return;
      tTrack.style.transition = "";
      if (dx > 60) prev(); else if (dx < -60) next(); else render();
      dragging = false;
    });

    tViewport.addEventListener("touchstart", (e) => {
      dragging = true; sx = e.touches[0].clientX; dx = 0;
      baseX = getCurrentX();
      tTrack.style.transition = "none";
    }, { passive: true });

    tViewport.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      dx = e.touches[0].clientX - sx;
      tTrack.style.transform = `translate3d(${baseX + dx}px,0,0)`;
    }, { passive: true });

    tViewport.addEventListener("touchend", () => {
      if (!dragging) return;
      tTrack.style.transition = "";
      if (dx > 50) prev(); else if (dx < -50) next(); else render();
      dragging = false;
    });

    // re-render when images load (layout stability)
    const imgs = tTrack.querySelectorAll("img");
    let pending = imgs.length;
    if (pending) {
      imgs.forEach(img => {
        if (img.complete) { if (--pending === 0) render(); }
        else img.addEventListener("load", () => { if (--pending === 0) render(); }, { once:true });
      });
    }

    // debounced resize
    let rAF = null;
    window.addEventListener("resize", () => {
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        updatePerView();
        current = clampIndex(current);
        render();
      });
    });

    // keyboard support
    tViewport.setAttribute("tabindex", "0");
    tViewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    });
  }
});
