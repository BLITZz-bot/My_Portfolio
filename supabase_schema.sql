-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- Linked to authenticated user
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  designation TEXT, -- New field for Designation (HOD, Principal, etc.)
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  link TEXT,
  github TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_settings table
CREATE TABLE portfolio_settings (
  id INT PRIMARY KEY DEFAULT 1,
  about_text TEXT,
  projects_built INT DEFAULT 0,
  hackathons_won INT DEFAULT 0,
  awards_won INT DEFAULT 0,
  location TEXT DEFAULT 'Bangkok, Thailand',
  location_status TEXT DEFAULT 'Working remotely worldwide.'
);

-- Seed initial settings
INSERT INTO portfolio_settings (id, about_text, projects_built, hackathons_won, awards_won)
VALUES (1, 'Computer Science student passionate about full-stack development, AI, and building modern digital experiences.', 12, 4, 1)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read of approved comments" ON comments FOR SELECT USING (approved = TRUE);
CREATE POLICY "Allow public read of projects" ON projects FOR SELECT USING (TRUE);
CREATE POLICY "Allow public read of settings" ON portfolio_settings FOR SELECT USING (TRUE);

-- Allow authenticated users to read their own comments
CREATE POLICY "Allow users to read their own comments" ON comments FOR SELECT TO authenticated USING (auth.uid() = user_id);
