# 企业管理系统：数据接口与联调排查

## 一键检查

```bash
npm run check:management-api
```

会请求 `http://localhost:3000/health` 并打印 `vite.config.management.ts` 里管理端端口与 `/api` 代理目标。后端未启动时命令以非零退出（便于 CI）。

## 开发环境链路

1. 启动后端：`npm run dev --prefix backend`（默认端口 **3000**，见 `backend/.env` 的 `PORT`）。
2. 启动管理端：`npm run dev:management`（默认 **3001**，见仓库根目录 `vite.config.management.ts`）。
3. 管理端 HTTP：`management/src/services/axiosInstance.ts` 在 **开发** 下使用 `baseURL: '/api'`，由 Vite 代理到 `http://localhost:3000`。
4. 管理端 WebSocket：开发下默认连 **`ws://localhost:3000`**；若设置 `VITE_API_BASE_URL`，则从其解析 **主机**（须指向后端，不要填 3001/3002 前端端口）。

## 按 Network 现象排查

| 现象                                          | 常见原因                                    |
| --------------------------------------------- | ------------------------------------------- |
| 请求失败、`ECONNREFUSED`、502、长时间 pending | 后端未起、端口不是 3000、代理 `target` 错误 |
| 401、`Invalid API key`                        | 前端 `VITE_API_KEY` 与后端 `API_KEY` 不一致 |
| 401、`AUTH_REQUIRED` / 令牌相关               | 未登录或 JWT 过期                           |
| 403、`MANAGEMENT_ROLE_FORBIDDEN`              | JWT 角色不在后端 `MANAGEMENT_JWT_ROLES`     |
| 403、`USER_READ_ONLY`                         | 只读运营账号调用了写接口                    |
| 429                                           | 限流；GET 会重试，仍失败需降低请求频率      |

## 生产 / 静态部署

构建命令：`npm run build:management`。

- **方式 A（推荐）**：管理站点与 API **同源**，由 Nginx（等）把路径 `/api` 反代到后端。此时**不必**设置 `VITE_API_BASE_URL`，前端仍使用相对路径 `/api`。
- **方式 B**：API 在另一域名。构建前在 `management/.env` 中设置 `VITE_API_BASE_URL`（例如 `https://api.example.com/api`），生产构建后 axios 会使用该完整根地址；**同时** WebSocket 会从该 URL 解析主机（`https` → `wss`）。后端 Socket.IO 的 CORS `origin` 需包含管理端页面源。

### Nginx 示例（方式 A）

```nginx
server {
  listen 443 ssl;
  server_name admin.example.com;

  location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    root /var/www/management-dist;
    try_files $uri $uri/ /index.html;
  }
}
```

## 环境变量对照

| 后端 `backend/.env`          | 管理端构建/开发 `management/.env`                         |
| ---------------------------- | --------------------------------------------------------- |
| `API_KEY`                    | `VITE_API_KEY`（须一致）                                  |
| `MANAGEMENT_JWT_ROLES`       | `VITE_MANAGEMENT_JWT_ROLES`（须一致）                     |
| `MANAGEMENT_USER_READONLY=1` | `VITE_MANAGEMENT_USER_READONLY=1`（可选，与只读提示一致） |
| `PORT=3000`                  | 开发时 HTTP 走 Vite 代理，一般不必改                      |

勿将根目录 `.env` 里误设的 `VITE_API_BASE_URL=http://localhost:3001/api`（前端端口）当作后端地址；管理端 Vite 的 env 根目录为 `management/`（使用根目录 `vite.config.management.ts` 时）。
