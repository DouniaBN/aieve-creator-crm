/*
  # Creator CRM Database Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_name` (text)
      - `brand_name` (text)
      - `description` (text)
      - `amount` (numeric)
      - `status` (text)
      - `due_date` (date)
      - `created_at` (timestamp)
    
    - `invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `invoice_number` (text, unique)
      - `client_name` (text)
      - `amount` (numeric)
      - `due_date` (date)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `brand_deals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `brand_name` (text)
      - `contact_name` (text)
      - `contact_email` (text)
      - `deliverables` (text)
      - `fee` (numeric)
      - `status` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  brand_name text NOT NULL,
  description text DEFAULT '',
  amount numeric DEFAULT 0,
  status text DEFAULT 'idea' CHECK (status IN ('idea', 'negotiation', 'in-progress', 'submitted', 'paid')),
  due_date date,
  created_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number text UNIQUE NOT NULL,
  client_name text NOT NULL,
  amount numeric DEFAULT 0,
  due_date date,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  created_at timestamptz DEFAULT now()
);

-- Create brand_deals table
CREATE TABLE IF NOT EXISTS brand_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_name text NOT NULL,
  contact_name text DEFAULT '',
  contact_email text DEFAULT '',
  deliverables text DEFAULT '',
  fee numeric DEFAULT 0,
  status text DEFAULT 'negotiation' CHECK (status IN ('negotiation', 'confirmed', 'completed', 'cancelled')),
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_deals ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for invoices
CREATE POLICY "Users can view own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for brand_deals
CREATE POLICY "Users can view own brand deals"
  ON brand_deals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand deals"
  ON brand_deals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand deals"
  ON brand_deals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand deals"
  ON brand_deals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS brand_deals_user_id_idx ON brand_deals(user_id);
CREATE INDEX IF NOT EXISTS brand_deals_status_idx ON brand_deals(status);