import { describe, it, expect } from 'vitest'
import {
  productionTargetSha,
  storyFromSubject,
  buildStoryQuery,
  acceptedFromResponse,
  trackerBootHeaders,
} from '../promote-target.mjs'

describe('trackerBootHeaders', () => {
  it('uses Authorization Bearer format', () => {
    const headers = trackerBootHeaders('test-key-123')
    expect(headers).toEqual({
      'content-type': 'application/json',
      'authorization': 'Bearer test-key-123',
    })
  })

  it('does not include x-api-key', () => {
    const headers = trackerBootHeaders('any-key')
    expect(headers).not.toHaveProperty('x-api-key')
  })
})

describe('productionTargetSha', () => {
  it('returns null when no merges', () => {
    expect(productionTargetSha([], new Set())).toBeNull()
  })

  it('returns tip of consecutive accepted commits', () => {
    const merges = [
      { sha: 'aaa', ts: '2026-01-01', story: '111' },
      { sha: 'bbb', ts: '2026-01-02', story: '222' },
    ]
    expect(productionTargetSha(merges, ['111', '222'])).toBe('bbb')
  })

  it('stops at first non-accepted story', () => {
    const merges = [
      { sha: 'aaa', ts: '2026-01-01', story: '111' },
      { sha: 'bbb', ts: '2026-01-02', story: '222' },
    ]
    expect(productionTargetSha(merges, ['111'])).toBe('aaa')
  })
})

describe('storyFromSubject', () => {
  it('extracts story id from merge subject', () => {
    expect(storyFromSubject('feat: add login (#200029547) (#5)')).toBe('200029547')
  })

  it('returns null when no id present', () => {
    expect(storyFromSubject('chore: update deps')).toBeNull()
  })
})

describe('buildStoryQuery', () => {
  it('builds GraphQL query for given story ids', () => {
    const query = buildStoryQuery(['111', '222'])
    expect(query).toContain('s0: story(storyId: "111")')
    expect(query).toContain('s1: story(storyId: "222")')
  })
})

describe('acceptedFromResponse', () => {
  it('extracts accepted story ids', () => {
    const json = { data: { s0: { id: '111', status: 'Accepted' }, s1: { id: '222', status: 'Delivered' } } }
    const result = acceptedFromResponse(json)
    expect(result).toEqual(new Set(['111']))
  })

  it('returns empty set for null data', () => {
    expect(acceptedFromResponse(null)).toEqual(new Set())
  })
})
