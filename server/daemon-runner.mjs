import { spawn } from 'node:child_process';
import path from 'node:path';

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: node daemon-runner.mjs <command> [...args]');
  process.exit(1);
}

let keepAlive = true;

process.on('SIGTERM', () => {
  keepAlive = false;
  process.exit(0);
});

process.on('SIGINT', () => {
  keepAlive = false;
  process.exit(0);
});

function run() {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env },
  });

  child.on('exit', (code, signal) => {
    if (keepAlive) {
      console.log(`[daemon-runner] Process ${command} exited with code ${code}, signal ${signal}. Restarting in 300ms...`);
      setTimeout(run, 300);
    }
  });
}

// Keep event loop alive
setInterval(() => {}, 10000);

run();
