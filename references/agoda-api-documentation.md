# Agoda Demand API: reference notes

Notes behind the Developer (API) notes in the deck. Tags: **[D]** documented on the Agoda page named, **[A]** Voya assumption, **[V]** unclear or undocumented. Agoda's Demand documentation is at https://developer.agoda.com/demand/ (the older `partners.agoda.com/DeveloperPortal` links in the assignment redirect there). Pages we read: getting-started, cancel-bookings, fee-waiver-cancellation, retrieve-bookings (Booking List and Booking Detail), json-search-api, json-book-api, post-booking-api, appendix, best-practices-certification-process.

## Integration models [D, getting-started]
- Online Affiliates / MSE: search only.
- Agoda Fulfill Assisted: Agoda handles payment and post-booking service.
- Partner Fulfillment: the partner handles payment and post-booking service. Voya is assumed to be here [A].

## Authentication [D]
`Authorization: siteId:apikey` or OAuth 2.0. Invalid or missing credentials return error 108; IP restriction violations return HTTP 401; the certification guide requires partner server IPs to be on Agoda's allow list.

## APIs used for cancellation
| API | Use | Notes |
|---|---|---|
| Search (JSON) | Policy snapshot at booking | `features.extra` can include `cancellationDetail`. Response `cancellationPolicy {code, cancellationText, parameter[], date[]}`, `freeCancellation`, `propertyUtcOffset`; times are hotel-local [D] |
| Book | Create the booking | Returns `id`, `itineraryID`, `selfService`, `processing`. Partner `tag` lets you find a booking after a timeout [D] |
| Booking List | Find bookings by recent window or tag | Reconciliation, not My trips [D] |
| Booking Detail | Status and text policy | Up to 40 ids per call. `status`, `cancellationPolicy` (text), `isFeeWaiverAllowed`, `feeWaiverStatus`, `hotelConfirmationNumber` [D] |
| Cancel Preview | Quote | `{bookingId}` in; `cancellationSummary {bookingId, reference, cancellationPolicy[], paymentRate[], refundRate[]}` out. Up to 120 s [D] |
| Cancel Confirm | Cancel | `{bookingId, reference, cancelReason, remark?, refundRate{currency, inclusive}}`; HTTP 200 empty body on success. Up to 120 s [D] |
| Confirm with `requestingFeeWaiver` | Fee waiver | `feeWaiverReason`, `remark`; the hotel decides [D] |

Booking statuses listed: BookingReceived, BookingCharged, BookingConfirmed, Departed, BookingRejected, BookingCancelled, BookingCancelledByCustomer, BookingTest, TechnicalError, AllotmentAlert [D, Appendix].

## Cancellation boundary [V]
The cancellation guide says cancellation is allowed up to one day before check-in. The certification guide describes a cutoff of 12:00 AM on the check-in date in hotel-local time. We keep the date a penalty starts (a Voya fixture, Mon 7 Dec 2026, 6:00 PM) separate from the API cutoff, and treat anything near check-in as an assisted case.

## Not documented, so not claimed
A cancellation or refund webhook, a refund-status endpoint, an `Idempotency-Key` header, a refund timing for the traveler, and `PENDING`, `cancellationId` or an ETA in the standard Confirm response.
