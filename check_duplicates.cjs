const fs = require('fs');
const Papa = require('papaparse');
let total = 0;
let unique = new Set();

['判断题.csv', '单选题.csv', '多选题.csv'].forEach(f => {
    if (!fs.existsSync('public/' + f)) return;
    const data = Papa.parse(fs.readFileSync('public/' + f, 'utf8'), {header:true, skipEmptyLines:true}).data;
    data.forEach(q => {
        unique.add(q.front);
        total++;
    });
});
console.log('Total:', total);
console.log('Unique:', unique.size);
