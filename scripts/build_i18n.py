#!/usr/bin/env python3
"""Compile the translation dictionary into a synchronous browser asset."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
translations = json.loads((ROOT / 'public/translations.json').read_text())
(ROOT / 'public/i18n-data.js').write_text('window.ASTRO_TRANSLATIONS = ' + json.dumps(translations, ensure_ascii=False) + ';\n')
print(f'Built {len(translations)} translation entries.')
