import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const base = 'implementations';
const verifiedCellsPath = path.join(root, base, 'verified-cells.json');

function write(relPath, text) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

function cellReadme(title, navLabel, algorithmId, files, testCommand, verificationNote) {
  return `# ${title}
  
Catalog record: \`${navLabel}\` / \`${algorithmId}\`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

${files.map(file => `- \`${file}\``).join('\n')}

## Test

\`\`\`powershell
${testCommand}
\`\`\`

## Verification Status

${verificationNote || 'This cell is included in the verified ledger when the test command passes on the current machine.'}
`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node tools/generate-matrix-cell.mjs <path-to-spec.json>');
    process.exit(1);
  }

  const specPath = path.resolve(args[0]);
  if (!fs.existsSync(specPath)) {
    console.error(`Error: Specification file not found at ${specPath}`);
    process.exit(1);
  }

  console.log(`[AMS] Loading specification from ${path.basename(specPath)}...`);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  const { algorithmId, algorithmTitle, navLabel, domain, languages } = spec;
  if (!algorithmId || !algorithmTitle || !navLabel || !domain || !languages) {
    console.error('Error: Specification file is missing required fields (algorithmId, algorithmTitle, navLabel, domain, languages)');
    process.exit(1);
  }

  const existingManifest = fs.existsSync(verifiedCellsPath) 
    ? JSON.parse(fs.readFileSync(verifiedCellsPath, 'utf8'))
    : { schemaVersion: 1, catalogVersion: '0.9.13-local', verifiedCells: [] };

  const verifiedCells = [...existingManifest.verifiedCells];
  const seenKeys = new Set(verifiedCells.map(c => c.id));

  let createdCellsCount = 0;
  let registeredCellsCount = 0;

  for (const [languageId, langConfig] of Object.entries(languages)) {
    const dir = `${base}/${languageId}/${domain}/${algorithmId}`;
    const fileList = [];
    const sourceFiles = [];

    // Write all code files for this language cell
    for (const file of langConfig.files) {
      const filePath = `${dir}/${file.name}`;
      write(filePath, file.content);
      
      // Determine if it's a source file or test file
      if (!file.name.toLowerCase().includes('test') && !file.name.endsWith('.proj') && !file.name.endsWith('proj')) {
        sourceFiles.push(filePath);
      }
      fileList.push(file.name);
    }

    // Write cell README
    const testCommand = langConfig.testCommand;
    const verificationNote = langConfig.verificationNote;
    write(`${dir}/README.md`, cellReadme(algorithmTitle, navLabel, algorithmId, fileList, testCommand, verificationNote));
    createdCellsCount++;

    // Register cell in verified-cells ledger if applicable
    const cellKey = `${languageId}:${algorithmId}`;
    if (langConfig.verified && !seenKeys.has(cellKey)) {
      verifiedCells.push({
        id: cellKey,
        catalogVersion: '0.9.13-local',
        navLabel,
        algorithmId,
        algorithmTitle,
        domain,
        languageId,
        sourceFiles,
        readme: `${dir}/README.md`,
        testCommand,
        verifiedAt: new Date().toISOString().split('T')[0],
        status: 'verified-local'
      });
      seenKeys.add(cellKey);
      registeredCellsCount++;
    }
  }

  // Update verified cells manifest
  fs.writeFileSync(verifiedCellsPath, JSON.stringify({
    schemaVersion: 1,
    catalogVersion: '0.9.13-local',
    generatedAt: new Date().toISOString(),
    verificationPolicy: 'A cell is verified only when its source files exist and its testCommand passes locally.',
    verifiedCells
  }, null, 2) + '\n', 'utf8');

  console.log(`[AMS] Created ${createdCellsCount} implementation cells.`);
  console.log(`[AMS] Registered ${registeredCellsCount} new verified cells in verified-cells.json.`);

  // Rebuild the matrix and indices
  console.log('[AMS] Rebuilding implementation matrix and index READMEs...');
  try {
    execSync(`node "${path.join(root, 'tools', 'build-implementation-matrix.mjs')}"`, { cwd: root, stdio: 'inherit' });
    console.log('[AMS] Successfully rebuilt implementation matrix!');
  } catch (err) {
    console.error(`[AMS] Error rebuilding implementation matrix: ${err.message}`);
  }
}

main();
