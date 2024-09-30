const { invoke } = window.__TAURI__.tauri;
const { listen } = window.__TAURI__.event;

// Function to create a tab structure with unique identifiers
function create_tab_struct(identifier, content) {
  return {
    identifier: identifier,
    content: content
  };
}

let tabs = [];
let activeTabIdentifier = 0;

// Function to set the active tab
const setActiveTab = (identifier) => {
  if (!checkIfTabExists(identifier)) {
    console.error("Tab " + identifier + " does not exist");
    return;
  }

  activeTabIdentifier = identifier;
  renderTabs();
};

// Function to render tabs dynamically
const renderTabs = () => {
  const tabsContainer = document.getElementById("tabs");
  const terminalContent = document.getElementById("terminal-content");

  tabsContainer.innerHTML = ''; // Clear the container before rendering new tabs

  tabs.forEach((tab) => {
    const tabElement = document.createElement("button");
    tabElement.className = `flex items-center border-r border-gray-600 rounded-lg mr-2 ${activeTabIdentifier === tab.identifier
      ? "bg-gray-700 text-white active"
      : "bg-gray-800 text-gray-400 hover:bg-gray-600"
      }`;
    tabElement.style.padding = "10px";

    // Tab label
    const tabLabel = document.createElement("span");
    tabLabel.textContent = tab.identifier;
    tabElement.appendChild(tabLabel);

    // Close button
    const closeButton = document.createElement("span");
    closeButton.className = "ml-2 text-red-400 cursor-pointer";
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      remove_tab(tab.identifier);
    });
    tabElement.appendChild(closeButton);

    // Click event
    tabElement.addEventListener("click", () => setActiveTab(tab.identifier));

    tabsContainer.appendChild(tabElement);
  });

  // Display content of active tab
  const activeTab = tabs.find(tab => tab.identifier === activeTabIdentifier);

  // Sanitize the content
  let sanitizedContent = DOMPurify.sanitize(activeTab.content, {
    ALLOWED_ATTR: ['class', 'id'],
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'span'],
    ALLOW_UNKNOWN_PROTOCOLS: false
  });

  // Apply custom formatting after sanitizing the content
  let final_content = sanitizedContent.replace(/\|ERR\|.*?\|ERR\|/g, match => `<span style="background-color: red; font-weight: bolder;">${match.replace(/\|ERR\|/g, '')}</span>`);
  final_content = final_content.replace(/\|INFO\|.*?\|INFO\|/g, match => `<span style="color: rgb(137, 207, 240); font-weight: bolder;">${match.replace(/\|INFO\|/g, '')}</span>`);
  final_content = final_content.replace(/\|WARN\|.*?\|WARN\|/g, match => `<span style="color: rgb(255, 191, 0); font-weight: bolder;">${match.replace(/\|WARN\|/g, '')}</span>`);
  final_content = final_content.replace(/\|LOG\|.*?\|LOG\|/g, match => `<span style="">${match.replace(/\|LOG\|/g, '')}</span>`);

  terminalContent.innerHTML = final_content;
};

function checkIfTabExists(identifier) {
  return tabs.some(tab => tab.identifier === identifier);
}

function add_tab(identifier, content) {
  if (checkIfTabExists(identifier)) {
    console.error("Tab " + identifier + " already exists");
    return;
  }

  const newTab = create_tab_struct(identifier, content);
  tabs.push(newTab);
  setActiveTab(identifier);
}

function remove_tab(identifier) {
  if (!checkIfTabExists(identifier)) {
    console.error("Tab " + identifier + " does not exist");
    return;
  }

  const index = tabs.findIndex(tab => tab.identifier === identifier);

  if (activeTabIdentifier === identifier) {
    tabs = tabs.filter(tab => tab.identifier !== identifier);
    if (tabs.length > 0) {
      const newIndex = index > 0 ? index - 1 : 0;
      setActiveTab(tabs[newIndex].identifier);
    } else {
      activeTabIdentifier = 0;
      terminalContent.innerHTML = ''; // Clear terminal content when no tabs
      renderTabs();
    }
  } else {
    tabs = tabs.filter(tab => tab.identifier !== identifier);
    renderTabs();
  }
}



function add_content(identifier, content) {
  if (identifier !== 'All') {
    add_content('All', content);
  }
  if (!checkIfTabExists(identifier)) {
    console.error("Tab " + identifier + " does not exist");
    return;
  }

  const tab = tabs.find(tab => tab.identifier === identifier);
  if (tab) {
    const cur_date = new Date();
    const padZero = (num) => num.toString().padStart(2, '0');
    const cur_time = `${padZero(cur_date.getHours())}:${padZero(cur_date.getMinutes())}:${padZero(cur_date.getSeconds())}`;
    content = `${cur_time} | ${content}`;

    // Sanitize the content
    let sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_ATTR: ['class', 'id'],
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'span'],
      ALLOW_UNKNOWN_PROTOCOLS: false
    });

    // Append the sanitized content to the tab's existing content
    tab.content += `\n${sanitizedContent}`;

    // Re-render tabs with the sanitized content
    renderTabs();
  }
}

function listenFunctions() {
  listen("add_tab", (data) => {
    add_tab(data.payload[0], data.payload[1]);
  });

  listen("add_content", (data) => {
    add_content(data.payload[0], data.payload[1]);
  });

  listen("remove_tab_listen", (data) => {
    remove_tab(data.payload);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const initialTab = create_tab_struct('All', 'Here will show ALL the logs');
  tabs.push(initialTab);
  setActiveTab('All');
  listenFunctions();
  renderTabs();
  invoke("continue_execution");
});

// Search Functionality
let currentSearchIndex = -1;
let searchMatches = [];

function searchKeyword(keyword) {
  const terminalContent = document.getElementById("terminal-content");

  // Get the active tab content and apply custom formatting first
  const activeTab = tabs.find(tab => tab.identifier === activeTabIdentifier);
  let content = activeTab.content;

  // Apply original error/info/warn formatting
  let formattedContent = content.replace(/\|ERR\|.*?\|ERR\|/g, match => `<span style="background-color: red; font-weight: bolder;">${match.replace(/\|ERR\|/g, '')}</span>`);
  formattedContent = formattedContent.replace(/\|INFO\|.*?\|INFO\|/g, match => `<span style="color: rgb(137, 207, 240); font-weight: bolder;">${match.replace(/\|INFO\|/g, '')}</span>`);
  formattedContent = formattedContent.replace(/\|WARN\|.*?\|WARN\|/g, match => `<span style="color: rgb(255, 191, 0); font-weight: bolder;">${match.replace(/\|WARN\|/g, '')}</span>`);
  formattedContent = formattedContent.replace(/\|LOG\|.*?\|LOG\|/g, match => `<span style="">${match.replace(/\|LOG\|/g, '')}</span>`);

  // If no keyword is provided, just display the formatted content
  if (!keyword) {
    terminalContent.innerHTML = formattedContent;
    return;
  }

  // **Get visible text** by stripping HTML tags for the search
  const plainText = terminalContent.textContent || terminalContent.innerText;

  // Create a regex to find all matches of the keyword in the visible text
  const regex = new RegExp(keyword, 'gi');
  searchMatches = [];
  let match;

  // Search the plain text (without HTML) for keyword matches
  let matchIndex = 0;
  while ((match = regex.exec(plainText)) !== null) {
    searchMatches.push({ index: match.index, length: match[0].length, matchText: match[0] });
    matchIndex++;
  }

  // **Rebuild the final content with the original formatting**
  let finalContent = formattedContent;

  // Create a helper function to avoid modifying content within HTML tags
  const sanitizeContent = (content) => {
    let index = 0;
    finalContent = finalContent.replace(/>([^<]+)</g, (match, p1) => {
      // Only highlight the actual visible content between tags, not inside tags
      return `>${p1.replace(new RegExp(keyword, 'gi'), `<mark>${keyword}</mark>`)}<`;
    });
  };

  sanitizeContent(finalContent);

  // Set the content with both highlighting and original custom formatting
  terminalContent.innerHTML = finalContent;

  // Reset the search index and move to the first match
  currentSearchIndex = -1;
  goToNextMatch();
}


function goToNextMatch() {
  if (searchMatches.length === 0) {
    return;
  }

  currentSearchIndex = (currentSearchIndex + 1) % searchMatches.length;

  const terminalContent = document.getElementById("terminal-content");

  // Scroll to the highlighted match
  const contentElement = terminalContent.querySelectorAll("mark")[currentSearchIndex];
  if (contentElement) {
    contentElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function goToNextMatch() {
  if (searchMatches.length === 0) {
    return;
  }

  currentSearchIndex = (currentSearchIndex + 1) % searchMatches.length;

  const contentElement = searchMatches[currentSearchIndex];
  if (contentElement) {
    contentElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}


// Event listener for search input
document.getElementById('search-input').addEventListener('keyup', (event) => {
  const keyword = event.target.value;

  if (event.key === 'Enter') {
    goToNextMatch();
  } else {
    searchKeyword(keyword);
  }
});



const searchInput = document.getElementById('search-input');
searchInput.style.display = 'none';


