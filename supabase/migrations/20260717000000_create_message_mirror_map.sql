CREATE TABLE IF NOT EXISTS message_mirror_map (
  source_channel TEXT NOT NULL,
  source_ts      TEXT NOT NULL,
  mirror_channel TEXT NOT NULL,
  mirror_ts      TEXT NOT NULL,
  PRIMARY KEY (source_channel, source_ts)
);
