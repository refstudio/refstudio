#!/usr/bin/env bash

PROJECT_DIR="$HOME/Library/Application Support/com.tauri.dev/project-x"

# rm -f "$PROJECT_DIR/uploads/"*.pdf
rm -rf "$PROJECT_DIR/.staging"
rm -rf "$PROJECT_DIR/.grobid"
rm -rf "$PROJECT_DIR/.storage"
