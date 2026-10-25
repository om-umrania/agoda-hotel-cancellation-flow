"use client";

import type { CSSProperties } from "react";
import type { Scenario } from "@/lib/scenarios";
import { REASONS } from "@/lib/scenarios";
import type { PreviewResult, ConfirmResult } from "@/lib/api";
import { COACH, type Step } from "@/lib/ui-data";

export const money = (n: number, c = "INR") =>
  c === "INR" ? "₹" + Math.round(n).toLocaleString("en-IN") : Math.round(n).toLocaleString();

type Tone = "brand" | "green" | "red" | "amber" | "grey";
const toneColor: Record<Tone, string> = {
  brand: "var(--brand)", green: "var(--green)", red: "var(--red)", amber: "var(--amber)", grey: "#3b465c",
};

export type DeviceProps = {
  platform: "ios" | "android";
  fidelity: "design" | "blueprint";
  step: Step;
  s: Scenario;
  preview: PreviewResult | null;
  previewLoading: boolean;
  confirmResult: ConfirmResult | null;
  pending: boolean;
  authed: boolean;
  authFail: boolean;
  reason: number | null;
  showReasons: boolean;
  submitting: boolean;
  offline: boolean;
  stale: boolean;
  onOpen: () => void;
  onBack: () => void;
  onStartCancel: () => void;
  onReconnect: () => void;
  onRefresh: () => void;
  onContinue: () => void;
  onToggleReasons: () => void;
  onPickReason: (c: number) => void;
  onAuth: () => void;
  onConfirm: () => void;
  onTrack: () => void;
  onRebook: () => void;
  onRetry: () => void;
};

function policyChip(s: Scenario) {
  if (s.policy === "nonref") return { cls: "bad", txt: "Non-refundable" };
  if (s.policy === "partial" || s.policy === "multitier") return { cls: "warn", txt: "Partial refund" };
  if (s.policy === "payathotel") return { cls: "brand", txt: "Pay at hotel" };
  return { cls: "ok", txt: "Free cancellation" };
}

export default function Device(p: DeviceProps) {
  const { platform, fidelity, step, s } = p;
  const refund = p.preview?.refund ?? s.refund;
  const paid = p.preview?.paid ?? s.paid;
  const fee = Math.max(0, paid - refund);
  const coach = COACH[step];

  function Chrome({ title, back, tone = "brand" }: { title: string; back?: boolean; tone?: Tone }) {
    const navStyle = platform === "android" ? { background: toneColor[tone] } : undefined;
    return (
      <>
        <span className="island" />
        <div className="statusbar"><span>9:41</span><span className="r">5G&nbsp;&nbsp;▂▄▆&nbsp;&nbsp;100%</span></div>
        <div className="nav" style={navStyle}>
          {back && (
            <button className="back" onClick={p.onBack} aria-label="Back">
              {platform === "ios" ? "‹ Back" : "←"}
            </button>
          )}
          <div className="title ellipsis">{title}</div>
        </div>
      </>
    );
  }

  const body = (() => {
    switch (step) {
      /* ---------------- TRIPS ---------------- */
      case "trips": {
        const pc = policyChip(s);
        return (
          <>
            <Chrome title="My trips" />
            <div className="body">
              <div className="tabs"><div className="tab on">Upcoming</div><div className="tab">Completed</div><div className="tab">Cancelled</div></div>
              <button className="card" style={{ textAlign: "left" }} onClick={p.onOpen}>
                <div className="row top">
                  <div className="thumb" style={{ width: 58, height: 58 }}>🏨</div>
                  <div className="col grow">
                    <div className="h2 ellipsis">{s.hotel}</div>
                    <div className="s ellipsis">{s.dates} · {s.nights}N · {s.guests} guests · {s.city}</div>
                    <div className="chiprow"><span className={`chip ${pc.cls}`}>{pc.txt}</span><span className="chip brand">Confirmed</span></div>
                  </div>
                </div>
              </button>
              <div className="card" style={{ opacity: 0.6 }}>
                <div className="row top">
                  <div className="thumb" style={{ width: 58, height: 58 }}>🏨</div>
                  <div className="col grow">
                    <div className="h2 ellipsis">Courtyard Marriott</div>
                    <div className="s ellipsis">22–24 Dec · 2N · 2 guests · Agra</div>
                    <div className="chiprow"><span className="chip ok">Free till 20 Dec</span><span className="chip brand">Confirmed</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="botnav">
              {[["⌂", "Home", false], ["⌕", "Search", false], ["✈", "Trips", true], ["◍", "Account", false]].map(([ic, l, on]) => (
                <div key={l as string} className={`n ${on ? "on" : ""}`}><span className="ic">{ic as string}</span>{l as string}</div>
              ))}
            </div>
          </>
        );
      }

      /* ---------------- DETAILS ---------------- */
      case "details": {
        const inWindow = s.timing === "free";
        const pc = policyChip(s);
        return (
          <>
            <Chrome title="Booking details" back />
            <div className="body">
              <div className="thumb" style={{ height: 120, width: "100%" }}>🏨</div>
              <div className="card"><div className="h1 ellipsis">{s.hotel}</div><div className="s ellipsis">{s.city} · ★ 4.8 · Deluxe Room</div></div>
              <div className="card">
                <div className="row sb" style={{ gap: 8 }}>
                  <div className="col"><div className="xs">Check-in</div><div className="h2">{(s.dates.split("–")[0] || s.dates).trim()}</div></div>
                  <div className="col" style={{ alignItems: "center" }}><div className="xs">Nights</div><div className="h2">{s.nights}</div></div>
                  <div className="col" style={{ alignItems: "flex-end" }}><div className="xs">{paid > 0 ? "Paid" : "To pay"}</div><div className="h2 num">{money(paid, s.currency)}</div></div>
                </div>
              </div>
              <div className={inWindow ? "okbox" : "card"}>
                <div className="row">
                  {inWindow
                    ? <div className="ring" style={{ "--p": s.ringPct } as CSSProperties}><span>{s.countdown.split(" ")[0]}</span></div>
                    : <span style={{ fontSize: 22 }}>{s.policy === "nonref" ? "⛔" : "📋"}</span>}
                  <div className="col grow">
                    <div className="h2" style={{ color: inWindow ? "var(--green)" : "var(--ink)" }}>{pc.txt}</div>
                    <div className="xs ellipsis">{s.deadline}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bottom">
              <div className="row" style={{ gap: 8 }}>
                <button className="btn line sm" style={{ flex: 1, opacity: 0.5 }} disabled>Modify</button>
                <button className="btn line sm" style={{ flex: 1 }}>Contact</button>
              </div>
              <button className="btn dangerline" onClick={p.onStartCancel}>Cancel booking</button>
            </div>
          </>
        );
      }

      /* ---------------- PREVIEW ---------------- */
      case "preview": {
        if (p.offline) {
          return (
            <>
              <Chrome title="Cancel booking" back />
              <div className="body mid">
                <div style={{ fontSize: 34 }}>📴</div>
                <div className="h1" style={{ marginTop: 10 }}>You&apos;re offline</div>
                <div className="s" style={{ maxWidth: 230, marginTop: 6 }}>We need a connection to fetch your exact refund from Agoda. We won&apos;t guess the number.</div>
              </div>
              <div className="bottom"><button className="btn brand" onClick={p.onReconnect}>Retry connection</button></div>
            </>
          );
        }
        const pc = policyChip(s);
        const refundColor = refund > 0 ? "var(--green)" : "var(--red)";
        const ctaLabel = refund > 0 ? `Cancel & get ${money(refund, s.currency)} back` : "Cancel — no refund";
        return (
          <>
            <Chrome title="Cancel booking" back />
            <div className="body">
              {p.previewLoading ? (
                <>
                  <div className="card"><div className="sk" style={{ height: 16, width: "55%" }} /><div className="sk" style={{ height: 34, width: "60%" }} /></div>
                  <div className="card"><div className="sk" style={{ height: 14 }} /><div className="sk" style={{ height: 14, width: "80%" }} /><div className="sk" style={{ height: 14, width: "40%" }} /></div>
                  <div className="xs" style={{ textAlign: "center" }}>Fetching your refund from Agoda…</div>
                </>
              ) : (
                <>
                  {p.stale && (
                    <div className="warnbox">
                      <div className="h2" style={{ color: "var(--amber)" }}>⏳ Quote expired</div>
                      <div className="xs">Prices & policy can change. Refresh to see your current refund.</div>
                      <button className="btn line sm" onClick={p.onRefresh}>Refresh quote</button>
                    </div>
                  )}
                  <div className="card" style={{ borderTop: `3px solid ${refundColor}` }}>
                    <div className="row sb"><span className="h2">You&apos;ll get back</span><span className={`chip ${pc.cls}`}>{pc.txt}</span></div>
                    <div className="big" style={{ color: refundColor }}>{money(refund, s.currency)}</div>
                    {s.policy === "payathotel" && <div className="xs">Nothing was charged — we&apos;ll just release the room.</div>}
                  </div>
                  {paid > 0 && (
                    <div className="money">
                      <div className="r"><span>Amount paid</span><span>{money(paid, s.currency)}</span></div>
                      <div className="r"><span>Cancellation fee</span><span>− {money(fee, s.currency)}</span></div>
                      <div className="r tot"><span>Refund</span><b style={{ color: refundColor }}>{money(refund, s.currency)}</b></div>
                    </div>
                  )}
                  {s.policy === "multitier" && <div className="xs">You&apos;re in the <b>50% tier</b> now — non-refundable after 30 Nov.</div>}
                  {refund > 0 && (
                    <div className="card tint">
                      <div className="h2">Back to your card · {s.etaDays}</div>
                      {s.timing === "free" && <div className="row"><div className="ring" style={{ "--p": s.ringPct } as CSSProperties}><span>{s.countdown.split(" ")[0]}</span></div><div className="s ellipsis grow">{s.deadline}</div></div>}
                    </div>
                  )}
                  {refund === 0 && s.policy === "nonref" && <button className="field" style={{ justifyContent: "center", color: "var(--brand)" }}>Get travel credit instead →</button>}
                </>
              )}
            </div>
            <div className="bottom">
              <button className={`btn ${refund > 0 ? "pri" : "danger"}`} disabled={p.stale || p.previewLoading} onClick={p.onContinue}>{ctaLabel}</button>
              <button className="btn ghost" onClick={p.onBack}>Keep booking</button>
            </div>
          </>
        );
      }

      /* ---------------- CONFIRM ---------------- */
      case "confirm": {
        const reasonLabel = p.reason != null ? REASONS.find((r) => r.code === p.reason)?.label : null;
        return (
          <>
            <Chrome title="Confirm cancellation" back />
            <div className="body">
              <div className="card">
                <div className="h2 ellipsis">{s.hotel} · {s.dates}</div>
                <div className="row sb"><span className="s">You&apos;ll be refunded</span><span className="h2 num" style={{ color: refund > 0 ? "var(--green)" : "var(--red)" }}>{money(refund, s.currency)}</span></div>
              </div>
              <button className="field" onClick={p.onToggleReasons}>
                <span className={reasonLabel ? "" : "ph"}>{reasonLabel ? `Reason · ${reasonLabel}` : "＋ Add a reason (optional)"}</span><span>▾</span>
              </button>
              {p.showReasons && (
                <div className="card" style={{ gap: 0, padding: "4px 12px" }}>
                  {REASONS.map((r) => (
                    <button key={r.code} className="listrow" style={{ width: "100%", textAlign: "left" }} onClick={() => p.onPickReason(r.code)}>
                      <span className="t grow">{r.label}</span><span className="xs">code {r.code}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="warnbox"><div className="row"><span style={{ fontSize: 17 }}>⚠️</span><div className="h2" style={{ color: "var(--amber)" }}>This can&apos;t be undone.</div></div><div className="xs">The room is released to the hotel immediately.</div></div>
              <div className="card" style={{ alignItems: "center", textAlign: "center" }}>
                <button className={`bio ${p.authed ? "ok" : p.authFail ? "fail" : ""}`} onClick={p.onAuth}>{p.authed ? "✓" : platform === "ios" ? "😊" : "☝"}</button>
                <div className="h2">{p.authed ? "Identity confirmed" : platform === "ios" ? "Confirm with Face ID" : "Confirm with fingerprint"}</div>
                <div className="xs">{p.authed ? "Re-authenticated" : "Re-authenticate to cancel"}</div>
              </div>
            </div>
            <div className="bottom">
              <button className="btn danger" disabled={!p.authed || p.submitting} onClick={p.onConfirm}>{p.submitting ? "Cancelling…" : "Confirm cancellation"}</button>
              <button className="btn ghost" onClick={p.onBack}>Go back</button>
            </div>
          </>
        );
      }

      /* ---------------- PROCESSING ---------------- */
      case "processing":
        return (
          <>
            <Chrome title="Cancelling…" tone="grey" />
            <div className="body mid">
              <div className="spin" />
              <div className="h1" style={{ marginTop: 10 }}>Confirming with the hotel</div>
              <div className="s" style={{ maxWidth: 220, marginTop: 6 }}>{s.fault === "timeout" ? "Agoda is taking longer than usual — we won't spin forever. We'll reconcile and update you." : "This can take up to 2 minutes. You can leave — we'll notify you."}</div>
              <div className="apibar" style={{ marginTop: 14 }}><span className="live"><span className="d" />POST</span> <span className="u">/cancellation/confirm</span></div>
            </div>
            <div className="bottom"><button className="btn ghost">Notify me &amp; leave</button></div>
          </>
        );

      /* ---------------- DONE ---------------- */
      case "done": {
        const rid = p.confirmResult?.cancellationId ?? `VOYA-CXL-${s.reference}`;
        return (
          <>
            <Chrome title="Cancelled" tone="green" />
            <div className="body mid">
              <div className="check">✓</div>
              <div className="h1" style={{ marginTop: 8 }}>Booking cancelled</div>
              <div className="s">Ref · <b>{rid}</b></div>
              {refund > 0 ? (
                <div className="okbox" style={{ width: "100%", marginTop: 10, textAlign: "left" }}>
                  <div className="row sb"><span className="h2">Refund</span><span className="h2 num" style={{ color: "var(--green)" }}>{money(refund, s.currency)}</span></div>
                  <div className="xs">{p.pending ? "Refund is being confirmed — we'll update you shortly." : `To your card · arrives in ${s.etaDays}`}</div>
                </div>
              ) : (
                <div className="card tint" style={{ width: "100%", marginTop: 10 }}><div className="xs">{s.policy === "payathotel" ? "Nothing was charged — no refund needed." : "This rate was non-refundable, so there's no refund."}</div></div>
              )}
              {p.pending && <span className="chip warn" style={{ marginTop: 8 }}>Refund pending</span>}
              <div className="xs" style={{ marginTop: 8 }}>📧 Receipt sent to your email</div>
            </div>
            <div className="bottom">
              {refund > 0 && <button className="btn brand" onClick={p.onTrack}>View refund status</button>}
              <button className="btn ghost" onClick={p.onRebook}>Find another stay</button>
            </div>
          </>
        );
      }

      /* ---------------- ERROR ---------------- */
      case "error": {
        const err = p.confirmResult?.error;
        const is108 = s.fault === "auth108";
        return (
          <>
            <Chrome title="Couldn't cancel" tone="red" />
            <div className="body mid">
              <div className="cross">!</div>
              <div className="h1" style={{ marginTop: 8 }}>Something went wrong</div>
              <div className="s" style={{ maxWidth: 230, marginTop: 6 }}>{is108 ? "We hit a temporary issue on our side. Your booking is unchanged and you haven't been charged." : "We couldn't reach the hotel just now. Your booking is unchanged and you haven't been charged."}</div>
              <div className="redbox" style={{ width: "100%", marginTop: 12, textAlign: "left" }}>
                <div className="xs" style={{ color: "var(--red)" }}>
                  {err ? `Agoda errorMessage · id ${err.id}${err.subId ? "/" + err.subId : ""} — "${err.message}"` : "Mapped from Agoda errorMessage."} {" "}
                  Mapped to friendly copy; retry reuses the same reference (no double refund).
                </div>
              </div>
            </div>
            <div className="bottom"><button className="btn brand" onClick={p.onRetry}>Try again</button><button className="btn ghost">Contact support</button></div>
          </>
        );
      }

      /* ---------------- ASSISTED ---------------- */
      case "assisted": {
        const post = s.timing === "postcheckin";
        return (
          <>
            <Chrome title="Assisted cancellation" back tone="amber" />
            <div className="body">
              <div className="warnbox"><div className="h2" style={{ color: "var(--amber)" }}>{post ? "Your stay has started" : "Free cancellation has ended"}</div><div className="xs">{post ? "After check-in, cancellation needs manual handling." : "It's within 24 hours of check-in — self-serve cancellation is closed."}</div></div>
              <div className="card"><div className="h2">We can still help</div><div className="s">We&apos;ll request an <b>assisted cancellation</b> or fee waiver with your booking details pre-filled ({s.hotel}).</div></div>
              <div className="card tint"><div className="xs">Common waiver reasons: medical emergency, natural disaster, duplicate booking.</div></div>
            </div>
            <div className="bottom"><button className="btn" style={{ background: "var(--amber)", color: "#fff", borderColor: "var(--amber)" }}>Request fee waiver</button><button className="btn ghost">Chat with us</button></div>
          </>
        );
      }

      /* ---------------- TRACKER ---------------- */
      case "tracker": {
        const delayed = s.fault === "refundDelay";
        return (
          <>
            <Chrome title="Refund status" back />
            <div className="body">
              <div className="card"><div className="row sb"><span className="h2">Refund</span><span className="h2 num" style={{ color: "var(--green)" }}>{money(refund, s.currency)}</span></div><div className="xs">to •••• 4291</div></div>
              <div className="card">
                <div className="timeline">
                  <div className="tl done"><span className="pt" /><div className="col"><div className="h2">Initiated</div><div className="xs">Today · sent to Agoda</div></div></div>
                  <div className="tl now"><span className="pt" /><div className="col"><div className="h2">Processing</div><div className="xs">With your bank / card network</div></div></div>
                  <div className="tl"><span className="pt" /><div className="col"><div className="h2">Refunded</div><div className="xs">Expected in {s.etaDays}</div></div></div>
                </div>
              </div>
              {delayed && <div className="redbox"><div className="xs" style={{ color: "var(--red)" }}>Past the promised SLA — we&apos;ve escalated it for you.</div></div>}
            </div>
            <div className="bottom"><button className="btn ghost" onClick={p.onRebook}>Done</button></div>
          </>
        );
      }
      default:
        return null;
    }
  })();

  const needsHome = platform === "ios" && step !== "trips";

  return (
    <div className="device" data-plat={platform} data-fid={fidelity}>
      <div className="frame">
        <div className="screen">
          {fidelity === "blueprint" && <span className="bp-tag">Blueprint</span>}
          <div className="fx" key={step + s.id} style={{ display: "contents" }}>{body}</div>
          {coach && (
            <div className="coach b-cta">
              <span className="tap">👆</span>
              <span>{coach.pos === "up" ? "↑ " : ""}{coach.text}</span>
            </div>
          )}
          {needsHome && <div className="homeind" />}
        </div>
      </div>
    </div>
  );
}
