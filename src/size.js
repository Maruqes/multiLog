// Initial font sizes
let fontSize = 18;
let tabFontSize = 18; // For tabs

// Zoom in and out function for terminal content
function adjustFontSize(change)
{
    const terminalContent = document.getElementById('terminal-content');
    fontSize += change;
    terminalContent.style.fontSize = `${fontSize}px`;
    console.log(fontSize);
}

// Zoom in and out function for tab text
function adjustTabFontSize(change)
{
    const tabs = document.querySelectorAll('#tabs button'); // Select all tab buttons
    tabFontSize += change;
    tabs.forEach(tab =>
    {
        tab.style.fontSize = `${tabFontSize}px`;
    });
}

// Handle CTRL + and CTRL - for zooming
document.addEventListener('keydown', (event) =>
{

    if (event.key === 'Escape')
    {
        const searchInput = document.getElementById('search-input');
        searchInput.style.display = 'none';
    }

    if (event.ctrlKey)
    {
        if (event.key === '+' || event.key === '=')
        { // CTRL + for zoom in
            adjustFontSize(2);
            adjustTabFontSize(2);
            event.preventDefault();
        } else if (event.key === '-')
        { // CTRL - for zoom out
            adjustFontSize(-2);
            adjustTabFontSize(-2);
            event.preventDefault();
        } if (event.key === 'f')
        {
            const searchInput = document.getElementById('search-input');
            searchInput.style.display = 'block';
            searchInput.focus();
        }
    }

    if (event.altKey)
    {
        if (event.key >= "0" && event.key <= "9")
        {
            keyInt = parseInt(event.key);
            setActiveTab(tabs[keyInt - 1].identifier);
        }
    }
});

adjustFontSize(0); // Set initial font size
