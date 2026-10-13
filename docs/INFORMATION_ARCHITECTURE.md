# Information Architecture

## Operating model

프로토타입은 `WorkerOps = AgentOps + LLMOps` 관점 중 모델 접근 통제면을 다룬다.

```text
Worker identity
  → virtual key / budget / model allowlist
  → LLMOps Gateway
      → authentication and policy
      → model alias and routing
      → usage, cost and audit metadata
  → external model provider
```

이는 개념적 구조이며 실제 운영 topology가 아니다.

## Navigation

| Group | Screen | Primary question |
| --- | --- | --- |
| Operate | Overview | 현재 운영 그림은 무엇인가? |
| Operate | Model Gateway | LiteLLM alias, provider, policy 경계는 무엇인가? |
| Operate | Model Catalog | 어떤 Gateway alias와 정책이 제공되는가? |
| Operate | Workers / Keys | 누가 어떤 경계와 budget으로 접근하는가? |
| Observe | Usage / Cost | 사용량과 비용은 어디에 집중되는가? |
| Observe | Requests | 요청 결과와 지연을 어떻게 추적하는가? |
| Observe | Health / Incidents | 현재 상태와 대응 사건은 무엇인가? |
| Govern | Releases / Config | 어떤 구성과 release가 기준인가? |
| Govern | Security / Access | secret, identity, audit 경계는 무엇인가? |
| Govern | Audit | 어떤 합성 감사 이벤트를 검토할 수 있는가? |
| Govern | Settings | 어떤 읽기 전용 데모 설정을 가정하는가? |
| Govern | Architecture / Runbook | 구조와 승인 기반 대응 절차는 무엇인가? |

## Data minimization

Request view에는 합성 request ID, 시각, Worker, model alias, operation, 상태, latency, token count, Demo Credits만 표시한다. prompt/response와 provider credential은 데이터 모델 자체에 존재하지 않는다.

## Responsive behavior

- Desktop: 고정 sidebar와 다중 열 운영 dashboard
- Tablet: sidebar drawer, 2열 metric grid
- Mobile: 단일 열 cards, 가로 스크롤 table, 전체 폭 detail drawer
- 키보드: skip link, 44px controls, visible focus, Escape로 drawer/menu 닫기
- motion: `prefers-reduced-motion` 존중
