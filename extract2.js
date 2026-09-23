const fs = require('fs');
const txt = fs.readFileSync('C:/Users/Mohamed/.gemini/antigravity-ide/brain/5630bea5-8ffb-4f72-9a8d-6a335c80e792/.system_generated/logs/transcript.jsonl', 'utf8');
const lines = txt.split('\n');
const m = lines.find(l => l.includes('VIEW_FILE') && l.includes('getFinancialBalanceReport'));
if (m) {
    const start = m.indexOf('getFinancialBalanceReport');
    fs.writeFileSync('orig_fn.txt', m.slice(start, start + 8000).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    console.log('done');
} else {
    console.log('not found');
}
