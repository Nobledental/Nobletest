function shuffleCards(complaint) {
    const grid = document.getElementById('servicesGrid');
    const cards = Array.from(grid.children);

    // Convert the input to lower case for case-insensitive matching
    const lowerComplaint = complaint.toLowerCase();

    cards.sort((a, b) => {
        const aKeywords = a.dataset.keywords.toLowerCase();
        const bKeywords = b.dataset.keywords.toLowerCase();

        const aRelevant = aKeywords.includes(lowerComplaint);
        const bRelevant = bKeywords.includes(lowerComplaint);

        if (aRelevant && !bRelevant) return -1;  // a comes first
        if (!aRelevant && bRelevant) return 1;   // b comes first
        return 0;   // no change
    });

    // Re-append the sorted cards to the grid
    cards.forEach(card => {
        grid.appendChild(card);

        // Add redirection links to read more buttons to the individual services pages
        const button = card.querySelector('.read-more-button');
        const url = card.dataset.url;
        if (button && url) {
            button.href = url;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('servicesGrid');
    const cards = Array.from(grid.children);
    cards.forEach(card => {
        const button = card.querySelector('.read-more-button');
        const url = card.dataset.url;
        if (button && url) {
            button.href = url;
        }
    });

    // Sidebar toggle
    const menuIcon = document.querySelector('.menu-icon');
    const sidebar = document.querySelector('.sidebar');
    const closeIcon = document.querySelector('.close-icon');

    menuIcon.addEventListener('click', () => {
        sidebar.classList.add('open-sidebar');
        sidebar.classList.remove('close-sidebar');
    });

    closeIcon.addEventListener('click', () => {
        sidebar.classList.add('close-sidebar');
        sidebar.classList.remove('open-sidebar');
    });

    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Disable Ctrl/Cmd + keys and Shift key combinations
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (
            e.key === 'a' ||
            e.key === 'c' ||
            e.key === 'x' ||
            e.key === 'v' ||
            e.key === 's' ||
            e.key === 'p')) {
            e.preventDefault();
        }
    });

    // Disable copy option
    document.addEventListener('copy', function(e) {
        e.preventDefault();
    });
});
