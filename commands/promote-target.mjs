import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export function productionTargetSha(mergeCommits, acceptedStoryIds) {
  const accepted = new Set([...(acceptedStoryIds ?? [])].map(String))
  const ordered = (mergeCommits ?? [])
    .filter((m) => m && m.sha && m.story != null)
    .sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
  let tip = null
  for (const m of ordered) {
    if (!accepted.has(String(m.story))) break
    tip = m.sha
  }
  return tip
}
export function storyFromSubject(subject) { const m = (subject || '').match(/#(\d{9,})/); return m ? m[1] : null }
export function buildStoryQuery(ids) {
  return `query { ${ids.map((id, i) => `s${i}: story(storyId: "${id}") { id status } `).join(' ')} }`
}
export function acceptedFromResponse(json) {
  const data = json?.data
  if (!data || typeof data !== 'object') return new Set()
  return new Set(Object.values(data).filter((s) => s?.status === 'Accepted').map((s) => String(s.id)))
}
function readEnvKey(envFile, key) {
  if (!envFile || !existsSync(envFile)) return ''
  const line = readFileSync(envFile, 'utf8').split('\n').find((l) => l.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1).trim() : ''
}
const GRAPHQL_URL = process.env.TRACKER_BOOT_GRAPHQL_URL || 'https://trackerboot.com/analytics/graphql'
const isMain = process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])
if (isMain) {
  const [, , repoDir = '.', envFile = ''] = process.argv
  let log = ''
  try {
    log = execFileSync('git', ['-C', repoDir, 'log', 'origin/production..origin/main', '--pretty=format:%H|%cI|%s'], { encoding: 'utf8' })
  } catch { process.exit(0) }
  const merges = log.split('\n').filter(Boolean).map((line) => {
    const [sha, ts, ...rest] = line.split('|')
    return { sha, ts, story: storyFromSubject(rest.join('|')) }
  })
  const storyIds = [...new Set(merges.map((m) => m.story).filter(Boolean))]
  if (storyIds.length === 0) process.exit(0)
  const apiKey = readEnvKey(envFile, 'TRACKER_BOOT_API_KEY') || process.env.TRACKER_BOOT_API_KEY
  if (!apiKey) process.exit(0)
  let accepted = new Set()
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ query: buildStoryQuery(storyIds) }),
    })
    if (res.ok) accepted = acceptedFromResponse(await res.json())
    else process.exit(0)
  } catch { process.exit(0) }
  const tip = productionTargetSha(merges, accepted)
  if (tip) process.stdout.write(tip)
}
