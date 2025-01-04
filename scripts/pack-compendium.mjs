import { compilePack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';

const MODULE_ID = process.cwd();
const IGNORE = [ '.gitattributes', '.DS_Store' ];

const packs = await fs.readdir(`${MODULE_ID}/src/packs`);
for (const pack of packs) {
    if (IGNORE.includes(pack)) {
        continue;
    }

    console.log(`Packing ${pack}`);
    await compilePack(`${MODULE_ID}/src/packs/${pack}`, `${MODULE_ID}/packs/${pack}`);
}