#!/usr/bin/env bash
# Start ShlimpNote on this computer: a tiny local server, then open it in a Firefox window.
cd "$(dirname "$0")"
PORT=8642
if ! (exec 3<>/dev/tcp/127.0.0.1/$PORT) 2>/dev/null; then
  nix develop /home/insideabush/nixos-config#vibe-web --command node serve.js $PORT >/dev/null 2>&1 &
  sleep 2
fi
exec firefox --new-window "http://localhost:$PORT/"
