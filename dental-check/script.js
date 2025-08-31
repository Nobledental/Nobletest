import { getDetailedRecommendation } from './logic.js';

const $ = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => Array.from(ctx.querySelectorAll(q));

window.addEventListener('DOMContentLoaded', () => {
  const tooltip = $('#tooltip');
  const jawInput = $('#jawLocation');
  const recommendBox = $('#recommendation');
  const historyBox = $('#historyBox');

  // load regions & wire SVG
  fetch('assets/regions.json')
    .then(r=>r.json())
    .then(regions=>{
      const svgObj = $('#jawSvg');
      svgObj.addEventListener('load', () => {
        const svgDoc = svgObj.contentDocument;
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
          el.addEventListener('mouseleave', ()=> tooltip.classList.add('hidden'));
          el.addEventListener('click', ()=>{
            // highlight selection
            $$('#jawSvg').forEach(()=>{}); // noop for safety
            jawInput.value = regions[id].name;
            jawInput.dataset.regionId = id;
          });
        });
      });
    });

  // generate recommendation
  $('#recommendBtn').addEventListener('click', () => {
    const regionId = jawInput.dataset.regionId || '';
    const complaints = $$('.complaints input:checked').map(el => el.value);

    if (!regionId || complaints.length === 0) {
      alert('Please click a region on the map and select at least one complaint.');
      return;
    }

    recommendBox.innerHTML = '';
    recommendBox.classList.add('hidden');

    const sections = getDetailedRecommendation({ region: regionId, complaints });

    let html = `<h2 class="recommend-title">🦷 Dental Self-Check Results</h2>`;
    sections.forEach(sec => {
      html += `
        <div class="recommend-section">
          <h3>${sec.title}</h3>
          <div class="recommend-content">${sec.content}</div>
        </div>`;
    });

    recommendBox.innerHTML = html;
    recommendBox.classList.remove('hidden');

    // accordion toggle
    $$('.recommend-section h3', recommendBox).forEach(h3 => {
      h3.addEventListener('click', () => h3.parentElement.classList.toggle('active'));
      // open first by default
      h3.parentElement === $$('.recommend-section', recommendBox)[0] && h3.parentElement.classList.add('active');
    });

    recommendBox.scrollIntoView({ behavior: 'smooth' });
  });

  // clear all
  $('#clearBtn').addEventListener('click', () => {
    jawInput.value = '';
    jawInput.dataset.regionId = '';
    $$('.complaints input:checked').forEach(el => el.checked = false);
    recommendBox.classList.add('hidden');
    recommendBox.innerHTML = '';
  });

  // save history
  $('#saveHistory').addEventListener('click', () => {
    if (!recommendBox.innerHTML.trim()) return alert('Get a recommendation first.');
    const list = JSON.parse(localStorage.getItem('dentalHistory') || '[]');
    list.push({ date: new Date().toLocaleString(), content: recommendBox.innerHTML });
    localStorage.setItem('dentalHistory', JSON.stringify(list));
    alert('Saved.');
  });

  // view history
  $('#viewHistory').addEventListener('click', () => {
    const entries = JSON.parse(localStorage.getItem('dentalHistory') || '[]');
    historyBox.innerHTML = entries.length
      ? entries.map(e => `<div><strong>${e.date}</strong><br>${e.content}</div><hr>`).join('')
      : 'No saved history yet.';
    historyBox.classList.remove('hidden');
    historyBox.scrollIntoView({ behavior: 'smooth' });
  });

  // export PDF
  $('#exportPDF').addEventListener('click', () => {
    if (!recommendBox.innerHTML.trim()) return alert('Get a recommendation first.');
    html2pdf().from(recommendBox).save('dental-check-result.pdf');
  });

  // flashcards → try flashcards.json then fallback to tips.json
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
    if (!cards?.length) { $('#flashcardBox').textContent = 'Tips will appear here.'; return; }
    let i = 0;
    const box = $('#flashcardBox');
    const render = () => {
      const c = cards[i];
      box.innerHTML = `<strong>💡 ${c.question}</strong><br>${c.answer}<br><small>Source: <a href="${c.link}" target="_blank" rel="noopener">${c.source}</a></small>`;
    };
    render();
    setInterval(()=>{ i = (i+1) % cards.length; render(); }, 10000);
  });
});

