# Product requirements, version 1

## Goal
A traveler can cancel one confirmed booking from the Voya Android app, see the estimated refund before agreeing, and learn the result without ambiguity.

## Functional requirements
1. My trips lists upcoming, past and cancelled bookings from Voya's own records.
2. Booking details shows status, dates, guests, amount paid and the saved cancellation policy, and shows Cancel booking only when the status allows it.
3. Cancel booking calls Cancel Preview and shows the estimated refund, the fee, and the policy text with hotel and dates.
4. The traveler can keep the booking at any point before Confirm.
5. Confirm uses the reference and refund amount from the latest Preview. The reason question is optional.
6. After Confirm, Voya reads Booking Detail and shows Cancellation confirmed only when the status says cancelled.
7. If Confirm gets no reply, Voya shows "We couldn't confirm the result yet", reads Booking Detail, and offers a retry only if the booking is still active.
8. If Confirm is rejected because the refund changed, Voya shows the new amount and asks again.
9. Fee waiver is offered only when Booking Detail shows `isFeeWaiverAllowed` and the account has permission. The traveler is told the hotel decides.
10. Bookings that cannot be cancelled in the app go to Contact support with the booking reference.

## Non-requirements (version 1)
Date changes, partial-room cancellation, no-show disputes, a refund-tracking engine, and any promise of refund timing.

## Measures to track after launch (no baselines yet)
Share of eligible bookings cancelled in the app; drop-off between seeing a quote and confirming; Preview and Confirm timeout and error rates; time to show the first quote; share of cancellations going to support; refund-related contacts after cancellation.

## Open validation items
Account permissions; exact cancellation cutoff; fee-waiver reason values and statuses; how and when the traveler's refund settles; support ownership of manual cancellations.
