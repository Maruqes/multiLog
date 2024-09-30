// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
mod server;

#[tauri::command]
fn continue_execution() {
    server::send_message("continue_execution");
}

fn main() {
    // Retrieve the command line arguments
    let args: Vec<String> = env::args().collect();

    // Check if the port number and path are provided
    if args.len() < 2 {
        eprintln!("Usage: {} <port> <path>", args[0]);
        std::process::exit(1);
    }

    // Parse the port number
    let port = args[1].clone();

    let port_num: u16 = match port.parse() {
        Ok(num) => num,
        Err(_) => {
            eprintln!("Invalid port number: {}", port);
            std::process::exit(1);
        }
    };

    if port_num < 1024 || port_num > 64000 {
        eprintln!(
            "Port number out of range: {}. It should be between 1024 and 64000.",
            port_num
        );
        std::process::exit(1);
    }

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle();
            server::start_server(app_handle, port);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![continue_execution])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
