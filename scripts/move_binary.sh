#!/usr/bin/env bash

TARGET=$(rustc -Vv | grep host | cut -f2 -d' ')
echo "Target: $TARGET"

if [ -z "$TARGET" ]; then
    echo "Target not found"
    exit 1
fi

# SOURCE_PATH="src-tauri/bin/python/main/main"
# TARGET_PATH="src-tauri/bin/python/main/main-$TARGET"

# mv $SOURCE_PATH $TARGET_PATH
