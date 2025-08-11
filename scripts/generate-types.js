const { readdirSync, readFileSync, mkdirSync, writeFileSync, unlinkSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const docsDir = path.resolve(__dirname, '../backend/docs');
const backendOutDir = path.resolve(__dirname, '../backend/src/swagger');
const frontendOutDir = path.resolve(__dirname, '../frontend/src/swagger');

mkdirSync(backendOutDir, { recursive: true });
mkdirSync(frontendOutDir, { recursive: true });

const baseHeader = `openapi: 3.0.0
info:
  title: Spoker v2 API
  version: '1.0.0'
`;

const yamlFiles = readdirSync(docsDir).filter((f) => f.endsWith('.yaml'));

for (const file of yamlFiles) {
  const name = path.parse(file).name;
  const source = readFileSync(path.join(docsDir, file), 'utf8');
  const tempSpec = path.join(os.tmpdir(), `${name}-spec.yaml`);
  writeFileSync(tempSpec, baseHeader + '\n' + source);
  execSync(`npx openapi-typescript ${tempSpec} --output ${path.join(backendOutDir, name + '.ts')}`, { stdio: 'inherit' });
  execSync(`npx openapi-typescript ${tempSpec} --output ${path.join(frontendOutDir, name + '.ts')}`, { stdio: 'inherit' });
  unlinkSync(tempSpec);
}