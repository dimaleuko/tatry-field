#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required. Install it from nodejs.org, then run this file again."
  read -p "Press Enter to close..."
  exit 1
fi
node server.js &
PID=$!
sleep 1
if command -v open >/dev/null 2>&1; then open http://localhost:8787; fi
IP=""
if command -v ipconfig >/dev/null 2>&1; then IP=$(ipconfig getifaddr en0 2>/dev/null || true); fi
echo ""
echo "TATRY / FIELD is running"
echo "Mac:    http://localhost:8787"
if [ -n "$IP" ]; then echo "iPhone: http://$IP:8787   (same Wi-Fi)"; fi
echo ""
echo "Press Ctrl+C to stop."
wait $PID
