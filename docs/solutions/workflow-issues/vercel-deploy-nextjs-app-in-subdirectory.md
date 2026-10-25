---
title: "Deploy the app (in prototype/) to Vercel by pushing to GitHub, not the CLI from the subdir"
module: Vercel deployment
date: 2026-10-25
problem_type: workflow_issue
component: infrastructure
severity: medium
applies_when:
  - "deploying or redeploying this repo's app to Vercel"
  - "the Vercel project is GitHub-connected and the app lives in prototype/, not at the repo root"
  - "a deploy fails with 'Root Directory prototype does not exist', or a GitHub build fails because there is no package.json at the repo root"
tags:
  - vercel
  - nextjs
  - deployment
  - subdirectory-root
  - github-integration
---

# Deploying this repo to Vercel

## Context

The Next.js app lives in `prototype/` (see `prototype/package.json`; there is no
`package.json` and no `vercel.json` at the repo root). The Vercel project
`agoda-cancellation-flow` (team `om-umranias-projects`) is connected to the GitHub repo
`om-umrania/agoda-hotel-cancellation-flow`.

Because the app is in a subdirectory, two different "root" settings are in play and they
are easy to confuse, which cost two failed deploys before it was sorted out.

## Guidance

**To deploy, push to GitHub. Do not run the Vercel CLI from inside `prototype/`.**

```bash
git push origin main      # Vercel auto-builds using Root Directory = prototype. This works.
```

The Vercel project's **Root Directory** is set to `prototype`. With that setting:

- `git push origin main` triggers a GitHub-sourced build that runs inside `prototype/`.
  This is the supported deploy path and it succeeds.
- `cd prototype && vercel --prod` **fails** with
  `Error: The specified Root Directory "prototype" does not exist.`
  The CLI takes your current directory as the deploy source and then *also* applies the
  project's Root Directory on top, so it looks for a `prototype` folder nested inside the
  `prototype` folder, which does not exist.

If you ever must deploy from the CLI instead of git, run it from the **repo root**
(`vercel --prod` from the top level, so Root Directory `prototype` resolves correctly), or
temporarily clear the Root Directory. Pushing to GitHub is simpler and is the intended flow.

## Why this matters

- Deploys happen often, so the wrong instinct (`vercel --prod` from the app folder) gets
  retried repeatedly, and the error message does not explain the subdirectory interaction.
- None of this is visible in the code. `next.config.ts` has
  `turbopack: { root: import.meta.dirname }` (`next.config.ts:8`), but that is the
  **Turbopack lockfile root**, a completely separate thing from Vercel's **Root Directory**.
  Reading the repo would not tell the next person how to deploy, or why the CLI errors.

## When to apply

Any time you deploy or redeploy this app, or wire up a new Vercel project for a Next.js app
that sits in a subdirectory of its repo.

## Examples

**Leaving Root Directory at the default breaks GitHub deploys.** `vercel link` run from
inside `prototype/` connects the GitHub repo but leaves Root Directory at `.` (the repo
root). GitHub-triggered builds then fail because there is no `package.json` at the repo
root. The fix is to set Root Directory to `prototype`.

**Setting Root Directory (the MCP needed team re-auth, so the CLI's API passthrough was
used):**

```bash
# IDs come from prototype/.vercel/project.json
printf '{"rootDirectory":"prototype"}' > body.json
vercel api "/v9/projects/prj_K6tCbNNO8KBiYHWTNFMhgWmq88Zn?teamId=team_2CGw9YNSlIkyAuyJWr9oweAv" \
  --method PATCH --input body.json
# verify:
vercel project inspect agoda-cancellation-flow   # Root Directory -> prototype
```

**Confirming a push deployed:** `vercel ls agoda-cancellation-flow` shows the git-sourced
build as `Ready`; the production alias is `https://agoda-cancellation-flow.vercel.app`.
Health check after a deploy:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://agoda-cancellation-flow.vercel.app
curl -s -X POST https://agoda-cancellation-flow.vercel.app/api/cancellation/preview \
  -H "Content-Type: application/json" -d '{"scenarioId":"free","bookingId":889001234}'
```
