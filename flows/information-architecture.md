# Information architecture

The navigation tree is drawn on page 3 of the submission deck and exported as `information-architecture.png`. This file gives the same structure in text.

```
Voya Android app
├── Search and hotel details (content and prices from Agoda feed)
├── My trips
│   ├── Upcoming
│   │   └── Booking details (A, B)
│   │       └── [system check: status, eligibility, hotel-local date]
│   │           ├── eligible: Cancel booking
│   │           │   └── Review refund, from Cancel Preview (C to F)
│   │           │       ├── Reason and final review (G)  ->  Sending (H)
│   │           │       │       ├── Cancellation confirmed (I)
│   │           │       │       ├── Outcome unknown (J)  -> recheck Booking Detail -> Confirmed or Try again
│   │           │       │       └── Could not cancel (P)
│   │           │       └── [exception, only if isFeeWaiverAllowed and permitted]
│   │           │           Request exception (K) -> Pending (L) -> Accepted or declined (M)
│   │           ├── already cancelled -> Cancelled booking details (O)
│   │           └── ineligible or too close to check-in -> Cannot cancel in app (N) -> Contact support
│   ├── Past (no cancel)
│   └── Cancelled
│       └── Cancelled booking details (O)
└── Account and help
    └── Help and Contact support
```

Screens are lettered A to P. System checks have no screen. My trips reads from Voya's own booking table; the app never calls Agoda directly.
