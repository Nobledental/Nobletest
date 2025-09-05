/* =========================================================
   Noble Dental Care — scripts.js (one file, no extras)
   Core UI + Built-in VK_TOPICS + Care Guide Module
   ========================================================= */

/* ------------------------------
   0) DATASET: window.VK_TOPICS
   ------------------------------ */
(() => {
  // Only set if not already provided elsewhere
  if (Array.isArray(window.VK_TOPICS) && window.VK_TOPICS.length) return;

  window.VK_TOPICS = [
    {
      id:'root-canal',
      title:'Root Canal Treatment (RCT)',
      category:'Tooth saving',
      keywords:['painless rct','infection','abscess','pain on biting','endo'],
      img:'/images/care/root-canal.jpg',
      overview:`Removes infected/irritated pulp tissue, disinfects canals, and seals them to save the tooth. A crown is commonly advised to protect from fracture.`,
      postop:`Numbness fades in 2–4 h. Tenderness to bite is typical for 2–5 days. Use prescribed analgesics if advised.`,
      tips:`Avoid chewing on the treated tooth until the final filling/crown. Call the clinic if swelling or fever occurs.`,
      proscons:`Pros: Pain relief, keeps your natural tooth, normal chewing. Cons: Multiple visits, crown cost; rare retreatment/repair.`,
      sources:[
        'Cohen’s Pathways of the Pulp',
        'Ingle’s Endodontics',
        'ADA patient guidance'
      ]
    },
    {
      id:'implants',
      title:'Dental Implants',
      category:'Implants & replacement',
      keywords:['missing tooth','implant','titanium','fixed teeth'],
      img:'/images/care/implants.jpg',
      overview:`A titanium post placed in bone to support a crown/bridge. Helps prevent bone loss and restores function and aesthetics.`,
      postop:`Mild swelling/tenderness 2–3 days. Soft diet initially. Stitches removal if non-resorbable as directed.`,
      tips:`Maintain excellent oral hygiene around implants; periodic professional cleaning is essential.`,
      proscons:`Pros: Fixed, natural feel, preserves bone. Cons: Time for healing, requires adequate bone; costs higher than dentures.`,
      sources:[
        'IDA patient guidance on tooth replacement',
        'WHO basic oral health recommendations'
      ]
    },
    {
      id:'extraction',
      title:'Tooth Extraction',
      category:'Oral surgery',
      keywords:['removal','infection','severe decay','hopeless tooth'],
      img:'/images/care/extraction.jpg',
      overview:`Removal of a tooth when it cannot be predictably saved. Indications include severe decay, fracture, or advanced gum disease.`,
      postop:`Bite on gauze 30–45 min. No spitting/straw for 24 h. Swelling/limited opening can occur for 2–3 days.`,
      tips:`Cold compress 10 min on/off during first day. Soft foods, gentle cleaning, avoid smoking/alcohol during early healing.`,
      proscons:`Pros: Eliminates source of pain/infection. Cons: Gap affects chewing/aesthetics; consider replacement plan.`,
      sources:['IDA post-extraction care','ADA patient resources']
    },
    {
      id:'wisdom-tooth',
      title:'Wisdom Tooth (Third Molar) Care',
      category:'Oral surgery',
      keywords:['impacted','pericoronitis','swelling','jaw pain'],
      img:'/images/care/wisdom.jpg',
      overview:`Partially erupted or impacted wisdom teeth may trap food and cause gum inflammation around the tooth (pericoronitis), pain, or decay of nearby teeth.`,
      postop:`If removed: swelling and mild discomfort for 2–5 days; follow jaw exercises as directed.`,
      tips:`Warm salt-water rinses after 24 h; keep area clean; follow medicines as prescribed if given.`,
      proscons:`Pros: Prevents recurrent infections and damage to adjacent teeth. Cons: Surgical recovery time; rare complications.`,
      sources:['IDA third molar information','ADA surgical aftercare']
    },
    {
      id:'scaling-whitening',
      title:'Scaling & Whitening',
      category:'Prevention',
      keywords:['cleaning','tartar','stains','gum health','bleeding gums'],
      img:'/images/care/scaling.jpg',
      overview:`Scaling removes plaque and tartar above/below the gumline to improve gum health and breath. Whitening lightens tooth shade under professional guidance.`,
      postop:`Temporary sensitivity 24–48 h may occur; use desensitizing toothpaste.`,
      tips:`Brush twice daily, interdental cleaning, and 6–12 month professional recalls.`,
      proscons:`Pros: Healthier gums, brighter smile. Cons: Temporary sensitivity; whitening doesn’t change fillings/crowns.`,
      sources:['IDA/ICMR preventive guidance','ADA whitening overview']
    },
    {
      id:'braces',
      title:'Braces (Orthodontics)',
      category:'Orthodontics',
      keywords:['crooked teeth','bite','crowding','metal braces','self-ligating'],
      img:'/images/care/braces.jpg',
      overview:`Braces gradually align teeth for improved bite and smile. Options include metal/ceramic and different archwire systems.`,
      postop:`Tenderness 2–3 days after activations. Soft diet helps initially.`,
      tips:`Meticulous cleaning around brackets; avoid hard/sticky foods that break wires/brackets.`,
      proscons:`Pros: Predictable control, suitable for many cases. Cons: Visibility, more hygiene effort.`,
      sources:['Contemporary Orthodontics','ADA ortho patient info']
    },
    {
      id:'clear-aligners',
      title:'Clear Aligners',
      category:'Orthodontics',
      keywords:['invisalign','transparent trays','removable','aesthetics'],
      img:'/images/care/aligners.jpg',
      overview:`Series of removable trays that gradually move teeth. Good aesthetics and easier hygiene; wear time discipline is crucial.`,
      postop:`Initial pressure/soreness 1–2 days for new trays.`,
      tips:`Wear 20–22 h/day; remove only for meals and brushing; keep trays clean.`,
      proscons:`Pros: Nearly invisible, removable, easier cleaning. Cons: Requires compliance; not ideal for all complex cases.`,
      sources:['Contemporary Orthodontics','ADA aligner guidance']
    },
    {
      id:'crowns-bridges',
      title:'Crowns & Bridges',
      category:'Crowns & bridges',
      keywords:['cap','fracture','post-rct','missing teeth'],
      img:'/images/care/crown.jpg',
      overview:`Crowns protect and strengthen a damaged or root-canal-treated tooth. Bridges replace missing teeth by anchoring to neighbors.`,
      postop:`Transient temperature sensitivity possible; adjust bite if high points felt.`,
      tips:`Avoid chewing hard objects on temporaries; maintain excellent hygiene under bridge pontics.`,
      proscons:`Pros: Restores function, protects tooth. Cons: Requires tooth preparation; replacement may be needed over time.`,
      sources:['IDA restorative options','ADA crowns/bridges basics']
    },
    {
      id:'tooth-colored-fillings',
      title:'Tooth-Colored Fillings (Composites)',
      category:'Restorative',
      keywords:['cavity','decay','composite','bonding'],
      img:'/images/care/fillings.jpg',
      overview:`Resin-based material bonds to tooth to restore shape and function after decay removal. Shade-matched for aesthetics.`,
      postop:`Mild bite sensitivity possible for a few days. Return for bite adjustment if needed.`,
      tips:`Limit frequent sugar/acid exposures; regular checkups for early caries detection.`,
      proscons:`Pros: Aesthetic, conservative prep. Cons: Technique sensitivity; wear/staining over time.`,
      sources:['IDA caries patient leaflets','ADA restorative care']
    },
    {
      id:'pediatric',
      title:'Pediatric Dentistry',
      category:'Pediatric',
      keywords:['children','sealants','fluoride','milk teeth'],
      img:'/images/care/pediatric.jpg',
      overview:`Age-appropriate preventive and restorative care for children, including sealants, fluoride, habit guidance, and management of early caries.`,
      postop:`After fluoride/varnish: avoid hard/very hot foods for a few hours.`,
      tips:`Twice-daily brushing with correct paste quantity; dietary counselling; regular checkups.`,
      proscons:`Pros: Early prevention reduces complex treatments later. Cons: Multiple visits for behavior shaping in some cases.`,
      sources:['WHO oral health','IDA pediatric guidance']
    },
    {
      id:'periodontics',
      title:'Gum Treatment (Periodontics)',
      category:'Gum care',
      keywords:['bleeding','pocket','deep cleaning','periodontal'],
      img:'/images/care/periodontics.jpg',
      overview:`Manages gum inflammation and bone support around teeth. Includes scaling and root planing; advanced cases may need surgery.`,
      postop:`Gums may feel tender 2–3 days after deep cleaning; sensitivity common temporarily.`,
      tips:`Daily interdental cleaning; professional maintenance every 3–6 months as advised.`,
      proscons:`Pros: Stabilizes gum health, helps preserve teeth. Cons: Ongoing maintenance visits needed.`,
      sources:['Carranza’s Clinical Periodontology','IDA gum health']
    },
    {
      id:'sensitivity',
      title:'Tooth Sensitivity',
      category:'Prevention',
      keywords:['cold air','iced water','recession','enamel wear'],
      img:'/images/care/sensitivity.jpg',
      overview:`Short sharp response to cold/sweets often due to exposed dentin. Desensitizing toothpaste and professional treatments can help.`,
      postop:`If treated (e.g., varnish), avoid very hot/cold foods briefly as told.`,
      tips:`Use soft brush, gentle technique; avoid frequent acidic drinks.`,
      proscons:`Pros: Usually manageable with simple measures. Cons: Underlying issues (decay/cracks) need evaluation.`,
      sources:['ADA sensitivity advice','IDA preventive care']
    },
    {
      id:'bad-breath',
      title:'Bad Breath (Halitosis)',
      category:'Prevention',
      keywords:['breath','tongue coating','gum disease'],
      img:'/images/care/halitosis.jpg',
      overview:`Commonly due to tongue coating and gum inflammation. Cleaning, tongue hygiene, and treating gum issues help.`,
      postop:`—`,
      tips:`Clean tongue daily, floss, address dry mouth; periodic professional cleaning.`,
      proscons:`Pros: Often improved with hygiene. Cons: Can be linked to medical factors—seek evaluation when persistent.`,
      sources:['IDA oral hygiene','WHO basic oral health']
    },
    {
      id:'night-guard',
      title:'Night Guard (Bruxism Splint)',
      category:'Restorative',
      keywords:['grinding','clenching','jaw pain','TMJ'],
      img:'/images/care/night-guard.jpg',
      overview:`A custom guard worn at night to protect teeth from grinding/clenching wear and reduce muscular load.`,
      postop:`Adjustment checks may be needed to fine-tune comfort.`,
      tips:`Wear as directed; keep appliance clean; address stress and habits.`,
      proscons:`Pros: Protects enamel/restorations. Cons: Needs replacement over time; does not treat all TMJ causes.`,
      sources:['ADA bruxism info']
    },
    {
      id:'pregnancy-care',
      title:'Pregnancy Dental Care',
      category:'Prevention',
      keywords:['pregnancy','morning sickness','gum bleeding','safety'],
      img:'/images/care/pregnancy.jpg',
      overview:`Preventive dental care during pregnancy supports gum health and comfort. Routine cleanings and urgent treatments are generally considered safe with appropriate precautions.`,
      postop:`—`,
      tips:`Gentle brushing after nausea episodes; nutrition/hydration support; consult obstetrician for medications if needed.`,
      proscons:`Pros: Early care prevents complications. Cons: Some procedures may be timed/modified after clinical evaluation.`,
      sources:['ADA pregnancy & dental care','IDA guidance']
    },
    {
      id:'emergency',
      title:'Dental Pain & Emergencies',
      category:'Tooth saving',
      keywords:['urgent','trauma','swelling','broken tooth'],
      img:'/images/care/emergency.jpg',
      overview:`Examples include severe pain, swelling, broken teeth, or trauma. Timely evaluation improves outcomes.`,
      postop:`Follow clinician guidance; cold compress for swelling; avoid heat on the face for acute swelling.`,
      tips:`Call the clinic promptly. Keep knocked-out tooth moist (milk/saline) and seek urgent care.`,
      proscons:`Pros: Early care limits complications. Cons: Delay increases risks; exact management varies by case.`,
      sources:['IDA emergency tips','ADA trauma basics']
    }
  ];
})();

/* =========================================================
   1) CORE UI (header/menu/tabs/dialog/booking/reviews/ticker)
   ========================================================= */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  // Header shrink
  const header = $('.site-header');
  if (header) {
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('shrink', y > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu
  const menuBtn = $('.menu-toggle');
  const navList = $('.nav-pill');
  if (menuBtn && navList) {
    on(menuBtn, 'click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      navList.setAttribute('aria-hidden', String(expanded));
    });
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && navList.getAttribute('aria-hidden') === 'false') {
        menuBtn.setAttribute('aria-expanded', 'false');
        navList.setAttribute('aria-hidden', 'true');
        menuBtn.focus();
      }
    });
  }

  // Submenu
  const submenuToggle = $('.submenu-toggle');
  const submenu = $('#sp-submenu');
  if (submenuToggle && submenu) {
    const closeSubmenu = () => {
      submenuToggle.setAttribute('aria-expanded', 'false');
      submenu.setAttribute('aria-hidden', 'true');
    };
    const openSubmenu = () => {
      submenuToggle.setAttribute('aria-expanded', 'true');
      submenu.setAttribute('aria-hidden', 'false');
    };
    on(submenuToggle, 'click', (e) => {
      const open = submenuToggle.getAttribute('aria-expanded') === 'true';
      open ? closeSubmenu() : openSubmenu();
      e.stopPropagation();
    });
    on(document, 'click', (e) => {
      if (!submenu.contains(e.target) && !submenuToggle.contains(e.target)) closeSubmenu();
    });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') closeSubmenu(); });
  }

  // VOKA tabs
  const tabsWrap = $('.voka__tabs');
  if (tabsWrap) {
    const tabs = $$('.vk-tab', tabsWrap);
    const panels = $$('.vk-panel', tabsWrap.closest('.voka__card'));
    tabsWrap.setAttribute('role', 'tablist');
    tabs.forEach((btn, idx) => {
      btn.setAttribute('role', 'tab');
      btn.setAttribute('tabindex', idx === 0 ? '0' : '-1');
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      if (!btn.id) btn.id = `vk-tab-${btn.dataset.t}`;
      const panel = panels[idx];
      if (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', btn.id);
        if (idx !== 0) panel.hidden = true;
      }
      on(btn, 'click', () => activate(idx));
      on(btn, 'keydown', (e) => {
        const i = tabs.indexOf(document.activeElement);
        if (e.key === 'ArrowRight') { e.preventDefault(); focusTab((i+1)%tabs.length); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); focusTab((i-1+tabs.length)%tabs.length); }
        if (e.key === 'Home')       { e.preventDefault(); focusTab(0); }
        if (e.key === 'End')        { e.preventDefault(); focusTab(tabs.length-1); }
      });
    });
    function activate(idx){
      tabs.forEach((t,i) => {
        t.classList.toggle('is-active', i===idx);
        t.setAttribute('aria-selected', i===idx ? 'true' : 'false');
        t.setAttribute('tabindex', i===idx ? '0' : '-1');
      });
      panels.forEach((p,i) => p.hidden = i!==idx);
    }
    function focusTab(idx){ tabs[idx].focus(); activate(idx); }
  }

  // Doctors dialog
  const sheet = $('#docSheet');
  const sheetClose = sheet ? $('.sheet-close', sheet) : null;
  let lastTrigger = null;
  function openDoctor(id, triggerEl){
    const data = window.NDC_DOCTORS?.[id];
    if (!sheet || !data) return;
    lastTrigger = triggerEl || null;
    $('#sheetHero', sheet).src = data.hero || '';
    $('#sheetTitle', sheet).textContent = data.name || '';
    $('#sheetRole', sheet).textContent = data.role || '';
    $('#sheetBio', sheet).textContent  = data.bio  || '';
    const exWrap = $('#sheetExpertise', sheet);
    exWrap.innerHTML = '';
    (data.expertise||[]).forEach(t => {
      const chip = document.createElement('span'); chip.className = 'chip'; chip.textContent = t; exWrap.appendChild(chip);
    });
    const books = $('#sheetBooks', sheet);
    books.innerHTML = '';
    (data.books||[]).forEach(b => {
      const row = document.createElement('div'); row.className = 'book';
      row.innerHTML = `<img src="${b.img}" alt=""><div><div class="t">${b.t}</div><div class="p">${b.p||''}</div>${b.href ? `<a class="btn outline" target="_blank" rel="noopener" href="${b.href}">View</a>` : ''}</div>`;
      books.appendChild(row);
    });
    $('#sheetBook', sheet).setAttribute('href', '#get-in-touch');
    if (!sheet.open) sheet.showModal();
  }
  if (sheet && sheetClose){
    on(sheetClose, 'click', () => { sheet.close(); });
    on(sheet, 'close', () => { if (lastTrigger) lastTrigger.focus(); });
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && sheet.open) { e.stopPropagation(); sheet.close(); }
    });
    $$('.ndc-card').forEach(card => {
      const id = card.getAttribute('data-id');
      const btn = $('.open', card);
      const link = $('a.block', card);
      const trigger = (e) => { e.preventDefault(); openDoctor(id, btn || link); };
      on(btn, 'click', trigger);
      on(link, 'click', trigger);
    });
  }

  // Booking form
  const apptForm = $('#apptForm');
  if (apptForm){
    const daySel  = $('#daySelect', apptForm);
    const timeSel = $('#timeSelect', apptForm);
    const bookBtn = $('#bookBtn', apptForm);
    const summary = $('#summaryText', apptForm);
    const toast   = $('#apptToast');
    const fmt = (d) => d.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' });
    const days = [...Array(7)].map((_,i) => { const d = new Date(); d.setDate(d.getDate()+i); return d; });
    daySel.innerHTML = days.map((d)=>`<option value="${d.toISOString().slice(0,10)}">${fmt(d)}</option>`).join('');
    function buildTimes(dateIso){
      const d = new Date(dateIso+'T00:00:00'); const isSun = d.getDay() === 0;
      const start = (isSun?15:11)*60, end = 22*60, items=[];
      for(let m=start;m<=end;m+=30){ const hh=String(Math.floor(m/60)).padStart(2,'0'); const mm=String(m%60).padStart(2,'0'); items.push(`${hh}:${mm}`); }
      return items;
    }
    function renderTimes(){
      const val = daySel.value || days[0].toISOString().slice(0,10);
      const opts = buildTimes(val);
      timeSel.innerHTML = `<option value="">Select a time</option>` + opts.map(t=>`<option>${t}</option>`).join('');
      bookBtn.disabled = true; summary.textContent = 'Choose a day & time to continue.';
    }
    renderTimes();
    daySel.addEventListener('change', renderTimes);
    apptForm.addEventListener('input', () => {
      const ready = apptForm.name?.value && apptForm.phone?.value && daySel.value && timeSel.value;
      bookBtn.disabled = !ready;
      if (ready){ summary.textContent = `Ready to book: ${apptForm.name.value}, ${daySel.value} at ${timeSel.value}.`; }
    });
    apptForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(apptForm);
      const msg = [
        `Booking request — Noble Dental Care`,
        `Name: ${data.get('name')||''}`,
        `Phone: ${data.get('phone')||''}`,
        `Service: ${data.get('service')||''}`,
        `Doctor: ${data.get('doctor')||''}`,
        `Day: ${data.get('day')||daySel.value}`,
        `Time: ${data.get('time')||timeSel.value}`,
        `Notes: ${data.get('notes')||'-'}`,
      ].join('%0A');
      const url = `https://wa.me/918610425342?text=${msg}`;
      if (toast) toast.hidden = false;
      setTimeout(()=>{ window.open(url, '_blank', 'noopener'); }, 80);
    });
  }

  // Reviews rail
  const rail = $('#revRail');
  if (rail){
    const prev = $('.rev-nav.prev', rail.parentElement);
    const next = $('.rev-nav.next', rail.parentElement);
    const step = () => Math.min(rail.clientWidth*0.9, 480);
    on(prev, 'click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    on(next, 'click', () => rail.scrollBy({ left:  step(), behavior: 'smooth' }));
  }

  // Certificates ticker
  const track = $('#certsTrack');
  if (track){
    let x = 0; let raf; const speed = 0.3;
    const loop = () => { x -= speed; track.style.transform = `translateX(${x}px)`; if (Math.abs(x) > track.scrollWidth/2) x = 0; raf = requestAnimationFrame(loop); };
    const viewport = track.closest('.ticker-viewport');
    on(viewport, 'mouseenter', () => cancelAnimationFrame(raf));
    on(viewport, 'mouseleave', () => { raf = requestAnimationFrame(loop); });
    on(viewport, 'focusin', () => cancelAnimationFrame(raf));
    on(viewport, 'focusout', () => { raf = requestAnimationFrame(loop); });
    raf = requestAnimationFrame(loop);
    const prev = $('.ticker-ctrl.prev', viewport);
    const next = $('.ticker-ctrl.next', viewport);
    on(prev, 'click', ()=> track.scrollBy({left:-260, behavior:'smooth'}));
    on(next, 'click', ()=> track.scrollBy({left: 260, behavior:'smooth'}));
  }

  // External link safety
  $$('a[target="_blank"]').forEach(a => { if (!a.rel?.includes('noopener')) a.rel = (a.rel ? a.rel + ' ' : '') + 'noopener'; });
})();

/* =========================================================
   2) VK CARE GUIDE MODULE (uses window.VK_TOPICS above)
   ========================================================= */
(() => {
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>[...r.querySelectorAll(s)];
  const on = (el, ev, fn, opts)=> el && el.addEventListener(ev, fn, opts);

  const DATA = Array.isArray(window.VK_TOPICS) && window.VK_TOPICS.length ? window.VK_TOPICS : [];
  const els = {
    search: $('#vkSearch'), datalist: $('#vk-datalist'), category: $('#vkCategory'), chips: $('#vkChips'),
    imgA: $('#vkImgA'), imgB: $('#vkImgB'), title: $('#vkTitle'), badge: $('#vkBadge'), keywords: $('#vkKeywords'),
    deep: $('#vkDeepLink'),
    panels: { overview: $('#vkOverview'), postop: $('#vkPostop'), tips: $('#vkTips'), proscons: $('#vkProsCons'), sources: $('#vkSources .vk-refs') || $('#vkSources') },
    prev: $('#vkPrev'), next: $('#vkNext'), dots: $('#vkDots'), pdfBtn: $('#vkPDF'),
    chatInput: $('#vkChatInput'), chatSend: $('#vkChatSend'), chatLog: $('#vkChatLog'), pdfSrc: $('#vk-pdf-src')
  };
  if (!els.title || !DATA.length) return;

  const norm = s => (s||'').toString().toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g,'');
  const categories = ['All topics', ...[...new Set(DATA.map(t=>t.category))]];
  const chipsPool = [...new Set(DATA.flatMap(t => t.keywords || []))].slice(0, 16);

  let filtered = [...DATA];
  let index = 0;
  let lastImgIsA = true;

  if (els.category) els.category.innerHTML = categories.map((c,i)=>`<option value="${i===0?'all':c}">${c}</option>`).join('');
  if (els.datalist) els.datalist.innerHTML = DATA.map(t=>`<option value="${t.title}">`).join('');
  if (els.chips) {
    els.chips.innerHTML = chipsPool.map(k=>`<button type="button" class="vk-chip" data-k="${k}">${k}</button>`).join('');
    $$('.vk-chip', els.chips).forEach(btn => { on(btn, 'click', ()=> { els.search.value = btn.dataset.k; applyFilters(); }); });
  }

  function applyFilters(){
    const q = norm(els.search?.value);
    const cat = els.category?.value || 'all';
    filtered = DATA.filter(t => {
      const inCat = (cat==='all') || t.category === cat;
      if (!q) return inCat;
      const hay = norm([t.title, t.category, (t.keywords||[]).join(' '), t.overview, t.tips, t.proscons].join(' '));
      return inCat && hay.includes(q);
    });
    if (!filtered.length) filtered = [...DATA];
    index = 0; renderTopic(); renderDots();
  }
  let debounceTimer;
  const debounced = (fn, ms=180) => (...args) => { clearTimeout(debounceTimer); debounceTimer = setTimeout(()=>fn(...args), ms); };
  on(els.search, 'input', debounced(applyFilters, 180));
  on(els.category, 'change', applyFilters);

  function renderDots(){
    if (!els.dots) return;
    els.dots.innerHTML = '';
    filtered.forEach((t,i)=>{
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role','tab'); b.setAttribute('aria-label', t.title);
      b.className = i===index ? 'is-active' : '';
      b.addEventListener('click', () => { index = i; renderTopic(); renderDots(); });
      els.dots.appendChild(b);
    });
  }

  on(els.prev, 'click', () => { index = (index - 1 + filtered.length) % filtered.length; renderTopic(); renderDots(); });
  on(els.next, 'click', () => { index = (index + 1) % filtered.length; renderTopic(); renderDots(); });

  function swapImage(src){
    if (!els.imgA || !els.imgB) return;
    const showA = lastImgIsA;
    const next = showA ? els.imgB : els.imgA;
    const cur  = showA ? els.imgA : els.imgB;
    next.src = src || '/images/care/placeholder.jpg';
    const doSwap = () => { cur.classList.remove('is-show'); next.classList.add('is-show'); lastImgIsA = !lastImgIsA; };
    next.onload = doSwap; if (next.complete) doSwap();
  }

  function renderTopic(){
    const t = filtered[index]; if (!t) return;
    els.title.textContent = t.title || '—';
    els.badge.textContent = t.category || 'Topic';
    els.keywords.innerHTML = (t.keywords||[]).map(k=>`<span class="badge">${k}</span>`).join(' ');
    els.deep.href = `#care/${t.id}`;
    els.panels.overview.innerHTML = para(t.overview);
    els.panels.postop.innerHTML   = bullets(t.postop);
    els.panels.tips.innerHTML     = bullets(t.tips);
    els.panels.proscons.innerHTML = bullets(t.proscons, true);
    if (els.panels.sources) els.panels.sources.innerHTML = (t.sources||[]).map(s=>`<li>${escapeHtml(s)}</li>`).join('');
    swapImage(t.img);
  }

  const escapeHtml = (s)=> (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const para = (txt)=> (txt||'').split(/\n{2,}/).map(p=>`<p>${escapeHtml(p)}</p>`).join('');
  const bullets = (txt, splitByColon=false)=>{
    if (!txt) return '';
    if (splitByColon) {
      const parts = String(txt).split(/\s*Cons:\s*/i);
      const prosPart = parts[0].replace(/^Pros:\s*/i,'');
      const consPart = parts[1] || '';
      const pros = prosPart.split(/[;\n]+/).map(s=>s.trim()).filter(Boolean);
      const cons = consPart.split(/[;\n]+/).map(s=>s.trim()).filter(Boolean);
      return `<div class="grid2"><div><h4>Pros</h4><ul>${pros.map(li=>`<li>${escapeHtml(li)}</li>`).join('')}</ul></div><div><h4>Cons</h4><ul>${cons.map(li=>`<li>${escapeHtml(li)}</li>`).join('')}</ul></div></div>`;
    }
    const items = String(txt).split(/[;\n]+/).map(s=>s.trim()).filter(Boolean);
    return `<ul>${items.map(li=>`<li>${escapeHtml(li)}</li>`).join('')}</ul>`;
  };

  function applyHash(){
    const m = location.hash.match(/^#care\/([\w-]+)/i);
    if (m) {
      const id = m[1];
      const i = filtered.findIndex(t=>t.id===id);
      if (i >= 0) { index = i; renderTopic(); renderDots(); }
    }
  }
  window.addEventListener('hashchange', applyHash);

  function chatPost(text, who='user'){
    if (!els.chatLog) return;
    const div = document.createElement('div');
    div.className = `msg msg--${who==='user'?'user':'bot'}`;
    div.textContent = text;
    els.chatLog.appendChild(div);
    els.chatLog.scrollTop = els.chatLog.scrollHeight;
  }
  const bestMatch = (q)=>{
    const nq = norm(q);
    let best = 0, bestIdx = 0;
    filtered.forEach((t,i)=>{
      const hay = norm([t.title, t.category, (t.keywords||[]).join(' '), t.overview, t.tips, t.proscons].join(' '));
      const score = nq.split(/\s+/).filter(Boolean).reduce((acc,w)=> acc + (hay.includes(w) ? 1 : 0), 0);
      if (score > best) { best = score; bestIdx = i; }
    });
    return bestIdx;
  };
  const handleAsk = ()=>{
    const q = els.chatInput?.value.trim(); if (!q) return;
    chatPost(q, 'user');
    const idx = bestMatch(q); index = idx; renderTopic(); renderDots();
    chatPost(`Jumped to: ${filtered[idx].title}`, 'bot');
    els.chatInput.value = '';
  };
  on(els.chatSend, 'click', handleAsk);
  on(els.chatInput, 'keydown', (e)=>{ if (e.key === 'Enter') handleAsk(); });

  // Optional high-quality PDF via html2pdf (uses print fallback if not loaded)
  on(els.pdfBtn, 'click', () => {
    const t = filtered[index]; if (!t || !els.pdfSrc) return;
    const html = `
      <section style="font:14px/1.45 Manrope,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#fff;color:#111;max-width:820px;margin:0 auto;padding:16px">
        <header style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <img src="/images/logo.png" alt="" width="36" height="36" style="border-radius:8px;border:1px solid #e7ecf3">
          <div>
            <h2 style="margin:0;font-size:20px">Noble Dental Care – Nallagandla</h2>
            <div style="color:#5f6b7a;font-size:12px">Educational handout (not a diagnosis)</div>
          </div>
        </header>
        <hr style="border:none;border-top:1px solid #e7ecf3;margin:8px 0 12px">
        <h1 style="font-size:24px;margin:8px 0">${escapeHtml(t.title)}</h1>
        <p style="margin:0 0 8px"><strong>Category:</strong> ${escapeHtml(t.category||'')}</p>
        ${t.img ? `<img src="${t.img}" alt="" style="width:100%;height:auto;border:1px solid #e7ecf3;border-radius:8px;margin:8px 0 12px">` : ''}

        <h3>Overview</h3>${para(t.overview)}
        ${t.postop ? `<h3 style="margin-top:12px">Post-op timeline</h3>${bullets(t.postop)}` : '' }
        ${t.tips ? `<h3 style="margin-top:12px">Tips / FAQ</h3>${bullets(t.tips)}` : '' }
        ${t.proscons ? `<h3 style="margin-top:12px">Pros & Cons</h3>${bullets(t.proscons,true)}` : '' }
        ${(t.sources && t.sources.length) ? `<h3 style="margin-top:12px">Citations</h3><ul>${t.sources.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ul>`:''}

        <footer style="margin-top:14px;padding-top:8px;border-top:1px solid #e7ecf3;font-size:12px;color:#5f6b7a">
          Severe pain, fever, trauma or swelling? <strong>Call +91 86104 25342</strong>. Mon–Sat 11:00–22:00, Sun 15:00–22:00.
        </footer>
      </section>`;
    els.pdfSrc.innerHTML = html;

    if (window.html2pdf) {
      window.html2pdf().from(els.pdfSrc).set({
        margin: 0.4,
        filename: `${t.id || 'care-guide'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).save();
    } else {
      const w = window.open('', '_blank', 'noopener,width=900,height=900'); if (!w) return;
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t.title}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap" rel="stylesheet">
        <style>@page{size:A4;margin:14mm}body{background:#fff}</style>
      </head><body>${els.pdfSrc.innerHTML}</body></html>`);
      w.document.close(); w.focus(); setTimeout(()=>{ w.print(); }, 500);
    }
  });

  // Init
  applyFilters(); renderDots(); applyHash();
})();
