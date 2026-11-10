import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const project = path.dirname(fileURLToPath(import.meta.url));
const action = process.argv[2] || 'status';
if (!['stop', 'status'].includes(action)) throw new Error('Use: node manage.mjs status|stop');
let record;
try { record = JSON.parse(await readFile(path.join(project, '.runtime/server.json'), 'utf8')); }
catch { console.log('Not running / 没有本项目的运行记录。'); process.exit(0); }
if (record.project !== project || !Number.isInteger(record.pid) || record.pid <= 0 || !Number.isInteger(record.port)) throw new Error('Invalid project runtime record; nothing was stopped.');
const status = await new Promise(resolve => {
  const request = http.get(`http://127.0.0.1:${record.port}/health`, { timeout: 1500 }, response => {
    let body = '';
    response.on('data', part => { body += part; });
    response.on('end', () => { try { resolve(response.statusCode === 200 ? JSON.parse(body) : null); } catch { resolve(null); } });
  });
  request.on('timeout', () => { request.destroy(); resolve(null); });
  request.on('error', () => resolve(null));
});
// Never stop an arbitrary listener or a reused PID: verify this app's instance.
if (!status || status.app !== 'little-astronaut' || status.pid !== record.pid || status.instanceId !== record.instanceId) {
  console.log('Project service is not running, or the port belongs to another process. No process was stopped. / 服务未运行或端口属于其他进程，没有停止任何进程。');
  process.exit(0);
}
if (action === 'status') console.log(`Running / 正在运行：PID ${record.pid}, http://localhost:${record.port}/`);
else {
  process.kill(record.pid, 'SIGTERM');
  console.log(`Stop requested for this project / 已请求停止本项目服务：PID ${record.pid}`);
}
