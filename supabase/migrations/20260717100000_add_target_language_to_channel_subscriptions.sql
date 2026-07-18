ALTER TABLE channel_subscriptions
  ADD COLUMN IF NOT EXISTS target_language TEXT;

GRANT ALL ON channel_subscriptions TO service_role;
