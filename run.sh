#!/usr/bin/env bash
# Start ShlimpNote on this computer as its own app window: a tiny local server, then a
# private Firefox profile with every toolbar hidden (no address bar, no tabs) and its own
# window name/icon, so it doesn't look like Firefox. Her Windows PC uses Edge's app mode instead.
cd "$(dirname "$0")"
PORT=8642
PROFILE="$HOME/.local/share/shlimpnote/window"
if ! (exec 3<>/dev/tcp/127.0.0.1/$PORT) 2>/dev/null; then
  nix develop /home/insideabush/nixos-config#vibe-web --command node serve.js $PORT >/dev/null 2>&1 &
  for _ in $(seq 40); do (exec 3<>/dev/tcp/127.0.0.1/$PORT) 2>/dev/null && break; sleep 0.25; done
fi
mkdir -p "$PROFILE/chrome"
cp app-window/user.js "$PROFILE/user.js"
cp app-window/userChrome.css "$PROFILE/chrome/userChrome.css"
export MOZ_APP_REMOTINGNAME=shlimpnote
exec firefox --no-remote --profile "$PROFILE" --name shlimpnote --class shlimpnote "http://localhost:$PORT/"
