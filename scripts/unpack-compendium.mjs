import { extractPack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';
import path from 'path';

const MODULE_ID = process.cwd();
const IGNORE = [ '.gitattributes', '.DS_Store' ];

const packs = await fs.readdir(`${MODULE_ID}/packs`);
for (const pack of packs) {
    if (IGNORE.includes(pack)) {
        continue;
    }

    console.log(`Unpacking ${pack}`);
    const directory = `${MODULE_ID}/src/packs/${pack}`;

    try {
        // Delete all the pack files in the source directory.
        for (const file of await fs.readdir(directory)) {
            await fs.unlink(path.join(directory, file));
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`No files inside of ${pack}`);
        } else {
            console.error(error);
        }
    }

    await extractPack(
        `${MODULE_ID}/packs/${pack}`,
        `${MODULE_ID}/src/packs/${pack}`,
        {
            transformName: transformName,
        }
    );
}

/**
 * Prefaces the document with its type
 * @param {object} doc - The document data
 */
function transformName(doc) {
    const safeFileName = doc.name.replace(/[^a-zA-Z0-9А-я]/g, '_');
    const type = doc._key.split('!')[1];
    const prefix = [ 'actors', 'items' ].includes(type) ? doc.type : type;
    return `${doc.name ? `${prefix}_${safeFileName}_${doc._id}` : doc._id}.json`;
}