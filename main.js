/* =========================================================
   Noble Dental Care — scripts.js
   (header, hero motion, booking, doctors app, reviews,
    certificates, footer year, Care Guide with full dataset)
   ========================================================= */
.brand-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.brand-title span {
  color: var(--brand);
}

(() => {
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-pill');

  const shrinkOnScroll = () => {
    header.classList.toggle('shrink', window.scrollY > 10);
  };

  shrinkOnScroll();
  window.addEventListener('scroll', shrinkOnScroll, { passive: true });

  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
    navList.setAttribute('aria-hidden', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      menuBtn.setAttribute('aria-expanded', 'false');
      navList.setAttribute('aria-hidden', 'true');
    }
  });
})();

const scrollBar = document.getElementById('scrollIndicator');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  scrollBar.style.width = `${scrollPercent}%`;
});

/* ------------- tiny helpers ------------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const on = (el, ev, fn, o) => el && el.addEventListener(ev, fn, o);

/* =========================================================
   Header: shrink, mobile menu, submenu
   ========================================================= */
(() => {
  const header = $('.site-header');
  const menuBtn = $('.menu-toggle');
  const navList = $('.nav-pill');
  const subBtn  = $('.has-submenu > .submenu-toggle');
  const subMenu = $('#sp-submenu');

  const setShrink = () => header?.classList.toggle('shrink', (window.scrollY||0) > 10);
  setShrink(); on(window,'scroll', setShrink, {passive:true});

  // mobile nav toggle
  on(menuBtn, 'click', () => {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    navList.setAttribute('aria-hidden', String(open));
  });
  // close on outside click / esc
  on(document, 'click', (e) => {
    if (!header.contains(e.target)) { menuBtn.setAttribute('aria-expanded','false'); navList.setAttribute('aria-hidden','true'); }
  });
  on(document, 'keydown', (e) => { if (e.key === 'Escape'){ menuBtn.setAttribute('aria-expanded','false'); navList.setAttribute('aria-hidden','true'); }});

  // submenu
  if (subBtn && subMenu){
    const closeMenu = ()=>{ subBtn.setAttribute('aria-expanded','false'); subMenu.setAttribute('aria-hidden','true'); };
    const openMenu  = ()=>{ subBtn.setAttribute('aria-expanded','true');  subMenu.setAttribute('aria-hidden','false'); };
    on(subBtn,'click',(e)=>{ const isOpen=subBtn.getAttribute('aria-expanded')==='true'; isOpen?closeMenu():openMenu(); e.stopPropagation(); });
    on(document,'click',(e)=>{ if (!subMenu.contains(e.target) && e.target !== subBtn) closeMenu(); });
    on(document,'keydown',(e)=>{ if (e.key==='Escape') closeMenu(); });
  }
})();

/* =========================================================
   Hero: respect reduced motion
   ========================================================= */
(() => {
  const vid = document.querySelector(".blackhole-video");
  if (!vid) return;
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => { if (mq.matches){ vid.pause?.(); vid.removeAttribute?.("autoplay"); } };
  mq.addEventListener?.("change", apply) ?? mq.addListener?.(apply);
  apply();
})();

/* =========================================================
   Booking form: days/times, WA handoff
   ========================================================= */
(() => {
  const tz = "Asia/Kolkata";
  const form = $("#apptForm");
  if (!form) return;

  const daySelect = $("#daySelect");
  const timeSelect = $("#timeSelect");
  const summary = $("#summaryText");
  const bookBtn = $("#bookBtn");
  const toast = $("#apptToast");
  const waFill = $("#waFill");
  const waQuick = $("#waQuick");

  // opening hours (0=Sun)
  const hours = { 0: [15,22], 1:[11,22], 2:[11,22], 3:[11,22], 4:[11,22], 5:[11,22], 6:[11,22] };

  const fmtDay  = (d) => d.toLocaleDateString("en-IN",{ timeZone: tz, weekday:"short", day:"2-digit", month:"short" });
  const fmtTime = (d) => d.toLocaleTimeString("en-IN",{ timeZone: tz, hour:"2-digit", minute:"2-digit" });

  function buildDays(){
    daySelect.innerHTML = "";
    const today = new Date();
    for (let i=0;i<14;i++){
      const d = new Date(today); d.setDate(d.getDate()+i);
      const opt = document.createElement("option");
      opt.value = d.toISOString();
      opt.textContent = fmtDay(d);
      daySelect.appendChild(opt);
    }
  }

  function buildTimes(dayIso){
    timeSelect.innerHTML = '<option value="">Select a time</option>';
    if (!dayIso) return;
    const d = new Date(dayIso);
    const [open, close] = hours[d.getDay()] || [0,0];
    const start = new Date(d); start.setHours(open,0,0,0);
    const end   = new Date(d); end.setHours(close,0,0,0);
    const now = new Date();

    for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes()+30)){
      if (t < now) continue;
      const iso = t.toISOString();
      const opt = document.createElement("option");
      opt.value = iso;
      opt.textContent = fmtTime(new Date(iso));
      timeSelect.appendChild(opt);
    }
  }

  function updateSummary(){
    const d = daySelect.value ? new Date(daySelect.value) : null;
    const t = timeSelect.value ? new Date(timeSelect.value) : null;
    if (d && t){ summary.textContent = `${fmtDay(d)} • ${fmtTime(t)} (IST)`; bookBtn.disabled = false; }
    else { summary.textContent = "Choose a day & time to continue."; bookBtn.disabled = true; }
    updateWA();
  }

  function updateWA(){
    const fd = new FormData(form);
    const d = daySelect.value ? new Date(daySelect.value) : null;
    const t = timeSelect.value ? new Date(timeSelect.value) : null;
    const msg = `Hi Noble Dental Care,
I'd like to book:
• Name: ${fd.get("name")||""}
• Phone: ${fd.get("phone")||""}
• Service: ${fd.get("service")||""}
• Doctor: ${fd.get("doctor")||""}
• Time: ${d?fmtDay(d):"-"} • ${t?fmtTime(t):"-"} (IST)
${fd.get("notes") ? "• Notes: "+fd.get("notes") : ""}`.trim();
    const url = `https://wa.me/918610425342?text=${encodeURIComponent(msg)}`;
    if (waFill)  waFill.href = url;
    if (waQuick) waQuick.href = url;
  }

  on(daySelect,'change', ()=>{ buildTimes(daySelect.value); updateSummary(); });
  on(timeSelect,'change', updateSummary);
  on(form,'input', updateWA);

  on(form,'submit',(e)=>{
    e.preventDefault();
    if (bookBtn.disabled) return;
    updateWA();
    toast.hidden = false; setTimeout(()=> toast.hidden = true, 2000);
    window.open(waFill.href, "_blank", "noopener");
  });

  buildDays(); buildTimes(daySelect.value); updateSummary();
})();

/* =========================================================
   Doctors directory: search/filter, dialog, deep link, preselect
   ========================================================= */
(() => {
  const grid = $('#docGrid');
  const dlg = $('#docSheet');
  const closeBtn = $('.sheet-close', dlg);
  const search = $('#docSearch');
  if (!grid || !dlg) return;

  const DATA = {
    dhivakaran:{ name:"Dr Dhivakaran", role:"Chief Medical Director", hero:"/images/doctors/dhivakaran-hero.webp", bio:"Chief Medical Director at Noble Dental Care. Director, Healthflo (557 hospitals). Contributor to Triumph’s Complete Review of Dentistry.", expertise:["Painless RCT","Dental Implants","Preventive Dentistry"], books:[{t:"Triumph’s Complete Review of Dentistry",p:"Wolters Kluwer • 2018",img:"/images/books/triumph.webp",href:"https://play.google.com/store/books/details?id=ZTjvDwAAQBAJ"}] },
    roger:{ name:"Dr Roger Ronaldo", role:"Oral & Maxillofacial Surgeon", hero:"/images/doctors/roger-hero.webp", bio:"Surgeon focusing on implants, orthognathic & reconstruction, and facial trauma.", expertise:["Implantology","Orthognathic & Reconstruction","Trauma Surgery"], books:[] },
    thikvijay:{ name:"Dr Thikvijay", role:"Aesthetic & Medical Cosmetologist", hero:"/images/doctors/thikvijay-hero.webp", bio:"FMC (Germany), ISHR. Trichology, Aesthetic & Medical Cosmetology, Hair & Scalp Restoration.", expertise:["Trichology","Aesthetic Medicine","Hair & Scalp Restoration"], books:[] },
    deepak:{ name:"Dr Deepak", role:"Orthodontist", hero:"/images/doctors/deepak-hero.webp", bio:"Assistant Professor. Smile design, clear aligners, complex malocclusion.", expertise:["Smile Design","Clear Aligners","Complex Malocclusion"], books:[] },
    idhaya:{ name:"Dr Idhaya", role:"Preventive & Tourism Dentistry", hero:"/images/doctors/idhaya-hero.webp", bio:"Preventive programs, insurance advisory and medical tourism coordination.", expertise:["Preventive Dentistry","Insurance Advisory","Medical Tourism"], books:[] }
  };

  function fillDialog(id){
    const d = DATA[id]; if (!d) return;
    $('#sheetHero').src = d.hero || '';
    $('#sheetHero').alt = d.name || '';
    $('#sheetTitle').textContent = d.name || '';
    $('#sheetRole').textContent = d.role || '';
    $('#sheetBio').textContent = d.bio || '';
    $('#sheetExpertise').innerHTML = (d.expertise||[]).map(x=>`<span class="chip">${x}</span>`).join('');
    $('#sheetBooks').innerHTML = (d.books||[]).map(b=>`
      <div class="book">
        <img src="${b.img||''}" alt="">
        <div><div class="t">${b.t||''}</div><div class="p">${b.p||''}</div>${b.href?`<a class="t-btn" href="${b.href}" target="_blank" rel="noopener">View</a>`:''}</div>
      </div>`).join('');
    $('#sheetBook').dataset.doc = d.name || '';
  }
  function openDialog(id){
    fillDialog(id);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open','');
    history.replaceState(null, "", `#${id}`);
  }
  function closeDialog(){
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  on(grid,'click',(e)=>{
    const card = e.target.closest('.ndc-card'); if (!card) return;
    if (e.target.closest('.open') || e.target.closest('.block')) openDialog(card.dataset.id);
  });
  on(closeBtn,'click', closeDialog);
  on(dlg,'keydown',(e)=>{ if (e.key==='Escape') closeDialog(); });
  on(dlg,'click',(e)=>{ const r=dlg.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeDialog(); });

  on($('#sheetBook'),'click',(e)=>{
    const name = e.currentTarget?.dataset?.doc || '';
    const sel = $('#doctorSelect'); if (sel && name){
      sel.value = name;
      document.querySelector('#get-in-touch')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  function checkHash(){
    const id = location.hash.replace('#','');
    if (id && DATA[id]) openDialog(id);
  }
  window.addEventListener('hashchange', checkHash); checkHash();

  // search/filter chips
  function applyFilter(){
    const q = (search.value||'').toLowerCase().trim();
    const pressed = $$('#docFilters .chip--ghost').find(b=>b.getAttribute('aria-pressed')==='true');
    const f = pressed ? pressed.dataset.filter : 'all';
    $$('.ndc-card', grid).forEach(card=>{
      const tags = (card.getAttribute('data-tags')||'').toLowerCase();
      const text = (card.textContent||'').toLowerCase();
      const matchQ = !q || tags.includes(q) || text.includes(q);
      const matchF = (f==='all') || tags.includes(f);
      card.style.display = (matchQ && matchF) ? '' : 'none';
    });
  }
  on(search,'input', applyFilter);
  on($('.ndc-search .clear'),'click', ()=>{ search.value=''; applyFilter(); });
  $$('#docFilters .chip--ghost').forEach(btn=>{
    on(btn,'click', ()=>{
      $$('#docFilters .chip--ghost').forEach(b=>b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      applyFilter();
    });
  });
})();



/* =========================================================
   Testimonials rail controls
   ========================================================= */

/* =========================================================
   Certificates ticker (simple cards)
   ========================================================= */
(() => {
  const track = $('#certsTrack');
  const prev = $('.ticker-ctrl.prev');
  const next = $('.ticker-ctrl.next');
  if (!track) return;
  const CERTS = [
    { t:'IDA Membership', img:'/images/certs/ida.webp', href:'/credentials.html#ida' },
    { t:'DCI Registration', img:'/images/certs/dci.webp', href:'/credentials.html#dci' },
    { t:'Implantology Course', img:'/images/certs/implant.webp', href:'/credentials.html#implant' },
    { t:'Infection Control', img:'/images/certs/sterile.webp', href:'/credentials.html#infection' },
    { t:'Radiology Safety', img:'/images/certs/radiology.webp', href:'/credentials.html#radiology' },
    { t:'Pediatric Dentistry', img:'/images/certs/pedo.webp', href:'/credentials.html#pedo' }
  ];
  const item = (c)=>`
    <li class="ticker-item" style="min-width:260px">
      <a class="t-card" href="${c.href||'#'}">
        <div class="t-media"><img src="${c.img||''}" alt="${c.t||''}" loading="lazy"></div>
        <div class="t-body">
          <div class="t-title">${c.t||''}</div>
          <div class="t-desc">Click to view details</div>
          <div class="t-actions"><span class="t-btn">Open</span></div>
        </div>
      </a>
    </li>`;
  track.innerHTML = CERTS.map(item).join('') + CERTS.map(item).join('');
  const vw = () => track.parentElement.clientWidth || 800;
  on(prev,'click', ()=> track.parentElement.scrollBy({left:-vw()*0.8, behavior:'smooth'}));
  on(next,'click', ()=> track.parentElement.scrollBy({left: vw()*0.8, behavior:'smooth'}));
})();

/* =========================================================
   Footer year
   ========================================================= */
(() => { const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); })();

/* =========================================================
   Care Guide (Voka): full dataset + UI wiring + PDF
   ========================================================= */
function initCareGuide(){
  const el = {
    imgA: $('#vkImgA'), imgB: $('#vkImgB'),
    title: $('#vkTitle'), badge: $('#vkBadge'), words: $('#vkKeywords'),
    link: $('#vkDeepLink'),
    overview: $('#vkOverview'), postop: $('#vkPostop'), tips: $('#vkTips'), proscons: $('#vkProsCons'), sources: $('#vkSources'),
    prev: $('#vkPrev'), next: $('#vkNext'), dots: $('#vkDots'),
    search: $('#vkSearch'), category: $('#vkCategory'), chips: $('#vkChips'),
    datalist: $('#vk-datalist'), chatLog: $('#vkChatLog'), chatInput: $('#vkChatInput'), chatSend: $('#vkChatSend'),
    pdfBtn: $('#vkPDF')
  };
  if (!el.title) return;

  const VK_TOPICS = [
    {id:'rct', title:'Root Canal Treatment (RCT)', cat:'Tooth saving', img:'/images/care/rct.jpg', badge:'Tooth saving',
      keywords:['pain','deep decay','abscess','rct'],
      overview:`When decay/infection reaches the pulp, RCT removes infected tissue and seals canals to save the tooth.`,
      postop:`Day 0–2: mild soreness, meds.\nDay 3–7: avoid hard chewing.\n1–2 wks: crown recommended.`,
      tips:`Keep temporary dry 1h. Return for crown to prevent fracture.`,
      proscons:`Pros: Pain relief, saves tooth.\nCons: Needs crown, multiple visits.`,
      sources:`Cohen; Ingle; ADA.`,
      deeplink:'/specialities/root-canal.html' },
    {id:'rct-retreat', title:'Retreatment of RCT', cat:'Tooth saving', img:'/images/care/rct-retreat.jpg', badge:'Tooth saving',
      keywords:['failed rct','persistent pain','apical lesion'],
      overview:`Redo of previous RCT when symptoms persist or new decay causes leakage.`,
      postop:`Soreness 2–3d; follow-up X-ray in 6–12m.`,
      tips:`Crown replacement often needed; manage bite high spots.`,
      proscons:`Pros: Keeps tooth.\nCons: Complex, may need surgery.`,
      sources:`Cohen; AAEP.`,
      deeplink:'/specialities/root-canal.html#retreat' },
    {id:'apicoectomy', title:'Apicoectomy (Endodontic surgery)', cat:'Microsurgery', img:'/images/care/apico.jpg', badge:'Microsurgery',
      keywords:['apical surgery','persistent lesion'],
      overview:`Removes root tip and seals canal surgically when retreatment isn’t enough.`,
      postop:`Swelling 48h, sutures 1wk.`,
      tips:`Cold compress first day; soft diet.`,
      proscons:`Pros: Saves tooth.\nCons: Minor surgical risks.`,
      sources:`Kim & Kratchman; ADA.`,
      deeplink:'/specialities/root-canal.html#apico' },
    {id:'checkup', title:'Routine Checkup & Cleaning', cat:'Prevention', img:'/images/care/cleaning.jpg', badge:'Hygiene',
      keywords:['scaling','polishing','tartar'],
      overview:`Professional scaling removes plaque/tartar; polishing smoothens surfaces to reduce buildup.`,
      postop:`Mild gum soreness 24h.`,
      tips:`Brush 2×, floss daily; revisit 6 months.`,
      proscons:`Pros: Fresher breath, healthier gums.\nCons: Temporary sensitivity.`,
      sources:`IDA; ADA Prevention.`,
      deeplink:'/specialities/scaling-whitening.html' },
    {id:'whitening', title:'Teeth Whitening (Bleaching)', cat:'Prevention', img:'/images/care/whitening.jpg', badge:'Cosmetic',
      keywords:['stains','shade'],
      overview:`Peroxide gels safely lift stains under protection of gums and soft tissues.`,
      postop:`Sensitivity 24–48h possible.`,
      tips:`Avoid tea/coffee/red wine 48h.`,
      proscons:`Pros: Quick shade gain.\nCons: Not for some restorations.`,
      sources:`ADA statements.`,
      deeplink:'/specialities/scaling-whitening.html#whitening' },
    {id:'fluoride', title:'Fluoride Varnish / Gel', cat:'Prevention', img:'/images/care/fluoride.jpg', badge:'Preventive',
      keywords:['demineralization','sensitivity'],
      overview:`Topical fluoride hardens enamel and reduces sensitivity and decay risk.`,
      postop:`Avoid hard foods 1h.`,
      tips:`Use pea-sized fluoride paste twice daily.`,
      proscons:`Pros: Safe, effective.\nCons: Periodic reapplication.`,
      sources:`WHO; ADA; ICMR.`,
      deeplink:'/treatments#fluoride' },
    {id:'sealants', title:'Pit & Fissure Sealants', cat:'Prevention', img:'/images/care/sealants.jpg', badge:'Kids/Adults',
      keywords:['molars','grooves','decay prevention'],
      overview:`Resin coating seals grooves on molars to block decay in high-risk patients.`,
      postop:`No restrictions after set.`,
      tips:`Regular checks—repair/refresh if worn.`,
      proscons:`Pros: Painless prevention.\nCons: Needs maintenance.`,
      sources:`AAPD; ADA.`,
      deeplink:'/treatments#sealants' },
    {id:'mouthguard', title:'Night Guard / Sports Guard', cat:'Prevention', img:'/images/care/mouthguard.jpg', badge:'Protection',
      keywords:['bruxism','grinding','TMJ'],
      overview:`Custom guards protect teeth from grinding or sports impacts.`,
      postop:`Adaptation 1–2 wks.`,
      tips:`Clean daily; bring to reviews.`,
      proscons:`Pros: Protects enamel/joints.\nCons: Wear compliance needed.`,
      sources:`AAOP; ADA.`,
      deeplink:'/treatments#guards' },
    {id:'fillings', title:'Tooth-Coloured Fillings', cat:'Restorative', img:'/images/care/fillings.jpg', badge:'Restorative',
      keywords:['cavity','composite','tooth coloured'],
      overview:`Resin composites restore cavities with a natural look and strong bonding.`,
      postop:`Avoid very hard bite until fully set.`,
      tips:`Sensitivity settles in days; revisit if persists.`,
      proscons:`Pros: Aesthetic, conservative.\nCons: Technique sensitive.`,
      sources:`Sturdevant.`,
      deeplink:'/specialities/fillings.html' },
    {id:'inlay', title:'Inlays & Onlays', cat:'Restorative', img:'/images/care/inlay.jpg', badge:'Conservative',
      keywords:['partial crown','ceramic','onlay'],
      overview:`Lab-made restorations when damage is too big for a filling but not a full crown.`,
      postop:`Temp in place 1–2 wks before cementation.`,
      tips:`Avoid sticky foods with temporary.`,
      proscons:`Pros: Strength, precision.\nCons: Two visits, cost.`,
      sources:`Shillingburg.`,
      deeplink:'/treatments#inlay-onlay' },
    {id:'crown', title:'Dental Crowns', cat:'Crowns & bridges', img:'/images/care/crowns.jpg', badge:'Protection',
      keywords:['fracture','post rct'],
      overview:`Covers and protects weak or RCT teeth; materials include zirconia, porcelain, metal-ceramic.`,
      postop:`Temp crown phase; bite check at final.`,
      tips:`Avoid sticky foods with temporary.`,
      proscons:`Pros: Strength, esthetics.\nCons: Tooth prep required.`,
      sources:`Shillingburg.`,
      deeplink:'/specialities/crowns-bridges.html' },
    {id:'bridge', title:'Dental Bridge', cat:'Crowns & bridges', img:'/images/care/bridge.jpg', badge:'Replacement',
      keywords:['missing tooth','fixed'],
      overview:`Replaces missing tooth by anchoring crowns to neighbours; fixed and aesthetic.`,
      postop:`Try-in and bite adjustments.`,
      tips:`Floss threader under pontic daily.`,
      proscons:`Pros: Fixed, quick.\nCons: Preps adjacent teeth.`,
      sources:`Shillingburg; ADA.`,
      deeplink:'/specialities/crowns-bridges.html#bridge' },
    {id:'post-core', title:'Post & Core (Post RCT)', cat:'Crowns & bridges', img:'/images/care/postcore.jpg', badge:'Build-up',
      keywords:['weak tooth','core build'],
      overview:`Fiber/metal post with core rebuilding provides support before crown on severely damaged RCT teeth.`,
      postop:`Soreness 1–2d possible.`,
      tips:`Crown soon to prevent fracture.`,
      proscons:`Pros: Salvages tooth.\nCons: Complex; rare root risk.`,
      sources:`Cohen; Shillingburg.`,
      deeplink:'/treatments#post-core' },
    {id:'implants', title:'Dental Implants', cat:'Implants & replacement', img:'/images/care/implants.jpg', badge:'Replacement',
      keywords:['titanium','crown','missing tooth'],
      overview:`Titanium fixture integrates with bone; then abutment + crown for a natural replacement.`,
      postop:`Swelling/bruising 2–3d; stitches 1–2wks.`,
      tips:`No smoking; meticulous hygiene.`,
      proscons:`Pros: Preserves bone, fixed.\nCons: Time & cost; needs bone.`,
      sources:`ITI; Carranza; ADA.`,
      deeplink:'/specialities/implants.html' },
    {id:'sinus-lift', title:'Sinus Lift / Bone Graft', cat:'Implants & replacement', img:'/images/care/sinus.jpg', badge:'Grafting',
      keywords:['posterior maxilla','augmentation'],
      overview:`Raises sinus floor with graft when upper back jaw lacks height for implants.`,
      postop:`Avoid nose blowing 2wks; decongestants as advised.`,
      tips:`Sleep elevated first nights.`,
      proscons:`Pros: Enables implants.\nCons: Swelling; sinus care needed.`,
      sources:`ITI Consensus.`,
      deeplink:'/treatments#sinus-lift' },
    {id:'overdenture', title:'Implant Overdentures', cat:'Implants & replacement', img:'/images/care/overdenture.jpg', badge:'Stability',
      keywords:['loose denture','locator'],
      overview:`Two–four implants snap-retent dentures for better stability and chewing.`,
      postop:`Sore spots early; adjust liners.`,
      tips:`Remove nightly; clean components.`,
      proscons:`Pros: Stable, affordable vs full-arch.\nCons: Maintenance of attachments.`,
      sources:`McCracken; ITI.`,
      deeplink:'/specialities/dentures.html#implant-overdenture' },
    {id:'wisdom', title:'Wisdom Tooth Extraction', cat:'Oral surgery', img:'/images/care/wisdom.jpg', badge:'Surgery',
      keywords:['impaction','swelling','pericoronitis'],
      overview:`Removal of impacted or problem wisdom teeth to prevent pain/infection and crowding.`,
      postop:`Gauze pressure; cold compress 24h; soft diet 3d.`,
      tips:`No smoking/straws 72h; gentle rinses.`,
      proscons:`Pros: Pain relief, hygiene ease.\nCons: Temporary swelling; rare nerve risk.`,
      sources:`AAOMS; ADA.`,
      deeplink:'/specialities/extraction.html' },
    {id:'frenectomy', title:'Frenectomy (Tongue/Lip Tie)', cat:'Oral surgery', img:'/images/care/frenectomy.jpg', badge:'Soft tissue',
      keywords:['tongue tie','speech','feeding'],
      overview:`Releases restrictive frenum for improved speech, feeding or hygiene access.`,
      postop:`Stretching exercises few weeks.`,
      tips:`Gentle saltwater rinses after 24h.`,
      proscons:`Pros: Functional gains.\nCons: Minor bleeding/discomfort.`,
      sources:`AAPD; AAOMS.`,
      deeplink:'/treatments#frenectomy' },
    {id:'biopsy', title:'Oral Biopsy & Lesion Care', cat:'Oral surgery', img:'/images/care/biopsy.jpg', badge:'Diagnosis',
      keywords:['white patch','ulcer','growth'],
      overview:`Tissue sampling of suspicious lesions for definitive diagnosis and plan.`,
      postop:`Avoid spicy/hot 24h; review histology.`,
      tips:`Report non-healing ulcers >2wks promptly.`,
      proscons:`Pros: Early detection.\nCons: Minor surgical risks.`,
      sources:`Neville Oral Path.`,
      deeplink:'/treatments#biopsy' },
    {id:'aligners', title:'Clear Aligners', cat:'Orthodontics', img:'/images/care/aligners.jpg', badge:'Alignment',
      keywords:['invisible','attachments'],
      overview:`Series of removable trays gradually move teeth; discreet and hygienic.`,
      postop:`Tenderness 2–3d after new trays.`,
      tips:`Wear 22h/day; change as scheduled.`,
      proscons:`Pros: Aesthetic, removable.\nCons: Discipline needed.`,
      sources:`Proffit; ADA.`,
      deeplink:'/specialities/invisalign.html' },
    {id:'braces', title:'Fixed Braces (Metal/Ceramic)', cat:'Orthodontics', img:'/images/care/braces.jpg', badge:'Alignment',
      keywords:['crowding','bite correction'],
      overview:`Brackets and wires provide precise control for simple to complex tooth movements.`,
      postop:`Soreness 2–4d post activation.`,
      tips:`Interdental brushes; avoid sticky foods.`,
      proscons:`Pros: Versatile, effective.\nCons: Plaque control crucial.`,
      sources:`Proffit.`,
      deeplink:'/specialities/braces.html' },
    {id:'retainers', title:'Retainers (Post Ortho)', cat:'Orthodontics', img:'/images/care/retainers.jpg', badge:'Retention',
      keywords:['relapse','fixed retainer'],
      overview:`Keeps teeth in new position after braces/aligners to prevent relapse.`,
      postop:`Attach checks every 6–12m.`,
      tips:`Follow wear schedule strictly.`,
      proscons:`Pros: Maintains results.\nCons: Compliance/maintenance.`,
      sources:`Proffit; BOS.`,
      deeplink:'/treatments#retainers' },
    {id:'kids', title:'Pediatric Checkup & Sealants', cat:'Pediatric', img:'/images/care/kids.jpg', badge:'Kids',
      keywords:['kids','sealants','varnish'],
      overview:`Regular checkups, fluoride and sealants cut decay risk and build oral habits.`,
      postop:`Normal diet; avoid very sticky 1d.`,
      tips:`Brush 2×; supervise <6y; age-based paste.`,
      proscons:`Pros: Prevention first.\nCons: Periodic maintenance.`,
      sources:`AAPD; WHO.`,
      deeplink:'/specialities/kids-dentistry.html' },
    {id:'pulpotomy', title:'Pulpotomy (Milk Tooth)', cat:'Pediatric', img:'/images/care/pulpotomy.jpg', badge:'Kids',
      keywords:['deep cavity','primary molar pain'],
      overview:`Removes infected crown pulp in milk tooth; medicament placed, tooth restored/crowned.`,
      postop:`Soreness 1–2d.`,
      tips:`Stainless steel crown often advised.`,
      proscons:`Pros: Pain relief, preserves space.\nCons: Needs crown; follow-ups.`,
      sources:`AAPD pulp therapy.`,
      deeplink:'/treatments#pulpotomy' },
    {id:'space-maintainer', title:'Space Maintainers', cat:'Pediatric', img:'/images/care/space.jpg', badge:'Kids',
      keywords:['early loss','crowding prevention'],
      overview:`Holds space if a milk tooth is lost early so adult tooth erupts correctly.`,
      postop:`Checks every 3–6 months.`,
      tips:`Avoid very sticky foods.`,
      proscons:`Pros: Prevents crowding.\nCons: Breakage risk; reviews needed.`,
      sources:`AAPD space mgmt.`,
      deeplink:'/treatments#space-maintainer' },
    {id:'srp', title:'Deep Cleaning (SRP)', cat:'Prevention', img:'/images/care/srp.jpg', badge:'Gum care',
      keywords:['pockets','bleeding gums','periodontitis'],
      overview:`Scaling and root planing cleans below gums to reduce pocket depth and inflammation.`,
      postop:`Tenderness 24–48h; chlorhexidine as advised.`,
      tips:`Floss/brush 2×; re-evaluate pockets.`,
      proscons:`Pros: Controls disease.\nCons: Multiple visits.`,
      sources:`Carranza; AAP.`,
      deeplink:'/specialities/gum-surgeries.html#srp' },
    {id:'flap', title:'Flap Surgery / Regeneration', cat:'Prevention', img:'/images/care/flap.jpg', badge:'Periodontal',
      keywords:['advanced gum disease','bone loss'],
      overview:`Opens gums to clean roots and, when indicated, rebuild bone with grafts/membranes.`,
      postop:`Swelling 2–3d; sutures 1–2wks.`,
      tips:`Ice first 24h; soft diet; avoid brushing surgical area initially.`,
      proscons:`Pros: Pocket reduction.\nCons: Surgery, cost.`,
      sources:`Carranza; AAP.`,
      deeplink:'/specialities/gum-surgeries.html#flap' },
    {id:'gingivectomy', title:'Gingivectomy / Crown Lengthening', cat:'Prevention', img:'/images/care/gingivectomy.jpg', badge:'Gum reshaping',
      keywords:['gummy smile','restorative access'],
      overview:`Reshapes gum for esthetics or to expose more tooth for restoration.`,
      postop:`Tenderness 2–3d.`,
      tips:`Gentle rinses; desensitizing gel if needed.`,
      proscons:`Pros: Esthetics/restorability.\nCons: Temporary sensitivity.`,
      sources:`AAP; Carranza.`,
      deeplink:'/treatments#gingivectomy' },
    {id:'tmj', title:'TMJ Pain & Splint Therapy', cat:'Prevention', img:'/images/care/tmj.jpg', badge:'Jaw joint',
      keywords:['clicking','locking','myalgia'],
      overview:`Jaw joint/muscle pain often benefits from bite splints, exercises and habit modifications.`,
      postop:`Review in 4–6 wks.`,
      tips:`Limit wide yawns; heat/physio as guided.`,
      proscons:`Pros: Pain reduction.\nCons: Compliance needed.`,
      sources:`AAOP guidelines.`,
      deeplink:'/treatments#tmj' },
    {id:'veneers', title:'Porcelain Veneers', cat:'Restorative', img:'/images/care/veneers.jpg', badge:'Smile',
      keywords:['discoloration','shape','gap'],
      overview:`Thin ceramic shells bonded to front teeth to improve colour/shape/spacing.`,
      postop:`Try-in; final bonding; bite adjust.`,
      tips:`Night guard if bruxism; avoid nail-biting.`,
      proscons:`Pros: Natural esthetics.\nCons: Irreversible prep; cost.`,
      sources:`Nash; ADA.`,
      deeplink:'/treatments#veneers' },
    {id:'bonding', title:'Composite Bonding', cat:'Restorative', img:'/images/care/bonding.jpg', badge:'Smile',
      keywords:['chips','gaps','edge wear'],
      overview:`Tooth-coloured resin to repair chips, close small gaps or lengthen worn edges.`,
      postop:`Polish/finish same visit.`,
      tips:`Avoid staining foods first 24h.`,
      proscons:`Pros: One visit, conservative.\nCons: Stains/wear faster than ceramics.`,
      sources:`Sturdevant.`,
      deeplink:'/treatments#bonding' },
    {id:'complete-denture', title:'Complete Dentures', cat:'Implants & replacement', img:'/images/care/complete-denture.jpg', badge:'Removable',
      keywords:['full denture','edentulous'],
      overview:`Conventional removable prosthesis to replace all teeth; requires adaptation period.`,
      postop:`Sore spot adjustments initial weeks.`,
      tips:`Remove at night; clean daily; store in water.`,
      proscons:`Pros: Restores function/looks.\nCons: Lower denture may feel loose; adaptation time.`,
      sources:`McCracken.`,
      deeplink:'/specialities/dentures.html' },
    {id:'partial-denture', title:'Cast Partial Denture', cat:'Implants & replacement', img:'/images/care/partial-denture.jpg', badge:'Removable',
      keywords:['missing teeth','metal framework'],
      overview:`Metal-framework partials offer durability and better fit for multiple missing teeth.`,
      postop:`Adjustment of clasps/occlusion.`,
      tips:`Remove nightly; hygiene under rests/clasps.`,
      proscons:`Pros: Cost-effective.\nCons: Visible clasps sometimes.`,
      sources:`McCracken.`,
      deeplink:'/specialities/dentures.html#partial' },
    {id:'trauma', title:'Dental Trauma (Knocked Tooth)', cat:'Tooth saving', img:'/images/care/trauma.jpg', badge:'Emergency',
      keywords:['avulsion','injury'],
      overview:`If a permanent tooth is knocked out, reimplant immediately or store in milk/saline; seek urgent care.`,
      postop:`Splinting; vitality checks over months.`,
      tips:`Tetanus update if needed.`,
      proscons:`Pros: Saves tooth if quick.\nCons: Resorption risk.`,
      sources:`IADT guidelines.`,
      deeplink:'/treatments#trauma' },
    {id:'ulcer', title:'Mouth Ulcers / Aphthae', cat:'Prevention', img:'/images/care/ulcer.jpg', badge:'Relief',
      keywords:['canker sore','stomatitis'],
      overview:`Self-limiting; topical anaesthetics and steroid gels help; rule out trauma or deficiency.`,
      postop:`Avoid spicy/acidic foods till healed.`,
      tips:`Check sharp teeth/plates; B12/iron if recurrent.`,
      proscons:`Pros: Quick relief.\nCons: Recurrence for some.`,
      sources:`BNF; ADA.`,
      deeplink:'/treatments#ulcer' },
    {id:'halitosis', title:'Bad Breath (Halitosis) Care', cat:'Prevention', img:'/images/care/halitosis.jpg', badge:'Fresh breath',
      keywords:['coated tongue','gum disease'],
      overview:`Manage causes: tongue cleaning, gum therapy, caries control; rule out ENT/GI causes if persistent.`,
      postop:`Follow-up if symptoms persist 2–4wks.`,
      tips:`Hydration; clean tongue daily.`,
      proscons:`Pros: Improves confidence.\nCons: Habits must continue.`,
      sources:`ADA.`,
      deeplink:'/treatments#halitosis' },
    {id:'pregnancy', title:'Pregnancy Dental Care', cat:'Prevention', img:'/images/care/pregnancy.jpg', badge:'Special care',
      keywords:['safe trimester','x-ray shield','gingivitis'],
      overview:`Second trimester ideal for routine care; emergencies anytime with shielding and consent.`,
      postop:`Short appointments; left-tilt position late trimester.`,
      tips:`Soft brush; manage morning-sickness erosion.`,
      proscons:`Pros: Safer outcomes for mom/baby.\nCons: Some procedures deferred.`,
      sources:`ACOG; ADA.`,
      deeplink:'/specialities/pregnancy-dental-care.html' }
  ];

  const state = { i: 0, filtered: [...VK_TOPICS] };

  const escapeHtml = (s)=> (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const nl2li = (s)=> (s||'').split('\n').map(x=>x.trim()).filter(Boolean).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const renderListPanel = (label, body) => `<ul aria-label="${label}">${nl2li(body)}</ul>`;

  function crossfadeTo(src){
    const shown = el.imgA.classList.contains('is-show') ? el.imgA : el.imgB;
    const other = shown === el.imgA ? el.imgB : el.imgA;
    other.src = src || '/images/care/placeholder.jpg';
    other.onload = () => {
      shown.classList.remove('is-show');
      other.classList.add('is-show');
    };
  }

  function setTabs(activeId){
    $$('.vk-tab').forEach(btn=>{
      const on = btn.id === activeId;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', String(on));
      btn.tabIndex = on ? 0 : -1;
      const panelId = ({
        'tab-overview':'vkOverview',
        'tab-postop':'vkPostop',
        'tab-tips':'vkTips',
        'tab-proscons':'vkProsCons',
        'tab-sources':'vkSources'
      })[btn.id];
      const panel = $('#'+panelId);
      if (panel){
        panel.toggleAttribute('hidden', !on);
        panel.classList.toggle('is-active', on);
      }
    });
  }

  function buildDots(){
    el.dots.innerHTML = state.filtered.map((t,idx)=>`<button type="button" class="${idx===state.i?'is-active':''}" aria-label="Show ${escapeHtml(t.title)}" data-i="${idx}"></button>`).join('');
  }

  function buildChips(){
    const HOT = ['pain','whitening','implants','braces','wisdom','kids','gum','crown','aligners','ulcer'];
    const seen = new Set();
    const chips = [];
    // build from keywords & ids
    state.filtered.forEach(t => (t.keywords||[]).forEach(k => { if (HOT.some(h=>k.includes(h)) && !seen.has(k)){ seen.add(k); chips.push(k); }}));
    // ensure unique and limited
    const final = Array.from(new Set([...HOT, ...chips])).slice(0,12);
    el.chips.innerHTML = final.map(w => `<button type="button" class="vk-chip" data-q="${escapeHtml(w)}">${escapeHtml(w)}</button>`).join('');
  }

  function buildDatalist(){
    const opts = [];
    VK_TOPICS.forEach(t => {
      opts.push(`<option value="${escapeHtml(t.title)}">`);
      (t.keywords||[]).forEach(k => opts.push(`<option value="${escapeHtml(k)}">`));
    });
    el.datalist.innerHTML = opts.join('');
  }

  function show(i){
    if (state.filtered.length === 0) return;
    state.i = (i + state.filtered.length) % state.filtered.length;
    const t = state.filtered[state.i];
    el.title.textContent = t.title;
    el.badge.textContent = t.badge || t.cat || 'Topic';
    el.words.innerHTML = (t.keywords||[]).slice(0,6).map(k=>`<span class="chip">${escapeHtml(k)}</span>`).join('');
    el.link.href = t.deeplink || '#';
    el.overview.innerHTML = `<p>${escapeHtml(t.overview||'')}</p>`;
    el.postop.innerHTML   = renderListPanel('Post-op', t.postop);
    el.tips.innerHTML     = renderListPanel('Tips', t.tips);
    el.proscons.innerHTML = renderListPanel('Pros & Cons', t.proscons);
    el.sources.querySelector('.vk-refs')?.insertAdjacentHTML('beforeend', t.sources?`<li>${escapeHtml(t.sources)}</li>`:'');
    crossfadeTo(t.img);

    // update dots active state
    $$('#vkDots button').forEach((b,idx)=> b.classList.toggle('is-active', idx===state.i));

    // set hash for deep-linking (doesn't trigger doctor dialog)
    history.replaceState(null, "", `#care:${t.id}`);
  }

  function applyCategory(){
    const cat = el.category.value;
    const q   = (el.search.value||'').trim().toLowerCase();
    state.filtered = VK_TOPICS.filter(t => (cat==='all' || t.cat===cat) && (
      !q || t.title.toLowerCase().includes(q) ||
      (t.keywords||[]).some(k => k.toLowerCase().includes(q))
    ));
    if (state.filtered.length === 0){
      el.title.textContent = 'No matches';
      el.overview.innerHTML = `<p>Try a simpler term (e.g., “pain”, “whitening”, “braces”).</p>`;
      el.postop.innerHTML = el.tips.innerHTML = el.proscons.innerHTML = '';
      el.words.innerHTML = ''; el.link.href = '#';
      return;
    }
    state.i = 0;
    buildDots();
    buildChips();
    show(0);
  }

  function jumpToQuery(q){
    const s = (q||'').trim().toLowerCase();
    if (!s) return;
    const idx = VK_TOPICS.findIndex(t =>
      t.title.toLowerCase().includes(s) || (t.keywords||[]).some(k => k.toLowerCase().includes(s))
    );
    if (idx >= 0){
      const t = VK_TOPICS[idx];
      // reset filters so result is visible
      el.category.value = 'all'; el.search.value = '';
      state.filtered = [...VK_TOPICS];
      buildDots(); buildChips();
      show(state.filtered.findIndex(x=>x.id===t.id));
    }
  }

  // events
  on(el.prev,'click', ()=> show(state.i - 1));
  on(el.next,'click', ()=> show(state.i + 1));
  on(el.dots,'click',(e)=>{ const b = e.target.closest('button[data-i]'); if (b) show(+b.dataset.i); });

  // tabs
  $$('.vk-tab').forEach(btn=>{
    on(btn,'click', ()=> setTabs(btn.id));
    on(btn,'keydown', (e)=>{
      if (e.key==='ArrowRight' || e.key==='ArrowLeft'){
        const tabs = $$('.vk-tab'); const cur = tabs.indexOf(btn);
        const nxt = e.key==='ArrowRight' ? (cur+1)%tabs.length : (cur-1+tabs.length)%tabs.length;
        tabs[nxt].focus(); tabs[nxt].click();
      }
    });
  });

  // filtering/search/chips
  on(el.category,'change', applyCategory);
  on(el.search,'input', ()=> { /* live suggestions only */ });
  on(el.search,'change', ()=> applyCategory());
  on(el.chips,'click',(e)=>{ const c=e.target.closest('.vk-chip'); if (!c) return; el.search.value=c.dataset.q||''; applyCategory(); });

  // chat
  function chatLine(msg, who='user'){
    const div = document.createElement('div');
    div.className = 'msg ' + (who==='user' ? 'msg--user':'msg--bot');
    div.textContent = msg;
    el.chatLog.appendChild(div);
    el.chatLog.scrollTop = el.chatLog.scrollHeight;
  }
  function handleChat(){
    const q = el.chatInput.value.trim();
    if (!q) return;
    chatLine(q, 'user');
    jumpToQuery(q);
    const t = state.filtered[state.i];
    chatLine(`Jumped to: ${t.title}. Open “Tips” or “Pros & Cons” tabs for quick guidance.`, 'bot');
    el.chatInput.value = '';
  }
  on(el.chatSend,'click', handleChat);
  on(el.chatInput,'keydown',(e)=>{ if (e.key==='Enter') handleChat(); });

  // deep-link on load: #care:<id>
  function checkHash(){
    const m = (location.hash||'').match(/^#care:(.+)$/);
    if (m){
      const id = m[1];
      const idx = VK_TOPICS.findIndex(t=>t.id===id);
      if (idx >= 0){
        state.filtered = [...VK_TOPICS];
        buildDots(); buildChips();
        show(idx);
        $('#ndc-care-voka')?.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }
  }

  // PDF export
  on(el.pdfBtn,'click', async ()=> {
    const t = state.filtered[state.i];
    const printable = document.createElement('div');
    printable.style.padding = '20px';
    printable.style.fontFamily = 'Manrope, Arial, sans-serif';
    printable.style.maxWidth = '720px';
    printable.innerHTML = `
      <h2 style="margin:0 0 6px">${escapeHtml(t.title)}</h2>
      <div style="color:#555;margin:0 0 12px">${escapeHtml(t.cat)} • ${escapeHtml(t.badge||'')}</div>
      <img src="${t.img}" alt="" style="width:100%;height:auto;border-radius:8px;border:1px solid #eee;margin:6px 0 12px"/>
      <h3>Overview</h3><p>${escapeHtml(t.overview||'')}</p>
      <h3>Post-op timeline</h3>${renderListPanel('Post-op', t.postop)}
      <h3>Tips / FAQ</h3>${renderListPanel('Tips', t.tips)}
      <h3>Pros & Cons</h3>${renderListPanel('Pros & Cons', t.proscons)}
      <h3>Sources</h3><p>${escapeHtml(t.sources||'IDA / ADA / ICMR / WHO')}</p>
      <hr/>
      <small>Noble Dental Care — Nallagandla • This sheet is educational, not diagnostic.</small>
    `;
    if (!window.html2pdf){
      alert('PDF generator not loaded. Please include html2pdf.bundle.min.js.');
      return;
    }
    const opt = {
      margin:       10,
      filename:     `NDC_${t.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.96 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(printable).save();
  });

  // initial render
  buildDatalist();
  applyCategory();
  setTabs('tab-overview');
  checkHash();
}

/* Lazy init Care Guide when section is near viewport */
(() => {
  const target = document.querySelector('#ndc-care-voka');
  if (!target) return;
  const start = () => { if (!start._done){ start._done = true; initCareGuide(); } };
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some(e => e.isIntersecting)) { start(); obs.disconnect(); }
    }, { rootMargin: '600px' });
    io.observe(target);
  } else {
    start();
  }
})();
