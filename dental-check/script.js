const $ = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => Array.from(ctx.querySelectorAll(q));

window.addEventListener('DOMContentLoaded', async () => {
  const recommendBox = $('#recommendation');

  // Load index.json
  const conditionIndex = await fetch('/data/knowledge/index.json').then(r => r.json());

  // Populate dropdown (or keep checkbox UI if you prefer)
  const complaintSelect = $('#complaintSelect');
  if (complaintSelect) {
    complaintSelect.innerHTML = conditionIndex.map(c => 
      `<option value="${c.id}">${c.name}</option>`
    ).join('');
  }

  // Handle recommendation
  $('#recommendBtn').addEventListener('click', async () => {
    const selectedId = complaintSelect?.value;
    if (!selectedId) {
      alert('Please select a complaint/condition.');
      return;
    }

    // Fetch condition JSON
    const data = await fetch(`/data/knowledge/${selectedId}.json`).then(r => r.json());

    // Render condition as cards
    let html = `<h2>${data.condition}</h2>`;
    html += `<div class="recommend-section"><h3>Possible Causes</h3><p>${data.probable_causes.join(', ')}</p></div>`;
    html += `<div class="recommend-section"><h3>What You Can Do Now</h3><ul>${data.do_now.map(d => `<li>${d}</li>`).join('')}</ul></div>`;
    html += `<div class="recommend-section"><h3>What to Avoid</h3><ul>${data.donts.map(d => `<li>${d}</li>`).join('')}</ul></div>`;
    html += `<div class="recommend-section"><h3>Professional Treatments</h3><ul>${data.professional_care.map(p => `<li><strong>${p.name}:</strong> ${p.what_it_does}</li>`).join('')}</ul></div>`;
    html += `<div class="recommend-section"><h3>Prevention</h3><ul>${data.prevention.map(p => `<li>${p}</li>`).join('')}</ul></div>`;
    html += `<div class="recommend-section"><h3>Complications</h3><ul>${data.complications.map(c => `<li>${c}</li>`).join('')}</ul></div>`;
    
    recommendBox.innerHTML = html;
    recommendBox.classList.remove('hidden');
    recommendBox.scrollIntoView({ behavior: 'smooth' });
  });
});// Load & inline advanced SVG + regions.json + gum bands + dentition toggle
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

