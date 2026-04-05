/**
 * 校验 menuConfig 中的 path 均在 main.tsx 的 <Routes> 中有对应路由（规范 §4）。
 * 用法：node scripts/verify-management-menu-routes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const menuFile = path.join(root, 'management/src/config/menuConfig.tsx');
const mainFile = path.join(root, 'management/src/main.tsx');

const menuSrc = fs.readFileSync(menuFile, 'utf8');
const mainSrc = fs.readFileSync(mainFile, 'utf8');

const menuPaths = new Set();
for (const m of menuSrc.matchAll(/path:\s*'([^']+)'/g)) {
  menuPaths.add(m[1]);
}

const routePaths = new Set();
for (const m of mainSrc.matchAll(/<Route\s+path="([^"]+)"/g)) {
  routePaths.add(m[1]);
}

const hasLayoutIndex = /<Route\s+index\s/.test(mainSrc);
const errors = [];

if (menuPaths.has('/') && !hasLayoutIndex) {
  errors.push('菜单含 "/" 但 main.tsx 中缺少 <Route index ...>（工作台）');
}

for (const p of menuPaths) {
  if (p === '/') continue;
  const seg = p.startsWith('/') ? p.slice(1) : p;
  if (!routePaths.has(seg)) {
    errors.push(`菜单 path "${p}" 无对应路由 segment "${seg}"`);
  }
}

if (errors.length) {
  console.error('[check:management-routes] 菜单与路由不一致：\n', errors.join('\n'));
  process.exit(1);
}

console.log(
  '[check:management-routes] OK：',
  menuPaths.size,
  '条菜单 path 均已挂载路由'
);
