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
  client_name: string
  amount: number
  due_date: string
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