# 生产环境安全清单（上线前核对）

与 [P0 本地开发检查](./P0_LOCAL_DEV_CHECKLIST.md) 互补：侧重**密钥、暴露面与依赖**。

## 密钥与认证

- [ ] **`JWT_SECRET`**：至少 32 字符随机串，勿使用仓库示例值。
- [ ] **`API_KEY` / `VITE_API_KEY`**：生产使用强随机串；勿保留 `default-api-key`。
- [ ] **数据库 `DATABASE_URL`**：使用托管方推荐的连接串与 SSL；勿提交到 Git。
- [ ] **管理端**：按需配置 `MANAGEMENT_JWT_ROLES`、`MANAGEMENT_USER_READONLY`，避免普通用户误拿写权限。

## 网络与 CORS

- [ ] **`backend` CORS `origin`**：仅允许正式域名（及必要预览域），避免长期 `*` 或本地域混入生产。
- [ ] **HTTPS**：对外 API 与站点统一 TLS；Cookie（若使用）设 `Secure` / `SameSite`。

## 依赖

- [ ] 定期执行 **`npm audit`**（根目录与 `management/`）；生产依赖高危项优先修复（如 axios、react-router 等）。
- [ ] 锁定或审查 **重大版本升级**（Vite、Prisma、Express）的变更说明。

## 数据与备份

- [ ] **PostgreSQL**：托管备份与恢复演练；迁移使用 `prisma migrate deploy`。
- [ ] **BYTEA 大图**：长期建议迁对象存储 + `imageUrl`，减轻 DB 与备份压力（见 [database.md](./database.md)）。

## 运维

- [ ] 关闭或保护 **`/api-docs`**（Swagger UI）对公网暴露，或加网关认证。
- [ ] 日志中**不打密码、Token、完整连接串**。
