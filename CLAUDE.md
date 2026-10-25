# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository.

## Project

PM101 Mid-Course case at Masters' Union: Android hotel-cancellation flow for "Voya", built on Agoda's Demand API. Deliverables are a 13-page PDF (11 core pages and a 2-page product note), wireframe PNGs, flow diagrams, supporting docs, and an interactive prototype that uses simulated Agoda responses.

## Layout

- `presentation/src/` generates the deck: `build.py` writes `presentation/deck.html`, `render.py` prints `presentation/final-submission.pdf` with Playwright, `export_screens.py` and `export_diagrams.py` write `wireframes/screens/` and `flows/*.png`. Screens and per-wireframe notes live in `screens.py`; diagrams in `diagrams.py`; the product note in `note.py`. Run in that order after any change.
- `prototype/` is a Next.js app (`npm run dev`, `npm run build`, `npx eslint .`). Simulated Agoda logic is in `lib/simulated-agoda.ts`; fixtures in `lib/fixtures.ts`.
- `docs/`, `flows/`, `wireframes/design-notes.md`, `references/` hold the written material. `docs/solutions/` holds documented solutions to past problems, such as the Vercel subdirectory deploy.

## Rules that matter

- Evidence tags: [D] documented by Agoda, [A] Voya assumption, [V] needs validation. Do not state undocumented Agoda behavior as fact.
- Standard Confirm returns HTTP 200 with an empty body. Do not add `status`, `PENDING`, `cancellationId`, refund ETAs, webhooks or an `Idempotency-Key` header.
- Keep Agoda site IDs, API keys and any real guest data out of commits and source.
- Example dates must stay consistent: demo Sun 25 Oct 2026; stay Thu 10 Dec to Sat 12 Dec 2026; penalty cutoff Mon 7 Dec 2026, 6:00 PM hotel time.
- Default branch is `main`. Vercel deploys from `prototype/` (see `docs/solutions/`).
