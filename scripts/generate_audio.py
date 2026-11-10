"""Generate approved public narration, never child/user data. Run Python with -I.

Each service-produced MP3 is received in its own fresh temporary directory.
The generator lives elsewhere and passes absolute paths to ffprobe; validated
MP3s are then moved into the project's public audio directory.
"""
import argparse
import asyncio
import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile
from datetime import datetime, timezone

import edge_tts


def digest(entry):
    content = '|'.join(entry[k] for k in ['voice', 'rate', 'pitch', 'text'])
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    entries = json.loads(Path(args.input).read_text(encoding='utf-8'))
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    ffprobe = shutil.which('ffprobe')
    if not ffprobe:
        raise RuntimeError('ffprobe is required to validate generated MP3 files.')
    manifest_file = output / 'manifest.json'
    old = json.loads(manifest_file.read_text(encoding='utf-8')) if manifest_file.exists() else {'entries': []}
    completed = {f"{e['lang']}:{e['id']}": e for e in old['entries']}
    semaphore = asyncio.Semaphore(2)

    def save_manifest():
        manifest = {
            'version': 1,
            'provider': 'Microsoft Edge online speech synthesis (unofficial edge-tts client)',
            'generatedAt': datetime.now(timezone.utc).isoformat(),
            'entries': sorted(completed.values(), key=lambda e: (e['lang'], e['id'])),
        }
        temporary = output / 'manifest.json.tmp'
        temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        os.replace(temporary, manifest_file)

    async def generate(entry):
        key = f"{entry['lang']}:{entry['id']}"
        destination = output / entry['file']
        if destination.parent.parent != output or destination.suffix != '.mp3':
            raise ValueError('Invalid output file path')
        previous = completed.get(key)
        if previous and previous.get('sourceHash') == digest(entry) and destination.is_file():
            if hashlib.sha256(destination.read_bytes()).hexdigest() == previous.get('audioHash'):
                print(f"CACHED {key}", flush=True)
                return
        async with semaphore:
            for attempt in range(2):
                try:
                    with tempfile.TemporaryDirectory(prefix='astronaut-voice-') as directory:
                        temporary = Path(directory) / 'voice.mp3'
                        communicate = edge_tts.Communicate(entry['text'], entry['voice'], rate=entry['rate'], pitch=entry['pitch'], volume='+0%')
                        await communicate.save(str(temporary))
                        process = await asyncio.create_subprocess_exec(
                            ffprobe, '-v', 'error', '-show_entries', 'format=duration,format_name', '-of', 'json', str(temporary),
                            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
                        )
                        stdout, stderr = await process.communicate()
                        if process.returncode != 0:
                            raise RuntimeError(f'Invalid audio: {stderr.decode(errors="replace")[:200]}')
                        info = json.loads(stdout)['format']
                        duration = float(info['duration'])
                        data = temporary.read_bytes()
                        if 'mp3' not in info['format_name'] or duration <= .15 or len(data) < 1000:
                            raise RuntimeError('Empty or invalid MP3 returned')
                        destination.parent.mkdir(parents=True, exist_ok=True)
                        shutil.move(str(temporary), str(destination))
                        completed[key] = {
                            **entry, 'sourceHash': digest(entry),
                            'audioHash': hashlib.sha256(data).hexdigest(),
                            'duration': round(duration, 3), 'bytes': len(data),
                        }
                        save_manifest()
                        print(f"GENERATED {key}: {duration:.2f}s, {len(data)} bytes", flush=True)
                        return
                except Exception:
                    if attempt == 1:
                        raise
                    await asyncio.sleep(1)

    # A small preview first confirms the service before sending the entire batch.
    previews = [e for e in entries if e['id'] == 'preview']
    for entry in previews:
        await generate(entry)
    await asyncio.gather(*(generate(e) for e in entries if e['id'] != 'preview'))
    save_manifest()
    print(f'DONE: {len(entries)} requested clips validated. Manifest: {manifest_file}', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
