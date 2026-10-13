# Worker00 Review Record

## Request

Worker00에 다음 경계를 전제로 구성 검토를 요청했다.

- target: `llmops.workers.dreamlabs.co.kr`
- source candidate: `C:\dreamlabs\github\kr-co-dreamlabs-workers-llmops-static`
- delivery candidate: GitHub Pages
- purpose: 실운영 콘솔처럼 보이는 시연용 정적 프로토타입
- prohibition: 실제 Gateway, provider, credential, Worker runtime 연결과 운영 변경

## Result

Worker00의 read-only 검토는 `completed / success`로 종료됐다. 파일, repository, Pages, DNS, TLS 또는 runtime 변경은 없었다.

핵심 권고는 다음과 같다.

1. HTML/CSS/JavaScript와 local JSON fixture만 사용하는 정적 구성이 적합하다.
2. 모든 화면에 `DEMO · NON-PRODUCTION` 표식을 유지한다.
3. 실제 credential, request/prompt/response, 사용자 데이터, 내부 IP, host/container identity와 운영 topology를 포함하지 않는다.
4. GitHub Actions 검증 후 승인된 immutable commit만 수동 Pages workflow로 게시한다.
5. Pages artifact는 `site/`로 제한한다.
6. custom domain은 Pages Settings에서 먼저 등록하고 subdomain CNAME은 GitHub Pages user domain을 가리키도록 한다.
7. repository 생성/push, Pages publish, custom domain, DNS, HTTPS는 별도 canonical Approval 대상으로 유지한다.

## Applied design decisions

- 9개 hash route와 공통 console shell
- 합성 식별자 `demo-*`와 비용 단위 `Demo Credits`
- 외부 asset, analytics, CDN, font 없음
- 변경형 UI는 network side effect 없이 demo toast만 표시
- publish workflow는 `workflow_dispatch`와 exact 40-character commit SHA를 요구
- GitHub Actions는 verified tag의 immutable commit SHA로 pin

## Status classification

- source candidate: `source-only`
- local validation: `pass`
- browser screenshot verification: `blocked` — 현재 실행 환경에 browser automation surface가 없음
- repository / Pages / custom domain / DNS / TLS: `deploy pending`
