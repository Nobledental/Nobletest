/* ======================================================
   Noble Dental Care — site scripts (FULL)
   ====================================================== */

/* 0) Nav: mobile menu + submenu a11y */
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const list = document.querySelector('.nav-pill');
  const subBtn = document.querySelector('.submenu-toggle');
  const submenu = document.querySelector('.submenu');

  if (toggle && list) {
    const setOpen = (open) => {
      list.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
    };
    setOpen(false);
    toggle.addEventListener('click', () => setOpen(list.getAttribute('aria-hidden') === 'true'));
  }

  if (subBtn && submenu) {
    const setOpen = (open) => {
      subBtn.setAttribute('aria-expanded', String(open));
      submenu.setAttribute('aria-hidden', String(!open));
    };
    setOpen(false);
    subBtn.addEventListener('click', () => setOpen(submenu.getAttribute('aria-hidden') === 'true'));
    document.addEventListener('click', (e) => {
      if (!subBtn.contains(e.target) && !submenu.contains(e.target)) setOpen(false);
    });
  }
})();

/* 1) Reduced Motion for Hero Video */
(() => {
  const vid = document.querySelector(".blackhole-video");
  if (!vid) return;
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => { if (mq.matches) { vid.pause?.(); vid.removeAttribute?.("autoplay"); } };
  mq.addEventListener?.("change", apply) ?? mq.addListener?.(apply);
  apply();
})();

/* 2) Reviews rail slider + autoplay (respect reduced motion) */
(() => {
  const rail = document.getElementById('revRail');
  const prev = document.querySelector('.rev-nav.prev');
  const next = document.querySelector('.rev-nav.next');
  if (!rail || !prev || !next) return;

  const step = 380;
  prev.addEventListener('click', () => rail.scrollBy({ left: -step, behavior: 'smooth' }));
  next.addEventListener('click', () => rail.scrollBy({ left: step, behavior: 'smooth' }));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) {
    let auto = setInterval(() => rail.scrollBy({ left: step, behavior: 'smooth' }), 5000);
    rail.addEventListener('mouseenter', () => clearInterval(auto));
    rail.addEventListener('mouseleave', () => { auto = setInterval(() => rail.scrollBy({ left: step, behavior: 'smooth' }), 5000); });
  }
})();

/* 3) Appointment booking (WhatsApp handoff) — same behavior you liked */
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
    const a = document.createElement('a');
a.href = url;
a.target = '_blank';
a.rel = 'noopener noreferrer';
a.click();

if (navigator.share) {
  navigator.share({
    title: 'Book Appointment at Noble Dental Care',
    text: 'Appointment booking request',
    url
  }).catch(console.error);
} else {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
}

  });

  daySelect.addEventListener("change", () => { buildTimes(daySelect.value); updateSummary(); });
  timeSelect.addEventListener("change", updateSummary);

  buildDays();
  buildTimes(daySelect.value);
})();

/* 4) Meet Our Specialists: search + filter + popup + deep link */
(() => {
  const NDC_DOCTORS = window.NDC_DOCTORS || {};
  const grid = document.getElementById("docGrid");
  const search = document.getElementById("docSearch");
  const chips = document.querySelectorAll('.chip--ghost');
  const sheet = document.getElementById("docSheet");
  if (!grid || !sheet) return;
  const closeBtn = sheet.querySelector('.sheet-close');

  const activeFilter = () => document.querySelector('.chip--ghost[aria-pressed="true"]')?.dataset.filter || "all";

  function applyFilter(tag = activeFilter()){
    const q = (search?.value || "").toLowerCase().trim();
    grid.querySelectorAll('.ndc-card').forEach(card=>{
      const tags = (card.dataset.tags || "").toLowerCase();
      const showByTag = tag === "all" || tags.includes(tag);
      const blob = card.textContent.toLowerCase();
      const showBySearch = !q || blob.includes(q) || tags.includes(q);
      card.style.display = (showByTag && showBySearch) ? "" : "none";
    });
  }

  chips.forEach(c=>{
    c.addEventListener('click',()=>{
      chips.forEach(x=>x.setAttribute('aria-pressed','false'));
      c.setAttribute('aria-pressed','true');
      if (search) search.value = "";
      applyFilter(c.dataset.filter);
    });
  });

  search?.addEventListener('input',()=>applyFilter());
  document.querySelector('.ndc-search .clear')?.addEventListener('click',()=>{ if (search) search.value=""; applyFilter(); });

  // open popup (click card)
  grid.addEventListener('click', (e)=>{
    const card = e.target.closest('.ndc-card'); if(!card) return;
    const id = card.dataset.id; const d = NDC_DOCTORS[id]; if(!d) return;

    sheet.querySelector('#sheetHero').src = d.hero;
    sheet.querySelector('#sheetHero').alt = d.name;
    sheet.querySelector('#sheetTitle').textContent = d.name;
    sheet.querySelector('#sheetRole').textContent = d.role;
    sheet.querySelector('#sheetBio').textContent = d.bio;

    const ex = sheet.querySelector('#sheetExpertise'); 
    ex.innerHTML = ""; 
    (d.expertise||[]).forEach(k=>{
      const b = document.createElement('span'); b.className="chip"; b.textContent=k; ex.appendChild(b);
    });

    const books = sheet.querySelector('#sheetBooks');
    books.innerHTML = "";
    (d.books||[]).forEach(b=>{
      const item = document.createElement('div'); item.className="book";
      item.innerHTML = `<img src="${b.img}" alt="${b.t}" width="60" height="86" loading="lazy" decoding="async">
                        <div><div class="t">${b.t}</div><div class="p">${b.p||""}</div>
                        <a class="btn outline" target="_blank" rel="noopener" href="${b.href||"#"}">View</a></div>`;
      books.appendChild(item);
    });

    sheet.querySelector('#sheetBook').onclick = (ev) => {
      ev.preventDefault();
      sheet.close();
      document.getElementById('get-in-touch')?.scrollIntoView({behavior:'smooth'});
      const sel = document.getElementById('doctorSelect');
      if(sel){ sel.value = d.name; sel.dispatchEvent(new Event('change')); }
      history.replaceState(null,"",location.pathname);
    };

    sheet.showModal();
    history.replaceState(null,"",`#${id}`);
  });

  // close
  closeBtn.addEventListener('click',()=>{ sheet.close(); history.replaceState(null,"",location.pathname); });
  sheet.addEventListener('click',e=>{ if(e.target===sheet) { sheet.close(); history.replaceState(null,"",location.pathname);} });
  window.addEventListener('keydown',e=>{ if(e.key==="Escape" && sheet.open) sheet.close(); });

  // deep-link open
  const deep = location.hash.replace('#','');
  if(deep){ grid.querySelector(`[data-id="${deep}"]`)?.click(); }
})();

function injectDoctorSchema(d, id) {
  const existing = document.querySelector(`script[data-doctor-id="${id}"]`);
  if (existing) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": d.name,
    "jobTitle": d.role,
    "worksFor": {
      "@type": "MedicalClinic",
      "name": "Noble Dental Care",
      "url": window.location.origin
    },
    "url": `${window.location.href}#${id}`,
    "description": d.bio,
    "sameAs": d.socials || []
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-doctor-id', id);
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}


/* 5) CARE GUIDE: data + renderer (simple, evidence-aligned) */
(() => {
  const D = [
    {
      id:"cleaning",
      title:"Professional Tooth Cleaning (Scaling & Polishing)",
      category:"Prevention",
      img:"/images/care/cleaning.jpg",
      keywords:["tartar","stains","bleeding","bad breath"],
      overview:[
        "Removes tartar and plaque from above/below the gum line.",
        "Improves gum health, breath, and prevents cavities.",
        "Recommended every 6–12 months depending on risk."
      ],
      postop:["Mild sensitivity 1–2 days is common.","Brush 2×/day with fluoride toothpaste.","Use a soft brush; resume flossing the next day."],
      tips:["Avoid strongly colored foods for 24h if polished.","If gums bleed often—book an evaluation for periodontitis."],
      pros:["Non-invasive","Prevents gum disease","Freshens breath"],
      cons:["Temporary sensitivity","Needs periodic repeats"],
      link:"/specialities/scaling-whitening.html",
      refs:["ADA/IDA preventive guidance","Carranza’s Clinical Periodontology"]
    },
    {
      id:"rct",
      title:"Root Canal Treatment (RCT)",
      category:"Tooth saving",
      img:"/images/care/rct.jpg",
      keywords:["pain","decay","abscess","swelling"],
      overview:[
        "Removes infected nerve tissue and disinfects canals.",
        "Relieves pain and saves the natural tooth.",
        "Crown protection is advised after RCT."
      ],
      postop:["Numbness for a few hours is expected.","Chew on the other side until crown is placed.","Pain meds/antibiotics only if prescribed."],
      tips:["If pain on biting persists—schedule bite adjustment.","Don’t delay the crown to prevent cracks."],
      pros:["Tooth preservation","Pain relief"],
      cons:["Multiple steps","Tooth needs crown"],
      link:"/specialities/root-canal.html",
      refs:["Cohen’s Pathways of the Pulp","Ingle’s Endodontics"]
    },
    {
      id:"wisdom",
      title:"Wisdom Tooth Extraction",
      category:"Oral surgery",
      img:"/images/care/wisdom.jpg",
      keywords:["impacted","swelling","pericoronitis","trismus"],
      overview:[
        "Removes problematic third molars causing pain/infection.",
        "CBCT or RVG imaging may be required for planning.",
        "Antibiotics/analgesics per case; follow strict after-care."
      ],
      postop:["Swelling peaks at 48–72h; ice packs first 24h.","Soft diet; avoid straws & smoking for 72h.","Salt-water rinse after 24h; keep the socket clean."],
      tips:["Report persistent numbness or bleeding immediately.","Keep head elevated the first night."],
      pros:["Resolves infection/pain","Prevents recurrent pericoronitis"],
      cons:["Downtime 1–3 days","Swelling/discomfort"],
      link:"/specialities/extraction.html",
      refs:["ADA tooth extraction guidance"]
    },
    {
      id:"aligners",
      title:"Clear Aligners (Invisalign®)",
      category:"Orthodontics",
      img:"/images/care/aligners.jpg",
      keywords:["crowding","gaps","smile","trays"],
      overview:[
        "Series of clear trays gradually move teeth to alignment.",
        "3D setup preview and compliance tracking.",
        "Wear 20–22h/day for best results."
      ],
      postop:["Change trays per schedule.","Use chewies; keep trays clean.","Expect mild pressure for 1–2 days after each change."],
      tips:["Great for aesthetics; compliance is critical.","Refinement stages are common—plan time accordingly."],
      pros:["Nearly invisible","Easier hygiene"],
      cons:["User compliance","Cost vs conventional"],
      link:"/specialities/invisalign.html",
      refs:["Contemporary Orthodontics"]
    }
  ];

  // Hooks
  const imgA = document.getElementById('vkImgA');
  const imgB = document.getElementById('vkImgB');
  const vkTitle = document.getElementById('vkTitle');
  const vkBadge = document.getElementById('vkBadge');
  const vkKeywords = document.getElementById('vkKeywords');
  const vkOverview = document.getElementById('vkOverview');
  const vkPostop = document.getElementById('vkPostop');
  const vkTips = document.getElementById('vkTips');
  const vkProsCons = document.getElementById('vkProsCons');
  const vkDots = document.getElementById('vkDots');
  const vkPrev = document.getElementById('vkPrev');
  const vkNext = document.getElementById('vkNext');
  const vkSearch = document.getElementById('vkSearch');
  const vkCategory = document.getElementById('vkCategory');
  const vkChips = document.getElementById('vkChips');
  const vkDeepLink = document.getElementById('vkDeepLink');
  const vkPDF = document.getElementById('vkPDF');
  const vkChatLog = document.getElementById('vkChatLog');
  const vkChatInput = document.getElementById('vkChatInput');
  const vkChatSend = document.getElementById('vkChatSend');
  const datalist = document.getElementById('vk-datalist');

  if (!imgA || !imgB) return;

  let idx = 0;
  let filtered = D.slice();

  function setImg(src) {
    const showA = imgA.classList.contains('is-show');
    const showEl = showA ? imgB : imgA;
    const hideEl = showA ? imgA : imgB;
    showEl.src = src;
    showEl.classList.add('is-show');
    hideEl.classList.remove('is-show');
  }

  const bullets = (arr) => `<ul>${arr.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  const pills = (arr) => arr.map(k=>`<span class="badge">${k}</span>`).join(' ');

  function render() {
    if (!filtered.length) {
      vkTitle.textContent = "No results";
      vkBadge.textContent = "";
      vkKeywords.textContent = "";
      vkOverview.innerHTML = "";
      vkPostop.innerHTML = "";
      vkTips.innerHTML = "";
      vkProsCons.innerHTML = "";
      vkDots.innerHTML = "";
      return;
    }
    const it = filtered[idx];
    vkTitle.textContent = it.title;
    vkBadge.textContent = it.category;
    vkKeywords.textContent = it.keywords.join(" • ");
    setImg(it.img);
    vkOverview.innerHTML = bullets(it.overview);
    vkPostop.innerHTML = bullets(it.postop);
    vkTips.innerHTML = bullets(it.tips);
    vkProsCons.innerHTML = `
      <div class="callout"><strong>Pros:</strong> ${pills(it.pros)}</div>
      <div class="callout" style="margin-top:8px"><strong>Consider:</strong> ${pills(it.cons)}</div>
    `;

    // Deep link + PDF
    const url = new URL(location.href);
    url.hash = `guide-${it.id}`;
    vkDeepLink.href = url.toString();
    vkPDF.href = it.link;

    buildDots();
    updateChipFocus();
  }

  function buildDots() {
    vkDots.innerHTML = filtered.map((_, i) => 
      `<span class="dot" role="button" tabindex="0" data-i="${i}" aria-current="${i===idx}"></span>`
    ).join('');
  }

  function updateChipFocus() {
    // highlight active category in chips (optional)
    const cat = filtered[idx]?.category?.toLowerCase() || "all";
    vkChips.querySelectorAll('button').forEach(b=>{
      const on = b.dataset.filter === 'all' ? (vkCategory.value === 'all') : (b.dataset.filter === vkCategory.value || cat.includes(b.dataset.filter));
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function goto(i) {
    if (!filtered.length) return;
    idx = (i + filtered.length) % filtered.length;
    render();
  }

  function applyFilters() {
    const q = (vkSearch.value || "").toLowerCase().trim();
    const cat = (vkCategory.value || "all").toLowerCase();

    filtered = D.filter(d => {
      const okCat = cat === "all" || d.category.toLowerCase() === cat;
      const blob = `${d.title} ${d.category} ${d.keywords.join(" ")}`.toLowerCase();
      const okQ = !q || blob.includes(q);
      return okCat && okQ;
    });

    // set suggestions (datalist)
    if (datalist) {
      datalist.innerHTML = filtered.slice(0,8).map(d=>`<option value="${d.title}">`).join("");
    }

    idx = 0;
    render();
  }

  // Controls
  vkPrev?.addEventListener('click', () => goto(idx - 1));
  vkNext?.addEventListener('click', () => goto(idx + 1));

  vkDots?.addEventListener('click', (e) => {
    const el = e.target.closest('[data-i]');
    if (!el) return;
    goto(+el.dataset.i);
  });
  vkDots?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const el = e.target.closest('[data-i]');
      if (el) goto(+el.dataset.i);
    }
  });

  // Search & category
  vkSearch?.addEventListener('input', applyFilters);
  vkCategory?.addEventListener('change', applyFilters);

  // Chips click (maps to category or keywords)
  vkChips?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-filter]');
    if (!b) return;
    const f = b.dataset.filter;
    if (["all","prevention","tooth saving","oral surgery","orthodontics"].includes(f)) {
      vkCategory.value = f === "all" ? "all" : f;
      applyFilters();
    } else {
      vkSearch.value = f;
      applyFilters();
    }
  });

  // Deep-link load (#guide-id)
  (function openFromHash(){
    const m = location.hash.match(/^#guide-(.+)$/);
    if (!m) { render(); return; }
    const id = m[1];
    const i = D.findIndex(x=>x.id===id);
    if (i >= 0) {
      filtered = D.slice();
      idx = i;
    }
    render();
  })();

  // Mini Q&A chat — pulls snippets from current card
  function chatPush(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role === 'bot' ? 'msg--bot' : 'msg--user'}`;
    div.textContent = text;
    vkChatLog.appendChild(div);
    vkChatLog.scrollTop = vkChatLog.scrollHeight;
  }

  function chatReply(q) {
    if (!filtered.length) return;
    const it = filtered[idx];
    const text = (q||"").toLowerCase();

    let ans = "";
    if (text.includes("pain") || text.includes("hurt")) {
      ans = it.id === "rct"
        ? "During RCT, local anesthesia keeps you comfortable. Mild soreness for 1–2 days is common and manageable with recommended meds."
        : "We use local anesthesia. Expect mild pressure; strong pain isn’t expected. Let us know any sensitivity and we’ll adjust.";
    } else if (text.includes("cost") || text.includes("price")) {
      ans = "Costs vary by case complexity, materials and imaging. We share a printed estimate upfront and discuss value-focused options before you decide.";
    } else if (text.includes("time") || text.includes("long") || text.includes("duration")) {
      ans = it.id === "cleaning"
        ? "Cleaning usually takes 30–45 minutes depending on tartar and stain build-up."
        : it.id === "rct"
          ? "Single-visit RCT is common; complex canals may need 2 visits. Each visit is typically 45–60 minutes."
          : it.id === "wisdom"
            ? "Surgical extraction time varies (20–45 minutes per tooth). Plan easy rest the same day."
            : "Most aligner review visits are quick; tray change cycles are typically every 10–14 days.";
    } else if (text.includes("after") || text.includes("post") || text.includes("care")) {
      ans = `Post-op tips: ${it.postop.slice(0,2).join(" ")} For a complete list, see “After-care” tab above.`;
    } else {
      ans = `Key points: ${it.overview.slice(0,2).join(" ")} Next step—book a quick exam so we can personalise this for you.`;
    }

    chatPush('bot', ans);
  }

  vkChatSend?.addEventListener('click', () => {
    const v = (vkChatInput.value || "").trim();
    if (!v) return;
    chatPush('user', v);
    vkChatInput.value = "";
    setTimeout(()=>chatReply(v), 250);
  });
  vkChatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      vkChatSend?.click();
    }
  });

  // initial render
  render();
})();

/* 6) Optional: preload doctor hero images for instant sheet open */
(() => {
  function preload(src){ if(!src) return; const i = new Image(); i.src = src; }
  if (window.NDC_DOCTORS) {
    Object.values(window.NDC_DOCTORS).forEach(d => preload(d.hero));
  }
})();

/* 7) Soft fade-in on load */
function debounceFadeIn() {
  let timer;
  const items = document.querySelectorAll('.surface, .ndc-card, .rev-card, .t-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          entry.target.classList.add('fade-in');
        }, 100);
      }
    });
  }, { threshold: 0.1 });

  items.forEach((el) => {
    el.style.opacity = 0;
    observer.observe(el);
  });
}

window.addEventListener('DOMContentLoaded', debounceFadeIn);

/* 8) FAQ toggle (guarded) */
(() => {
  document.querySelectorAll('.faq-item button').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const ans = btn.nextElementSibling;
      if (ans) ans.hidden = expanded;
    });
  });
})();



/* ======================================================
   Noble Dental Care — site scripts (FULL)
   ====================================================== */

/* 0) Nav: mobile menu + submenu a11y */
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const list = document.querySelector('.nav-pill');
  const subBtn = document.querySelector('.submenu-toggle');
  const submenu = document.querySelector('.submenu');

  if (toggle && list) {
    const setOpen = (open) => {
      list.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
    };
    setOpen(false);
    toggle.addEventListener('click', () => setOpen(list.getAttribute('aria-hidden') === 'true'));
  }

  if (subBtn && submenu) {
    const setOpen = (open) => {
      subBtn.setAttribute('aria-expanded', String(open));
      submenu.setAttribute('aria-hidden', String(!open));
    };
    setOpen(false);
    subBtn.addEventListener('click', () => setOpen(submenu.getAttribute('aria-hidden') === 'true'));
    document.addEventListener('click', (e) => {
      if (!subBtn.contains(e.target) && !submenu.contains(e.target)) setOpen(false);
    });
  }
})();

/* 1) Reduced Motion for Hero Video */
(() => {
  const vid = document.querySelector(".blackhole-video");
  if (!vid) return;
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => { if (mq.matches) { vid.pause?.(); vid.removeAttribute?.("autoplay"); } };
  mq.addEventListener?.("change", apply) ?? mq.addListener?.(apply);
  apply();
})();

/* 2) Reviews rail slider + autoplay (respect reduced motion) */
(() => {
  const rail = document.getElementById('revRail');
  const prev = document.querySelector('.rev-nav.prev');
  const next = document.querySelector('.rev-nav.next');
  if (!rail || !prev || !next) return;

  const step = 380;
  prev.addEventListener('click', () => rail.scrollBy({ left: -step, behavior: 'smooth' }));
  next.addEventListener('click', () => rail.scrollBy({ left: step, behavior: 'smooth' }));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) {
    let auto = setInterval(() => rail.scrollBy({ left: step, behavior: 'smooth' }), 5000);
    rail.addEventListener('mouseenter', () => clearInterval(auto));
    rail.addEventListener('mouseleave', () => { auto = setInterval(() => rail.scrollBy({ left: step, behavior: 'smooth' }), 5000); });
  }
})();

/* 3) Appointment booking (WhatsApp handoff) — same behavior you liked */
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

/* 4) Meet Our Specialists: search + filter + popup + deep link */
(() => {
  const NDC_DOCTORS = window.NDC_DOCTORS || {};
  const grid = document.getElementById("docGrid");
  const search = document.getElementById("docSearch");
  const chips = document.querySelectorAll('.chip--ghost');
  const sheet = document.getElementById("docSheet");
  if (!grid || !sheet) return;
  const closeBtn = sheet.querySelector('.sheet-close');

  const activeFilter = () => document.querySelector('.chip--ghost[aria-pressed="true"]')?.dataset.filter || "all";

  function applyFilter(tag = activeFilter()){
    const q = (search?.value || "").toLowerCase().trim();
    grid.querySelectorAll('.ndc-card').forEach(card=>{
      const tags = (card.dataset.tags || "").toLowerCase();
      const showByTag = tag === "all" || tags.includes(tag);
      const blob = card.textContent.toLowerCase();
      const showBySearch = !q || blob.includes(q) || tags.includes(q);
      card.style.display = (showByTag && showBySearch) ? "" : "none";
    });
  }

  chips.forEach(c=>{
    c.addEventListener('click',()=>{
      chips.forEach(x=>x.setAttribute('aria-pressed','false'));
      c.setAttribute('aria-pressed','true');
      if (search) search.value = "";
      applyFilter(c.dataset.filter);
    });
  });

  search?.addEventListener('input',()=>applyFilter());
  document.querySelector('.ndc-search .clear')?.addEventListener('click',()=>{ if (search) search.value=""; applyFilter(); });

  // open popup (click card)
  grid.addEventListener('click', (e)=>{
    const card = e.target.closest('.ndc-card'); if(!card) return;
    const id = card.dataset.id; const d = NDC_DOCTORS[id]; if(!d) return;

    sheet.querySelector('#sheetHero').src = d.hero;
    sheet.querySelector('#sheetHero').alt = d.name;
    sheet.querySelector('#sheetTitle').textContent = d.name;
    sheet.querySelector('#sheetRole').textContent = d.role;
    sheet.querySelector('#sheetBio').textContent = d.bio;

    const ex = sheet.querySelector('#sheetExpertise'); 
    ex.innerHTML = ""; 
    (d.expertise||[]).forEach(k=>{
      const b = document.createElement('span'); b.className="chip"; b.textContent=k; ex.appendChild(b);
    });

    const books = sheet.querySelector('#sheetBooks');
    books.innerHTML = "";
    (d.books||[]).forEach(b=>{
      const item = document.createElement('div'); item.className="book";
      item.innerHTML = `<img src="${b.img}" alt="${b.t}" width="60" height="86" loading="lazy" decoding="async">
                        <div><div class="t">${b.t}</div><div class="p">${b.p||""}</div>
                        <a class="btn outline" target="_blank" rel="noopener" href="${b.href||"#"}">View</a></div>`;
      books.appendChild(item);
    });

    sheet.querySelector('#sheetBook').onclick = (ev) => {
      ev.preventDefault();
      sheet.close();
      document.getElementById('get-in-touch')?.scrollIntoView({behavior:'smooth'});
      const sel = document.getElementById('doctorSelect');
      if(sel){ sel.value = d.name; sel.dispatchEvent(new Event('change')); }
      history.replaceState(null,"",location.pathname);
    };

    sheet.showModal();
    history.replaceState(null,"",`#${id}`);
  });

  // close
  closeBtn.addEventListener('click',()=>{ sheet.close(); history.replaceState(null,"",location.pathname); });
  sheet.addEventListener('click',e=>{ if(e.target===sheet) { sheet.close(); history.replaceState(null,"",location.pathname);} });
  window.addEventListener('keydown',e=>{ if(e.key==="Escape" && sheet.open) sheet.close(); });

  // deep-link open
  const deep = location.hash.replace('#','');
  if(deep){ grid.querySelector(`[data-id="${deep}"]`)?.click(); }
})();

/* 5) CARE GUIDE: data + renderer (simple, evidence-aligned) */
(() => {
  const D = [
    {
      id:"cleaning",
      title:"Professional Tooth Cleaning (Scaling & Polishing)",
      category:"Prevention",
      img:"/images/care/cleaning.jpg",
      keywords:["tartar","stains","bleeding","bad breath"],
      overview:[
        "Removes tartar and plaque from above/below the gum line.",
        "Improves gum health, breath, and prevents cavities.",
        "Recommended every 6–12 months depending on risk."
      ],
      postop:["Mild sensitivity 1–2 days is common.","Brush 2×/day with fluoride toothpaste.","Use a soft brush; resume flossing the next day."],
      tips:["Avoid strongly colored foods for 24h if polished.","If gums bleed often—book an evaluation for periodontitis."],
      pros:["Non-invasive","Prevents gum disease","Freshens breath"],
      cons:["Temporary sensitivity","Needs periodic repeats"],
      link:"/specialities/scaling-whitening.html",
      refs:["ADA/IDA preventive guidance","Carranza’s Clinical Periodontology"]
    },
    {
      id:"rct",
      title:"Root Canal Treatment (RCT)",
      category:"Tooth saving",
      img:"/images/care/rct.jpg",
      keywords:["pain","decay","abscess","swelling"],
      overview:[
        "Removes infected nerve tissue and disinfects canals.",
        "Relieves pain and saves the natural tooth.",
        "Crown protection is advised after RCT."
      ],
      postop:["Numbness for a few hours is expected.","Chew on the other side until crown is placed.","Pain meds/antibiotics only if prescribed."],
      tips:["If pain on biting persists—schedule bite adjustment.","Don’t delay the crown to prevent cracks."],
      pros:["Tooth preservation","Pain relief"],
      cons:["Multiple steps","Tooth needs crown"],
      link:"/specialities/root-canal.html",
      refs:["Cohen’s Pathways of the Pulp","Ingle’s Endodontics"]
    },
    {
      id:"wisdom",
      title:"Wisdom Tooth Extraction",
      category:"Oral surgery",
      img:"/images/care/wisdom.jpg",
      keywords:["impacted","swelling","pericoronitis","trismus"],
      overview:[
        "Removes problematic third molars causing pain/infection.",
        "CBCT or RVG imaging may be required for planning.",
        "Antibiotics/analgesics per case; follow strict after-care."
      ],
      postop:["Swelling peaks at 48–72h; ice packs first 24h.","Soft diet; avoid straws & smoking for 72h.","Salt-water rinse after 24h; keep the socket clean."],
      tips:["Report persistent numbness or bleeding immediately.","Keep head elevated the first night."],
      pros:["Resolves infection/pain","Prevents recurrent pericoronitis"],
      cons:["Downtime 1–3 days","Swelling/discomfort"],
      link:"/specialities/extraction.html",
      refs:["ADA tooth extraction guidance"]
    },
    {
      id:"aligners",
      title:"Clear Aligners (Invisalign®)",
      category:"Orthodontics",
      img:"/images/care/aligners.jpg",
      keywords:["crowding","gaps","smile","trays"],
      overview:[
        "Series of clear trays gradually move teeth to alignment.",
        "3D setup preview and compliance tracking.",
        "Wear 20–22h/day for best results."
      ],
      postop:["Change trays per schedule.","Use chewies; keep trays clean.","Expect mild pressure for 1–2 days after each change."],
      tips:["Great for aesthetics; compliance is critical.","Refinement stages are common—plan time accordingly."],
      pros:["Nearly invisible","Easier hygiene"],
      cons:["User compliance","Cost vs conventional"],
      link:"/specialities/invisalign.html",
      refs:["Contemporary Orthodontics"]
    }
  ];

  // Hooks
  const imgA = document.getElementById('vkImgA');
  const imgB = document.getElementById('vkImgB');
  const vkTitle = document.getElementById('vkTitle');
  const vkBadge = document.getElementById('vkBadge');
  const vkKeywords = document.getElementById('vkKeywords');
  const vkOverview = document.getElementById('vkOverview');
  const vkPostop = document.getElementById('vkPostop');
  const vkTips = document.getElementById('vkTips');
  const vkProsCons = document.getElementById('vkProsCons');
  const vkDots = document.getElementById('vkDots');
  const vkPrev = document.getElementById('vkPrev');
  const vkNext = document.getElementById('vkNext');
  const vkSearch = document.getElementById('vkSearch');
  const vkCategory = document.getElementById('vkCategory');
  const vkChips = document.getElementById('vkChips');
  const vkDeepLink = document.getElementById('vkDeepLink');
  const vkPDF = document.getElementById('vkPDF');
  const vkChatLog = document.getElementById('vkChatLog');
  const vkChatInput = document.getElementById('vkChatInput');
  const vkChatSend = document.getElementById('vkChatSend');
  const datalist = document.getElementById('vk-datalist');

  if (!imgA || !imgB) return;

  let idx = 0;
  let filtered = D.slice();

  function setImg(src) {
    const showA = imgA.classList.contains('is-show');
    const showEl = showA ? imgB : imgA;
    const hideEl = showA ? imgA : imgB;
    showEl.src = src;
    showEl.classList.add('is-show');
    hideEl.classList.remove('is-show');
  }

  const bullets = (arr) => `<ul>${arr.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  const pills = (arr) => arr.map(k=>`<span class="badge">${k}</span>`).join(' ');

  function render() {
    if (!filtered.length) {
      vkTitle.textContent = "No results";
      vkBadge.textContent = "";
      vkKeywords.textContent = "";
      vkOverview.innerHTML = "";
      vkPostop.innerHTML = "";
      vkTips.innerHTML = "";
      vkProsCons.innerHTML = "";
      vkDots.innerHTML = "";
      return;
    }
    const it = filtered[idx];
    vkTitle.textContent = it.title;
    vkBadge.textContent = it.category;
    vkKeywords.textContent = it.keywords.join(" • ");
    setImg(it.img);
    vkOverview.innerHTML = bullets(it.overview);
    vkPostop.innerHTML = bullets(it.postop);
    vkTips.innerHTML = bullets(it.tips);
    vkProsCons.innerHTML = `
      <div class="callout"><strong>Pros:</strong> ${pills(it.pros)}</div>
      <div class="callout" style="margin-top:8px"><strong>Consider:</strong> ${pills(it.cons)}</div>
    `;

    // Deep link + PDF
    const url = new URL(location.href);
    url.hash = `guide-${it.id}`;
    vkDeepLink.href = url.toString();
    vkPDF.href = it.link;

    buildDots();
    updateChipFocus();
  }

  function buildDots() {
    vkDots.innerHTML = filtered.map((_, i) => 
      `<span class="dot" role="button" tabindex="0" data-i="${i}" aria-current="${i===idx}"></span>`
    ).join('');
  }

  function updateChipFocus() {
    // highlight active category in chips (optional)
    const cat = filtered[idx]?.category?.toLowerCase() || "all";
    vkChips.querySelectorAll('button').forEach(b=>{
      const on = b.dataset.filter === 'all' ? (vkCategory.value === 'all') : (b.dataset.filter === vkCategory.value || cat.includes(b.dataset.filter));
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function goto(i) {
    if (!filtered.length) return;
    idx = (i + filtered.length) % filtered.length;
    render();
  }

  function applyFilters() {
    const q = (vkSearch.value || "").toLowerCase().trim();
    const cat = (vkCategory.value || "all").toLowerCase();

    filtered = D.filter(d => {
      const okCat = cat === "all" || d.category.toLowerCase() === cat;
      const blob = `${d.title} ${d.category} ${d.keywords.join(" ")}`.toLowerCase();
      const okQ = !q || blob.includes(q);
      return okCat && okQ;
    });

    // set suggestions (datalist)
    if (datalist) {
      datalist.innerHTML = filtered.slice(0,8).map(d=>`<option value="${d.title}">`).join("");
    }

    idx = 0;
    render();
  }

  // Controls
  vkPrev?.addEventListener('click', () => goto(idx - 1));
  vkNext?.addEventListener('click', () => goto(idx + 1));

  vkDots?.addEventListener('click', (e) => {
    const el = e.target.closest('[data-i]');
    if (!el) return;
    goto(+el.dataset.i);
  });
  vkDots?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const el = e.target.closest('[data-i]');
      if (el) goto(+el.dataset.i);
    }
  });

  // Search & category
  vkSearch?.addEventListener('input', applyFilters);
  vkCategory?.addEventListener('change', applyFilters);

  // Chips click (maps to category or keywords)
  vkChips?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-filter]');
    if (!b) return;
    const f = b.dataset.filter;
    if (["all","prevention","tooth saving","oral surgery","orthodontics"].includes(f)) {
      vkCategory.value = f === "all" ? "all" : f;
      applyFilters();
    } else {
      vkSearch.value = f;
      applyFilters();
    }
  });

  // Deep-link load (#guide-id)
  (function openFromHash(){
    const m = location.hash.match(/^#guide-(.+)$/);
    if (!m) { render(); return; }
    const id = m[1];
    const i = D.findIndex(x=>x.id===id);
    if (i >= 0) {
      filtered = D.slice();
      idx = i;
    }
    render();
  })();

  // Mini Q&A chat — pulls snippets from current card
  function chatPush(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role === 'bot' ? 'msg--bot' : 'msg--user'}`;
    div.textContent = text;
    vkChatLog.appendChild(div);
    vkChatLog.scrollTop = vkChatLog.scrollHeight;
  }

  function chatReply(q) {
    if (!filtered.length) return;
    const it = filtered[idx];
    const text = (q||"").toLowerCase();

    let ans = "";
    if (text.includes("pain") || text.includes("hurt")) {
      ans = it.id === "rct"
        ? "During RCT, local anesthesia keeps you comfortable. Mild soreness for 1–2 days is common and manageable with recommended meds."
        : "We use local anesthesia. Expect mild pressure; strong pain isn’t expected. Let us know any sensitivity and we’ll adjust.";
    } else if (text.includes("cost") || text.includes("price")) {
      ans = "Costs vary by case complexity, materials and imaging. We share a printed estimate upfront and discuss value-focused options before you decide.";
    } else if (text.includes("time") || text.includes("long") || text.includes("duration")) {
      ans = it.id === "cleaning"
        ? "Cleaning usually takes 30–45 minutes depending on tartar and stain build-up."
        : it.id === "rct"
          ? "Single-visit RCT is common; complex canals may need 2 visits. Each visit is typically 45–60 minutes."
          : it.id === "wisdom"
            ? "Surgical extraction time varies (20–45 minutes per tooth). Plan easy rest the same day."
            : "Most aligner review visits are quick; tray change cycles are typically every 10–14 days.";
    } else if (text.includes("after") || text.includes("post") || text.includes("care")) {
      ans = `Post-op tips: ${it.postop.slice(0,2).join(" ")} For a complete list, see “After-care” tab above.`;
    } else {
      ans = `Key points: ${it.overview.slice(0,2).join(" ")} Next step—book a quick exam so we can personalise this for you.`;
    }

    chatPush('bot', ans);
  }

  vkChatSend?.addEventListener('click', () => {
    const v = (vkChatInput.value || "").trim();
    if (!v) return;
    chatPush('user', v);
    vkChatInput.value = "";
    setTimeout(()=>chatReply(v), 250);
  });
  vkChatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      vkChatSend?.click();
    }
  });

  // initial render
  render();
})();

/* 6) Optional: preload doctor hero images for instant sheet open */
(() => {
  function preload(src){ if(!src) return; const i = new Image(); i.src = src; }
  if (window.NDC_DOCTORS) {
    Object.values(window.NDC_DOCTORS).forEach(d => preload(d.hero));
  }
})();

/* 7) Soft fade-in on load */
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.surface, .ndc-card, .rev-card, .t-card').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.12}s`;
    el.classList.add('fade-in');
  });
});

/* 8) FAQ toggle (guarded) */
(() => {
  document.querySelectorAll('.faq-item button').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const ans = btn.nextElementSibling;
      if (ans) ans.hidden = expanded;
    });
  });
})();

/* =======================================================
   Noble Dental Care · Credentials Ticker (Voka Bright+)
   Pairs with the upgraded CSS you added.
   ======================================================= */
(() => {
  // Hooks
  const track   = document.getElementById('certsTrack');             // <ul class="ticker-track" id="certsTrack">
  const viewport= track?.closest('.ticker-viewport');                // wrapper with overflow hidden + fades
  const prevBtn = document.querySelector('.ticker-ctrl.prev');
  const nextBtn = document.querySelector('.ticker-ctrl.next');

  if (!track || !viewport) return;

  // Config
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED_PX_PER_S = 60;   // visual speed; CSS duration computed from width
  const MAX_ITEMS       = 30;  // limit for landing ticker (perf)

  let original = [];           // source list (from JSON)
  let oneSetWidth = 0;         // px width of one logical set
  let rafId = 0;               // for manual animation when reduced motion is false and we nudge
  let resizeDebounce = 0;

  // Template
  const itemHTML = (c) => {
    const href = `/credentials.html#${encodeURIComponent(c.id)}`;
    return `
      <li class="ticker-item" role="listitem">
        <a class="ph" href="${href}" aria-label="${c.title} — ${c.issuer} (${c.year})" tabindex="0">
          <img src="${c.thumb}" alt="${c.title} — ${c.issuer}">
        </a>
        <div class="body">
          <div class="title">${c.title}</div>
          <div class="meta"><i class="bx bx-buildings" aria-hidden="true"></i> ${c.issuer} • ${c.year}</div>
        </div>
      </li>
    `;
  };

  // Build DOM with duplication for seamless 50% translate loop
  function build(list){
    // one logical set
    track.setAttribute('role', 'list');
    track.innerHTML = list.map(itemHTML).join('');
    // duplicate once (CSS keyframes translateX(-50%) covers one set)
    track.insertAdjacentHTML('beforeend', track.innerHTML);

    // Compute one set width after paint
    requestAnimationFrame(() => {
      const children = Array.from(track.children);
      const half = Math.floor(children.length / 2);
      oneSetWidth = children.slice(0, half).reduce((w, el) => w + el.getBoundingClientRect().width + gapPx(), 0);

      // Set CSS animation duration based on width / speed
      if (!prefersReduced) {
        const durSec = Math.max(10, oneSetWidth / SPEED_PX_PER_S);
        track.style.animationDuration = `${durSec}s`;
        track.style.animationPlayState = ''; // running
      } else {
        // disable CSS animation for reduced motion
        track.style.animation = 'none';
        track.style.transform = 'translateX(0)';
      }
    });
  }

  // Helper: read the gap from computed style (matches --gap in CSS)
  function gapPx(){
    const cs = getComputedStyle(track);
    const g = parseFloat(cs.columnGap || cs.gap || '12');
    return Number.isFinite(g) ? g : 12;
  }

  // Manual nudge for prev/next (overrides current frame, then resumes CSS anim)
  function nudge(direction){
    // Read the instantaneous transform
    const cs = getComputedStyle(track);
    let x = 0;
    try{
      const m = new DOMMatrixReadOnly(cs.transform);
      x = m.m41 || 0;
    }catch(_){ x = 0; }

    // Width of one loop (one set)
    const W = Math.max(1, oneSetWidth);
    const step = 260; // px: how far to move per click

    // Compute new translateX within [-W, 0] range for continuity
    let nx = x + (direction === 'left' ? step : -step);
    if (nx < -W) nx += W;
    if (nx > 0)  nx -= W;

    // Pause CSS anim, apply manual transform, then restart next frame
    track.style.animation = 'none';
    track.style.transform = `translateX(${nx}px)`;

    // Restart animation (unless user prefers reduced motion)
    requestAnimationFrame(() => {
      if (!prefersReduced) {
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        track.offsetWidth;
        track.style.animation = '';          // restore keyframes (ticker-marquee)
        if (track.style.animationDuration === '') {
          // recompute duration if we arrived before build()
          const durSec = Math.max(10, oneSetWidth / SPEED_PX_PER_S);
          track.style.animationDuration = `${durSec}s`;
        }
        track.style.transform = '';
      }
    });
  }

  // Pause on hover/focus (CSS handles :hover; JS keeps keyboard & programmatic parity)
  function pause(){ track.style.animationPlayState = 'paused'; }
  function resume(){ track.style.animationPlayState = ''; }

  // Fetch data and init
  async function init(){
    try{
      const res = await fetch('/data/credentials.json', { cache: 'no-store' });
      const data = await res.json();
      original = (Array.isArray(data) ? data : []).slice(0, MAX_ITEMS);
      if (!original.length) throw new Error('Empty credentials');
    }catch(err){
      console.warn('[Credentials ticker] Using fallback:', err?.message || err);
      original = [
        { id:'ida-reg', title:'IDA Registration', issuer:'IDA', year:2024, thumb:'/images/certs/ida.jpg' },
        { id:'dci-reg', title:'DCI Registration', issuer:'DCI', year:2024, thumb:'/images/certs/dci.jpg' },
        { id:'implants-master', title:'Implantology Masterclass', issuer:'ICOI', year:2023, thumb:'/images/certs/icoi.jpg' }
      ];
    }
    build(original);
  }

  // Resize: recompute duration from new width (debounced)
  function onResize(){
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      // Rebuild transforms/duration without re-fetching
      const setHtml = original.map(itemHTML).join('');
      track.style.animation = 'none';
      track.style.transform = 'translateX(0)';
      track.innerHTML = setHtml + setHtml;
      requestAnimationFrame(() => {
        const children = Array.from(track.children);
        const half = Math.floor(children.length / 2);
        oneSetWidth = children.slice(0, half).reduce((w, el) => w + el.getBoundingClientRect().width + gapPx(), 0);
        if (!prefersReduced) {
          const durSec = Math.max(10, oneSetWidth / SPEED_PX_PER_S);
          track.style.animation = ''; // restore keyframes
          track.style.animationDuration = `${durSec}s`;
        }
      });
    }, 120);
  }

  // Controls
  prevBtn?.addEventListener('click', () => nudge('left'));
  nextBtn?.addEventListener('click', () => nudge('right'));

  // Pause on focus within / hover (CSS also pauses on :hover)
  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resume);
  track.addEventListener('focusin', pause);
  track.addEventListener('focusout', resume);

  // Keyboard accessibility on viewport: left/right arrows nudge
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); nudge('left'); }
    if (e.key === 'ArrowRight'){ e.preventDefault(); nudge('right'); }
    if (e.key === ' ') { // space toggles pause/resume
      e.preventDefault();
      const ps = getComputedStyle(track).animationPlayState;
      (ps === 'paused' ? resume : pause)();
    }
  });

  // Intersection: pause when offscreen → saves battery
  const io = new IntersectionObserver((entries) => {
    const vis = entries.some(e => e.isIntersecting);
    track.style.animationPlayState = vis ? '' : 'paused';
  }, { threshold: 0.1 });
  io.observe(viewport);

  // Resize
  addEventListener('resize', onResize);

  // Kick off
  init();
})();

if (subBtn && submenu) {
  const setOpen = (open) => {
    subBtn.setAttribute('aria-expanded', String(open));
    submenu.setAttribute('aria-hidden', String(!open));
  };
  setOpen(false);
  subBtn.addEventListener('click', () => setOpen(submenu.getAttribute('aria-hidden') === 'true'));
}

const subBtn = document.querySelector('.submenu-toggle');
const submenu = document.querySelector('.submenu');

if (subBtn && submenu) {
  const toggleDropdown = () => {
    const isOpen = submenu.getAttribute('aria-hidden') === 'false';
    submenu.setAttribute('aria-hidden', String(isOpen));
    submenu.style.display = isOpen ? 'none' : 'block';
    subBtn.setAttribute('aria-expanded', String(!isOpen));
  };

  subBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown();
  });

  document.addEventListener('click', (e) => {
    if (!submenu.contains(e.target) && !subBtn.contains(e.target)) {
      submenu.style.display = 'none';
      submenu.setAttribute('aria-hidden', 'true');
      subBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Debounced Search
let debounceTimer;
searchEl.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilter, 150); // Optimized delay
});

// ARIA + Tab Roles
$$('.vk-tab').forEach((btn, i) => {
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-controls', `vk${btn.dataset.t[0].toUpperCase()}${btn.dataset.t.slice(1)}`);
  btn.id = `tab-${btn.dataset.t}`;
  btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
  btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

  btn.addEventListener('click', () => {
    $$('.vk-tab').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');

    const key = btn.dataset.t;
    const map = {
      overview: '#vkOverview',
      postop: '#vkPostop',
      tips: '#vkTips',
      proscons: '#vkProsCons',
      sources: '#vkSources'
    };

    $$('.vk-panel').forEach(p => {
      p.classList.remove('is-active');
      p.setAttribute('aria-hidden', 'true');
    });

    const activePanel = document.querySelector(map[key]);
    if (activePanel) {
      activePanel.classList.add('is-active');
      activePanel.setAttribute('aria-hidden', 'false');
    }

    sayStatus(`Switched to ${btn.textContent} tab`);
  });

  // Optional: keyboard arrow nav
  btn.addEventListener('keydown', e => {
    const tabs = $$('.vk-tab');
    const index = Array.from(tabs).indexOf(btn);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      tabs[(index + 1) % tabs.length].focus();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      tabs[(index - 1 + tabs.length) % tabs.length].focus();
    }
  });
});

// Live Region Status Announcer
function sayStatus(msg) {
  const live = document.getElementById('ariaStatus');
  if (live) {
    live.textContent = msg;
    setTimeout(() => { live.textContent = ''; }, 3000); // clear after 3s
  }
}
