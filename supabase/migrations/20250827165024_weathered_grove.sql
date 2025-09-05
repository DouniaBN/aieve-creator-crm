/*
  # Create Content Posts Table

  1. New Tables
    - `content_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_id` (uuid, foreign key to projects, optional)
      - `title` (text)
      - `platform` (text, enum: instagram, x, pinterest, tiktok, youtube, linkedin, newsletter, blog)
      - `status` (text, enum: draft, scheduled, published)
      - `scheduled_date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on content_posts table
    - Add policies for authenticated users to manage their own content
*/

-- Create content_posts table
CREATE TABLE IF NOT EXISTS content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  platform text DEFAULT 'instagram' CHECK (platform IN ('instagram', 'x', 'pinterest', 'tiktok', 'youtube', 'linkedin', 'newsletter', 'blog')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for content_posts
CREATE POLICY "Users can view own content posts"
  ON content_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content posts"
  ON content_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content posts"
  ON content_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content posts"
  ON content_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS content_posts_user_id_idx ON content_posts(user_id);
CREATE INDEX IF NOT EXISTS content_posts_project_id_idx ON content_posts(project_id);
CREATE INDEX IF NOT EXISTS content_posts_status_idx ON content_posts(status);
CREATE INDEX IF NOT EXISTS content_posts_scheduled_date_idx ON content_posts(scheduled_date);