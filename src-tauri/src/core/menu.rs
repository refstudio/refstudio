use tauri::utils::assets::EmbeddedAssets;
use tauri::{AboutMetadata, Context, CustomMenuItem, Menu, MenuItem, Submenu, WindowMenuEvent};
pub struct AppMenu {}

const MENU_SETTINGS: &str = "refstudio://menu/settings";
const MENU_REFERENCES_OPEN: &str = "refstudio://menu/references/open";
const MENU_REFERENCES_UPLOAD: &str = "refstudio://menu/references/upload";
const MENU_FILE_SAVE: &str = "refstudio://menu/file/save";
const MENU_FILE_NEW: &str = "refstudio://menu/file/new";
const MENU_FILE_CLOSE: &str = "refstudio://menu/file/close";
const MENU_VIEW_NOTIFICATIONS: &str = "refstudio://menu/view/notifications";

impl AppMenu {
    pub fn get_menu(context: &Context<EmbeddedAssets>) -> Menu {
        let name = &context.package_info().name;

        let app_menu = Submenu::new(
            "",
            Menu::new()
                .add_native_item(MenuItem::About(name.into(), AboutMetadata::new()))
                .add_native_item(MenuItem::Separator)
                .add_item(CustomMenuItem::new(MENU_SETTINGS, "Settings").accelerator("Cmd+,"))
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Services)
                .add_native_item(MenuItem::Hide)
                .add_native_item(MenuItem::HideOthers)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Quit),
        );

        let file_menu = Submenu::new(
            "File",
            Menu::new()
                .add_item(CustomMenuItem::new(MENU_FILE_SAVE, "Save").accelerator("cmdOrControl+S"))
                .add_item(
                    CustomMenuItem::new(MENU_FILE_NEW, "New File").accelerator("cmdOrControl+N"),
                )
                .add_item(
                    CustomMenuItem::new(MENU_FILE_CLOSE, "Close Editor")
                        .accelerator("cmdOrControl+W"),
                ),
        );

        let edit_menu = Submenu::new(
            "Edit",
            Menu::new()
                .add_native_item(MenuItem::Undo)
                .add_native_item(MenuItem::Redo)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Cut)
                .add_native_item(MenuItem::Copy)
                .add_native_item(MenuItem::Paste)
                .add_native_item(MenuItem::SelectAll),
        );

        let references_menu = Submenu::new(
            "References",
            Menu::new()
                .add_item(CustomMenuItem::new(MENU_REFERENCES_OPEN, "Open").accelerator("Cmd+R"))
                .add_item(CustomMenuItem::new(MENU_REFERENCES_UPLOAD, "Upload...")),
        );

        let view_menu = Submenu::new(
            "View",
            Menu::new()
                .add_native_item(MenuItem::EnterFullScreen)
                .add_item(
                    CustomMenuItem::new(MENU_VIEW_NOTIFICATIONS, "Notifications")
                        .accelerator("F11"),
                ),
        );

        let window_menu = Submenu::new(
            "Window",
            Menu::new()
                .add_native_item(MenuItem::Minimize)
                .add_native_item(MenuItem::Zoom),
        );

        Menu::new()
            .add_submenu(app_menu)
            .add_submenu(file_menu)
            .add_submenu(edit_menu)
            .add_submenu(references_menu)
            .add_submenu(view_menu)
            .add_submenu(window_menu)
    }

    pub fn on_menu_event(event: WindowMenuEvent) {
        // Send all events to the app
        event.window().emit(event.menu_item_id(), {}).unwrap();
        // match event.menu_item_id() {
        //     "refstudio://menu/settings" => {
        //         println!("Settings");
        //         event.window().emit("settings", {}).unwrap();
        //     }
        //     _ => {}
        // }
    }
}
