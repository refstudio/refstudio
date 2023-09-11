#!/usr/bin/env bash

# show help for the command -h
if [[ $1 == "-h" ]]; then
    echo "Usage: reset_refstudio.sh -h"
    echo "Resets the RefStudio for the WEB_STORAGE_URL (defaults to /tmp/web-storage-url) folder"
    echo ""
    echo "WEB_STORAGE_URL=/some/path reset_refstudio.sh"
    echo "This will reset the RefStudio for the /some/path folder"
    exit 0
fi


# set variable with fallback to environment variable
WEB_STORAGE_URL=${WEB_STORAGE_URL:-"/tmp/web-storage-url"}

# Confirm if the user want to perform the operation
read -p "Are you sure you want to reset the RefStudio? [y/N] " -n 1 -r

# exit if the user does not confirm
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation aborted"
    exit 1
fi

# Backup settings file to a temporary location, if file exists
if [ -f "$WEB_STORAGE_URL/user1/settings.json" ]; then
    cp "$WEB_STORAGE_URL/user1/settings.json" "$WEB_STORAGE_URL/user1.settings.json.bak"
fi

# Create a time-based random ID
CURRENT_DATE_TIME=$(date +%Y-%m-%d_%H-%M-%S)

# Copy all files from the user1 folder to a temporary location and inform the user about the action
cp -r "$WEB_STORAGE_URL/user1" "$WEB_STORAGE_URL/user1-$CURRENT_DATE_TIME"
echo ""
echo "user1 folder backed up to $WEB_STORAGE_URL/user1.$CURRENT_DATE_TIME"

# Remove all files from the user1 folder
rm -rf "$WEB_STORAGE_URL/user1"

# Inform the user that the operation was successful for the WEB_STORAGE_URL folder
echo ""
echo "RefStudio reset successfully for the $WEB_STORAGE_URL folder"

