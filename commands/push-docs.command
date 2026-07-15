#!/bin/bash
# PM 문서(documents/ + CLAUDE.md)를 origin/main에 즉시 박제한다.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"
git add -A documents/ CLAUDE.md
if git diff --staged --quiet; then
  echo "📄 박제할 문서 변경이 없습니다."
else
  git commit -m "docs: persist PM documents ($(date '+%Y-%m-%d %H:%M'))"
  if git push origin main; then
    echo "✅ 문서가 origin/main에 박제됐습니다. 이제 reset에 날아가지 않습니다."
  else
    echo "❌ push 실패 — 충돌 시 'git pull --rebase origin main' 후 다시 더블클릭하세요."
  fi
fi
echo "Press any key to close."
read -n 1
osascript -e 'tell application "Terminal" to close front window' &
