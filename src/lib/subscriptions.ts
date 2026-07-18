export interface Channel {
  id: string
  name: string
  subscribed: boolean
  target_language: string | null
  is_private: boolean
  num_members: number
  is_mirror: boolean
}

export interface WorkspaceInfo {
  name: string
  teamId: string
}

export interface ChannelsResponse {
  workspace: WorkspaceInfo
  channels: Channel[]
}

export async function fetchChannels(): Promise<ChannelsResponse> {
  const response = await fetch('/.netlify/functions/slack-channels')
  if (!response.ok) throw new Error('Failed to fetch channels')
  return response.json() as Promise<ChannelsResponse>
}

export async function setSubscription(channelId: string, subscribed: boolean): Promise<void> {
  const response = await fetch('/.netlify/functions/slack-channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelId, subscribed }),
  })
  if (!response.ok) throw new Error('Failed to update subscription')
}

export async function setLanguage(channelId: string, language: string): Promise<void> {
  const response = await fetch('/.netlify/functions/slack-channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelId, targetLanguage: language }),
  })
  if (!response.ok) throw new Error('Failed to update language')
}
