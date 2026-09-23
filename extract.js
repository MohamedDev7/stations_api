const cp = require('child_process');
const txt = cp.execSync('git show HEAD:"controllers/reportsController .js"', {encoding: 'utf8'});
const start = txt.indexOf('exports.getFinancialBalanceReport');
console.log(txt.slice(start, start + 3000));
