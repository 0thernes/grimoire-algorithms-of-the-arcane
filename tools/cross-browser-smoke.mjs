import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outputDir = path.join(root, 'output', 'playwright');
const summaryPath = path.join(outputDir, 'cross-browser-smoke-summary.json');
const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const url = `http://127.0.0.1:4177/index.html?crossBrowser=${Date.now()}`;

const engines = [
  { name: 'chromium', browser: null, file: 'cross-browser-chromium.png' },
  { name: 'firefox', browser: 'firefox', file: 'cross-browser-firefox.png' },
  { name: 'webkit', browser: 'webkit', file: 'cross-browser-webkit.png' }
];

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=?&-]+$/.test(text)) return text;
  return `"${text.replace(/"/g, '\\"')}"`;
}

function runCli(session, args, options = {}) {
  const fullArgs = ['--yes', '--package', '@playwright/cli', 'playwright-cli', `-s=${session}`, ...args];
  const commandLine = [npxBin, ...fullArgs].map(shellQuote).join(' ');
  const result = spawnSync(commandLine, {
    cwd: root,
    encoding: 'utf8',
    timeout: options.timeout || 60000,
    shell: true
  });
  if (result.status !== 0) {
    const stdout = typeof result.stdout === 'string' ? result.stdout.trim() : '';
    const stderr = typeof result.stderr === 'string' ? result.stderr.trim() : '';
    const error = result.error ? String(result.error) : '';
    throw new Error([
      commandLine,
      stdout,
      stderr,
      error
    ].filter(Boolean).join('\n'));
  }
  return result.stdout;
}

function closeSession(session) {
  const commandLine = [npxBin, '--yes', '--package', '@playwright/cli', 'playwright-cli', `-s=${session}`, 'close']
    .map(shellQuote)
    .join(' ');
  spawnSync(commandLine, {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000,
    shell: true
  });
}

function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const results = [];
  const failures = [];

  for (const engine of engines) {
    const session = `grimoire-${engine.name}-${Date.now()}`;
    const target = path.join(outputDir, engine.file);
    const args = ['open', url];
    if (engine.browser) args.push('--browser', engine.browser);
    try {
      runCli(session, args, { timeout: 90000 });
      runCli(session, ['resize', '1280', '720']);
      runCli(session, ['screenshot', '--filename', target], { timeout: 90000 });
      const stat = fs.statSync(target);
      results.push({
        engine: engine.name,
        file: path.relative(root, target).split(path.sep).join('/'),
        bytes: stat.size,
        exists: true
      });
      if (stat.size < 50000) failures.push(`${engine.name}: screenshot too small (${stat.size} bytes)`);
    } catch (error) {
      failures.push(`${engine.name}: ${error.message}`);
      results.push({
        engine: engine.name,
        file: path.relative(root, target).split(path.sep).join('/'),
        bytes: fs.existsSync(target) ? fs.statSync(target).size : 0,
        exists: fs.existsSync(target)
      });
    } finally {
      closeSession(session);
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    url,
    viewport: '1280x720',
    engines: results,
    failures
  };
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    summary: path.relative(root, summaryPath).split(path.sep).join('/'),
    engines: results.length,
    failures: failures.length,
    files: results.map(result => result.file)
  }, null, 2));
  if (failures.length) process.exit(2);
}

main();
