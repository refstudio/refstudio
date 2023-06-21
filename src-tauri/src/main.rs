// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_environment_variable(name: &str) -> String {
    std::env::var(name).unwrap_or_else(|_| "".to_string())
}

use dotenv::dotenv;
use std::env;
use tauri::Manager;

mod core;

fn main() {
    dotenv().ok();

    let context = tauri::generate_context!();

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
        .invoke_handler(tauri::generate_handler![get_environment_variable])
        .menu(core::menu::AppMenu::get_menu(&context))
        .on_menu_event(core::menu::AppMenu::on_menu_event)
        .run(context)
        .expect("error while running tauri application");
}
