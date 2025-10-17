import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Project {
  id: string
  user_id: string
  project_name: string
  brand_name: string
  description: string
  amount: number
  status: 'idea' | 'negotiation' | 'in-progress' | 'submitted' | 'paid'
  due_date: string
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  issue_date?: string
  due_date: string
  currency?: string

  // Client Info
  client_name: string
  client_company?: string
  client_address?: string
  client_phone?: string
  client_contact_person?: string
  contact_name?: string
  contact_email?: string
  po_number?: string

  // Creator Info
  creator_business_name?: string
  creator_phone?: string
  creator_address?: string
  creator_tax_id?: string
  creator_website?: string
  creator_social_handle?: string

  // Financial Details
  line_items?: any[]
  subtotal?: number
  tax_rate?: number
  tax_name?: string
  tax_amount?: number
  discount_rate?: number
  discount_amount?: number
  amount: number

  // Payment & Terms
  payment_terms?: string
  payment_methods?: string[]
  payment_instructions?: string
  notes?: string

  // Settings
  customization_settings?: any

  status: 'draft' | 'sent' | 'paid' | 'overdue'
  created_at: string
}

export interface BrandDeal {
  id: string
  user_id: string
  brand_name: string
  contact_name: string
  contact_email: string
  deliverables: string
  fee: number
  status: 'negotiation' | 'confirmed' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  created_at: string
}

export interface ContentPost {
  id: string
  user_id: string
  project_id?: string
  title: string
  platform: 'newsletter' | 'x' | 'pinterest' | 'tiktok' | 'instagram' | 'youtube' | 'linkedin' | 'blog'
  status: 'draft' | 'scheduled' | 'published'
  scheduled_date?: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  text: string
  completed: boolean
  created_at: string
}