#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"
PR_NUMBER=$(gh pr list --head dev-jay --state open --json number --jq '.[0].number')
if [ -z "$PR_NUMBER" ]; then
  echo "❌ 열린 PR이 없습니다."
  read -n 1
  exit 1
fi

DECISION=$(gh pr view "$PR_NUMBER" --json reviews --jq '[.reviews[] | select(.state == "APPROVED" or .state == "CHANGES_REQUESTED")] | if length == 0 then "" else .[-1].state end')
if [ "$DECISION" != "APPROVED" ]; then
  echo "❌ PR #$PR_NUMBER 리뷰가 APPROVED가 아닙니다 (현재: ${DECISION:-없음})."
  echo "   PM이 코드리뷰 통과 판정 후 approve-jay.command로 승인한 뒤 다시 시도하세요."
  read -n 1
  exit 1
fi

gh pr merge "$PR_NUMBER" --squash --delete-branch
echo ""
echo "⏳ 로컬 main 동기화 중... (머지는 acceptance=main으로 — production은 Accept 후 promote)"
git fetch origin

PR_STATE=$(gh pr view "$PR_NUMBER" --json state --jq '.state')
if [ "$PR_STATE" = "MERGED" ]; then
  git push origin --force origin/main:refs/heads/dev-jay
fi

git reset --hard origin/main
echo ""
echo "✅ merge 완료 (PR #$PR_NUMBER) → acceptance 배포. production은 Accept 후 자동 발행(GitHub Actions, 최대 ~5분)."
echo "Press any key to close."
read -n 1
osascript -e 'tell application "Terminal" to close front window' &
