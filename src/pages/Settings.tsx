import { useState, useEffect } from 'react'
import { buildSlackOAuthUrl } from '../lib/slack'
import { fetchChannels, setSubscription, type Channel } from '../lib/subscriptions'

const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID ?? ''
const SLACK_CALLBACK_PATH = '/.netlify/functions/slack-oauth'

export function Settings() {
  const params = new URLSearchParams(window.location.search)
  const connected = params.get('connected') === 'true'

  const slackAuthUrl = buildSlackOAuthUrl({
    clientId: SLACK_CLIENT_ID,
    redirectUri: `${window.location.origin}${SLACK_CALLBACK_PATH}`,
  })

  const [channels, setChannels] = useState<Channel[]>([])

  useEffect(() => {
    if (!connected) return
    fetchChannels().then(setChannels).catch(() => {})
  }, [connected])

  async function handleToggle(channel: Channel) {
    const next = !channel.subscribed
    setChannels((prev) => prev.map((c) => (c.id === channel.id ? { ...c, subscribed: next } : c)))
    await setSubscription(channel.id, next)
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
          <h2>Channel Subscriptions</h2>
          <ul>
            {channels.map((channel) => (
              <li key={channel.id}>
                <span>#{channel.name}</span>
                <button onClick={() => handleToggle(channel)}>
                  {channel.subscribed ? 'Unsubscribe' : 'Subscribe'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
