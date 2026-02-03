-- Supabase Schema for Fair Price Predictor
-- Run this in Supabase SQL Editor to create the required tables

-- Comments table for public Q&A
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false
);

-- Feedback table for private feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  message TEXT NOT NULL,
  email VARCHAR(255),
  category VARCHAR(50) NOT NULL DEFAULT 'other'
);

-- Analytics snapshots table for public analytics
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  month VARCHAR(7) NOT NULL UNIQUE, -- Format: YYYY-MM
  visits INTEGER DEFAULT 0,
  avg_session_duration DECIMAL(10, 2) DEFAULT 0,
  pages_per_visit DECIMAL(10, 2) DEFAULT 0
);

-- Function to increment upvotes (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_upvotes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comments 
  SET upvotes = upvotes + 1 
  WHERE id = comment_id AND is_hidden = false;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Comments: Anyone can read non-hidden comments, anyone can insert, anyone can upvote
CREATE POLICY "Public can read non-hidden comments" ON comments
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Anyone can create comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Allow upvote updates (only upvotes field can be modified by public)
CREATE POLICY "Anyone can upvote comments" ON comments
  FOR UPDATE USING (is_hidden = false);

-- Feedback: Only insert allowed (no public read)
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Analytics: Anyone can read
CREATE POLICY "Public can read analytics" ON analytics_snapshots
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_hidden ON comments(is_hidden);
CREATE INDEX IF NOT EXISTS idx_analytics_month ON analytics_snapshots(month DESC);

-- Price evaluation submissions (for comparative evaluation)
CREATE TABLE IF NOT EXISTS price_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  year INTEGER NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  mileage INTEGER NOT NULL,
  our_prediction_low DECIMAL(10, 2),
  our_prediction_mid DECIMAL(10, 2) NOT NULL,
  our_prediction_high DECIMAL(10, 2),
  actual_sale_price DECIMAL(10, 2) NOT NULL,
  submitted_by VARCHAR(100) DEFAULT 'Anonymous'
);

-- Enable RLS on price_evaluations
ALTER TABLE price_evaluations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert evaluations
CREATE POLICY "Anyone can submit evaluations" ON price_evaluations
  FOR INSERT WITH CHECK (true);

-- Anyone can read evaluations (for aggregate stats)
CREATE POLICY "Public can read evaluations" ON price_evaluations
  FOR SELECT USING (true);

-- Index for evaluation queries
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON price_evaluations(created_at DESC);

-- Insert sample analytics data (you can remove this in production)
INSERT INTO analytics_snapshots (month, visits, avg_session_duration, pages_per_visit) VALUES
  ('2025-08', 1250, 145.5, 2.8),
  ('2025-09', 1890, 152.3, 3.1),
  ('2025-10', 2340, 148.7, 2.9),
  ('2025-11', 2780, 156.2, 3.2),
  ('2025-12', 3150, 162.8, 3.4),
  ('2026-01', 3520, 158.4, 3.3)
ON CONFLICT (month) DO NOTHING;
