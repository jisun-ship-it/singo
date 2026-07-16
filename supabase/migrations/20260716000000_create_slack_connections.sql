create table if not exists slack_connections (
  id uuid primary key default gen_random_uuid(),
  team_id text not null unique,
  team_name text not null,
  access_token text not null,
  bot_user_id text not null,
  created_at timestamptz not null default now()
);
