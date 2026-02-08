#!/bin/bash
set -e

echo "Starting Xvfb..."
Xvfb :0 -screen 0 1920x1080x24 &
sleep 2

echo "Starting fluxbox..."
fluxbox &

echo "Starting x11vnc..."
x11vnc -display :0 -forever -shared -rfbport 5900 -nopw -listen 0.0.0.0 &
sleep 1

echo "Starting noVNC websocket proxy..."
websockify --web /usr/share/novnc 0.0.0.0:6080 localhost:5900 &
sleep 1

echo "Installing npm dependencies..."
cd /e2e/frontend
if [ ! -d node_modules ]; then
  npm ci
else
  echo "node_modules already present, skipping npm ci"
fi

echo ""
echo "VNC ready"
echo "Open http://localhost:6080 in your browser"
echo "Run 'npx cypress open --e2e' in the container to start Cypress"
echo ""

# Keep container running
tail -f /dev/null
