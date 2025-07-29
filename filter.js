function shuffleCards(value) {
  const cards = document.querySelectorAll('.service-card');
  const keyword = value.toLowerCase();

  cards.forEach(card => {
    const keywords = card.dataset.keywords.toLowerCase();

    if (keywords.includes(keyword) || keyword === "") {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}
