import { getDetailedRecommendation } from './logic.js';
import { getTriageSummary } from './logic.js';

const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

/* ---------- intake helpers ---------- */
function readIntake() {
  const age = parseInt($('#pt_age')?.value || '0', 10) || 0;
  const gender = $('#pt_gender')?.value || '';
  const flow = (document.querySelector('input[name="pt_flow"]:checked')?.value) || 'new';
  const isFemaleAdult = gender === 'female' && age >= 18;

  const intake = {
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
    allergies: $('#allergies')?.value?.trim() || '',

    duration: $('#symp_duration')?.value || '',
    flags: {
      fever: !!$('#flag_fever')?.checked,
      spread: !!$('#flag_spread')?.checked
    },
    hygiene: $$('.hyg:checked').map(x => x.value)
  };
  return intake;
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
  const block = $('#pregnancyBlock');
  if (gender === 'female' && age >= 18) block.classList.remove('hidden');
  else block.classList.add('hidden');
}

function showPostOpBlock() {
  const flow = (document.querySelector('input[name="pt_flow"]:checked')?.value) || 'new';
  $('#postopBlock').classList.toggle('hidden', flow !== 'postop');
}

/* ---------- existing visual map + complaints code (enhanced) ---------- */

// complaints summary
function syncComplaintsSummary() {
  const labels = $$('.complaints input:checked').map(el => el.parentElement.textContent.trim());
  $('#sumComplaints').textContent = labels.length ? labels.join(', ') : '—';
}

// Load & inline advanced SVG + regions.json + gum bands + dentition toggle
window.addEventListener('DOMContentLoaded', () => {
  // intake UI wiring
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
  $$('.complaints input').forEach(cb => cb.addEventListener('change', syncComplaintsSummary));

  const tooltip = $('#tooltip');
  const jawInput = $('#jawLocation');
  const recommendBox = $('#results');
  const sumArea = $('#sumArea');

  const svgContainer = $('#inlineSvgContainer');

  // Inline SVG + regions and generate gum bands + primary toggle
  Promise.all([
    fetch('assets/jaw-map-advanced.svg').then(r => r.text()),
    fetch('assets/regions.json').then(r => r.json()).catch(()=> ({}))
  ]).then(([svgText, regions]) => {
    window.__regionsCache = regions || {};
    svgContainer.innerHTML = svgText;

    const svgRoot = svgContainer.querySelector('svg');
    const archPermanent = svgRoot.getElementById('arch_permanent');
    const archPrimary   = svgRoot.getElementById('arch_primary');

    const setDentition = (mode) => {
      if (mode === 'primary') {
        archPrimary.style.display = '';
        archPermanent.style.display = 'none';
        generateGumBands(archPrimary);
      } else {
        archPermanent.style.display = '';
        archPrimary.style.display = 'none';
        generateGumBands(archPermanent);
      }
      bindInteractions(svgRoot);
      $$('.active', svgRoot).forEach(n => n.classList.remove('active'));
      jawInput.value = ''; jawInput.dataset.regionId = '';
      sumArea.textContent = '—';
    };

    $('#use2D')?.addEventListener('click', () => setDentition('permanent'));
    $('#usePrimary')?.addEventListener('click', () => setDentition('primary'));
    setDentition('permanent');

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

    function metaForId(id) {
      const regions = window.__regionsCache || {};
      const ADA = { source:"ADA – Gum Disease", link:"https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/gum-disease" };
      const WHO = { source:"WHO – Oral Health", link:"https://www.who.int/health-topics/oral-health" };

      if (regions[id]) return regions[id];

      const mTooth = id.match(/^tooth_(\d{2})$/i);
      if (mTooth) {
        const n = parseInt(mTooth[1],10);
        const isPrimary = [51,52,53,54,55,61,62,63,64,65,71,72,73,74,75,81,82,83,84,85].includes(n);
        const quad = ({1:"UR",2:"UL",3:"LL",4:"LR",5:"UR",6:"UL",7:"LL",8:"LR"})[Math.floor(n/10)] || "Tooth";
        const unit = n%10;
        const type = isPrimary ? (unit<=2?'Primary incisor':unit===3?'Primary canine':'Primary molar')
                               : ([1,2].includes(unit)?'Incisor':unit===3?'Canine':[4,5].includes(unit)?'Premolar':'Molar');
        const name = `Tooth ${n} (${quad} ${type})`;
        const hint = isPrimary ? "Children’s tooth. Pain/swelling needs timely care."
                               : (type==='Molar'||type==='Premolar') ? "Grooves trap plaque → cavities/cracks."
                               : "Chips/wear common; smooth-surface cavities still possible.";
        return { name, hint, source: WHO.source, link: WHO.link };
      }
      const mG = id.match(/^gingiva_(b|l)_(\d{2})$/i);
      if (mG) {
        const side = mG[1]==='b'?'Buccal gum':'Lingual/palatal gum';
        const n = mG[2];
        return { name:`${side} of tooth ${n}`, hint:"Bleeding with brushing suggests gum disease.", source: ADA.source, link: ADA.link };
      }
      if (id.startsWith('gum_')) {
        return { name: id.replace(/_/g,' ').replace('gum','Gum').replace(/\b\w/g,c=>c.toUpperCase()), hint:"General gum region. Persistent bleeding → book a cleaning.", source: ADA.source, link: ADA.link };
      }
      return { name:id, hint:"Area", source: WHO.source, link: WHO.link };
    }

    function bindOne(el) {
      const id = el.id; if (!id) return;
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', (e) => {
        const meta = metaForId(id);
        tooltip.innerHTML = `<strong>${meta.name}</strong><br>${meta.hint}<br><small>Source: <a href="${meta.link}" target="_blank" rel="noopener">${meta.source}</a></small>`;
        const rectWrap = svgContainer.getBoundingClientRect();
        tooltip.style.left = `${e.clientX - rectWrap.left + 10}px`;
        tooltip.style.top  = `${e.clientY - rectWrap.top + 10}px`;
        tooltip.classList.remove('hidden');
      });
      el.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
      el.addEventListener('click', () => {
        $$('.active', svgRoot).forEach(n => n.classList.remove('active'));
        el.classList.add('active');
        const meta = metaForId(id);
        jawInput.value = meta.name; jawInput.dataset.regionId = id;
        sumArea.textContent = meta.name;
      });
      el.setAttribute('tabindex','0');
      el.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); el.click(); }});
    }

    function bindInteractions(svgRoot) {
      ['gum_upper_left','gum_upper_right','gum_lower_left','gum_lower_right'].forEach(id=>{
        const el = svgRoot.getElementById(id); if (el) bindOne(el);
      });
      const visibleArch = svgRoot.querySelector('#arch_primary').style.display==='none' ? svgRoot.querySelector('#arch_permanent') : svgRoot.querySelector('#arch_primary');
      $$('[id^="tooth_"]', visibleArch).forEach(bindOne);
      $$('[id^="gingiva_"]', visibleArch).forEach(bindOne);
    }
  });

  // Generate recommendations (Triage + Dental)
  $('#recommendBtn')?.addEventListener('click', () => {
    const intake = readIntake();
    const regionId = $('#jawLocation').dataset.regionId || '';
    const complaints = $$('.complaints input:checked').map(el => el.value);

    if (!regionId || complaints.length === 0) {
      alert('Please select a Tooth / Area and at least one complaint.');
      return;
    }

    // update summary view
    $('#sumArea').textContent = $('#jawLocation').value || '—';
    syncComplaintsSummary();
    updateIntakeSummary();

    const box = $('#results');
    box.innerHTML = '';
    box.classList.add('hidden');

    // 1) TRIAGE SUMMARY
    const triage = getTriageSummary({ intake, complaints, region: regionId });

    let html = `<h2 class="recommend-title">Your Guidance</h2>`;
    triage.forEach(sec => {
      html += `<div class="recommend-section active"><h3>${sec.title}</h3><div class="recommend-content">${sec.content}</div></div>`;
    });

    // 2) DENTAL RESULTS (existing 4 sections etc.)
    const dentalSections = getDetailedRecommendation({ region: regionId, complaints });
    dentalSections.forEach(sec => {
      html += `<div class="recommend-section"><h3>${sec.title}</h3><div class="recommend-content">${sec.content}</div></div>`;
    });

    box.innerHTML = html;
    box.classList.remove('hidden');
    $$('.recommend-section h3', box).forEach(h3 => {
      h3.addEventListener('click', () => h3.parentElement.classList.toggle('active'));
      h3.parentElement.classList.add('active');
    });
    box.scrollIntoView({ behavior: 'smooth' });
  });

  // Clear complaints & selection
  $('#clearBtn')?.addEventListener('click', () => {
    $('#jawLocation').value = '';
    $('#jawLocation').dataset.regionId = '';
    $('#sumArea').textContent = '—';
    $$('.complaints input:checked').forEach(el => (el.checked = false));
    $('#sumComplaints').textContent = '—';
    $('#results').classList.add('hidden'); $('#results').innerHTML = '';
    $$('.active', $('#inlineSvgContainer')).forEach(n => n.classList.remove('active'));
  });

  // Save / history / export remain as before
  $('#saveHistory')?.addEventListener('click', () => {
    const box = $('#results');
    if (!box.innerHTML.trim()) return alert('Get a recommendation first.');
    const list = JSON.parse(localStorage.getItem('dentalHistory') || '[]');
    list.push({ date: new Date().toLocaleString(), content: box.innerHTML });
    localStorage.setItem('dentalHistory', JSON.stringify(list));
    alert('Saved.');
  });
  $('#viewHistory')?.addEventListener('click', () => {
    const entries = JSON.parse(localStorage.getItem('dentalHistory') || '[]');
    const historyBox = $('#historyBox');
    historyBox.innerHTML = entries.length
      ? entries.map(e => `<div><strong>${e.date}</strong><br>${e.content}</div><hr>`).join('')
      : 'No saved history yet.';
    historyBox.classList.remove('hidden');
    historyBox.scrollIntoView({ behavior: 'smooth' });
  });
  $('#exportPDF')?.addEventListener('click', () => {
    const box = $('#results');
    if (!box.innerHTML.trim()) return alert('Get a recommendation first.');
    html2pdf().from(box).save('dental-check-result.pdf');
  });
});

