-- Test invoice data for Supabase
-- Run this in your Supabase SQL Editor

-- First, get a user ID (replace with your actual user ID from auth.users table)
-- You can find your user ID by running: SELECT id FROM auth.users LIMIT 1;

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
INSERT INTO invoices (user_id, invoice_number, client_name, amount, due_date, status) VALUES
  ('YOUR_USER_ID_HERE', 'INV-001', 'Tech Startup Co', 2500, '2024-01-15', 'overdue'),
  ('YOUR_USER_ID_HERE', 'INV-002', 'Fashion Brand LLC', 1800, '2024-02-01', 'overdue'), 
  ('YOUR_USER_ID_HERE', 'INV-003', 'Beauty Company', 3200, '2025-01-30', 'sent'),
  ('YOUR_USER_ID_HERE', 'INV-004', 'Fitness App Inc', 1500, '2025-02-15', 'paid'),
  ('YOUR_USER_ID_HERE', 'INV-005', 'Food Delivery Co', 900, '2024-12-20', 'overdue');

-- This will create 5 test invoices:
-- - 3 overdue invoices (for testing the dashboard counter)
-- - 1 sent invoice
-- - 1 paid invoice