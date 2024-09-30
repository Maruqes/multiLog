let fontSize = 16;
window.tabFontSize = window.tabFontSize || 16; // Initialize tab font size

function adjustFontSize(change) {
    const terminalContent = document.getElementById('terminal-content');
    fontSize += change;
    terminalContent.style.fontSize = `${fontSize}px`;
}

function adjustTabFontSize(change) {
    const tabsElements = document.querySelectorAll('#tabs button'); // Select all tab buttons
    window.tabFontSize += change;
    tabsElements.forEach(tab => {
        tab.style.fontSize = `${window.tabFontSize}px`;
    });
}

// Handle CTRL + and CTRL - for zooming
document.addEventListener('keydown', (event) => {
    const searchInput = document.getElementById('search-input');

    if (event.key === 'Escape') {
        searchInput.style.display = 'none';
        searchInput.value = '';
        searchKeyword('');
    }

    if (event.ctrlKey) {
        if (event.key === '+' || event.key === '=') { // CTRL + for zoom in
            adjustFontSize(2);
            adjustTabFontSize(2);
            event.preventDefault();
        } else if (event.key === '-') { // CTRL - for zoom out
            adjustFontSize(-2);
            adjustTabFontSize(-2);
            event.preventDefault();
        } else if (event.key.toLowerCase() === 'f') { // CTRL + F for search
            searchInput.style.display = 'block';
            searchInput.focus();
            event.preventDefault();
        }
    }

    if (event.altKey) {
        if (event.key >= "1" && event.key <= "9") {
            const keyInt = parseInt(event.key);
            if (keyInt - 1 < tabs.length) {
                setActiveTab(tabs[keyInt - 1].identifier);
            }
        }
    }
});

adjustFontSize(0);      // Set initial font size
adjustTabFontSize(0); 