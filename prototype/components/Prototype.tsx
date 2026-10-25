"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Device from "./Device";
import Guide from "./Guide";
import { SCENARIOS, SCENARIO_BY_ID, CORNER_CASES, CORNER_COUNT, type Scenario } from "@/lib/scenarios";
import { DOCS, type Step } from "@/lib/ui-data";
import { previewCancellation, confirmCancellation, type PreviewResult, type ConfirmResult } from "@/lib/api";

export default function Prototype() {
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [fidelity, setFidelity] = useState<"design" | "blueprint">("design");
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

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmResult | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const live = useRef(true);
  useEffect(() => () => { live.current = false; }, []);

  const resetFlow = useCallback((to: Step = "trips") => {
    setStep(to); setAuthed(false); setAuthFail(false); setReason(null);
    setShowReasons(false); setSubmitting(false); setPending(false);
    setReconnected(false); setStaleResolved(false);
    setPreview(null); setPreviewLoading(false); setConfirmResult(null);
  }, []);
  useEffect(() => { resetFlow("trips"); /* eslint-disable-next-line */ }, [sid]);

  const offlineNow = s.fault === "offline" && !reconnected;
  const staleNow = s.fault === "stale" && !staleResolved;

  const runPreview = useCallback(async () => {
    setPreviewLoading(true); setPreview(null);
    try {
      const res = await previewCancellation(sid, s.bookingId);
      if (live.current) setPreview(res);
    } finally {
      if (live.current) setPreviewLoading(false);
    }
  }, [sid, s.bookingId]);

  const startCancel = () => {
    if (s.timing === "within24h" || s.timing === "postcheckin") { setStep("assisted"); return; }
    setStep("preview");
    if (!offlineNow) runPreview();
  };
  const onReconnect = () => { setReconnected(true); runPreview(); };
  const onRefresh = () => { setStaleResolved(true); runPreview(); };
  const toConfirm = () => { setAuthed(false); setAuthFail(false); setSubmitting(false); setStep("confirm"); };

  const doConfirm = async () => {
    if (!authed || submitting) return;
    setSubmitting(true); setPending(false); setStep("processing");
    const ref = preview?.reference ?? s.reference;
    const idem = `voya-cxl-${s.bookingId}-${ref}`;
    const res = await confirmCancellation(sid, s.bookingId, ref, reason ?? 0, idem);
    if (!live.current) return;
    setConfirmResult(res);
    if (!res.ok) setStep("error");
    else { setPending(res.status === "PENDING"); setStep("done"); }
    setSubmitting(false);
  };

  const pickScenario = (id: string) => {
    setSid(id); setPickerOpen(false);
    setTimeout(() => document.getElementById("stage")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };

  const grouped = useMemo(() => {
    const g: Record<string, Scenario[]> = {};
    SCENARIOS.forEach((sc) => { (g[sc.category] ??= []).push(sc); });
    return g;
  }, []);

  return (
    <div className="app">
      {/* ---------------- HERO ---------------- */}
      <header className="hero">
        <div className="wrap">
          <span className="badge"><span className="b">V</span> Voya and Agoda · iOS and Android</span>
          <h1>Cancelling a hotel booking, <span className="bl">made simple</span>.</h1>
          <p className="lead">
            This is a working prototype of a self-serve cancellation flow for our Android and iOS
            hotel app, built on Agoda&apos;s booking APIs. You tap through the phone on the left, and the
            panel on the right tells you what to do next. Switch between iOS and Android, wireframe
            and design, and try {SCENARIOS.length} real situations and {CORNER_COUNT} tricky cases.
          </p>
          <p className="hand">You always see the exact refund before you confirm. No surprises.</p>
          <div className="chips">
            <span className="m lead-chip">PM101 · Masters&apos; Union</span>
            <span className="m">Om, Param, Shabareesh, Arushi, Manya</span>
            <span className="m">Really calls the API: /api/cancellation</span>
          </div>
        </div>
      </header>

      <main className="wrap">
        {/* ---------------- CONTROLS ---------------- */}
        <div className="controls">
          <div className="ctl">
            <span className="lbl">Device</span>
            <div className="seg">
              <button className={platform === "ios" ? "on" : ""} onClick={() => setPlatform("ios")}>&#63743; iOS</button>
              <button className={platform === "android" ? "on" : ""} onClick={() => setPlatform("android")}>🤖 Android</button>
            </div>
          </div>
          <div className="ctl">
            <span className="lbl">Fidelity</span>
            <div className="seg">
              <button className={fidelity === "design" ? "on" : ""} onClick={() => setFidelity("design")}>✦ Design</button>
              <button className={fidelity === "blueprint" ? "on" : ""} onClick={() => setFidelity("blueprint")}>✎ Wireframe</button>
            </div>
          </div>
          <div className="ctl">
            <span className="lbl">Flow</span>
            <div className="seg"><button onClick={() => resetFlow("trips")}>↺ Restart</button></div>
          </div>
          <div className="ctl" style={{ marginLeft: "auto" }}>
            <span className="lbl">Situation</span>
            <div className="seg"><button onClick={() => setPickerOpen(true)}>{s.emoji} {s.label} ▾</button></div>
          </div>
        </div>

        {/* ---------------- STAGE ---------------- */}
        <div className="stage" id="stage">
          <div className="phone-col">
            <Device
              platform={platform} fidelity={fidelity} step={step} s={s}
              preview={preview} previewLoading={previewLoading} confirmResult={confirmResult} pending={pending}
              authed={authed} authFail={authFail} reason={reason} showReasons={showReasons}
              submitting={submitting} offline={offlineNow} stale={staleNow}
              onOpen={() => setStep("details")}
              onBack={() => setStep(step === "preview" ? "details" : step === "confirm" ? "preview" : step === "details" ? "trips" : step === "assisted" ? "details" : step === "tracker" ? "done" : "trips")}
              onStartCancel={startCancel}
              onReconnect={onReconnect} onRefresh={onRefresh}
              onContinue={toConfirm}
              onToggleReasons={() => setShowReasons((v) => !v)}
              onPickReason={(c) => { setReason(c); setShowReasons(false); }}
              onAuth={() => { setAuthed(true); setAuthFail(false); }}
              onConfirm={doConfirm}
              onTrack={() => setStep("tracker")}
              onRebook={() => resetFlow("trips")}
              onRetry={() => { setSubmitting(false); setConfirmResult(null); setStep("confirm"); }}
            />
            <div className="devcap">{platform === "ios" ? "iPhone · iOS 18" : "Android 15 · Material 3"} · {fidelity === "design" ? "design" : "wireframe"}</div>
            <div className="devhint">Follow the <b>DO THIS</b> step on the right, or the 👆 hint on the phone.</div>
          </div>

          <Guide step={step} s={s} onOpenPicker={() => setPickerOpen(true)} />
        </div>

        {/* ---------------- DELIVERABLES ---------------- */}
        <div className="section-h"><h2>Deliverables</h2><span className="count">all docs</span>
          <span className="s" style={{ color: "var(--ink-2)" }}>everything the assignment asks for. Open any of them on GitHub.</span></div>
        <div className="docgrid">
          {DOCS.map((d) => (
            <a className="doc" key={d.path} href={d.href} target="_blank" rel="noreferrer">
              <div className="ic">{d.icon}</div>
              <div className="dt">{d.title}</div>
              <div className="dd">{d.desc}</div>
              <div className="path">{d.path}</div>
            </a>
          ))}
        </div>

        {/* ---------------- CORNER CASES ---------------- */}
        <div className="section-h"><h2>Corner cases</h2><span className="count">{CORNER_COUNT} handled</span>
          <span className="s" style={{ color: "var(--ink-2)" }}>tap <b style={{ color: "var(--brand)" }}>▶ demo</b> to load one into the phone</span></div>
        <div className="ccgroups">
          {CORNER_CASES.map((g) => (
            <div className="ccgroup" key={g.category}>
              <div className="gh"><span>{g.emoji}</span> {g.category} <span className="n">{g.items.length}</span></div>
              {g.items.map((c) => (
                <div className="cc" key={c.id}>
                  <div className="t">{c.title}{c.demo && <button className="demo" onClick={() => pickScenario(c.demo!)}>▶ demo</button>}</div>
                  <div className="trig">trigger · {c.trigger}</div>
                  <div className="hd">{c.handling}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="foot">
          <span>Voya × Agoda · PM101 Mid-Course · Om · Param · Shabareesh · Arushi · Manya</span>
          <span>Refund is always Agoda&apos;s number · Confirm is idempotent (reference + key)</span>
        </div>
      </main>

      {/* ---------------- SITUATION PICKER ---------------- */}
      {pickerOpen && (
        <div onClick={() => setPickerOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,27,45,.45)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--card)", borderRadius: 20, padding: 20, maxWidth: 680, width: "100%", maxHeight: "82vh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
            <div className="row sb" style={{ marginBottom: 6 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900 }}>Try a situation</h3>
              <button className="btn line sm" style={{ width: "auto" }} onClick={() => setPickerOpen(false)}>Close ✕</button>
            </div>
            <p className="s" style={{ marginBottom: 14 }}>Each one drives the whole flow differently. Pick one to load it into the phone.</p>
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div className="lbl" style={{ marginBottom: 8 }}>{cat}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
                  {list.map((sc) => (
                    <button key={sc.id} onClick={() => pickScenario(sc.id)}
                      style={{ textAlign: "left", border: `1px solid ${sc.id === sid ? "var(--brand)" : "var(--line)"}`, background: sc.id === sid ? "color-mix(in srgb,var(--brand) 8%,transparent)" : "var(--card)", borderRadius: 12, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 5 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span className="emoji" style={{ fontSize: 18, width: 22 }}>{sc.emoji}</span>
                        <span className="h2 ellipsis">{sc.label}</span>
                      </span>
                      <span className="xs clamp2">{sc.handling}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
