# Shared parser reads day-first tenant dates as month-first — 379 reports

## Scope and count

The supplied KB export contains **379 unique reports** classified as `parser` in merged ticket #4471.
This is one mechanism, distinct from the booking-v3 date-hint mismatch (33 reports).
The combined export has 427 rows, but 15 are overlapping-page repeats; deduplicate by report ID before counting.
Count source: the exported `uniqueById`, `groupByCause`, `causeOf` and tenant directory, run by `npm run audit:reports`.
See `evidence/parser-reports.csv` for the complete membership and `evidence/report-audit.json` for the audit.

## Problem

The shared parser reads every numeric date month first while the affected tenants write dates day first.
The classification uses tenant locale, form version and channel, not intake's browser-locale guess.
All 11 tenants occur in this group. Reports were received from 2026-04-01 through 2026-10-04.
Of this group's intake tags, 356 say parser and 23 incorrectly say hint.

## Reproduction from the exported behavior

1. Use Harbour Dental (`en-GB`, booking-v2), on an app, email or booking-v2 form path.
2. Submit `07/04/2026`, intended as 7 April 2026 under the tenant's locale.
3. Observe that month-first parsing produces 4 July 2026 in the invite.

Expected: preserve 7 April according to the tenant's documented date convention.
Actual: day and month are transposed for ambiguous numeric dates.
This is supported by the export and has not been reproduced against production.

Example: R-41200 says its 7 April reminder went out on 4 July. R-41201 reverses the wording in a correction;
they remain two report IDs, not two proven affected users. The same mechanism appears under different subjects.

## Evidence that needs follow-up

Five desk-note reports are included in this count by the supplied classifier: R-41202, R-41209, R-41236,
R-41344 and R-41620. Their descriptions suggest one-day or other timing anomalies, which do not establish
the parser as their true cause. R-41344 describes Lisbon and Toronto seeing different days for one meeting.
Keep these reports visible while collecting original inputs, stored instants, timezone settings and rendered invites.
Do not count them a second time or assert a confirmed timezone defect from this export alone.

## Verification criteria

- Preserve day-first and month-first intent using the tenant's locale or an explicit unambiguous input contract.
- Check ambiguous dates such as `07/04/2026`, days greater than 12, invalid dates and unchanged valid dates.
- Check app, email and booking-v2 form paths and inspect the generated invite as well as the stored date.
- Independently verify booking-v3's hint; a shared-parser fix does not demonstrate that issue is fixed.
- Investigate the five flagged reports before claiming their underlying failures are resolved.

## Engineering outcome and closure

After the first submission, the course's engineering update reported #4471 closed on 5 October:
parser **FIXED**, with change `fix(dates): parse dd/mm for eu locales`.
Source: https://hq.mega.dev/challenges/what-it-shows; the captured update is in `evidence/desk-update.json`.
This issue is closed as **completed** on that evidence, rather than merely because the review was published.
The export-based analysis and verification criteria above describe the pre-fix reports; this review did not
independently test production or establish the true causes of the five flagged timing descriptions.
