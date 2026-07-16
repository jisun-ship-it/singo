import { useState, useEffect } from 'react'
import { buildSlackOAuthUrl } from '../lib/slack'
import { fetchChannels, setSubscription, setLanguage, type Channel } from '../lib/subscriptions'

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Korean', label: '한국어' },
  { value: 'Japanese', label: '日本語' },
]

const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID ?? ''
const SLACK_CALLBACK_PATH = '/.netlify/functions/slack-oauth'

const BADGE_BASE = { fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '3px 9px' }
const PUBLIC_BADGE_STYLE = { ...BADGE_BASE, color: '#667085', background: '#F3F1ED' }
const PRIVATE_BADGE_STYLE = { ...BADGE_BASE, color: '#a06a2e', background: '#FBF1E6' }

export function Settings() {
  const params = new URLSearchParams(window.location.search)
  const connected = params.get('connected') === 'true'

  const slackAuthUrl = buildSlackOAuthUrl({
    clientId: SLACK_CLIENT_ID,
    redirectUri: `${window.location.origin}${SLACK_CALLBACK_PATH}`,
  })

  const [channels, setChannels] = useState<Channel[]>([])
  const [channelsError, setChannelsError] = useState<string | null>(null)

  useEffect(() => {
    if (!connected) return
    fetchChannels()
      .then(setChannels)
      .catch((err: unknown) => {
        console.error('Failed to load channels:', err)
        setChannelsError('채널 목록을 불러오지 못했습니다')
      })
  }, [connected])

  async function handleToggle(channel: Channel) {
    const next = !channel.subscribed
    setChannels((prev) => prev.map((c) => (c.id === channel.id ? { ...c, subscribed: next } : c)))
    await setSubscription(channel.id, next)
  }

  async function handleLanguageChange(channel: Channel, language: string) {
    setChannels((prev) => prev.map((c) => (c.id === channel.id ? { ...c, target_language: language } : c)))
    await setLanguage(channel.id, language)
  }

  return (
    <main>
      <h1>Settings</h1>
      <section>
        <h2>Slack Integration</h2>
        {connected ? (
          <p>Slack workspace connected. Bot is installed in your workspace.</p>
        ) : (
          <a href={slackAuthUrl}>Connect Slack</a>
        )}
      </section>
      {connected && (
        <section>
          <h2>Your channels</h2>
          <p>Subscribe to any channel and choose the language for its live mirror.</p>
          {channelsError && <p role="alert">{channelsError}</p>}
          <ul>
            {channels.map((channel) => (
              <li key={channel.id}>
                <span>#{channel.name}</span>
                <span style={channel.is_private ? PRIVATE_BADGE_STYLE : PUBLIC_BADGE_STYLE}>
                  {channel.is_private ? 'Private' : 'Public'}
                </span>
                <button onClick={() => handleToggle(channel)}>
                  {channel.subscribed ? 'Unsubscribe' : 'Subscribe'}
                </button>
                {channel.subscribed && (
                  <select
                    value={channel.target_language ?? 'English'}
                    onChange={(e) => handleLanguageChange(channel, e.target.value)}
                  >
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
