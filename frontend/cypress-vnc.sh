#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Running from $REPO_ROOT"

cd "$REPO_ROOT/dev/cypress-vnc"

# Clean up orphaned containers and start fresh
docker compose -f docker-compose.cypress.yml down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.cypress.yml up --build -d

echo "Waiting for VNC server to start (this may take a minute on first run)..."

# Wait for container to be running and VNC to be ready
for i in {1..90}; do
    if docker compose -f docker-compose.cypress.yml logs 2>&1 | grep -q "VNC ready"; then
        echo ""
        echo "VNC server is ready!"
        echo "   Open http://localhost:6080 in your browser"
        echo ""
        echo "   To open Cypress, run:"
        echo "   docker exec -it cypress-vnc npx cypress open --e2e"
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "VNC may still be starting. Check logs with:"
echo "   docker compose -f $REPO_ROOT/dev/cypress-vnc/docker-compose.cypress.yml logs -f"
