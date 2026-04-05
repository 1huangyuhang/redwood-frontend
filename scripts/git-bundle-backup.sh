#!/usr/bin/env bash
# 生成包含所有分支与标签的 git bundle，便于拷贝到网盘/U 盘。
# 用法：
#   ./scripts/git-bundle-backup.sh [输出路径]
# 默认输出：仓库父目录下 <仓库名>-YYYY-MM-DD.bundle
#
# 从 bundle 克隆（示例）：
#   git clone /path/to/repo-2026-04-05.bundle my-repo-restored
# 已有仓库拉取 bundle 中的更新：
#   git pull /path/to/repo.bundle refs/heads/*:refs/heads/*

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
NAME=$(basename "$(pwd)")
DEFAULT_OUT="$(dirname "$(pwd)")/${NAME}-$(date +%F).bundle"
OUT="${1:-$DEFAULT_OUT}"

echo "Creating bundle: $OUT"
git bundle create "$OUT" --all --tags
ls -lh "$OUT"
echo "Done. Store this file outside the project disk if possible."
