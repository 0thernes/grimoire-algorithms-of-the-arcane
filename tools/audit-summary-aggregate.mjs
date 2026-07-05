import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'output', 'playwright');
const summaryPath = path.join(outputDir, 'aggregate-audit-summary.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function countArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function main() {
  const files = fs.readdirSync(outputDir)
    .filter(name => name.endsWith('-summary.json') && name !== 'aggregate-audit-summary.json')
    .map(name => path.join(outputDir, name))
    .sort((a, b) => a.localeCompare(b));

  const details = files.map(file => {
    const summary = readJson(file);
    const issues = countArray(summary.issues);
    const failures = countArray(summary.failures);
    const actionableConsole = countArray(summary.actionableConsole);
    const pageErrors = countArray(summary.pageErrors);
    return {
      file: rel(file),
      issues,
      failures,
      actionableConsole,
      pageErrors,
      problems: issues + failures + actionableConsole + pageErrors
    };
  });

  const output = {
    generatedAt: new Date().toISOString(),
    summaryFiles: details.length,
    problemTotal: details.reduce((sum, item) => sum + item.problems, 0),
    details
  };

  fs.writeFileSync(summaryPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    summary: rel(summaryPath),
    summaryFiles: output.summaryFiles,
    problemTotal: output.problemTotal
  }, null, 2));

  if (output.problemTotal) process.exit(2);
}

main();
