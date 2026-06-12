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

-- Set up Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved comments
CREATE POLICY "Allow public read of approved comments"
  ON comments FOR SELECT
  USING (approved = TRUE);

-- Allow authenticated users to read their own pending/approved comments
CREATE POLICY "Allow users to read their own comments"
  ON comments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read of projects
CREATE POLICY "Allow public read of projects"
  ON projects FOR SELECT
  USING (TRUE);

-- Only admin can modify (via server action)
-- Note: Admin actions will be performed via server actions 
-- which bypass RLS using the service role key if needed, 
-- or we check admin email in the action.
