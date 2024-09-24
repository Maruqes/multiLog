// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::thread::sleep;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn normal_func() {
    println!("normal_func");
}

#[tauri::command]
fn params_func(name: &str, age: i32) {
    println!("Hello, {}! You're {} years old!", name, age);
}

#[tauri::command]
fn test_ret_func(tpam: bool) -> Result<String, String> {
    if tpam {
        Err("Error: param is positive".to_string())
    } else {
        Ok("param is 0".to_string())
    }
}

#[tauri::command]
async fn async_func() -> String {
    sleep(std::time::Duration::from_secs(10));
    return "async_func".to_string();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            normal_func,
            params_func,
            test_ret_func,
            async_func
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
