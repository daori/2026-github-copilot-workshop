#!/usr/bin/env node
const { spawn } = require('child_process');

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true });
    p.on('exit', (code) => {
      if (code === 0) resolve(code);
      else reject(code);
    });
    p.on('error', (err) => reject(err));
  });
}

(async () => {
  try {
    // Run top-level npm test which executes backend + frontend tests
    await run('npm', ['test']);
    process.exit(0);
  } catch (err) {
    // Non-zero exit or error
    console.error('pre-push tests failed', err);
    process.exit(typeof err === 'number' ? err : 1);
  }
})();
