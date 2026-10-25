# API integration notes

How each screen uses Agoda's Demand API. Evidence tags: **[D]** documented by Agoda on the page cited, **[A]** Voya assumption or design decision, **[V]** unclear or undocumented, validate with Agoda. The Demand API documentation lives at https://developer.agoda.com/demand/. Exact endpoint paths are not repeated here because we did not verify them; use the paths in Agoda's own pages when building.

## Standard cancellation sequence

1. **Read the booking.** Booking Detail returns status, the text `cancellationPolicy`, `isFeeWaiverAllowed` and `feeWaiverStatus` [D, retrieve-bookings]. Booking List is a different API: it looks up bookings by recent window or partner tag, so Voya uses it for reconciliation and not for building My trips [D]. My trips itself reads Voya's own booking table [A].
2. **Decide eligibility.** Voya checks the status and the hotel-local date. If the booking is already cancelled, show that. If it is not self-service eligible, route to support [A]. The cutoff is documented two ways: one day before check-in in the cancellation guide, and 12:00 AM on the check-in date in the certification guide [V].
3. **Cancel Preview** with `{bookingId}`. Returns `cancellationSummary` with `bookingId`, `reference`, `cancellationPolicy[]` (language and policyText), `paymentRate[]` and `refundRate[]` [D, cancel-bookings]. May take up to 120 seconds [D]. Show the refund from `refundRate`; do not recompute it on the phone [A].
4. **Traveler decides.** Keep booking sends nothing to Agoda [A].
5. **Cancel Confirm** with `{bookingId, reference, cancelReason, remark?, refundRate:{currency, inclusive}}` copied from the latest Preview [D]. Success is HTTP 200 with an empty body [D]. May take up to 120 seconds [D]. Errors return `errorMessage {id, subId, message}` [D].
6. **Verify.** After any Confirm result, including no reply, read Booking Detail before telling the traveler anything or retrying [A]. Show Cancellation confirmed only when the status says cancelled. The exact cancelled status value to expect after a self-service cancellation should be checked in the sandbox [V].

## Fields Voya must not invent

Agoda's standard Confirm does not return `status`, `PENDING`, `cancellationId`, a refund ETA or an idempotency flag. Voya's own records and its payment gateway supply any refund tracking [A].

## cancelReason

Send `0` when the traveler skips the question. Otherwise use only values listed in Agoda's cancellation guide: 0, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 25 and 44 [D]. The wording we show for each code is a Voya choice and the meaning of each code needs checking against Agoda's table before launch [V]. Do not use 7.

## Errors worth handling [D, Appendix and cancel-bookings]

| Code | Meaning | Voya handling |
|---|---|---|
| 914 (example) | Refund no longer matches the quote | Recheck status, fresh Preview, show the new amount |
| 101, 102, 108 | Authentication failures such as an invalid or missing site ID or key | Log and alert; never show the code to the traveler |
| HTTP 401, 403 | Missing key, IP restriction or permission | Same as above |
| 924 | Fee waiver not allowed for the site | Hide the waiver entry |
| HTTP 500, 429 | Retryable | Recheck Booking Detail, then a fresh Preview; back off |

The certification guide also requires Voya's server IP addresses to be on Agoda's allow list [D].

## Fee waiver (separate, conditional path)

Offered only when Booking Detail shows `isFeeWaiverAllowed` and the account has permission [D, fee-waiver-cancellation]. The request is a Confirm call with `requestingFeeWaiver: true`, `feeWaiverReason` and `remark`. The hotel decides. Voya polls Booking Detail `feeWaiverStatus` for up to 72 hours, but not past 12:00 AM on the check-in date [D]. Sandbox hotels for testing: 11484 accepts immediately, 178562 rejects immediately, 42976 stays pending and accepts after 24 hours [D].

Open points [V]: the guide's example uses `feeWaiverReason: 1` while its table lists standard reasons and the Appendix lists values 1 to 7; the guide lists statuses Pending, Accept, Reject, Cancelled and AutoReject while the Appendix lists Pending, Accept, Reject, Cancelled and Timeout; and whether the booking is already cancelled while the waiver is pending.

## What Agoda does not document, so Voya must not claim

- A webhook or push event for cancellation or refund completion.
- A separate refund-status endpoint.
- An `Idempotency-Key` header on Confirm. Voya's own request deduplication is internal only and does not make Confirm exactly-once.
- When the traveler's money is returned under Partner Fulfillment. That is Voya's payment gateway [A].
