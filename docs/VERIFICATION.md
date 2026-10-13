# LLMOps prototype verification — provider catalog

## Scope

- Repository: `ilhoko-dreamlabs/kr-co-dreamlabs-workers-llmops-static`
- Candidate branch: `feat/real-provider-catalog`
- Base `main`: `002af7f0571bbdbfdaf39e07afa0a32327c96b69`
- Replace three anonymized provider samples with six named demo catalog entries:
  Anthropic/Claude, OpenAI/GPT, Google/Gemini, DeepSeek, Moonshot AI/Kimi and Zhipu AI/GLM.
- Bundle the matching SVG marks locally. No runtime CDN, provider call, credential or operational record is added.
- Preserve the persistent `DEMO · NON-PRODUCTION` boundary and state that names, marks, health, context and cost values do not prove live connectivity.

## Local verification

- `node scripts/validate.mjs`: PASS — 19 required files, 12 routes, 25 synthetic records.
- `node --check site/assets/app.js`: PASS.
- `git diff --check`: PASS.
- Local HTTP root and representative icon asset: HTTP 200.
- Browser desktop catalog: six provider marks loaded, six model rows rendered, one `h1`, no document-level horizontal overflow.
- Browser mobile catalog at 390 px target: menu breakpoint active, table remains locally scrollable, no document-level horizontal overflow.
- Search for `Kimi`: one matching row.
- GLM detail drawer: Zhipu AI / GLM identity and synthetic-record notice present.
- Browser console: no warning or error entries.
- Runtime references: local CSS, JavaScript and six local SVG files only.

## Data integrity

- Model requests remain equal to the summary total: 1,842.
- Model Demo Credits remain equal to the summary total: 184.2.
- Worker and daily request totals remain equal to the same summary.
- All demo records retain the `demo-` identifier prefix.
- `meta.connected` remains `false`; no provider endpoint or credential is present.

## Failed attempt and recovery

The first validation pass treated numeric SVG path data as a private IPv4 address. The validator was corrected so SVG files still receive the external-reference scan, while credential/private-network patterns remain scoped to files where those strings can be meaningful. Validation then passed.

The browser performance-entry API was unavailable in the preview sandbox. Local-only runtime references were instead verified from rendered `img`, `script` and `link` elements, together with the static no-external-reference validator.

## Publication boundary

Source validation does not establish publication. GitHub Pages publication remains a manual workflow dispatch for an exact 40-character commit SHA after merge. For a release, verify that the workflow succeeds, the public root and six SVG assets return HTTP 200, and the public catalog renders the same six providers without external provider requests.

Rollback uses the same manual workflow with the last known-good deployed SHA. No DNS, TLS, GitLab, CODEOWNER or provider-runtime change is part of this UI catalog update.
