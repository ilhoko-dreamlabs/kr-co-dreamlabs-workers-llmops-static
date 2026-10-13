# DreamLabs LLMOps Console Prototype

`llmops.workers.dreamlabs.co.kr`에 게시할 수 있도록 준비한 정적 시연용 LLMOps 운영 콘솔입니다.

> **DEMO · NON-PRODUCTION** — 합성 데이터만 사용하며 실제 LiteLLM, Worker, model provider, credential 또는 운영 API에 연결하지 않습니다.

## Scope

- Overview
- Model Gateway (LiteLLM routing concept)
- Model Catalog
- Workers / Virtual Keys
- Usage / Cost
- Requests / Observability
- Health / Incidents
- Releases / Config
- Security / Access
- Audit
- Settings (read-only demo configuration)
- Architecture / Runbook

정적 산출물은 `site/` 디렉터리뿐입니다. 프레임워크, package install, runtime secret, 외부 CDN과 analytics를 사용하지 않습니다.

## Local verification

```powershell
node scripts/validate.mjs
node --check site/assets/app.js
```

브라우저 검증은 로컬 HTTP 서버에서 수행합니다. 파일을 직접 열면 브라우저 보안 정책으로 JSON fixture를 읽지 못할 수 있습니다.

```powershell
Set-Location site
py -m http.server 4173 --bind 127.0.0.1
```

그 후 브라우저에서 `http://127.0.0.1:4173/#/overview`를 엽니다.

## Publication boundary

`.github/workflows/pages.yml`은 `workflow_dispatch` 전용이며 승인된 40자리 commit SHA를 입력해야 합니다. 저장소 생성, commit, push, Pages 활성화, custom domain 설정, DNS 및 TLS 변경은 이 로컬 후보를 만드는 작업에 포함되지 않습니다.

자세한 경계와 게시 절차는 다음 문서를 확인합니다.

- [`docs/DEMO_BOUNDARY.md`](docs/DEMO_BOUNDARY.md)
- [`docs/INFORMATION_ARCHITECTURE.md`](docs/INFORMATION_ARCHITECTURE.md)
- [`docs/PUBLISH_RUNBOOK.md`](docs/PUBLISH_RUNBOOK.md)

## Verification and publication status

See [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for the tested local candidate and the independently observed public HTTP result.
