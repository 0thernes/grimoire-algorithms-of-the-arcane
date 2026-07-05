import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const manifestPath = path.join(root, 'implementations', 'verified-cells.json');
const outputDir = path.join(root, 'output', 'implementation-tests');
const summaryPath = path.join(outputDir, 'implementation-test-summary.json');

function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const cells = Array.isArray(manifest.verifiedCells) ? manifest.verifiedCells : [];
  const results = [];
  for (const cell of cells) {
    const started = Date.now();
    const result = spawnSync(cell.testCommand, {
      cwd: root,
      shell: true,
      encoding: 'utf8',
      timeout: 60000
    });
    results.push({
      id: cell.id,
      algorithmId: cell.algorithmId,
      languageId: cell.languageId,
      command: cell.testCommand,
      status: result.status,
      durationMs: Date.now() - started,
      stdout: (result.stdout || '').trim(),
      stderr: (result.stderr || '').trim()
    });
  }
  const failures = results.filter(result => result.status !== 0);
  const summary = {
    generatedAt: new Date().toISOString(),
    target: 'verified implementation cells',
    manifest: path.relative(root, manifestPath).split(path.sep).join('/'),
    totalCells: cells.length,
    passed: results.length - failures.length,
    failed: failures.length,
    results
  };
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    summary: path.relative(root, summaryPath).split(path.sep).join('/'),
    totalCells: summary.totalCells,
    passed: summary.passed,
    failed: summary.failed
  }, null, 2));
  if (failures.length) process.exit(2);
}

main();
