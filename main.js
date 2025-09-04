/* ========== 1. Reduced Motion for Hero Video ========== */
(() => {
  const vid = document.querySelector(".blackhole-video");
  if (!vid) return;
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => {
    if (mq.matches) {
      vid.pause?.();
      vid.removeAttribute?.("autoplay");
    }
  };
  mq.addEventListener?.("change", apply) ?? mq.addListener?.(apply);
  apply();
})();

/* ========== 2. Treatments Grid Renderer ========== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const grid = $("#treatmentsGrid");
  if (!grid) return;

  const status = $("#treatmentsStatus");
  const search = $("#svcSearch");
  const catSel = $("#svcCategory");
  const chips = $$(".chip");
  const prev = $("#pgPrev");
  const next = $("#pgNext");
  const dots = $("#pgDots");

  const PIC = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`;

  const T = [
    { id: "rct", title: "Root Canal Treatment", category: "Tooth Saving",
      desc: "Painless single-visit RCT with RVG & apex locator.",
      url: "/specialities/root-canal.html", img: PIC("rct"),
      keywords: "root canal pain swelling abscess" },
    { id: "implants", title: "Dental Implants", category: "Implants & Replacement",
      desc: "Replace missing teeth with guided digital planning.",
      url: "/specialities/implants.html", img: PIC("implants"),
      keywords: "implants missing tooth full arch" },
    { id: "braces", title: "Braces (Metal/Ceramic)", category: "Tooth Alignment",
      desc: "Correct crowding, gaps, and bite issues.",
      url: "/specialities/braces.html", img: PIC("braces"),
      keywords: "braces orthodontics crowding" },
    { id: "aligners", title: "Clear Aligners (Invisalign®)", category: "Tooth Alignment",
      desc: "Nearly invisible trays with 3D simulation.",
      url: "/specialities/invisalign.html", img: PIC("aligners"),
      keywords: "aligners invisalign trays" },
    { id: "wisdom", title: "Wisdom Tooth Extraction", category: "Oral Surgery",
      desc: "Safe removal of impacted or painful third molars.",
      url: "/specialities/extraction.html", img: PIC("wisdom"),
      keywords: "wisdom tooth extraction pericoronitis" },
    { id: "whitening", title: "Teeth Whitening", category: "Cosmetic & Smile",
      desc: "In-clinic and take-home whitening with sensitivity control.",
      url: "/specialities/scaling-whitening.html", img: PIC("whitening"),
      keywords: "whitening bleaching stains" },
    { id: "gums", title: "Gum Treatment", category: "Gum & Periodontics",
      desc: "Deep cleaning, laser therapy, and grafts for healthy gums.",
      url: "/specialities/gum-surgeries.html", img: PIC("gums"),
      keywords: "gum bleeding scaling" },
    { id: "kids", title: "Kids Dentistry", category: "Kids & Family",
      desc: "Gentle pediatric care, sealants, and habit counseling.",
      url: "/specialities/kids-dentistry.html", img: PIC("kids"),
      keywords: "kids pediatric cavities" }
  ];

  const state = { q: "", cat: "all", page: 1, per: 6, items: T };

  const card = (t) => `
    <article class="t-card" data-id="${t.id}">
      <div class="t-media">
        <img src="${t.img}" alt="${t.title}" loading="lazy">
      </div>
      <div class="t-body">
        <div class="t-title">${t.title}</div>
        <p class="t-desc">${t.desc}</p>
        <div class="t-actions">
          <a class="t-btn" href="${t.url}"><i class="bx bx-link-external"></i> Learn</a>
          <a class="t-btn" href="#get-in-touch"><i class="bx bx-calendar"></i> Book</a>
        </div>
      </div>
    </article>`;

  const paginate = (arr, p, per) => arr.slice((p - 1) * per, p * per);

  const applyFilters = () => {
    const q = state.q.trim().toLowerCase();
    const cat = state.cat;
    state.items = T.filter((t) => {
      const okCat = cat === "all" || t.category === cat;
      const blob = `${t.title} ${t.desc} ${t.category} ${t.keywords}`.toLowerCase();
      const okQ = !q || blob.includes(q);
      return okCat && okQ;
    });
    state.page = 1;
    render();
  };

  const render = () => {
    const { items, page, per } = state;
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / per));
    state.page = Math.min(page, pages);

    grid.innerHTML = (paginate(items, state.page, per).map(card).join("")) || "<p>No results.</p>";

    status.textContent = total
      ? `${total} treatment${total > 1 ? "s" : ""}`
      : "No treatments found.";

    prev.disabled = state.page === 1;
    next.disabled = state.page === pages;

    dots.innerHTML = Array.from({ length: pages }, (_, i) => {
      const cur = i + 1 === state.page;
      return `<span class="dot" data-page="${i+1}" aria-current="${cur}"></span>`;
    }).join("");
  };

  search?.addEventListener("input", (e) => { state.q = e.target.value; applyFilters(); });
  catSel?.addEventListener("change", (e) => { state.cat = e.target.value; applyFilters(); });
  chips.forEach(ch => ch.addEventListener("click", () => {
    state.q = ch.dataset.chip || "";
    if (search) search.value = state.q;
    applyFilters();
  }));
  prev?.addEventListener("click", () => { state.page--; render(); });
  next?.addEventListener("click", () => { state.page++; render(); });
  dots?.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-page]");
    if (!dot) return;
    state.page = +dot.dataset.page;
    render();
    grid.scrollIntoView({ behavior: "smooth" });
  });

  render();
})();

/* ========== 3. Appointment Booking ========== */
(() => {
  const tz = "Asia/Kolkata";
  const clinicPhone = "918610425342";

  const form = document.getElementById("apptForm");
  if (!form) return;

  const daySelect = document.getElementById("daySelect");
  const timeSelect = document.getElementById("timeSelect");
  const summary = document.getElementById("summaryText");
  const bookBtn = document.getElementById("bookBtn");
  const toast = document.getElementById("apptToast");
  const doctorSelect = document.getElementById("doctorSelect");

  const hours = { 0: [15, 22], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 22], 5: [11, 22], 6: [11, 22] };

  const fmtDay = (d) => d.toLocaleDateString("en-IN", { timeZone: tz, weekday: "short", day: "2-digit", month: "short" });
  const fmtISO = (d) => d.toISOString();
  const fmtTime = (d) => d.toLocaleTimeString("en-IN", { timeZone: tz, hour: "2-digit", minute: "2-digit" });

  function buildDays() {
    daySelect.innerHTML = "";
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const opt = document.createElement("option");
      opt.value = d.toISOString();
      opt.textContent = fmtDay(d);
      daySelect.appendChild(opt);
    }
  }

  function buildTimes(dayIso) {
    timeSelect.innerHTML = '<option value="">Select time</option>';
    if (!dayIso) return;

    const d = new Date(dayIso);
    const [open, close] = hours[d.getDay()] || [0, 0];
    const start = new Date(d); start.setHours(open, 0, 0, 0);
    const end = new Date(d); end.setHours(close, 0, 0, 0);

    const now = new Date();
    for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + 30)) {
      if (t < now) continue;
      const iso = fmtISO(t);
      const opt = document.createElement("option");
      opt.value = iso;
      opt.textContent = fmtTime(new Date(iso));
      timeSelect.appendChild(opt);
    }
  }

  function updateSummary() {
    const d = daySelect.value ? new Date(daySelect.value) : null;
    const t = timeSelect.value ? new Date(timeSelect.value) : null;
    if (d && t) {
      summary.textContent = `${fmtDay(d)} • ${fmtTime(t)}`;
      bookBtn.disabled = false;
    } else {
      summary.textContent = "Choose a day & time.";
      bookBtn.disabled = true;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get("name");
    const phone = fd.get("phone");
    const service = fd.get("service");
    const doctor = fd.get("doctor") || "Any available doctor";
    const notes = fd.get("notes");

    const d = daySelect.value ? new Date(daySelect.value) : null;
    const t = timeSelect.value ? new Date(timeSelect.value) : null;

    if (!d || !t) return;

    const msg = `Hi Noble Dental Care,
I'd like to book:
• Name: ${name}
• Phone: ${phone}
• Service: ${service}
• Doctor: ${doctor}
• Time: ${fmtDay(d)} • ${fmtTime(t)} (IST)
${notes ? "• Notes: " + notes : ""}`;

    const url = `https://wa.me/${clinicPhone}?text=${encodeURIComponent(msg)}`;
    toast.hidden = false;
    setTimeout(() => (toast.hidden = true), 2000);
    window.open(url, "_blank");
  });

  daySelect.addEventListener("change", () => { buildTimes(daySelect.value); updateSummary(); });
  timeSelect.addEventListener("change", updateSummary);

  buildDays();
  buildTimes(daySelect.value);
})();

