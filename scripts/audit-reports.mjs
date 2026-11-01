import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { causeOf, groupByCause, readAs, uniqueById } from '../src/lib/kb/causes.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = `${root}src/lib/data/`;
const raw = JSON.parse(readFileSync(`${data}reports-4471.json`, 'utf8'));
const notes = JSON.parse(readFileSync(`${data}desk-notes.json`, 'utf8'));
const tenants = new Map(readdirSync(`${data}tenants`).filter((name) => name.endsWith('.json')).map((name) => {
  const tenant = JSON.parse(readFileSync(`${data}tenants/${name}`, 'utf8'));
  return [tenant.handle, tenant];
}));
const tenantOf = (report) => tenants.get(report.tenant);
const reports = uniqueById(raw).filter((report) => report.mergedInto === 4471);
const groups = groupByCause(reports, tenantOf);
const duplicateIds = [...new Set(raw.map((report) => report.id))]
  .filter((id) => raw.filter((report) => report.id === id).length > 1);
assert(duplicateIds.every((id) => new Set(raw.filter((report) => report.id === id)
  .map((report) => JSON.stringify(report))).size === 1), 'Duplicate rows disagree; resolve them before counting.');
assert.equal(groups.reduce((sum, group) => sum + group.reports.length, 0), reports.length);
assert(groups.every((group) => group.cause !== 'unplaced'), 'Some reports need tenant lookup before classification.');
const knownOneDay = new Set(notes.oneDayMove);
const summary = {
  ticket: 4471,
  rawRows: raw.length,
  uniqueReports: reports.length,
  repeatedRows: raw.length - uniqueById(raw).length,
  duplicateIds,
  intakeDisagreements: reports.filter((report) => report.meta.intakeTag !== causeOf(report, tenantOf(report))).length,
  groups: groups.map((group) => ({
    cause: group.cause,
    count: group.reports.length,
    tenants: group.tenants,
    firstSeen: group.firstSeen,
    lastSeen: group.lastSeen,
    intakeTags: group.taggedAs,
    oneDayReadings: readAs(group, notes.oneDayMove),
    reportIds: group.reports.map((report) => report.id),
  })),
  oneDayReports: reports.filter((report) => knownOneDay.has(report.id)),
  mergedOnJuly2: reports.filter((report) => report.mergedAt?.startsWith('2026-07-02')).length,
  receivedBeforeJuly2: reports.filter((report) => report.receivedAt.slice(0, 10) < '2026-07-02').length,
  firstReceived: reports.map((report) => report.receivedAt.slice(0, 10)).sort()[0],
  lastReceived: reports.map((report) => report.receivedAt.slice(0, 10)).sort().at(-1),
};
mkdirSync(`${root}evidence`, { recursive: true });
writeFileSync(`${root}evidence/report-audit.json`, `${JSON.stringify(summary, null, 2)}\n`);
for (const group of groups) {
  const lines = ['id,tenant,locale,form,channel,intakeTag,receivedAt,mergedAt', ...group.reports.map((report) => {
    const tenant = tenantOf(report);
    return [report.id, report.tenant, tenant.locale, tenant.form, report.channel, report.meta.intakeTag,
      report.receivedAt, report.mergedAt].join(',');
  })];
  writeFileSync(`${root}evidence/${group.cause}-reports.csv`, `${lines.join('\n')}\n`);
}
console.log(JSON.stringify({ ...summary, groups: summary.groups.map(({ reportIds, ...group }) => group),
  oneDayReports: summary.oneDayReports.map((report) => report.id) }, null, 2));
