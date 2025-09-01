import { getTriageSummary } from './logic.js';

/* ------------------ tiny utils ------------------ */
const $ = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => Array.from(ctx.querySelectorAll(q));
const uniq = arr => [...new Set(arr)];
const sleep = (ms) => new Promise(r=>setTimeout(r,ms));

/* ---------- complaint → knowledge ids map ---------- */
const KB_MAP = {
  tooth_pain_sensitivity: ['toothache','cavity','cracked-tooth','wisdom-tooth'],
  swelling_fever:         ['abscess','wisdom-tooth'],
  gum_periodontal:        ['bleeding-gums','gum-recession','loose-tooth','denture-sore'],
  tmj_muscle:             ['bruxism','tmj'],
  mucosa_others:          ['mouth-ulcer','oral-cancer','dry-mouth'],
  missing_tooth:          ['missing-tooth'],
  alignment_gap:          ['crooked-teeth']
};

/* ----- compute region family (mirrors logic.js) ----- */
function regionFamily(regionId='') {
  const id = (regionId||'').toLowerCase();
  const m = id.match(/tooth_(\d{2})/);
  if (m) {
    const n = parseInt(m[1],10);
    const isPrimary = [51,52,53,54,55,61,62,63,64,65,71,72,73,74,75,81,82,83,84,85].includes(n);
    if (!isPrimary) {
      if ([11,12,13,21,22,23,31,32,33,41,42,43].includes(n)) return 'front_teeth';
      if ([18,28,38,48].includes(n)) return 'wisdom_teeth';
      return 'back_teeth';
    } else {
      if ([51,52,53,61,62,63,71,72,73,81,82,83].includes(n)) return 'front_teeth';
      return 'back_teeth';
    }
  }
  if (id.startsWith('gum_') || id.startsWith('gingiva_')) return 'gum_teeth';
  if (id.includes('upper')) return 'upper_quadrant';
  if (id.includes('lower')) return 'lower_quadrant';
  return 'general';
}

/* --------------- intake readers ---------------- */
function readIntake() {
  const age = parseInt($('#pt_age')?.value || '0', 10) || 0;
  const gender = $('#pt_gender')?.value || '';
  const flow = (document.querySelector('input[name="pt_flow"]:checked')?.value) || 'new';
  const isFemaleAdult = gender === 'female' && age >= 18;

  return {
    name: $('#pt_name')?.value?.trim() || '',
    age, gender, flow,
    pregnancy: isFemaleAdult ? ($('#pt_pregnancy')?.value || '') : '',
    nursing: isFemaleAdult ? !!$('#pt_nursing')?.checked : false,

    postop: {
      procedure: flow === 'postop' ? ($('#pt_postop_proc')?.value || '') : '',
      days: flow === 'postop' ? (parseInt($('#pt_postop_days')?.value || '0', 10) || 0) : 0,
      fever: flow === 'postop' ? !!$('#pt_postop_fever')?.checked : false
    },

    history: $$('.mh:checked').map(x => x.value),
    history_other: $('#mh_other')?.value?.trim() || '',
    meds: $$('.med:checked').map(x => x.value),
    meds_detail: $('#med_details')?.value?.trim() || '',
    duration: $('#symp_duration')?.value || '',
    flags: {
      fever: !!$('#flag_fever')?.checked,
      spread: !!$('#flag_spread')?.checked
    },
    hygiene: $$('.hyg:checked').map(x => x.value)
  };
}

function updateIntakeSummary() {
  const i = readIntake();
  $('#sumName').textContent = i.name || '—';
  $('#sumAge').textContent = i.age ? `${i.age}` : '—';
  $('#sumGender').textContent = i.gender || '—';
  $('#sumDuration').textContent = i.duration || '—';
}
function showPregnancyBlock() {
  const age = parseInt($('#pt_age')?.value || '0', 10) || 0;
  const gender = $('#pt_gender')?.value || '';
  $('#pregnancyBlock').classList.toggle('hidden', !(gender==='female' && age >= 18));
}
function showPostOpBlock() {
  const flow = (document.querySelector('input[name="pt_flow"]:checked')?.value) || 'new';
  $('#postopBlock').classList.toggle('hidden', flow !== 'postop');
}

/* ----------- SVG binding & tooltip (existing) ----------- */
function bindSvgAndRegions() {
  const tooltip = $('#tooltip');
  const jawInput = $('#jawLocation');
  const sumArea = $('#sumArea');
  const svgContainer = $('#inlineSvgContainer');

  return Promise.all([
    fetch('assets/jaw-map-advanced.svg').then(r => r.text()),
    fetch('assets/regions.json').then(r => r.json()).catch(()=>({}))
  ]).then(([svgText, regions]) => {
    window.__regionsCache = regions || {};
    svgContainer.innerHTML = svgText;

    const svgRoot = svgContainer.querySelector('svg');
    const archPermanent = svgRoot.getElementById('arch_permanent');
    const archPrimary   = svgRoot.getElementById('arch_primary');

    function metaForId(id) {
      const R = window.__regionsCache || {};
      if (R[id]) return R[id];
      const mTooth = id.match(/^tooth_(\d{2})$/i);
      if (mTooth) {
        const n = parseInt(mTooth[1],10);
        const isPrimary = [51,52,53,54,55,61,62,63,64,65,71,72,73,74,75,81,82,83,84,85].includes(n);
        const quad = ({1:'UR',2:'UL',3:'LL',4:'LR',5:'UR',6:'UL',7:'LL',8:'LR'})[Math.floor(n/10)] || 'Tooth';
        const unit = n%10;
        const type = isPrimary ? (unit<=2?'Primary incisor':unit===3?'Primary canine':'Primary molar')
                               : ([1,2].includes(unit)?'Incisor':unit===3?'Canine':[4,5].includes(unit)?'Premolar':'Molar');
        return {
          name: `Tooth ${n} (${quad} ${type})`,
          hint: isPrimary ? "Children’s tooth. Pain/swelling needs timely care."
                          : (type==='Molar'||type==='Premolar') ? "Grooves trap plaque → cavities/cracks."
                          : "Chips/wear common; smooth-surface cavities still possible.",
          source: "WHO – Oral Health",
          link: "https://www.who.int/health-topics/oral-health"
        };
      }
      const mG = id.match(/^gingiva_(b|l)_(\d{2})$/i);
      if (mG) {
        const side = mG[1]==='b'?'Buccal gum':'Lingual/palatal gum';
        const n = mG[2];
        return { name:`${side} of tooth ${n}`, hint:"Bleeding with brushing suggests gum disease.", source:"ADA – Gum Disease", link:"https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/gum-disease" };
      }
      if (id.startsWith('gum_')) {
        return { name: id.replace(/_/g,' ').replace('gum','Gum').replace(/\b\w/g,c=>c.toUpperCase()), hint:"General gum region. Persistent bleeding → book a cleaning.", source:"ADA – Gum Disease", link:"https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/gum-disease" };
      }
      return { name:id, hint:"Area", source:"WHO – Oral Health", link:"https://www.who.int/health-topics/oral-health" };
    }

    function bindOne(el) {
      const id = el.id; if (!id) return;
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', (e) => {
        const meta = metaForId(id);
        const rectWrap = svgContainer.getBoundingClientRect();
        $('#tooltip').innerHTML = `<strong>${meta.name}</strong><br>${meta.hint}<br><small>Source: <a href="${meta.link}" target="_blank" rel="noopener">${meta.source}</a></small>`;
        tooltip.style.left = `${e.clientX - rectWrap.left + 10}px`;
        tooltip.style.top  = `${e.clientY - rectWrap.top + 10}px`;
        tooltip.classList.remove('hidden');
      });
      el.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
      el.addEventListener('click', () => {
        $$('.active', svgRoot).forEach(n => n.classList.remove('active'));
        el.classList.add('active');
        const meta = metaForId(id);
        jawInput.value = meta.name;
        jawInput.dataset.regionId = id;
        sumArea.textContent = meta.name;
      });
      el.setAttribute('tabindex','0');
      el.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); el.click(); }});
    }

    function generateGumBands(archGroup) {
      $$('.gumband', svgRoot).forEach(b => b.remove());
      const toothNodes = $$('[id^="tooth_"]', archGroup);
      toothNodes.forEach(tooth => {
        const id = tooth.id;
        const bb = tooth.getBBox();
        const band = Math.max(6, Math.min(10, bb.height * 0.18));
        const n = parseInt(id.slice(6,8),10);
        const isUpper = (n < 30) || (n >= 50 && n < 70);
        const bY = isUpper ? (bb.y - band - 3) : (bb.y + bb.height + 3);
        const lY = isUpper ? (bb.y + bb.height + 3) : (bb.y - band - 3);
        const mk = (suffix, y) => {
          const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          r.setAttribute('x', bb.x); r.setAttribute('y', y);
          r.setAttribute('width', bb.width); r.setAttribute('height', band);
          r.setAttribute('rx', 4); r.setAttribute('class', 'gum gumband');
          r.setAttribute('id', `gingiva_${suffix}_${id.slice(6)}`);
          archGroup.appendChild(r);
        };
        mk('b', bY); mk('l', lY);
      });
    }

    function bindInteractions() {
      ['gum_upper_left','gum_upper_right','gum_lower_left','gum_lower_right'].forEach(id=>{
        const el = svgRoot.getElementById(id); if (el) bindOne(el);
      });
      const visibleArch = svgRoot.querySelector('#arch_primary').style.display==='none'
        ? svgRoot.querySelector('#arch_permanent')
        : svgRoot.querySelector('#arch_primary');
      $$('[id^="tooth_"]', visibleArch).forEach(bindOne);
      $$('[id^="gingiva_"]', visibleArch).forEach(bindOne);
    }

    function setDentition(mode) {
      if (mode === 'primary') {
        archPrimary.style.display = '';
        archPermanent.style.display = 'none';
        generateGumBands(archPrimary);
      } else {
        archPermanent.style.display = '';
        archPrimary.style.display = 'none';
        generateGumBands(archPermanent);
      }
      bindInteractions();
      $$('.active', svgRoot).forEach(n => n.classList.remove('active'));
      $('#jawLocation').value = ''; $('#jawLocation').dataset.regionId = '';
      $('#sumArea').textContent = '—';
    }

    $('#use2D')?.addEventListener('click', () => setDentition('permanent'));
    $('#usePrimary')?.addEventListener('click', () => setDentition('primary'));
    setDentition('permanent');
  });
}

/* ------------- knowledge loader & renderer ------------- */
async function loadIndex() {
  if (window.__KB_INDEX) return window.__KB_INDEX;
  const r = await fetch('/data/knowledge/index.json');
  if (!r.ok) throw new Error('Cannot load knowledge index');
  const idx = await r.json();
  window.__KB_INDEX = idx;
  return idx;
}
async function loadCondition(id) {
  const r = await fetch(`/data/knowledge/${id}.json`);
  if (!r.ok) throw new Error(`Missing knowledge file: ${id}`);
  return r.json();
}

function evalUrgency(kb, intake, regionId) {
  // Start from default, then apply first matching modifier that increases urgency
  const rfam = regionFamily(regionId);
  let level = kb.urgency_default || 'yellow_routine';
  let reason = '';

  const mods = kb.urgency_modifiers || [];
  for (const m of mods) {
    const W = m.when || {};
    let ok = true;
    if (ok && W.flags) {
      ok = (W.flags||[]).every(f => (intake.flags||{})[f] === true);
    }
    if (ok && W.duration) {
      ok = (intake.duration||'') === W.duration;
    }
    if (ok && (W.age_lt!=null)) ok = (intake.age||0) < W.age_lt;
    if (ok && (W.age_gte!=null)) ok = (intake.age||0) >= W.age_gte;
    if (ok && W.gender) ok = (intake.gender||'') === W.gender;
    if (ok && W.history_any) ok = (intake.history||[]).some(h => W.history_any.includes(h));
    if (ok && W.meds_any) ok = (intake.meds||[]).some(h => W.meds_any.includes(h));
    if (ok && W.region_family) ok = (rfam === W.region_family);
    if (ok) { level = m.set_to || level; reason = m.why || reason; break; }
  }
  return { level, reason };
}

function badgeFor(level) {
  switch(level){
    case 'green_watch': return '🟢 Watch & home care';
    case 'yellow_routine': return '🟡 Routine dental visit';
    case 'orange_medical_coord': return '🟠 Medical coordination first';
    case 'red_urgent': return '🔴 Urgent care';
    default: return '🟡 Routine dental visit';
  }
}

function renderList(arr) {
  if (!arr || !arr.length) return '<p>—</p>';
  return `<ul>${arr.map(x=>`<li>${x}</li>`).join('')}</ul>`;
}

function renderProfessionalCare(list) {
  if (!list || !list.length) return '<p>—</p>';
  return `
    <div class="table-wrapper">
      <table class="diff-table">
        <thead><tr><th>Treatment</th><th>What it does</th><th>Pros</th><th>Cons</th></tr></thead>
        <tbody>
          ${list.map(x=>`
            <tr>
              <td><strong>${x.name}</strong></td>
              <td>${x.what_it_does || ''}</td>
              <td>${renderList(x.pros || []).replace(/^<ul>|<\/ul>$/g,'')}</td>
              <td>${renderList(x.cons || []).replace(/^<ul>|<\/ul>$/g,'')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderReferences(refs) {
  if (!refs || !refs.length) return '';
  return `<p><small><strong>References:</strong> ${refs.map(r=>r.url ? `<a href="${r.url}" target="_blank" rel="noopener">${r.label}</a>` : r.label).join(' · ')}</small></p>`;
}

function renderConditionCards(kb, urgency) {
  const sections = [];
  sections.push({
    title: `${badgeFor(urgency.level)} — ${kb.condition}`,
    content: urgency.reason ? `<p><em>${urgency.reason}</em></p>` : ''
  });
  if (kb.probable_causes?.length) sections.push({ title: 'Possible causes (not a diagnosis)', content: renderList(kb.probable_causes) });
  if (kb.differentials?.length) sections.push({
    title: 'How it differs from similar problems',
    content: renderList(kb.differentials.map(d => `<strong>${d.name}:</strong> ${ (d.clues||[]).join('; ') }`))
  });
  if (kb.investigations?.length) sections.push({ title: 'What the dentist may check', content: renderList(kb.investigations) });
  if (kb.do_now?.length || kb.donts?.length) sections.push({
    title: 'Do & Don’ts (now)',
    content: `
      <p><strong>Do:</strong></p>${renderList(kb.do_now)}
      <p><strong>Don’t:</strong></p>${renderList(kb.donts)}
    `
  });
  if (kb.professional_care?.length) sections.push({ title: 'Recommended professional treatments', content: renderProfessionalCare(kb.professional_care) });
  if (kb.prevention?.length) sections.push({ title: 'Prevention', content: renderList(kb.prevention) });
  if (kb.complications?.length) sections.push({ title: 'What can happen if ignored', content: renderList(kb.complications) });

  const sp = kb.special_populations || {};
  const spBits = [];
  if (sp.pediatric?.length) spBits.push(`<p><strong>Children:</strong></p>${renderList(sp.pediatric)}`);
  if (sp.pregnancy_nursing?.length) spBits.push(`<p><strong>Pregnancy / Nursing:</strong></p>${renderList(sp.pregnancy_nursing)}`);
  if (sp.systemic_notes?.length) spBits.push(`<p><strong>Medical conditions:</strong></p>${renderList(sp.systemic_notes)}`);
  if (spBits.length) sections.push({ title: 'Special situations', content: spBits.join('') });

  if (kb.references?.length) sections.push({ title: 'References', content: renderReferences(kb.references) });

  return sections;
}

/* ---------------- generate recommendation ---------------- */
async function generateResults() {
  const recommendBox = $('#results');
  const regionId = $('#jawLocation').dataset.regionId || '';
  const complaints = $$('.complaints input:checked').map(el => el.value);
  if (!regionId || complaints.length === 0) {
    alert('Please select a Tooth / Area and at least one complaint.');
    return;
  }

  // update “Your Inputs” summary
  $('#sumArea').textContent = $('#jawLocation').value || '—';
  const labels = $$('.complaints input:checked').map(el => el.parentElement.textContent.trim());
  $('#sumComplaints').textContent = labels.length ? labels.join(', ') : '—';

  const intake = readIntake();

  // 1) TRIAGE (keep your current logic.js brain)
  const triageSections = getTriageSummary({ intake, complaints, region: regionId });

  // 2) Knowledge selection from complaints
  const kbIds = uniq(complaints.flatMap(key => KB_MAP[key] || []));
  const kbFiles = await Promise.all(kbIds.map(loadCondition));

  // 3) Render
  let html = `<h2 class="recommend-title">Your Guidance</h2>`;
  // Triage first
  triageSections.forEach(sec => {
    html += `<div class="recommend-section active"><h3>${sec.title}</h3><div class="recommend-content">${sec.content}</div></div>`;
  });

  // Then each condition as cards
  kbFiles.forEach(kb => {
    const urg = evalUrgency(kb, intake, regionId);
    const cards = renderConditionCards(kb, urg);
    cards.forEach((c, i) => {
      const opened = i === 0 ? 'active' : '';
      html += `<div class="recommend-section ${opened}"><h3>${c.title}</h3><div class="recommend-content">${c.content}</div></div>`;
    });
  });

  recommendBox.innerHTML = html;
  recommendBox.classList.remove('hidden');

  $$('.recommend-section h3', recommendBox).forEach(h3 => {
    h3.addEventListener('click', () => h3.parentElement.classList.toggle('active'));
  });

  recommendBox.scrollIntoView({ behavior: 'smooth' });
}

/* ---------------- history & export ---------------- */
function wireHistoryAndExport() {
  const box = $('#results');
  $('#saveHistory')?.addEventListener('click', () => {
    if (!box.innerHTML.trim()) return alert('Get a recommendation first.');
    const list = JSON.parse(localStorage.getItem('dentalHistory') || '[]');
    list.push({ date: new Date().toLocaleString(), content: box.innerHTML });
    localStorage.setItem('dentalHistory', JSON.stringify(list));
    alert('Saved.');
  });
  $('#viewHistory')?.addEventListener('click', () => {
    const entries = JSON.parse(localStorage.getItem('dentalHistory') || '[]');
    const hb = $('#historyBox');
    hb.innerHTML = entries.length
      ? entries.map(e => `<div><strong>${e.date}</strong><br>${e.content}</div><hr>`).join('')
      : 'No saved history yet.';
    hb.classList.remove('hidden');
    hb.scrollIntoView({ behavior: 'smooth' });
  });
  $('#exportPDF')?.addEventListener('click', () => {
    if (!box.innerHTML.trim()) return alert('Get a recommendation first.');
    html2pdf().from(box).save('dental-check-result.pdf');
  });
}

/* ---------------- complaints & intake UI ---------------- */
function wireIntakeAndComplaints() {
  // intake
  $('#pt_age')?.addEventListener('input', () => { showPregnancyBlock(); updateIntakeSummary(); });
  $('#pt_gender')?.addEventListener('change', () => { showPregnancyBlock(); updateIntakeSummary(); });
  $$('input[name="pt_flow"]').forEach(r => r.addEventListener('change', () => { showPostOpBlock(); updateIntakeSummary(); }));
  $('#pt_name')?.addEventListener('input', updateIntakeSummary);
  $('#symp_duration')?.addEventListener('change', updateIntakeSummary);
  $$('.mh').forEach(c => c.addEventListener('change', updateIntakeSummary));
  $$('.med').forEach(c => c.addEventListener('change', updateIntakeSummary));
  $$('.hyg').forEach(c => c.addEventListener('change', updateIntakeSummary));
  $('#flag_fever')?.addEventListener('change', updateIntakeSummary);
  $('#flag_spread')?.addEventListener('change', updateIntakeSummary);

  $('#toSymptoms')?.addEventListener('click', () => {
    document.querySelector('.svg-wrapper')?.scrollIntoView({ behavior: 'smooth' });
  });
  $('#clearIntake')?.addEventListener('click', () => {
    $('#intake').querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el => el.value = '');
    $('#intake').querySelectorAll('select').forEach(el => el.value = '');
    $('#intake').querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    $$('input[name="pt_flow"]').forEach((r,i)=> r.checked = i===0);
    showPregnancyBlock(); showPostOpBlock();
    updateIntakeSummary();
  });

  // complaints
  $('#recommendBtn')?.addEventListener('click', generateResults);
  $('#clearBtn')?.addEventListener('click', () => {
    $('#jawLocation').value = '';
    $('#jawLocation').dataset.regionId = '';
    $('#sumArea').textContent = '—';
    $$('.complaints input:checked').forEach(el => (el.checked = false));
    $('#sumComplaints').textContent = '—';
    $('#results').classList.add('hidden'); $('#results').innerHTML = '';
    $$('.active', $('#inlineSvgContainer')).forEach(n => n.classList.remove('active'));
  });
}

/* ---------------- boot ---------------- */
window.addEventListener('DOMContentLoaded', async () => {
  // Warm up knowledge index so first render is smooth
  loadIndex().catch(()=>{});
  bindSvgAndRegions();
  wireIntakeAndComplaints();
  wireHistoryAndExport();
  updateIntakeSummary();
});
