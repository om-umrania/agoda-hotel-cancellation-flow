"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SCENARIOS, SCENARIO_BY_ID, REASONS, CORNER_CASES, CORNER_COUNT,
  type Scenario,
} from "@/lib/scenarios";

type Step =
  | "trips" | "details" | "preview" | "confirm"
  | "processing" | "done" | "error" | "assisted" | "tracker";

const money = (n: number, c = "INR") =>
  c === "INR" ? "₹" + n.toLocaleString("en-IN") : n.toLocaleString();

const STEP_ORDER: Step[] = ["details", "preview", "confirm", "processing", "done"];

const NOTES: Record<string, { title: string; api: string; design: string; dev: string; biz: string }> = {
  trips: {
    title: "My Trips — the entry point",
    api: "Retrieve Booking (Post-Book)",
    design: "Lead with the soonest upcoming trip. Show the free-cancel hint on the card itself, before the user drills in.",
    dev: "List from cache, reconciled with Retrieve Booking for live status + cancellationPolicy. Paginate; handle empty.",
    biz: "Surfacing the deadline early nudges cancels inside the free window → fewer penalties & tickets.",
  },
  details: {
    title: "Booking Details",
    api: "Retrieve Booking → cancellationPolicy{date[]}",
    design: "'Cancel' is present but not the loudest control. Deadline shown as a live countdown inside the window.",
    dev: "Derive the deadline from cancellationPolicy.date[]. Guard: if now ≥ check-in − 1 day → route to assisted.",
    biz: "Best place to offer 'modify instead of cancel' and retain the booking before intent hardens.",
  },
  preview: {
    title: "Refund Preview — the make-or-break screen",
    api: "Cancellation · Preview {bookingId} → reference, refundRate",
    design: "Refund amount is the hero; the math is explicit (Paid − Fee = Refund). CTA states the outcome.",
    dev: "Refund is server-authoritative (refundRate) — never computed on device. Hold reference for Confirm; refresh if stale.",
    biz: "Transparency here is the biggest lever on disputes & chargebacks. Instrument drop-off.",
  },
  confirm: {
    title: "Confirm + re-authenticate",
    api: "Cancellation · Confirm {bookingId, reference, cancelReason, refundRate}",
    design: "A plain last summary + honest 'can't be undone'. Re-auth + a deliberate confirm (not a stray tap).",
    dev: "Confirm carries the Preview reference + our idempotency key → a double-tap or retry never double-cancels.",
    biz: "Deliberate friction prevents regret cancellations & fraud. Reason codes feed analytics & supply insight.",
  },
  processing: {
    title: "Processing",
    api: "await Confirm / poll status (~120s SLA)",
    design: "Show progress + reassurance and let the user leave — never an infinite spinner.",
    dev: "On PENDING, poll refund status / await webhook refund.completed. Persist cancellationId.",
    biz: "Managing the wait honestly prevents duplicate cancels and 'did it work?' tickets.",
  },
  done: {
    title: "Confirmed — a trust artifact",
    api: "refund.completed (webhook) / status",
    design: "Lead with the refund timeline — the real anxiety-reliever. Offer receipt + a gentle rebook nudge.",
    dev: "Render from Confirm result + refund status; send email/push; move booking to Cancelled.",
    biz: "Confirmation deflects tickets; the rebook CTA recovers revenue; track refund-SLA adherence.",
  },
  error: {
    title: "Error — never a dead end",
    api: "errorMessage{id,subId,message} / error 108",
    design: "Plain-language error with a clear next step. Reassure: booking unchanged, nothing charged.",
    dev: "Map Agoda error codes to friendly copy; retriable vs terminal; idempotent retry (same reference).",
    biz: "Good failure UX = fewer chargebacks and calls. Track failure reasons to fix top causes.",
  },
  assisted: {
    title: "Assisted / Fee-Waiver",
    api: "Fee-Waiver Cancellation (manual)",
    design: "Don't hard-fail past the window — offer a human path with context pre-filled.",
    dev: "Agoda allows self-serve up to 1 day before check-in; beyond that, escalate with booking context.",
    biz: "Protects goodwill in the worst moments (disasters, emergencies); captures waiver reasons.",
  },
  tracker: {
    title: "Refund status tracker",
    api: "refund status / webhook",
    design: "Answer 'where's my money?' with an honest timeline and the destination (card ••••).",
    dev: "Poll/subscribe to refund events; escalate automatically if past the promised SLA.",
    biz: "Visible refund progress is the single biggest deflector of post-cancel support contacts.",
  },
};

export default function Prototype() {
  const [mode, setMode] = useState<"hifi" | "wireframe">("hifi");
  const [sid, setSid] = useState("free");
  const s: Scenario = SCENARIO_BY_ID[sid];

  const [step, setStep] = useState<Step>("trips");
  const [authed, setAuthed] = useState(false);
  const [authFail, setAuthFail] = useState(false);
  const [reason, setReason] = useState<number | null>(null);
  const [showReasons, setShowReasons] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const [staleResolved, setStaleResolved] = useState(false);
  const timer = useRef<number | null>(null);

  const clear = () => { if (timer.current) { window.clearTimeout(timer.current); timer.current = null; } };
  const resetFlow = useCallback((to: Step = "trips") => {
    clear(); setStep(to); setAuthed(false); setAuthFail(false); setReason(null);
    setShowReasons(false); setSubmitting(false); setPending(false);
    setReconnected(false); setStaleResolved(false);
  }, []);

  useEffect(() => { resetFlow("trips"); /* eslint-disable-next-line */ }, [sid]);
  useEffect(() => () => clear(), []);

  const offlineNow = s.fault === "offline" && !reconnected;
  const staleNow = s.fault === "stale" && !staleResolved;

  const startCancel = () => {
    if (s.timing === "within24h" || s.timing === "postcheckin") setStep("assisted");
    else setStep("preview");
  };
  const toConfirm = () => { setAuthed(false); setAuthFail(false); setSubmitting(false); setStep("confirm"); };
  const doAuth = () => { setAuthed(true); setAuthFail(false); };
  const doConfirm = () => {
    if (!authed || submitting) return;         // idempotency / re-auth guard
    setSubmitting(true);
    setPending(false);
    setStep("processing");
    const delay = s.fault === "timeout" ? 3600 : 1900;
    timer.current = window.setTimeout(() => {
      if (s.fault === "error" || s.fault === "auth108") setStep("error");
      else { if (s.fault === "timeout") setPending(true); setStep("done"); }
    }, delay) as unknown as number;
  };

  const loadCase = (scenarioId?: string) => {
    if (!scenarioId) return;
    setSid(scenarioId);
    setTimeout(() => {
      document.getElementById("stage")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  return (
    <div className="app" data-mode={mode}>
      {/* ---------------- HERO ---------------- */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="badge"><span className="b">V</span> Voya × Agoda · Android</span>
            <h1>The hotel <span className="bl">cancellation</span> flow — live.</h1>
            <p className="lead">
              An interactive prototype of a self-serve cancellation experience for an Android
              hotel-booking app, powered by Agoda&apos;s Demand API. Toggle wireframe ⇄ hi-fi,
              walk the full flow, and explore <b>{CORNER_COUNT} corner cases</b>. One promise:
              <b> no surprises about the refund.</b>
            </p>
            <span className="hand">cancel with confidence ↝</span>
            <div className="steps">
              <span className="stepchip"><b>1</b> Wireframe</span>
              <span className="stepchip"><b>2</b> Hi-fi design</span>
              <span className="stepchip"><b>3</b> App flow</span>
              <span className="stepchip"><b>4</b> Corner cases</span>
            </div>
            <div className="hero-meta">
              <span className="m">PM101 · Masters&apos; Union</span>
              <span className="m">Agoda Partner Fulfillment</span>
              <span className="m">Two-step Preview → Confirm</span>
            </div>
          </div>
          <div className="hero-mini">
            <MiniCover />
          </div>
        </div>
      </header>

      <main className="wrap">
        {/* ---------------- CONTROLS ---------------- */}
        <div className="toolbar">
          <div className="seg" role="tablist" aria-label="Fidelity">
            <button className={mode === "wireframe" ? "on" : ""} onClick={() => setMode("wireframe")}>✎ Wireframe</button>
            <button className={mode === "hifi" ? "on" : ""} onClick={() => setMode("hifi")}>✦ Hi-fi design</button>
          </div>
          <button className="scen" onClick={() => resetFlow("trips")}>↺ Restart flow</button>
          <span className="label" style={{ marginLeft: "auto" }}>Scenario</span>
        </div>
        <div className="scenbar">
          {SCENARIOS.map((sc) => (
            <button key={sc.id} className={`scen ${sid === sc.id ? "on" : ""}`} onClick={() => setSid(sc.id)}>
              <span>{sc.emoji}</span> {sc.label}
            </button>
          ))}
        </div>

        {/* ---------------- STAGE ---------------- */}
        <div className="stage" id="stage">
          <div className="devicewrap">
            <div className="device">
              <div className="ds">
                {mode === "wireframe" && <span className="wflabel">WIREFRAME</span>}
                {renderScreen()}
              </div>
            </div>
            <div className="dhint">{mode === "wireframe" ? "Low-fi structure & logic" : "Hi-fi, Agoda-styled"} · tap through it →</div>
          </div>

          <SideNotes step={step} scenario={s} />
        </div>

        {/* ---------------- CORNER CASES ---------------- */}
        <div className="section-h">
          <h2>Corner cases</h2>
          <span className="count">{CORNER_COUNT} handled</span>
          <span className="sub" style={{ color: "var(--ink-soft)" }}>
            the unhappy paths <i>are</i> the product — tap <b style={{ color: "var(--blue)" }}>▶ demo</b> to load one into the phone
          </span>
        </div>
        <div className="ccgroups">
          {CORNER_CASES.map((g) => (
            <div className="ccgroup" key={g.category}>
              <div className="gh"><span>{g.emoji}</span> {g.category} <span className="n">{g.items.length}</span></div>
              {g.items.map((c) => (
                <div className="cc" key={c.id}>
                  <div className="t">
                    {c.title}
                    {c.demo && <button className="demo" onClick={() => loadCase(c.demo)}>▶ demo</button>}
                  </div>
                  <div className="trig">trigger · {c.trigger}</div>
                  <div className="hand">{c.handling}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="foot">
          <span>Voya × Agoda · PM101 Mid-Course Case · Masters&apos; Union</span>
          <span>Refund is always Agoda&apos;s number · Confirm is idempotent (reference + key)</span>
        </div>
      </main>
    </div>
  );

  // ---------------- screen renderer ----------------
  function renderScreen() {
    const key = step + sid + String(authed) + String(reason) + String(pending) + String(reconnected) + String(staleResolved);
    return <div className="screenfx" key={key} style={{ display: "contents" }}>{screenBody()}</div>;
  }

  function screenBody() {
    switch (step) {
      case "trips": return <ScrTrips s={s} onOpen={() => setStep("details")} />;
      case "details": return <ScrDetails s={s} onCancel={startCancel} onBack={() => setStep("trips")} />;
      case "preview":
        return (
          <ScrPreview
            s={s} offline={offlineNow} stale={staleNow}
            onReconnect={() => setReconnected(true)}
            onRefresh={() => setStaleResolved(true)}
            onContinue={toConfirm} onBack={() => setStep("details")}
          />
        );
      case "confirm":
        return (
          <ScrConfirm
            s={s} authed={authed} authFail={authFail} reason={reason} showReasons={showReasons}
            onToggleReasons={() => setShowReasons((v) => !v)}
            onPickReason={(c) => { setReason(c); setShowReasons(false); }}
            onAuth={doAuth} onConfirm={doConfirm} submitting={submitting}
            onBack={() => setStep("preview")}
          />
        );
      case "processing": return <ScrProcessing s={s} />;
      case "done": return <ScrDone s={s} pending={pending} onTrack={() => setStep("tracker")} onRebook={() => resetFlow("trips")} />;
      case "error": return <ScrError s={s} onRetry={() => { setSubmitting(false); setStep("confirm"); }} onBack={() => resetFlow("trips")} />;
      case "assisted": return <ScrAssisted s={s} onBack={() => setStep("details")} />;
      case "tracker": return <ScrTracker s={s} onDone={() => resetFlow("trips")} />;
      default: return null;
    }
  }

  function SideNotes({ step, scenario }: { step: Step; scenario: Scenario }) {
    const n = NOTES[step];
    const idx = STEP_ORDER.indexOf(step);
    return (
      <div className="lenses">
        <div className="notecard">
          <div className="k">Now showing · {scenario.emoji} {scenario.label}</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginTop: 6 }}>{n.title}</div>
          <div className="row" style={{ marginTop: 6, gap: 8 }}>
            <span className="chip bl">API · {n.api}</span>
          </div>
          <div className="progressrow">
            {STEP_ORDER.map((st, i) => (
              <span key={st} className={`pstep ${st === step ? "on" : idx > i && idx >= 0 ? "done" : ""}`}>{i + 1} {st}</span>
            ))}
          </div>
          <p className="sub" style={{ marginTop: 10 }}><b style={{ color: "var(--ink)" }}>Handling:</b> {scenario.handling}</p>
        </div>
        <div className="lens design"><h4><span>🎨</span> Design · UI/UX</h4><p>{n.design}</p></div>
        <div className="lens dev"><h4><span>⚙️</span> Developer · API</h4><p>{n.dev}</p></div>
        <div className="lens biz"><h4><span>📈</span> Business</h4><p>{n.biz}</p></div>
      </div>
    );
  }
}

/* ======================= screen components ======================= */
function StatusBar() {
  return (
    <div className="dstatus"><span>9:41</span><span className="notch" /><span>▦ ▾ ▮</span></div>
  );
}
function BottomNav({ on = "Trips" }: { on?: string }) {
  const items: [string, string][] = [["⌂", "Home"], ["◎", "Search"], ["✈", "Trips"], ["◍", "Account"]];
  return (
    <div className="dnav">
      {items.map(([ic, l]) => (
        <div key={l} className={`n ${l === on ? "on" : ""}`}><span className="ic">{ic}</span>{l}</div>
      ))}
    </div>
  );
}
function policyBadge(s: Scenario) {
  if (s.policy === "nonref") return { cls: "bad", txt: "Non-refundable" };
  if (s.policy === "partial" || s.policy === "multitier") return { cls: "warn", txt: "Partial refund" };
  if (s.policy === "payathotel") return { cls: "bl", txt: "Pay at hotel" };
  return { cls: "ok", txt: "Free cancellation" };
}

function ScrTrips({ s, onOpen }: { s: Scenario; onOpen: () => void }) {
  const b = policyBadge(s);
  return (
    <>
      <StatusBar />
      <div className="dbar"><span className="t">My trips</span><span className="sp">◌</span></div>
      <div className="dbody">
        <div className="seg2"><div className="on">Upcoming</div><div>Completed</div><div>Cancelled</div></div>
        <button className="c" style={{ textAlign: "left", cursor: "pointer" }} onClick={onOpen}>
          <div className="row">
            <div className="img" style={{ width: 56, height: 56 }}>🏨</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <div className="h">{s.hotel}</div>
              <div className="sub">{s.dates} · {s.nights}N · {s.guests} guests · {s.city}</div>
              <div className="row"><span className={`chip ${b.cls}`}>{b.txt}</span><span className="chip bl">CONFIRMED</span></div>
            </div>
          </div>
        </button>
        <div className="c" style={{ opacity: .7 }}>
          <div className="row">
            <div className="img" style={{ width: 56, height: 56 }}>🏨</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <div className="h">Courtyard Marriott</div>
              <div className="sub">22–24 Dec · 2N · 2 guests · Agra</div>
              <div className="row"><span className="chip ok">FREE till 20 Dec</span><span className="chip bl">CONFIRMED</span></div>
            </div>
          </div>
        </div>
        <div className="tiny" style={{ textAlign: "center", marginTop: 4 }}>Tap your {s.hotel} booking to continue →</div>
      </div>
      <BottomNav on="Trips" />
    </>
  );
}

function ScrDetails({ s, onCancel, onBack }: { s: Scenario; onCancel: () => void; onBack: () => void }) {
  const inWindow = s.timing === "free";
  const b = policyBadge(s);
  return (
    <>
      <StatusBar />
      <div className="dbar"><span className="bk" onClick={onBack} style={{ cursor: "pointer" }}>←</span><span className="t">Booking details</span></div>
      <div className="dbody">
        <div className="img" style={{ height: 96 }}>🏨</div>
        <div className="c"><div className="h">{s.hotel}, {s.city}</div><div className="sub">★ 4.8 · Deluxe Room · {s.guests} guests</div></div>
        <div className="c">
          <div className="row sb">
            <div><div className="tiny">Check-in</div><div className="h" style={{ fontSize: 13 }}>{s.dates.split("–")[0] || s.dates}</div></div>
            <div><div className="tiny">Nights</div><div className="h" style={{ fontSize: 13 }}>{s.nights}</div></div>
            <div><div className="tiny">{s.paid > 0 ? "Paid" : "To pay"}</div><div className="h" style={{ fontSize: 13 }}>{money(s.paid, s.currency)}</div></div>
          </div>
        </div>
        <div className={inWindow ? "warnbox" : "c"} style={inWindow ? { borderColor: "color-mix(in srgb,var(--green) 40%,transparent)", background: "var(--green-soft)" } : {}}>
          <div className="row">
            {inWindow ? <div className="ring" style={{ "--p": s.ringPct } as React.CSSProperties}><span>{s.countdown.split(" ")[0]}</span></div> : <span style={{ fontSize: 20 }}>{s.policy === "nonref" ? "⛔" : "📋"}</span>}
            <div>
              <div className="h" style={{ fontSize: 13, color: inWindow ? "var(--green)" : "var(--ink)" }}>{b.txt}</div>
              <div className="tiny">{s.deadline}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="dcta">
        <div className="row" style={{ gap: 8 }}>
          <button className="btn ghost" style={{ flex: 1, opacity: .45 }} disabled>Modify</button>
          <button className="btn" style={{ flex: 1 }}>Contact</button>
        </div>
        <button className="btn dangerline" onClick={onCancel}>Cancel booking</button>
      </div>
    </>
  );
}

function ScrPreview({ s, offline, stale, onReconnect, onRefresh, onContinue, onBack }:
  { s: Scenario; offline: boolean; stale: boolean; onReconnect: () => void; onRefresh: () => void; onContinue: () => void; onBack: () => void }) {
  const b = policyBadge(s);
  if (offline) {
    return (
      <>
        <StatusBar />
        <div className="dbar"><span className="bk" onClick={onBack} style={{ cursor: "pointer" }}>←</span><span className="t">Cancel booking</span></div>
        <div className="dbody center" style={{ justifyContent: "center", gap: 12 }}>
          <div style={{ fontSize: 30 }}>📴</div>
          <div className="h">You&apos;re offline</div>
          <div className="sub" style={{ maxWidth: 210 }}>We need a connection to fetch your exact refund from Agoda. We won&apos;t guess the number.</div>
        </div>
        <div className="dcta"><button className="btn blue" onClick={onReconnect}>Retry connection</button></div>
      </>
    );
  }
  const refundColor = s.refund > 0 ? "var(--green)" : "var(--red)";
  const ctaLabel = s.policy === "nonref" || s.refund === 0 ? "Cancel — no refund" : `Cancel & get ${money(s.refund, s.currency)} back`;
  return (
    <>
      <StatusBar />
      <div className="dbar"><span className="bk" onClick={onBack} style={{ cursor: "pointer" }}>←</span><span className="t">Cancel booking</span></div>
      <div className="dbody">
        {stale && (
          <div className="warnbox">
            <div className="row sb"><div className="h" style={{ fontSize: 13, color: "var(--amber)" }}>⏳ Quote expired</div></div>
            <div className="tiny">Prices and policy can change. Refresh to see your current refund before continuing.</div>
            <button className="btn" style={{ padding: 9, fontSize: 12 }} onClick={onRefresh}>Refresh quote</button>
          </div>
        )}
        <div className="c" style={{ borderColor: `color-mix(in srgb,${refundColor} 40%,transparent)` }}>
          <div className="row sb"><span className="h">You&apos;ll get back</span><span className={`chip ${b.cls}`}>{b.txt}</span></div>
          <div className="bignum" style={{ color: refundColor }}>{s.refund > 0 ? money(s.refund, s.currency) : "₹0"}</div>
          {s.policy === "payathotel" && <div className="tiny">Nothing was charged — we&apos;ll just release the room.</div>}
        </div>
        {s.paid > 0 && (
          <div className="money">
            <div className="r"><span>Amount paid</span><span>{money(s.paid, s.currency)}</span></div>
            <div className="r"><span>Cancellation fee</span><span>− {money(s.fee, s.currency)}</span></div>
            <div className="r tot"><span>Refund</span><b style={{ color: refundColor }}>{money(s.refund, s.currency)}</b></div>
          </div>
        )}
        {s.policy === "multitier" && <div className="tiny">You&apos;re in the <b>50% tier</b> now. After 30 Nov this becomes non-refundable.</div>}
        {s.refund > 0 && (
          <div className="c flat"><div className="h" style={{ fontSize: 13 }}>Back to your card · {s.etaDays}</div>
            {s.timing === "free" && <div className="row"><div className="ring" style={{ "--p": s.ringPct } as React.CSSProperties}><span>{s.countdown.split(" ")[0]}</span></div><div className="tiny">{s.deadline}</div></div>}
          </div>
        )}
        {s.refund === 0 && s.policy === "nonref" && <div className="field" style={{ justifyContent: "center", color: "var(--blue)" }}>Get travel credit instead →</div>}
      </div>
      <div className="dcta">
        <button className={`btn ${s.refund > 0 ? "primary" : "danger"}`} disabled={stale} onClick={onContinue}>{ctaLabel}</button>
        <button className="btn ghost" onClick={onBack}>Keep booking</button>
      </div>
    </>
  );
}

function ScrConfirm({ s, authed, authFail, reason, showReasons, onToggleReasons, onPickReason, onAuth, onConfirm, submitting, onBack }:
  {
    s: Scenario; authed: boolean; authFail: boolean; reason: number | null; showReasons: boolean;
    onToggleReasons: () => void; onPickReason: (c: number) => void; onAuth: () => void; onConfirm: () => void; submitting: boolean; onBack: () => void;
  }) {
  const reasonLabel = reason != null ? REASONS.find((r) => r.code === reason)?.label : null;
  return (
    <>
      <StatusBar />
      <div className="dbar"><span className="bk" onClick={onBack} style={{ cursor: "pointer" }}>←</span><span className="t">Confirm cancellation</span></div>
      <div className="dbody">
        <div className="c"><div className="h" style={{ fontSize: 13 }}>{s.hotel} · {s.dates}</div>
          <div className="row sb"><span className="sub">You&apos;ll be refunded</span><span className="h" style={{ fontSize: 13, color: s.refund > 0 ? "var(--green)" : "var(--red)" }}>{s.refund > 0 ? money(s.refund, s.currency) : "₹0"}</span></div></div>

        <button className="field" onClick={onToggleReasons} style={{ justifyContent: "space-between", cursor: "pointer" }}>
          <span>{reasonLabel ? `Reason · ${reasonLabel}` : "＋ Add a reason (optional)"}</span><span>▾</span>
        </button>
        {showReasons && (
          <div className="c" style={{ gap: 2, padding: 6 }}>
            {REASONS.map((r) => (
              <button key={r.code} className="field" style={{ border: 0, justifyContent: "space-between", cursor: "pointer" }} onClick={() => onPickReason(r.code)}>
                <span style={{ color: "var(--ink)" }}>{r.label}</span><span className="tiny">code {r.code}</span>
              </button>
            ))}
          </div>
        )}

        <div className="warnbox"><div className="row"><span style={{ fontSize: 16 }}>⚠️</span><div className="h" style={{ fontSize: 13, color: "var(--amber)" }}>This can&apos;t be undone.</div></div><div className="tiny">The room is released to the hotel immediately.</div></div>

        <div className="c center">
          <button className={`bio ${authed ? "ok" : authFail ? "fail" : ""}`} onClick={onAuth} aria-label="Authenticate">{authed ? "✓" : "☝"}</button>
          <div className="h" style={{ fontSize: 13 }}>{authed ? "Identity confirmed" : "Confirm with fingerprint"}</div>
          <div className="tiny">{authed ? "Re-authenticated" : "Re-authenticate to cancel"}</div>
        </div>
      </div>
      <div className="dcta">
        <button className="btn danger" disabled={!authed || submitting} onClick={onConfirm}>
          {submitting ? "Cancelling…" : "Confirm cancellation"}
        </button>
        <button className="btn ghost" onClick={onBack}>Go back</button>
      </div>
    </>
  );
}

function ScrProcessing({ s }: { s: Scenario }) {
  return (
    <>
      <StatusBar />
      <div className="dbar grey"><span className="t">Cancelling…</span></div>
      <div className="dbody center" style={{ justifyContent: "center", gap: 12 }}>
        <div className="spin" />
        <div className="h">Confirming with the hotel</div>
        <div className="sub" style={{ maxWidth: 200 }}>
          {s.fault === "timeout" ? "Agoda is taking longer than usual. We won't spin forever — we'll reconcile and update you." : "This can take up to 2 minutes. You can leave — we'll notify you when it's done."}
        </div>
      </div>
      <div className="dcta"><button className="btn ghost">Notify me &amp; leave</button></div>
    </>
  );
}

function ScrDone({ s, pending, onTrack, onRebook }: { s: Scenario; pending: boolean; onTrack: () => void; onRebook: () => void }) {
  return (
    <>
      <StatusBar />
      <div className="dbar green"><span className="t">Cancelled</span></div>
      <div className="dbody center" style={{ gap: 10 }}>
        <div className="check">✓</div>
        <div className="h">Booking cancelled</div>
        <div className="sub">Ref · <b>VOYA-CXL-{s.reference}</b></div>
        {s.refund > 0 ? (
          <div className="c" style={{ width: "100%", borderColor: "color-mix(in srgb,var(--green) 40%,transparent)" }}>
            <div className="row sb"><span className="h" style={{ fontSize: 13 }}>Refund</span><span className="h" style={{ fontSize: 13, color: "var(--green)" }}>{money(s.refund, s.currency)}</span></div>
            <div className="tiny">{pending ? "Refund is being confirmed — we'll update you shortly." : `To your card · arrives in ${s.etaDays}`}</div>
          </div>
        ) : (
          <div className="c flat" style={{ width: "100%" }}><div className="tiny">{s.policy === "payathotel" ? "Nothing was charged — no refund needed." : "This rate was non-refundable, so there's no refund."}</div></div>
        )}
        {pending && <span className="chip warn">REFUND PENDING</span>}
        <div className="tiny">📧 Receipt sent to your email</div>
      </div>
      <div className="dcta">
        {s.refund > 0 && <button className="btn blue" onClick={onTrack}>View refund status</button>}
        <button className="btn ghost" onClick={onRebook}>Find another stay</button>
      </div>
    </>
  );
}

function ScrError({ s, onRetry, onBack }: { s: Scenario; onRetry: () => void; onBack: () => void }) {
  const is108 = s.fault === "auth108";
  return (
    <>
      <StatusBar />
      <div className="dbar red"><span className="t">Couldn&apos;t cancel</span></div>
      <div className="dbody center" style={{ justifyContent: "center", gap: 10 }}>
        <div style={{ fontSize: 30 }}>⚠️</div>
        <div className="h">Something went wrong</div>
        <div className="sub" style={{ maxWidth: 210 }}>
          {is108 ? "We hit a temporary issue on our side. Your booking is unchanged and you haven't been charged." : "We couldn't reach the hotel just now. Your booking is unchanged and you haven't been charged."}
        </div>
        <div className="redbox" style={{ width: "100%" }}>
          <div className="tiny" style={{ color: "var(--red)" }}>
            {is108 ? "Mapped internally from Agoda error 108 (auth/IP). Ops alerted — never shown raw to users." : "Mapped from Agoda errorMessage{id, subId, message}. Retry reuses the same reference — safe, no double refund."}
          </div>
        </div>
      </div>
      <div className="dcta"><button className="btn blue" onClick={onRetry}>Try again</button><button className="btn ghost" onClick={onBack}>Contact support</button></div>
    </>
  );
}

function ScrAssisted({ s, onBack }: { s: Scenario; onBack: () => void }) {
  const post = s.timing === "postcheckin";
  return (
    <>
      <StatusBar />
      <div className="dbar amber"><span className="bk" onClick={onBack} style={{ cursor: "pointer" }}>←</span><span className="t">Assisted cancellation</span></div>
      <div className="dbody" style={{ gap: 12 }}>
        <div className="warnbox"><div className="h" style={{ fontSize: 13, color: "var(--amber)" }}>{post ? "Your stay has started" : "Free cancellation has ended"}</div>
          <div className="tiny">{post ? "After check-in, cancellation needs manual handling." : "It's within 24 hours of check-in — self-serve cancellation is closed."}</div></div>
        <div className="c"><div className="h" style={{ fontSize: 13 }}>We can still help</div>
          <div className="sub">We&apos;ll request an <b>assisted cancellation</b> or fee waiver with your booking details pre-filled ({s.hotel}, {s.dates}).</div></div>
        <div className="c flat"><div className="tiny">Common waiver reasons: medical emergency, natural disaster, duplicate booking.</div></div>
      </div>
      <div className="dcta"><button className="btn" style={{ background: "var(--amber)", borderColor: "var(--amber)", color: "#fff" }}>Request fee waiver</button><button className="btn ghost">Chat with us</button></div>
    </>
  );
}

function ScrTracker({ s, onDone }: { s: Scenario; onDone: () => void }) {
  const delayed = s.fault === "refundDelay";
  return (
    <>
      <StatusBar />
      <div className="dbar blue"><span className="t">Refund status</span></div>
      <div className="dbody" style={{ gap: 14 }}>
        <div className="c"><div className="row sb"><span className="h" style={{ fontSize: 13 }}>Refund</span><span className="h" style={{ fontSize: 13, color: "var(--green)" }}>{money(s.refund, s.currency)}</span></div><div className="tiny">to •••• 4291</div></div>
        <div className="timeline">
          <div className="tl done"><span className="dot" /><div><div className="lab">Initiated</div><div className="sub">Today · we sent it to Agoda</div></div></div>
          <div className="tl now"><span className="dot" /><div><div className="lab">Processing</div><div className="sub">With your bank / card network</div></div></div>
          <div className="tl"><span className="dot" /><div><div className="lab">Refunded</div><div className="sub">Expected in {s.etaDays}</div></div></div>
        </div>
        {delayed && <div className="redbox"><div className="tiny" style={{ color: "var(--red)" }}>Past the promised SLA — we&apos;ve escalated it for you.</div></div>}
      </div>
      <div className="dcta"><button className="btn ghost" onClick={onDone}>Done</button></div>
    </>
  );
}

/* mini cover phone in the hero */
function MiniCover() {
  return (
    <div className="device" style={{ width: 268 }}>
      <div className="ds" style={{ height: 540 }}>
        <StatusBar />
        <div className="dbar"><span className="bk">←</span><span className="t">Cancel booking</span></div>
        <div className="dbody">
          <div className="c" style={{ borderColor: "color-mix(in srgb,var(--green) 40%,transparent)" }}>
            <div className="row sb"><span className="h">You&apos;ll get back</span><span className="chip ok">Free</span></div>
            <div className="bignum" style={{ color: "var(--green)" }}>₹18,240</div>
            <div className="tiny">Full refund · 5–7 business days</div>
          </div>
          <div className="c flat"><div className="row"><div className="ring" style={{ "--p": 62 } as React.CSSProperties}><span>18h</span></div><div><div className="h" style={{ fontSize: 13 }}>Free until 26 Oct</div><div className="tiny">Hotel local time</div></div></div></div>
        </div>
        <div className="dcta"><button className="btn primary">Cancel &amp; get ₹18,240 back</button><button className="btn ghost">Keep booking</button></div>
      </div>
    </div>
  );
}
