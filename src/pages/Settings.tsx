import { useState, useEffect } from 'react'
import { buildSlackOAuthUrl } from '../lib/slack'
import {
  fetchChannels,
  setSubscription,
  setLanguage,
  type Channel,
  type WorkspaceInfo,
} from '../lib/subscriptions'

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Korean', label: '한국어' },
  { value: 'Japanese', label: '日本語' },
]

const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID ?? ''
const SLACK_CALLBACK_PATH = '/.netlify/functions/slack-oauth'

const BADGE_BASE: React.CSSProperties = { fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '3px 9px' }
const PUBLIC_BADGE_STYLE: React.CSSProperties = { ...BADGE_BASE, color: '#667085', background: '#F3F1ED' }
const PRIVATE_BADGE_STYLE: React.CSSProperties = { ...BADGE_BASE, color: '#a06a2e', background: '#FBF1E6' }

function getLangLabel(value: string): string {
  return LANGUAGE_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function WorkspaceAvatar({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: '#1F2328',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      {name[0]?.toUpperCase()}
    </div>
  )
}

export function Settings() {
  const params = new URLSearchParams(window.location.search)
  const connected = params.get('connected') === 'true'

  const slackAuthUrl = buildSlackOAuthUrl({
    clientId: SLACK_CLIENT_ID,
    redirectUri: `${window.location.origin}${SLACK_CALLBACK_PATH}`,
  })

  const [channels, setChannels] = useState<Channel[]>([])
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null)
  const [channelsError, setChannelsError] = useState<string | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!connected) return
    fetchChannels()
      .then(({ workspace: ws, channels: chs }) => {
        setWorkspace(ws)
        setChannels(chs)
      })
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
    setOpenDropdownId(null)
    await setLanguage(channel.id, language)
  }

  return (
    <>
      <header
        role="banner"
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(252,250,247,.82)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E8E5E1',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 32px',
          height: 56,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{ width: 10, height: 10, borderRadius: '50%', background: '#F26B3A', flexShrink: 0 }}
          />
          <span style={{ fontSize: 18, fontWeight: 600, color: '#1F2328' }}>Singo</span>
        </div>
        {workspace && (
          <>
            <div style={{ width: 1, height: 20, background: '#E8E5E1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <WorkspaceAvatar name={workspace.name} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1F2328' }}>{workspace.name}</span>
            </div>
          </>
        )}
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '52px 32px 96px' }}>
        {!connected && (
          <section>
            <h2>Slack Integration</h2>
            <a href={slackAuthUrl}>Connect Slack</a>
          </section>
        )}

        {connected && (
          <>
            <section>
              <h2 style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-.03em', margin: '0 0 8px' }}>Your channels</h2>
              <p style={{ fontSize: 17, color: '#667085', margin: '0 0 32px' }}>Subscribe to any channel and choose the language for its live mirror.</p>
              {channelsError && <p role="alert">{channelsError}</p>}
              <input
                type="text"
                placeholder="Search channels"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '1px solid #E8E5E1',
                  borderRadius: 14,
                  background: '#fff',
                  fontSize: 15,
                  boxSizing: 'border-box',
                  marginBottom: 16,
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F26B3A' }}
                onBlur={(e) => { e.target.style.borderColor = '#E8E5E1' }}
              />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {channels
                  .filter((c) => !c.is_mirror)
                  .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((channel) => (
                    <li
                      key={channel.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '18px 4px',
                        borderBottom: '1px solid #EDEAE5',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>#{channel.name}</div>
                        <div style={{ fontSize: 13, color: '#98928a', marginTop: 2 }}>{channel.num_members} members</div>
                      </div>
                      <span style={channel.is_private ? PRIVATE_BADGE_STYLE : PUBLIC_BADGE_STYLE}>
                        {channel.is_private ? 'Private' : 'Public'}
                      </span>

                      {channel.subscribed ? (
                        <>
                          <button
                            onClick={() => handleToggle(channel)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: '#98928a',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontSize: 14,
                            }}
                          >
                            Unsubscribe
                          </button>

                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() =>
                                setOpenDropdownId(openDropdownId === channel.id ? null : channel.id)
                              }
                              style={{
                                background: '#fff',
                                border: '1px solid #E8E5E1',
                                borderRadius: 11,
                                padding: '9px 13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 14,
                              }}
                            >
                              <span style={{ color: '#3a9e6a' }}>✓</span>
                              {getLangLabel(channel.target_language ?? 'English')}
                              <span style={{ fontSize: 10 }}>▾</span>
                            </button>

                            {openDropdownId === channel.id && (
                              <ul
                                role="listbox"
                                style={{
                                  position: 'absolute',
                                  top: 'calc(100% + 4px)',
                                  left: 0,
                                  background: '#fff',
                                  borderRadius: 14,
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                                  padding: '6px 0',
                                  margin: 0,
                                  listStyle: 'none',
                                  minWidth: 140,
                                  zIndex: 200,
                                }}
                              >
                                {LANGUAGE_OPTIONS.map((opt) => (
                                  <li
                                    key={opt.value}
                                    role="option"
                                    aria-selected={(channel.target_language ?? 'English') === opt.value}
                                    onClick={() => handleLanguageChange(channel, opt.value)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 14px',
                                      cursor: 'pointer',
                                      fontSize: 14,
                                    }}
                                  >
                                    {opt.label}
                                    {(channel.target_language ?? 'English') === opt.value && (
                                      <span style={{ color: '#F26B3A' }}>✓</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => handleToggle(channel)}
                          style={{
                            background: '#1F2328',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 11,
                            padding: '10px 18px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Subscribe
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
            </section>

            {channels.some((c) => c.is_mirror) && (
              <section style={{ marginTop: 48 }}>
                <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.02em', margin: '0 0 8px' }}>Mirrored channels</h2>
                <p style={{ fontSize: 15, color: '#667085', margin: '0 0 24px' }}>These channels are managed by Singo and cannot be subscribed to directly.</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {channels
                    .filter((c) => c.is_mirror)
                    .map((channel) => (
                      <li
                        key={channel.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          padding: '18px 4px',
                          borderBottom: '1px solid #EDEAE5',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>#{channel.name}</div>
                          <div style={{ fontSize: 13, color: '#98928a', marginTop: 2 }}>{channel.num_members} members</div>
                        </div>
                        <span style={channel.is_private ? PRIVATE_BADGE_STYLE : PUBLIC_BADGE_STYLE}>
                          {channel.is_private ? 'Private' : 'Public'}
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}
