# Singo — 환경설정 현황

*Last updated: 2026-07-15*

---

## 진행 현황

| # | 단계 | 상태 | 확정값 |
|---|------|------|--------|
| 1 | Tracker Boot 프로젝트 | ✅ | 100000283 |
| 2 | GitHub 레포 | ✅ | https://github.com/jisun-ship-it/singo |
| 3 | Netlify 사이트 | ⬜ | — |
| 4 | Slack 봇 설정 | ⬜ | — |
| 5 | Dev 이름 확정 | ⬜ | — |
| 6 | Track 파일 생성 | ⬜ | — |
| 7 | Commands 생성 | ⬜ | — |
| 8 | CLAUDE.md 업데이트 | ⬜ | — |
| 9 | 검증 | ⬜ | — |

---

## 확정된 인프라 값

| 항목 | 값 |
|------|----|
| Tracker Boot | 100000283 |
| GitHub 레포 | https://github.com/jisun-ship-it/singo |
| Netlify 사이트 | — |
| Slack Bot Token | — |
| Dev A 이름 | — |
| Dev B 이름 | — |

---

## 단계별 상세

### 1. Tracker Boot ✅
프로젝트 번호: 100000283

### 2. GitHub 레포 ✅
- 레포 이름 결정 (제안: `singo`)
- 공개/비공개 여부
- 생성 후 URL 기록

### 3. Netlify 사이트 ⬜
- GitHub 레포 연결
- 사이트 URL 기록
- main → acceptance, production → production 브랜치 설정

### 4. Slack 봇 설정 ⬜
- Slack App 생성 (api.slack.com)
- Bot Token, Signing Secret 획득
- Events API 설정
- .env에 기록

### 5. Dev 이름 확정 ⬜
- Dev A 이름 (예: `aria`, `kai`, `nova` 등)
- Dev B 이름
- track 파일 및 command 파일 이름에 사용됨

### 6. Track 파일 생성 ⬜
- `documents/tracks/dev-[a].md`
- `documents/tracks/dev-[b].md`

### 7. Commands 생성 ⬜
- `commands/ready-[a].command`
- `commands/ready-[b].command`
- `commands/pr.sh`
- `commands/approve-[a].command` / `commands/decline-[a].command`
- `commands/approve-[b].command` / `commands/decline-[b].command`
- `commands/merge-[a].command`
- `commands/merge-[b].command`
- `commands/push-docs.command`

### 8. CLAUDE.md 업데이트 ⬜
- Dev 이름 확정 후 `dev-* 시작` 트리거 항목 추가
- GitHub / Deploy URL 기록

### 9. 검증 ⬜
- ready-*.command 더블클릭 테스트
- push-docs.command 테스트
- TB API 연결 확인
