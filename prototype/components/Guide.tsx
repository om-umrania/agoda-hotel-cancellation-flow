"use client";

import type { Scenario } from "@/lib/scenarios";
import { RAIL, RAIL_ORDER, STEP_TO_RAIL, NOTES, type Step } from "@/lib/ui-data";

export default function Guide({ step, s, onOpenPicker }: { step: Step; s: Scenario; onOpenPicker: () => void }) {
  const n = NOTES[step];
  const currentRail = STEP_TO_RAIL[step];
  const curIdx = RAIL_ORDER.indexOf(currentRail);

  return (
    <div className="guide">
      <div className="guide-head">
        <div className="ico">🧭</div>
        <div className="col">
          <span className="nowlbl">You&apos;re here · step {curIdx + 1} of {RAIL.length}</span>
          <h3>{n.title}</h3>
        </div>
      </div>

      {/* current situation + switch */}
      <div className="guide-sit">
        <span className="big-emoji">{s.emoji}</span>
        <div className="col">
          <span className="name">{s.label}</span>
          <span className="desc">{s.handling}</span>
        </div>
        <button className="btn line sm" style={{ width: "auto", whiteSpace: "nowrap" }} onClick={onOpenPicker}>Try another situation ▾</button>
      </div>

      {/* visual step rail */}
      <div className="rail">
        {RAIL.map((r, i) => {
          const state = i < curIdx ? "done" : i === curIdx ? "on" : "";
          return (
            <div key={r.id} className={`railstep ${state}`}>
              <div className="ic">{state === "done" ? "✓" : r.icon}</div>
              <div className="col grow">
                <div className="st-t">{r.title}{state === "on" && <span className="nowtag">DO THIS</span>}</div>
                <div className="st-s">{r.action}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* live API + 3-lens notes */}
      <div className="apibar"><span className="live"><span className="d" />Agoda API</span> <span className="u">{n.api}</span></div>
      <div className="lenses">
        <div className="lens design"><h4>🎨 Design</h4><p>{n.design}</p></div>
        <div className="lens dev"><h4>⚙️ Developer</h4><p>{n.dev}</p></div>
        <div className="lens biz"><h4>📈 Business</h4><p>{n.biz}</p></div>
      </div>
    </div>
  );
}
