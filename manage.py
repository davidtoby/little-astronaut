#!/usr/bin/env python3
"""Manage the user's macOS background server. Foreground serving is portable."""
import argparse
import ipaddress
import os
import plistlib
import socket
import subprocess
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
LABEL = 'com.tobylab.astro-playground'
PLIST = Path.home() / 'Library' / 'LaunchAgents' / f'{LABEL}.plist'

def run(*args, check=True):
    return subprocess.run(args, capture_output=True, text=True, check=check)

def lan_ip():
    if sys.platform == 'darwin':
        try:
            route = run('route', '-n', 'get', 'default').stdout
            interface = next(line.split(':', 1)[1].strip() for line in route.splitlines() if line.strip().startswith('interface:'))
            return str(ipaddress.ip_address(run('ipconfig', 'getifaddr', interface).stdout.strip()))
        except (OSError, subprocess.CalledProcessError, StopIteration, ValueError):
            pass
    try:
        for address in socket.gethostbyname_ex(socket.gethostname())[2]:
            if not ipaddress.ip_address(address).is_loopback:
                return address
    except (OSError, ValueError):
        pass
    return '<your-computer-LAN-IP>'

def service_target():
    return f'gui/{os.getuid()}/{LABEL}'

def running():
    return run('launchctl', 'print', service_target(), check=False).returncode == 0

def write_plist(port):
    (ROOT / 'logs').mkdir(exist_ok=True)
    PLIST.parent.mkdir(parents=True, exist_ok=True)
    config = {'Label': LABEL, 'ProgramArguments': [sys.executable, str(ROOT / 'server.py'), '--port', str(port)], 'WorkingDirectory': str(ROOT), 'RunAtLoad': True, 'KeepAlive': True, 'StandardOutPath': str(ROOT / 'logs/server.log'), 'StandardErrorPath': str(ROOT / 'logs/server-error.log'), 'ThrottleInterval': 10}
    old = plistlib.loads(PLIST.read_bytes()) if PLIST.exists() else None
    changed = old != config
    temporary = PLIST.with_suffix('.plist.tmp')
    temporary.write_bytes(plistlib.dumps(config))
    temporary.replace(PLIST)
    return changed

def installed_port():
    if PLIST.exists():
        args = plistlib.loads(PLIST.read_bytes()).get('ProgramArguments', [])
        if '--port' in args:
            return int(args[args.index('--port') + 1])
    return 8787

def show_urls(port):
    print(f'iPad / LAN: http://{lan_ip()}:{port}')
    print(f'This computer / 本机: http://127.0.0.1:{port}')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['start', 'install', 'stop', 'status', 'uninstall'])
    parser.add_argument('--port', type=int, default=8787)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('port must be between 1 and 65535')
    if sys.platform != 'darwin':
        parser.exit(1, 'Background management is macOS-only. Use: python3 server.py\n')
    try:
        if args.action in ['start', 'install']:
            changed = write_plist(args.port)
            loaded = running()
            if loaded and changed:
                run('launchctl', 'bootout', service_target())
                loaded = False
            if loaded:
                run('launchctl', 'kickstart', '-k', service_target())
            else:
                run('launchctl', 'bootstrap', f'gui/{os.getuid()}', str(PLIST))
            print('天文乐园已启动 / Space playground started. Auto-start at login is enabled.')
            show_urls(args.port)
        elif args.action == 'status':
            print('Running / 服务已加载' if running() else 'Stopped / 已停止')
            show_urls(installed_port())
        else:
            if running():
                run('launchctl', 'bootout', service_target())
            if args.action == 'uninstall':
                PLIST.unlink(missing_ok=True)
                print('Background auto-start removed / 已移除后台自启动。')
            else:
                print('Space playground stopped / 天文乐园已停止。')
    except (OSError, subprocess.CalledProcessError, ValueError) as error:
        parser.exit(1, f'Could not manage the service: {error}\n')
if __name__ == '__main__':
    main()
