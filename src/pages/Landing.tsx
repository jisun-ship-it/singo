import { buildSlackOAuthUrl } from '../lib/slack'

const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID ?? ''
const SLACK_CALLBACK_PATH = '/.netlify/functions/slack-oauth'

const STEPS = [
  {
    number: '01',
    heading: 'Connect Slack',
    description: 'Add Singo to your workspace in one tap. It only reads the channels you pick.',
  },
  {
    number: '02',
    heading: 'Choose channels',
    description: 'Browse your channels and subscribe to the ones you want to follow along with.',
  },
  {
    number: '03',
    heading: 'Receive mirror channels',
    description: 'Singo creates a translated mirror and keeps it in sync as new messages arrive.',
  },
]

type SkeletonRow = { w1: string; w2?: string }

function MessageSkeletonCard({
  channelName,
  label,
  labelColor,
  dotColor,
  rows,
  barColor,
}: {
  channelName: string
  label: string
  labelColor: string
  dotColor: string
  rows: SkeletonRow[]
  barColor: string
}) {
  return (
    <div
      style={{
        flex: 1,
        maxWidth: 200,
        background: '#fff',
        border: '1px solid #E8E5E1',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 10px 34px rgba(31,35,40,.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: dotColor }} />
        <div style={{ fontSize: 13, fontWeight: 600 }}>{channelName}</div>
        <div
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '.06em',
            color: labelColor,
          }}
        >
          {label}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#EDEAE5',
                flex: 'none',
              }}
            />
            <div style={{ flex: 1, paddingTop: 3 }}>
              <div
                style={{
                  height: 7,
                  width: row.w1,
                  background: barColor,
                  borderRadius: 4,
                  marginBottom: row.w2 ? 6 : 0,
                }}
              />
              {row.w2 && (
                <div style={{ height: 7, width: row.w2, background: barColor, borderRadius: 4 }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TranslationPreview() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      <MessageSkeletonCard
        channelName="#product"
        label="原文"
        labelColor="#98928a"
        dotColor="#C9C4BC"
        rows={[{ w1: '82%', w2: '54%' }, { w1: '66%', w2: '40%' }, { w1: '74%' }]}
        barColor="#EAE6E0"
      />
      <div
        style={{
          width: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #E8E5E1',
            boxShadow: '0 6px 16px rgba(242,107,58,.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F26B3A',
            fontSize: 16,
          }}
        >
          →
        </div>
      </div>
      <MessageSkeletonCard
        channelName="#product-kr"
        label="번역"
        labelColor="#F26B3A"
        dotColor="#F26B3A"
        rows={[{ w1: '78%', w2: '60%' }, { w1: '62%', w2: '44%' }, { w1: '70%' }]}
        barColor="#F9DBCB"
      />
    </div>
  )
}

export function Landing() {
  const slackAuthUrl = buildSlackOAuthUrl({
    clientId: SLACK_CLIENT_ID,
    redirectUri: `${window.location.origin}${SLACK_CALLBACK_PATH}`,
  })

  return (
    <div style={{ background: '#FCFAF7', minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* Hero */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '80px 40px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr 480px',
          gap: 72,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.14em',
              color: '#F26B3A',
              marginBottom: 24,
            }}
          >
            SLACK COMPANION · TRANSLATION
          </div>
          <h1
            style={{
              fontSize: 62,
              lineHeight: 1.04,
              letterSpacing: '-.035em',
              fontWeight: 600,
              margin: '0 0 26px',
            }}
          >
            Understand every Slack conversation in your language.
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.6,
              color: '#667085',
              margin: '0 0 40px',
              maxWidth: 460,
            }}
          >
            Singo quietly mirrors the channels you choose into a language you actually read — kept
            in sync, right inside Slack.
          </p>
          <a
            href={slackAuthUrl}
            style={{
              display: 'inline-block',
              background: '#F26B3A',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 14,
              padding: '16px 28px',
              fontSize: 16,
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(242,107,58,.24)',
            }}
          >
            Connect Slack
          </a>
        </div>
        <TranslationPreview />
      </section>

      {/* 3-step section */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '90px 40px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48 }}>
          {STEPS.map((step) => (
            <div key={step.number}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#F26B3A', marginBottom: 16 }}>
                {step.number}
              </div>
              <h3
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  letterSpacing: '-.01em',
                  margin: '0 0 10px',
                }}
              >
                {step.heading}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#667085', margin: 0 }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '32px 40px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #E8E5E1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#F26B3A' }} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>Singo</span>
          <span style={{ fontSize: 14, color: '#98928a', marginLeft: 8 }}>Slack + Lingo</span>
        </div>
        <div style={{ fontSize: 13, color: '#98928a' }}>© 2026 Singo</div>
      </footer>
    </div>
  )
}
