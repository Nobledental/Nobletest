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

