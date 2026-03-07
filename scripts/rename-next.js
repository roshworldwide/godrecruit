const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');
const oldNextDir = path.join(outDir, '_next');
const newNextDir = path.join(outDir, 'next_assets');

// 1. Rename the _next directory specifically
if (fs.existsSync(oldNextDir)) {
    fs.renameSync(oldNextDir, newNextDir);
    console.log('✅ Renamed _next to next_assets');
}

// 2. Remove any other generated file/directory in out/ that starts with an underscore.
// Chrome Extensions strictly forbid any file or folder starting with _.
// The `__next.*` and `_not-found*` files are mostly useful for Next.js routing, 
// which is ignored by the Chrome Extension loader since we explicitly point to index.html and options.html.
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

// 3. Recursively find all HTML, JS, and CSS files in the out/ directory
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

// 4. Perform global string replacement
let updatedCount = 0;

for (const filePath of filesToProcess) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Look for /_next/ and _next/ in paths
    // Be careful to use global regex flags
    const updatedContent = content
        .replace(/\/_next\//g, '/next_assets/')
        .replace(/\\"\/_next\//g, '\\"/next_assets/') // JSON escaped strings
        .replace(/_next\//g, 'next_assets/');

    if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        updatedCount++;
    }
}

console.log(`✅ Updated _next references in ${updatedCount} files.`);
