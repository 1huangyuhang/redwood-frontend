#!/usr/bin/env bash
# 将当前工作区提交并推送到 origin（防未推送丢失）。尊重 .gitignore。
# 用法：
#   ./scripts/git-checkpoint.sh
# 环境变量：
#   CHECKPOINT_REMOTE — 远程名，默认 origin
# 定时：macOS 可用 launchd，Linux 可用 cron。

set -euo pipefail

REMOTE="${CHECKPOINT_REMOTE:-origin}"
cd "$(git rev-parse --show-toplevel)"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository." >&2
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == "HEAD" ]]; then
  echo "Detached HEAD; checkout a branch before checkpoint." >&2
  exit 1
fi

TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
HOST=$(hostname -s 2>/dev/null || hostname 2>/dev/null || echo "machine")

if git diff --quiet && git diff --cached --quiet; then
  echo "Working tree clean; syncing remote with: git push $REMOTE $BRANCH"
  git push "$REMOTE" "$BRANCH" || true
  exit 0
fi

git add -A
git commit -m "chore(checkpoint): ${TS} (${HOST}) on ${BRANCH}"

echo "Pushing $BRANCH to $REMOTE ..."
git push "$REMOTE" "$BRANCH"

echo "Checkpoint done."
