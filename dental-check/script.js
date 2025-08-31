window.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.getElementById('tooltip');
  const jawInput = document.getElementById('jawLocation');

  fetch('assets/regions.json')
    .then(res => res.json())
    .then(regions => {
      const svgObject = document.getElementById('jawSvg');
      svgObject.addEventListener('load', () => {
        const svgDoc = svgObject.contentDocument;

        Object.keys(regions).forEach(id => {
          const el = svgDoc.getElementById(id);
          if (el) {
            el.style.cursor = 'pointer';

            el.addEventListener('mouseenter', (e) => {
              const { name, hint, source, link } = regions[id];
              tooltip.innerHTML = `<strong>${name}</strong><br>${hint}<br><small>🔗 <a href="${link}" target="_blank">${source}</a></small>`;
              tooltip.style.left = (e.pageX + 10) + 'px';
              tooltip.style.top = (e.pageY + 10) + 'px';
              tooltip.classList.remove('hidden');
            });

            el.addEventListener('mouseleave', () => {
              tooltip.classList.add('hidden');
            });

            el.addEventListener('click', () => {
              jawInput.value = regions[id].name;
            });
          }
        });
      });
    });
});


fetch("flashcards.json")
  .then(res => res.json())
  .then(cards => {
    let current = 0;
    const div = document.createElement('div');
    div.className = "flashcard";
    document.body.appendChild(div);

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
