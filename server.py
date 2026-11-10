#!/usr/bin/env python3
"""Serve only the children's astronomy assets on the local network."""
import argparse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
PUBLIC = Path(__file__).resolve().parent / 'public'
STATIC_PATHS = {'/', '/index.html', '/style.css', '/app.js', '/narration-player.js', '/favicon.ico', '/audio/narration.js', '/audio/manifest.json', '/i18n-data.js', '/i18n.js', '/translations.json', '/narration-content.json'}
def allowed_path(path):
    if path in STATIC_PATHS:
        return True
    parts = path.split('/')
    return (len(parts) == 3 and parts[1] == 'audio' and parts[2].endswith('.mp3')
            and all(c.isalnum() or c in '-.' for c in parts[2])
            and (PUBLIC / 'audio' / parts[2]).is_file())
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)
    def do_GET(self):
        path = urlsplit(self.path).path
        if not allowed_path(path):
            self.send_error(404)
            return
        if path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()
    def do_HEAD(self):
        if not allowed_path(urlsplit(self.path).path):
            self.send_error(404)
            return
        super().do_HEAD()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8787)
    parser.add_argument('--bind', default='0.0.0.0')
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('port must be between 1 and 65535')
    print(f'Little Astronaut: http://127.0.0.1:{args.port} (bind: {args.bind})', flush=True)
    try:
        ThreadingHTTPServer((args.bind, args.port), Handler).serve_forever()
    except KeyboardInterrupt:
        print('Server stopped.', flush=True)
