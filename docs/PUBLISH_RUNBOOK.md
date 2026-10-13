# GitHub Pages Publish Runbook

## Current state

`deploy pending`. 이 저장소는 로컬 source candidate이며 remote repository, commit, push, Pages, custom domain, DNS 또는 TLS 상태를 주장하지 않는다.

## Approval boundary

다음 변경은 각각 exact target, action, risk, rollback을 포함한 canonical Approval 이후에만 수행한다.

1. GitHub repository `ilhoko-dreamlabs/kr-co-dreamlabs-workers-llmops-static` 생성과 최초 push
2. 특정 immutable commit SHA의 GitHub Pages workflow 실행
3. Pages custom domain을 `llmops.workers.dreamlabs.co.kr`로 설정
4. 해당 subdomain CNAME을 `ilhoko-dreamlabs.github.io`로 생성 또는 변경
5. DNS 전파 확인 후 Enforce HTTPS 활성화

승인은 한 단계의 권한을 다음 단계로 자동 위임하지 않는다.

## Pre-publish checks

```powershell
node scripts/validate.mjs
node --check site/assets/app.js
git diff --check
git status --short
```

추가로 데스크톱과 모바일 viewport에서 모든 hash route, keyboard focus, drawer, scenario selector, 검색/필터를 확인한다. 개발자 도구 Network에서 `data/demo.json` 이외의 요청이 없는지 확인한다.

## Candidate deployment sequence

1. 승인된 private 또는 public repository를 생성한다. Pages는 공개 산출물로 취급한다.
2. 검증된 파일만 scoped commit으로 기록하고 remote에 push한다.
3. Actions의 `Validate static demo`가 통과했는지 확인한다.
4. Repository Settings → Pages에서 GitHub Actions source를 설정한다.
5. `Publish approved Pages commit` workflow를 열고 승인된 40자리 commit SHA를 입력한다.
6. workflow artifact가 `site/`만 포함하는지, deployment environment가 `github-pages`인지 확인한다.
7. 기본 Pages URL에서 persistent demo banner, 9개 route, 404와 외부 호출 부재를 확인한다.
8. Pages Settings에서 custom domain을 먼저 등록한다.
9. DNS에 `llmops.workers.dreamlabs.co.kr CNAME ilhoko-dreamlabs.github.io`를 설정한다. repository 경로를 CNAME target에 넣지 않는다.
10. DNS와 certificate 상태가 안정된 뒤 HTTPS 강제를 활성화하고 최종 URL을 다시 검증한다.

## Rollback

- UI regression: 이전 검증 commit SHA로 수동 Pages workflow를 다시 실행한다.
- Domain regression: Pages custom domain과 DNS 변경을 승인된 이전 값으로 복구하고 기본 Pages URL을 검증한다.
- Secret or sensitive-data exposure: Pages publication을 즉시 중지하고 노출된 credential을 폐기·교체한 뒤 Git history와 artifact 범위를 별도로 정리한다. 파일 삭제만으로 secret 회수가 완료되었다고 보지 않는다.

## Acceptance evidence

- 승인 ID와 정확한 commit SHA
- validation workflow URL 및 conclusion
- Pages deployment URL 및 conclusion
- custom domain DNS CNAME readback
- HTTPS certificate 및 redirect 확인
- 외부 request와 민감정보가 없다는 최종 검증 기록
