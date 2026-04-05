#!/usr/bin/env bash
# 将本仓库在 GitHub 上的默认分支设为 future-dev，并尽量打开 auto-merge。
# 前提：远端已存在分支 future-dev（若尚无，可先执行：git push origin HEAD:future-dev）
# 用法：在仓库根目录执行 ./scripts/github-repo-setup.sh
# 认证（二选一）：先 gh auth login，或 export GH_TOKEN=（classic PAT 须含 repo 权限）

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

if ! command -v gh >/dev/null 2>&1; then
  echo "未安装 GitHub CLI。请安装：https://cli.github.com/ 或手动在网页设置默认分支。" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "尚未登录 GitHub CLI。请在本机执行：" >&2
  echo "  gh auth login" >&2
  echo "或设置环境变量 GH_TOKEN 后重试。" >&2
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
if [[ -z "${REPO}" ]]; then
  echo "当前目录未关联到 gh 所知的仓库，请在仓库根目录执行。" >&2
  exit 1
fi

echo "仓库: ${REPO}"

if ! git ls-remote --heads origin future-dev | grep -q .; then
  echo "远端尚无 future-dev。请先：git push origin <你的开发分支>:future-dev" >&2
  exit 1
fi

gh repo edit "${REPO}" --default-branch future-dev
echo "✓ 默认分支已设为 future-dev"

# 可选：发布 PR 时自动合并（失败则忽略，免费私有仓等可能受限）
if gh repo edit "${REPO}" --enable-auto-merge 2>/dev/null; then
  echo "✓ 已开启 Allow auto-merge"
else
  echo "（未改 auto-merge，可在 Settings → General → Pull Requests 手动打开）"
fi

echo
echo "分支保护（禁 force push 等）：Settings → Rules → Rulesets"
