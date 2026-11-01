<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const unique = uniqueById(reports as Report[]).filter((report) => report.mergedInto === 4471);
  const repeated = reports.length - uniqueById(reports as Report[]).length;
  const disagreements = unique.filter((report) => report.meta.intakeTag !== causeOf(report, tenantOf(report)));
  const oneDay = unique.filter((report) => notes.oneDayMove.includes(report.id));
  const julyMerge = unique.filter((report) => report.mergedAt?.startsWith('2026-07-02'));
  const earlier = unique.filter((report) => report.receivedAt.slice(0, 10) < '2026-07-02');
  const received = unique.map((report) => report.receivedAt.slice(0, 10)).sort();
</script>

<p>
  The export contains <strong>{reports.length} rows</strong>, including <strong>{repeated} repeated rows</strong>.
  Deduplicating by report ID leaves <strong>{unique.length} reports</strong> in #4471.
  Tenant locale, form version and channel determine the two groups below;
  <strong>{disagreements.length} intake tags disagree</strong> with that classification.
</p>

<p>
  Reports arrived from <strong>{received[0]}</strong> through <strong>{received.at(-1)}</strong>.
  The desk merged <strong>{julyMerge.length}</strong> on 2 July, after
  <strong>{earlier.length}</strong> had already arrived. A merge spike measures triage activity,
  not when the problem began or how many people were affected.
</p>

<h3>One-day descriptions need follow-up</h3>
<p>
  <strong>{oneDay.length} reports</strong> in the desk notes describe a possible one-day move or other timing anomaly.
  The supplied classifier files them under <code>parser</code>; their bodies do not establish that cause.
  They remain in the parser count exactly once, pending evidence about stored timestamps, zones and original inputs.
  This export does not confirm a timezone bug or justify an additional disjoint count.
</p>

<ul>
  {#each oneDay as report (report.id)}
    <li><code>{report.id}</code> ({report.tenant}, {report.channel}): “{report.body}”</li>
  {/each}
</ul>
