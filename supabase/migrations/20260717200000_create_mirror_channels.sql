CREATE TABLE IF NOT EXISTS mirror_channels (
  team_id    TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  PRIMARY KEY (team_id, channel_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON mirror_channels TO service_role;
