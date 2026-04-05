#!/usr/bin/env node
/**
 * 管理端联调快速检查：后端 /health、Vite 管理端 /api 代理目标。
 * 用法：npm run check:management-api
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const healthUrl = 'http://localhost:3000/health';

const cfgPath = join(root, 'vite.config.management.ts');
const cfg = readFileSync(cfgPath, 'utf8');
const portMatch = cfg.match(/port:\s*(\d+)/);
const targetMatch = cfg.match(/target:\s*['"]([^'"]+)['"]/);

console.log('--- 管理端 API 联调检查 ---\n');
console.log(
  `vite.config.management.ts: 管理端 dev 端口 ≈ ${portMatch?.[1] ?? '（见文件）'}，/api 代理 → ${targetMatch?.[1] ?? '未解析'}`
);
console.log(
  '浏览器：npm run dev:management 后打开上述端口，在 Network 中确认请求路径为 /api/... 且非 HTML。\n'
);

try {
  const res = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
  const text = await res.text();
  if (!res.ok) {
    console.error(`后端 ${healthUrl} 返回 HTTP ${res.status}: ${text}`);
    process.exit(1);
  }
  console.log(`后端 ${healthUrl} → OK (${text.slice(0, 120)}${text.length > 120 ? '…' : ''})`);
} catch (e) {
  console.error(`后端 ${healthUrl} 不可达（请先启动: npm run dev --prefix backend）`);
  console.error(String(e?.message ?? e));
  process.exit(1);
}
