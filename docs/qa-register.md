# QA register

Checked on 25 October 2026 against the rendered 13-page PDF (`presentation/final-submission.pdf`), the prototype build and the Agoda pages named in `references/agoda-api-documentation.md`.

## Structure
- [x] 13 pages: 11 core and a 2-page prose product note. No appendix or hidden pages.
- [x] Separate information architecture diagram (page 3) and four-lane swimlane (page 4).
- [x] Every wireframe A to P has Design, Developer and Business notes written for that screen.
- [x] Product note is prose, 878 words including headings (target 650 to 900).

## Agoda accuracy
- [x] Standard sequence: status check, Preview, Confirm, Booking Detail recheck.
- [x] Confirm request includes `refundRate {currency, inclusive}` in deck, docs and prototype.
- [x] Confirm success shown as HTTP 200, empty body. No `PENDING`, `cancellationId`, ETA or idempotency flag.
- [x] 120 s possible wait shown for both Preview and Confirm.
- [x] Unknown outcome leads to a Booking Detail read before any retry.
- [x] Booking List and Booking Detail named and mapped separately; Search `cancellationDetail` kept apart from Booking Detail text.
- [x] No webhook, refund endpoint or `Idempotency-Key` claim. "Voya internal request deduplication" is described as internal.
- [x] Fee waiver only with `isFeeWaiverAllowed`; enum and status conflicts marked [V].
- [x] Cutoff boundary conflict marked [V]; penalty deadline kept separate from API eligibility.

## Fictional data
- [x] Sun 25 Oct 2026, Mon 7 Dec 2026, Thu 10 Dec 2026, Sat 12 Dec 2026 verified with Python's calendar.
- [x] Full, partial and no-refund values come from three separate fixtures (VY-1042, VY-1057, VY-1063).

## Prototype
- [x] `npm run build` and `eslint` pass.
- [x] Ten scenarios run end to end in headless Chromium: full, partial, no refund with and without waiver, waiver accepted and declined, already cancelled, assisted, Preview failure, Confirm timeout then recheck, refund mismatch 914 then fresh Preview.

## Not verified
- The cancellation cutoff boundary, fee-waiver reason values and statuses, and account permissions need Agoda's confirmation.
- The wording we attach to each `cancelReason` code is a Voya choice; the meaning of each code was not checked against Agoda's table.
- We did not test against Agoda's sandbox. All responses in the prototype are simulated.
- Source URLs were read during this work; re-open them before submission in case Agoda changes the pages.
