"""Low-fidelity Android screens as HTML strings, plus their notes."""

HOTEL = "Sample Hotel, Bengaluru"
DATES = "Thu 10 Dec – Sat 12 Dec 2026"

def sb():
    return '<div class="sb"><span>9:41</span><span>LTE &nbsp;100%</span></div>'

def ab(title, back=True):
    return f'<div class="ab">{"<span class=bk>&larr;</span>" if back else ""}<span>{title}</span></div>'

def btn(label, kind=""):
    return f'<div class="btn {kind}">{label}</div>'

def nav(active=1):
    items = ["Search", "My trips", "Account"]
    return '<div class="nav">' + "".join(
        f'<div class="{"on" if i == active else ""}"><i></i>{n}</div>' for i, n in enumerate(items)) + '</div>'

def phone(inner, bottom="gest"):
    foot = '<div class="gest"><span></span></div>' if bottom == "gest" else bottom + '<div class="gest"><span></span></div>'
    return f'{sb()}{inner}{foot}'

def stay_card(ref="VY-1042", extra=""):
    return (f'<div class="card"><b>{HOTEL}</b><div class="muted">10 – 12 Dec 2026 · 2 nights</div>'
            f'<div class="muted">1 room, 2 adults · Ref {ref}</div>{extra}</div>')

def kv(a, b, big=False):
    return f'<div class="kv{" big" if big else ""}"><span>{a}</span><span>{b}</span></div>'

# ---------- A: My trips
def A():
    return phone(
        ab("My trips", back=False) +
        '<div class="tabs"><div class="on">Upcoming</div><div>Past</div><div>Cancelled</div></div>'
        '<div class="body">'
        f'<div class="card"><div class="imgp" style="height:58px">hotel photo</div><b style="display:block;margin-top:5px">{HOTEL}</b>'
        '<div class="muted">10 – 12 Dec 2026 · 2 nights</div><div class="kv" style="margin-top:3px"><span class="muted">Ref VY-1042</span><span class="pill">Confirmed</span></div></div>'
        '<div class="card"><div class="imgp" style="height:58px">hotel photo</div><b style="display:block;margin-top:5px">Sample Hotel, Goa</b>'
        '<div class="muted">15 – 17 Jan 2027 · 2 nights</div><div class="kv" style="margin-top:3px"><span class="muted">Ref VY-1051</span><span class="pill">Confirmed</span></div></div>'
        '</div>' + nav(1), bottom="")

# ---------- B: Booking details
def B(status="Confirmed", cancelled=False):
    cta = (btn("Contact support", "") if cancelled else btn("Cancel booking") + '<div class="lnk">Contact support</div>')
    pol = ('<div class="card g"><b>Cancellation policy</b><div class="sm" style="margin-top:2px">Free cancellation until Mon 7 Dec 2026, 6:00 PM (hotel time). After that a fee applies.</div>'
           '<div class="muted" style="margin-top:3px">Shown as saved when you booked. The exact refund is confirmed before you cancel.</div></div>')
    return phone(ab("Booking details") + '<div class="body">'
        f'<div class="kv"><b style="font-size:13px">{HOTEL}</b><span class="pill">{status}</span></div>'
        '<div class="imgp" style="height:46px">hotel photo</div>'
        '<div class="card">' + kv("Check-in", "Thu 10 Dec 2026") + kv("Check-out", "Sat 12 Dec 2026") + kv("Guests", "1 room, 2 adults") +
        kv("Voya ref", "VY-1042") + kv("Paid", "₹18,240") + '</div>' + pol + cta + '</div>')

# ---------- C: Preview loading
def C():
    return phone(ab("Review cancellation") + '<div class="body">' + stay_card() +
        '<div class="spin"></div><div style="text-align:center;font-weight:600">Checking cancellation terms</div>'
        '<div class="muted" style="text-align:center">We are checking with the hotel booking provider. This can take up to two minutes.</div>'
        '<div class="bar" style="width:80%;margin:0 auto"></div><div class="bar" style="width:55%;margin:0 auto"></div>'
        '<div style="flex:1"></div>' + btn("Back to booking") + '</div>')

# ---------- D/E/F: Preview results
def preview(ref, paid, fee, refund, policy, waiver=False, zero=False):
    mid = ''
    if zero:
        mid = '<div class="warn"><b>No refund for this booking.</b><div class="sm">This rate is non-refundable. You can still cancel, but no money will be returned. The full amount is kept.</div></div>'
    cta = btn("Continue", "p") + btn("Keep booking")
    if zero:
        policy = ""
    if waiver:
        cta += '<div class="lnk">Ask whether the cancellation fee can be waived</div>'
    return phone(ab("Review cancellation") + '<div class="body">' + stay_card(ref) +
        '<div class="card"><div class="muted">Estimated refund</div>'
        f'<div style="font-size:21px;font-weight:700">{refund}</div><div class="hr" style="margin:5px 0"></div>' +
        kv("You paid", paid) + kv("Cancellation fee", fee) + '</div>' + mid +
        (f'<div class="card g sm">{policy}</div>' if policy else '') + '<div style="flex:1"></div>' + cta + '</div>')

def D(): return preview("VY-1042", "₹18,240", "₹0", "₹18,240", "Free cancellation until Mon 7 Dec 2026, 6:00 PM (hotel time).")
def E(): return preview("VY-1057", "₹18,240", "₹6,240", "₹12,000", "Cancelled after Mon 7 Dec 2026, 6:00 PM (hotel time): a fee of ₹6,240 applies.")
def F(): return preview("VY-1063", "₹18,240", "₹18,240", "₹0", "Non-refundable rate. The full amount is kept.", waiver=True, zero=True)

# ---------- G: reason + final review
def G():
    return phone(ab("Review cancellation") + '<div class="body">' + stay_card() +
        '<div class="kv big"><span>Estimated refund</span><span>₹18,240</span></div>'
        '<div class="muted">Why are you cancelling? (optional)</div>'
        '<div class="radio on"><i></i>Prefer not to say</div><div class="radio"><i></i>Change of plans</div>'
        '<div class="radio"><i></i>Booked by mistake</div><div class="radio"><i></i>Found a better price</div><div class="radio"><i></i>Other</div>'
        '<div style="flex:1"></div>' + btn("Yes, cancel booking", "d") + btn("Keep booking") + '</div>')

# ---------- H: sending
def H():
    return phone(ab("Cancelling", back=False) + '<div class="body">' + stay_card() +
        '<div class="spin"></div><div style="text-align:center;font-weight:600">Sending your cancellation</div>'
        '<div class="muted" style="text-align:center">We are checking with the hotel booking provider. This can take up to two minutes. You can leave this screen; we will keep going.</div>'
        '<div style="flex:1"></div>' + btn("Yes, cancel booking", "dis") + btn("Go to My trips") + '</div>')

# ---------- I: confirmed
def I():
    return phone(ab("Cancellation confirmed", back=False) + '<div class="body">'
        '<div style="text-align:center;font-size:26px;font-weight:700;border:2px solid #222;border-radius:50%;width:46px;height:46px;line-height:42px;margin:4px auto 0">&#10003;</div>'
        '<div style="text-align:center;font-weight:700;font-size:14px">Cancellation confirmed</div>' + stay_card(extra='<div class="kv" style="margin-top:3px"><span class="muted">Status</span><span class="pill dk">Cancelled</span></div>') +
        '<div class="card g sm"><b>Refund</b><div>₹18,240 will be returned to your original payment method. We will message you when it has been processed.</div></div>'
        '<div style="flex:1"></div>' + btn("View booking", "p") + btn("Back to My trips") + '</div>')

# ---------- J: unknown
def J():
    return phone(ab("Cancellation status", back=False) + '<div class="body">'
        '<div style="text-align:center;font-size:24px;font-weight:700;border:2px solid #222;border-radius:50%;width:46px;height:46px;line-height:42px;margin:4px auto 0">?</div>'
        '<div style="text-align:center;font-weight:700;font-size:14px">We couldn\'t confirm the result yet</div>' +
        stay_card(extra='<div class="kv" style="margin-top:3px"><span class="muted">Status</span><span class="pill">Checking</span></div>') +
        '<div class="card g sm">Your booking may still be active. We are checking its status and will message you. <b>Please don\'t cancel again.</b></div>'
        '<div style="flex:1"></div>' + btn("Back to My trips", "p") + btn("Contact support") + '</div>')

# ---------- K: waiver request
def K():
    return phone(ab("Request an exception") + '<div class="body">' + stay_card("VY-1063") +
        '<div class="sm"><b>Ask whether the cancellation fee can be waived.</b> The hotel will decide. There is no guarantee.</div>'
        '<div class="muted">Reason (required)</div><div class="card sm" style="padding:5px 8px">Select a reason &nbsp;&#9662;</div>'
        '<div class="muted">Note for the hotel (optional)</div><div class="card" style="height:42px"></div>'
        '<div class="chk"><i></i><span>I understand the fee of ₹18,240 applies if the hotel says no.</span></div>'
        '<div style="flex:1"></div>' + btn("Send request", "p") + btn("Back") + '</div>')

# ---------- L: pending
def L():
    return phone(ab("Exception request", back=False) + '<div class="body">' +
        '<div style="text-align:center;font-weight:700;font-size:14px;margin-top:4px">Waiting for the hotel</div>' + stay_card("VY-1063") +
        '<div class="card">' + kv("Request", '<span class="pill">Pending</span>') + kv("Sent", "to the hotel") + '</div>'
        '<div class="card g sm">The hotel decides whether to waive the fee. We will keep checking for up to 72 hours and message you when there is an answer.</div>'
        '<div style="flex:1"></div>' + btn("Back to My trips", "p") + btn("Contact support") + '</div>')

# ---------- M: outcomes
def M():
    return phone(ab("Exception request", back=False) + '<div class="body">'
        '<div class="muted">Two possible outcomes</div>'
        '<div class="card"><span class="pill dk">Accepted</span><div class="sm" style="margin-top:3px"><b>The hotel waived the fee.</b> Your booking is cancelled. We will show your refund once it is confirmed.</div></div>'
        '<div class="card"><span class="pill">Declined</span><div class="sm" style="margin-top:3px"><b>The hotel did not waive the fee.</b> The original terms apply: refund ₹0.</div></div>'
        '<div class="card g sm">No answer, or a status we can\'t read: we send you to support with your booking reference.</div>'
        '<div style="flex:1"></div>' + btn("View booking", "p") + btn("Contact support") + '</div>')

# ---------- N: ineligible
def N():
    return phone(ab("Booking details") + '<div class="body">'
        f'<div class="kv"><b style="font-size:13px">{HOTEL}</b><span class="pill">Confirmed</span></div>'
        '<div class="card">' + kv("Check-in", "Thu 10 Dec 2026") + kv("Voya ref", "VY-1042") + '</div>'
        '<div class="warn"><b>We can\'t cancel this booking in the app.</b><div class="sm">Our support team can check what options are available. Have your booking reference ready.</div></div>'
        '<div style="flex:1"></div>' + btn("Contact support", "p") + btn("Back to My trips") + '</div>')

# ---------- O: already cancelled
def O():
    return B(status="Cancelled", cancelled=True).replace(
        '<div class="card g"><b>Cancellation policy</b>',
        '<div class="card g sm"><b>This booking was cancelled.</b> Nothing more to do here.</div><div class="card g"><b>Cancellation policy</b>', 1)

# ---------- P: failure
def P():
    return phone(ab("Cancellation", back=False) + '<div class="body">'
        '<div style="text-align:center;font-weight:700;font-size:14px;margin-top:4px">We couldn\'t cancel this booking</div>' + stay_card() +
        '<div class="card g sm">Your booking is still active. We checked just now. Nothing has been changed.</div>'
        '<div class="sm muted">If the refund amount changed, we will show you the new amount before you confirm.</div>'
        '<div style="flex:1"></div>' + btn("Try again", "p") + btn("Contact support") + '</div>')

WF = {k: v for k, v in dict(A=A, B=B, C=C, D=D, E=E, F=F, G=G, H=H, I=I, J=J, K=K, L=L, M=M, N=N, O=O, P=P).items()}

# ---------- notes: (design, developer, business) -------------
NOTES = {
"A": ("Upcoming trips come first. Each card carries hotel, dates, Voya reference and status so the right booking is easy to pick. Cancelled trips have their own tab.",
      "[A] The list is read from Voya's own booking table, which stores Agoda's bookingId next to the Voya reference. [D] Booking List can look up bookings by recent window or partner tag, so Voya uses it to reconcile missing records, not to build this screen.",
      "[A] Cancelling starts from a screen travelers already use. Because Voya owns the record, trips still show if Agoda is slow or unreachable."),
"B": ("Cancel booking is an outlined button, not red; red appears only on the final confirm. The policy and Contact support sit on the same screen.",
      "[D] Booking Detail gives status (BookingConfirmed here), the text cancellationPolicy and isFeeWaiverAllowed. [D] Search cancellationDetail, saved at booking, is the structured policy behind the reminder. [A] Cancel shows only when the status allows it.",
      "The policy line reminds travelers of the deadline before they ask for a refund. It is a reminder only; the amount comes from Preview on the next step."),
"C": ("Hotel and dates appear at once, then a plain waiting message. No countdown, since we do not know how long it will take. Back to booking stays available.",
      "[D] Cancel Preview takes {bookingId} and may take up to 120 seconds. [A] The backend owns the wait and keeps the request state, so closing the app does not restart it.",
      "No amount is shown until Agoda answers. A guessed refund would be a promise Voya may not be able to keep."),
"D": ("Estimated refund is the largest figure and sits above Continue. Keep booking has equal weight so leaving is easy.",
      "[D] Preview returns cancellationSummary with refundRate, paymentRate, reference and cancellationPolicy. Store reference and refundRate for Confirm; do not recompute them on the phone. [A] Paid equals refund here only because we assume price parity.",
      "[A/V] Assumes Voya refunds what Agoda quotes. A Voya fee, coupon or currency difference must be settled before the traveler confirms."),
"E": ("Same layout as the full-refund state, so travelers learn it once. Fee and refund are separate lines so the loss is visible before Continue.",
      "[D] refundRate is lower than paymentRate. The fee line is the difference, computed for display only [A]. cancellationPolicy text explains why. Fixture VY-1057 with a simulated date after the penalty cutoff.",
      "[A] ₹12,000 is an invented test value. Voya shows the quote as given; disputes go to support, not into this flow."),
"F": ("The screen says plainly that no money returns. Continue stays enabled because cancelling is still allowed. The waiver link appears only when it is permitted.",
      "[D] refundRate of 0 can still be confirmed with the same Confirm call. [D] The waiver link needs isFeeWaiverAllowed from Booking Detail, plus account permission [V]. Fixture VY-1063.",
      "Showing ₹0 before Continue avoids a complaint after the fact. A zero refund is not the same as a booking that cannot be cancelled."),
"G": ("Reason is optional and defaults to Prefer not to say. Hotel, dates and refund repeat so the wrong stay is not cancelled. Yes, cancel booking is the only red button; Keep booking sits right under it. No biometric prompt.",
      "[D] Confirm body: bookingId, reference, cancelReason, remark (optional) and refundRate {currency, inclusive}, copied from the latest Preview. Send cancelReason 0 when skipped; use only documented values. [A] Button disables on tap.",
      "Reason data is useful later and never blocks cancelling. [A] Voya's own request deduplication stops double taps; it does not make Agoda's Confirm exactly-once."),
"H": ("Says which step is running, blocks a second tap and lets the traveler leave. The final button stays visible but disabled so nothing seems to have vanished.",
      "[D] Confirm may take up to 120 seconds. [A] The backend records that Confirm was sent before the call, so a closed app can recover by reading Booking Detail.",
      "The backend, not the screen, owns the request. A traveler who leaves cannot trigger a second cancellation."),
"I": ("The headline says Cancelled and repeats hotel, dates and reference. Refund wording gives no number of days. View booking opens the cancelled record.",
      "[D] A successful Confirm is HTTP 200 with an empty body. Voya then reads Booking Detail and shows this screen only when the status is cancelled [V: confirm exact status in sandbox].",
      "[A] Cancelling the booking and returning money are separate: the payment gateway sends the refund. Agoda does not document refund timing under Partner Fulfillment [V]."),
"J": ("Neither success nor failure. It says the booking may still be active, that we are checking, and asks the traveler not to cancel again. Support is one tap away.",
      "[D] No reply in time does not mean cancelled. The backend reads Booking Detail first and asks for a fresh Preview only if the booking is still active. [A] Traveler is notified when the check finishes.",
      "Prevents duplicate cancellations and false cancelled messages. Support starts with the reference already attached."),
"K": ("Plain wording that the hotel decides. A required reason, an optional note and a checkbox so the traveler knows the fee stands if the hotel says no.",
      "[D] Confirm with requestingFeeWaiver true, feeWaiverReason and remark, only when isFeeWaiverAllowed. [V] Reason values differ between the guide and the Appendix; account permission may block it (error 924). [A] The cancellation goes with the request.",
      "The hotel carries the decision, not Voya, so copy must not promise a waiver. [V] Who tells the traveler when the answer arrives."),
"L": ("One clear status, Pending, and how long we will keep checking. No progress bar, because the hotel sets the pace.",
      "[D] Poll Booking Detail feeWaiverStatus for up to 72 hours, not past 12:00 AM on the check-in date. Sandbox hotel 42976 stays pending, then accepts after 24 hours. [V] Booking status while pending.",
      "Polling and messages cost engineering time, and the 72-hour limit is documented. Support gets the case if there is no answer."),
"M": ("Two outcomes in one panel, each stating what happens next. Accepted: fee waived. Declined: original terms. No celebration styling. Anything unreadable goes to support.",
      "[D] feeWaiverStatus Accept or Reject. [V] The guide also lists Cancelled and AutoReject; the Appendix lists Timeout. Treat those as Ask support. Verify Booking Detail before saying cancelled.",
      "[A] A declined waiver means the original terms stand. Confirm with Agoda that the booking stays cancelled in that case."),
"N": ("One sentence on what happened and a direct way to reach support. The error code is never shown. The reference is already on screen.",
      "[A] Voya decides assisted cancellation from Booking Detail status or a check-in date too close to the cutoff. [V] The boundary: one day before check-in, or 12:00 AM on the check-in date. Support ticket creation is a design assumption.",
      "Manual cancellations use support time. Settling the cutoff with Agoda decides how many bookings end up here."),
"O": ("The Cancel button is gone and the status is at the top. Dates and policy remain for reference. Contact support is still there.",
      "[D] Booking Detail status BookingCancelled or BookingCancelledByCustomer means Preview and Confirm are not called. [A] Refund status shown here comes from Voya's own records.",
      "Saves needless API calls and avoids double-cancel confusion."),
"P": ("States the booking is still active only because Booking Detail says so. Try again starts over with a new quote; support is the fallback.",
      "[D] Retryable errors (HTTP 500, 429): recheck Booking Detail, then a fresh Preview. Refund mismatch 914: new Preview, show the new amount. Auth or permission errors (102, 401, 403): log, do not loop. [A] Travelers never see codes.",
      "Keeps operations alerts separate from traveler wording. Repeated failures move the booking to the assisted path."),
}
