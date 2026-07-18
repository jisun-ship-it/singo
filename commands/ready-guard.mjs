import { trackerBootHeaders } from './promote-target.mjs'
import { realpathSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

export const FINISHED_STATUSES = ['Finished', 'Delivered', 'Accepted']
export const BLOCK_CODE = 3

export function shouldBlockReady(status) { return FINISHED_STATUSES.includes(status) }
export function buildStatusQuery(storyId) { return `query { story(storyId: "${storyId}") { id status } }` }
export function parseStatus(json) {
  const story = json?.data?.story
  if (!story || typeof story !== 'object') return null
  return typeof story.status === 'string' ? story.status : null
}

const GRAPHQL_URL = process.env.TRACKER_BOOT_GRAPHQL_URL || 'https://trackerboot.com/api/graphql'
function readEnvKey(envFile, key) {
  if (!envFile || !existsSync(envFile)) return ''
  const line = readFileSync(envFile, 'utf8').split('\n').find((l) => l.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1).trim() : ''
}
async function fetchStatus(storyId, apiKey) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: trackerBootHeaders(apiKey),
      body: JSON.stringify({ query: buildStatusQuery(storyId) }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    return parseStatus(await res.json())
  } finally { clearTimeout(timer) }
}
const isMain = process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])
if (isMain) {
  const [, , envFile = '', storyId = ''] = process.argv
  const apiKey = readEnvKey(envFile, 'TRACKER_BOOT_API_KEY')
    || readEnvKey(`${homedir()}/.strike-trio/.env`, 'TRACKER_BOOT_API_KEY')
  if (!storyId || !apiKey) process.exit(0)
  let status = null
  try { status = await fetchStatus(storyId, apiKey) } catch { process.exit(0) }
  if (shouldBlockReady(status)) {
    process.stderr.write(`story #${storyId} is ${status} — a finished story cannot be restarted.\n`)
    process.exit(BLOCK_CODE)
  }
  process.exit(0)
}
