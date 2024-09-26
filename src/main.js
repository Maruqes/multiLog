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

// Function to render tabs dynamically
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
  terminalContent.innerHTML = activeTab.content.replace(/\|ERR\|.*?\|ERR\|/g, match => `<span style="background-color: red; font-weight:bolder;">${match.replace(/\|ERR\|/g, '')}</span>`);

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
    console.error("Tab " + identifier + " does not exists");
    return;
  }

  indexToLoad = 0;
  if (activeTabIdentifier === identifier)
  {
    const index = tabs.findIndex(tab => tab.identifier === identifier);
    if (index > 0)
    {
      indexToLoad = index - 1;
    }
    else if (index + 1 < tabs.length)
    {
      indexToLoad = index + 1;
    }
  }

  tabs = tabs.filter(tab => tab.identifier !== identifier);

  if (tabs.length === 0)
  {
    renderTabs();
    return;
  }
  setActiveTab(tabs[indexToLoad].identifier);
}

function add_content(identifier, content)
{
  if (!checkIfTabExists(identifier))
  {
    console.error("Tab " + identifier + " does not exists");
    return;
  }

  const tab = tabs.find(tab => tab.identifier === identifier);
  if (tab)
  {
    tab.content += content;
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

});

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

