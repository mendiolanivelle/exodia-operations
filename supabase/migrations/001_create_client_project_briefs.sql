CREATE TABLE client_project_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Section 1: Basic Project Information
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  point_of_contact TEXT,
  email_address TEXT,
  project_type TEXT[],
  project_type_other TEXT,
  target_platform TEXT[],
  target_platform_other TEXT,
  timezone TEXT,
  expected_start_date DATE,
  expected_deadline DATE,
  budget_range TEXT,
  project_document_link TEXT,

  -- Section 2: Deliverables (array of objects)
  deliverables JSONB DEFAULT '[]'::jsonb,

  -- Section 3: Review & Approval
  reviewer TEXT[],
  reviewer_other TEXT,
  review_rounds TEXT,
  expected_review_time TEXT,
  approval_basis TEXT[],

  -- Section 4: Project Governance
  communication_tool TEXT[],
  communication_tool_other TEXT,
  weekly_target_meeting TEXT[],
  preferred_meeting_time TEXT,
  preferred_meeting_time_other TEXT,
  daily_team_syncup TEXT[],
  preferred_syncup_time TEXT,
  preferred_syncup_time_other TEXT,
  training_onboarding TEXT[],

  -- Section 5: Technical Details
  game_engine TEXT[],
  game_engine_other TEXT,
  technical_requirements TEXT,
  tools_software TEXT,
  performance_constraints TEXT,

  -- Section 6: Client Confirmation
  client_signature TEXT,
  signature_date DATE,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected'))
);

CREATE INDEX idx_client_project_briefs_status ON client_project_briefs (status);
CREATE INDEX idx_client_project_briefs_created_at ON client_project_briefs (created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_client_project_briefs_updated_at
  BEFORE UPDATE ON client_project_briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE client_project_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read client project briefs"
  ON client_project_briefs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert client project briefs"
  ON client_project_briefs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update client project briefs"
  ON client_project_briefs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);