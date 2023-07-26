#!/usr/bin/env bash

echo "########################################################################"
echo Creating binary for target $1
echo "------------------------------------------------------------------------"
yarn tauri build --target $1
echo "------------------------------------------------------------------------"
echo "Copy DMG to binaries folder"
echo "------------------------------------------------------------------------"
cp -a ./src-tauri/target/$1/release/bundle/dmg/*.dmg ./binaries
echo "File successfully copied"
echo "########################################################################"