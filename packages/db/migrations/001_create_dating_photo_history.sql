-- Create the dating_photo_history table
-- Run this against your Supabase/PostgreSQL database

CREATE TABLE IF NOT EXISTS dating_photo_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  customization JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for efficient user queries
CREATE INDEX IF NOT EXISTS idx_dating_photo_history_user_id ON dating_photo_history(user_id);
CREATE INDEX IF NOT EXISTS idx_dating_photo_history_created_at ON dating_photo_history(created_at DESC);
