"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FIXTURES, FIXTURE_BY_ID, REASONS, inr } from "@/lib/fixtures";
import type { Sim } from "@/lib/simulated-agoda";
import type { TraceEntry } from "@/lib/voya";

type Step =
  | "trips" | "details" | "loading" | "preview" | "review" | "sending" | "confirmed" | "unknown"
  | "failed" | "waiver" | "waiverPending" | "waiverResult" | "assisted";
type Quote = { reference: number; paid: number; refund: number; currency: string; policyText: string };
type Booking = { detail: { status: string; isFeeWaiverAllowed: boolean; feeWaiverStatus?: string }; cancelled: boolean; assisted: boolean; assistedReason?: string };

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

export default function Prototype() {
  const [sid, setSid] = useState(FIXTURES[0].id);
  const f = FIXTURE_BY_ID[sid];
  const [step, setStep] = useState<Step>("trips");
  const [sim, setSim] = useState<Sim>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [reason, setReason] = useState(0);
  const [ack, setAck] = useState(false);
  const [note, setNote] = useState("");
  const [stillActive, setStillActive] = useState(false);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const requestId = useRef("");
  const simRef = useRef<Sim>({});
  simRef.current = sim;

  const addTrace = (t: TraceEntry[]) => setTrace((prev) => [...t.slice().reverse(), ...prev].slice(0, 8));
  const updateSim = (patch: Partial<Sim>) => { const n = { ...simRef.current, ...patch }; simRef.current = n; setSim(n); return n; };

  const reset = useCallback((id: string) => {
    setSid(id); setStep("trips"); setSim({}); simRef.current = {}; setQuote(null); setBooking(null);
    setReason(0); setAck(false); setNote(""); setStillActive(false); setTrace([]);
  }, []);

  const readBooking = useCallback(async (s: Sim, id = sid) => {
    const b = await post<Booking & { trace: TraceEntry[] }>("/api/voya/booking", { scenarioId: id, sim: s });
    addTrace(b.trace); setBooking(b); return b;
  }, [sid]);

  async function openDetails() { setStep("details"); setBooking(null); await readBooking(simRef.current); }

  async function startCancel() {
    if (booking?.assisted) { setStep("assisted"); return; }
    await fetchQuote("loading");
  }

  async function fetchQuote(from: Step, banner = "") {
    setStep("loading"); setNote(banner);
    const r = await post<{ ok: boolean; quote?: Quote; trace: TraceEntry[] }>("/api/voya/preview", { scenarioId: sid, sim: simRef.current });
    addTrace(r.trace);
    updateSim({ previews: (simRef.current.previews ?? 0) + 1 });
    if (r.ok && r.quote) { setQuote(r.quote); setStep("preview"); } else { setStep("failed"); }
    void from;
  }

  async function confirm(waiver = false) {
    if (!quote) return;
    setStep(waiver ? "waiver" : "sending");
    requestId.current = `${sid}-${Date.now()}`;
    const body = { bookingId: f.bookingId, reference: quote.reference, cancelReason: reason, refundRate: { currency: quote.currency, inclusive: quote.refund },
      ...(waiver ? { requestingFeeWaiver: true, feeWaiverReason: 1, remark: "" } : {}) };
    const r = await post<{ outcome: string; error?: { id: number }; trace: TraceEntry[] }>("/api/voya/confirm", { scenarioId: sid, requestId: requestId.current, confirm: body });
    addTrace(r.trace);
    if (r.outcome === "accepted") {
      if (waiver) { updateSim({ waiverSent: true, polls: 0 }); setStep("waiverPending"); return; }
      const s = updateSim({ confirmed: "accepted" });
      const b = await readBooking(s);
      setStep(b.cancelled ? "confirmed" : "unknown");
    } else if (r.outcome === "unknown") {
      updateSim({ confirmed: "unknown" }); setStillActive(false); setStep("unknown");
    } else if (r.outcome === "error" && r.error?.id === 914) {
      const b = await readBooking(simRef.current); // status recheck before a fresh quote
      if (!b.cancelled) await fetchQuote("sending", "The refund amount changed. Please review the new amount.");
    } else if (r.outcome === "error") { setStep("failed"); }
  }

  // After an unknown outcome, read Booking Detail before offering any retry.
  useEffect(() => {
    if (step !== "unknown") return;
    const t = setTimeout(async () => {
      const b = await readBooking(simRef.current);
      if (b.cancelled) setStep("confirmed"); else setStillActive(true);
    }, 1800);
    return () => clearTimeout(t);
  }, [step, readBooking]);

  // Poll for the waiver decision. Real polling can run for up to 72 hours; the demo decides after two polls.
  useEffect(() => {
    if (step !== "waiverPending") return;
    const t = setTimeout(async () => {
      const s = updateSim({ polls: (simRef.current.polls ?? 0) + 1 });
      const b = await readBooking(s);
      const st = b.detail.feeWaiverStatus;
      if (st === "Accept" || st === "Reject") setStep("waiverResult");
      else setStep("waiverPending");
      setSim({ ...s });
    }, 1500);
    return () => clearTimeout(t);
  }, [step, sim.polls, readBooking]);

  const stay = (
    <div className="card"><b>{f.hotel}</b>
      <div className="muted">{f.checkInLabel.slice(4, 10)} – {f.checkOutLabel.slice(4)} · 2 nights</div>
      <div className="muted">1 room, 2 adults · Ref {f.voyaRef}</div></div>
  );
  const Bar = ({ title, back, to }: { title: string; back?: boolean; to?: Step }) => (
    <div className="ab">{back && <span className="bk" onClick={() => to && setStep(to)} style={{ cursor: "pointer" }}>&larr;</span>}<span>{title}</span></div>
  );
  const B = ({ k = "", children, onClick, disabled }: { k?: string; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button className={`btn ${k}`} onClick={onClick} disabled={disabled}>{children}</button>
  );

  const waiverStatus = booking?.detail.feeWaiverStatus;
  const accepted = waiverStatus === "Accept";

  function screen() {
    switch (step) {
      case "trips":
        return (<><Bar title="My trips" />
          <div className="tabs"><div className="on">Upcoming</div><div>Past</div><div>Cancelled</div></div>
          <div className="body">
            <div className="card" style={{ cursor: "pointer" }} onClick={openDetails}>
              <div className="imgp" style={{ height: 54 }}>hotel photo</div>
              <b style={{ display: "block", marginTop: 5 }}>{f.hotel}</b>
              <div className="muted">{f.checkInLabel.slice(4, 10)} – {f.checkOutLabel.slice(4)} · 2 nights</div>
              <div className="kv" style={{ marginTop: 3 }}><span className="muted">Ref {f.voyaRef}</span><span className="pill">{f.status === "BookingCancelledByCustomer" ? "Cancelled" : "Confirmed"}</span></div></div>
            <div className="card"><b>Sample Hotel, Goa</b><div className="muted">15 – 17 Jan 2027 · Ref VY-1051</div></div>
            <div className="muted">Tap the first booking to open it.</div>
          </div>
          <div className="nav"><div>Search</div><div className="on">My trips</div><div>Account</div></div></>);
      case "details": {
        const cancelled = booking?.cancelled;
        return (<><Bar title="Booking details" back to="trips" />
          <div className="body">
            <div className="kv"><b style={{ fontSize: 13 }}>{f.hotel}</b><span className="pill">{booking ? (cancelled ? "Cancelled" : "Confirmed") : "Checking"}</span></div>
            <div className="card">
              <div className="kv"><span>Check-in</span><span>{f.checkInLabel}</span></div>
              <div className="kv"><span>Check-out</span><span>{f.checkOutLabel}</span></div>
              <div className="kv"><span>Guests</span><span>1 room, 2 adults</span></div>
              <div className="kv"><span>Voya ref</span><span>{f.voyaRef}</span></div>
              <div className="kv"><span>Paid</span><span>{inr(f.paid)}</span></div></div>
            {cancelled && <div className="card g sm"><b>This booking was cancelled.</b> Nothing more to do here.</div>}
            <div className="card g"><b>Cancellation policy</b><div className="sm" style={{ marginTop: 2 }}>{f.policyText}</div>
              <div className="muted" style={{ marginTop: 3 }}>Shown as saved when you booked. The exact refund is confirmed before you cancel.</div></div>
            <div style={{ flex: 1 }} />
            {!cancelled && <B onClick={startCancel} disabled={!booking}>Cancel booking</B>}
            <div className="lnk">Contact support</div>
          </div></>);
      }
      case "loading":
        return (<><Bar title="Review cancellation" />
          <div className="body">{stay}<div className="spin" />
            <div style={{ textAlign: "center", fontWeight: 600 }}>Checking cancellation terms</div>
            <div className="muted" style={{ textAlign: "center" }}>We are checking with the hotel booking provider. This can take up to two minutes.</div>
            <div style={{ flex: 1 }} /><B onClick={() => setStep("details")}>Back to booking</B></div></>);
      case "preview":
        if (!quote) return null;
        return (<><Bar title="Review cancellation" back to="details" />
          <div className="body">{stay}
            {note && <div className="warn sm">{note}</div>}
            <div className="card"><div className="muted">Estimated refund</div><div style={{ fontSize: 21, fontWeight: 700 }}>{inr(quote.refund)}</div>
              <div className="hr" style={{ margin: "5px 0" }} />
              <div className="kv"><span>You paid</span><span>{inr(quote.paid)}</span></div>
              <div className="kv"><span>Cancellation fee</span><span>{inr(quote.paid - quote.refund)}</span></div></div>
            {quote.refund === 0 && <div className="warn"><b>No refund for this booking.</b><div className="sm">This rate is non-refundable. You can still cancel, but no money will be returned.</div></div>}
            {quote.refund > 0 && <div className="card g sm">{quote.policyText}</div>}
            <div style={{ flex: 1 }} />
            <B k="p" onClick={() => setStep("review")}>Continue</B><B onClick={() => setStep("details")}>Keep booking</B>
            {booking?.detail.isFeeWaiverAllowed && quote.refund === 0 && <div className="lnk" onClick={() => { setAck(false); setStep("waiver"); }}>Ask whether the cancellation fee can be waived</div>}
          </div></>);
      case "review":
        if (!quote) return null;
        return (<><Bar title="Review cancellation" back to="preview" />
          <div className="body">{stay}
            <div className="kv big"><span>Estimated refund</span><span>{inr(quote.refund)}</span></div>
            <div className="muted">Why are you cancelling? (optional)</div>
            {REASONS.map((r) => <div key={r.code} className={`radio ${reason === r.code ? "on" : ""}`} onClick={() => setReason(r.code)} style={{ cursor: "pointer" }}><i />{r.label}</div>)}
            <div style={{ flex: 1 }} />
            <B k="d" onClick={() => confirm(false)}>Yes, cancel booking</B><B onClick={() => setStep("details")}>Keep booking</B></div></>);
      case "sending":
        return (<><Bar title="Cancelling" /><div className="body">{stay}<div className="spin" />
          <div style={{ textAlign: "center", fontWeight: 600 }}>Sending your cancellation</div>
          <div className="muted" style={{ textAlign: "center" }}>We are checking with the hotel booking provider. This can take up to two minutes. You can leave this screen; we will keep going.</div>
          <div style={{ flex: 1 }} /><B k="dis" disabled>Yes, cancel booking</B><B onClick={() => reset(sid)}>Go to My trips</B></div></>);
      case "confirmed":
        return (<><Bar title="Cancellation confirmed" /><div className="body">
          <div style={{ textAlign: "center", fontSize: 26, fontWeight: 700, border: "2px solid #222", borderRadius: "50%", width: 46, height: 46, lineHeight: "42px", margin: "4px auto 0" }}>&#10003;</div>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>Cancellation confirmed</div>{stay}
          <div className="kv"><span className="muted">Status</span><span className="pill dk">Cancelled</span></div>
          {quote && quote.refund > 0
            ? <div className="card g sm"><b>Refund</b><div>{inr(quote.refund)} will be returned to your original payment method. We will message you when it has been processed.</div></div>
            : <div className="card g sm"><b>Refund</b><div>No refund applies to this booking.</div></div>}
          <div style={{ flex: 1 }} /><B k="p" onClick={openDetails}>View booking</B><B onClick={() => reset(sid)}>Back to My trips</B></div></>);
      case "unknown":
        return (<><Bar title="Cancellation status" /><div className="body">
          <div style={{ textAlign: "center", fontSize: 24, fontWeight: 700, border: "2px solid #222", borderRadius: "50%", width: 46, height: 46, lineHeight: "42px", margin: "4px auto 0" }}>?</div>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>We couldn&apos;t confirm the result yet</div>{stay}
          <div className="kv"><span className="muted">Status</span><span className="pill">{stillActive ? "Still active" : "Checking"}</span></div>
          <div className="card g sm">{stillActive ? "We checked: your booking is still active. You can try again with a new quote." : "Your booking may still be active. We are checking its status and will message you. Please don't cancel again."}</div>
          <div style={{ flex: 1 }} />{stillActive ? <B k="p" onClick={() => fetchQuote("unknown")}>Try again</B> : <B k="p" onClick={() => reset(sid)}>Back to My trips</B>}<B>Contact support</B></div></>);
      case "failed":
        return (<><Bar title="Cancellation" /><div className="body">
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, marginTop: 4 }}>We couldn&apos;t cancel this booking</div>{stay}
          <div className="card g sm">Your booking is still active. We checked just now. Nothing has been changed.</div>
          <div style={{ flex: 1 }} /><B k="p" onClick={() => fetchQuote("failed")}>Try again</B><B>Contact support</B></div></>);
      case "assisted":
        return (<><Bar title="Booking details" back to="details" /><div className="body">
          <div className="kv"><b style={{ fontSize: 13 }}>{f.hotel}</b><span className="pill">Confirmed</span></div>
          <div className="card"><div className="kv"><span>Check-in</span><span>{f.checkInLabel}</span></div><div className="kv"><span>Voya ref</span><span>{f.voyaRef}</span></div></div>
          <div className="warn"><b>We can&apos;t cancel this booking in the app.</b><div className="sm">Our support team can check what options are available. Have your booking reference ready.</div></div>
          <div style={{ flex: 1 }} /><B k="p">Contact support</B><B onClick={() => reset(sid)}>Back to My trips</B></div></>);
      case "waiver":
        return (<><Bar title="Request an exception" back to="preview" /><div className="body">{stay}
          <div className="sm"><b>Ask whether the cancellation fee can be waived.</b> The hotel will decide. There is no guarantee.</div>
          <div className="muted">Reason (required)</div><div className="card sm" style={{ padding: "5px 8px" }}>Select a reason &#9662;</div>
          <div className="muted">Note for the hotel (optional)</div><div className="card" style={{ height: 38 }} />
          <div className="chk" onClick={() => setAck(!ack)} style={{ cursor: "pointer" }}><i style={{ background: ack ? "#222" : "#fff" }} /><span>I understand the fee of {inr(f.fee)} applies if the hotel says no.</span></div>
          <div style={{ flex: 1 }} /><B k={ack ? "p" : "dis"} disabled={!ack} onClick={() => confirm(true)}>Send request</B><B onClick={() => setStep("preview")}>Back</B></div></>);
      case "waiverPending":
        return (<><Bar title="Exception request" /><div className="body">
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, marginTop: 4 }}>Waiting for the hotel</div>{stay}
          <div className="card"><div className="kv"><span>Request</span><span className="pill">Pending</span></div></div>
          <div className="card g sm">The hotel decides whether to waive the fee. We will keep checking for up to 72 hours and message you when there is an answer. (Demo: the answer arrives in a few seconds.)</div>
          <div style={{ flex: 1 }} /><B k="p" onClick={() => reset(sid)}>Back to My trips</B><B>Contact support</B></div></>);
      case "waiverResult":
        return (<><Bar title="Exception request" /><div className="body">
          <div className="card"><span className={`pill ${accepted ? "dk" : ""}`}>{accepted ? "Accepted" : "Declined"}</span>
            <div className="sm" style={{ marginTop: 3 }}>{accepted ? <><b>The hotel waived the fee.</b> Your booking is cancelled. We will show your refund once it is confirmed.</> : <><b>The hotel did not waive the fee.</b> The original terms apply: refund {inr(0)}.</>}</div></div>
          <div className="card g sm">Any other status, or no answer: we send you to support with your booking reference.</div>
          <div style={{ flex: 1 }} /><B k="p" onClick={() => reset(sid)}>Back to My trips</B><B>Contact support</B></div></>);
    }
  }

  return (
    <div className="wrap">
      <h1>Voya hotel cancellation, Android prototype</h1>
      <p className="lead">Interactive prototype using simulated Agoda API responses. It shows the cancellation flow from the wireframes. No real bookings, payments, credentials or Agoda calls are involved, and waits are shortened for the demo (the documented limit for Preview and Confirm is 120 seconds).</p>
      <div className="banner">All hotels, prices and dates are invented test data. Demo date: Sunday 25 October 2026.</div>
      <div className="grid">
        <div className="devwrap"><div className="devbox"><div className="ph">
          <div className="sb"><span>9:41</span><span>LTE &nbsp;100%</span></div>{screen()}<div className="gest"><span /></div></div></div></div>
        <div>
          <div className="panel"><h2>Test scenario <button className="reset" onClick={() => reset(sid)} style={{ marginLeft: 8 }}>Restart</button></h2>
            {FIXTURES.map((x) => (<button key={x.id} className={`sc ${x.id === sid ? "on" : ""}`} onClick={() => reset(x.id)}>{x.label}<small>{x.what}</small></button>))}</div>
          <div className="panel"><h2>Voya backend and simulated Agoda calls</h2>
            {trace.length === 0 && <div className="muted">Open the booking to see the calls Voya makes. The phone never talks to Agoda directly.</div>}
            {trace.map((t, i) => (<div className="log" key={i}><b>{t.call}</b>{t.request ? "Request: " + JSON.stringify(t.request) + "\n" : ""}{"Response: " + (typeof t.response === "string" ? t.response : JSON.stringify(t.response))}</div>))}
            <div className="muted" style={{ marginTop: 4 }}>Response shapes follow Agoda&apos;s cancellation guide where it documents them. Booking Detail is simplified. Fixture values are invented.</div></div>
        </div>
      </div>
    </div>
  );
}
