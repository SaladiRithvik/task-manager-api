const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

if (!fs.existsSync(summaryPath)) {
  process.exit(0);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const files = Object.keys(summary).filter((key) => key !== 'total');

if (files.length === 0) {
  process.exit(0);
}

const totals = { statements: 0, branches: 0, functions: 0, lines: 0 };

files.forEach((file) => {
  const fileSummary = summary[file];
  totals.statements += fileSummary.statements.pct;
  totals.branches += fileSummary.branches.pct;
  totals.functions += fileSummary.functions.pct;
  totals.lines += fileSummary.lines.pct;
});

const avg = (key) => (totals[key] / files.length).toFixed(2);

// Column widths match Jest's built-in text coverage table.
const WIDTHS = { file: 18, stmts: 9, branch: 10, funcs: 9, lines: 9 };

const center = (text, width) => {
  const padding = width - text.length;
  const left = Math.floor(padding / 2);
  const right = padding - left;
  return ' '.repeat(Math.max(left, 0)) + text + ' '.repeat(Math.max(right, 0));
};

const rightAlign = (text, width) => {
  return ' '.repeat(Math.max(width - 1 - text.length, 0)) + text + ' ';
};

const divider = [WIDTHS.file, WIDTHS.stmts, WIDTHS.branch, WIDTHS.funcs, WIDTHS.lines]
  .map((w) => '-'.repeat(w))
  .join('|');

const header = [
  'File'.padEnd(WIDTHS.file),
  center('% Stmts', WIDTHS.stmts),
  center('% Branch', WIDTHS.branch),
  center('% Funcs', WIDTHS.funcs),
  center('% Lines', WIDTHS.lines),
].join('|');

const row = [
  'Average'.padEnd(WIDTHS.file),
  rightAlign(avg('statements'), WIDTHS.stmts),
  rightAlign(avg('branches'), WIDTHS.branch),
  rightAlign(avg('functions'), WIDTHS.funcs),
  rightAlign(avg('lines'), WIDTHS.lines),
].join('|');

console.log(divider);
console.log(header);
console.log(divider);
console.log(row);
console.log(divider);
