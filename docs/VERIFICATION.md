# LLMOps prototype verification — 2026-10-13

## Source and local changes

- Repository: `ilhoko-dreamlabs/kr-co-dreamlabs-workers-llmops-static`
- Base main / origin/main: `35023b785ba45717bac7457690a35cbc32605c2b` (clean at checkout).
- Candidate branch: `fix/dreamlabs-llmops-demo-completeness`.
- Preserve all nine existing views and synthetic data; add Gateway, Audit and read-only Settings.
- Repair model status filtering, skip-link routing, detail-dialog keyboard focus and pre-load render guard.
- Rename Normal display to Baseline to match the existing degraded-provider fixture.
- No real provider calls, credentials, operational records or new external assets.

## Local verification

- `node scripts/validate.mjs`: PASS, 12 required files, 12 routes, 22 synthetic records.
- `node --check site/assets/app.js`: PASS.
- `git diff --check`: PASS.
- Chromium via Playwright, HTTP localhost: all 12 routes at widths 1440, 768, 390, 320 px; one h1, active navigation, persistent demo banner, no document horizontal overflow.
- Routes: overview, gateway, models, workers, usage, requests, health, releases, security, audit, settings, architecture.
- Model search combined with status filters; request status/search and empty state; detail dialog Shift+Tab and Escape; skip link preserves current route; mobile menu closes on navigation; all three scenarios: PASS.
- Browser route checks observed no external network requests and no page JavaScript errors.
- There is no compilation step or separate lint command; publish artifact is `site/`.

## Public deployment evidence (before this candidate)

- GitHub Actions run `38389833970`: success on base commit. Jobs validate-input `115270612487`, build `115270653632`, deploy `115270714583`: success.
- HTTPS root and `/assets/app.js` at `llmops.workers.dreamlabs.co.kr`: HTTP 403, OAuth2 Proxy login page, Apache server header. TLS verification was enabled.
- DNS address observed by this worker: `121.141.19.98`; this observation alone does not establish the authoritative record type or the intended target.
- Default GitHub Pages URL also ultimately returns HTTP 403.
- Public hash routes share the blocked root HTTP document; client-side route rendering cannot be verified on the public host.
- The connected GitHub fetch tool does not support the Pages settings endpoint. Current Pages domain/HTTPS configuration has not been read back.
- A successful deployment job does not establish working public routing. No DNS, TLS, proxy or Pages settings were changed.

## Publication and rollback

This candidate is local until its commit/push are explicitly approved. Publication remains a separate manual Pages workflow dispatch for an exact approved SHA. Do not claim the candidate is published based on the earlier successful run.

After authorized publication, verify root, CSS, JavaScript and fixture return 200; check all 12 hash routes on desktop/mobile, reload, search, details, and zero provider requests. Confirm the public asset contents match the approved source.

If a published candidate must be rolled back, request approval to dispatch the existing Pages workflow for base commit `35023b785ba45717bac7457690a35cbc32605c2b`. Recheck public assets afterward. This restores the artifact only; it cannot repair the currently observed 403 routing/authentication issue.

Before proposing any DNS/TLS/Pages settings mutation, obtain readback of the exact existing record/settings and authority to manage that target, then request canonical Approval with action, risk and restoration values. No GitLab infrastructure MR or CODEOWNER work is part of this prototype task.

## Procedures consulted

Inbound `rra-request-handler`; DreamLabs Skill Registry README, REGISTRY and WORKER_USAGE_GUIDE from the available local checkout. Registry freshness could not be verified through the configured connector (404). Approval procedure applies only to concrete protected publication actions.
