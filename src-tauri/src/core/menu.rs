use tauri::utils::assets::EmbeddedAssets;
use tauri::{AboutMetadata, Context, CustomMenuItem, Menu, MenuItem, Submenu, WindowMenuEvent};
pub struct AppMenu {}

const MENU_SETTINGS: &str = /*            */ "refstudio://menu/settings";
const MENU_REFERENCES_OPEN: &str = /*     */ "refstudio://menu/references/open";
const MENU_REFERENCES_UPLOAD: &str = /*   */ "refstudio://menu/references/upload";
const MENU_FILE_SAVE: &str = /*           */ "refstudio://menu/file/save";
const MENU_FILE_NEW: &str = /*            */ "refstudio://menu/file/new";
const MENU_FILE_CLOSE: &str = /*          */ "refstudio://menu/file/close";
const MENU_FILE_CLOSE_ALL: &str = /*      */ "refstudio://menu/file/close/all";
const MENU_VIEW_NOTIFICATIONS: &str = /*  */ "refstudio://menu/view/notifications";
const MENU_DEBUG_CONSOLE_TOGGLE: &str = /**/ "refstudio://menu/debug/console/toggle";
const MENU_DEBUG_CONSOLE_CLEAR: &str = /* */ "refstudio://menu/debug/console/clear";

impl AppMenu {
    pub fn get_menu(context: &Context<EmbeddedAssets>) -> Menu {
        let name = &context.package_info().name;

        let app_menu = Submenu::new(
            "",
            Menu::new()
                .add_native_item(MenuItem::About(name.into(), AboutMetadata::new()))
                .add_native_item(MenuItem::Separator)
                .add_item(
                    CustomMenuItem::new(MENU_SETTINGS, "Settings").accelerator("cmdOrControl+,"),
                )
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
                .add_native_item(MenuItem::Separator)
                .add_item(
                    CustomMenuItem::new(MENU_FILE_CLOSE, "Close Editor")
                        .accelerator("cmdOrControl+W"),
                )
                .add_item(CustomMenuItem::new(
                    MENU_FILE_CLOSE_ALL,
                    "Close All Editors",
                )),
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
                .add_item(
                    CustomMenuItem::new(MENU_REFERENCES_OPEN, "Open").accelerator("cmdOrControl+R"),
                )
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

        let menu = Menu::new()
            .add_submenu(app_menu)
            .add_submenu(file_menu)
            .add_submenu(edit_menu)
            .add_submenu(references_menu)
            .add_submenu(view_menu)
            .add_submenu(window_menu);

        #[cfg(debug_assertions)]
        {
            let debug_menu = Submenu::new(
                "Debug",
                Menu::new()
                    .add_item(
                        CustomMenuItem::new(MENU_DEBUG_CONSOLE_TOGGLE, "Toggle Console")
                            .accelerator("F12"),
                    )
                    .add_item(
                        CustomMenuItem::new(MENU_DEBUG_CONSOLE_CLEAR, "Clear Console")
                            .accelerator("Shift+F12"),
                    ),
            );
            return menu.clone().add_submenu(debug_menu);
        }
    }

    pub fn on_menu_event(event: WindowMenuEvent) {
        // Send all events to the app
        event.window().emit(event.menu_item_id(), {}).unwrap();

        match event.menu_item_id() {
            MENU_DEBUG_CONSOLE_TOGGLE => {
                if event.window().is_devtools_open() {
                    event.window().close_devtools();
                } else {
                    event.window().open_devtools();
                    event.window().set_focus().unwrap();
                }
            }
            _ => {}
        }
    }
}
