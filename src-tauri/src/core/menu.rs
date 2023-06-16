use tauri::utils::assets::EmbeddedAssets;
use tauri::{AboutMetadata, Context, CustomMenuItem, Menu, MenuItem, Submenu, WindowMenuEvent};
pub struct AppMenu {}

impl AppMenu {
    pub fn get_menu(context: &Context<EmbeddedAssets>) -> Menu {
        let name = &context.package_info().name;

        let app_menu = Submenu::new(
            "",
            Menu::new()
                .add_native_item(MenuItem::About(name.into(), AboutMetadata::new()))
                .add_native_item(MenuItem::Separator)
                .add_item(
                    CustomMenuItem::new("tauri://menu/settings".to_string(), "Settings")
                        .accelerator("Cmd+,"),
                )
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Services)
                .add_native_item(MenuItem::Hide)
                .add_native_item(MenuItem::HideOthers)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Quit),
        );

        // let file_menu = Submenu::new(
        //     "File",
        //     Menu::new()
        //         .add_item(CustomMenuItem::new("tauri://menu/file/new".to_string(), "New File..."))
        //         .add_item(CustomMenuItem::new("tauri://menu/file/close".to_string(), "Close File"))
        // );

        // let edit_menu = Submenu::new(
        //     "Edit",
        //     Menu::new()
        //         .add_native_item(MenuItem::Copy)
        //         .add_native_item(MenuItem::Paste)
        //         .add_native_item(MenuItem::Cut)
        //         .add_item(CustomMenuItem::new("undo".to_string(), "Undo"))
        //         .add_item(CustomMenuItem::new("redo".to_string(), "Redo")),
        // );

        let window_menu = Submenu::new(
            "Window",
            Menu::new()
                .add_native_item(MenuItem::Minimize)
                .add_native_item(MenuItem::Zoom)
                .add_native_item(MenuItem::CloseWindow)
                .add_native_item(MenuItem::EnterFullScreen),
        );

        Menu::new()
            .add_submenu(app_menu)
            // .add_submenu(file_menu)
            // .add_submenu(edit_menu)
            .add_submenu(window_menu)
    }

    pub fn on_menu_event(event: WindowMenuEvent) {
        // Send all events to the app
        event.window().emit(event.menu_item_id(), {}).unwrap();
        // match event.menu_item_id() {
        //     "tauri://menu/settings" => {
        //         println!("Settings");
        //         event.window().emit("settings", {}).unwrap();
        //     }
        //     _ => {}
        // }
    }
}
