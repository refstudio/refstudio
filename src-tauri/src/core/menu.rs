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
                    CustomMenuItem::new("refstudio://menu/settings", "Settings")
                        .accelerator("cmdOrControl+,"),
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
                .add_item(
                    CustomMenuItem::new("refstudio://menu/file/new", "New File")
                        .accelerator("cmdOrControl+N"),
                )
                .add_item(
                    CustomMenuItem::new("refstudio://menu/file/save", "Save")
                        .accelerator("cmdOrControl+S"),
                )
                .add_item(CustomMenuItem::new(
                    "refstudio://menu/file/markdown",
                    "Save File as Markdown...",
                ))
                .add_native_item(MenuItem::Separator)
                .add_item(CustomMenuItem::new(
                    "refstudio://menu/file/project/new",
                    "New Project",
                ))
                .add_item(CustomMenuItem::new(
                    "refstudio://menu/file/project/open",
                    "Open Project",
                ))
                .add_item(CustomMenuItem::new(
                    "refstudio://menu/file/project/close",
                    "Close Project",
                ))
                .add_native_item(MenuItem::Separator)
                .add_item(
                    CustomMenuItem::new("refstudio://menu/file/close", "Close Editor")
                        .accelerator("cmdOrControl+W"),
                )
                .add_item(CustomMenuItem::new(
                    "refstudio://menu/file/close/all",
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
                    CustomMenuItem::new("refstudio://menu/references/open", "Open")
                        .accelerator("cmdOrControl+R"),
                )
                .add_item(CustomMenuItem::new(
                    "refstudio://menu/references/upload",
                    "Upload...",
                )),
        );

        let view_menu = Submenu::new(
            "View",
            Menu::new()
                .add_native_item(MenuItem::EnterFullScreen)
                .add_item(
                    CustomMenuItem::new("refstudio://menu/view/notifications", "Notifications")
                        .accelerator("F11"),
                ),
        );

        let window_menu = Submenu::new(
            "Window",
            Menu::new()
                .add_native_item(MenuItem::Minimize)
                .add_native_item(MenuItem::Zoom),
        );

        #[allow(unused_mut)]
        let mut menu = Menu::new()
            .add_submenu(app_menu)
            .add_submenu(file_menu)
            .add_submenu(edit_menu)
            .add_submenu(references_menu)
            .add_submenu(view_menu)
            .add_submenu(window_menu);

        #[cfg(any(debug_assertions, feature = "devtools"))]
        {
            let debug_menu = Submenu::new(
                "Debug",
                Menu::new()
                    .add_item(
                        CustomMenuItem::new(
                            "refstudio://menu/debug/console/toggle",
                            "Toggle Console",
                        )
                        .accelerator("F12"),
                    )
                    .add_item(
                        CustomMenuItem::new(
                            "refstudio://menu/debug/console/clear",
                            "Clear Console",
                        )
                        .accelerator("Shift+F12"),
                    ),
            );

            menu = menu.clone().add_submenu(debug_menu);
        }

        return menu;
    }

    pub fn on_menu_event(event: WindowMenuEvent) {
        // Send all events to the app
        event.window().emit(event.menu_item_id(), {}).unwrap();

        match event.menu_item_id() {
            #[cfg(any(debug_assertions, feature = "devtools"))]
            "refstudio://menu/debug/console/toggle" => {
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
