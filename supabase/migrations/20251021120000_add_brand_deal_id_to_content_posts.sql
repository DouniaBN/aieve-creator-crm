/*
  # Add brand_deal_id to content_posts table

  1. New field
    - `brand_deal_id` (uuid, foreign key to brand_deals table, optional)

  2. Security
    - Foreign key constraint to ensure data integrity
    - Index for better performance
*/

-- Add brand_deal_id column to content_posts table
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS brand_deal_id uuid REFERENCES brand_deals(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS content_posts_brand_deal_id_idx ON content_posts(brand_deal_id);