const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

const state = {
  path:null,
  trimester:null,
  postop:null,
  regions:new Set(),
  answers:{},
  missing:{ type:null, where:null },
  counter:1993
};

const PERSONA_PATHS = [
  {id:'kids',   title:'Children & Kids',  sub:'Teething, early caries, habits', cta:'Start'},
  {id:'adults', title:'Adults',           sub:'Pain, swelling, gums, ulcers', cta:'Start'},
  {id:'preg',   title:'Pregnant women',   sub:'Gingival changes, sensitivity', cta:'Start'},
  {id:'cancer', title:'Cancer',           sub:'Mucositis, xerostomia care', cta:'Start'},
  {id:'postop', title:'After procedure',  sub:'Extraction, RCT, implant, braces…', cta:'Start'},
  {id:'missing',title:'Missing tooth',    sub:'Single/multiple or full arch', cta:'Start'},
  {id:'align',  title:'Tooth Alignment',  sub:'Crowding, spacing, bite', cta:'Start'}
];

const PERSONA_ISSUES = {
  kids: [
    {h:'Teething', li:['Gum soreness 😖','Low-grade fever','Drooling']},
    {h:'Early childhood caries', li:['Sweet bottle use 🍼','Night feeding','White/brown spots']},
    {h:'Habits', li:['Thumb sucking 👍','Mouth breathing 😮‍💨','Tongue thrust 👅']},
    {h:'Trauma', li:['Chipped tooth 🧩','Knocked out tooth 🏈','Lip cuts']},
    {h:'Eruption', li:['Delayed eruption ⏳','Extra tooth (mesiodens)','Crossbite']}
  ],
  adults: [
    {h:'Caries / Toothache', li:['Lingering pain at night 🌙','Hole visible 🦷🦠','Pain on bite']},
    {h:'Gum disease', li:['Bleeding 🩸','Bad breath 😮‍💨','Receding gums']},
    {h:'Sensitivity', li:['Cold shock ❄️','Acid wear','Clenching/bruxism 😬']},
    {h:'Cracks & wear', li:['Cracked on bite 💥','Erosion','Attrition']},
    {h:'Mouth sores', li:['Aphthae','White patches','Burning mouth']}
  ],
  preg: [
    {h:'Pregnancy gingivitis', li:['Bleeding gums 🩸','Swollen gums','Tenderness']},
    {h:'Pregnancy tumor', li:['Localized gum overgrowth','Bleeds easily']},
    {h:'Nausea/erosion', li:['Acid exposure','Enamel wear','Sensitivity']},
    {h:'Home care', li:['Soft brush','Fluoride paste','Small frequent meals']}
  ],
  cancer: [
    {h:'Mucositis', li:['Oral soreness 🔥','Ulcers','Difficulty eating']},
    {h:'Xerostomia', li:['Dry mouth 🏜️','Sticky saliva','Taste changes']},
    {h:'Candidiasis', li:['White curd-like patches','Burning','Soreness']},
    {h:'Risks', li:['Osteoradionecrosis risk','Infection risk','Delayed healing']}
  ],
  postop: [
    {h:'Extraction', li:['Oozing blood','Swelling','Dry socket']},
    {h:'Root canal', li:['Bite tenderness','Mild soreness','Temporary filling issues']},
    {h:'Implant', li:['Swelling','Suture care','Medications']},
    {h:'Braces/Aligners', li:['Tightness','Ulcer spots','Loose bracket']},
    {h:'Scaling/Gum surgery', li:['Sensitivity','Bleeding','Dressings']}
  ],
  missing: [
    {h:'Partial loss', li:['Chewing inefficiency','Food trap','Tooth drifting']},
    {h:'Full arch', li:['Diet limits','Bone loss risk','Speech changes']},
    {h:'Options', li:['RPD','FPD/Bridge','Implants','Overdenture','Complete denture']}
  ],
  align: [
    {h:'Crowding', li:['Rotation','Overlapping']},
    {h:'Spacing', li:['Gaps','Midline shift']},
    {h:'Bite', li:['Overbite','Crossbite','Open bite']}
  ]
};

const REGIONS = [
  {id:'UF', label:'Upper Front (canine–canine)', group:'Front'},
  {id:'UB', label:'Upper Back (premolar–7th molar)', group:'Back'},
  {id:'U8', label:'Upper 8th (wisdom tooth)', group:'8th'},
  {id:'LF', label:'Lower Front (canine–canine)', group:'Front'},
  {id:'LB', label:'Lower Back (premolar–7th molar)', group:'Back'},
  {id:'L8', label:'Lower 8th (wisdom tooth)', group:'8th'}
];

const BASE_SYMPTOMS = {
  Front: [
    {label:'🦷🔥 Tooth pain','id':'Tooth pain'},
    {label:'🌡️ Spontaneous pain (comes without triggers)','id':'Spontaneous pain'},
    {label:'❄️ Sensitivity (cold)','id':'Sensitivity (cold)'},
    {label:'🔥 Sensitivity (hot)','id':'Sensitivity (hot)'},
    {label:'🍬 Sweet sensitivity','id':'Sensitivity (sweet)'},
    {label:'🩸 Gum bleeding','id':'Gum bleeding'},
    {label:'🧱 Food lodgement','id':'Food lodgement'},
    {label:'🧩 Chipped/broken','id':'Chipped/broken'},
    {label:'🔴⚪ Ulcer/white patch','id':'Ulcer/white patch'},
    {label:'😮‍💨 Bad breath','id':'Bad breath'},
    {label:'🦷↕ Tooth mobility (loose tooth)','id':'Tooth mobility'}
  ],
  Back: [
    {label:'🦷🔥 Tooth pain','id':'Tooth pain'},
    {label:'🌡️ Spontaneous pain','id':'Spontaneous pain'},
    {label:'❄️ Sensitivity (cold)','id':'Sensitivity (cold)'},
    {label:'🔥 Sensitivity (hot)','id':'Sensitivity (hot)'},
    {label:'🍬 Sweet sensitivity','id':'Sensitivity (sweet)'},
    {label:'🧱 Food lodgement','id':'Food lodgement'},
    {label:'🤒 Swelling (cheek/gum)','id':'Swelling'},
    {label:'🩸 Gum bleeding','id':'Gum bleeding'},
    {label:'🦷💥 Cracked on bite','id':'Cracked on bite'},
    {label:'🦷🦠 Hole/cavity seen','id':'Cavity seen'},
    {label:'🫠 Pain on release','id':'Pain on release'},
    {label:'👂 Ear pain / pressure referral','id':'Ear referral'},
    {label:'🤢 Bad taste / pus discharge','id':'Pus discharge'}
  ],
  '8th': [
    {label:'🦷🩹 Pain around wisdom tooth','id':'Pain around wisdom tooth'},
    {label:'🤒 Swelling','id':'Swelling'},
    {label:'😖 Bad taste','id':'Bad taste'},
    {label:'🫢 Limited mouth opening','id':'Limited mouth opening'},
    {label:'👂 Ear pain / pressure referral','id':'Ear referral'}
  ]
};

function personaSymptoms(group){
  const p = state.path;
  if(p==='postop'){
    const PROC_SYMPTOMS = {
      EXTRACTION: [
        {label:'🩸 Oozing/bleeding','id':'Bleeding'},
        {label:'🤒 Increasing swelling','id':'Swelling'},
        {label:'😖 Pain day 3–5 (dry socket)','id':'Dry socket pain'},
        {label:'🦷 Bad taste/odor','id':'Bad taste'}
      ],
      RCT: [
        {label:'🦷 Bite tenderness','id':'Bite tenderness'},
        {label:'😖 Ache first 48h','id':'Post pain'},
        {label:'🧱 Food lodgement','id':'Food lodgement'}
      ],
      IMPLANT: [
        {label:'🤒 Swelling','id':'Swelling'},
        {label:'🧵 Suture concern','id':'Suture issue'},
        {label:'😖 Pain not improving','id':'Persistent pain'}
      ],
      FILLING: [
        {label:'❄️ Cold sensitivity','id':'Sensitivity (cold)'},
        {label:'🦷 High bite','id':'High bite'},
        {label:'🧱 Food lodgement','id':'Food lodgement'}
      ],
      BRACES: [
        {label:'🫦 Lip/cheek ulcer','id':'Ulcer'},
        {label:'📏 Wire poking','id':'Wire poke'},
        {label:'🔩 Loose bracket','id':'Loose bracket'}
      ],
      ALIGNERS: [
        {label:'🫦 Soreness new tray','id':'Tray soreness'},
        {label:'🧩 Attachment off','id':'Attachment off'},
        {label:'🧼 Staining/odor','id':'Tray odor'}
      ],
      SCALING: [
        {label:'❄️ Sensitivity','id':'Sensitivity (cold)'},
        {label:'🩸 Bleeding on brushing','id':'Gum bleeding'}
      ],
      GUM: [
        {label:'🤒 Swelling','id':'Swelling'},
        {label:'🩸 Bleeding at site','id':'Bleeding'},
        {label:'😖 Pain not controlled','id':'Persistent pain'}
      ]
    };
    return PROC_SYMPTOMS[state.postop] || [];
  }
  if(p==='cancer'){
    return [
      {label:'🔥 Mouth soreness','id':'Mucositis'},
      {label:'🏜️ Dry mouth','id':'Xerostomia'},
      {label:'🦠 White patches (wipeable)','id':'Candidiasis'},
      {label:'🩸 Gum bleeding','id':'Gum bleeding'}
    ];
  }
  if(p==='preg'){
    return JSON.parse(JSON.stringify(BASE_SYMPTOMS[group]||[]));
  }
  if(p==='kids'){
    const base = JSON.parse(JSON.stringify(BASE_SYMPTOMS[group]||[]));
    if(group==='Front'){
      base.push({label:'🧩 Chipped/broken (trauma)','id':'Chipped/broken'});
      base.push({label:'🦷 Delayed eruption','id':'Delayed eruption'});
    }
    return base;
  }
  if(p==='align'){
    return BASE_SYMPTOMS[group]||[];
  }
  return BASE_SYMPTOMS[group]||[];
}

const FOLLOWUPS = {
  // Core toothache patterns
  'Tooth pain': [
    {id:'night', q:'Does it wake you at night?', chips:['Yes','No']},
    {id:'linger', q:'Does hot/cold pain linger >10s?', chips:['Yes','No']},
    {id:'bite', q:'Pain on biting/chewing?', chips:['Yes','No']}
  ],
  'Spontaneous pain': [
    {id:'duration', q:'Episodes last how long?', chips:['Seconds','Minutes','Hours']},
    {id:'night', q:'Worse at night?', chips:['Yes','No']}
  ],
  'Sensitivity (cold)': [
    {id:'duration', q:'Does cold pain last only a few seconds?', chips:['Yes','No']},
    {id:'recession', q:'Do gums look receded there?', chips:['Yes','No','Not sure']}
  ],
  'Sensitivity (hot)': [
    {id:'hot', q:'Is hot worse than cold?', chips:['Yes','No']},
    {id:'linger', q:'Does it linger >10s?', chips:['Yes','No']}
  ],
  'Sensitivity (sweet)': [
    {id:'sweetspot', q:'Sharp twinge to sweets only?', chips:['Yes','No']}
  ],
  'Pain on release': [
    {id:'crack', q:'Sharp pain when releasing bite?', chips:['Yes','No']}
  ],
  'Cracked on bite': [
    {id:'bite', q:'Sharp pain on biting+release?', chips:['Yes','No']}
  ],
  'Cavity seen': [
    {id:'linger', q:'Does cold pain linger?', chips:['Yes','No']}
  ],
  'Food lodgement': [
    {id:'odor', q:'Bad breath or bad taste?', chips:['Yes','No']}
  ],
  // Infection / swelling
  'Swelling': [
    {id:'fever', q:'Do you have fever (>38°C)?', chips:['Yes','No']},
    {id:'trismus', q:'Reduced mouth opening?', chips:['Yes','No']}
  ],
  'Pus discharge': [
    {id:'sinus', q:'Small gum pimple draining near the tooth?', chips:['Yes','No']}
  ],
  // Lesions
  'Ulcer/white patch': [
    {id:'age', q:'Present for how long?', chips:['< 2 weeks','≥ 2 weeks']},
    {id:'pain', q:'Is it painful?', chips:['Yes','No']}
  ],
  // ENT cross-over
  'Ear referral': [
    {id:'nasal', q:'Recent cold/sinus congestion?', chips:['Yes','No']},
    {id:'bite', q:'Pain changes when biting teeth together?', chips:['Yes','No']}
  ],
  // Function
  'Limited mouth opening': [
    {id:'days', q:'How long limited opening?', chips:['< 3 days','≥ 3 days']},
    {id:'fever', q:'Any fever?', chips:['Yes','No']}
  ],
  // Gum health
  'Gum bleeding': [
    {id:'when', q:'Bleeding with brushing or spontaneous?', chips:['Brushing','Spontaneous','Both']}
  ],

  // Wisdom tooth
  'Pain around wisdom tooth': [
    {id:'swelling', q:'Swelling around gum flap?', chips:['Yes','No']},
    {id:'taste', q:'Bad taste from that area?', chips:['Yes','No']}
  ],
  'Bad taste': [
    {id:'pus', q:'Pus discharge noticed?', chips:['Yes','No']}
  ],

  // Post-op (from your existing set)
  'Bleeding': [
    {id:'soaked', q:'Is the gauze getting fully soaked?', chips:['Yes','No']}
  ],
  'Dry socket pain': [
    {id:'day', q:'Pain peaks day 3–5?', chips:['Yes','No']}
  ],
  'High bite': [
    {id:'same', q:'Pain only when biting that tooth?', chips:['Yes','No']}
  ],
  'Tooth mobility': [
    {id:'mob', q:'Does it move when you push it?', chips:['Mild','Moderate','Severe']}
  ]
};

(function mountPaths(){
  const wrap = $('[data-paths]');
  PERSONA_PATHS.forEach(p=>{
    const el=document.createElement('article'); el.className='card';
    el.innerHTML = `
      <h3>${p.title}</h3>
      <p class="card__emi">${p.sub}</p>
      <button class="btn btn--primary" data-path-start="${p.id}">${p.cta}</button>`;
    wrap.appendChild(el);
  });

  wrap.addEventListener('click', e=>{
    const b=e.target.closest('[data-path-start]'); if(!b) return;
    state.path = b.dataset.pathStart;
    state.trimester=null; state.postop=null;
    state.regions.clear(); state.answers={}; state.missing={type:null, where:null};
    $$('[data-region]').forEach(n=>n.setAttribute('aria-pressed','false'));
    $('[data-region-panels]').innerHTML='';
    $('[data-missing]').style.display = (state.path==='missing') ? '' : 'none';
    $('[data-compute]').disabled = (state.path!=='missing');

    renderPersonaIssues();
    document.getElementById('regions').scrollIntoView({behavior:'smooth'});
  });

  const saved = localStorage.getItem('hf_helped');
  state.counter = saved ? Number(saved) : 1993;
  updateHelped();
})();
function updateHelped(){ $('[data-helped]').textContent = `People helped: ${state.counter}`; }

function renderPersonaIssues(){
  const box = $('[data-issues]'); const grid = $('[data-issues-grid]');
  box.style.display='';
  grid.innerHTML='';
  (PERSONA_ISSUES[state.path]||[]).forEach(item=>{
    const t=document.createElement('div'); t.className='pi-tile';
    t.innerHTML = `<h4>${item.h}</h4><ul>${item.li.map(x=>`<li>${x}</li>`).join('')}</ul>`;
    grid.appendChild(t);
  });

  const tri = $('[data-tri]');
  if(state.path==='preg'){
    tri.style.display='';
    $('[data-tri-note]').textContent = 'General: elective care best in 2nd trimester. Keep visits short, avoid supine hypotension, and use pregnancy-safe meds only as prescribed.';
  } else tri.style.display='none';

  const po = $('[data-postop]');
  if(state.path==='postop'){
    po.style.display='';
    $('[data-proc-note]').textContent = 'Pick the recent procedure to see relevant symptoms and guidance.';
  } else po.style.display='none';
}

(function bindTri(){
  const wrap = $('[data-tri-chips]');
  if(!wrap) return;
  wrap.addEventListener('click', e=>{
    const btn=e.target.closest('[data-tri]'); if(!btn) return;
    $$('[data-tri]', wrap).forEach(x=>x.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
    state.trimester = btn.dataset.tri;
  });
})();

(function bindPostOp(){
  const wrap = $('[data-postop-chips]');
  if(!wrap) return;
  wrap.addEventListener('click', e=>{
    const btn=e.target.closest('[data-proc]'); if(!btn) return;
    $$('[data-proc]', wrap).forEach(x=>x.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
    state.postop = btn.dataset.proc;
    if(state.regions.size>0){
      $('[data-region-panels]').innerHTML='';
      for(const id of Array.from(state.regions)) addRegionPanel(id);
    }
  });
})();

(function bindArch(){
  const arch = $('[data-arch]');
  arch.addEventListener('click', e=>{
    const el = e.target.closest('[data-region]'); if(!el) return;
    const id = el.dataset.region; const on = el.getAttribute('aria-pressed')==='true';
    el.setAttribute('aria-pressed', String(!on));
    if(on){ state.regions.delete(id); removeRegionPanel(id); }
    else { state.regions.add(id); addRegionPanel(id); }
    $('[data-compute]').disabled = (state.regions.size===0 && state.path!=='missing');
  });

  $('.arch-legend').addEventListener('click', e=>{
    const chip = e.target.closest('[data-legend]'); if(!chip) return;
    const id=chip.dataset.legend; const target = $(`[data-region="${id}"]`); if(!target) return;
    target.dispatchEvent(new Event('click', {bubbles:true}));
  });
})();

function addRegionPanel(regionId){
  const reg = REGIONS.find(r=>r.id===regionId);
  const list = personaSymptoms(reg.group) || [];

  const host = $('[data-region-panels]');
  const panel = document.createElement('div');
  panel.className='region-panel';
  panel.dataset.regionPanel = regionId;
  state.answers[regionId] = {symptoms:new Set(), q:{}};

  panel.innerHTML = `
    <div class="panel-head">
      <strong>${reg.label}</strong>
      <button class="btn btn--outline" data-remove-region="${regionId}">Remove</button>
    </div>
    <div class="q">What’s bothering you?</div>
    <div class="chips" data-symptoms></div>
    <div class="follow" data-followups></div>
  `;
  host.appendChild(panel);

  const chipsHost = $('[data-symptoms]', panel);
  list.forEach(s=>{
    const b=document.createElement('button'); b.type='button'; b.className='chip';
    b.textContent=s.label; b.dataset.symptom=s.id; b.setAttribute('aria-pressed','false');
    chipsHost.appendChild(b);
  });

  panel.addEventListener('click', e=>{
    const rm=e.target.closest('[data-remove-region]'); if(rm){ removeRegion(regionId); return; }
    const chip=e.target.closest('[data-symptom]');
    if(chip){
      const s=chip.dataset.symptom;
      const pressed=chip.getAttribute('aria-pressed')==='true';
      chip.setAttribute('aria-pressed', String(!pressed));
      if(pressed) state.answers[regionId].symptoms.delete(s); else state.answers[regionId].symptoms.add(s);
      renderFollowupsForRegion(regionId, panel);
      $('[data-compute]').disabled = false;
    }
    const fchip=e.target.closest('[data-q][data-opt]');
    if(fchip){
      const qid=fchip.dataset.q, opt=fchip.dataset.opt;
      $$(`[data-q="${qid}"]`, panel).forEach(x=>x.setAttribute('aria-pressed','false'));
      fchip.setAttribute('aria-pressed','true');
      state.answers[regionId].q[qid]=opt;
    }
  });
}
function renderFollowupsForRegion(regionId, panel){
  const host = $('[data-followups]', panel);
  host.innerHTML='';
  const selected = Array.from(state.answers[regionId].symptoms);
  const asked = new Set();
  selected.forEach(sym=>{
    (FOLLOWUPS[sym]||[]).forEach(row=>{
      if(asked.has(row.id)) return; asked.add(row.id);
      const sec=document.createElement('div'); sec.className='block'; sec.innerHTML=`<div class="q">${row.q}</div>`;
      const chips=document.createElement('div'); chips.className='chips';
      row.chips.forEach(opt=>{
        const b=document.createElement('button'); b.className='chip'; b.type='button';
        b.textContent=opt; b.dataset.q=row.id; b.dataset.opt=opt;
        if(state.answers[regionId].q[row.id]===opt) b.setAttribute('aria-pressed','true');
        chips.appendChild(b);
      });
      host.appendChild(sec); host.appendChild(chips);
    });
  });
}
function removeRegionPanel(id){ $(`[data-region-panel="${id}"]`)?.remove(); delete state.answers[id]; }
function removeRegion(id){
  state.regions.delete(id);
  const svg = $(`[data-region="${id}"]`); svg && svg.setAttribute('aria-pressed','false');
  removeRegionPanel(id);
  $('[data-compute]').disabled = (state.regions.size===0 && !state.missing.type);
}

(function bindMissing(){
  const typeWrap = $('[data-missing-type]');
  const whereHead = $('[data-missing-where-head]');
  const whereWrap = $('[data-missing-where]');
  typeWrap.addEventListener('click', e=>{
    const btn=e.target.closest('[data-missing]'); if(!btn) return;
    $$('[data-missing]', typeWrap).forEach(x=>x.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
    state.missing.type = btn.dataset.missing;
    if(state.missing.type==='some'){ whereHead.style.display=''; whereWrap.style.display=''; }
    else { whereHead.style.display='none'; whereWrap.style.display='none'; state.missing.where=null; }
    $('[data-compute]').disabled = false;
  });
  whereWrap.addEventListener('click', e=>{
    const btn=e.target.closest('[data-where]'); if(!btn) return;
    $$('[data-where]', whereWrap).forEach(x=>x.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
    state.missing.where = btn.dataset.where;
  });
})();

/* =================== Knowledge base (rules) =================== */
const KB = [
  /* ========== ADULTS ========== */

  // 1) Irreversible pulpitis (classic)
  {
    id:'irreversible-pulpitis',
    match:{ paths:['adults','kids'], groups:['Front','Back'], symptoms:['Tooth pain','Spontaneous pain'], patterns:['night:Yes','linger:Yes'] },
    out:{ name:'🦷🔥 Severe tooth nerve pain (irreversible pulpitis)',
      causes:['Deep caries irritating the pulp nerve','Possible crack advancing to pulp'],
      do:['Warm saline rinse','OTC analgesic only if safe for you','Sleep with head elevated'],
      dont:['Avoid very hot/cold drinks','Do not apply aspirin on gums'],
      urgency:'urgent', hospital:false,
      treatments:['Root canal treatment','Extraction if tooth is unsalvageable'],
      cites:[
        'IDA Clinical Guidelines: Acute dental pain management',
        'Mayo Clinic – Toothache overview',
        'Sturdevant Operative Dentistry – caries/pulp chapter'
      ]
    }, priority:85
  },

  // 2) Reversible pulpitis (sweet+cold, brief)
  {
    id:'reversible-pulpitis',
    match:{ paths:['adults'], groups:['Front','Back'], symptoms:['Sensitivity (cold)','Sensitivity (sweet)'], patterns:['duration:Yes'] },
    out:{ name:'❄️ Reversible pulpitis (early dentin exposure or caries)',
      causes:['Enamel loss/caries with exposed dentin tubules'],
      do:['Use desensitizing toothpaste 2× daily','Gentle brushing; avoid acids for 1–2 weeks'],
      dont:['Avoid ice chewing and sour drinks'],
      urgency:'routine', hospital:false,
      treatments:['Caries control / restoration','Topical fluoride/desensitizer'],
      cites:[
        'Harvard Health – Tooth sensitivity',
        'IDA – Caries & sensitivity care',
        'Sturdevant – dentin hypersensitivity'
      ]
    }, priority:60
  },

  // 3) Symptomatic apical periodontitis (bite pain)
  {
    id:'sap-bite-pain',
    match:{ paths:['adults'], groups:['Back','Front'], symptoms:['Tooth pain','Pain on release'], patterns:['bite:Yes'] },
    out:{ name:'💥 Inflammation around the root tip (symptomatic apical periodontitis)',
      causes:['Inflamed pulp or high occlusion causing ligament inflammation','Crack line possible'],
      do:['Avoid chewing on that tooth','Analgesic if safe; cold rinse for relief'],
      dont:['Avoid hard foods on that side'],
      urgency:'soon', hospital:false,
      treatments:['Occlusal adjustment','Root canal if pulpal diagnosis confirms'],
      cites:[
        'IDA – Endodontic emergencies',
        'Mayo Clinic – Cracked tooth symptoms'
      ]
    }, priority:70
  },

  // 4) Cracked tooth syndrome
  {
    id:'cracked-tooth',
    match:{ paths:['adults'], groups:['Back'], symptoms:['Cracked on bite','Pain on release'] },
    out:{ name:'🪓 Cracked tooth syndrome',
      causes:['Structural crack through enamel/dentin','Often in heavily restored teeth'],
      do:['Chew on other side','Temporary bite guard if provided'],
      dont:['Avoid hard nuts / seeds on that side'],
      urgency:'soon', hospital:false,
      treatments:['Onlay/crown to splint cusp','Root canal if pulp involved'],
      cites:[
        'IDA – Cracked tooth',
        'Sturdevant – fracture management'
      ]
    }, priority:75
  },

  // 5) Acute apical abscess / cellulitis red flag
  {
    id:'deep-space-infection',
    match:{ paths:['adults','kids','preg','postop','cancer'], groups:['Back','Front','8th'], symptoms:['Swelling'], patterns:['fever:Yes'] },
    out:{ name:'🚨 Spreading dental infection',
      causes:['Acute odontogenic abscess','Possible fascial space involvement'],
      do:['Keep head elevated','Hydrate','Same-day professional care'],
      dont:['Do not apply heat','No self-drainage'],
      urgency:'emergency', hospital:true,
      treatments:['Drainage + source control (root canal/extraction)','Antibiotics if indicated','Hospital if airway/eye involvement'],
      cites:[
        'WHO – Oral health emergencies',
        'ICMR – Antimicrobial use advisories',
        'IDA – Dental infections'
      ]
    }, priority:100
  },

  // 6) Chronic apical abscess (sinus tract / bad taste)
  {
    id:'chronic-abscess',
    match:{ paths:['adults'], groups:['Back','Front'], symptoms:['Pus discharge','Bad taste'], patterns:['sinus:Yes'] },
    out:{ name:'🕳️ Draining dental abscess (sinus tract)',
      causes:['Chronic infection draining via gum pimple'],
      do:['Rinse after meals','Analgesic only if needed and safe'],
      dont:['Avoid squeezing the sinus tract'],
      urgency:'soon', hospital:false,
      treatments:['Root canal or extraction','Irrigation and debridement'],
      cites:[
        'IDA – Endodontic infections',
        'Mayo Clinic – Dental abscess'
      ]
    }, priority:65
  },

  // 7) Pericoronitis (wisdom tooth)
  {
    id:'pericoronitis',
    match:{ paths:['adults','preg'], groups:['8th'], symptoms:['Pain around wisdom tooth'], patterns:['swelling:Yes','taste:Yes'] },
    out:{ name:'🦷🩹 Pericoronitis (gum flap over wisdom tooth)',
      causes:['Food/plaque trapped under operculum'],
      do:['Warm saline/chlorhexidine rinses','Soft diet','Analgesics if safe'],
      dont:['Avoid trauma to flap'],
      urgency:'soon', hospital:false,
      treatments:['Irrigation/debridement','Operculectomy or extraction after acute control'],
      cites:[
        'IDA – Pericoronitis care',
        'Mayo Clinic – Wisdom teeth'
      ]
    }, priority:85
  },

  // 8) Dentin hypersensitivity (non-carious)
  {
    id:'dentin-hypersensitivity',
    match:{ paths:['adults','preg'], groups:['Front','Back'], symptoms:['Sensitivity (cold)'], patterns:['duration:Yes','recession:Yes'] },
    out:{ name:'🥶 Tooth sensitivity from exposed dentin',
      causes:['Gum recession / enamel wear','Open dentin tubules'],
      do:['Desensitizing toothpaste 2× daily','Soft brush, gentle technique'],
      dont:['Avoid acidic foods/drinks for a week'],
      urgency:'routine', hospital:false,
      treatments:['Fluoride varnish/desensitizer','Bonded restoration if needed'],
      cites:[
        'Harvard Health – Sensitivity',
        'IDA – Dentin hypersensitivity'
      ]
    }, priority:58
  },

  // 9) Periodontitis flare (mobility + bleeding)
  {
    id:'periodontitis-flare',
    match:{ paths:['adults'], groups:['Front','Back'], symptoms:['Tooth mobility','Gum bleeding'] },
    out:{ name:'🦷🩸 Gum disease activity (periodontitis)',
      causes:['Inflamed periodontal tissues causing mobility'],
      do:['Professional scaling advised','Interdental cleaning daily'],
      dont:['Avoid smoking','Avoid hard picks that injure gums'],
      urgency:'soon', hospital:false,
      treatments:['Scaling & root planing','Local antimicrobials if indicated'],
      cites:[
        'IDA – Periodontal disease',
        'WHO – Oral health'
      ]
    }, priority:62
  },

  // 10) Caries-related toothache (visible cavity + lingering)
  {
    id:'caries-lingering',
    match:{ paths:['adults'], groups:['Back','Front'], symptoms:['Cavity seen','Sensitivity (cold)'], patterns:['linger:Yes'] },
    out:{ name:'🦠 Deep caries likely approaching nerve',
      causes:['Caries progression into dentin/near pulp'],
      do:['Temporary relief with analgesic if safe','Keep area clean; avoid sweets'],
      dont:['Avoid biting hard on that tooth'],
      urgency:'urgent', hospital:false,
      treatments:['Restoration / pulp therapy after evaluation'],
      cites:[
        'IDA – Caries treatment',
        'Sturdevant – Caries management'
      ]
    }, priority:68
  },

  // 11) Sinusitis mimic (ear referral + nasal congestion)
  {
    id:'sinusitis-mimic',
    match:{ paths:['adults'], groups:['Back'], symptoms:['Ear referral'], patterns:['nasal:Yes','bite:No'] },
    out:{ name:'👃 Sinus-related referred pain (molar area)',
      causes:['Maxillary sinus congestion referring to uppers'],
      do:['Nasal hygiene/steam inhalation','Monitor 48–72h'],
      dont:['Avoid unnecessary dental meds without exam'],
      urgency:'routine', hospital:false,
      treatments:['Dental exam to rule out tooth origin','Medical care if sinus symptoms persist'],
      cites:[
        'Mayo Clinic – Sinusitis',
        'Burket’s Oral Medicine – Orofacial pain'
      ]
    }, priority:45
  },

  /* ========== PREGNANCY ========== */

  // 12) Pregnancy gingivitis
  {
    id:'preg-gingivitis',
    match:{ paths:['preg'], groups:['Front','Back'], symptoms:['Gum bleeding'], patterns:['when:Brushing'] },
    out:{ name:'🩸 Pregnancy-accentuated gingivitis',
      causes:['Hormonal changes heighten response to plaque'],
      do:['Soft brush 2× daily','Professional scaling recommended'],
      dont:['Avoid aggressive brushing'],
      urgency:'routine', hospital:false,
      treatments:['Scaling & polishing','Oral hygiene reinforcement'],
      cites:[
        'IDA – Pregnancy & oral health',
        'WHO – Maternal oral health'
      ]
    }, priority:70
  },

  // 13) Pregnancy tumor (pyogenic granuloma)
  {
    id:'preg-tumor',
    match:{ paths:['preg'], groups:['Front','Back'], symptoms:['Gum bleeding'] },
    out:{ name:'🔴 Localized pregnancy tumor (pyogenic granuloma)',
      causes:['Reactive gingival overgrowth during pregnancy'],
      do:['Gentle hygiene; professional cleaning','Manage plaque carefully'],
      dont:['Avoid trauma with hard foods/brush'],
      urgency:'routine', hospital:false,
      treatments:['Often regresses postpartum','Excision if persistent/bleeding'],
      cites:[
        'Burket’s Oral Medicine – Pregnancy tumor',
        'IDA – Pregnancy oral care'
      ]
    }, priority:55
  },

  // 14) Pregnancy — reversible pulpitis/sensitivity
  {
    id:'preg-sensitivity',
    match:{ paths:['preg'], groups:['Front','Back'], symptoms:['Sensitivity (cold)'], patterns:['duration:Yes'] },
    out:{ name:'🥶 Tooth sensitivity during pregnancy',
      causes:['Gingival changes / exposed dentin'],
      do:['Desensitizing paste 2× daily','Short, comfortable appointments'],
      dont:['Avoid unnecessary meds; follow dentist advice'],
      urgency:'routine', hospital:false,
      treatments:['Topical fluoride/desensitizer','Restoration if caries present'],
      cites:[
        'WHO – Pregnancy oral health',
        'IDA – Sensitivity in pregnancy'
      ]
    }, priority:56
  },

  // 15) Pregnant — urgent odontogenic infection rule
  {
    id:'preg-infection-urgent',
    match:{ paths:['preg'], groups:['Back','Front','8th'], symptoms:['Swelling'], patterns:['fever:Yes'] },
    out:{ name:'🚨 Suspected odontogenic infection in pregnancy',
      causes:['Acute dental abscess needing urgent care'],
      do:['Seek same-day dental/medical evaluation','Hydration; head elevated'],
      dont:['Do not delay due to pregnancy — urgent care is necessary'],
      urgency:'emergency', hospital:true,
      treatments:['Drainage + source control under pregnancy-safe protocol'],
      cites:[
        'WHO – Emergency dental care in pregnancy',
        'ICMR – Antimicrobial stewardship'
      ]
    }, priority:100
  },

  /* ========== KIDS ========== */

  // 16) Early childhood caries (sweet/cold)
  {
    id:'ecc',
    match:{ paths:['kids'], groups:['Front','Back'], symptoms:['Sensitivity (sweet)','Sensitivity (cold)'] },
    out:{ name:'🍼 Early childhood caries (ECC) likely',
      causes:['Sugar exposures (bottle/sippy/night feeds)'],
      do:['Brush with fluoride paste (pea-size)','Rinse after sweet snacks'],
      dont:['Avoid night-time sweetened bottles'],
      urgency:'soon', hospital:false,
      treatments:['Fluoride varnish','Restorations (glass ionomer/composite)'],
      cites:[
        'IDA – Pediatric caries',
        'Mayo Clinic – Baby bottle tooth decay'
      ]
    }, priority:60
  },

  // 17) Trauma – chipped anterior tooth
  {
    id:'kids-trauma-chip',
    match:{ paths:['kids'], groups:['Front'], symptoms:['Chipped/broken'] },
    out:{ name:'🧩 Minor enamel/dentin fracture',
      causes:['Trauma to anterior tooth'],
      do:['Save fragments if available','Soft diet 24–48h'],
      dont:['Avoid biting with the injured tooth'],
      urgency:'soon', hospital:false,
      treatments:['Smoothening/bonding','Pulp vitality monitoring'],
      cites:[
        'Burket’s Oral Medicine – Dental trauma',
        'IDA – Pediatric dental trauma'
      ]
    }, priority:65
  },

  /* ========== CANCER CARE ========== */

  // 18) Cancer – mucositis
  {
    id:'cancer-mucositis',
    match:{ paths:['cancer'], groups:['Front','Back'], symptoms:['Mucositis'] },
    out:{ name:'🔥 Oral mucositis supportive care',
      causes:['Chemo/radiation-induced mucosal injury'],
      do:['Bland rinses (salt/bicarbonate) frequently','Keep lips moist; frequent sips','Discuss high-fluoride trays'],
      dont:['Avoid spicy/acidic/hard foods','Avoid alcohol mouthwash'],
      urgency:'routine', hospital:false,
      treatments:['Supportive care ladder; antifungals if candidiasis'],
      cites:[
        'WHO – Cancer supportive oral care',
        'Mayo Clinic – Oral mucositis'
      ]
    }, priority:70
  },

  /* ========== POST-OP ========== */

  // 19) Post-extraction – dry socket
  {
    id:'dry-socket',
    match:{ paths:['postop'], groups:['Back','Front'], symptoms:['Dry socket pain'] },
    out:{ name:'🕳️ Dry socket (alveolar osteitis) suspicion',
      causes:['Clot loss causing exposed bone and pain day 3–5'],
      do:['Return for medicated dressing','Analgesics if safe'],
      dont:['Avoid smoking and vigorous rinsing'],
      urgency:'soon', hospital:false,
      treatments:['Socket dressing / irrigation','Pain control'],
      cites:[
        'IDA – Post-extraction complications',
        'Peterson Oral & Maxillofacial Surgery – Dry socket'
      ]
    }, priority:75
  },

  // 20) Post-filling – high occlusion
  {
    id:'high-occlusion',
    match:{ paths:['postop'], groups:['Back','Front'], symptoms:['High bite','Tooth pain'], patterns:['same:Yes'] },
    out:{ name:'📏 High filling/crown causing ligament soreness',
      causes:['Raised occlusion stressing ligament'],
      do:['Return for bite adjustment'],
      dont:['Avoid chewing hard on that tooth until adjusted'],
      urgency:'routine', hospital:false,
      treatments:['Occlusal adjustment','Symptom review'],
      cites:[
        'IDA – Occlusal adjustment',
        'Sturdevant – Occlusion & restorations'
      ]
    }, priority:58
  },

  /* ========== MISSING TEETH QUICK PATH ========== */

  // 21) Missing — partial
  {
    id:'missing-partial',
    match:{ paths:['missing'], groups:['Front','Back','8th'], symptoms:[], patterns:[] },
    out:{ name:'🧭 Some teeth missing — replacement options',
      causes:['Gap risks: drifting, supra-eruption, food trap'],
      do:['Maintain cleaning around gaps','Discuss space maintenance/replacement'],
      dont:['Avoid delaying if chewing is affected'],
      urgency:'routine', hospital:false,
      treatments:['RPD (removable partial denture)','FPD/Bridge','Single/multiple implants','Crown where indicated'],
      cites:[
        'IDA – Prosthodontic options',
        'Textbook of Prosthodontics – treatment planning'
      ]
    }, priority:40
  },

  // 22) Missing — full arch
  {
    id:'missing-full',
    match:{ paths:['missing'], groups:['Front','Back','8th'], symptoms:[], patterns:[] },
    out:{ name:'🧭 All teeth missing — full-arch options',
      causes:['Chewing efficiency & bone resorption concerns'],
      do:['Evaluate for bone and ridge form','Nutritional guidance'],
      dont:['Avoid ill-fitting old dentures'],
      urgency:'routine', hospital:false,
      treatments:['Complete denture','Implant-supported overdenture','Full-arch fixed implants (All-on-X)'],
      cites:[
        'IDA – Edentulism management',
        'Textbook of Prosthodontics – complete dentures'
      ]
    }, priority:40
  }
];

function inferGenericCauses(symptomsSet, group){
  const s = new Set(symptomsSet); const out = [];
  if(s.has('Tooth pain')) out.push('Possible deep cavity irritating the nerve');
  if(s.has('Cracked on bite')) out.push('Possible cracked cusp or fracture line');
  if(s.has('Cavity seen')) out.push('Visible cavity likely contributing to symptoms');
  if(s.has('Sensitivity (cold)') || s.has('Sensitivity (cold/hot)')) out.push('Exposed dentin from enamel wear or gum recession');
  if(s.has('Gum bleeding')) out.push('Plaque-induced gingival inflammation');
  if(group==='Back' && s.has('Food lodgement')) out.push('Open contact or proximal decay causing food trap');
  if(group==='8th' && (s.has('Pain around wisdom tooth') || s.has('Swelling'))) out.push('Inflamed gum flap around wisdom tooth (pericoronitis)');
  if(s.has('Bad taste')) out.push('Drainage or food stagnation around the site');
  if(out.length===0) out.push('Localized irritation or early decay (needs clinical check)');
  return out;
}

$('[data-compute]').addEventListener('click', ()=>{
  const path = state.path || 'adults';
  const cards = [];

  if(path==='missing' && state.missing.type){
    cards.push(renderMissingToothResult());
  }

  for(const regionId of state.regions){
    const reg = REGIONS.find(r=>r.id===regionId);
    const group = reg.group;
    const ans = state.answers[regionId] || {symptoms:new Set(), q:{}};
    const patterns = Object.entries(ans.q).map(([k,v])=>`${k}:${v}`);
    const emergency = ans.symptoms.has('Swelling') && ans.q.fever==='Yes';
    let best=null, bestScore=0;

    KB.forEach(rule=>{
      const okPath = rule.match.paths.includes(path);
      const okGroup = rule.match.groups.includes(group);
      const hasSym  = rule.match.symptoms.some(s=>ans.symptoms.has(s));
      if(!okPath || !okGroup || !hasSym) return;
      let score=(rule.priority||50);
      (rule.match.patterns||[]).forEach(p=>{ if(patterns.includes(p)) score+=10; });
      if(score>bestScore){ bestScore=score; best=rule; }
    });
    if(emergency){ best = KB.find(r=>r.id==='deep-space-infection'); }

    let out;
    if(best){ out = {...best.out}; }
    else {
      out = {
        name:'ℹ️ Insufficient info for a specific match',
        causes: inferGenericCauses(ans.symptoms, group),
        do:['Gentle hygiene','Warm saline rinse','Monitor symptoms'],
        dont:['Avoid self-medicating without advice'],
        urgency:'routine', hospital:false,
        treatments:['Clinical examination recommended','Learn steps, time & cost'],
        cites:['WHO • ICMR • IDA • Mayo Clinic • Harvard Health • FDA • CDSCO']
      };
    }

    if(path==='preg'){ out = withPregnancyTrimesterAdvisory(out, state.trimester); }
    if(path==='cancer'){ out = withCancerCareAdvisory(out); }
    if(path==='postop' && state.postop){ out = withPostOpCareAdvisory(out, state.postop); }

    cards.push(makeResultCard(`${reg.label}`, out));
  }

  const host = $('[data-results]'); host.innerHTML='';
  cards.forEach(c=>host.appendChild(c));
  $('[data-download]').style.display = cards.length ? '' : 'none';

  state.counter += 1; localStorage.setItem('hf_helped', String(state.counter)); updateHelped();
  buildFAQsFromResults();
  document.getElementById('results').scrollIntoView({behavior:'smooth'});
});

function withPregnancyTrimesterAdvisory(out, tri){
  const add = [];
  if(tri==='T1') add.push('Avoid elective procedures; urgent care only with precautions.');
  if(tri==='T2') add.push('Safest window for most dental care; maintain short comfortable appointments.');
  if(tri==='T3') add.push('Short, upright-tilted appointments; avoid long sessions; monitor for supine hypotension.');
  if(add.length){ out.do = Array.from(new Set([...(out.do||[]), ...add])); }
  out.dont = Array.from(new Set([...(out.dont||[]), 'Do not start or stop medications without clinician advice']));
  return out;
}
function withCancerCareAdvisory(out){
  const extraDo = [
    'Bland rinses (salt/bicarbonate) frequently',
    'Keep lips moist; frequent sips/wet sponge',
    'Discuss high-fluoride toothpaste/trays with dentist'
  ];
  const extraDont = [
    'Avoid spicy/acidic/hard foods during mucositis',
    'Avoid alcohol-containing mouthwashes'
  ];
  out.do = Array.from(new Set([...(out.do||[]), ...extraDo]));
  out.dont = Array.from(new Set([...(out.dont||[]), ...extraDont]));
  return out;
}
function withPostOpCareAdvisory(out, proc){
  const map = {
    EXTRACTION: {
      do:['Bite on gauze 30–45 min','Cold compress 10min on/off first 6–8h'],
      dont:['Don’t spit or rinse vigorously first 24h','Avoid straws and smoking 72h']
    },
    RCT: {
      do:['Chew on opposite side until final crown','Expect mild tenderness 24–48h'],
      dont:['Avoid hard nuts on that tooth until final restoration']
    },
    IMPLANT: {
      do:['Cold compress day 1','Soft diet 3–5 days','Keep sutures clean'],
      dont:['Avoid touching the implant area with fingers/tongue']
    },
    FILLING: {
      do:['If high on bite, return for occlusion check'],
      dont:['Avoid extremely cold/sweet triggers for 48h if sensitive']
    },
    BRACES: {
      do:['Orthodontic wax on sharp spots','Salt water rinses'],
      dont:['Avoid sticky/hard foods that break brackets']
    },
    ALIGNERS: {
      do:['Switch trays as advised','Wear 20–22 h/day','Use chewies to seat trays'],
      dont:['Avoid hot water on trays (warps them)']
    },
    SCALING: {
      do:['Desensitizing toothpaste','Warm saline rinses'],
      dont:['Avoid ice/acidic drinks for 24–48h if sensitive']
    },
    GUM: {
      do:['Follow dressing and rinse instructions','Take meds as prescribed'],
      dont:['Avoid brushing on the surgical site until advised']
    }
  };
  const adv = map[proc];
  if(adv){
    out.do  = Array.from(new Set([...(out.do||[]),  ...(adv.do||[])]));
    out.dont= Array.from(new Set([...(out.dont||[]),...(adv.dont||[])]));
  }
  return out;
}

function makeResultCard(title, out){
  const urgencyTag = out.urgency==='emergency' ? ['red','Emergency — same day']
                   : out.urgency==='urgent'   ? ['amber','Urgent — within 24–48h']
                   : out.urgency==='soon'     ? ['amber','Visit soon (1–3 days)']
                   : ['green','Routine (days to weeks)'];

  const card=document.createElement('article'); card.className='result-card';
  card.innerHTML = `
    <div class="result-head">
      <div class="badge"><span class="traffic"><span class="dot ${urgencyTag[0]}"></span>${title} — ${out.name}</span></div>
    </div>
    ${iconBlock('🔍','Probable causes', out.causes)}
    ${iconBlock('✅','Do now (home care)', out.do)}
    ${iconBlock('⛔','Don’t do', out.dont)}
    ${iconBlock('🕒','When to visit', [urgencyTag[1] + (out.hospital ? ' • Hospital if airway/eye involvement' : '')])}
    ${treatmentCards(out.treatments)}
    ${citationsBlock(out.cites)}
  `;
  return card;
}
function iconBlock(icon, title, items){
  if(!items || !items.length) return '';
  const lis = items.map(x=>`<li>${x}</li>`).join('');
  return `<div class="block"><div class="icon-row"><span class="ic">${icon}</span><strong>${title}</strong></div><ul>${lis}</ul></div>`;
}
function treatmentCards(items){
  if(!items || !items.length) return '';
  const list = items.map(t=>`<div class="treat-card"><a href="/treatments/${slugify(t)}" target="_blank" rel="noopener">${t}</a><p class="card__emi">Learn steps, time & cost</p></div>`).join('');
  return `<div class="block"><div class="icon-row"><span class="ic">🛠️</span><strong>Treatment options</strong></div><div class="treat-cards">${list}</div></div>`;
}
function citationsBlock(cites){
  if(!cites || !cites.length) return '';
  const lis=cites.map(c=>`<li>${c}</li>`).join('');
  return `<div class="citations"><strong>Sources</strong><ul>${lis}</ul><div style="margin-top:6px">Reviewed by <strong>Dr. Dhivakaran R.</strong></div></div>`;
}
function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

function buildFAQsFromResults(){
  const wrap = $('[data-faqs]'); wrap.innerHTML='';
  const faqs = [
    {q:'Do I need antibiotics?', a:'Only when there are spreading infections or systemic signs as judged by a dentist/physician. Not for simple toothache without infection.'},
    {q:'Is dental treatment safe in pregnancy?', a:'Yes for urgent care and preventive cleaning with proper precautions. Non-urgent care often fits best in the second trimester.'},
    {q:'When should I go to a hospital?', a:'If you have difficulty breathing/swallowing, eye swelling, rapidly spreading swelling, or high fever — seek emergency care the same day.'},
    {q:'Are implants always better than bridges?', a:'It depends on bone, bite, hygiene, systemic factors, and adjacent tooth health. Your dentist will guide the best option for your case.'}
  ];
  faqs.forEach(({q,a})=>{
    const d=document.createElement('details');
    d.innerHTML = `<summary>${q}</summary><div>${a}</div>`;
    wrap.appendChild(d);
  });
}

$('[data-download]').addEventListener('click', ()=>{ window.print(); });
$('[data-reset]').addEventListener('click', ()=>{
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>location.reload(), 250);
});

(function syncFAQtoJSONLD(){
  const faqWrap = document.querySelector('.faq');
  if(!faqWrap) return;
  const qas = [];
  faqWrap.querySelectorAll('details').forEach(d=>{
    const q = d.querySelector('summary')?.innerText?.trim();
    const a = Array.from(d.childNodes)
      .filter(n=>n.nodeType===Node.ELEMENT_NODE && n.tagName!=="SUMMARY")
      .map(n=>n.textContent.trim()).join(' ').trim();
    if(q && a){ qas.push({ "@type":"Question", name:q, acceptedAnswer:{ "@type":"Answer", text:a } }); }
  });
  if(!qas.length) return;
  const data = {
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "@id": location.origin + location.pathname + "#faq",
    "mainEntity": qas
  };
  const old = document.getElementById('faq-jsonld-dynamic');
  if(old) old.remove();
  const s = document.createElement('script'); s.type="application/ld+json"; s.id="faq-jsonld-dynamic";
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
})();
