import { getDetailedRecommendation } from './logic.js';

const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

window.addEventListener('DOMContentLoaded', () => {
  const tooltip = $('#tooltip');
  const jawInput = $('#jawLocation');
  const recommendBox = $('#recommendation');
  const historyBox = $('#historyBox');
  const sumArea = $('#sumArea');
  const sumComplaints = $('#sumComplaints');

  // --- UTIL: update complaints summary whenever checkboxes change ---
  const syncComplaintsSummary = () => {
    const labels = $$('.complaints input:checked').map(el =>
      el.parentElement.textContent.trim()
    );
    sumComplaints && (sumComplaints.textContent = labels.length ? labels.join(', ') : '—');
  };
  $$('.complaints input').forEach(cb => cb.addEventListener('change', syncComplaintsSummary));

  // --- PRIMARY: Try INLINE SVG for reliable clicks ---
  const svgContainer = $('#inlineSvgContainer');
  const loadInlineSvg = async () => {
    try {
      const [svgText, regions] = await Promise.all([
        fetch('assets/jaw-map-advanced.svg').then(r => r.text()),
        fetch('assets/regions.json').then(r => r.json())
      ]);

      svgContainer.innerHTML = svgText;

      // attach handlers to ANY ids present in regions.json
      Object.keys(regions).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('region');

        el.addEventListener('mouseenter', (e) => {
          const r = regions[id];
          if (!r) return;
          tooltip.innerHTML = `<strong>${r.name}</strong><br>${r.hint}<br><small>Source: <a href="${r.link}" target="_blank" rel="noopener">${r.source}</a></small>`;
          // position inside the wrapper for consistent placement
          const wrapRect = svgContainer.getBoundingClientRect();
          tooltip.style.left = `${e.clientX - wrapRect.left + 10}px`;
          tooltip.style.top  = `${e.clientY - wrapRect.top + 10}px`;
          tooltip.classList.remove('hidden');
        });

        el.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));

        el.addEventListener('click', () => {
          // visual focus
          $$('.region').forEach(n => n.classList.remove('active'));
          el.classList.add('active');

          const r = regions[id];
          jawInput.value = r?.name || id;
          jawInput.dataset.regionId = id;

          // update "Your Inputs"
          sumArea && (sumArea.textContent = jawInput.value);
        });

        // keyboard accessibility
        el.setAttribute('tabindex', '0');
        el.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            el.click();
          }
        });
      });

      return true; // inline loaded ok
    } catch (e) {
      console.warn('Inline SVG failed, will try <object> fallback.', e);
      return false;
    }
  };

  // --- FALLBACK: old <object id="jawSvg"> approach if inline container missing/failed ---
  const loadObjectSvg = async () => {
    try {
      const regions = await fetch('assets/regions.json').then(r => r.json());
      const svgObj = $('#jawSvg');
      if (!svgObj) return false;

      svgObj.addEventListener('load', () => {
        const svgDoc = svgObj.contentDocument;
        if (!svgDoc) return;

        Object.keys(regions).forEach(id => {
          const el = svgDoc.getElementById(id);
          if (!el) return;
          el.style.cursor = 'pointer';

          el.addEventListener('mouseenter', (e) => {
            const r = regions[id];
            tooltip.innerHTML = `<strong>${r.name}</strong><br>${r.hint}<br><small>Source: <a href="${r.link}" target="_blank" rel="noopener">${r.source}</a></small>`;
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top  = `${e.pageY + 10}px`;
            tooltip.classList.remove('hidden');
          });

          el.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));

          el.addEventListener('click', () => {
            jawInput.value = regions[id].name;
            jawInput.dataset.regionId = id;
            sumArea && (sumArea.textContent = jawInput.value);
          });
        });
      });
      return true;
    } catch (e) {
      console.error('Object SVG load failed.', e);
      return false;
    }
  };

  (async () => {
    // Prefer inline SVG if container exists; else fallback to object.
    let ok = false;
    if (svgContainer) ok = await loadInlineSvg();
    if (!ok) await loadObjectSvg();
  })();

  // --- Generate recommendation (renders 4 clear sections) ---
  $('#recommendBtn')?.addEventListener('click', () => {
    const regionId = jawInput.dataset.regionId || '';
    const complaints = $$('.complaints input:checked').map(el => el.value);

    if (!regionId || complaints.length === 0) {
      alert('Please select a Tooth / Area and at least one complaint.');
      return;
    }

    // update inputs summary
    sumArea && (sumArea.textContent = jawInput.value);
    syncComplaintsSummary();

    // render results
    recommendBox.innerHTML = '';
    recommendBox.classList.add('hidden');

    const sections = getDetailedRecommendation({ region: regionId, complaints });

    // Ensure the four-lane structure shows explicitly in headings we pass from logic.js
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

    // accordion toggle + open all by default for clarity
    $$('.recommend-section h3', recommendBox).forEach((h3, idx) => {
      h3.addEventListener('click', () => h3.parentElement.classList.toggle('active'));
      h3.parentElement.classList.add('active'); // open all initially
    });

    recommendBox.scrollIntoView({ behavior: 'smooth' });
  });

  // --- Clear all ---
  $('#clearBtn')?.addEventListener('click', () => {
    // area
    jawInput.value = '';
    jawInput.dataset.regionId = '';
    sumArea && (sumArea.textContent = '—');
    $$('.region').forEach(n => n.classList.remove('active'));
    tooltip.classList.add('hidden');

    // complaints
    $$('.complaints input:checked').forEach(el => (el.checked = false));
    sumComplaints && (sumComplaints.textContent = '—');

    // results
    recommendBox.classList.add('hidden');
    recommendBox.innerHTML = '';
  });

  // --- Save / view / export ---
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

  // --- Flashcards (flashcards.json then fallback to tips.json) ---
  const loadTips = async () => {
    try {
      const r = await fetch('flashcards.json');
      if (r.ok) return r.json();
      throw new Error('flashcards not found');
    } catch {
      const r2 = await fetch('tips.json');
      return r2.ok ? r2.json() : [];
    }
  };

  loadTips().then(cards => {
    const box = $('#flashcardBox');
    if (!box) return;
    if (!cards?.length) { box.textContent = 'Tips will appear here.'; return; }
    let i = 0;
    const render = () => {
      const c = cards[i];
      box.innerHTML = `<strong>💡 ${c.question}</strong><br>${c.answer}<br><small>Source: <a href="${c.link}" target="_blank" rel="noopener">${c.source}</a></small>`;
    };
    render();
    setInterval(() => { i = (i + 1) % cards.length; render(); }, 10000);
  });
});

