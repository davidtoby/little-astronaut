import importlib.util
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('astro_server', ROOT / 'server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)
class QuietHandler(server.Handler):
    def log_message(self, *args):
        pass
class StaticServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = server.ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.origin = f'http://127.0.0.1:{cls.httpd.server_port}'
    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join()
    def test_bilingual_assets_and_audio(self):
        for path in ['/', '/i18n.js', '/i18n-data.js', '/translations.json', '/audio/narration.js', '/audio/en-teacher-welcome.mp3']:
            with self.subTest(path=path), urllib.request.urlopen(self.origin + path) as response:
                self.assertEqual(response.status, 200)
                self.assertGreater(len(response.read()), 100)
        request = urllib.request.Request(self.origin + '/audio/en-sister-welcome.mp3', method='HEAD')
        with urllib.request.urlopen(request) as response:
            self.assertEqual(response.headers['Content-Type'], 'audio/mpeg')
    def test_workspace_files_and_directory_listing_remain_inaccessible(self):
        for path in ['/server.py', '/README.md', '/audio/', '/audio/../../server.py', '/audio/missing.mp3', '/.env']:
            with self.subTest(path=path), self.assertRaises(urllib.error.HTTPError) as error:
                urllib.request.urlopen(self.origin + path)
            self.assertEqual(error.exception.code, 404)
            error.exception.close()
if __name__ == '__main__':
    unittest.main()
