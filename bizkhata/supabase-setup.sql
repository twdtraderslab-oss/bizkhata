-- Run this SQL in Supabase Dashboard → SQL Editor → New Query

-- Table to store all business data per user
CREATE TABLE IF NOT EXISTS business_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) — each user sees only their own data
ALTER TABLE business_data ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own data
CREATE POLICY "Users can read own data"
  ON business_data FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own data
CREATE POLICY "Users can insert own data"
  ON business_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own data
CREATE POLICY "Users can update own data"
  ON business_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_data_updated_at
  BEFORE UPDATE ON business_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Done! Your database is ready.
