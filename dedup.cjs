const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function deduplicateFile(filename) {
    const filePath = path.join(publicDir, filename);
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const results = Papa.parse(content, { header: true, skipEmptyLines: true });
    
    const unique = [];
    const seen = new Set();
    
    results.data.forEach(row => {
        if (!row.front) return;
        // Normalize front to catch slight variations like "1. " vs "1、"
        let normFront = row.front.replace(/\s+/g, '').replace(/、/g, '.').trim();
        if (!seen.has(normFront)) {
            seen.add(normFront);
            unique.push(row);
        }
    });
    
    const csv = Papa.unparse(unique, { quotes: true });
    fs.writeFileSync(filePath, csv, 'utf-8');
    console.log(`${filename}: kept ${unique.length} out of ${results.data.length}`);
}

deduplicateFile('单选题.csv');
deduplicateFile('多选题.csv');
deduplicateFile('判断题.csv');
