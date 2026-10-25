from html import escape

def _t(x, y, text, size=11, weight=400, anchor="middle", fill="#111", lh=None):
    lh = lh or size * 1.18
    lines = text.split("\n")
    y0 = y - (len(lines) - 1) * lh / 2 + size * .35
    s = f'<text x="{x}" y="{y0:.1f}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="{fill}">'
    for i, ln in enumerate(lines):
        s += f'<tspan x="{x}" dy="{0 if i == 0 else lh:.1f}">{escape(ln)}</tspan>'
    return s + '</text>'

def box(x, y, w, h, text, size=10.5, dash=False, fill="#fff", weight=400, stroke="#222", bold=False):
    d = ' stroke-dasharray="5 3"' if dash else ''
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{fill}" stroke="{stroke}" stroke-width="1.4"{d}/>' +
            _t(x + w / 2, y + h / 2, text, size, 700 if bold else weight))

def diamond(cx, cy, w, h, text, size=9.5):
    pts = f'{cx},{cy-h/2} {cx+w/2},{cy} {cx},{cy+h/2} {cx-w/2},{cy}'
    return f'<polygon points="{pts}" fill="#fff" stroke="#222" stroke-width="1.4"/>' + _t(cx, cy, text, size, 600)

def arrow(pts, label=None, lx=None, ly=None, dash=False, size=9, anchor="middle"):
    d = ' stroke-dasharray="4 3"' if dash else ''
    p = " ".join(f"{a},{b}" for a, b in pts)
    s = f'<polyline points="{p}" fill="none" stroke="#222" stroke-width="1.3"{d} marker-end="url(#ah)"/>'
    if label:
        if lx is None:
            lx = (pts[0][0] + pts[-1][0]) / 2
            ly = (pts[0][1] + pts[-1][1]) / 2 - 4
        s += _t(lx, ly, label, size, 400, anchor, fill="#222")
    return s

DEFS = ('<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">'
        '<path d="M0,0 L8,4 L0,8 z" fill="#222"/></marker></defs>')

def svg(w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="Inter, Arial, sans-serif">{DEFS}{body}</svg>'

# ------------------------------------------------------------------ IA tree
def ia():
    b = []
    # exception band
    b.append('<rect x="20" y="448" width="690" height="80" rx="8" fill="#f2f2f2" stroke="#999" stroke-dasharray="6 4"/>')
    b.append(_t(32, 462, "Exception branch, shown only when isFeeWaiverAllowed and account permission allow it", 10, 600, "start"))
    b.append(box(480, 8, 220, 36, "Voya Android app", 12, bold=True))
    # level 1
    L1 = [(70, "Search and hotel details\n(from Agoda feed)"), (480, "My trips"), (930, "Account and help")]
    for x, t in L1:
        b.append(box(x, 76, 220, 40, t, 11, bold=(t == "My trips")))
        b.append(arrow([(590, 44), (590, 60), (x + 110, 60), (x + 110, 76)]))
    # level 2 tabs
    tabs = [(330, "Upcoming"), (500, "Past\n(no cancel)"), (670, "Cancelled")]
    for x, t in tabs:
        b.append(box(x, 148, 150, 36, t, 10.5))
        b.append(arrow([(590, 116), (590, 132), (x + 75, 132), (x + 75, 148)]))
    b.append(box(930, 148, 220, 36, "Help and Contact support", 10.5))
    b.append(arrow([(1040, 116), (1040, 148)]))
    # booking details & cancelled details
    b.append(box(330, 214, 150, 40, "Booking details (A, B)", 10.5, bold=True))
    b.append(arrow([(405, 184), (405, 214)]))
    b.append(box(670, 214, 150, 40, "Cancelled booking\ndetails (O)", 10.5))
    b.append(arrow([(745, 184), (745, 214)]))
    # system check
    b.append(box(300, 282, 210, 40, "System check: status,\neligibility, hotel-local date", 9.5, dash=True))
    b.append(arrow([(405, 254), (405, 282)]))
    # branches from check
    b.append(arrow([(510, 292), (670, 255)], "already cancelled", 600, 262, size=8.5))
    b.append(box(870, 282, 200, 40, "Not cancellable in the app (N)", 10))
    b.append(arrow([(510, 306), (870, 306)], "ineligible or too close to check-in", 690, 300, size=8.5))
    b.append(arrow([(1000, 282), (1000, 184)], "assisted", 1030, 232, size=8.5))
    # main chain
    b.append(arrow([(360, 322), (360, 350), (125, 350), (125, 372)], "eligible: Cancel booking", 240, 344, size=8.5))
    b.append(box(30, 372, 190, 44, "Review refund (C to F)\nCancel Preview", 10.5, bold=True))
    b.append(arrow([(220, 394), (250, 394)]))
    b.append(box(250, 372, 180, 44, "Reason and final review (G)\nKeep or Yes, cancel", 10))
    b.append(arrow([(430, 394), (460, 394)]))
    b.append(box(460, 372, 130, 44, "Sending (H)\nConfirm", 10.5))
    outs = [(620, 340, "Cancellation confirmed (I)"), (620, 385, "Outcome unknown (J)"), (620, 430, "Could not cancel (P)")]
    for x, y, t in outs:
        b.append(box(x, y, 210, 34, t, 10))
        b.append(arrow([(590, 394), (605, 394), (605, y + 17), (x, y + 17)]) if y != 385 else arrow([(590, 394), (x, y + 17)]))
    b.append(_t(950, 395, "J and P lead to\nrecheck or support", 8.5, 400, "start"))
    # waiver chain
    b.append(arrow([(125, 416), (125, 478)], "from F", 142, 438, size=8.5, anchor="start"))
    b.append(box(30, 478, 190, 40, "Request exception (K)", 10.5))
    b.append(arrow([(220, 498), (250, 498)]))
    b.append(box(250, 478, 190, 40, "Pending, up to 72 h (L)", 10.5))
    b.append(arrow([(440, 498), (470, 498)]))
    b.append(box(470, 478, 230, 40, "Outcome: accepted or declined (M)", 10))
    # legend
    b.append(box(780, 470, 130, 24, "Screen", 9.5))
    b.append(box(780, 500, 130, 24, "System check", 9.5, dash=True))
    b.append(_t(925, 482, "A screen the traveler sees", 9, 400, "start"))
    b.append(_t(925, 512, "A check Voya runs, no screen", 9, 400, "start"))
    return svg(1200, 545, "".join(b))

# --------------------------------------------------------------- swimlane
LANES = ["Traveler", "Voya Android", "Voya backend", "Agoda"]
LH = 112

def swim():
    b = []
    X0 = 96
    W = 1200
    for i, name in enumerate(LANES):
        y = i * LH
        b.append(f'<rect x="0" y="{y}" width="{W}" height="{LH}" fill="{"#f6f6f6" if i % 2 == 0 else "#fff"}" stroke="#999"/>')
        b.append(f'<rect x="0" y="{y}" width="{X0-8}" height="{LH}" fill="#222"/>')
        b.append(f'<text transform="translate(42,{y+LH/2}) rotate(-90)" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">{name}</text>')
    cx = lambda c: 150 + 108 * c
    cy = lambda l: l * LH + LH / 2
    NW, NH, DW, DH = 90, 62, 92, 72
    def node(l, c, num, text, size=9.6):
        t = (f"{num}  " if num else "") + text
        b.append(box(cx(c) - NW / 2, cy(l) - NH / 2, NW, NH, t, size))
    def dia(l, c, text):
        b.append(diamond(cx(c), cy(l), DW, DH, text, 9.2))
    top = lambda l: cy(l) - NH / 2
    bot = lambda l: cy(l) + NH / 2
    # column 0
    node(0, 0, "1", "Open\nMy trips")
    node(1, 0, "2", "Ask Voya\nfor booking")
    node(2, 0, "3", "Map Voya ID\nto Agoda\nbookingId")
    node(3, 0, "4", "Booking Detail:\nstatus, policy,\nisFeeWaiverAllowed", 9)
    for l in (0, 1, 2):
        b.append(arrow([(cx(0), bot(l)), (cx(0), top(l + 1))]))
    # d1, d2
    dia(2, 1, "Already\ncancelled?")
    b.append(arrow([(cx(0) + NW / 2, cy(3) - 8), (cx(1), cy(3) - 8), (cx(1), cy(2) + DH / 2)], "status", cx(1) - 30, cy(3) - 14, size=8.5))
    node(1, 1, "", "Show Cancelled\nstatus. Stop.")
    b.append(arrow([(cx(1), cy(2) - DH / 2), (cx(1), bot(1))], "yes", cx(1) + 8, cy(2) - 42, size=9, anchor="start"))
    dia(2, 2, "Self-service\nallowed?")
    b.append(arrow([(cx(1) + DW / 2, cy(2)), (cx(2) - DW / 2, cy(2))], "no", cx(1) + DW / 2 + 9, cy(2) - 6, size=9))
    node(1, 2, "", "Contact support\n(assisted)")
    b.append(arrow([(cx(2), cy(2) - DH / 2), (cx(2), bot(1))], "no", cx(2) + 8, cy(2) - 42, size=9, anchor="start"))
    # c3
    node(1, 3, "", "Booking details\nwith Cancel\nbooking")
    b.append(arrow([(cx(2) + DW / 2, cy(2)), (cx(3), cy(2)), (cx(3), bot(1))], "yes", cx(2) + DW / 2 + 10, cy(2) - 6, size=9))
    node(0, 3, "5", "Tap Cancel\nbooking")
    b.append(arrow([(cx(3), top(1)), (cx(3), bot(0))]))
    # c4
    node(1, 4, "", "Loading:\nchecking terms")
    b.append(arrow([(cx(3) + NW / 2, cy(0)), (cx(4), cy(0)), (cx(4), top(1))]))
    node(2, 4, "6", "Cancel Preview\nrequest\n{bookingId}")
    node(3, 4, "7", "Cancel Preview\n(up to 120 s)")
    b.append(arrow([(cx(4), bot(1)), (cx(4), top(2))]))
    b.append(arrow([(cx(4), bot(2)), (cx(4), top(3))]))
    # c5
    dia(2, 5, "Preview\nreturned?")
    b.append(arrow([(cx(4) + NW / 2, cy(3)), (cx(5), cy(3)), (cx(5), cy(2) + DH / 2)], "reference, paymentRate,\nrefundRate, policy", cx(4) + NW / 2 + 6, cy(3) + 14, size=8.5, anchor="start"))
    node(1, 5, "", "No quote shown.\nRetry or\nContact support")
    b.append(arrow([(cx(5), cy(2) - DH / 2), (cx(5), bot(1))], "error or timeout", cx(5) + 8, cy(2) - 42, size=8.5, anchor="start"))
    # c6
    node(1, 6, "8", "Review: refund,\nhotel, dates")
    b.append(arrow([(cx(5) + DW / 2, cy(2)), (cx(6), cy(2)), (cx(6), bot(1))], "yes", cx(5) + DW / 2 + 10, cy(2) - 6, size=9))
    dia(0, 6, "Keep or\ncancel?")
    b.append(arrow([(cx(6), top(1)), (cx(6), cy(0) + DH / 2)]))
    b.append(_t(cx(6) - DW / 2 - 6, cy(0), "Keep: stop,\nno Agoda call", 8.8, 400, "end"))
    # c7
    b.append(box(cx(7) + 22 - NW / 2, cy(0) - NH / 2, NW, NH, "9  Yes, cancel\nbooking", 9.6))
    b.append(arrow([(cx(6) + DW / 2, cy(0)), (cx(7) + 22 - NW / 2, cy(0))], "cancel", cx(6) + DW / 2 + 20, cy(0) - 6, size=8.5))
    node(2, 7, "10", "Confirm with\nbookingId, reference,\ncancelReason,\nrefundRate", 8.6)
    node(3, 7, "11", "Confirm\n(up to 120 s)")
    b.append(arrow([(cx(7) + 22, bot(0)), (cx(7) + 22, top(2))]))
    b.append(arrow([(cx(7), bot(2)), (cx(7), top(3))]))
    # c8
    dia(2, 8, "Confirm\nresult?")
    b.append(arrow([(cx(7) + NW / 2, cy(3)), (cx(8), cy(3)), (cx(8), cy(2) + DH / 2)], "200 empty, error,\nor no reply", cx(7) + NW / 2 + 6, cy(3) + 14, size=8.5, anchor="start"))
    # c9
    node(2, 9, "12", "Recheck Booking\nDetail. Update\nVoya record.", 9)
    b.append(arrow([(cx(8) + DW / 2, cy(2)), (cx(9) - NW / 2, cy(2))]))
    node(3, 9, "", "Booking Detail\nstatus")
    b.append(arrow([(cx(9), bot(2)), (cx(9), top(3))]))
    node(1, 9, "13", "Confirmed,\nunknown, or error\n(914: new Preview)", 8.8)
    b.append(arrow([(cx(9), top(2)), (cx(9), bot(1))]))
    return svg(1200, 4 * LH, "".join(b))

def waiver_strip():
    b = []
    xs = [0, 224, 448, 672, 896]
    texts = ["Booking Detail shows\nisFeeWaiverAllowed = true\nand Voya has permission",
             "Android shows: Ask whether the\ncancellation fee can be waived\n(K), with a reason",
             "Backend sends Confirm with\nrequestingFeeWaiver: true,\nfeeWaiverReason, remark",
             "Hotel decides (Agoda side).\nBackend polls Booking Detail\nfeeWaiverStatus, up to 72 h",
             "Accept or Reject shown (M).\nAnything else: support.\nStop at check-in 12:00 AM"]
    for i, (x, t) in enumerate(zip(xs, texts)):
        b.append(box(x + 2, 6, 206, 52, t, 9.3))
        if i < 4:
            b.append(arrow([(x + 208, 32), (x + 226, 32)]))
    return svg(1120, 64, "".join(b))
