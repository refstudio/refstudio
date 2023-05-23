#!/usr/bin/env bash

TARGET=$(rustc -Vv | grep host | cut -f2 -d' ')
echo "Target: $TARGET"

if [ -z "$TARGET" ]; then
    echo "Target not found"
    exit 1
fi

SOURCE_PATH="src-tauri/bin/python"
TARGET_PATH="src-tauri/bin/python/main-$TARGET"


mkdir -p $TARGET_PATH
mv $SOURCE_PATH/main $TARGET_PATH/.
echo "Moved python binaries to $TARGET_PATH"

#rm -rf $SOURCE_PATH