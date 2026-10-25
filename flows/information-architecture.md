# Information Architecture

Where cancellation lives in the Voya app, and how a user reaches it.

## App navigation map
```
Voya (Android)
└── Bottom nav
    ├── Home
    ├── Search
    ├── Trips ◀── primary entry to cancellation
    │   ├── Upcoming
    │   │   └── Booking Details
    │   │       ├── Modify            (out of scope v1)
    │   │       ├── Contact / Help
    │   │       └── Cancel booking ─────────────┐
    │   ├── Completed                           │
    │   └── Cancelled                           │
    └── Account                                 │
        └── Help Center                         │
            └── "Cancel a booking" ─────────────┤  (secondary entry)
                                                ▼
                                   ╔═══════════════════════════╗
                                   ║   CANCELLATION FLOW        ║
                                   ╠═══════════════════════════╣
                                   ║ 1. Refund Preview          ║  ← Cancellation Preview API
                                   ║ 2. Reason (optional)       ║
                                   ║ 3. Confirm + re-auth       ║  ← Cancellation Confirm API
                                   ║ 4. Processing (~120s)      ║
                                   ║ 5. Confirmed + refund ETA  ║
                                   ╚═══════════════════════════╝
                                                │
                     ┌──────────────────────────┼───────────────────────────┐
                     ▼                           ▼                           ▼
             Refund status tracker      Error / retry state        Assisted / fee-waiver
             (Account › Trips ›         (network, API, auth)        (past window, disaster)
              Cancelled)
```

## Entry points
1. **Trips › Upcoming › Booking Details › Cancel booking**, the main path.
2. **Account › Help Center › "Cancel a booking"**, support-led path.
3. **Deep link** from the confirmation email / push → Booking Details.

## Content hierarchy on the hero (Refund Preview) screen
Priority order the eye should travel:
1. **Refund amount** (what you get back) + the math (Paid − Fee = Refund)
2. **Deadline** / policy in plain language (countdown if inside the free window)
3. **What's being cancelled** (hotel, dates, guests)
4. Optional **reason** selector
5. Primary **CTA** whose label states the outcome ("Cancel & get ₹X back" / "Cancel, no refund")

## Information the flow moves
- **In:** booking + policy (Retrieve), refund quote (Preview).
- **User-supplied:** confirmation intent, re-auth, optional reason.
- **Out:** cancel command (Confirm), then refund status / receipt back to the user.

See the logic/information flowchart: [`cancellation-flow.mmd`](./cancellation-flow.mmd).
