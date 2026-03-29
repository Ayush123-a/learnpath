#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

PORT = 3000
DIRECTORY = "dist"

class SPAServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # For SPA routing, serve index.html for all routes that don't match files
        parsed_path = urlparse(self.path)
        file_path = parsed_path.path.lstrip('/')

        # Check if the file exists
        full_path = os.path.join(DIRECTORY, file_path)
        if os.path.isfile(full_path):
            # Serve the actual file
            return super().do_GET()
        else:
            # Serve index.html for SPA routing
            self.path = '/index.html'
            return super().do_GET()

with socketserver.TCPServer(("", PORT), SPAServer) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()