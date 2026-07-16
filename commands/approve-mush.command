#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"
PR_NUMBER=$(gh pr list --head dev-mush --state open --json number --jq '.[].number')
COUNT=$(printf '%s' "$PR_NUMBER" | grep -c .)
if [ "$COUNT" -ne 1 ]; then
  echo "❌ dev-mush에 열린 PR이 정확히 하나가 아닙니다 (개수=$COUNT). 추측하지 않고 중단 — PM 확인 요망."
  read -n 1; exit 1
fi
if ! gh pr review "$PR_NUMBER" --approve; then
  echo "❌ approve 실패 (PR #$PR_NUMBER) — 위 gh 에러 메시지 확인. (흔한 원인: PR을 연 계정과 같은 계정으로 로그인되어 자기 PR은 승인 불가)"
  read -n 1; exit 1
fi
echo "✅ approve 완료 (PR #$PR_NUMBER) — merge-mush.command로 머지하세요."
echo "Press any key to close."
read -n 1
osascript -e 'tell application "Terminal" to close front window' &
