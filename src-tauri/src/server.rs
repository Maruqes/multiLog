// src-tauri/src/server.rs
use base64;
use std::io::{BufRead, BufReader, BufWriter, Write};
use std::sync::{Arc, Mutex};
use std::{net::TcpListener, thread};
use tauri::{AppHandle, Manager};

// Define a global writer
lazy_static::lazy_static! {
    static ref GLOBAL_WRITER: Arc<Mutex<Option<BufWriter<std::net::TcpStream>>>> = Arc::new(Mutex::new(None));
}

fn add_tab(app_handle: &AppHandle, identifier: &str, content: &str) {
    app_handle
        .emit_all("add_tab", (identifier, content))
        .unwrap();
}

fn add_content(app_handle: &AppHandle, identifier: &str, content: &str) {
    app_handle
        .emit_all("add_content", (identifier, content))
        .unwrap();
}

fn remove_tab(app_handle: &AppHandle, identifier: &str) {
    app_handle
        .emit_all("remove_tab_listen", identifier)
        .unwrap();
}

pub fn send_message(message: &str) {
    let mut writer = GLOBAL_WRITER.lock().unwrap();
    if let Some(writer) = writer.as_mut() {
        writeln!(writer, "{}", message).unwrap();
        writer.flush().unwrap();
    } else {
        eprintln!("Writer is not initialized");
    }
}

pub fn start_server(app_handle: AppHandle, port: String) {
    thread::spawn(move || {
        let listener = TcpListener::bind(format!("127.0.0.1:{}", port)).expect("Could not bind");
        println!("Server listening on port {}", port);
        for stream in listener.incoming() {
            match stream {
                Ok(stream) => {
                    println!("Connection established: {:?}", stream);
                    let app_handle = app_handle.clone();
                    let writer = BufWriter::new(stream.try_clone().unwrap());
                    *GLOBAL_WRITER.lock().unwrap() = Some(writer);

                    thread::spawn(move || {
                        let reader = BufReader::new(stream);
                        for line in reader.lines() {
                            match line {
                                Ok(message) => {
                                    let parts: Vec<&str> = message.splitn(3, ' ').collect();
                                    match parts[0] {
                                        "add_tab" => {
                                            let contentb64 = parts[2];
                                            let content = base64::decode(contentb64).unwrap();
                                            let content_str = String::from_utf8(content).unwrap();
                                            add_tab(&app_handle, parts[1], &content_str);
                                        }
                                        "add_content" => {
                                            let contentb64 = parts[2];
                                            let content = base64::decode(contentb64).unwrap();
                                            let content_str = String::from_utf8(content).unwrap();
                                            add_content(&app_handle, parts[1], &content_str);
                                        }
                                        "remove_tab" => {
                                            remove_tab(&app_handle, parts[1]);
                                        }
                                        _ => {
                                            eprintln!("Invalid message: {}", message);
                                        }
                                    }
                                }
                                Err(e) => {
                                    eprintln!("Failed to read from connection: {}", e);
                                    break;
                                }
                            }
                        }
                    });
                }
                Err(e) => {
                    eprintln!("Connection failed: {}", e);
                }
            }
        }
    });
}
