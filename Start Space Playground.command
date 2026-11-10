#!/bin/zsh
# Local-only launcher. No downloads, global dependency changes, or uploads.
cd -- "${0:A:h}" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  printf 'Node.js is required. Please install Node.js first.\n'
  read '?Press Return to close…'
  exit 1
fi
if [[ ! -f dist/index.html ]]; then
  node build.mjs || { read '?Build failed. Press Return to close…'; exit 1; }
fi
node server.mjs
read '?The server stopped. Press Return to close…'
