// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str, sender: &str) -> String {
    format!(
        "Hello, {}! You've been greeted from Rust! Signed, {}",
        name, sender
    )
}

#[tauri::command]
fn interact_with_ai(selection: &str) -> String {
    format!("{}: {}", selection.len(), selection.to_uppercase())
}

use tauri::Manager;
use std::env;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let dev_tools_visible = env::var("DEV_TOOLS").is_ok();
                if dev_tools_visible {
                    app.get_window("main").unwrap().open_devtools();
                };
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler!(interact_with_ai))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}