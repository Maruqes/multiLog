const { invoke } = window.__TAURI__.tauri;

let greetInputEl;
let greetMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});

invoke("normal_func")
invoke("params_func", { name: "value1", age: 12 })

invoke("test_ret_func", { tpam: true }).then((res) => {
  console.log(res)
}).catch((err) => {
  console.error(err)
})

invoke("async_func").then((res) => {
  console.log(res)
})