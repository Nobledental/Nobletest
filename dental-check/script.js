import { getDetailedRecommendation } from './logic.js';

const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

/* --- dynamic meta for IDs not present in regions.json (primary teeth + gum bands) --- */
function metaForId(id) {
  const ADA_GUM = { source: "ADA – Gum Disease", link: "https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/gum-disease" };
  const WHO_ORAL = { source: "WHO – Oral Health", link: "https://www.who.int/health-topics/oral-health" };

  // tooth_XX (permanent or primary)
  const mTooth = id.match(/^tooth_(\d{2})$/i);
  if (mTooth) {
    const n = parseInt(mTooth[1], 10);
    const isPrimary = [51,52,53,54,55,61,62,63,64,65,71,72,73,74,75,81,82,83,84,85].includes(n);
    const quadrant = Math.floor(n / 10);
    const quadrantName = ({1:"UR",2:"UL",3:"LL",4:"LR",5:"UR",6:"UL",7:"LL",8:"LR"})[quadrant] || "Tooth";
    const type = (() => {
      // very rough: primary molars=4/5; primary incisors=1/2; canine=3
      const unit = n % 10;
      if (isPrimary) {
        if (unit === 1 || unit === 2) return "Primary incisor";
        if (unit === 3) return "Primary canine";
        return "Primary molar";
      } else {
        if ([1,2].includes(unit)) return "Incisor";
        if (unit === 3) return "Canine";
        if ([4,5].includes(unit)) return "Premolar";
        return "Molar";
      }
    })();
    const name = `Tooth ${n} (${quadrantName} ${type})`;
    const hint = isPrimary
      ? "Children’s tooth. Pain or swelling needs timely care. Avoid bedtime bottles/sugary snacks."
      : type === "Molar" || type === "Premolar"
        ? "Grooves trap plaque → caries/cracks; lingering hot/cold suggests pulpitis."
        : "Chips/wear common; smooth-surface caries possible with frequent sugars.";
    return { name, hint, source: WHO_ORAL.source, link: WHO_ORAL.link };
  }

  // gingiva bands: gingiva_b_XX (buccal) / gingiva_l_XX (lingual)
  const mG = id.match(/^gingiva_(b|l)_(\d{2})$/i);
  if (mG) {
    const side = mG[1] === 'b' ? "Buccal gum" : "Lingual/palatal gum";
    const n = mG[2];
    return {
      name: `${side} of tooth ${n}`,
      hint: "Bleeding with brushing/flossing suggests gingivitis/periodontitis. Local swelling → possible gum abscess.",
      source: ADA_GUM.source, link: ADA_GUM.link
    };
  }

  // gum quadrants (already in regions.json ideally)
  if (id.startsWith('gum_')) {
    return {
      name: id.replace(/_/g, ' ').replace('gum', 'Gum').replace(/\b\w/g, c => c.toUpperCase()),
      hint: "General gum region. Persistent bleeding → book a cleaning and gum check.",
      source: ADA_GUM.source, link: ADA_GUM.link
    };
  }

  // fallback
  return { name: id, hint: "Area", source: WHO_ORAL.source, link: WHO_ORAL.link };
}

window.addEventListener('DOMContentLoaded', () => {
  const tooltip = $('#tooltip');
  const jawInput = $('#jawLocation');
  const recommendBox = $('#recommendation');
  const historyBox = $('#historyBox');
  const sumArea = $('#sumArea');
  const sumComplaints = $('#sumComplaints');
  const svgContainer = $('#inlineSvgContainer');

  // load and inline the advanced SVG + regions metadata
  Promise.all([
    fetch('assets/jaw-map-advanced.svg').then(r => r.text()),
    fetch('assets/regions.json').then(r => r.json()).catch(()=> ({}))
  ]).then(([svgText, regions]) => {
    window.__regionsCache = regions || {};
    svgContainer.innerHTML = svgText;

    const svgRoot = svgContainer.querySelector('svg');
    const archPermanent = svgRoot.getElementById('arch_permanent');
    const archPrimary   = svgRoot.getElementById('arch_primary');

    // toggle buttons (permanent/primary)
    $('#use2D')?.addEventListener('click', () => setDentition('permanent'));
    // If you later enable a separate button for primary:
    const primaryBtn = document.getElementById('usePrimary');
    if (primaryBtn) primaryBtn.addEventListener('click', () => setDentition('primary'));

    // initialize
    setDentition('permanent');

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
      // bind interactions for everything visible
      bindInteractions(svgRoot);
      // clear previous selection visual
      $$('.active', svgRoot).forEach(n => n.classList.remove('active'));
      // reset selected area text
      jawInput.value = '';
      jawInput.dataset.regionId = '';
      if (sumArea) sumArea.textContent = '—';
    }

    // build per-tooth gum bands (buccal/lingual) for a given arch group
    function generateGumBands(archGroup) {
      // remove previous bands
      $$('.gumband', svgRoot).forEach(b => b.remove());

      // find all teeth under this arch
      const toothNodes = $$('[id^="tooth_"]', archGroup);
      toothNodes.forEach(tooth => {
        const id = tooth.id; // tooth_11, etc.
        const r = tooth.getBoundingClientRect();
        const s = svgRoot.getBoundingClientRect();

        // compute bbox in SVG coords using getBBox (more robust)
        const bb = tooth.getBBox();
        const band = Math.max(6, Math.min(10, bb.height * 0.18)); // thickness

        // buccal band (above for upper, below for lower)
        const isUpper = parseInt(id.slice(6,8),10) < 30 || (parseInt(id.slice(6,8),10)>=50 && parseInt(id.slice(6,8),10)<70);
        const bY = isUpper ? (bb.y - band - 3) : (bb.y + bb.height + 3);
        const lY = isUpper ? (bb.y + bb.height + 3) : (bb.y - band - 3);

        const gB = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        gB.setAttribute('x', bb.x);
        gB.setAttribute('y', bY);
        gB.setAttribute('width', bb.width);
        gB.setAttribute('height', band);
        gB.setAttribute('rx', 4);
        gB.setAttribute('class', 'gum gumband');
        gB.setAttribute('id', `gingiva_b_${id.slice(6)}`); // buccal band
        archGroup.appendChild(gB);

        const gL = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        gL.setAttribute('x', bb.x);
        gL.setAttribute('y', lY);
        gL.setAttribute('width', bb.width);
        gL.setAttribute('height', band);
        gL.setAttribute('rx', 4);
        gL.setAttribute('class', 'gum gumband');
        gL.setAttribute('id', `gingiva_l_${id.slice(6)}`); // lingual/palatal band
        archGroup.appendChild(gL);
      });
    }

    function getRegionMeta(id) {
      return window.__regionsCache?.[id] || metaForId(id);
    }

    function bindOne(el) {
      const id = el.id;
      if (!id) return;
      el.style.cursor = 'pointer';

      el.addEventListener('mouseenter', (e) => {
        const meta = getRegionMeta(id);
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

        const meta = getRegionMeta(id);
        jawInput.value = meta.name;
        jawInput.dataset.regionId = id;
        if (sumArea) sumArea.textContent = meta.name;
      });

      // keyboard activate
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.click(); }
      });
    }

    function bindInteractions(svgRoot) {
      // bind teeth, gum quadrants, and generated gum bands in the visible arch
      const visibleArch = svgRoot.querySelector('#arch_primary[style*="display: none"]') ? '#arch_permanent' : '#arch_primary';
      const scope = svgRoot.querySelector(visibleArch) || svgRoot;

      // gum quadrants (shared outside arch groups)
      ['gum_upper_left','gum_upper_right','gum_lower_left','gum_lower_right'].forEach(id=>{
        const el = svgRoot.getElementById(id);
        if (el) bindOne(el);
      });

      // teeth + gum bands in this arch
      $$('[id^="tooth_"]', scope).forEach(bindOne);
      $$('[id^="gingiva_"]', scope).forEach(bindOne);
    }
  });

  // complaints summary as user checks boxes
  const syncComplaintsSummary = () => {
    const labels = $$('.complaints input:checked').map(el => el.parentElement.textContent.trim());
    if (sumComplaints) sumComplaints.textContent = labels.length ? labels.join(', ') : '—';
  };
  $$('.complaints input').forEach(cb => cb.addEventListener('change', syncComplaintsSummary));

  // Generate recommendation + differentials
  $('#recommendBtn')?.addEventListener('click', () => {
    const regionId = jawInput.dataset.regionId || '';
    const complaints = $$('.complaints input:checked').map(el => el.value);

    if (!regionId || complaints.length === 0) {
      alert('Please select a Tooth / Area and at least one complaint.');
      return;
    }

    if (sumArea) sumArea.textContent = jawInput.value;
    syncComplaintsSummary();

    recommendBox.innerHTML = '';
    recommendBox.classList.add('hidden');

    const sections = getDetailedRecommendation({ region: regionId, complaints });
    let html = `<h2 class="recommend-title">Results</h2>`;
    sections.forEach(sec => {
      html += `
        <div class="recommend-section">
          <h3>${sec.title}</h3>
          <div class="recommend-content">${sec.content}</div>
        </div>`;
    });

    recommendBox.innerHTML = html;
    recommendBox.classList.remove('hidden');

    // open all sections initially; allow collapse
    $$('.recommend-section h3', recommendBox).forEach(h3 => {
      h3.addEventListener('click', () => h3.parentElement.classList.toggle('active'));
      h3.parentElement.classList.add('active');
    });

    recommendBox.scrollIntoView({ behavior: 'smooth' });
  });

  // Clear all
  $('#clearBtn')?.addEventListener('click', () => {
    jawInput.value = '';
    jawInput.dataset.regionId = '';
    if (sumArea) sumArea.textContent = '—';
    tooltip.classList.add('hidden');
    $$('.complaints input:checked').forEach(el => (el.checked = false));
    if (sumComplaints) sumComplaints.textContent = '—';
    recommendBox.classList.add('hidden');
    recommendBox.innerHTML = '';

    // remove any active mark inside SVG
    $$('.active', $('#inlineSvgContainer')).forEach(n => n.classList.remove('active'));
  });

  // Save / history / export
  $('#saveHistory')?.addEventListener('click', () => {
    if (!recommendBox.innerHTML.trim()) return alert('Get a recommendation first.');
    const list = JSON.parse(localStorage.getItem('dentalHistory') || '[]');
    list.push({ date: new Date().toLocaleString(), content: recommendBox.innerHTML });
    localStorage.setItem('dentalHistory', JSON.stringify(list));
    alert('Saved.');
  });

  $('#viewHistory')?.addEventListener('click', () => {
    const entries = JSON.parse(localStorage.getItem('dentalHistory') || '[]');
    historyBox.innerHTML = entries.length
      ? entries.map(e => `<div><strong>${e.date}</strong><br>${e.content}</div><hr>`).join('')
      : 'No saved history yet.';
    historyBox.classList.remove('hidden');
    historyBox.scrollIntoView({ behavior: 'smooth' });
  });

  $('#exportPDF')?.addEventListener('click', () => {
    if (!recommendBox.innerHTML.trim()) return alert('Get a recommendation first.');
    html2pdf().from(recommendBox).save('dental-check-result.pdf');
  });
});
