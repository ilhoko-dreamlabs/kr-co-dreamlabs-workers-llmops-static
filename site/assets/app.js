(() => {
  "use strict";

  const routes = [
    { id: "overview", label: "Overview", icon: "⌂", group: "Operate" },
    { id: "gateway", label: "Model Gateway", icon: "⇄", group: "Operate" },
    { id: "models", label: "Model Catalog", icon: "◇", group: "Operate" },
    { id: "workers", label: "Workers / Keys", icon: "◎", group: "Operate" },
    { id: "usage", label: "Usage / Cost", icon: "▥", group: "Observe" },
    { id: "requests", label: "Requests", icon: "↔", group: "Observe" },
    { id: "health", label: "Health / Incidents", icon: "♡", group: "Observe" },
    { id: "releases", label: "Releases / Config", icon: "⬡", group: "Govern" },
    { id: "security", label: "Security / Access", icon: "▣", group: "Govern" },
    { id: "audit", label: "Audit", icon: "≡", group: "Govern" },
    { id: "settings", label: "Settings", icon: "⚙", group: "Govern" },
    { id: "architecture", label: "Architecture / Runbook", icon: "⌘", group: "Govern" }
  ];

  const state = { data: null, route: "overview", scenario: "normal", query: "", modelFilter: "all", requestFilter: "all", returnFocus: null };
  const els = {
    main: document.querySelector("#main-content"),
    nav: document.querySelector("#primary-nav"),
    breadcrumb: document.querySelector("#breadcrumb"),
    scenario: document.querySelector("#scenario-select"),
    sidebar: document.querySelector("#sidebar"),
    menu: document.querySelector("#menu-button"),
    scrim: document.querySelector("#sidebar-scrim"),
    drawer: document.querySelector("#detail-drawer"),
    drawerBackdrop: document.querySelector("#drawer-backdrop"),
    drawerTitle: document.querySelector("#drawer-title"),
    drawerBody: document.querySelector("#drawer-body"),
    drawerClose: document.querySelector("#drawer-close"),
    toast: document.querySelector("#toast")
  };

  const fmt = new Intl.NumberFormat("ko-KR");
  const pct = value => `${Number(value).toFixed(1)}%`;
  const money = value => `${Number(value).toFixed(1)} DC`;
  const scenarioCopy = {
    normal: { label: "Baseline sample", tone: "", text: "기본 합성 표본입니다. Provider Gamma의 관찰 중인 지연을 포함합니다. 아래 수치는 합성 표본이며 실시간 상태가 아닙니다." },
    degraded: { label: "Degraded simulation", tone: "warning", text: "Provider Gamma 지연 상승을 가정한 시뮬레이션입니다. 실제 장애를 의미하지 않습니다." },
    incident: { label: "Incident drill", tone: "danger", text: "SEV-2 대응 훈련 화면입니다. 실제 트래픽 차단이나 failover는 실행되지 않습니다." }
  };

  function safe(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[char]);
  }

  function statusBadge(status) {
    const normalized = String(status).toLowerCase();
    const labels = { healthy: "Healthy", active: "Active", degraded: "Degraded", completed: "Completed", failed: "Failed", "rate-limited": "Rate limited", resolved: "Resolved", monitoring: "Monitoring", superseded: "Superseded", blocked: "Blocked", allowed: "Allowed", "demo-only": "Demo only" };
    const tone = ["healthy", "active", "completed", "resolved", "allowed"].includes(normalized) ? "healthy" : ["degraded", "monitoring", "rate-limited", "superseded"].includes(normalized) ? "degraded" : ["failed", "blocked", "revoked"].includes(normalized) ? "incident" : "demo";
    return `<span class="status-badge ${tone}">${safe(labels[normalized] || status)}</span>`;
  }

  function pageHead(title, description, actions = "") {
    return `<header class="page-head"><div><span class="eyebrow">DREAMLABS · LLMOPS</span><h1>${safe(title)}</h1><p>${safe(description)}</p></div>${actions ? `<div class="head-actions">${actions}</div>` : ""}</header>`;
  }

  function notice() {
    const copy = scenarioCopy[state.scenario];
    return `<div class="notice ${copy.tone}"><strong>${safe(copy.label)}</strong><span>${safe(copy.text)}</span></div>`;
  }

  function card(title, subtitle, body, extraClass = "") {
    return `<section class="card ${extraClass}"><div class="card-header"><div><h2 class="card-title">${safe(title)}</h2>${subtitle ? `<p class="card-subtitle">${safe(subtitle)}</p>` : ""}</div></div>${body}</section>`;
  }

  function metric(label, value, foot, trend = "") {
    return `<article class="card metric-card"><div class="metric-label">${safe(label)}</div><div class="metric-value">${safe(value)}</div><div class="metric-foot">${trend ? `<span class="${trend.startsWith("+") ? "trend-up" : "trend-down"}">${safe(trend)}</span>` : ""}<span>${safe(foot)}</span></div></article>`;
  }

  function demoButton(label, primary = false) {
    return `<button class="button ${primary ? "primary" : ""}" type="button" data-demo-action="${safe(label)}">${safe(label)}</button>`;
  }

  function renderOverview() {
    const { summary, daily, models, requests: recent, meta } = state.data;
    const max = Math.max(...daily.map(item => item.requests));
    const bars = daily.map(item => `<div class="bar-item" title="${safe(item.label)} ${fmt.format(item.requests)} requests"><div class="bar" style="height:${Math.max(8, item.requests / max * 100)}%"></div><small>${safe(item.label)}</small></div>`).join("");
    const modelRows = models.map(model => `<tr><td><button class="table-link" data-detail-type="model" data-detail-id="${safe(model.id)}">${safe(model.displayName)}</button><br><span class="muted mono">${safe(model.alias)}</span></td><td>${safe(model.provider)}</td><td>${statusBadge(model.status)}</td><td>${fmt.format(model.requests)}</td><td>${pct(model.successRate)}</td><td>${fmt.format(model.p95LatencyMs)} ms</td></tr>`).join("");
    const requestItems = recent.slice(0,4).map(request => `<div class="timeline-item"><span class="timeline-dot"></span><span class="timeline-time">${safe(request.time)} · ${safe(request.id)}</span><h3>${safe(request.worker)} → ${safe(request.model)}</h3><p>${safe(request.operation)} · ${fmt.format(request.latencyMs)} ms · ${statusBadge(request.status)}</p></div>`).join("");
    return pageHead("Gateway overview", "WorkerOps의 모델 접근, 비용, 상태를 하나의 운영 경계에서 살펴보는 시연 화면입니다.", demoButton("Export demo report") + demoButton("Create virtual key", true)) + notice() +
      `<div class="grid metrics">${metric("Requests · 7 days", fmt.format(summary.requests), `표본 기준 ${meta.sampledAt}`, "+8.4%")} ${metric("Success rate", pct(summary.successRate), `${fmt.format(summary.completed)} completed`, "+0.6%")} ${metric("P95 latency", `${fmt.format(summary.p95LatencyMs)} ms`, "synthetic aggregate", "-4.2%")} ${metric("Demo cost", money(summary.demoCost), "not a billed amount", "+5.1%")}</div>` +
      `<div class="grid two section-gap">${card("Request volume", "7-day synthetic sample", `<div class="bar-chart" role="img" aria-label="7일 요청량 막대 차트">${bars}</div>`)}${card("Recent request flow", "요청 본문은 수집하거나 표시하지 않습니다.", `<div class="timeline">${requestItems}</div>`)}</div>` +
      `<div class="section-gap">${card("Model routing snapshot", "Alias 단위의 합성 집계", `<div class="table-wrap"><table><thead><tr><th>Model</th><th>Provider</th><th>Status</th><th>Requests</th><th>Success</th><th>P95</th></tr></thead><tbody>${modelRows}</tbody></table></div>`)}</div>`;
  }

  function renderModels() {
    const rows = state.data.models.map(model => `<tr data-model-status="${safe(model.status)}"><td><button class="table-link" data-detail-type="model" data-detail-id="${safe(model.id)}">${safe(model.displayName)}</button><br><span class="mono muted">${safe(model.id)}</span></td><td><span class="badge">${safe(model.provider)}</span></td><td class="mono">${safe(model.alias)}</td><td>${statusBadge(model.status)}</td><td>${safe(model.context)}</td><td>${safe(model.policy)}</td><td>${fmt.format(model.requests)}</td><td>${money(model.cost)}</td></tr>`).join("");
    return pageHead("Model catalog", "외부 provider 모델을 Gateway alias와 정책으로 추상화하는 운영 카탈로그입니다.", demoButton("Compare policies") + demoButton("Add model", true)) + notice() +
      card("Published gateway models", "실제 provider 이름, credential, endpoint는 노출하지 않습니다.", `<div class="filters"><input class="field search-field" id="model-search" type="search" placeholder="모델·alias 검색" aria-label="모델 검색">${["all", "healthy", "degraded"].map(filter => `<button class="filter-chip ${state.modelFilter === filter ? "active" : ""}" data-model-filter="${filter}" aria-pressed="${state.modelFilter === filter}" type="button">${filter} ${state.data.models.filter(model => filter === "all" || model.status === filter).length}</button>`).join("")}</div><div class="table-wrap"><table id="model-table"><thead><tr><th>Model</th><th>Provider</th><th>Gateway alias</th><th>Status</th><th>Context</th><th>Policy</th><th>Requests</th><th>Cost</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  }

  function renderWorkers() {
    const rows = state.data.workers.map(worker => { const usage = Math.round(worker.used / worker.budget * 100); return `<tr><td><button class="table-link" data-detail-type="worker" data-detail-id="${safe(worker.id)}">${safe(worker.name)}</button><br><span class="mono muted">${safe(worker.id)}</span></td><td>${safe(worker.profile)}</td><td class="mono">${safe(worker.keyAlias)}</td><td>${statusBadge(worker.status)}</td><td>${fmt.format(worker.requests)}</td><td><div class="progress-row"><div class="progress-track"><div class="progress-fill ${usage > 85 ? "warning" : ""}" style="width:${usage}%"></div></div><span>${usage}%</span></div></td><td>${safe(worker.lastSeen)}</td></tr>`; }).join("");
    return pageHead("Workers & virtual keys", "Worker별 최소 권한, 예산, 사용량을 virtual key 경계로 관리하는 시연입니다.", demoButton("Rotate selected key") + demoButton("Issue virtual key", true)) + notice() +
      `<div class="grid metrics">${metric("Active workers", "3", "all demo identities")} ${metric("Virtual keys", "3", "values are never shown")} ${metric("Budget alerts", "1", "synthetic warning")} ${metric("Revoked", "0", "sample period")}</div>` +
      `<div class="section-gap">${card("Worker access registry", "Key 값 대신 비민감 alias만 표시합니다.", `<div class="table-wrap"><table><thead><tr><th>Worker</th><th>Profile</th><th>Key alias</th><th>State</th><th>Requests</th><th>Budget used</th><th>Last seen</th></tr></thead><tbody>${rows}</tbody></table></div>`)}</div>`;
  }

  function renderUsage() {
    const { models, workers, daily, summary } = state.data;
    const maxCost = Math.max(...models.map(item => item.cost));
    const modelProgress = models.map(model => `<div class="progress-row"><span>${safe(model.displayName)}</span><div class="progress-track"><div class="progress-fill" style="width:${model.cost / maxCost * 100}%"></div></div><b>${money(model.cost)}</b></div>`).join("");
    const workerProgress = workers.map(worker => `<div class="progress-row"><span>${safe(worker.name)}</span><div class="progress-track"><div class="progress-fill ${worker.used / worker.budget > .85 ? "warning" : "success"}" style="width:${worker.used / worker.budget * 100}%"></div></div><b>${Math.round(worker.used / worker.budget * 100)}%</b></div>`).join("");
    const dailyRows = daily.map(day => `<tr><td>${safe(day.label)}</td><td>${fmt.format(day.requests)}</td><td>${money(day.cost)}</td><td>${money(day.cost / day.requests)}</td></tr>`).join("");
    return pageHead("Usage & cost", "청구가 아닌 합성 Demo Credits로 비용 가시성과 budget guardrail을 표현합니다.", demoButton("Download CSV")) + notice() +
      `<div class="grid metrics">${metric("Total usage", fmt.format(summary.requests), "synthetic requests")} ${metric("Total cost", money(summary.demoCost), "not billed")} ${metric("Avg / request", money(summary.demoCost / summary.requests), "demo average")} ${metric("Budget coverage", "87%", "policy-bound requests")}</div>` +
      `<div class="grid two section-gap">${card("Cost by model", "7-day demo credits", `<div class="stack">${modelProgress}</div>`)}${card("Worker budget consumption", "Warning at 85%", `<div class="stack">${workerProgress}</div>`)}</div>` +
      `<div class="section-gap">${card("Daily usage ledger", "No billing or provider invoice integration", `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Requests</th><th>Demo cost</th><th>Avg cost</th></tr></thead><tbody>${dailyRows}</tbody></table></div>`)}</div>`;
  }

  function renderRequests() {
    const filtered = state.data.requests.filter(item => (state.requestFilter === "all" || item.status === state.requestFilter) && (!state.query || [item.id,item.worker,item.model,item.operation].join(" ").toLowerCase().includes(state.query.toLowerCase())));
    const rows = filtered.map(request => `<tr><td><button class="table-link mono" data-detail-type="request" data-detail-id="${safe(request.id)}">${safe(request.id)}</button></td><td>${safe(request.time)}</td><td>${safe(request.worker)}</td><td class="mono">${safe(request.model)}</td><td>${safe(request.operation)}</td><td>${statusBadge(request.status)}</td><td>${fmt.format(request.latencyMs)} ms</td><td>${fmt.format(request.tokens)}</td><td>${money(request.cost)}</td></tr>`).join("");
    return pageHead("Requests & observability", "본문·응답·개인정보 없이 요청 메타데이터와 집계만 보여주는 추적 화면입니다.", demoButton("Open trace explorer")) + notice() +
      card("Request ledger", "Sampled metadata · no prompts or completions", `<div class="filters"><input class="field search-field" id="request-search" type="search" value="${safe(state.query)}" placeholder="요청 ID, Worker, 모델 검색" aria-label="요청 검색">${["all","completed","failed","rate-limited"].map(filter => `<button class="filter-chip ${state.requestFilter === filter ? "active" : ""}" type="button" data-request-filter="${filter}">${filter === "all" ? "All" : filter}</button>`).join("")}<span class="filter-count">${filtered.length} sample rows</span></div><div class="table-wrap"><table><thead><tr><th>Request ID</th><th>Time</th><th>Worker</th><th>Model</th><th>Operation</th><th>Status</th><th>Latency</th><th>Tokens</th><th>Cost</th></tr></thead><tbody>${rows || `<tr><td colspan="9" class="empty">일치하는 합성 요청이 없습니다.</td></tr>`}</tbody></table></div>`);
  }

  function renderHealth() {
    const scenario = state.scenario;
    const gatewayState = scenario === "incident" ? "degraded" : "healthy";
    const providerState = scenario === "normal" ? "degraded" : "incident";
    const incidentRows = state.data.incidents.map(item => `<tr><td><button class="table-link" data-detail-type="incident" data-detail-id="${safe(item.id)}">${safe(item.title)}</button><br><span class="mono muted">${safe(item.id)}</span></td><td><span class="badge">${safe(item.severity)}</span></td><td>${statusBadge(item.status)}</td><td>${safe(item.started)}</td><td>${safe(item.impact)}</td><td>${safe(item.owner)}</td></tr>`).join("");
    return pageHead("Health & incidents", "Gateway 구성요소 상태와 incident response 흐름을 합성 시나리오로 보여줍니다.", demoButton("Declare incident", true)) + notice() +
      `<div class="grid three">${card("Gateway edge", "Static health simulation", `${statusBadge(gatewayState)}<p class="muted">Routing policy · 99.95% demo availability</p>`)}${card("Configuration store", "PostgreSQL planned state", `${statusBadge("healthy")}<p class="muted">Connection pool · synthetic check</p>`)}${card("External providers", "Aggregated, anonymized", `${statusBadge(providerState)}<p class="muted">1 of 3 providers under observation</p>`)}</div>` +
      `<div class="section-gap">${card("Incident register", "훈련과 합성 사건만 포함합니다.", `<div class="table-wrap"><table><thead><tr><th>Incident</th><th>Severity</th><th>Status</th><th>Started</th><th>Impact</th><th>Owner</th></tr></thead><tbody>${incidentRows}</tbody></table></div>`)}</div>`;
  }

  function renderReleases() {
    const releases = state.data.releases.map(item => `<div class="timeline-item"><span class="timeline-dot"></span><span class="timeline-time">${safe(item.date)} · ${safe(item.actor)}</span><h3>${safe(item.version)} ${statusBadge(item.state)}</h3><p>${safe(item.summary)}</p></div>`).join("");
    const config = Object.entries(state.data.config).map(([key,value]) => `<dt>${safe(key.replace(/[A-Z]/g, c => ` ${c.toLowerCase()}`))}</dt><dd>${safe(value)}</dd>`).join("");
    return pageHead("Releases & configuration", "정적 데모의 release lineage와 계획된 LiteLLM runtime shape를 분리해 표시합니다.", demoButton("Compare release") + demoButton("Promote version", true)) + notice() +
      `<div class="grid two">${card("Release history", "Demo versions · no deployed runtime claim", `<div class="timeline">${releases}</div>`)}${card("Configuration snapshot", "Planning values, not live readback", `<dl class="detail-list">${config}</dl>`)}</div>` +
      `<div class="notice warning section-gap"><strong>Deploy pending</strong><span>이 프로토타입은 LiteLLM, PostgreSQL 또는 provider에 연결되지 않았습니다. 운영 배포 상태를 주장하지 않습니다.</span></div>`;
  }

  function renderSecurity() {
    const auditRows = state.data.audit.map(item => `<tr><td class="mono">${safe(item.id)}</td><td>${safe(item.time)}</td><td>${safe(item.actor)}</td><td>${safe(item.action)}</td><td class="mono">${safe(item.target)}</td><td>${statusBadge(item.result)}</td></tr>`).join("");
    return pageHead("Security & access", "Gateway를 credential, identity, policy, audit의 단일 통제 지점으로 표현합니다.", demoButton("Review policy")) + notice() +
      `<div class="grid three">${card("Provider credentials", "Boundary", `<span class="status-badge healthy">Gateway only</span><p class="muted">Worker와 브라우저에는 provider secret을 배포하지 않습니다.</p>`)}${card("Virtual key policy", "Identity", `<span class="status-badge healthy">Per worker</span><p class="muted">Worker identity별 budget 및 model allowlist를 가정합니다.</p>`)}${card("Sensitive payloads", "Observability", `<span class="status-badge healthy">Not displayed</span><p class="muted">Prompt, response, user data는 이 시연에 포함하지 않습니다.</p>`)}</div>` +
      `<div class="section-gap">${card("Synthetic audit trail", "실제 계정 또는 운영 변경 기록이 아닙니다.", `<div class="table-wrap"><table><thead><tr><th>Event</th><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Result</th></tr></thead><tbody>${auditRows}</tbody></table></div>`)}</div>`;
  }

  function renderArchitecture() {
    const steps = [
      ["Detect", "상태·지연·오류율 신호를 확인하고 실제 영향과 시연 상태를 구분합니다."],
      ["Contain", "영향 모델 alias를 제한하고 승인된 routing 변경 후보를 준비합니다."],
      ["Approve", "정확한 target, action, risk, rollback으로 canonical Approval을 획득합니다."],
      ["Execute", "승인 범위의 단일 변경만 수행하고 secret을 로그에 남기지 않습니다."],
      ["Verify", "health, readiness, 정책 readback, audit, 비대상 Worker 안전을 검증합니다."],
      ["Recover", "승인된 rollback을 수행하고 원인·증거·후속 조치를 기록합니다."]
    ].map(([title,copy]) => `<div class="runbook-step"><b>${safe(title)}</b><span>${safe(copy)}</span></div>`).join("");
    return pageHead("Architecture & runbook", "WorkerOps = AgentOps + LLMOps 관점에서 모델 접근 경계와 승인 기반 운영 흐름을 시각화합니다.", demoButton("Open runbook drill")) + notice() +
      `<div class="grid two">${card("Logical request path", "Conceptual shape · not a live topology", `<div class="architecture"><div class="arch-row"><div class="arch-node"><b>WorkerOps</b><span>Worker identity · task execution</span></div><div class="arch-arrow">→</div><div class="arch-node primary"><b>LLMOps Gateway</b><span>Auth · policy · routing · usage · audit</span></div><div class="arch-arrow">→</div><div class="arch-node"><b>Model providers</b><span>Anonymized external services</span></div></div><div class="arch-row"><div class="arch-node"><b>Operator</b><span>Review and approval</span></div><div class="arch-arrow">→</div><div class="arch-node primary"><b>Control plane</b><span>Configuration · releases · incidents</span></div><div class="arch-arrow">→</div><div class="arch-node"><b>PostgreSQL</b><span>Planned dedicated store</span></div></div></div>`)}${card("Incident runbook", "Approval boundary preserved", `<div class="runbook-list">${steps}</div>`)}</div>` +
      `<div class="section-gap">${card("Prototype boundaries", "What this public artifact does and does not prove", `<div class="grid three"><div><span class="eyebrow">PROVES</span><h3>Experience design</h3><p class="muted">정보 구조, 화면 흐름, 데이터 최소화, 반응형 UI.</p></div><div><span class="eyebrow">DOES NOT PROVE</span><h3>Runtime readiness</h3><p class="muted">LiteLLM, DB, DNS, TLS, provider 연결 또는 성능.</p></div><div><span class="eyebrow">NEXT GATE</span><h3>Approved publication</h3><p class="muted">Repository·Pages·custom domain 각각의 승인과 검증.</p></div></div>`)}</div>`;
  }

  function renderGateway() {
    const rows = state.data.models.map(model => `<tr><td class="mono">${safe(model.alias)}</td><td>${safe(model.provider)}</td><td>${safe(model.displayName)}</td><td>${safe(model.policy)}</td><td>${statusBadge(model.status)}</td></tr>`).join("");
    return pageHead("LiteLLM model gateway", "LiteLLM 기반 Model Gateway의 개념적 동작을 보여줍니다. 실제 Gateway나 provider를 호출하지 않습니다.") + notice() +
      card("Provider / model routing", "Worker virtual key → model allowlist → gateway alias → provider model", `<div class="table-wrap"><table><thead><tr><th>Gateway alias</th><th>Provider</th><th>Model</th><th>Routing policy</th><th>Sample health</th></tr></thead><tbody>${rows}</tbody></table></div>`) +
      `<div class="grid three section-gap">${card("Virtual key enforcement", "Concept only", `<p>Worker별 key alias와 예산으로 접근 범위를 구분합니다. 실제 key는 생성하거나 저장하지 않습니다.</p><a href="#/workers">Worker별 접근 보기</a>`)}${card("Retry & fallback", "Disabled in this demo", `<p>재시도와 fallback은 비활성 상태를 가정합니다. 시나리오 전환은 화면에만 적용됩니다.</p><a href="#/settings">설정 보기</a>`)}${card("Usage & audit", "Synthetic metadata only", `<p>호출 본문 없이 합성 비용과 감사 이벤트를 표시합니다.</p><a href="#/usage">비용 보기</a> · <a href="#/audit">감사 기록 보기</a>`)}</div>`;
  }

  function renderAudit() {
    const rows = state.data.audit.map(item => `<tr><td class="mono">${safe(item.id)}</td><td>${safe(item.time)}</td><td>${safe(item.actor)}</td><td>${safe(item.action)}</td><td>${safe(item.target)}</td><td>${statusBadge(item.result)}</td></tr>`).join("");
    return pageHead("Audit trail", "미리 준비한 합성 감사 이벤트입니다. 현재 사용자 활동을 기록하거나 전송하지 않습니다.") + notice() + card("Synthetic audit events", "No live audit connection", `<div class="table-wrap"><table><thead><tr><th>Event</th><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  }

  function renderSettings() {
    const config = Object.entries(state.data.config).map(([key, value]) => `<dt>${safe(key)}</dt><dd>${safe(value)}</dd>`).join("");
    return pageHead("Demo settings", "읽기 전용 설정 예시입니다. 실제 endpoint, credential 입력 또는 운영 설정 저장 기능은 없습니다.") + notice() +
      `<div class="grid two">${card("Gateway configuration", "Planned LiteLLM runtime · not deployed", `<dl class="detail-list">${config}</dl>`)}${card("Simulation preferences", "This browser session only", `<p>상단 Demo scenario에서 기본 표본, 지연, 장애 훈련을 선택할 수 있습니다. 새로고침하면 기본 표본으로 초기화됩니다.</p><p>비용 단위: Demo Credits · 실제 과금 없음</p><p>데이터: 합성 fixture · 실제 API 연결 없음</p><a href="#/architecture">시연 범위와 구조 보기</a>`)}</div>`;
  }

  const renderers = { gateway: renderGateway, audit: renderAudit, settings: renderSettings, overview: renderOverview, models: renderModels, workers: renderWorkers, usage: renderUsage, requests: renderRequests, health: renderHealth, releases: renderReleases, security: renderSecurity, architecture: renderArchitecture };

  function renderNav() {
    let group = "";
    els.nav.innerHTML = routes.map(route => {
      const heading = route.group !== group ? `<div class="nav-group-label">${safe(route.group)}</div>` : "";
      group = route.group;
      return `${heading}<a class="nav-link ${state.route === route.id ? "active" : ""}" href="#/${route.id}" ${state.route === route.id ? "aria-current=\"page\"" : ""}><span class="nav-icon" aria-hidden="true">${route.icon}</span><span>${safe(route.label)}</span></a>`;
    }).join("");
  }

  function render() {
    if (!state.data) return;
    closeDetail();
    const route = routes.find(item => item.id === state.route) || routes[0];
    state.route = route.id;
    document.title = `${route.label} · DreamLabs LLMOps Demo`;
    els.breadcrumb.textContent = `LLMOps / ${route.label}`;
    renderNav();
    els.main.innerHTML = renderers[route.id]();
    bindPageEvents();
    closeMenu();
    els.main.focus({ preventScroll: true });
  }

  function bindPageEvents() {
    document.querySelectorAll("[data-demo-action]").forEach(button => button.addEventListener("click", () => showToast(`${button.dataset.demoAction}: 정적 데모에서는 운영 변경을 실행하지 않습니다.`)));
    document.querySelectorAll("[data-detail-type]").forEach(button => button.addEventListener("click", () => openDetail(button.dataset.detailType, button.dataset.detailId)));
    document.querySelectorAll("[data-request-filter]").forEach(button => button.addEventListener("click", () => { state.requestFilter = button.dataset.requestFilter; render(); }));
    const requestSearch = document.querySelector("#request-search");
    if (requestSearch) requestSearch.addEventListener("input", event => { state.query = event.target.value; render(); document.querySelector("#request-search")?.focus(); });
    const modelSearch = document.querySelector("#model-search");
    const filterModels = () => {
      const needle = (modelSearch?.value || "").toLowerCase();
      document.querySelectorAll("#model-table tbody tr").forEach(row => {
        row.hidden = !row.textContent.toLowerCase().includes(needle) || (state.modelFilter !== "all" && row.dataset.modelStatus !== state.modelFilter);
      });
    };
    modelSearch?.addEventListener("input", filterModels);
    document.querySelectorAll("[data-model-filter]").forEach(button => button.addEventListener("click", () => {
      state.modelFilter = button.dataset.modelFilter;
      document.querySelectorAll("[data-model-filter]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.modelFilter === state.modelFilter);
        chip.setAttribute("aria-pressed", String(chip.dataset.modelFilter === state.modelFilter));
      });
      filterModels();
    }));
    filterModels();
  }

  function openDetail(type, id) {
    const collections = { model: state.data.models, worker: state.data.workers, request: state.data.requests, incident: state.data.incidents };
    const item = collections[type]?.find(entry => entry.id === id);
    if (!item) return;
    const labels = { model: "Model detail", worker: "Worker access", request: "Request metadata", incident: "Incident detail" };
    state.returnFocus = document.activeElement;
    els.drawerTitle.textContent = labels[type];
    els.drawerBody.innerHTML = `<div class="notice"><strong>DEMO</strong><span>합성 레코드이며 실제 운영 데이터를 나타내지 않습니다.</span></div><dl class="detail-list">${Object.entries(item).map(([key,value]) => `<dt>${safe(key)}</dt><dd>${safe(value)}</dd>`).join("")}</dl><div class="section-gap">${demoButton("Simulate follow-up", true)}</div>`;
    els.drawer.inert = false;
    document.querySelector(".app-shell").inert = true;
    els.drawer.classList.add("open");
    els.drawer.setAttribute("aria-hidden", "false");
    els.drawerBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    els.drawerClose.focus();
    els.drawerBody.querySelector("[data-demo-action]")?.addEventListener("click", () => showToast("후속 조치는 시연만 가능하며 운영 시스템에 전송되지 않습니다."));
  }

  function closeDetail() {
    const wasOpen = els.drawer.classList.contains("open");
    els.drawer.inert = true;
    document.querySelector(".app-shell").inert = false;
    els.drawer.classList.remove("open");
    els.drawer.setAttribute("aria-hidden", "true");
    els.drawerBackdrop.hidden = true;
    document.body.style.overflow = "";
    if (wasOpen && state.returnFocus instanceof HTMLElement) state.returnFocus.focus();
    state.returnFocus = null;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 3200);
  }

  function openMenu() {
    els.sidebar.classList.add("open");
    els.scrim.classList.add("show");
    els.menu.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    els.sidebar.classList.remove("open");
    els.scrim.classList.remove("show");
    els.menu.setAttribute("aria-expanded", "false");
  }

  function routeFromHash() {
    return location.hash.replace(/^#\/?/, "").split("?")[0] || "overview";
  }

  async function init() {
    try {
      const response = await fetch("./data/demo.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = await response.json();
      state.route = routeFromHash();
      render();
    } catch (error) {
      els.main.innerHTML = pageHead("Demo data unavailable", "정적 데이터 파일을 불러오지 못했습니다.") + `<div class="notice danger"><strong>Load failed</strong><span>${safe(error.message)} · 로컬 파일 직접 열기 대신 정적 HTTP 서버를 사용해 주세요.</span></div>`;
    }
  }

  document.querySelector(".skip-link").addEventListener("click", event => { event.preventDefault(); els.main.focus(); });
  window.addEventListener("hashchange", () => { state.route = routeFromHash(); render(); });
  els.scenario.addEventListener("change", event => { state.scenario = event.target.value; render(); showToast(`${scenarioCopy[state.scenario].label} 시나리오로 전환했습니다.`); });
  els.menu.addEventListener("click", () => els.sidebar.classList.contains("open") ? closeMenu() : openMenu());
  els.scrim.addEventListener("click", closeMenu);
  els.drawerClose.addEventListener("click", closeDetail);
  els.drawerBackdrop.addEventListener("click", closeDetail);
  document.querySelector("#notification-button").addEventListener("click", () => showToast("데모 알림 3건: budget warning, provider latency, release note."));
  document.addEventListener("keydown", event => {
    if (event.key === "Tab" && els.drawer.classList.contains("open")) {
      const items = [...els.drawer.querySelectorAll("button, a[href], input, select, [tabindex='0']")];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === "Escape") { closeDetail(); closeMenu(); } });
  init();
})();
