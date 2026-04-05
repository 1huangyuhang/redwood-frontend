# 林之源红木美学空间 · 前端 UI 与设计令牌体系

本文档是主站（`src/`）**视觉与 CSS 变量的单一真源说明**，与实现文件同步维护。全仓拓扑与迭代阶段见 [../PROJECT_ARCHITECTURE.md](../PROJECT_ARCHITECTURE.md)。

## 1. 设计原则

- **品牌**：暖米、浅棕、低饱和朱红；避免冷灰/冷蓝大块铺底。
- **层级**：L0 画布 → L1 抬升区 → L2 卡片，同色相微差，软阴影、弱描边。
- **工程**：新增布局/表面相关类名统一 **`ly-`** 前缀，便于整批删除回滚。
- **动效**：统一使用 `--motion-duration-md` 等；尊重 `prefers-reduced-motion`。
- **例外**：`/login` 不在 `Layout` 内，不强制 `top-layout` 规则；演示页可标注为例外。
- **首页**：`Home` 含全宽画廊与视频区，根节点**不**加 `ly-container`，避免破坏出血布局；版心需求用区块内自行约束。

## 2. 运行时 CSS 变量（令牌表）

定义位置：`src/assets/styles/tokens/ly-surfaces.less`（`html[data-theme='light'|'dark']`）、`src/assets/styles/tokens/theme-css.less`。

### 2.1 三级表面（`--ly-*`）

| 变量                                          | 职责                                                          |
| --------------------------------------------- | ------------------------------------------------------------- |
| `--ly-bg-canvas`                              | L0：与 `body` 画布基准色同系（见 `surface-system.less` 混入） |
| `--ly-bg-raised`                              | L1：大节、工具栏、分组面板                                    |
| `--ly-bg-raised-hover`                        | L1 hover：表格行等微抬升                                      |
| `--ly-bg-card`                                | L2：卡片、表格内容区、弹层内容面                              |
| `--ly-border-subtle`                          | 同色系弱描边                                                  |
| `--ly-shadow-card` / `--ly-shadow-card-hover` | 软阴影                                                        |
| `--ly-radius-md` / `--ly-radius-lg`           | 圆角档位                                                      |

### 2.2 版心

| 变量 / 类                                    | 职责                                |
| -------------------------------------------- | ----------------------------------- |
| `--ly-container-max` / `--ly-container-wide` | 最大宽度 1200px / 1320px            |
| `--ly-container-pad-x`                       | 水平安全区 `clamp(16px, 4vw, 32px)` |
| `.ly-container` / `.ly-container--wide`      | 页面根或区块版心工具类              |

### 2.3 页脚（`--ly-footer-*`）

`--ly-footer-bg`、`--ly-footer-border`、`--ly-footer-text`、`--ly-footer-muted`、`--ly-footer-divider`、`--ly-footer-accent` — 仅 [`SiteFooter`](../../src/components/business/SiteFooter/SiteFooter.less) 使用，不写死 hex。

### 2.4 文案、排版与动效（`--app-*`）

见 `theme-css.less`：`--app-text-*`、`--app-heading`、`--type-*`、`--leading-*`、`--motion-*`。

### 2.5 卡片兼容别名（`--app-card-*`）

**仅指向 `--ly-*`**，供 `global.less` 等历史选择器使用；禁止再分叉独立色值。

### 2.6 与 Ant Design 对齐

修改 `--ly-bg-card` / 画布相关变量时，**同步**检查 [`src/config/antdTheme.ts`](../../src/config/antdTheme.ts) 的 `colorBgLayout`、`colorBgContainer`、`colorText*`。

## 3. 样式文件分层与 import 规则

| 层级                        | 职责                                                                                            | 入口 / 约定                                                                                                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **应用级全局**              | 全站只加载一次：`--ly-*` / `theme-css`、排版系统、工具类、首页营销区、Ant 桥接、`body` 画布覆盖 | 仅由 [`src/main.tsx`](../../src/main.tsx) 引入 [`global.less`](../../src/assets/styles/global.less)                                                                                                                                                                            |
| **Foundation（Less 变量）** | 编译期 `@变量`（聚合自 `tokens/semantic-palette.less`），**不输出规则**                         | 各页面/组件 Less：`@import (reference) '@/assets/styles/foundation/index.less';`                                                                                                                                                                                               |
| **模块全局**                | 同一路由域多页共用（混入或块样式）                                                              | 例：[`src/pages/Home/styles/home.global.less`](../../src/pages/Home/styles/home.global.less)（由 `global.less` 引入，**勿**在其它 chunk 再 import）、[`src/pages/Company/styles/company.global.less`](../../src/pages/Company/styles/company.global.less)（由子页显式 import） |
| **局部**                    | 单页或单组件                                                                                    | `pages/**/index.less`、`components/**/*.less`，根选择器挂在页面/组件 class 下                                                                                                                                                                                                  |

**禁止**：为使用 `@primary-color` 等而 `@import` 整份 `global.less`（会重复打包且顺序不可控）。**管理端** `management/` 仍沿用 `admin-shell.less`，若要对齐本约定可后续单独拆 `foundation/`。

### 3.1 页面模块目录（MarketingPageShell）

| 项           | 约定                                                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 营销壳       | [`MarketingPageShell`](../../src/components/page-shell/MarketingPageShell.tsx)：`ly-container`（可选 `wide`）+ 首块玻璃 hero；**Dashboard 等工具页不使用**                                                                           |
| 路由入口     | `pages/<Route>/index.tsx` 以组合为主：`MarketingPageShell` + `*View`                                                                                                                                                                 |
| 视图与数据   | `*View.tsx` 承载主体 UI；异步列表等抽 `use*.ts`（如 `useShopPage`）                                                                                                                                                                  |
| Hero 变体    | 默认 `.page-title`；活动页等用 `defaultHeroClass="page-header"`；账户页 `account-page-title`；应用聚合页用 `customHeader`（如 `.applications-hero`）                                                                                 |
| 玻璃样式锚点 | `.marketing-page-shell` 首子节点，见 [`ly-mahogany-glass-pages.less`](../../src/assets/styles/ly-mahogany-glass-pages.less)                                                                                                          |
| 懒加载       | [`router.tsx`](../../src/router.tsx) 使用 `React.lazy`；[`Layout`](../../src/components/business/Layout/index.tsx) 内 `Outlet` 外包 `Suspense`；[`App.tsx`](../../src/App.tsx) 对 `RouterProvider` 再包一层 `Suspense`               |
| 动效组件演示 | 见首页 [`Home/sections/`](../../src/pages/Home/sections/) 内 `AnimatedImage`；独立 demo 页已移除以降低维护面                                                                                                                         |
| 首页         | [`Home/index.tsx`](../../src/pages/Home/index.tsx) **不**使用 `MarketingPageShell`；区块拆至 [`Home/sections/`](../../src/pages/Home/sections/)，站点素材与兜底数据在 `Home` 内 `useQuery` + `useMemo` 组装后以 props 传入各 section |

## 4. 模板边界（全局 — 页面 — 组件）

**继承优先级（高 → 低）**

1. `html[data-theme]` 上 `--ly-*` / `--app-*`
2. `buildAntdAppTheme`（ConfigProvider）
3. `global.less` 与 `.top-layout` 下 Ant 补丁（含 `ly-ant-background-bridge.less`）
4. 页面根 class（如 `.shop-page`）
5. 组件目录 `index.less`

| 层级   | 职责                                        | 落地                                                 |
| ------ | ------------------------------------------- | ---------------------------------------------------- |
| 全局壳 | 顶栏、`site-main`、`Outlet`、全站页脚、主题 | `Layout/index.tsx`、`Layout/index.less`              |
| 页面   | 版心、页内区块、仅本路由样式                | `src/pages/**/index.less`，选择器挂在页面根 class 下 |
| 组件   | 可复用块                                    | `SiteFooter`、`Layout` 子块、`components/ui/*`       |

**禁止**：在页面 less 中修改 `html`/`body` 或覆盖根级 `--app-text-primary`；在 Layout.less 中写某一页独有模块样式。

## 5. 工具类（增量）

- `.ly-surface-page` / `.ly-surface-card`：L1/L2 表面组合
- `.ly-card-interactive`：卡片 hover 微抬升（遵守 reduced-motion）

## 6. Ant 容器补洞

[`src/assets/styles/ly-ant-background-bridge.less`](../../src/assets/styles/ly-ant-background-bridge.less) 在 `.top-layout` 内统一 Table、Modal、Drawer、List 等背景与 `ly` token；由 `global.less` 尾部 import。**回滚**：删除该 import。

## 7. 双模式验收清单（抽检）

- [ ] 明亮：首页、商店、联系、公司子页 — L0/L1/L2 无冷色孤岛、无刺眼纯白大块
- [ ] 黑暗：同上 — 无死黑、卡片与表格可读
- [ ] 切换主题：无整页闪白；Modal/Table 背景不断冷灰层
- [ ] 全站仅一条页脚（`Layout` 内 `SiteFooter`）
- [ ] 路由、登录、购物车、主题切换、表单与改动前行为一致

## 8. 构建与类型检查

- 主站快速验证：`npx vite build`
- 全仓 `npm run build` 若包含 `management`，需单独处理 management 的 TS 路径与类型债

## 9. 相关文件索引

| 文件                                               | 说明                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/assets/styles/foundation/index.less`          | Less `@变量` 唯一 reference 入口                                           |
| `src/assets/styles/tokens/semantic-palette.less`   | 语义色与版心（由 foundation 聚合）                                         |
| `src/assets/styles/base/layout.less`               | `*`、`#root` 基础盒模型                                                    |
| `src/assets/styles/utilities/*`                    | 全站工具类、页脚文案类、按钮/卡片、keyframes                               |
| `src/pages/Home/styles/home.global.less`           | 首页营销区块（由 `global.less` 引入）                                      |
| `src/pages/Company/styles/company.global.less`     | 公司子域共用混入                                                           |
| `src/assets/styles/tokens/ly-surfaces.less`        | L0–L2、页脚、版心、工具类                                                  |
| `src/assets/styles/tokens/theme-css.less`          | 文案、排版、动效、`--app-card-*`                                           |
| `src/assets/styles/surface-system.less`            | body 画布混入                                                              |
| `src/assets/styles/global.less`                    | 应用级全局聚合入口（tokens → 排版 → base → 模块/工具 → adaptive → bridge） |
| `src/assets/styles/ly-ant-background-bridge.less`  | Ant 表面对齐                                                               |
| `src/assets/styles/ly-mahogany-glass-pages.less`   | 红木暖色内页标题区玻璃拟态（仅 `main` 内）                                 |
| `src/config/antdTheme.ts`                          | Ant token                                                                  |
| `src/App.tsx`                                      | `data-theme`、`theme-color` meta                                           |
| `src/components/business/Layout/*`                 | 全局壳、`Outlet` + `Suspense`                                              |
| `src/components/page-shell/MarketingPageShell.tsx` | 营销页版心与 hero                                                          |
| `src/router.tsx`                                   | 懒加载子页、开发环境演示路由                                               |
| `src/components/business/SiteFooter/*`             | 全站页脚                                                                   |
