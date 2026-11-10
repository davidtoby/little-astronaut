#!/usr/bin/env python3
"""Generate bilingual MP3 narration. Normal site use needs neither TTS nor keys."""
import argparse
import asyncio
import json
import subprocess
from pathlib import Path
import edge_tts
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'audio'
VOICES = {
    'teacher': dict(voice='zh-CN-XiaoxiaoNeural', name='温柔老师', language='zh', rate='-10%', pitch='+0Hz'),
    'sister': dict(voice='zh-CN-XiaoyiNeural', name='活泼姐姐', language='zh', rate='-8%', pitch='+0Hz'),
    'en-teacher': dict(voice='en-GB-SoniaNeural', name='Gentle teacher', language='en', rate='-10%', pitch='+0Hz'),
    'en-sister': dict(voice='en-GB-LibbyNeural', name='Cheerful friend', language='en', rate='-8%', pitch='+0Hz'),
}
async def main(language, force):
    content = json.loads((ROOT / 'public' / 'narration-content.json').read_text())
    previous = json.loads((OUT / 'manifest.json').read_text()) if (OUT / 'manifest.json').exists() else {}
    manifest = dict(version=2, defaultVoice='teacher', voices=VOICES, clips=previous.get('clips', {}))
    semaphore = asyncio.Semaphore(3)
    async def generate(style, config, clip):
        spoken = clip[config['language']]
        dest = OUT / f"{style}-{clip['id']}.mp3"
        old = manifest['clips'].get(clip['key'], {}).get(style, {})
        async with semaphore:
            for attempt in range(3):
                try:
                    if force or not dest.exists() or dest.stat().st_size < 1000 or old.get('spokenText') != spoken:
                        temporary = dest.with_suffix('.tmp.mp3')
                        await asyncio.wait_for(edge_tts.Communicate(spoken, config['voice'], rate=config['rate'], pitch=config['pitch']).save(str(temporary)), timeout=45)
                        temporary.replace(dest)
                    duration = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(dest)], text=True).strip())
                    print(f"{style} / {clip['id']}: {duration:.2f}s", flush=True)
                    return clip['key'], style, dict(src=f'audio/{dest.name}', duration=duration, spokenText=spoken)
                except Exception as error:
                    print(f"Retry {style}/{clip['id']}: {type(error).__name__}", flush=True)
                    if attempt == 2:
                        raise
                    await asyncio.sleep(attempt + 1)
    OUT.mkdir(exist_ok=True)
    results = await asyncio.gather(*(generate(style, config, clip) for style, config in VOICES.items() if language == 'all' or config['language'] == language for clip in content))
    for key, style, info in results:
        manifest['clips'].setdefault(key, {})[style] = info
    # Publish the index only after every requested clip has succeeded.
    for name, value in [('manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n'), ('narration.js', 'window.ASTRO_NARRATION = ' + json.dumps(manifest, ensure_ascii=False) + ';\n')]:
        temporary = OUT / (name + '.tmp')
        temporary.write_text(value)
        temporary.replace(OUT / name)
    print(f'Done: {len(results)} clips generated or reused.', flush=True)
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--language', choices=['zh', 'en', 'all'], default='all')
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()
    asyncio.run(main(args.language, args.force))
