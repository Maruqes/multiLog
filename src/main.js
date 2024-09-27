const { invoke } = window.__TAURI__.tauri;
const { listen } = window.__TAURI__.event;

// Function to create a tab structure with unique identifiers
function create_tab_struct(identifier, content)
{
  return {
    identifier: identifier,
    content: content
  };
}

let tabs = [];
let activeTabIdentifier = 0;

// Function to set the active tab
const setActiveTab = (identifier) =>
{
  if (!checkIfTabExists(identifier))
  {
    console.error("Tab " + identifier + " does not exists");
    return;
  }

  activeTabIdentifier = identifier;
  renderTabs();
};

const renderTabs = () =>
{
  const tabsContainer = document.getElementById("tabs");
  const terminalContent = document.getElementById("terminal-content");

  tabsContainer.innerHTML = ''; // Clear the container before rendering new tabs

  tabs.forEach(tab =>
  {
    const tabElement = document.createElement("button");
    tabElement.className = `border-r border-gray-600 ${activeTabIdentifier === tab.identifier ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-600'}`;
    tabElement.style.padding = "10px"; // Adjust padding dynamically
    tabElement.style.fontSize = `${tabFontSize}px`; // Set the font size dynamically
    tabElement.innerHTML = `${tab.identifier} <span class="ml-2 text-red-400 cursor-pointer" onclick="remove_tab('${tab.identifier}')">&times;</span>`;
    tabElement.onclick = () => setActiveTab(tab.identifier);
    tabsContainer.appendChild(tabElement);
  });

  // Display content of active tab
  const activeTab = tabs.find(tab => tab.identifier === activeTabIdentifier);

  // Sanitize the content and remove inline styles
  let sanitizedContent = DOMPurify.sanitize(activeTab.content, {
    ALLOWED_ATTR: ['class', 'id'], // Allow only 'class' and 'id' attributes
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'span'], // Allow basic formatting tags
    ALLOW_UNKNOWN_PROTOCOLS: false
  });

  // Apply custom formatting after sanitizing the content
  let final_content = sanitizedContent.replace(/\|ERR\|.*?\|ERR\|/g, match => `<span style="background-color: red; font-weight: bolder;">${match.replace(/\|ERR\|/g, '')}</span>`);
  final_content = final_content.replace(/\|INFO\|.*?\|INFO\|/g, match => `<span style="color: rgb(137, 207, 240); font-weight: bolder;">${match.replace(/\|INFO\|/g, '')}</span>`);
  final_content = final_content.replace(/\|WARN\|.*?\|WARN\|/g, match => `<span style="color: rgb(255, 191, 0); font-weight: bolder;">${match.replace(/\|WARN\|/g, '')}</span>`);

  terminalContent.innerHTML = final_content;
};



function checkIfTabExists(identifier)
{
  return tabs.some(tab => tab.identifier === identifier);
}

function add_tab(identifier, content)
{
  if (checkIfTabExists(identifier))
  {
    console.error("Tab " + identifier + " already exists");
    return;
  }

  const newTab = create_tab_struct(identifier, content);
  tabs.push(newTab);
  setActiveTab(identifier);
}

function remove_tab(identifier)
{
  if (!checkIfTabExists(identifier))
  {
    console.error("Tab " + identifier + " does not exist");
    return;
  }

  const index = tabs.findIndex(tab => tab.identifier === identifier);

  if (activeTabIdentifier === identifier)
  {
    let indexToLoad = 0;
    if (index > 0)
    {
      indexToLoad = index - 1;
    } else if (index + 1 < tabs.length)
    {
      indexToLoad = index + 1;
    }
    tabs = tabs.filter(tab => tab.identifier !== identifier);
    if (tabs.length > 0)
    {
      setActiveTab(tabs[indexToLoad].identifier);
    } else
    {
      activeTabIdentifier = 0;
      renderTabs();
    }
  } else
  {
    tabs = tabs.filter(tab => tab.identifier !== identifier);
    renderTabs();
  }
}

function add_content(identifier, content)
{
  if (!checkIfTabExists(identifier))
  {
    console.error("Tab " + identifier + " does not exist");
    return;
  }

  const tab = tabs.find(tab => tab.identifier === identifier);
  if (tab)
  {
    const cur_date = new Date();
    const padZero = (num) => num.toString().padStart(2, '0');
    const cur_time = `${padZero(cur_date.getHours())}:${padZero(cur_date.getMinutes())}:${padZero(cur_date.getSeconds())}`;
    content = `${cur_time} | ${content}`;

    // Sanitize the content and remove any inline styles using DOMPurify
    let sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_ATTR: ['class', 'id'], // Allow only 'class' and 'id' attributes
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'span'], // Allow basic formatting tags
      ALLOW_UNKNOWN_PROTOCOLS: false
    });

    // Append the sanitized content to the tab's existing content
    tab.content += sanitizedContent;

    // Re-render tabs with the sanitized content
    renderTabs();
  }
}




function listenFunctions()
{
  //example of data -> [Log] {event: "add_tab", windowLabel: null, payload: ["test_identifier", "test_content"], id: 2973177445} 
  listen("add_tab", (data) =>
  {
    add_tab(data.payload[0], data.payload[1]);
  });

  listen("add_content", (data) =>
  {
    add_content(data.payload[0], data.payload[1]);
  });

  listen("remove_tab_listen", (data) =>
  {
    remove_tab(data.payload);
  });
}

document.addEventListener("DOMContentLoaded", function ()
{
  const initialTab = create_tab_struct('tab-1', 'Initial Tab', 'Welcome to the first tab');
  tabs.push(initialTab);
  setActiveTab('tab-1');
  listenFunctions();
  renderTabs();
  invoke("continue_execution");
  add_content("tab-1", "|ERR|err|ERR|")
});



let currentSearchIndex = -1;
let searchMatches = [];

function searchKeyword(keyword)
{
  const terminalContent = document.getElementById("terminal-content");

  // Get the active tab content and apply custom formatting first
  const activeTab = tabs.find(tab => tab.identifier === activeTabIdentifier);
  let content = activeTab.content;

  // Apply original error/info/warn formatting
  let formattedContent = content.replace(/\|ERR\|.*?\|ERR\|/g, match => `<span style="background-color: red; font-weight: bolder;">${match.replace(/\|ERR\|/g, '')}</span>`);
  formattedContent = formattedContent.replace(/\|INFO\|.*?\|INFO\|/g, match => `<span style="color: rgb(137, 207, 240); font-weight: bolder;">${match.replace(/\|INFO\|/g, '')}</span>`);
  formattedContent = formattedContent.replace(/\|WARN\|.*?\|WARN\|/g, match => `<span style="color: rgb(255, 191, 0); font-weight: bolder;">${match.replace(/\|WARN\|/g, '')}</span>`);

  // If no keyword is provided, just display the formatted content
  if (!keyword)
  {
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
  while ((match = regex.exec(plainText)) !== null)
  {
    searchMatches.push({ index: match.index, length: match[0].length, matchText: match[0] });
    matchIndex++;
  }

  // **Rebuild the final content with the original formatting**
  let finalContent = formattedContent;

  // Create a helper function to avoid modifying content within HTML tags
  const sanitizeContent = (content) =>
  {
    let index = 0;
    finalContent = finalContent.replace(/>([^<]+)</g, (match, p1) =>
    {
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


function goToNextMatch()
{
  if (searchMatches.length === 0)
  {
    return;
  }

  currentSearchIndex = (currentSearchIndex + 1) % searchMatches.length;

  const terminalContent = document.getElementById("terminal-content");

  // Scroll to the highlighted match
  const contentElement = terminalContent.querySelectorAll("mark")[currentSearchIndex];
  if (contentElement)
  {
    contentElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Event listener for search input
document.getElementById('search-input').addEventListener('keyup', (event) =>
{
  const keyword = event.target.value;

  if (event.key === 'Enter')
  {
    goToNextMatch();
  } else
  {
    searchKeyword(keyword);
  }
});



const searchInput = document.getElementById('search-input');
searchInput.style.display = 'none';


// invoke("normal_func");

// invoke("params_func", { name: "value1", age: 12 });

// invoke("test_ret_func", { tpam: true }).then((res) =>
// {
//   console.log(res);
// }).catch((err) =>
// {
//   console.error(err);
// });

// invoke("async_func").then((res) =>
// {
//   console.log(res);

//   tabs[0].content = res;
//   renderTabs();
// });

