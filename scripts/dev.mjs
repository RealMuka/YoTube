import { spawn } from 'node:child_process';
import process from 'node:process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [
  spawn(npm, ['run', 'dev', '--workspace', 'server'], { stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } }),
  spawn(npm, ['run', 'dev', '--workspace', 'client'], { stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } })
];

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  process.exitCode = code;
}

for (const child of children) {
  child.on('error', (error) => {
    console.error('Не удалось запустить процесс разработки:', error);
    shutdown(1);
  });
  child.on('exit', (code, signal) => {
    if (!shuttingDown && (code ?? 0) !== 0) shutdown(code ?? 1);
    else if (!shuttingDown && signal) shutdown(1);
  });
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
