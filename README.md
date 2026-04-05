# Redwood Frontend Project

企业官网（`src/`）+ 管理后台（`management/`）+ 后端 API（`backend/`）。

## 常用命令

```bash
npm install
npm run dev                    # 仅官网前端（默认 http://localhost:5173），不会自动启动后端
npm run dev:management         # 仅管理端，默认 http://localhost:3001（/api 代理到后端 3000）
npm run build                  # 官网生产构建
npm run build:management       # 管理端构建
npm run check:management-api   # 检查后端 /health 与 Vite 代理配置（联调前可跑）
npm run start:all              # 后端 + 双前端 + Prisma Studio（需本机 PostgreSQL 与 backend/.env）
```

**联调说明**：`npm run dev` 只启动官网 Vite；首页等页面从 `GET /api/site-assets?page=home` 拉取素材，需另开终端运行 `npm run dev --prefix backend`（或使用 `npm run start:all`）。更新 `siteAsset` 种子后请在 `backend` 目录执行 `npm run seed`（或项目约定的 seed 命令）再刷新页面。

管理端接口连不上时，见 [docs/management-api-troubleshooting.md](docs/management-api-troubleshooting.md)。

```bash
cd backend && npm install && npm run dev
```

环境变量参考：`backend/.env.example`、根目录 `.env.example`、`management/.env.example`。

## 目录

- `src/` — 官网
- `management/` — 管理端
- `backend/` — Express + Prisma
- `shared/` — 前后端共用 TS 模块（如错误溯源）
- `src/types/dto/` — 官网接口 DTO（与后端 JSON 对齐）+ `parse*Dto` / `mediaDisplaySrc`

## 许可证

MIT
