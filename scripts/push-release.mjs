import archiver from 'archiver';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import minimist from '@minimistjs/minimist';

const MODULE_ID = process.cwd();

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
    console.log(`would run "git push origin main"`);
} else {
    await fs.writeFile(`module.json`, JSON.stringify(module, null, 2));
    execSync('git add module.json module.json.in');
    execSync(`git commit -m \"Creating release v${module.version}\"`);
    execSync('git push origin main');
}

// Create the release asset zip file
const filename = `${MODULE_ID}/v${module.version}.zip`;
if (argv['dry-run']) {
    console.log(`would write ${filename}`);
} else {
    const output = createWriteStream(filename);
    const archive = archiver('zip', {
        zlib: {level: 9} // Sets the compression level.
    });
    archive.pipe(output);

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.error(err.message);
        } else {
            throw err;
        }
    });
    archive.on('error', function (err) {
        throw err;
    });
    output.on('close', function () {
        console.log(`wrote ${filename}: ${archive.pointer()} total bytes`);
    });

    archive.append(`${MODULE_ID}/module.json`, {name: 'module.json'});
    archive.directory(`${MODULE_ID}/packs`, 'packs');
    await archive.finalize();
}

// Use the GitHub API to create a new release
const github = axios.create({
    baseURL: 'https://api.github.com',
    timeout: 1000,
    headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
    },
});

const path_parts = url.pathname.split('/');
const owner = path_parts[1];
const repo = path_parts[2];

if (argv['dry-run']) {
    console.log(`would POST {'tag_name: 'v${module.version}'} to ${github.getUri()}/repos/${owner}/${repo}/releases`);
} else {
    try {
        const create_resp = await github.post(`/repos/${owner}/${repo}/releases`, {
            tag_name: `v${module.version}`
        })
        console.log(create_resp);

        const list_resp = await github.get(`/repos/${owner}/${repo}/releases`);
        console.log(list_resp);

        const upload_resp = await github.post(`/repos/${owner}/${repo}/releases/${id}/assets`, {})
        console.log(upload_resp);
    } catch (err) {
        console.error(`Cannot create release: $(err)`);
    }
}

console.log(`Foundry manifest link: ${module.manifest}`);
