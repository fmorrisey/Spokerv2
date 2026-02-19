#!/usr/bin/env bash
# regen-secrets.sh — Regenerate JWT secrets in backend env files
# Usage:
#   ./tools/scripts/regen-secrets.sh           # updates both .env and .env.prod
#   ./tools/scripts/regen-secrets.sh --dev     # updates backend/.env only
#   ./tools/scripts/regen-secrets.sh --prod    # updates backend/.env.prod only

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEV_ENV="$ROOT_DIR/backend/.env"
PROD_ENV="$ROOT_DIR/backend/.env.prod"

# Determine which files to update
UPDATE_DEV=true
UPDATE_PROD=true

if [[ "${1:-}" == "--dev" ]]; then
  UPDATE_PROD=false
elif [[ "${1:-}" == "--prod" ]]; then
  UPDATE_DEV=false
fi

gen_secret() {
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
}

update_env_file() {
  local file="$1"
  local label="$2"

  if [[ ! -f "$file" ]]; then
    echo "  ⚠️  Skipping $label — file not found: $file"
    return
  fi

  local new_jwt_secret new_refresh_secret
  new_jwt_secret=$(gen_secret)
  new_refresh_secret=$(gen_secret)

  # Update in-place using sed
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$new_jwt_secret|" "$file"
  sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$new_refresh_secret|" "$file"

  echo "  ✅ $label updated"
  echo "     JWT_SECRET        = ${new_jwt_secret:0:12}..."
  echo "     JWT_REFRESH_SECRET= ${new_refresh_secret:0:12}..."
}

echo ""
echo "🔑 Regenerating JWT secrets..."
echo ""

if $UPDATE_DEV; then
  update_env_file "$DEV_ENV" "backend/.env (dev)"
fi

if $UPDATE_PROD; then
  update_env_file "$PROD_ENV" "backend/.env.prod"
fi

echo ""
echo "⚠️  All active sessions are now invalidated — users will need to log in again."
echo "   Restart the backend for changes to take effect."
echo ""
