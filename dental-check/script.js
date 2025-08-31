import { getRecommendation, getDetailedRecommendation } from './logic.js';

window.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.getElementById('tooltip');
  const jawInput = document.getElementById('jawLocation');
  const recommendBtn = document.getElementById('recommendBtn');
  const recommendBox = document.getElementById('recommendation');

  // Load regions.json into SVG
  fetch('assets/regions.json')
    .then(res => res.json())
    .then(regions => {
      const svgObj = document.getElementById('jawSvg');
      svgObj.addEventListener('load', () => {
        const svgDoc = svgObj.contentDocument;

        Object.keys(regions).forEach(id => {
          const el = svgDoc.getElementById(id);
          if (el) {
            el.style.cursor = 'pointer';

            el.addEventListener('mouseenter', (e) => {
              const r = regions[id];
              tooltip.innerHTML = `<strong>${r.name}</strong><br>${r.hint}<br><small>Source: <a href="${r.link}" target="_blank">${r.source}</a></small>`;
              tooltip.style.left = (e.pageX + 10) + 'px';
              tooltip.style.top = (e.pageY + 10) + 'px';
              tooltip.classList.remove('hidden');
            });

            el.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));

            el.addEventListener('click', () => {
              jawInput.value = regions[id].name;
              jawInput.dataset.regionId = id;
            });
          }
        });
      });
    });

  // Handle recommendation
  recommendBtn.addEventListener('click', () => {
    const regionId = jawInput.dataset.regionId || '';
    const complaints = Array.from(document.querySelectorAll('.complaints input:checked')).map(el => el.value);

    if (!regionId || complaints.length === 0) {
      alert('Please select a region and at least one complaint.');
      return;
    }

    // Fetch SEO-friendly content
    const detailedSections = getDetailedRecommendation({ region: regionId, complaints });

    let html = `<h2>🦷 Dental Self-Check Results</h2>`;
    detailedSections.forEach(sec => {
      html += `<div class="recommend-section">
        <h3>${sec.title}</h3>
        <div class="recommend-content">${sec.content}</div>
      </div>`;
    });

    recommendBox.innerHTML = html;
    recommendBox.classList.remove('hidden');
  });
});
