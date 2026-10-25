# Assumptions

Each assumption is tagged: **[A]** Voya design decision or assumption, **[V]** needs validation with Agoda, **[D]** documented.

1. **Partnership model.** Voya works under Agoda's Partner Fulfillment model: Voya takes payment and handles service after the sale. Agoda documents the model; that Voya holds it is our assumption. [A] [D]
2. **Booking ownership.** Voya keeps its own booking reference beside Agoda's `bookingId`. My trips reads Voya's database. [A]
3. **Permissions.** Voya's Agoda account may call Cancel Preview, Cancel Confirm and fee waiver, and Voya's server IPs are on Agoda's allow list. [V]
4. **Search policy snapshot.** The structured `cancellationDetail` from Search is saved at booking time and shown as a reminder. Cancel Preview gives the quote. [D] [A]
5. **Price parity.** In the examples the traveler paid what Agoda quotes, in the same currency. No Voya markup, coupon or FX. [A]
6. **Traveler refund.** Voya's payment gateway returns the traveler's money. Agoda does not document the timing or method for this model, so the app names no number of days. [A] [V]
7. **Cutoffs.** The date a fee starts (the example uses Mon 7 Dec 2026, 6:00 PM hotel time) is separate from the date the API stops allowing cancellation. The latter is documented as one day before check-in in one place and as 12:00 AM on the check-in date in another. Version 1 sends bookings close to check-in to support. [V]
8. **Support.** Support can cancel by hand and receives the booking reference and sanitized diagnostics. The handoff is designed, not built. [A]
9. **Fee waiver.** When requested through Confirm, we assume the cancellation and the request go together and the original terms stand if the hotel declines. [A] [V]
10. **Scope.** Version 1 covers full cancellation of one confirmed booking. Date changes, partial-room cancellation, no-show disputes and the refund payment system are out of scope. [A]
11. **Reason question.** Optional and never blocks cancelling. The mapping from wording to `cancelReason` codes is a Voya choice. [A] [V]
12. **No biometric prompt.** We did not find a threat that a biometric check would address in a flow where the traveler is already signed in. [A]
13. **Illustrative data.** Sample Hotel, Bengaluru; check-in Thu 10 Dec 2026; check-out Sat 12 Dec 2026; demo date Sun 25 Oct 2026; amounts ₹18,240 (full refund, VY-1042), ₹12,000 (partial, VY-1057) and ₹0 (VY-1063) are separate test fixtures and not Agoda data. [A]
