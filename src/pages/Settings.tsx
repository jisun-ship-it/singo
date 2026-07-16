import { buildSlackOAuthUrl } from '../lib/slack'

const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID ?? ''
const SLACK_CALLBACK_PATH = '/.netlify/functions/slack-oauth'

export function Settings() {
  const params = new URLSearchParams(window.location.search)
  const connected = params.get('connected') === 'true'

  const slackAuthUrl = buildSlackOAuthUrl({
    clientId: SLACK_CLIENT_ID,
    redirectUri: `${window.location.origin}${SLACK_CALLBACK_PATH}`,
  })

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
    </main>
  )
}
