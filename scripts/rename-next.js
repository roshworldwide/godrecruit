const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');
const oldNextDir = path.join(outDir, '_next');
const newNextDir = path.join(outDir, 'next_assets');

if (fs.existsSync(oldNextDir)) {
    fs.renameSync(oldNextDir, newNextDir);
    console.log('✅ Renamed _next to next_assets');
}

if (fs.existsSync(outDir)) {
    const items = fs.readdirSync(outDir);
    for (const item of items) {
        if (item.startsWith('_')) {
            const itemPath = path.join(outDir, item);
            fs.rmSync(itemPath, { recursive: true, force: true });
            console.log(`✅ Deleted forbidden file/folder: ${item}`);
        }
    }
}

function getFiles(dir, filesList = []) {
    if (!fs.existsSync(dir)) return filesList;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getFiles(filePath, filesList);
        } else {
            if (/\.(html|js|css)$/.test(filePath)) {
                filesList.push(filePath);
            }
        }
    }
    return filesList;
}

const filesToProcess = getFiles(outDir);

let updatedCount = 0;

for (const filePath of filesToProcess) {
    const content = fs.readFileSync(filePath, 'utf8');

    const updatedContent = content
        .replace(/\/_next\//g, '/next_assets/')
        .replace(/\\"\/_next\//g, '\\"/next_assets/')
        .replace(/_next\//g, 'next_assets/');

    if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        updatedCount++;
    }
}

console.log(`✅ Updated _next references in ${updatedCount} files.`);
