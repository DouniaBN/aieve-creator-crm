/*
  # Add Detailed Invoice Fields

  1. Extend invoices table with detailed fields
    - Creator information fields
    - Client detail fields
    - Financial calculation fields
    - Payment and terms fields
    - Customization settings (JSON)
    - Line items (JSON array)

  2. Make fields optional with sensible defaults
    - Existing invoices won't break
    - New invoices can use full feature set
*/

-- Add creator information fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS issue_date date;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS creator_business_name text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS creator_phone text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS creator_address text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS creator_tax_id text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS creator_website text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS creator_social_handle text;

-- Add detailed client fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_company text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_address text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_phone text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_contact_person text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS po_number text;

-- Add project/service fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deliverables text;

-- Add financial calculation fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_name text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_rate numeric DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

-- Add payment and terms fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms text DEFAULT 'net30';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_methods jsonb DEFAULT '["bank"]'::jsonb;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_instructions text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes text;

-- Add structured data fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customization_settings jsonb DEFAULT '{
  "showBusinessName": true,
  "showPhone": true,
  "showAddress": true,
  "showTaxId": false,
  "showWebsite": true,
  "showInstagram": true,
  "showYoutube": true,
  "showClientAddress": false,
  "showClientPhone": false,
  "showContactPerson": true,
  "showTax": false,
  "showDiscount": false,
  "showSubtotal": true,
  "showPaymentMethods": true,
  "showPaymentInstructions": true,
  "showPaymentTerms": true,
  "showNotes": true
}'::jsonb;

-- Update existing invoices with default values where fields are null
UPDATE invoices SET
  issue_date = created_at::date
  WHERE issue_date IS NULL;

UPDATE invoices SET
  project = client_name || ' Project'
  WHERE project IS NULL;

-- Add indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS invoices_currency_idx ON invoices(currency);
CREATE INDEX IF NOT EXISTS invoices_payment_terms_idx ON invoices(payment_terms);
CREATE INDEX IF NOT EXISTS invoices_issue_date_idx ON invoices(issue_date);