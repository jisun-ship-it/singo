#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"
BODY_FILE="$REPO_DIR/.review-body.md"
if [ ! -f "$BODY_FILE" ]; then echo "❌ .review-body.md가 없습니다. 지적 본문을 먼저 작성하세요."; read -n 1; exit 1; fi
PR_NUMBER=$(gh pr list --head dev-jay --state open --json number --jq '.[].number')
COUNT=$(printf '%s' "$PR_NUMBER" | grep -c .)
if [ "$COUNT" -ne 1 ]; then
  echo "❌ dev-jay에 열린 PR이 정확히 하나가 아닙니다 (개수=$COUNT). 추측하지 않고 중단 — PM 확인 요망."
  read -n 1; exit 1
fi
echo "── 제출할 리뷰 본문 (PR #$PR_NUMBER) ──"; cat "$BODY_FILE"; echo "────────────────────"
read -p "이대로 제출? (y/n) " CONFIRM
if [ "$CONFIRM" != "y" ]; then echo "취소 — 제출하지 않았습니다."; read -n 1; exit 0; fi
gh pr review "$PR_NUMBER" --request-changes --body-file "$BODY_FILE"
echo "✅ request-changes 제출 완료 (PR #$PR_NUMBER)"
echo "Press any key to close."
read -n 1
osascript -e 'tell application "Terminal" to close front window' &
