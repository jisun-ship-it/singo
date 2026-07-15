#!/bin/bash
# 출처: mitte-beat commands/_emit-pm-beat.sh (정본). 박동 도구가 바뀌면 정본을 먼저 고치고 여기 맞춘다.
# 동기화: Strike Trio 스킬이 이 파일을 그대로 깐다 — 한 글자도 고치지 않는다(드리프트 방지).
# 팀 활동 시각화 도구(파킹 안 했으면 creds가 없어 아래는 전부 무해한 no-op)를 위한 assign 흰 큐브 emit.
emit_pm_beat() {
  local action="$1" track="$2" env_file="$3" story="$4"
  local kind state
  case "$action" in
    assign) kind="pm"; state="assign" ;;
    *) return 0 ;;
  esac

  if [ "$action" = "assign" ] && [ -z "$story" ]; then
    echo "mitte-beat: skipping storyless assign for ${track} — no current story to attribute" >&2
    return 0
  fi

  [ -f "$env_file" ] || return 0

  local url secret
  url=$(grep -E '^MITTE_BEAT_INGEST_URL=' "$env_file" | head -1 | cut -d= -f2-)
  secret=$(grep -E '^MITTE_BEAT_INGEST_SECRET=' "$env_file" | head -1 | cut -d= -f2-)
  [ -n "$url" ] && [ -n "$secret" ] || return 0

  local ts id
  ts=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
  id="${kind}:${track}:${state}:${ts}"

  local story_field=""
  [ -n "$story" ] && story_field=",\"story\":\"${story}\""

  local attempt http_code curl_rc
  for attempt in 1 2 3; do
    http_code=$(curl -s -m 5 -o /dev/null -w '%{http_code}' -X POST "$url" \
      -H 'content-type: application/json' \
      -H "x-ingest-secret: ${secret}" \
      -d "{\"rows\":[{\"id\":\"${id}\",\"track\":\"${track}\",\"kind\":\"${kind}\",\"state\":\"${state}\",\"ts\":\"${ts}\"${story_field}}]}")
    curl_rc=$?
    if [ "$curl_rc" -eq 0 ] && [ "${http_code:-0}" -ge 200 ] && [ "${http_code:-0}" -lt 300 ]; then
      return 0
    fi
    [ "$attempt" -lt 3 ] && sleep 1
  done

  echo "⚠️  mitte-beat: assign 흰 큐브 emit 실패 — ${track} #${story:-?} (curl rc=${curl_rc}, http=${http_code:-none}, 시도 3회)." >&2
  echo "   비트가 적재되지 않아 딜리버리 묶음이 안 열렸을 수 있습니다. 네트워크 확인 후 수동 재발사하세요." >&2
  echo "   (커맨드는 계속 진행합니다 — emit은 블로커가 아닙니다.)" >&2
  return 0
}
