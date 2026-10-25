# Submission index: Voya hotel cancellation on Android

PM101 Mid-Course case, Masters' Union, October 2026. Team: Om Umrania, Param Parekh, Shabareesh Parlakota, Arushi Gupta, Manya Mahajan.

This folder holds the written material behind the submission deck. The deck itself is `presentation/final-submission.pdf` (13 pages). This page explains what the assignment asked for and points to where each part lives, so a reviewer can trace any claim to its source.

## The brief

Voya is an early-stage Android app that sells hotel rooms sourced from Agoda. It has no direct hotel contracts, so it books on the traveler's behalf through Agoda's Demand API. The case asks us to design the wireframes for a new use case: cancelling an existing booking, using Agoda's APIs. Reference pages are the Agoda Developer Portal, Getting Started and Search API.

## What the assignment grades, and where we cover it

| Required | Where it is | 
|---|---|
| Mobile wireframes for the cancellation flow | 16 low-fidelity Android screens A to P in `../wireframes/screens/`, shown on deck pages 5 to 10 |
| Up to 11 plus 2 pages | 13-page PDF: 11 core pages and a 2-page product note. At the cap, nothing cut for space |
| Workflow or flowchart for information architecture and logic plus information flow | IA navigation tree on deck page 3 (`../flows/information-architecture.png`, text in `../flows/information-architecture.md`); four-lane logic and information swimlane on page 4 (`../flows/cancellation-flow.png`, source `../flows/cancellation-flow.mmd`) |
| Each wireframe carries Design (UI/UX), Developer (API usage) and Business notes | All three notes per screen in `../wireframes/design-notes.md`, printed beside each wireframe on pages 5 to 10 |
| Product note on the overall flow, 1 to 2 pages | `product-note.md`, deck pages 12 and 13 |
| Assumptions clearly stated | `assumptions.md`, summarized on deck page 2, every assumption tagged |

## How to read the evidence tags

Every claim in the deck and in these docs is tagged so it can be traced:

- **[D]** documented by Agoda on the page cited.
- **[A]** a Voya assumption or design decision.
- **[V]** unclear or undocumented; to validate with Agoda before building.

We mark undocumented behavior [V] rather than state it as fact. That is deliberate: the case rewards clear assumptions, not invented API detail.

## The files in this folder

| File | What it is |
|---|---|
| `product-note.md` | The 1 to 2 page product note: problem, how the flow works, why the screens are in this order, exceptions, trade-offs, what to measure, what is still to confirm |
| `product-requirements.md` | Version 1 goal, functional requirements, non-requirements, measures, open items |
| `assumptions.md` | The 13 assumptions, each tagged [A], [V] or [D] |
| `api-integration.md` | How each screen uses the Demand API: the standard cancel sequence, fields Voya must not invent, cancelReason values, errors worth handling, the fee-waiver path |
| `edge-case-matrix.md` | 20 cases with trigger, system behavior, what the traveler sees, recovery and evidence. Ten of them appear on deck page 11 |
| `qa-register.md` | The checks run on the deck, the Agoda accuracy points, the fictional-data checks, and what is explicitly not verified |
| `change-log.md` | What changed from the earlier version to this rebuilt one, and why |
| `solutions/` | Documented fixes to past problems, such as the Vercel subdirectory deploy |

## The core flow, in one paragraph

The traveler opens My trips, which reads Voya's own booking table, and picks a booking. Before showing Cancel booking, the backend reads Booking Detail from Agoda to check the status and eligibility. Cancel booking calls Cancel Preview, which returns the reference, the policy text, what was paid and what would be refunded. Voya shows those figures and asks for a clear yes or no. Only then does it send Confirm, using the reference and refund amount from that preview. A successful Confirm is HTTP 200 with an empty body, so Voya reads Booking Detail again and shows Cancellation confirmed only when the status says cancelled. Timeouts, refund mismatches, ineligible bookings and the fee-waiver exception each have their own screen and recovery step.

## What is deliberately out of scope for version 1

Date changes, cancelling one room out of several, no-show disputes, and the payment system that returns money to the traveler. The last one matters: cancelling a booking and refunding the money are separate events, and Agoda does not document refund timing under Partner Fulfillment, so the app never promises a number of days.

## Still to confirm with Agoda

The cancellation cutoff (documented two ways), the fee-waiver reason values and status names (they differ between the guide and the Appendix), whether the booking is cancelled while a waiver is pending, how and when the traveler's refund settles, and the account permissions for Preview, Confirm and fee waiver. These are listed on deck page 11 and in `api-integration.md`.

## Rebuilding the deck

The deck is generated, not hand-edited. From `presentation/src/`, run `build.py`, then `render.py` for the PDF, then `export_screens.py` and `export_diagrams.py` for the wireframe and flow PNGs, in that order. The prototype in `../prototype/` runs the same flow against simulated Agoda responses; all data there is test data.
