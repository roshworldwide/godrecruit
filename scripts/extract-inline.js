const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');

function getHtmlFiles(dir, filesList = []) {
    if (!fs.existsSync(dir)) return filesList;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            getHtmlFiles(fullPath, filesList);
        } else if (fullPath.endsWith('.html')) {
            filesList.push(fullPath);
        }
    }
    return filesList;
}

const htmlFiles = getHtmlFiles(outDir);
let chunkCounter = 0;

for (const htmlFile of htmlFiles) {
    let html = fs.readFileSync(htmlFile, 'utf8');

    const inlineScriptRegex = /<script(?![^>]*\bsrc\b)([^>]*)>([\s\S]*?)<\/script>/gi;

    let match;
    const replacements = [];

    while ((match = inlineScriptRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const attributes = match[1];
        const code = match[2];

        if (!code.trim()) continue;

        chunkCounter++;
        const chunkFilename = `inline-chunk-${chunkCounter}.js`;
        const chunkPath = path.join(outDir, chunkFilename);

        fs.writeFileSync(chunkPath, code, 'utf8');

        const newTag = `<script src="/${chunkFilename}"${attributes}></script>`;

        replacements.push({ original: fullTag, replacement: newTag });
    }

    for (const { original, replacement } of replacements) {
        html = html.replace(original, replacement);
    }

    if (replacements.length > 0) {
        fs.writeFileSync(htmlFile, html, 'utf8');
        const relPath = path.relative(outDir, htmlFile);
        console.log(`✅ Extracted ${replacements.length} inline script(s) from ${relPath}`);
    }
}

console.log(`✅ Total inline chunks extracted: ${chunkCounter}`);
