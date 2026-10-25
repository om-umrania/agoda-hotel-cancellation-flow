# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Product-design project (Masters' Union, Product Management track): an end-to-end design of a **hotel booking cancellation experience** for an Android app built on **Agoda APIs**. Scope spans user flows, wireframes, information architecture, API integration, and product documentation.

## Current state

The repository is greenfield — it currently contains only `README.md` and an initial commit. There is **no application code, build system, test suite, or lint config yet**, so there are no build/test/run commands to document. As the project takes shape (deliverables, prototype code, or an Android implementation), update this file with:

- The actual build / test / lint / run commands once tooling is chosen.
- The high-level architecture (flow boundaries, API integration layer, screen/IA structure) once more than one file is involved.

Do not assume a stack or scaffold tooling without confirming the intended direction first — this is a product-design repo, and some deliverables may be documents or design artifacts rather than runnable code.

## Working notes

- Default branch is `main`. An additional branch `om-umrania/snakehead` exists on the remote.
- Any Agoda API work should treat credentials/keys as secrets — keep them out of commits and source.
