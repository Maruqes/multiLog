// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, net::TcpListener, thread};

use tauri::{AppHandle, Manager};
mod server;

// #[tauri::command]
// fn normal_func() {
//     println!("normal_func");
// }

// #[tauri::command]
// fn params_func(name: &str, age: i32) {
//     println!("Hello, {}! You're {} years old!", name, age);
// }

// #[tauri::command]
// fn test_ret_func(tpam: bool) -> Result<String, String> {
//     if tpam {
//         Err("Error: param is positive".to_string())
//     } else {
//         Ok("param is 0".to_string())
//     }
// }

// #[tauri::command]
// async fn async_func() -> String {
//     sleep(std::time::Duration::from_secs(10));
//     return "async_func".to_string();
// }

fn main() {
    // // Retrieve the command line arguments
    // let args: Vec<String> = env::args().collect();

    // // Check if the port number is provided
    // if args.len() < 2 {
    //     eprintln!("Usage: {} <port>", args[0]);
    //     std::process::exit(1);
    // }

    // // Parse the port number
    // let port = args[1].clone();

    // if port.parse::<u16>().is_err() {
    //     eprintln!("Invalid port number: {}", port);
    //     std::process::exit(1);
    // }

    // let port_num: u16 = port.parse().expect("Invalid port number");
    // if port_num < 1024 || port_num > 64000 {
    //     eprintln!(
    //         "Port number out of range: {}\nIt should be < 1024 && > 64000",
    //         port_num
    //     );
    //     std::process::exit(1);
    // }

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle();
            // Start the TCP server with the provided port
            // server::start_server(app_handle, port.clone());
            server::start_server(app_handle, "42850".to_string());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // normal_func,
            // params_func,
            // test_ret_func,
            // async_func,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
