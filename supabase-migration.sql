-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This adds viewed tracking columns and a notifications table.

ALTER TABLE project_review_tickets ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT false;

ALTER TABLE potential_projects ADD COLUMN IF NOT EXISTS discovery_viewed BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);