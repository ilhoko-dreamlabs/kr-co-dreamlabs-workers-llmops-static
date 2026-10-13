# Demo Boundary

## Purpose

이 사이트는 DreamLabs WorkerOps의 LLMOps 영역을 이해관계자에게 시연하기 위한 공개 가능한 정적 프로토타입이다. 운영 환경과 유사한 정보 구조를 제공하지만 운영 시스템으로 오인되지 않도록 모든 화면에 `DEMO · NON-PRODUCTION` 표식을 유지한다.

## Included

- `site/data/demo.json`의 합성 데이터
- 모델 alias, Worker identity, virtual key alias의 예시
- 요청 메타데이터와 집계 예시
- 비용 단위 `Demo Credits`
- incident, release, audit, runbook의 시연 흐름
- Normal, Degraded, Incident drill 시나리오 전환

## Excluded

- 실제 LiteLLM, PostgreSQL, Worker 또는 model provider 연결
- provider 또는 Gateway credential
- 실제 prompt, response, 사용자 데이터, 계정, 내부 IP, host/container ID
- 로그인, key 입력, 파일 업로드, 운영 API endpoint
- 실제 재시작, 배포, key rotation, routing, incident 선언
- analytics, 외부 font, CDN 또는 third-party script

## Safety behavior

화면의 변경형 버튼은 데모 안내만 표시하며 네트워크 요청이나 로컬 저장을 수행하지 않는다. 브라우저가 읽는 유일한 데이터 요청은 동일 산출물 안의 `./data/demo.json`이다.

## Non-claims

이 산출물은 UI 정보 구조와 데이터 최소화 설계의 증거다. runtime readiness, 성능, availability, DNS/TLS, provider 연결, GitHub Pages 배포 또는 운영 승인 상태의 증거가 아니다.
