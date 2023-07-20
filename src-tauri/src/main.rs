// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_environment_variable(name: &str) -> String {
    std::env::var(name).unwrap_or_else(|_| "".to_string())
}

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.hide().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

use dotenv::dotenv;
use std::env;

// Prevent build warning for tauri::Manager
#[allow(unused_imports)]
use tauri::Manager;

mod core;

fn main() {
    dotenv().ok();

    let context = tauri::generate_context!();

    tauri::Builder::default()
        .setup(|_app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let dev_tools_visible = env::var("DEV_TOOLS").is_ok();
                if dev_tools_visible {
                    _app.get_window("splashscreen").unwrap().open_devtools();
                    _app.get_window("main").unwrap().open_devtools();
                };
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            get_environment_variable
        ])
        .menu(core::menu::AppMenu::get_menu(&context))
        .on_menu_event(core::menu::AppMenu::on_menu_event)
        .run(context)
        .expect("error while running tauri application");
}
