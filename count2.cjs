const fs = require('fs');
const Papa = require('papaparse');
let sum = 0;
['判断题.csv', '单选题.csv', '多选题.csv'].forEach(f => {
    if (!fs.existsSync('public/' + f)) return;
    const data = Papa.parse(fs.readFileSync('public/' + f, 'utf8'), {header:true, skipEmptyLines:true}).data;
    console.log(f + ': ' + data.length);
    sum += data.length;
});
console.log('Total length: ' + sum);
