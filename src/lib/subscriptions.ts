export interface Channel {
  id: string
  name: string
  subscribed: boolean
}

export async function fetchChannels(): Promise<Channel[]> {
  const response = await fetch('/.netlify/functions/slack-channels')
  if (!response.ok) throw new Error('Failed to fetch channels')
  return response.json() as Promise<Channel[]>
}

export async function setSubscription(channelId: string, subscribed: boolean): Promise<void> {
  const response = await fetch('/.netlify/functions/slack-channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelId, subscribed }),
  })
  if (!response.ok) throw new Error('Failed to update subscription')
}
