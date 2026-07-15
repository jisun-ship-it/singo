#!/bin/bash
REPO_URL="https://github.com/jisun-ship-it/singo.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKTREE="$HOME/Documents/Claude/Worktrees/$(basename "$REPO_DIR")-jay"

git -C "$REPO_DIR" worktree prune 2>/dev/null

if [ ! -d "$WORKTREE" ]; then
  mkdir -p "$(dirname "$WORKTREE")"
  git -C "$REPO_DIR" fetch origin
  git -C "$REPO_DIR" worktree add "$WORKTREE" -B dev-jay origin/main 2>/dev/null || \
  git -C "$REPO_DIR" worktree add "$WORKTREE" dev-jay 2>/dev/null
else
  git -C "$REPO_DIR" fetch origin
  git -C "$WORKTREE" reset --hard origin/main
  git -C "$WORKTREE" clean -fd 2>/dev/null
fi

mkdir -p "$WORKTREE/documents/tracks"
ln -sf "$REPO_DIR/documents/tracks/dev-jay.md" "$WORKTREE/documents/tracks/dev-jay.md"

STORY=$(awk '/^## 현재 스토리/{f=1;next} f&&match($0,/#[0-9]+/){print substr($0,RSTART+1,RLENGTH-1);exit}' "$REPO_DIR/documents/tracks/dev-jay.md")

node "$SCRIPT_DIR/ready-guard.mjs" "$REPO_DIR/.env" "$STORY"
if [ "$?" -eq 3 ]; then
  echo "⚠️ 종결된 스토리입니다 — ready를 중단합니다. 새 스토리를 할당한 뒤 다시 실행하세요." >&2
  exit 1
fi

BEAT_HELPER="$SCRIPT_DIR/_emit-pm-beat.sh"
[ -f "$BEAT_HELPER" ] && source "$BEAT_HELPER"

if [ -f "$REPO_DIR/.env" ]; then
  if grep -q '^MITTE_BEAT_TRACK=' "$REPO_DIR/.env"; then
    sed 's/^MITTE_BEAT_TRACK=.*/MITTE_BEAT_TRACK=jay/' "$REPO_DIR/.env" > "$WORKTREE/.env"
  else
    { cat "$REPO_DIR/.env"; echo "MITTE_BEAT_TRACK=jay"; } > "$WORKTREE/.env"
  fi
  if [ -n "$STORY" ]; then
    grep -v '^MITTE_BEAT_STORY=' "$WORKTREE/.env" > "$WORKTREE/.env.tmp" && mv "$WORKTREE/.env.tmp" "$WORKTREE/.env"
    echo "MITTE_BEAT_STORY=$STORY" >> "$WORKTREE/.env"
  fi
fi

command -v emit_pm_beat >/dev/null 2>&1 && emit_pm_beat assign jay "$REPO_DIR/.env" "$STORY"

cd "$WORKTREE"
claude "dev-jay 시작"
