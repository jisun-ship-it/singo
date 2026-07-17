import { createClient } from '@supabase/supabase-js'

export async function getConnection(
  supabase: ReturnType<typeof createClient>,
): Promise<{ access_token: string; team_id: string; team_name: string; authed_user_id: string | null } | null> {
  const { data, error } = await supabase
    .from('slack_connections')
    .select('access_token, team_id, team_name, authed_user_id')
    .limit(1)
    .single()
  if (error) {
    if (error.code !== 'PGRST116') console.error('getConnection DB error:', error)
    return null
  }
  return data as { access_token: string; team_id: string; team_name: string; authed_user_id: string | null } | null
}
