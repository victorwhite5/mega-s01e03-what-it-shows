# Booking-v3 date hint disagrees with day-first parsing — 33 reports

## Scope and count

The supplied KB export contains **33 unique reports** classified as `hint` in merged ticket #4471.
They need a separate issue from the shared parser's 379 reports. The groups sum to 412 unique reports.
The export has 427 rows with 15 repeated rows; count report IDs once.
Count source: the exported `uniqueById`, `groupByCause`, `causeOf` and tenant directory, run by `npm run audit:reports`.
See `evidence/hint-reports.csv` for every report ID and `evidence/report-audit.json` for the audit.

## Problem

Booking-v3 prints `MM/DD/YYYY`, but its form reads the entered value in the day-first tenant's order.
Following the instruction therefore produces the wrong date. A shared-parser change alone does not correct
the field instruction. This cause applies only to the form channel for these day-first booking-v3 tenants:
Alder Physio (`de-DE`), Copper Studio (`es-ES`) and Pale Harbour (`pt-PT`).
App and email reports from those tenants belong to the parser group under the supplied rules.
Reports in this group were received from 2026-04-17 through 2026-09-22.
Intake called 18 hint and 15 parser, so intake tags alone undercount this group.

## Reproduction from the exported behavior

1. Open booking-v3 for Alder Physio (`de-DE`) on the form channel.
2. Follow the displayed `MM/DD/YYYY` hint and enter `04/07/2026` for 7 April 2026.
3. The form reads it in the tenant's day-first order and produces 4 July 2026.

Expected: the hint, examples and actual input interpretation agree on 7 April.
Actual: following the hint leads to a transposed date.
This is supported by the exported rules and has not been reproduced against production.

Examples: R-41230 (Copper Studio, form) was tagged parser but classifies as hint;
R-41241 (Alder Physio, form) and R-41251 (Pale Harbour, form) show the same mechanism under other subjects.
The repeated export row for R-41251 counts once.

## Verification criteria

- Make the visible hint and examples match the form's actual locale-specific parser for each affected tenant.
- Enter an ambiguous date by following the hint, submit it and verify the stored date and resulting invite.
- Check all three booking-v3 tenants, month-first control locales and unaffected booking-v2 forms.
- Keep this issue separate from the shared-parser change and verify both independently.

No fix is claimed. Matching subject lines or a “known” label do not justify merging different mechanisms.
