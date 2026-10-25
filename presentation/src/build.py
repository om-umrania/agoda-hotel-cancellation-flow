import re, sys, pathlib
from html import escape
import screens as S, diagrams as D
from note import NOTE1, NOTE2

OUT = pathlib.Path(__file__).resolve().parent.parent
TOTAL = 13

def tags(s):
    s = escape(s, quote=False)
    s = re.sub(r"\[([DAV](?:/[DAV])?(?::[^\]]*)?)\]", lambda m: f'<span class="tag">{m.group(1)}</span>', s)
    return s

def slide(n, title, sub, body, cls=""):
    return (f'<section class="slide {cls}"><div class="hd"><h1>{title}</h1>' + (f'<div class="sub">{sub}</div>' if sub else '') + '</div>'
            f'{body}<div class="ft"><span>Voya hotel cancellation, Android. Concept wireframes with simulated data.</span><span>{n} / {TOTAL}</span></div></section>')

def phone_html(code, scale):
    return (f'<div class="pw" style="width:{240*scale:.0f}px;height:{480*scale:.0f}px">'
            f'<div class="ph" style="transform:scale({scale})">{S.WF[code]()}</div></div>')

def notes_html(code, fs):
    d, v, b = S.NOTES[code]
    return (f'<div style="font-size:{fs}px">'
            f'<div class="note"><b>Design (UI/UX)</b>{tags(d)}</div>'
            f'<div class="note dev"><b>Developer (API)</b>{tags(v)}</div>'
            f'<div class="note biz"><b>Business</b>{tags(b)}</div></div>')

def head(code, title, fx=""):
    return f'<div class="wfhead"><span class="code">{code}</span><span class="t">{title}</span>' + (f'<span class="fx">{fx}</span>' if fx else '') + '</div>'

def wf_side(items, scale, fs, gap=28):
    cols = []
    for code, title, fx in items:
        cols.append(f'<div style="flex:1;min-width:0">{head(code, title, fx)}<div style="display:flex;gap:14px">{phone_html(code, scale)}'
                    f'<div style="flex:1;min-width:0">{notes_html(code, fs)}</div></div></div>')
    return f'<div style="display:flex;gap:{gap}px">' + "".join(cols) + '</div>'

def wf_cols(items, scale, fs, gap=18):
    cols = []
    for code, title, fx in items:
        cols.append(f'<div style="flex:1;min-width:0">{head(code, title, fx)}<div style="display:flex;justify-content:center">{phone_html(code, scale)}</div>{notes_html(code, fs)}</div>')
    return f'<div style="display:flex;gap:{gap}px">' + "".join(cols) + '</div>'

pages = []

# 1 cover
pages.append(slide(1, "Hotel booking cancellation: Android app",
  "Wireframes, information architecture and logic flow for Voya, built on Agoda's Demand APIs",
  '''<div style="display:flex;gap:36px;margin-top:6px">
  <div style="flex:1.25;font-size:16.5px;line-height:1.5">
   <div class="box" style="margin-bottom:12px"><h3>The problem</h3>Voya sells hotel rooms that come from Agoda. When a traveler needs to cancel, they want to know what it will cost and whether the cancellation went through. Voya does not set the refund; it has to ask Agoda, show the answer clearly, and recover safely when a call is slow or fails.</div>
   <div class="box" style="margin-bottom:12px"><h3>User goal</h3>Cancel a confirmed booking from the app, see the estimated refund before agreeing, and know the result.</div>
   <div class="box" style="margin-bottom:12px"><h3>Voya context</h3>An early-stage Android app with no direct hotel contracts. Hotel content and prices come from Agoda. Voya books on the traveler's behalf and, we assume, takes payment and handles service after the sale (Agoda's Partner Fulfillment model).</div>
   <div class="box"><h3>Data in this document</h3>Hotels, prices, dates and booking IDs are simulated test data, not real reservations or live Agoda responses. The demo date is Sunday 25 October 2026.</div>
  </div>
  <div style="flex:1;font-size:15px">
   <div class="box"><h3>What is in this document</h3>
   <table class="t" style="font-size:14.5px"><tbody>
   <tr><td><b>2</b></td><td>Scope, assumptions, evidence legend</td></tr>
   <tr><td><b>3</b></td><td>Information architecture</td></tr>
   <tr><td><b>4</b></td><td>Logic and information flow, four lanes</td></tr>
   <tr><td><b>5 to 10</b></td><td>Wireframes A to P with design, developer and business notes</td></tr>
   <tr><td><b>11</b></td><td>API-to-screen map and key scenarios</td></tr>
   <tr><td><b>12, 13</b></td><td>Product note</td></tr></tbody></table></div>
   <div class="box" style="margin-top:12px"><h3>Course and team</h3>PM101 Mid-Course case, Masters' Union, October 2026.<br>Team: Om Umrania, Param Parekh, Shabareesh Parlakota, Arushi Gupta, Manya Mahajan.</div>
  </div></div>'''))

# 2 scope
LI = lambda items: "<ul>" + "".join(f"<li>{tags(i)}</li>" for i in items) + "</ul>"
pages.append(slide(2, "Scope, assumptions and evidence legend", "Every claim on later pages is tagged so it can be traced to Agoda's documentation or to a Voya decision",
f'''<div style="display:flex;gap:16px;font-size:13.6px;line-height:1.4">
 <div class="col" style="flex:.8;gap:10px">
  <div class="box"><h3>In scope (version 1)</h3>{LI(["Full cancellation of one confirmed booking, from My trips","Refund preview, final confirmation, result","Unknown outcome after a timeout","Fee waiver, only when permitted","Support route when the app cannot cancel"])}</div>
  <div class="box"><h3>Out of scope</h3>{LI(["Date changes","Cancelling one room of several","No-show disputes","The payment system that returns money"])}</div>
  <div class="box"><h3>Evidence legend</h3><div><span class="tag">D</span> Documented on the Agoda page cited</div><div style="margin-top:3px"><span class="tag">A</span> Voya assumption or design decision</div><div style="margin-top:3px"><span class="tag">V</span> Unclear or undocumented; validate with Agoda</div></div>
 </div>
 <div class="box" style="flex:1.5"><h3>Assumptions</h3>
  <table class="t" style="font-size:13px"><tbody>
  <tr><td><b>1</b></td><td>Voya uses Agoda's Partner Fulfillment model: Voya takes payment and handles service after booking. <span class="tag">A</span></td></tr>
  <tr><td><b>2</b></td><td>Voya keeps its own booking reference beside Agoda's bookingId. My trips reads Voya's database, not Agoda directly. <span class="tag">A</span></td></tr>
  <tr><td><b>3</b></td><td>Voya's Agoda account may call Cancel Preview, Cancel Confirm and fee waiver. <span class="tag">V</span></td></tr>
  <tr><td><b>4</b></td><td>The cancellation policy from Search (cancellationDetail) is saved at booking and shown as a reminder only. Live Preview gives the quote. <span class="tag">D</span><span class="tag">A</span></td></tr>
  <tr><td><b>5</b></td><td>In the examples the traveler paid what Agoda quotes: price and currency parity. No Voya markup, coupon or FX. <span class="tag">A</span></td></tr>
  <tr><td><b>6</b></td><td>Voya's payment gateway sends the traveler's refund. Agoda does not document refund timing for this model. <span class="tag">A</span><span class="tag">V</span></td></tr>
  <tr><td><b>7</b></td><td>The date a fee starts is separate from the date the API stops allowing cancellation. The latter is documented two ways (one day before check-in, or 12:00 AM on the check-in date). <span class="tag">V</span></td></tr>
  <tr><td><b>8</b></td><td>Support can cancel by hand and receive a booking reference. Designed here, not built. <span class="tag">A</span></td></tr></tbody></table>
 </div>
 <div class="col" style="flex:1;gap:10px">
  <div class="box"><h3>Illustrative data</h3>Sample Hotel, Bengaluru. Check-in Thu 10 Dec 2026, check-out Sat 12 Dec 2026. Voya ref VY-1042, paid ₹18,240. Fee-free until Mon 7 Dec 2026, 6:00 PM hotel time.<br><br>Three separate fixtures drive the refund screens: full refund ₹18,240 (VY-1042), partial ₹12,000 (VY-1057), none ₹0 (VY-1063). They are not three prices for one booking, and none is Agoda data.</div>
  <div class="box" style="font-size:12px"><h3>Sources <span class="tag">D</span></h3>
  developer.agoda.com/demand/docs/<br>
  cancel-bookings<br>fee-waiver-cancellation<br>retrieve-bookings (Booking List and Detail)<br>json-search-api<br>appendix (error codes, statuses)<br>best-practices-certification-process</div>
 </div>
</div>'''))

# 3 IA
pages.append(slide(3, "Information architecture", "Navigation tree for cancellation. Screens are solid boxes, system checks are dashed",
  f'<div style="margin-top:2px">{D.ia()}</div>'))

# 4 flow
pages.append(slide(4, "Logic and information flow", "Who knows what, and when. Agoda calls are in the Agoda lane; everything else is Voya's own logic [A]",
  f'<div>{D.swim()}</div><div style="margin-top:8px;font-size:11px;font-weight:700">Fee waiver branch (conditional)</div><div>{D.waiver_strip()}</div>'
  '<div style="font-size:10px;color:#444;margin-top:2px">If Confirm gets no reply, step 12 runs before any retry. Preview and Confirm can each wait up to 120 s <span class="tag">D</span></div>'))

# wireframe pages
pages.append(slide(5, "Wireframes A and B: My trips and Booking details", "Entry point and the place where cancellation starts",
  wf_side([("A", "My trips", "Fixture VY-1042 and VY-1051"), ("B", "Booking details", "Fixture VY-1042")], 1.08, 12.2, gap=30)))

pages.append(slide(6, "Wireframes C to F: Cancel Preview states", "Same screen skeleton; three separate test fixtures drive the amounts",
  wf_cols([("C", "Preview loading", "any booking"), ("D", "Full refund", "VY-1042"), ("E", "Partial refund", "VY-1057"), ("F", "No refund, ₹0", "VY-1063")], 0.74, 9.4, gap=16)))

pages.append(slide(7, "Wireframes G and H: Final review and sending", "Reason is optional; no biometric prompt",
  wf_side([("G", "Reason and final review", "VY-1042"), ("H", "Sending progress", "VY-1042")], 1.08, 12.2, gap=30)))

pages.append(slide(8, "Wireframes I and J: Confirmed and outcome unknown", "Cancelling the booking and refunding the money are separate things",
  wf_side([("I", "Cancellation confirmed", "VY-1042"), ("J", "Result not confirmed yet", "after a timeout")], 1.08, 12.2, gap=30)))

pages.append(slide(9, "Wireframes K to M: Fee waiver request", "Conditional exception path. The hotel decides; nothing is promised",
  wf_side([("K", "Request an exception", "VY-1063"), ("L", "Pending", "VY-1063"), ("M", "Accepted or declined", "VY-1063")], 0.84, 10.1, gap=14)))

pages.append(slide(10, "Wireframes N to P: Cannot cancel, already cancelled, failure", "Three different decisions, not three error screens",
  wf_side([("N", "Cannot cancel in app", "VY-1042"), ("O", "Already cancelled", "VY-1042"), ("P", "Could not cancel", "VY-1042")], 0.84, 10.1, gap=14)))

# 11 API map
rows = [
 ("A", "Voya booking table; Booking List to reconcile", "Voya ref, Agoda bookingId, tag", "A / D"),
 ("B, O", "Booking Detail; saved Search cancellationDetail", "status, cancellationPolicy text, isFeeWaiverAllowed; structured policy", "D"),
 ("C to F", "Cancel Preview", "cancellationSummary: reference, paymentRate, refundRate, cancellationPolicy", "D"),
 ("G, H, I", "Cancel Confirm, then Booking Detail", "bookingId, reference, cancelReason, refundRate; HTTP 200 empty body", "D"),
 ("J", "Booking Detail", "status recheck before any retry", "D / A"),
 ("K to M", "Confirm with requestingFeeWaiver; Booking Detail", "feeWaiverReason, remark, feeWaiverStatus", "D / V"),
 ("N, P", "Voya rules; documented errors", "errorMessage id and subId (102, 914); support ticket is Voya's", "D / A"),
 ("Refund payment", "Voya payment gateway", "not an Agoda call", "A"),
]
tbl = '<table class="t" style="font-size:12.2px"><thead><tr><th>Screen</th><th>Source</th><th>Fields and notes</th><th>Evidence</th></tr></thead><tbody>' + "".join(
    f"<tr><td><b>{a}</b></td><td>{escape(b)}</td><td>{escape(c)}</td><td>{escape(d).replace('D','<span class=tag>D</span>').replace('A','<span class=tag>A</span>').replace('V','<span class=tag>V</span>') if False else tags('['+d.replace(' / ','/')+']') if '/' in d else tags('['+d+']')}</td></tr>" for a,b,c,d in rows) + '</tbody></table>'
sc = ["Full refund before the penalty cutoff (D)", "Partial refund with the fee shown (E)", "₹0 refund; cancelling still allowed (F)", "Already cancelled; no Confirm sent (O)",
      "Ineligible status or too close to check-in: support (N)", "Preview slow or failing: no quote shown (C)", "Confirm times out: recheck Booking Detail first (H, J)",
      "Refund mismatch, error 914: fresh Preview (P)", "Waiver not allowed: no waiver link (F without link)", "Waiver pending, then accepted or declined (L, M)"]
pages.append(slide(11, "API-to-screen map and key scenarios", "What each screen reads or sends, and the ten cases we chose to show",
 f'''<div style="display:flex;gap:18px">
  <div style="flex:1.45">{tbl}
   <div class="box" style="margin-top:10px;font-size:12.2px"><h3>Open questions for Agoda <span class="tag">V</span></h3>{LI(["Cancellation cutoff: one day before check-in, or 12:00 AM on the check-in date","Fee-waiver reason values and status names differ between the guide and the Appendix","Whether the booking is cancelled while a waiver is pending","How and when the traveler's refund settles under Partner Fulfillment","Account permission for Preview, Confirm and fee waiver"])}</div>
  </div>
  <div style="flex:1;font-size:13px">
   <div class="box"><h3>Ten scenarios shown</h3><ol style="padding-left:17px;line-height:1.5">{"".join(f"<li>{escape(s)}</li>" for s in sc)}</ol>
   <div class="muted" style="margin-top:4px;font-size:11.5px">Ten of the twenty cases we identified. The rest (wrong account, quote changes after display, multi-room, refund payment delay, app closed mid-call) are handled by the same rules and kept in the team's working matrix.</div></div>
   <div class="box" style="margin-top:10px"><h3>Checks run on this document</h3>{LI(["Weekdays verified: 25 Oct 2026 Sunday; 7 Dec Monday; 10 Dec Thursday; 12 Dec Saturday","Every wireframe has Design, Developer and Business notes","No endpoint paths or response fields beyond Agoda's documentation"])}</div>
  </div></div>'''))

def prose(sections, fs=16.2):
    out = []
    for h, ps in sections:
        out.append(f"<h2>{escape(h)}</h2>" + "".join(f"<p>{tags(p)}</p>" for p in ps))
    return f'<div class="prose" style="font-size:{fs}px;line-height:1.55">' + "".join(out) + "</div>"

pages.append(slide(12, "Product note (1 of 2)", "Voya hotel cancellation on Android", prose(NOTE1)))
pages.append(slide(13, "Product note (2 of 2)", "Exceptions, trade-offs and what is left to confirm", prose(NOTE2, 15.2)))

css = (OUT / "src" / "style.css").read_text()
html = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Voya hotel cancellation, Android wireframes</title><style>{css}</style></head><body>' + "\n".join(pages) + '</body></html>'
(OUT / "deck.html").write_text(html)
print("pages", len(pages))
