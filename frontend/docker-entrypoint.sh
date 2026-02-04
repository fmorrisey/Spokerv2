#!/bin/sh
set -e #exit on error

# Verify envsubst is available
command -v envsubst >/dev/null 2>&1 || { echo "envsubst not found"; exit 1; }

# Replace environment variables in env.js if env.template.js exists
if [ -f /usr/share/nginx/html/assets/env.template.js ]; then
  echo "Generating runtime environment configuration..."
  
  # Set defaults if not provided
  API_URL="${API_URL:-}"
  ENABLE_ANALYTICS="${ENABLE_ANALYTICS:-false}"
  ENABLE_DEBUG="${ENABLE_DEBUG:-false}"
  
  # Replace placeholders with actual environment variables
  envsubst '${API_URL} ${ENABLE_ANALYTICS} ${ENABLE_DEBUG}' \
    < /usr/share/nginx/html/assets/env.template.js \
    > /usr/share/nginx/html/assets/env.js \
    || { echo "Failed to generate env.js"; exit 1; }
  
  # Verify the output file was created and is not empty
  if [ ! -s /usr/share/nginx/html/assets/env.js ]; then
    echo "Error: env.js was not generated or is empty"
    exit 1
  fi
  
  echo "Runtime configuration generated successfully"
else
  echo "No env.template.js found, skipping runtime configuration"
fi

# Start nginx
exec nginx -g "daemon off;"
