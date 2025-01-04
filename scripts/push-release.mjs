import { promises as fs } from 'fs';
import { execSync } from 'child_process';

// We need the repository url and I don't want to use a package for this
const repo_url = execSync('git remote get-url origin').toString().trim();
const url = new URL(repo_url.substring(0, repo_url.length - 4));

const data = await fs.readFile('module.json.in');
const module = JSON.parse(data.toString());

// Split the version string, increment the minor version and then re-join.
const version_parts = module.version.split('.').map(Number);
version_parts[1] += 1;
module.version = version_parts.join('.');

// We first need to write module.json.in so it is updated for the next release
await fs.writeFile(`module.json.in`, JSON.stringify(module, null, 2));

// Update the module urls
module.url = url;
module.manifest = `https://raw.githubusercontent.com${url.pathname}/refs/heads/main/module.json`;
module.download = `${url}/archive/v${module.version}.zip`;

// Write and commit module.json and module.json.in
await fs.writeFile(`module.json`, JSON.stringify(module, null, 2));
execSync('git add module.json');
execSync('git add module.json.in');
execSync(`git commit -m \"Creating release v${module.version}\"`);
execSync(`git tag v${module.version}`);
execSync('git push --tags origin main');

// Use the Github API to create a new release

console.log(`Foundry manifest link: ${module.manifest}`);
