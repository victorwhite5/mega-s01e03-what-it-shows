import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const pages = ['incidents/4471-review', 'decisions/0002-dedupe-by-cause'];
const results = pages.map((route) => {
  const source = readFileSync(new URL(`../src/routes/kb/${route}/+page.svx`, import.meta.url), 'utf8');
  const signature = source.match(/^signature: '([^\n]+)'$/m)?.[1]?.replaceAll("''", "'");
  assert(signature, 'Added page must carry the course-issued signature.');
  assert(source.includes('<RenderStamp {signature} />'), 'The page must render its frontmatter signature.');
  const expectedRef = deskRef(signature);
  const html = readFileSync(new URL(`../docs/kb/${route}/index.html`, import.meta.url), 'utf8');
  assert(html.includes(expectedRef), 'Rendered desk reference differs from the signed source.');
  assert(!html.includes('no desk ref:'), 'Rendered page is unsigned.');
  return { route, deskRef: expectedRef, signedSourceAndRenderAgree: true };
});
const incident = readFileSync(new URL('../docs/kb/incidents/4471-review/index.html', import.meta.url), 'utf8');
for (const value of ['fix(dates): parse dd/mm for eu locales', 'not planned', 'retired']) {
  assert(incident.includes(value), 'The rendered page must preserve the engineering outcomes.');
}
const audit = JSON.parse(readFileSync(new URL('../evidence/report-audit.json', import.meta.url), 'utf8'));
for (const group of audit.groups) {
  assert(new RegExp(`<td[^>]*>${group.count}</td>`).test(incident), 'Rendered report counts differ from the audit.');
}
let browserChecked = false;
if (process.argv[2]) {
  const browser = readFileSync(process.argv[2], 'utf8');
  assert(browser.includes(results[0].deskRef), 'Browser-rendered signature reference is missing.');
  assert(browser.includes('Engineering update and closure'), 'Browser rendered an error instead of the review.');
  assert(browser.includes('different causes — keep apart'), 'Browser triage explorer did not render.');
  browserChecked = true;
}
const result = { status: 'passed', pages: results, countsAgreeWithAudit: true,
  engineeringOutcomesRendered: true, browserChecked };
writeFileSync(new URL('../evidence/final-render-check.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
