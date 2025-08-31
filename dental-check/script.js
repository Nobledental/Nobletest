import { getRecommendation } from './logic.js';

window.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.getElementById('tooltip');
  const jawInput = document.getElementById('jawLocation');
  const recommendBtn = document.getElementById('recommendBtn');
  const recommendBox = document.getElementById('recommendation');

  // Load regions
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

  // Flashcard Loader
  fetch("flashcards.json")
    .then(res => res.json())
    .then(cards => {
      let current = 0;
      const div = document.getElementById('flashcardBox');

      function showCard(i) {
        const card = cards[i];
        div.innerHTML = `<strong>💡 ${card.question}</strong><br>${card.answer}<br><small>Source: <a href="${card.link}" target="_blank">${card.source}</a></small>`;
      }

      showCard(current);
      setInterval(() => {
        current = (current + 1) % cards.length;
        showCard(current);
      }, 10000);
    });

  // Recommendation Handler
  recommendBtn.addEventListener('click', () => {
    const regionId = jawInput.dataset.regionId || '';
    const symptoms = Array.from(document.querySelectorAll('.symptoms input:checked')).map(el => el.value);
    if (!regionId || symptoms.length === 0) {
      alert('Please select a region and at least one symptom.');
      return;
    }

    const result = getRecommendation({ region: regionId, symptoms });
    recommendBox.innerHTML = `<p>${result.text}</p><p><strong>${result.level}</strong><br>Source: <a href="${result.link}" target="_blank">${result.source}</a></p>`;
    recommendBox.classList.remove('hidden');
  });
});

