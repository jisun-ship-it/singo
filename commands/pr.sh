#!/bin/bash
# 봇 명의 PR 생성. Dev 세션에서 PM "PR해" 지시에 실행: bash commands/pr.sh <track>
TRACK="$1"
if [ -z "$TRACK" ]; then echo "usage: pr.sh <track>"; exit 1; fi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"
git worktree prune 2>/dev/null

[ -f .env ] && set -a && . ./.env && set +a
[ -z "$DEVBOT_TOKEN" ] && [ -f "$HOME/.strike-trio/.env" ] && set -a && . "$HOME/.strike-trio/.env" && set +a
BOT_TOKEN="${DEVBOT_TOKEN}"
if [ -z "$BOT_TOKEN" ]; then
  echo "❌ 봇 토큰(DEVBOT_TOKEN)이 프로젝트 .env·전역 ~/.strike-trio/.env 어디에도 없습니다. un-botted PR을 열지 않습니다 —"
  echo "   작성자=승인자가 되면 머지 approve 게이트가 죽습니다. PM에게 알리세요."
  exit 1
fi

TITLE=$(node "$REPO_DIR/commands/pr-title.mjs" "$(git -C "$REPO_DIR" log -1 --format=%s "dev-$TRACK")")

GH_TOKEN="$BOT_TOKEN" gh pr create --base main --head "dev-$TRACK" --title "$TITLE" --body ""
