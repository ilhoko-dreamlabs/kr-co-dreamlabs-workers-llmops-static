import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import process from "node:process";

const root = process.cwd();
const requiredFiles = [
  "site/index.html",
  "site/404.html",
  "site/robots.txt",
  "site/assets/app.css",
  "site/assets/app.js",
  "site/data/demo.json",
  "docs/DEMO_BOUNDARY.md",
  "docs/INFORMATION_ARCHITECTURE.md",
  "docs/PUBLISH_RUNBOOK.md",
  "docs/WORKER00_REVIEW.md",
  ".github/workflows/validate.yml",
  ".github/workflows/pages.yml"
];
const requiredRoutes = ["gateway", "audit", "settings", "overview", "models", "workers", "usage", "requests", "health", "releases", "security", "architecture"];
const textExtensions = new Set([".html", ".css", ".js", ".json", ".txt", ".xml", ".svg"]);
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function read(path) {
  try { return await readFile(join(root, path), "utf8"); }
  catch { failures.push(`missing required file: ${path}`); return ""; }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

for (const file of requiredFiles) await read(file);

const index = await read("site/index.html");
const app = await read("site/assets/app.js");
const pagesWorkflow = await read(".github/workflows/pages.yml");
const jsonText = await read("site/data/demo.json");
let data = {};
try { data = JSON.parse(jsonText); }
catch (error) { failures.push(`demo.json is invalid JSON: ${error.message}`); }

check(index.includes("DEMO · NON-PRODUCTION"), "persistent DEMO · NON-PRODUCTION banner is missing");
check(index.includes("실제 Gateway에 연결되지 않습니다"), "non-connected disclaimer is missing");
check(index.includes("id=\"main-content\""), "main landmark is missing");
check(index.includes("본문으로 건너뛰기"), "skip link is missing");
check(index.includes("role=\"dialog\"") && index.includes("aria-modal=\"true\""), "accessible detail dialog semantics are missing");
check(!/<input[^>]+type=["'](?:password|file)["']/i.test(index + app), "credential or file input is prohibited");
for (const route of requiredRoutes) check(app.includes(`id: "${route}"`), `route missing from app.js: ${route}`);

check(Array.isArray(data.models) && data.models.length === 3, "expected 3 synthetic models");
check(Array.isArray(data.workers) && data.workers.length === 3, "expected 3 synthetic workers");
check(Array.isArray(data.requests) && data.requests.length >= 6, "expected request samples");
check(data.meta?.connected === false, "meta.connected must remain false");
check(data.meta?.currency === "Demo Credits", "currency must remain Demo Credits");

const allRecords = [data.models, data.workers, data.requests, data.incidents, data.releases, data.audit].flat().filter(Boolean);
for (const record of allRecords) check(String(record.id || "").startsWith("demo-"), `synthetic record id must begin with demo-: ${record.id || "<missing>"}`);

const sum = (items, key) => (items || []).reduce((total, item) => total + Number(item[key] || 0), 0);
check(sum(data.models, "requests") === data.summary?.requests, "model request total does not match summary");
check(sum(data.workers, "requests") === data.summary?.requests, "worker request total does not match summary");
check(sum(data.daily, "requests") === data.summary?.requests, "daily request total does not match summary");
check(Math.abs(sum(data.models, "cost") - data.summary?.demoCost) < 0.001, "model cost total does not match summary");
check((data.summary?.completed || 0) + (data.summary?.failed || 0) + (data.summary?.rateLimited || 0) === data.summary?.requests, "request outcomes do not match summary");

check(pagesWorkflow.includes("workflow_dispatch"), "Pages workflow must be manually dispatched");
check(!/\bpush\s*:/m.test(pagesWorkflow), "Pages workflow must not publish on push");
check(pagesWorkflow.includes("^[0-9a-fA-F]{40}$"), "Pages workflow must require exact commit SHA");
check(pagesWorkflow.includes("cancel-in-progress: false"), "Pages deployments must not cancel an in-progress release");
check(!pagesWorkflow.includes("@v"), "GitHub Actions must be pinned to commit SHAs");

const siteFiles = await walk(join(root, "site"));
const forbiddenPatterns = [
  [/https?:\/\//i, "external HTTP(S) reference"],
  [/AKIA[0-9A-Z]{16}/, "AWS access key"],
  [/gh[pousr]_[A-Za-z0-9]{20,}/, "GitHub token"],
  [/sk-[A-Za-z0-9_-]{20,}/, "provider-style secret"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
  [/\b(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)\d{1,3}\.\d{1,3}\b/, "private network address"]
];
for (const file of siteFiles.filter(file => textExtensions.has(extname(file)))) {
  const content = await readFile(file, "utf8");
  for (const [pattern, label] of forbiddenPatterns) check(!pattern.test(content), `${label} found in ${relative(root, file)}`);
  check(!/[ \t]+$/m.test(content), `trailing whitespace found in ${relative(root, file)}`);
}

const ids = [...index.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
check(new Set(ids).size === ids.length, "duplicate HTML id found in index.html");
check((index.match(/<main\b/g) || []).length === 1, "index.html must contain exactly one main landmark");
check((index.match(/<h1\b/g) || []).length === 0, "page h1 must be supplied by the active route, not duplicated in the shell");

check(!siteFiles.some(file => /(?:^|[\\/])CNAME$/i.test(file)), "CNAME file is not used with Actions-based custom-domain setup");

if (failures.length) {
  console.error(`Static demo validation failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Static demo validation passed: ${requiredFiles.length} required files, ${requiredRoutes.length} routes, ${allRecords.length} synthetic records.`);
