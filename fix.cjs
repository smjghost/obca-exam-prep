const fs = require('fs');
let code = fs.readFileSync('merge_and_add.cjs', 'utf8');
code = code.replace(/单选题_批次1\.csv/g, '单选题.csv').replace(/单选题_批次2\.csv/g, 'not_exist_file.csv');
code = code.replace(/多选题_批次1\.csv/g, '多选题.csv').replace(/多选题_批次2\.csv/g, 'not_exist_file.csv');
code = code.replace(/判断题_批次1\.csv/g, '判断题.csv').replace(/判断题_批次2\.csv/g, 'not_exist_file.csv');
fs.writeFileSync('merge_and_add.cjs', code);
