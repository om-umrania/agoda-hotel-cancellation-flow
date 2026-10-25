# Change log: previous version to rebuilt version

| Issue in the previous version | Repair | Where |
|---|---|---|
| High-fidelity colored deck with iOS and Android mockups, emoji, slogans | Low-fidelity greyscale Android wireframes only | Deck pages 5 to 10, prototype |
| 55 corner cases and invented scenarios | 20 cases in a matrix, 10 shown | `docs/edge-case-matrix.md`, deck page 11 |
| Confirm modelled with `status`, `PENDING`, `cancellationId`, refund ETA, idempotency flag | Standard Confirm is HTTP 200 with an empty body; Voya reads Booking Detail | Deck pages 4, 7, 8; prototype; `docs/api-integration.md` |
| Confirm request missing `refundRate` | Request carries `{bookingId, reference, cancelReason, refundRate}`; mock validates the binding | Prototype `lib/simulated-agoda.ts`, deck page 7 |
| `Idempotency-Key` header and "Agoda reference plus our key" idempotency | Voya internal request deduplication only; nothing sent to Agoda | Prototype `app/api/voya/confirm`, docs |
| Invented endpoint paths, `refund.completed` webhook, "5 to 7 working days" | Removed. Refund timing is Voya's gateway, not promised | Docs, deck pages 8 and 12 |
| `cancelReason: 7` and "0 to 44" as a range | Documented values only; 0 when skipped | Prototype `lib/fixtures.ts`, deck page 7 |
| "Retrieve Booking" used for everything | Booking List and Booking Detail named separately; Search `cancellationDetail` kept apart | Deck pages 5, 11 |
| Cutoff stated as settled | Two documented boundaries marked [V]; penalty deadline kept separate | Deck pages 2, 10, 11, 13 |
| Fee waiver as a regular option | Conditional on `isFeeWaiverAllowed` and permission; hotel decides; statuses marked [V] | Deck page 9, prototype |
| Example booking 26 Oct, near check-in, with countdown rings | Check-in Thu 10 Dec 2026, demo date Sun 25 Oct 2026, no countdowns | All |
| Live site described as a working integration | Labelled "Interactive prototype using simulated Agoda API responses" | Prototype, README |
| "Refund shown is refund paid" promise | Estimated refund wording; booking status and refund status kept separate | Deck pages 6, 8, 12 |
| Prose with templated phrasing | Rewritten in plain prose, two editorial passes | Deck pages 12 and 13, docs |
