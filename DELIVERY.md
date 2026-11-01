# S01E03: #4471 review

This repository preserves the support KB export supplied for the MEGA.dev challenge and adds a signed review,
a proposed replacement decision and a reproducible local SvelteKit/mdsvex build.

## Review

- Parser issue: https://github.com/victorwhite5/mega-s01e03-what-it-shows/issues/1.
- Hint issue: https://github.com/victorwhite5/mega-s01e03-what-it-shows/issues/2.
- Signed incident source: `src/routes/kb/incidents/4471-review/+page.svx`.
- Rendered incident: `docs/kb/incidents/4471-review/index.html` (created by the build).
- Proposed decision: `src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`.
- Signature: the exact course-issued ticket in each added page's frontmatter; RenderStamp derives its desk reference.
- Audit: `evidence/report-audit.json`, `evidence/parser-reports.csv`, `evidence/hint-reports.csv`.
- Issue bodies: `issue-drafts/parser.md` and `issue-drafts/hint.md`.

The export contains 427 rows representing 412 unique reports: 379 parser and 33 form-hint reports.
Five anomalous bodies remain flagged in the parser count according to the supplied rules, with follow-up
required rather than an unsupported claim that their true cause is known. The counts remain an export
snapshot rather than a live desk total. The course's subsequent engineering update reports #4471 closed
on 5 October: the parser is fixed (`fix(dates): parse dd/mm for eu locales`), while the hint is won't fix
because booking-v3 was retired. Issue #1 is completed; issue #2 is not planned. The review records those
reported outcomes without claiming an independent production test. See `evidence/desk-update.json`.

The existing accepted decision and historical incident page remain intact. Read their rendered components
alongside the prose: the cause table and triage explorer contradict the old single-issue, subject-only guidance.
The new decision is proposed; it does not claim adoption by the support desk.

## Rebuild and read

Use Node.js 24 or newer:

```sh
npm ci
npm run audit:reports
npm run build
npm run verify:render
npm run preview
```

Open the preview URL followed by `/kb/incidents/4471-review/`.
Alternatively serve the committed rendered files with `python3 -m http.server 4173 --directory docs`.
The HTML includes the computed content and signature reference; JavaScript enables the triage explorer.
No hosted deployment is required to inspect the committed page.

## Counting

The audit runs the export's actual `causes.ts` with the tenant directory, using the platform's
`Intl.DateTimeFormat` locale ordering. It checks that repeated rows agree and every unique report has one group.
It does not count subjects, browser locales or intake tags as causes. Both CSV files identify the reports
included in the corresponding issue count. Preserve original input and timezone evidence for the five flagged
reports before asserting a root cause or closing their failures.

## Source

Input archive: `kb-export-267efc5e.zip`, exported 2026-10-04; provided by the student.
All software build dependencies are pinned in `package.json` and resolved in the lockfile when installed.
