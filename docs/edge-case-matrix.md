# Edge-case matrix

Twenty cases identified for the cancellation flow. Ten of them appear on page 11 of the submission deck (marked **deck**). Each row gives the trigger, what the system does, what the traveler sees, the recovery step, and the type of evidence: [D] documented by Agoda, [A] Voya assumption, [V] needs validation with Agoda.

| # | Case | Trigger | System behavior | Traveler sees | Recovery | Evidence |
|---|---|---|---|---|---|---|
| 1 | Full refund (deck) | Cancel Preview returns refundRate equal to paymentRate | Store reference and refundRate; wait for explicit confirm | Estimated refund equal to amount paid (screen D) | Continue or Keep booking | [D] fields; [A] price parity |
| 2 | Partial refund (deck) | refundRate lower than paymentRate | Same as case 1; fee computed for display only | Refund, fee and policy text (E) | Continue or Keep booking | [D] fields; [A] fee line |
| 3 | No refund, cancellable (deck) | refundRate.inclusive is 0 | Allow Confirm with refundRate 0 | "No refund for this booking" before Continue (F) | Continue, Keep, or waiver if permitted | [D] |
| 4 | Already cancelled (deck) | Booking Detail status BookingCancelled or BookingCancelledByCustomer | No Preview, no Confirm | Cancelled status, no Cancel button (O) | Contact support | [D] statuses |
| 5 | Ineligible status or too close to check-in (deck) | Status not BookingConfirmed, or check-in inside Voya's cutoff rule | Route to assisted cancellation | "We can't cancel this booking in the app" (N) | Contact support with reference | [A] rule; [V] boundary |
| 6 | Check-in day or last-minute | Date after the API cutoff in hotel-local time | Same as case 5 | Same as N | Support cancels by hand | [V] one day before check-in vs 12:00 AM on check-in date |
| 7 | Preview slow or failing (deck) | Preview takes up to 120 s, or returns an error | Backend owns the wait; no quote shown; no speculative amount | Waiting screen (C), then "We couldn't cancel this booking" (P) if it fails | Back to booking, Try again, support | [D] SLA and error shape |
| 8 | Confirm timeout (deck) | No reply to Confirm | Read Booking Detail before any retry; fresh Preview only if still active | "We couldn't confirm the result yet" (J), then Confirmed (I) or Try again | Booking Detail recheck, support | [D] SLA; [A] recheck order |
| 9 | Stale quote or refund mismatch (deck) | Confirm rejected with error 914 | Recheck status; fresh Preview; show new amount | "The refund amount changed" on the preview screen | Review and confirm again | [D] error 914 example |
| 10 | Auth, permission or non-retryable error | Authentication or permission errors: 101, 102, 108, HTTP 401 and 403 | Log, alert operations, no retry loop | "We couldn't cancel this booking" (P) | Support | [D] codes; [A] handling |
| 11 | Fee waiver unavailable (deck) | isFeeWaiverAllowed is false, or account lacks permission (error 924) | Do not show waiver entry | No waiver link on the preview | Cancel under original terms or support | [D] field; [V] permission |
| 12 | Fee waiver pending then decided (deck) | Confirm with requestingFeeWaiver true | Poll Booking Detail feeWaiverStatus up to 72 h, not past 12:00 AM on check-in date | Pending (L), then accepted or declined (M) | Support if status is unreadable | [D] polling; [V] statuses and reason values |
| 13 | Manual assistance after retries | Repeated failures or ineligible | Create support case with reference and sanitized diagnostics | Contact support | Support completes by hand | [A] |
| 14 | Back out before final confirm | Traveler taps Keep booking or back | No Agoda call after Preview | Booking details, still confirmed | None needed | [A] |
| 15 | Wrong account or ownership mismatch | Booking does not belong to signed-in user | Reject at Voya before any Agoda call | Booking not found in My trips | Support | [A] |
| 16 | Quote changes after display, midnight or time-zone boundary | Policy tier changes between Preview and Confirm | Error 914 path, or fresh Preview before Confirm | Updated amount | Review again | [D] 914 example; [A] |
| 17 | Currency, tax, coupon or Voya markup differences | Voya charged the traveler a different amount than Agoda quotes | Show Agoda's quote and Voya's refund separately before launch | Estimated refund figure | Business decision before launch | [A] [V] |
| 18 | Multi-room or partial-room cancellation | More than one room on the booking | Out of scope for v1; route to support | Cannot cancel in app | Support | [A] |
| 19 | Booking cancelled, traveler refund delayed | Voya gateway refund not yet processed | Track booking status and refund status separately | "We will message you when it has been processed" | Notification; support | [A] gateway |
| 20 | Network lost or app closed mid-call | Android app loses connection or closes during Preview or Confirm | Backend holds request state; app restores by reading booking status | Status screen on reopen | Recheck, never restart Confirm blindly | [A] |
