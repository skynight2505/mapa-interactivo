-- Supabase SQL Schema for Mapa Interactivo
-- Run this in your Supabase project's SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== MARKERS TABLE =====
CREATE TABLE IF NOT EXISTS markers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  severity TEXT DEFAULT 'media',
  terrain TEXT DEFAULT 'urbano',
  groups JSONB DEFAULT '[]'::jsonb,
  supplies JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_markers_type ON markers(type);
CREATE INDEX IF NOT EXISTS idx_markers_severity ON markers(severity);

-- Enable Row Level Security
ALTER TABLE markers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read markers
CREATE POLICY "Anyone can read markers"
  ON markers FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can insert markers"
  ON markers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update markers"
  ON markers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete markers"
  ON markers FOR DELETE
  USING (auth.role() = 'authenticated');

-- ===== RESCUED PERSONS TABLE =====
CREATE TABLE IF NOT EXISTS rescued_persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER DEFAULT 0,
  gender TEXT DEFAULT 'otro',
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  terrain TEXT DEFAULT 'urbano',
  rescued_at TIMESTAMPTZ DEFAULT NOW(),
  rescued_by TEXT DEFAULT '',
  condition TEXT DEFAULT 'bueno',
  notes TEXT DEFAULT '',
  verified BOOLEAN DEFAULT false,
  verification_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rescued_zone ON rescued_persons(zone_id);
CREATE INDEX IF NOT EXISTS idx_rescued_condition ON rescued_persons(condition);

ALTER TABLE rescued_persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rescued persons"
  ON rescued_persons FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert rescued persons"
  ON rescued_persons FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rescued persons"
  ON rescued_persons FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete rescued persons"
  ON rescued_persons FOR DELETE
  USING (auth.role() = 'authenticated');
