// Simple script to add test invoice data to Supabase
// Run this with: node add-test-invoices.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

const supabase = createClient(supabaseUrl, supabaseKey);

const testInvoices = [
  {
    invoice_number: 'INV-001',
    client_name: 'Tech Startup Co',
    amount: 2500,
    due_date: '2024-01-15', // Past date - will be overdue
    status: 'overdue'
  },
  {
    invoice_number: 'INV-002', 
    client_name: 'Fashion Brand LLC',
    amount: 1800,
    due_date: '2024-02-01', // Past date - will be overdue
    status: 'overdue'
  },
  {
    invoice_number: 'INV-003',
    client_name: 'Beauty Company',
    amount: 3200,
    due_date: '2025-01-30',
    status: 'sent'
  },
  {
    invoice_number: 'INV-004',
    client_name: 'Fitness App Inc',
    amount: 1500,
    due_date: '2025-02-15',
    status: 'paid'
  },
  {
    invoice_number: 'INV-005',
    client_name: 'Food Delivery Co',
    amount: 900,
    due_date: '2024-12-20', // Past date - will be overdue  
    status: 'overdue'
  }
];

async function addTestInvoices() {
  try {
    // Get current user (you'll need to be logged in)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Not authenticated:', authError);
      return;
    }
    
    console.log('Adding test invoices for user:', user.id);
    
    // Add user_id to each invoice
    const invoicesWithUserId = testInvoices.map(invoice => ({
      ...invoice,
      user_id: user.id
    }));
    
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoicesWithUserId);
    
    if (error) {
      console.error('Error adding invoices:', error);
    } else {
      console.log('Successfully added test invoices!');
      console.log('Added:', testInvoices.length, 'invoices');
      console.log('Overdue invoices:', testInvoices.filter(inv => inv.status === 'overdue').length);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

addTestInvoices();