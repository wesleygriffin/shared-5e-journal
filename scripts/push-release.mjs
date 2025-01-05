import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import minimist from '@minimistjs/minimist';

const argv = minimist(process.argv.slice(2), {boolean: [ 'dry-run' ], default: {'dry-run': false}});
if (argv['dry-run']) {
    console.log('Dry-run specified, no changes will be made');
}

// Get the repository url for updating the module.json
const repo_url = execSync('git remote get-url origin').toString().trim();
const url = new URL(repo_url.substring(0, repo_url.length - 4));

const data = await fs.readFile('module.json.in');
const module = JSON.parse(data.toString());

// Split the version string, increment the minor version and then re-join.
const version_parts = module.version.split('.').map(Number);
version_parts[1] += 1;
module.version = version_parts.join('.');

// We first need to write module.json.in so it is updated for the next release
if (argv['dry-run']) {
    console.log(`would write "module.version: ${module.version}" to module.json.in`);
} else {
    await fs.writeFile(`module.json.in`, JSON.stringify(module, null, 2));
}

// Update the module urls
module.url = url;
module.manifest = `https://raw.githubusercontent.com${url.pathname}/refs/heads/main/module.json`;
module.download = `${url}/archive/v${module.version}.zip`;

// Write and commit module.json and module.json.in
if (argv['dry-run']) {
    console.log(`would write "module.version: ${module.version}" to module.json`);
    console.log(`would write "module.url: ${module.url}" to module.json`);
    console.log(`would write "module.manifest: ${module.manifest}" to module.json`);
    console.log(`would write "module.download: ${module.download}" to module.json`);
    console.log(`would run "git add module.json module.json.in"`);
    console.log(`would run "git commit -m \"Creating release v${module.version}\"`);
    console.log(`would run "git tag v${module.version}"`);
    console.log(`would run "git push --tags origin main"`);
} else {
    await fs.writeFile(`module.json`, JSON.stringify(module, null, 2));
    execSync('git add module.json module.json.in');
    execSync(`git commit -m \"Creating release v${module.version}\"`);
    execSync(`git tag v${module.version}`);
    execSync('git push --tags origin main');
}

// Use the GitHub API to create a new release

console.log(`Foundry manifest link: ${module.manifest}`);
