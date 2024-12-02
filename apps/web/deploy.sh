#!/bin/bash

REPO_PATH="/home/jsclimbe/repositories/turborepo-jsclimber"
TEMP_BUILD_PATH="/home/jsclimbe/repositories/turborepo-jsclimber-temp"
LOG_FILE="/home/jsclimbe/deploy_turborepo_jsclimber.log"

BLOG_APP_NAME="jsclimber.ir"
DOCS_APP_NAME="docs.jsclimber.ir"
ADMIN_APP_NAME="admin.jsclimber.ir"

PUBLIC_HTACCESS="/home/jsclimbe/public_html/.htaccess"
BLOG_HTACCESS="/home/jsclimbe/jsclimber.ir/.htaccess"
ADMIN_HTACCESS="/home/jsclimbe/admin.jsclimber.ir/.htaccess"
DOCS_HTACCESS="/home/jsclimbe/docs.jsclimber.ir/.htaccess"

# Start logging
exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo "===== Starting deployment at $(date) ====="

# Step 1: copy repository
echo "Copying repository to temporary path..."
if cp -R "$REPO_PATH" "$TEMP_BUILD_PATH"; then
    echo "Repository copied successfully ."
else
    echo "Failed to copy repository." >&2
    exit 1
fi

cd "$TEMP_BUILD_PATH" || { echo "Failed to navigate to $TEMP_BUILD_PATH"; exit 1; }

# Step 2: Git pull
echo "Pulling latest changes from GitHub..."
retry_count=0
max_retries=3

until git pull origin main || [ "$retry_count" -ge "$max_retries" ]; do
    retry_count=$((retry_count+1))
    echo "Git pull failed. Retrying... ($retry_count/$max_retries)"
    sleep 5
done
if [ "$retry_count" -ge "$max_retries" ]; then
    echo "Git pull failed after $max_retries attempts." >&2
    exit 1
else
    echo "Git pull completed."
fi

# Step 3: Cache and dependencies cleanup
echo "Clearing .next, .turbo cache and node_modules..."
if pnpm -r exec rm -rf node_modules .next .turbo && pnpm exec rm -rf node_modules .next .turbo; then
    echo "Caches cleared successfully."
else
    echo "Failed to clear caches." >&2
    exit 1
fi

# Step 4: Install dependencies
echo "Installing production dependencies..."
if pnpm install; then
    echo "Dependencies installed successfully."
else
    echo "Dependency installation failed." >&2
    exit 1
fi

# Step 5: Turbo Builds project
echo "Turbo Building the project..."
if turbo run build; then
    echo "Turbo Build completed successfully."
else
    echo "Turbo Build failed." >&2
    exit 1
fi

# Step 6: Clear .htaccess file content while keeping the first 5 lines
for FILE in "$PUBLIC_HTACCESS" "$BLOG_HTACCESS" "$ADMIN_HTACCESS" "$DOCS_HTACCESS"; do
    echo "Clearing .htaccess file content for $file..."
    if head -n 5 "$FILE" > "${FILE}.tmp" && mv "${FILE}.tmp" "$FILE"; then
        echo ".htaccess file cleared successfully for $file."
    else
        echo "Failed to clear .htaccess file for $file." >&2
        exit 1
    fi
done


# Step 7: Ensure the public directory exists in REPO_PATH
# echo "Checking public directory..."
# if [ ! -d "$REPO_PATH/public" ]; then
#     mkdir -p "$REPO_PATH/public"
#     echo "Public directory created in live path."
# else
#     echo "Public directory exists in live path."
# fi

# Step 8: Deploy to live directory
echo "Deploying files to live directory..."
# Sync all files from the temporary build path to the live repository path
if rsync -a --delete "$TEMP_BUILD_PATH/" "$REPO_PATH/"; then
    echo "Deployment files synced successfully."
else
    echo "File sync failed." >&2
    exit 1
fi

# Step 9: Cleanup temporary build directory
echo "Cleaning up temporary build directory..."
if rm -rf "$TEMP_BUILD_PATH"; then
    echo "Temporary build directory removed."
else
    echo "Failed to remove temporary build directory." >&2
fi

echo "===== Deployment completed successfully at $(date) ====="


# Step 10: Restart the applications
echo "Restarting applications with PM2..."
cd "$REPO_PATH" || { echo "Failed to navigate to live directory $REPO_PATH"; exit 1; }

for APP in "$BLOG_APP_NAME" "$DOCS_APP_NAME" "$ADMIN_APP_NAME"; do
    echo "Restarting $APP..."
    if pm2 restart "$APP" --update-env; then
        echo "$APP restarted successfully."
    else
        echo "Failed to restart $APP." >&2
        exit 1
    fi
done