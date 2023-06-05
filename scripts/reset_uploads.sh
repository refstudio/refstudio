#!/usr/bin/env bash

PROJECT_DIR="~/Library/Application Support/com.tauri.dev/project-x"

rm "$PROJECT_DIR/uploads/"*.pdf
rm -rf "$PROJECT_DIR/.grobid"
rm -rf "$PROJECT_DIR/.storage"
rm -rf "$PROJECT_DIR/.lancedb"
