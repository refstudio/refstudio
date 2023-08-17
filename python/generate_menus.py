"""Generate menu.rs and menu.tsx from menu.json"""

import json
import subprocess


def rust_for_item(item):
    typ = item['type']
    if typ == 'native':
        nativeItem = item['nativeMenuItem']
        if nativeItem == 'About':
            return '.add_native_item(MenuItem::About(name.into(), AboutMetadata::new()))'
        return f'.add_native_item(MenuItem::{nativeItem})'
    elif typ == 'separator':
        return '.add_native_item(MenuItem::Separator)'
    elif typ == 'custom':
        item_id = item['id']
        title = item['title']
        code = f'.add_item(CustomMenuItem::new("{item_id}", "{title}")'
        accel = item.get('accelerator')
        if accel:
            code += f'.accelerator("{accel}")'
        code += ')'
        return code
    assert ValueError(typ)


def generate_rust(menus):
    lines = []
    menu_vars = []
    for i, menu in enumerate(menus):
        title = menu['title']
        var_name = title.replace(r' ', '_').lower() + '_menu' if title else 'app_menu'
        lines += [
            f'let {var_name} = Submenu::new(',
            f'"{title}",',
            'Menu::new()',
            *[
                rust_for_item(item)
                for item in menu['items']
            ],
            ');',
            '',
        ]
        menu_vars.append(var_name)

    lines += [
        '#[allow(unused_mut)]',
        'let mut menu = Menu::new()',
        *[
            f'.add_submenu({menu_var})'
            for menu_var in menu_vars
        ]
    ]
    lines.append(';')
    menu_code = '\n'.join(lines)

    return '''// THIS FILE IS GENERATED. Edit menu.json instead.
use tauri::utils::assets::EmbeddedAssets;
use tauri::{AboutMetadata, Context, CustomMenuItem, Menu, MenuItem, Submenu, WindowMenuEvent};
pub struct AppMenu {}

impl AppMenu {
    pub fn get_menu(context: &Context<EmbeddedAssets>) -> Menu {
        let name = &context.package_info().name;
        {menu_code}

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
    '''.replace('{menu_code}', menu_code)



def typescript_for_item(item):
    typ = item['type']
    if typ == 'native':
        nativeItem = item['nativeMenuItem']
        return f'<NativeMenuItem item="{nativeItem}" />'
    elif typ == 'separator':
        return '<MenuSeparator />'
    elif typ == 'custom':
        item_id = item['id']
        title = item['title']
        code = f'<MenuItem id="{item_id}" title="{title}" '
        accel = item.get('accelerator')
        if accel:
            code += f'accelerator="{accel}" '
        code += ' />'
        return code
    assert ValueError(typ)


def generate_typescript(menus):
    lines = [
        '<MenuBar>'
    ]
    for i, menu in enumerate(menus):
        title = menu['title']
        lines += [
            f'<Menu title="{title}">',
            *[
                typescript_for_item(item)
                for item in menu['items']
            ],
            '</Menu>',
        ]

    lines.append('</MenuBar>')
    menu_code = '\n'.join(lines)

    return '''// THIS FILE IS GENERATED. Edit menu.json instead.
import React from 'react';

declare const MenuBar: React.ComponentType<any>;
declare const Menu: React.ComponentType<any>;
declare const NativeMenuItem: React.ComponentType<any>;
declare const MenuSeparator: React.ComponentType<any>;
declare const MenuItem: React.ComponentType<any>;

export function AppMenu() {
    {menu_code}
}
    '''.replace('{menu_code}', menu_code)

if __name__ == '__main__':
    menu_json = json.load(open('menu.json'))
    menus = menu_json['menus']

    menu_rs = generate_rust(menus)
    with open('src-tauri/src/core/menu.rs', 'w') as out:
        out.write(menu_rs)
    subprocess.check_output(['rustfmt', 'src-tauri/src/core/menu.rs'])

    menu_ts = generate_typescript(menus)
    with open('src/components/menu.tsx', 'w') as out:
        out.write(menu_ts)
    subprocess.check_output(['yarn', 'prettier', '--config', 'package.json', '--write', 'src/components/menu.tsx'])
    subprocess.check_output(['yarn', 'eslint', '--fix', '--ext', '.js,.ts,.tsx', 'src/components/menu.tsx'])
