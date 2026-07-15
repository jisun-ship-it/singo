// PR 제목 = 마지막 커밋 subject 그대로. 번호를 생성하지 않는다 — 커밋에 (#번호)가 있으면 보존, 없으면 없는 대로.
export function prTitle(commitSubject) {
  return (commitSubject || "").trim();
}
// CLI: node pr-title.mjs "<commit subject>"
if (process.argv[2] !== undefined) process.stdout.write(prTitle(process.argv[2]));
