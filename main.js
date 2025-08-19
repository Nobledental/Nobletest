/* =========================================================
   main.js — Site behaviors + Services grid (v2, final)
   ========================================================= */

/* ---------- Core site behaviors ---------- */
(() => {
  const qs  = (s, r=document)=>r.querySelector(s);
  const qsa = (s, r=document)=>Array.from(r.querySelectorAll(s));

  // AOS init (safe)
  window.addEventListener('load', () => {
    if (window.AOS) AOS.init({ once: true, duration: 700, easing: 'ease-out' });
  });

  // Sticky header elevation
  const header = qs('.site-header');
  const onScroll = () => header?.classList.toggle('elevated', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu (drawer) + focus trap + Esc/outside + body lock
  const nav      = qs('.main-nav');
  const menuBtn  = qs('.menu-toggle');
  const focusSel = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let prevFocus = null;

  const trapTab = (e) => {
    if (!nav?.classList.contains('open') || e.key !== 'Tab') return;
    const nodes = qsa(focusSel, nav).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const onEscClose = (e) => { if (e.key === 'Escape') closeMenu(); };

  const openMenu = () => {
    if (!nav) return;
    prevFocus = document.activeElement;
    nav.classList.add('open');
    document.body.classList.add('nav-open');
    menuBtn?.setAttribute('aria-expanded', 'true');
    (qs(focusSel, nav) || nav).focus();
    document.addEventListener('keydown', trapTab, true);
    document.addEventListener('keydown', onEscClose, true);
  };
  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', trapTab, true);
    document.removeEventListener('keydown', onEscClose, true);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => (nav.classList.contains('open') ? closeMenu() : openMenu()));
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && nav.classList.contains('open')) closeMenu();
    });
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const inside = e.target.closest('.main-nav') || e.target.closest('.menu-toggle');
      if (!inside) closeMenu();
    });
  }

  // Specialities dropdown (tap on mobile)
  const spItem   = qs('.has-submenu');
  const spToggle = qs('.has-submenu > a');
  const isTouchMode = () =>
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const toggleSubmenu = (open) => {
    if (!spItem || !spToggle) return;
    const willOpen = (typeof open === 'boolean') ? open : !spItem.classList.contains('open-submenu');
    spItem.classList.toggle('open-submenu', willOpen);
    spToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  };

  if (spItem && spToggle) {
    spToggle.addEventListener('click', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (isTouchMode() || drawerOpen) {
        e.preventDefault();
        toggleSubmenu();
      }
    });
    spToggle.addEventListener('keydown', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (!(isTouchMode() || drawerOpen)) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSubmenu(); }
    });
    document.addEventListener('click', (e) => {
      const drawerOpen = nav?.classList.contains('open');
      if (!(isTouchMode() || drawerOpen)) return;
      if (!spItem.contains(e.target)) toggleSubmenu(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleSubmenu(false); });
    let resizeTimer;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => toggleSubmenu(false), 120); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
  }

  // Smooth scroll with fixed-header offset
  const scrollWithOffset = (el) => {
    const h = header ? header.getBoundingClientRect().height : 0;
    const y = el.getBoundingClientRect().top + window.scrollY - h - 8;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.startsWith('#!')) return;
      const el = qs(id);
      if (!el) return;
      e.preventDefault();
      scrollWithOffset(el);
      history.replaceState(null, '', id);
      if (qs('.main-nav')?.classList.contains('open')) closeMenu();
    });
  });

  // Active link highlight on scroll
  const sections = qsa('section[id]');
  const navLinks = new Map();
  qsa('.main-nav a[href^="#"]').forEach(a => { const id = a.getAttribute('href'); if (id) navLinks.set(id, a); });
  if (sections.length && navLinks.size) {
    const io = new IntersectionObserver((entries) => {
      const best = entries.filter(e => e.isIntersecting).sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0];
      if (!best) return;
      const id = `#${best.target.id}`;
      navLinks.forEach(link => link.classList.remove('active'));
      const active = navLinks.get(id);
      if (active) active.classList.add('active');
    }, { rootMargin: '-45% 0px -50% 0px', threshold: [0, .25, .5, .75, 1] });
    sections.forEach(sec => io.observe(sec));
    window.addEventListener('pagehide', () => io.disconnect());
  }

  // Footer year
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Motion preferences for hero video
  const video = qs('.blackhole-video');
  const mq    = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPref = () => {
    if (!video) return;
    if (mq.matches) { video.pause(); video.removeAttribute('autoplay'); }
    else { if (video.paused) video.play().catch(()=>{}); }
  };
  if (mq.addEventListener) mq.addEventListener('change', applyMotionPref);
  else if (mq.addListener) mq.addListener(applyMotionPref);
  applyMotionPref();
})();

/* ---------- Doctors + About + Appointment (scoped + cleaned) ---------- */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Scope for the Doctors/About/Profile area only
  const root = document.getElementById('ndc-doctors-app');
  if (!root) return;

  // Scoped (Doctors section) and Global (whole page) helpers
  const elR = (id) => root.querySelector(`[data-ndc="${id}"]`);       // inside #ndc-doctors-app
  const el  = (id) => document.querySelector(`[data-ndc="${id}"]`);   // anywhere on the page

  // ---------- DATA ----------
  const CURRENT_YEAR = new Date().getFullYear();
  const BOOK_COVER = "https://limasy.com/limcms/uploads/products/triumphs-complete-review-of-dentistry-2-volume-set_1709201366_22611.png";

  const DOCTORS = [
    { id:"dhivakaran", name:"Dr Dhivakaran", rating:4.9,
      specialty:"Chief Medical Director, Noble Dental Care · Director, Healthflo",
      expertise:["CMD — Noble Dental Care","Director — Healthflo (557 hospitals)"],
      experience:{startYear:CURRENT_YEAR-10},
      phones:["8610425342","8074512305"],
      consultation:["Walk-in","Appointment Booking","Tele-consultation"],
      cities:["Hyderabad","Bangalore","Chennai","Madurai"],
      books:[{title:"Triumph’s Complete Review of Dentistry (2 Vol Set), Ed. 1",cover:BOOK_COVER,link:"https://play.google.com/store/books/details/Triumph_s_Complete_Review_of_Dentistry?id=ZTjvDwAAQBAJ&hl=en_US&pli=1",publisher:"Wolters Kluwer · Oct 2018"}],
      avatar:"https://i.imgur.com/1X5v8X2.png"},
    { id:"roger", name:"Dr Roger Ronaldo", rating:4.8,
      specialty:"Consultant Oral & Maxillofacial Surgeon — Implantology, Facial Reconstruction",
      expertise:["Implantology","Orthognathic & Reconstruction","Trauma Surgery"],
      experience:{startYear:CURRENT_YEAR-13},
      phones:["8610425342","8074512305"],
      consultation:["Appointment Booking","Tele-consultation"],
      cities:["Hyderabad","Bangalore","Chennai"],
      books:[{title:"Triumph’s Complete Review of Dentistry (2 Vol Set), Ed. 1",cover:BOOK_COVER,link:"https://play.google.com/store/books/details/Triumph_s_Complete_Review_of_Dentistry?id=ZTjvDwAAQBAJ&hl=en_US&pli=1",publisher:"Wolters Kluwer · Oct 2018"}],
      avatar:"https://i.imgur.com/7M2Qm1W.png"},
    { id:"thikvijay", name:"Dr Thik Vijay", rating:4.6,
      specialty:"FMC., (Germany) — Trichology, Aesthetic & Medical Cosmetology (ISHR)",
      expertise:["Trichology","Aesthetic & Medical Cosmetology","Hair & Scalp Restoration"],
      experience:{startYear:CURRENT_YEAR-11},
      phones:["8610425342","8074512305"],
      consultation:["Appointment Booking","Tele-consultation"],
      cities:["Chennai","Hyderabad"], books:[], avatar:"https://i.imgur.com/y6w2m8a.png"},
    { id:"deepak", name:"Dr Deepak", rating:4.7,
      specialty:"Orthodontist (Assistant Professor)",
      expertise:["Orthodontics","Smile Design & Aligners","Complex Malocclusion"],
      experience:{startYear:CURRENT_YEAR-10},
      phones:["8610425342","8074512305"],
      consultation:["Appointment Booking","Tele-consultation"],
      cities:["Chennai","Hyderabad","Andhra"], books:[], avatar:"https://i.imgur.com/1X5v8X2.png"},
    { id:"manoj", name:"Dr Manoj Reddy", rating:4.5,
      specialty:"Oral & Maxillofacial Surgeon — Implantology",
      expertise:["Dental Implants","Maxillofacial Surgery","Full-mouth Rehab"],
      experience:{startYear:CURRENT_YEAR-9},
      phones:["8610425342","8074512305"],
      consultation:["Appointment Booking","Tele-consultation"],
      cities:["Hyderabad","Andhra Pradesh","Chennai"], books:[], avatar:"https://i.imgur.com/7M2Qm1W.png"},
    { id:"idhaya", name:"Dr Idhaya", rating:4.4,
      specialty:"· CEO - Healthflo · Health Insurance · Medical Tourism",
      expertise:["Preventive Dentistry","Insurance Advisory","Tourism Coordination"],
      experience:{startYear:CURRENT_YEAR-8},
      phones:["8610425342","8074512305"],
      consultation:["Tele-consultation"],
      cities:["Bangalore","Chennai","Hyderabad"], books:[], avatar:"https://i.imgur.com/y6w2m8a.png"}
  ];

  // ---------- UTIL ----------
  const cityLink = (name) => {
    const DIRECT = {
      Nallagandla:"https://maps.app.goo.gl/xWyPi9pwkcM6hjYRA",
      Tellapur:"https://maps.app.goo.gl/uxtsDV7hR6iCp5Uq8",
      Lingampally:"https://maps.app.goo.gl/LQDetRYN3ednqDLn7",
      Serilingampally:"https://maps.app.goo.gl/pLukMFtAPwzdoE9N8",
      Gopanpally:"https://maps.app.goo.gl/EhtpSoxcchtQxG8E9"
    };
    return DIRECT[name] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Best dentist in '+name)}`;
  };
  const expLabel = (conf) => conf?.startYear ? `${Math.max(0, CURRENT_YEAR - conf.startYear)} Years` : "—";

  // ---------- RENDER LIST (Doctors left column) ----------
  const listWrap = elR('docList');
  function renderList(activeId){
    if (!listWrap) return;
    listWrap.innerHTML = '';
    DOCTORS.forEach(d=>{
      const card = document.createElement('button');
      card.type='button'; card.className='ndc-doc-card'; card.setAttribute('role','listitem');
      card.setAttribute('aria-current', d.id===activeId ? 'true' : 'false');
      card.innerHTML = `
        <img class="ndc-avatar" src="${d.avatar}" alt="${d.name} portrait" loading="lazy">
        <div class="ndc-doc-main">
          <div class="ndc-doc-name">${d.name}</div>
          <div class="ndc-doc-role">${d.specialty}</div>
        </div>
        <div class="ndc-doc-right"><span class="ndc-badge">★ ${d.rating.toFixed(1)}</span></div>`;
      card.addEventListener('click', ()=> selectDoctor(d.id));
      listWrap.appendChild(card);
    });
  }

  // ---------- FILL ABOUT + PROFILE (center + right columns) ----------
  function fillDoctor(d){
    // About (scoped under root)
    elR('aboutAvatar')?.setAttribute('src', d.avatar);
    const an = elR('aboutName');         if (an) an.textContent = d.name;
    const as = elR('aboutSpecialty');    if (as) as.textContent = d.specialty;
    const ar = elR('aboutRating');       if (ar) ar.textContent = `★ ${d.rating.toFixed(1)}`;
    const ae = elR('aboutExp');          if (ae) ae.textContent = expLabel(d.experience);
    const ac = elR('aboutConsult');      if (ac) ac.textContent = d.consultation.join(' · ');
    const cities = elR('aboutCities');   if (cities) cities.innerHTML = d.cities.map(c=>`<a class="ndc-chip" href="${cityLink(c)}" target="_blank" rel="noopener" title="Best dentist in ${c}">${c}</a>`).join('');
    const phones = elR('aboutPhones');   if (phones) phones.innerHTML = d.phones.map(p=>`<a class="ndc-chip ndc-chip--tel" href="tel:${p.replace(/\s+/g,'')}">📞 ${p}</a>`).join('');

    const booksWrap = elR('aboutBooksWrap');
    const booksGrid = elR('aboutBooks');
    if (booksGrid){
      booksGrid.innerHTML = '';
      if (d.books?.length){
        d.books.forEach(b=>{
          const item = document.createElement('div');
          item.className='ndc-book';
          item.innerHTML = `
            <img src="${b.cover}" alt="${b.title} book cover" loading="lazy">
            <a href="${b.link}" target="_blank" rel="noopener">${b.title}</a>
            <small>${b.publisher||''}</small>`;
          booksGrid.appendChild(item);
        });
        booksWrap?.classList.add('has-books');
      } else {
        booksWrap?.classList.remove('has-books');
      }
    }

    // Profile (scoped under root)
    elR('heroImg')?.setAttribute('src', d.avatar);
    const hr = elR('heroRating'); if (hr) hr.textContent = `★ ${d.rating.toFixed(1)}`;
    const hn = elR('heroName');   if (hn) hn.textContent = d.name;
    const hs = elR('heroSpecialty'); if (hs) hs.textContent = d.specialty;

    // Call button (scoped)
    const callBtn = elR('btnCall');
    if (callBtn) callBtn.href = `tel:${d.phones[0].replace(/\s+/g,'')}`;
  }

  // ---------- TIME SLOTS (global; appointment section is outside root) ----------
  const toLabel=(h,m)=>`${(((h+11)%12)+1).toString().padStart(2,'0')}:${m===0?'00':'30'} ${h>=12?'PM':'AM'}`;
  function labelsEvery30min(start,end,wrap=false){
    const out=[]; const push=(h,m)=>out.push(toLabel(h,m));
    if(!wrap){
      for(let h=start; h<=end; h++){ push(h,0); if(h!==end) push(h,30); }
    } else {
      for(let h=start; h<=23; h++){ push(h,0); if(h<23) push(h,30); }
      for(let h=0; h<=end; h++){ push(h,0); if(h<end) push(h,30); }
    }
    return out;
  }
  function renderSlots(){
    const rWrap = el('slotsRegular');
    const eWrap = el('slotsEmergency');
    const sel   = el('selTime');
    if (!rWrap || !eWrap || !sel) return;

    const slotsRegular  = labelsEvery30min(11,22,false);  // 11:00 → 22:00
    const slotsEmergency= labelsEvery30min(22,2,true);    // 22:00 → 02:00 (wrap)

    const make = (wrap, arr) => {
      wrap.innerHTML = '';
      arr.forEach(lbl => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ndc-slot';
        b.textContent = lbl;
        b.addEventListener('click', () => {
          $$('.ndc-slot').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          sel.value = lbl;
        });
        wrap.appendChild(b);
      });
    };
    make(rWrap, slotsRegular);
    make(eWrap, slotsEmergency);

    // Build the <select>
    sel.innerHTML = '';
    [...slotsRegular, ...slotsEmergency].forEach(lbl=>{
      const o = document.createElement('option');
      o.value = o.textContent = lbl;
      sel.appendChild(o);
    });
    sel.selectedIndex = 0;
    $('.ndc-slot')?.classList.add('active');
  }

  // ---------- SELECT & CONFIRM ----------
  function renderDoctorSelect(activeId){
    const sel = el('selDoctor'); // global (inside appointment section)
    if (!sel) return;
    sel.innerHTML = '';
    DOCTORS.forEach(d=>{
      const o=document.createElement('option');
      o.value=d.id; o.textContent=d.name;
      sel.appendChild(o);
    });
    sel.value = activeId || DOCTORS[0].id;
    sel.addEventListener('change', ()=> selectDoctor(sel.value));
  }

  const summaryText = (doc,name,age,type,date,time,notes) => `Appointment Request
Doctor: ${doc.name}
Type: ${type}
Patient: ${name} (Age ${age})
Date: ${date}
Time: ${time}
Phone(s): ${doc.phones.join(', ')}
City Options: ${doc.cities.join(', ')}

Notes: ${notes}`;

  function bindConfirm(){
    const btnEmail = el('btnEmail');
    const btnWA    = el('btnWhatsApp');

    const selDoc = el('selDoctor');
    const fName  = el('name');
    const fAge   = el('age');
    const fType  = el('type');     // data-ndc="type" on #apptType
    const fDate  = el('date');
    const fTime  = el('selTime');
    const fNotes = el('notes');

    const getDoc = () => DOCTORS.find(d=>d.id === selDoc?.value) || DOCTORS[0];
    const ok = () => {
      if (!fName?.value.trim()){ alert('Please enter patient name.'); fName?.focus(); return false; }
      if (!fAge?.value.trim()){  alert('Please enter age.');         fAge?.focus();  return false; }
      if (!fDate?.value){        alert('Please choose a date.');     fDate?.focus(); return false; }
      if (!fTime?.value){        alert('Please choose a time.');     fTime?.focus(); return false; }
      return true;
    };

    btnEmail?.addEventListener('click', () => {
      if (!ok()) return;
      const d = getDoc();
      const txt = summaryText(d, fName.value.trim(), fAge.value.trim(), fType?.value, fDate.value, fTime.value, fNotes?.value.trim() || '');
      const subject = `Appointment: ${fType?.value} | ${fName.value.trim()} | ${fDate.value} ${fTime.value}`;
      window.open(`mailto:dr.dhivakaran@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(txt)}`, '_blank');
    });

    btnWA?.addEventListener('click', () => {
      if (!ok()) return;
      const d = getDoc();
      const txt = summaryText(d, fName.value.trim(), fAge.value.trim(), fType?.value, fDate.value, fTime.value, fNotes?.value.trim() || '');
      window.open(`https://wa.me/91861425342?text=${encodeURIComponent("Hello, I'd like to confirm an appointment.\n\n"+txt)}`, '_blank');
    });
  }

  function selectDoctor(id){
    const d = DOCTORS.find(x=>x.id===id) || DOCTORS[0];
    fillDoctor(d);
    renderList(d.id);
    const sel = el('selDoctor');
    if (sel) sel.value = d.id;
  }

  // ---------- INIT ----------
  function init(){
    renderSlots();
    bindConfirm();
    renderList(DOCTORS[0].id);
    renderDoctorSelect(DOCTORS[0].id);
    selectDoctor(DOCTORS[0].id);

    // Default date: today
    const d = el('date');
    if (d){
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth()+1).padStart(2,'0');
      const dd = String(today.getDate()).padStart(2,'0');
      d.value = `${yyyy}-${mm}-${dd}`;
    }
  }
  init();
})();


/* ---------- Treatments data + renderer (6 per page) ---------- */
(() => {
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  const grid   = $('#treatmentsGrid');
  const status = $('#treatmentsStatus');
  const search = $('#svcSearch');
  const catSel = $('#svcCategory');
  const chips  = $$('.chip');
  const prevBtn= $('#pgPrev');
  const nextBtn= $('#pgNext');
  const dots   = $('#pgDots');

  if (!grid) return;

  // DATA
  const TREATMENTS = [
    {id:'braces', title:'Braces & Aligners', category:'Tooth Alignment',
      keywords:'braces aligners orthodontic crooked bite noble invisalign',
      desc:'Metal braces and clear aligners (including certified Invisalign) for a confident, aligned smile.',
      url:'/specialities/braces.html', img:'https://via.placeholder.com/800x500?text=Braces+%26+Aligners'},
    {id:'invisalign', title:'Invisalign / Clear Aligners', category:'Tooth Alignment',
      keywords:'invisible clear trays esthetic teen adult inman aligners',
      desc:'Nearly invisible trays that straighten teeth comfortably with minimal lifestyle disruption.',
      url:'/specialities/invisalign.html', img:'https://via.placeholder.com/800x500?text=Invisalign+%2F+Clear+Aligners'},
    {id:'inman', title:'Inman Aligners', category:'Tooth Alignment',
      keywords:'inman aligner fast alignment front teeth',
      desc:'A rapid option for minor front-teeth alignment using a removable spring aligner.',
      url:'/specialities/invisalign.html', img:'https://via.placeholder.com/800x500?text=Inman+Aligner'},
    {id:'orthodontics', title:'Orthodontic Treatment', category:'Tooth Alignment',
      keywords:'crowded teeth spacing bite correction growth jaw orthodontist',
      desc:'Diagnosis & correction of crowding, spacing and bite issues for long-term oral health.',
      url:'/specialities/braces.html', img:'https://via.placeholder.com/800x500?text=Orthodontic+Treatment'},
    {id:'invisible-orthodontics', title:'Invisible Orthodontics', category:'Tooth Alignment',
      keywords:'invisible braces ceramic clear aligners esthetics',
      desc:'Esthetic braces and ceramic options for discreet tooth movement.',
      url:'/specialities/braces.html', img:'https://via.placeholder.com/800x500?text=Invisible+Orthodontics'},

    {id:'rct', title:'Root Canal Treatment', category:'Tooth Saving',
      keywords:'root canal pain infection decay endodontic save tooth',
      desc:'Removes infected tissue, relieves pain and saves your natural tooth with precise care.',
      url:'/specialities/root-canal.html', img:'https://via.placeholder.com/800x500?text=Root+Canal+Treatment'},
    {id:'fillings', title:'Restorations & Fillings', category:'Tooth Saving',
      keywords:'filling composite gic caries cavity restoration inlays onlays',
      desc:'Tooth-coloured composites and aesthetic restorations to restore form and function.',
      url:'/specialities/fillings.html', img:'https://via.placeholder.com/800x500?text=Restorations+%26+Fillings'},
    {id:'trauma', title:'Dental Trauma Care', category:'Tooth Saving',
      keywords:'fracture chipped avulsed knocked emergency splint',
      desc:'Rapid care for chipped, fractured or avulsed teeth to maximize survival.',
      url:'/specialities/emergency.html', img:'https://via.placeholder.com/800x500?text=Dental+Trauma+Care'},

    {id:'implants', title:'Dental Implants', category:'Implants & Replacement',
      keywords:'dental implants titanium tooth replacement missing teeth crowns bridges',
      desc:'Titanium implants replace missing roots and support natural-looking crowns or bridges.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Dental+Implants'},
    {id:'all-on-4', title:'All-on-4® Dental Treatment', category:'Implants & Replacement',
      keywords:'full arch fixed teeth immediate loading all on four',
      desc:'Four implants supporting a full-arch fixed bridge—confidence and comfort restored.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=All-on-4+Full+Arch'},
    {id:'zygomatic', title:'Zygoma Implants', category:'Implants & Replacement',
      keywords:'zygoma implant atrophic maxilla no bone graft',
      desc:'Solution for severe upper-jaw bone loss—zygomatic anchorage avoids hipbone grafts.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Zygoma+Implants'},
    {id:'sinus-lift', title:'Sinus Lift Surgery', category:'Implants & Replacement',
      keywords:'sinus lift augmentation graft posterior maxilla',
      desc:'Adds bone in the upper jaw to enable predictable implant placement.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Sinus+Lift+Surgery'},
    {id:'bone-graft', title:'Bone Grafting Procedures', category:'Implants & Replacement',
      keywords:'bone graft ridge preservation augmentation implant site',
      desc:'Builds support where bone is thin—improving long-term implant success.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Bone+Grafting'},
    {id:'semi-fixed-dentures', title:'Semi-fixed Dentures (Implant Overdentures)', category:'Implants & Replacement',
      keywords:'overdenture locator implant denture stability retention',
      desc:'Implant-retained dentures for excellent fit, stability and everyday confidence.',
      url:'/specialities/dentures.html', img:'https://via.placeholder.com/800x500?text=Implant+Overdenture'},
    {id:'advanced-implant', title:'Advanced Implant Therapy', category:'Implants & Replacement',
      keywords:'full mouth implants immediate load complex rehab',
      desc:'Comprehensive implant solutions for complex cases and full-mouth rehabilitation.',
      url:'/specialities/implants.html', img:'https://via.placeholder.com/800x500?text=Advanced+Implant+Therapy'},
    {id:'crowns-bridges', title:'Crowns & Bridges', category:'Implants & Replacement',
      keywords:'crown bridge fixed artificial teeth prosthodontics',
      desc:'Strengthen damaged teeth or replace missing teeth with precise fixed prosthetics.',
      url:'/specialities/crowns-bridges.html', img:'https://via.placeholder.com/800x500?text=Crowns+%26+Bridges'},
    {id:'dentures', title:'Dentures (Removable & Implant-supported)', category:'Implants & Replacement',
      keywords:'complete denture partial cast metal flexible implant supported',
      desc:'Acrylic, cast-metal, flexible and implant-supported options for comfort and function.',
      url:'/specialities/dentures.html', img:'https://via.placeholder.com/800x500?text=Dentures'},

    {id:'smile-makeover', title:'Smile Makeover', category:'Cosmetic & Smile',
      keywords:'smile makeover veneers whitening bonding esthetics celebrity smile design',
      desc:'Customized combo—veneers, whitening & alignment—for a radiant, confident smile.',
      url:'/specialities/smile-design.html', img:'https://via.placeholder.com/800x500?text=Smile+Makeover'},
    {id:'veneers', title:'Dental Veneers', category:'Cosmetic & Smile',
      keywords:'porcelain veneer laminate minimal prep esthetic',
      desc:'Ultra-thin shells to refine shape, colour and symmetry with minimal preparation.',
      url:'/specialities/smile-design.html', img:'https://via.placeholder.com/800x500?text=Dental+Veneers'},
    {id:'whitening', title:'Teeth Whitening', category:'Cosmetic & Smile',
      keywords:'teeth whitening bleaching stains shade',
      desc:'Safe, effective brightening: in-clinic power whitening or take-home kits.',
      url:'/specialities/scaling-whitening.html', img:'https://via.placeholder.com/800x500?text=Teeth+Whitening'},
    {id:'gum-depig', title:'Gum Depigmentation', category:'Cosmetic & Smile',
      keywords:'dark gums laser depigmentation esthetic pink gums',
      desc:'Laser-assisted lightening for uniformly pink, healthy-looking gums.',
      url:'/specialities/gum-surgeries.html', img:'https://via.placeholder.com/800x500?text=Gum+Depigmentation'},
    {id:'laser-dentistry', title:'Laser Dentistry', category:'Cosmetic & Smile',
      keywords:'laser minimally invasive soft tissue healing',
      desc:'From gum contouring to ulcer relief—gentle, precise and quick healing.',
      url:'/specialities/gum-surgeries.html', img:'https://via.placeholder.com/800x500?text=Laser+Dentistry'},
    {id:'cosmetic-dentistry', title:'Cosmetic Dentistry', category:'Cosmetic & Smile',
      keywords:'esthetic smile design bonding colour shape',
      desc:'Modern cosmetic dentistry to enhance tooth shape, colour and proportions.',
      url:'/specialities/smile-design.html', img:'https://via.placeholder.com/800x500?text=Cosmetic+Dentistry'},
    {id:'smile-design', title:'Smile Design & Esthetics', category:'Cosmetic & Smile',
      keywords:'smile design veneers planning digital waxup',
      desc:'Solutions from teeth whitening to complex full-mouth smile rehabilitation.',
      url:'/specialities/smile-design.html', img:'https://via.placeholder.com/800x500?text=Smile+Design'},

    {id:'wisdom', title:'Wisdom Tooth Extractions', category:'Oral Surgery',
      keywords:'third molar surgical extraction pain swelling impaction',
      desc:'Removes painful/impacted third molars—prevents decay and gum inflammation.',
      url:'/specialities/extraction.html', img:'https://via.placeholder.com/800x500?text=Wisdom+Tooth+Extraction'},
    {id:'face-surgery', title:'Corrective Jaw (Orthognathic) / Face Surgery', category:'Oral Surgery',
      keywords:'jaw surgery bite correction profile tmj skeletal orthognathic',
      desc:'Improves bite, function and facial balance when jaw positions need correction.',
      url:'/specialities/face-surgery.html', img:'https://via.placeholder.com/800x500?text=Jaw+%2F+Face+Surgery'},

    {id:'peds', title:'Pediatric Dentistry / Child Care', category:'Kids & Family',
      keywords:'kids child care pulpectomy crown sealants fluoride toys',
      desc:'Kid-friendly care: sealants, fillings, pulpectomy & crowns in a comforting setting.',
      url:'/specialities/kids-dentistry.html', img:'https://via.placeholder.com/800x500?text=Pediatric+Dentistry'},
    {id:'sealants', title:'Pit & Fissure Sealants', category:'Kids & Family',
      keywords:'preventive sealant cavity decay kids',
      desc:'Protective coating for cavity-prone grooves—simple, painless prevention.',
      url:'/specialities/kids-dentistry.html', img:'https://via.placeholder.com/800x500?text=Sealants'},

    {id:'scaling', title:'Scaling & Polishing', category:'Periodontics',
      keywords:'cleaning prophylaxis tartar plaque gum health fresh breath',
      desc:'Removes plaque & tartar and finishes with a polish for gum health and fresh breath.',
      url:'/specialities/scaling-whitening.html', img:'https://via.placeholder.com/800x500?text=Scaling+%26+Polishing'},
    {id:'gum-treat', title:'Gum Treatment', category:'Periodontics',
      keywords:'gingivitis periodontitis deep cleaning flap surgery pockets',
      desc:'Treats gum inflammation & bone loss—deep cleaning to regenerative surgery.',
      url:'/specialities/gum-surgeries.html', img:'https://via.placeholder.com/800x500?text=Gum+Treatment'},

    {id:'ct-scan', title:'Dental CT Scan (CBCT)', category:'Diagnostics',
      keywords:'3d scan cbct implant planning endodontics tmj',
      desc:'3D imaging for precise diagnosis & surgical planning—see roots, nerves & bone.',
      url:'/specialities/diagnostics.html', img:'https://via.placeholder.com/800x500?text=Dental+CT+%28CBCT%29'},
    {id:'cancer-screen', title:'Oral Cancer Screening', category:'Diagnostics',
      keywords:'early detection oral cancer surgeon screening',
      desc:'Early detection saves lives—routine screening by our maxillofacial specialist.',
      url:'/specialities/oral-cancer.html', img:'https://via.placeholder.com/800x500?text=Oral+Cancer+Screening'},
    {id:'tmj', title:'TMJ Problems', category:'Diagnostics',
      keywords:'tmj jaw joint clicking pain dysfunction splint',
      desc:'Evaluation and conservative care for jaw joint pain, clicking and movement issues.',
      url:'/specialities/tmj.html', img:'https://via.placeholder.com/800x500?text=TMJ+Care'},

    {id:'iv-sedation', title:'IV Sedation (Conscious)', category:'Sedation & Sleep',
      keywords:'iv sedation twilight dentistry anxious phobia day care',
      desc:'Relaxed, semi-awake care with amnesia—ideal for long or anxiety-provoking visits.',
      url:'/specialities/sedation.html', img:'https://via.placeholder.com/800x500?text=IV+Sedation'},
    {id:'general-anesthesia', title:'General Anesthesia', category:'Sedation & Sleep',
      keywords:'general anesthesia pediatric special needs hospital',
      desc:'One-visit completion for extensive pediatric/special cases under hospital settings.',
      url:'/specialities/sedation.html', img:'https://via.placeholder.com/800x500?text=General+Anesthesia'},
    {id:'sleep-dentistry', title:'Snoring Remedies & Sleep Dentistry', category:'Sedation & Sleep',
      keywords:'snoring osa sleep apnea oral splints',
      desc:'Custom oral appliances and pathways for snoring and obstructive sleep apnea.',
      url:'/specialities/sleep-dentistry.html', img:'https://via.placeholder.com/800x500?text=Sleep+Dentistry'},

    {id:'pregnancy', title:'Pregnancy Dental Care', category:'Special Care',
      keywords:'pregnancy trimester safe protocols mom baby',
      desc:'Trimester-wise safe protocols for mom & baby—preventive and urgent care.',
      url:'/specialities/pregnancy-dental-care.html', img:'https://via.placeholder.com/800x500?text=Pregnancy+Dental+Care'},
    {id:'diabetic', title:'Diabetic Dental Care', category:'Special Care',
      keywords:'diabetes gum infection healing sugar control',
      desc:'Tailored gum care, infection control and healing support for diabetics.',
      url:'/specialities/diabetic-dental-care.html', img:'https://via.placeholder.com/800x500?text=Diabetic+Dental+Care'},
    {id:'geriatric', title:'Geriatric Dentistry', category:'Special Care',
      keywords:'elderly dentures dry mouth root caries caregiver',
      desc:'Comfort-first care for seniors—denture tuning, root-caries prevention & home tips.',
      url:'/specialities/geriatric.html', img:'https://via.placeholder.com/800x500?text=Geriatric+Dentistry'},
    {id:'home-care', title:'Home Dental Care', category:'Special Care',
      keywords:'home visit bedside immobilized special needs',
      desc:'Clinical-grade care at home for immobile/special-needs patients (by appointment).',
      url:'/specialities/home-care.html', img:'https://via.placeholder.com/800x500?text=Home+Dental+Care'},
    {id:'emergency', title:'Emergency Dental Care', category:'Special Care',
      keywords:'emergency pain swelling trauma broken tooth',
      desc:'Same-day attention for pain, swelling or dental injuries.',
      url:'/specialities/emergency.html', img:'https://via.placeholder.com/800x500?text=Emergency+Dental+Care'},

    {id:'fmr', title:'Full Mouth Rehabilitation', category:'Prosthodontics',
      keywords:'full mouth rehabilitation missing teeth bite rebuild',
      desc:'Restores all missing/affected teeth to rebuild chewing, comfort and smile.',
      url:'/specialities/crowns-bridges.html', img:'https://via.placeholder.com/800x500?text=Full+Mouth+Rehabilitation'},
    {id:'fixed-teeth', title:'Fixed Artificial Teeth', category:'Prosthodontics',
      keywords:'fixed teeth bridges implant crowns',
      desc:'Strong, natural-looking fixed teeth using bridges and/or implants.',
      url:'/specialities/crowns-bridges.html', img:'https://via.placeholder.com/800x500?text=Fixed+Artificial+Teeth'}
  ];

  const PAGE_SIZE = 6;
  let filtered = TREATMENTS.slice();
  let page = 1;

  const norm = s => (s||'').toLowerCase();
  const score = (it, q, cat) => {
    if (!q && (cat==='all' || cat===it.category)) return 0.0001;
    const hay = `${it.title} ${it.keywords} ${it.desc} ${it.category}`.toLowerCase();
    const terms = q.split(/[\s,]+/).filter(Boolean).map(norm);
    let s = 0;
    terms.forEach(t=>{
      if (it.title.toLowerCase().includes(t)) s += 5;
      if (it.keywords.toLowerCase().includes(t)) s += 3;
      if (hay.includes(t)) s += 1;
    });
    if (cat !== 'all' && it.category === cat) s += 2;
    return s;
  };

  const paginate = (arr, page, size) => {
    const start = (page-1)*size;
    return arr.slice(start, start+size);
  };

  function renderPagination(pageCount){
    if (prevBtn) prevBtn.disabled = page<=1;
    if (nextBtn) nextBtn.disabled = page>=pageCount;
    if (!dots) return;
    dots.innerHTML = '';
    for (let i=1;i<=pageCount;i++){
      const dot = document.createElement('button');
      dot.className = 'pg-dot';
      dot.type = 'button';
      dot.setAttribute('role','listitem');
      if (i===page) dot.setAttribute('aria-current','page');
      dot.addEventListener('click', ()=>{ page=i; render(); window.scrollTo({top: grid.offsetTop-120, behavior:'smooth'}); });
      dots.appendChild(dot);
    }
  }

  function render(){
    grid.setAttribute('aria-busy','true');
    grid.innerHTML = '';

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > pageCount) page = pageCount;

    const items = paginate(filtered, page, PAGE_SIZE);

    if (!items.length){
      if (status) status.textContent = 'No treatments match your search—try broader terms (e.g., “implants”, “pain”, “kids”).';
      renderPagination(1);
      grid.setAttribute('aria-busy','false');
      return;
    }

    if (status) status.textContent = `${filtered.length} result${filtered.length>1?'s':''} — page ${page} of ${pageCount}`;

    const frag = document.createDocumentFragment();
    items.forEach(it=>{
      const card = document.createElement('article');
      card.className = 't-card ripple';
      card.setAttribute('data-id', it.id);
      card.setAttribute('data-category', it.category); 
      card.innerHTML = `
        <div class="t-media">
          <span class="t-badge">${it.category}</span>
          <img loading="lazy" src="${it.img}" alt="${it.title}">
        </div>
        <div class="t-body">
          <h3 class="t-title">${it.title}</h3>
          <p class="t-desc">${it.desc}</p>
          <div class="t-meta"><i class='bx bx-check-shield'></i> Noble Dental</div>
          <div class="t-actions">
            <a class="t-btn" href="${it.url}"><i class='bx bx-info-circle'></i> Learn more</a>
            <a class="t-btn secondary" href="tel:+918610425342"><i class='bx bxs-phone'></i> Call</a>
          </div>
        </div>
      `;
      // Android-like ripple origin
      card.addEventListener('pointerdown', (e)=>{
        const r = card.getBoundingClientRect();
        card.style.setProperty('--ripple-x', ((e.clientX-r.left)/r.width*100)+'%');
        card.style.setProperty('--ripple-y', ((e.clientY-r.top)/r.height*100)+'%');
      });
      frag.appendChild(card);
    });
    grid.appendChild(frag);

    renderPagination(pageCount);
    grid.setAttribute('aria-busy','false');
  }

  function apply(){
    const q = norm(search?.value || '');
    const cat = catSel?.value || 'all';
    const pool = (cat==='all') ? TREATMENTS.slice() : TREATMENTS.filter(it=>it.category===cat);

    if (!q){
      filtered = pool;
    } else {
      filtered = pool
        .map(it=>({it, s: score(it,q,cat)}))
        .filter(x=>x.s>0)
        .sort((a,b)=> b.s - a.s || a.it.title.localeCompare(b.it.title))
        .map(x=>x.it);
    }
    page = 1;
    render();
  }

  // Events
  let t;
  search?.addEventListener('input', ()=>{ clearTimeout(t); t=setTimeout(apply, 160); });
  catSel?.addEventListener('change', apply);
  chips.forEach(ch => ch.addEventListener('click', ()=>{
    if (!search) return;
    search.value = ch.dataset.chip || '';
    apply();
    search.focus();
  }));

  prevBtn?.addEventListener('click', ()=>{ if (page>1){ page--; render(); } });
  nextBtn?.addEventListener('click', ()=>{ const pages=Math.ceil(filtered.length/PAGE_SIZE); if (page<pages){ page++; render(); } });

  // Init
  apply();
})();

/* ---------- Treatments enhance (accents, reveal, tilt) ---------- */
(() => {
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const grid = $('#treatmentsGrid');
  if (!grid) return;

  const ACCENT = {
    'Tooth Alignment':        [79,156,255],
    'Tooth Saving':           [96,210,164],
    'Implants & Replacement': [ 2,171,155],
    'Cosmetic & Smile':       [255,138,181],
    'Oral Surgery':           [255,177, 79],
    'Kids & Family':          [155,140,255],
    'Periodontics':           [128,207,105],
    'Diagnostics':            [122,212,255],
    'Sedation & Sleep':       [160,180,255],
    'Special Care':           [255,122,122],
    'Prosthodontics':         [255,170, 90]
  };
  const rgb = (a)=>`rgb(${a[0]},${a[1]},${a[2]})`;
  const rgba= (a,o)=>`rgba(${a[0]},${a[1]},${a[2]},${o})`;

  const supportsFine  = matchMedia('(pointer:fine)').matches;
  const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getCols = () => {
    const cs = getComputedStyle(grid).gridTemplateColumns;
    return cs ? cs.split(' ').length : 3;
  };

  const applyAccentsAndSkeleton = (card) => {
    const catText = card.querySelector('.t-badge')?.textContent?.trim() || '';
    const a = ACCENT[catText] || [14,165,163];
    card.style.setProperty('--accent', rgb(a));
    card.style.setProperty('--accent-14', rgba(a,.14));
    card.style.setProperty('--accent-20', rgba(a,.20));
    card.style.setProperty('--accent-25', rgba(a,.25));
    card.style.setProperty('--accent-30', rgba(a,.30));
    card.style.setProperty('--accent-35', rgba(a,.35));

    const media = card.querySelector('.t-media');
    const img   = card.querySelector('img');
    if (media && img) {
      const done = ()=> media.classList.add('img-loaded');
      if (img.complete && img.naturalWidth) done();
      img.addEventListener('load', done, {once:true});
      img.addEventListener('error', done, {once:true});
    }
  };

  const markFeatured = () => {
    const cards = $$('.t-card', grid);
    cards.forEach(c=>c.classList.remove('featured'));
    const cols = getCols();
    const centerCol = Math.floor((cols-1)/2);
    cards.forEach((c, i) => { if (i % cols === centerCol) c.classList.add('featured'); });
  };

  const enhanceInteractions = () => {
    const cards = $$('.t-card', grid);
    if (!cards.length) return;

    // Reveal (stagger per row)
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(ent=>{
        if (ent.isIntersecting) { ent.target.classList.add('in-view'); io.unobserve(ent.target); }
      });
    }, { rootMargin:'0px 0px -10% 0px', threshold: 0.08 });

    const cols = getCols();
    cards.forEach((card, i)=>{
      card.classList.add('reveal');
      const rowIndex = Math.floor(i / cols);
      const colIndex = i % cols;
      const delay = (rowIndex*120) + (colIndex*60);
      card.style.setProperty('--delay', `${delay}ms`);
      io.observe(card);

      // ripple origin + sheen
      card.addEventListener('pointerdown', (e)=>{
        const r = card.getBoundingClientRect();
        card.style.setProperty('--ripple-x', ((e.clientX-r.left)/r.width*100)+'%');
        card.style.setProperty('--ripple-y', ((e.clientY-r.top)/r.height*100)+'%');
      });
      card.addEventListener('mouseenter', ()=>{
        card.classList.remove('sheen'); void card.offsetWidth; card.classList.add('sheen');
      });
    });

    // 3D tilt + magnetic hover (desktop only)
    if (supportsFine && !prefersReduce) {
      const maxTilt = 6;  const mag = 4;
      cards.forEach(card=>{
        let mx=0, my=0, rect=null, raf=null;
        const update = ()=>{
          raf=null;
          const w=rect.width, h=rect.height;
          const cx = (mx-rect.left)/w*2-1, cy = (my-rect.top)/h*2-1;
          card.style.setProperty('--rx', (-cy*maxTilt).toFixed(2)+'deg');
          card.style.setProperty('--ry', ( cx*maxTilt).toFixed(2)+'deg');
          card.style.setProperty('--tx', ( cx*mag).toFixed(2)+'px');
          card.style.setProperty('--ty', ( cy*mag).toFixed(2)+'px');
        };
        const onMove=(e)=>{ if(!rect) rect = card.getBoundingClientRect(); mx=e.clientX; my=e.clientY; if(!raf) raf=requestAnimationFrame(update); };
        const onEnter=()=>{ rect = card.getBoundingClientRect(); card.style.setProperty('--scale','1.02'); document.addEventListener('pointermove', onMove); };
        const onLeave=()=>{ document.removeEventListener('pointermove', onMove); card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); card.style.removeProperty('--tx'); card.style.removeProperty('--ty'); card.style.setProperty('--scale','1'); rect=null; };
        card.addEventListener('pointerenter', onEnter);
        card.addEventListener('pointerleave', onLeave);
      });
    }
  };

  const enhanceAll = () => {
    $$('.t-card', grid).forEach(c => applyAccentsAndSkeleton(c));
    markFeatured();
    enhanceInteractions();
  };

  const mo = new MutationObserver((m)=> {
    if (m.some(r => r.type === 'childList')) enhanceAll();
  });
  mo.observe(grid, { childList:true });
  addEventListener('resize', () => markFeatured());
  enhanceAll();
})();

/* ---------- Lightweight analytics bindings ---------- */
(() => {
  const dl = window.dataLayer = window.dataLayer || [];
  const send = (event, params={}) => dl.push({ event, ...params });
  const bind = (sel, handler) => document.querySelector(sel)?.addEventListener('click', handler);

  bind('.hero-button.whatsapp', e => {
    send('contact', { method: 'WhatsApp', location: 'hero', link_url: e.currentTarget.href });
  });
  bind('.hero-button.call', e => {
    send('contact', { method: 'Phone', location: 'hero', link_url: e.currentTarget.href });
  });
  bind('.hero-button.mail', e => {
    send('contact', { method: 'Email', location: 'hero', link_url: e.currentTarget.href });
  });
  bind('.hero-button.location', e => {
    send('view_map', { provider: 'Google Maps', location: 'hero', link_url: e.currentTarget.href });
  });

  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (/^tel:/i.test(href))        send('contact', { method: 'Phone',  location: 'sitewide', link_url: href });
    else if (/^mailto:/i.test(href))send('contact', { method: 'Email',  location: 'sitewide', link_url: href });
    else if (/wa\.me|whatsapp\.com/i.test(href))
                                   send('contact', { method: 'WhatsApp',location: 'sitewide', link_url: href });
  }, { capture:true });
})();

(function(){
  // Blur-up: when the image decodes, drop the blur
  document.querySelectorAll('.js-nd-blur').forEach(img=>{
    const ready = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth){
      ('decode' in img) ? img.decode().then(ready).catch(ready) : ready();
    } else {
      img.addEventListener('load', ()=>('decode' in img ? img.decode().then(ready).catch(ready) : ready()), {once:true});
      img.addEventListener('error', ready, {once:true});
    }
  });

  // Accessible accordion
  const acc = document.getElementById('nd-faq-accordion');
  if (!acc) return;
  const triggers = acc.querySelectorAll('.nd-qa__trigger');

  function toggle(trigger, expand){
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    const isOpen = expand ?? (trigger.getAttribute('aria-expanded') === 'false');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

  // Init state
  triggers.forEach(btn=>{
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded','false');
    panel.setAttribute('aria-hidden','true');
    // click/keyboard
    btn.addEventListener('click', ()=> toggle(btn));
    btn.addEventListener('keydown', e=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(btn); }
    });
  });

  // Expand/Collapse all
  const expandAllBtn = document.querySelector('[data-nd="expand-all"]');
  const collapseAllBtn = document.querySelector('[data-nd="collapse-all"]');
  if (expandAllBtn){
    expandAllBtn.addEventListener('click', ()=>{
      triggers.forEach(btn=> toggle(btn, true));
      expandAllBtn.setAttribute('aria-expanded','true');
    });
  }
  if (collapseAllBtn){
    collapseAllBtn.addEventListener('click', ()=>{
      triggers.forEach(btn=> toggle(btn, false));
      expandAllBtn.setAttribute('aria-expanded','false');
    });
  }
})();

(() => {
  const track = document.getElementById('ndtTslTrack');
  const btnPrev = document.getElementById('ndtTslPrev');
  const btnNext = document.getElementById('ndtTslNext');
  if (!track) return;

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // duplicate slide set for seamless loop
  const slides = Array.from(track.children);
  const originalsCount = slides.length;
  slides.forEach(s => track.appendChild(s.cloneNode(true)));

  let index = 0;
  let cardW = 0;
  let gap = 0;
  let perView = 1;
  let rafId = null;
  let autoplayId = null;
  let isPaused = false;

  const computeMetrics = () => {
    const first = track.querySelector('.ndt-tsl-card');
    if (!first) return;
    const style = window.getComputedStyle(track);
    gap = parseFloat(style.columnGap || style.gap || 18) || 18;
    const rect = first.getBoundingClientRect();
    cardW = rect.width;
    const viewport = track.parentElement.getBoundingClientRect().width;
    perView = Math.max(1, Math.floor((viewport + gap) / (cardW + gap)));
  };

  const setTransform = (instant=false) => {
    const offset = index * (cardW + gap);
    track.style.transition = instant ? 'none' : 'transform .42s cubic-bezier(.2,.8,.2,1)';
    track.style.transform = `translateX(${-offset}px)`;
  };

  const normalizeIndex = () => {
    if (index >= originalsCount) {
      index = index - originalsCount;
      setTransform(true);
      // force reflow to apply the instant jump, then restore transition
      track.getBoundingClientRect();
      track.style.transition = 'transform .42s cubic-bezier(.2,.8,.2,1)';
    } else if (index < 0) {
      index = index + originalsCount;
      setTransform(true);
      track.getBoundingClientRect();
      track.style.transition = 'transform .42s cubic-bezier(.2,.8,.2,1)';
    }
  };

  const next = () => { index += 1; setTransform(); normalizeIndex(); };
  const prev = () => { index -= 1; setTransform(); normalizeIndex(); };

  const play = () => {
    if (prefersReduce) return;
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = setInterval(() => {
      if (!isPaused) next();
    }, 2800);
  };
  const pause = () => { if (autoplayId) clearInterval(autoplayId); autoplayId = null; };

  // Pause on hover & focus inside
  track.parentElement.addEventListener('mouseenter', () => { isPaused = true; });
  track.parentElement.addEventListener('mouseleave', () => { isPaused = false; });
  track.parentElement.addEventListener('focusin', () => { isPaused = true; });
  track.parentElement.addEventListener('focusout', () => { isPaused = false; });

  // Pause when not visible (battery friendly)
  const io = new IntersectionObserver((ents) => {
    const ent = ents[0];
    if (ent && ent.isIntersecting) { play(); }
    else { pause(); }
  }, { threshold: 0.2 });
  io.observe(track.parentElement);

  // Buttons
  btnNext?.addEventListener('click', next);
  btnPrev?.addEventListener('click', prev);

  // Resize
  const onResize = () => {
    computeMetrics();
    setTransform(true);
  };
  window.addEventListener('resize', () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(onResize);
  });

  // Init
  computeMetrics();
  setTransform(true);
  play();
})();

(() => {
  // Year
  const y = document.getElementById('ndcYear');
  if (y) y.textContent = String(new Date().getFullYear());

  // Scroll to top
  const topBtn = document.getElementById('ndcTop');
  const showTop = () => {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    topBtn?.classList.toggle('ndc-top--show', scrolled > 500);
  };
  window.addEventListener('scroll', showTop, { passive:true });
  showTop();
  topBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // In-view animation (cards gently rise)
  const cards = document.querySelectorAll('.ndc-card');
  if ('IntersectionObserver' in window && cards.length){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.style.willChange = 'transform';
          e.target.animate([
            { transform: 'translateY(12px)', opacity: .0 },
            { transform: 'translateY(0)', opacity: 1 }
          ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill:'forwards' });
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
    cards.forEach(c => io.observe(c));
  }

  // (Optional) Track chip interactions for lightweight analytics
  document.querySelectorAll('.ndc-chip[data-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'chip_click', label: chip.textContent.trim(), location: 'footer' });
    });
  });
})();
