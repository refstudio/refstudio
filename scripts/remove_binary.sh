#!/usr/bin/env bash

# Remove binary files from the repository
rm -rf src-tauri/bin/python
rm -rf build

# Ensure main.spec exists before removing
touch main.spec && rm main.spec