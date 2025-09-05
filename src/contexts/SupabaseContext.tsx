import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Project, Invoice, BrandDeal, ContentPost } from '../lib/supabase'

interface SupabaseContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  
  // Data
  projects: Project[]
  invoices: Invoice[]
  brandDeals: BrandDeal[]
  contentPosts: ContentPost[]
  
  // Data operations
  fetchProjects: () => Promise<void>
  fetchInvoices: () => Promise<void>
  fetchBrandDeals: () => Promise<void>
  fetchContentPosts: () => Promise<void>
  
  // CRUD operations
  createProject: (project: Omit<Project, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  
  createInvoice: (invoice: Omit<Invoice, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  
  createBrandDeal: (deal: Omit<BrandDeal, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateBrandDeal: (id: string, updates: Partial<BrandDeal>) => Promise<void>
  deleteBrandDeal: (id: string) => Promise<void>
  
  createContentPost: (post: Omit<ContentPost, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateContentPost: (id: string, updates: Partial<ContentPost>) => Promise<void>
  deleteContentPost: (id: string) => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export const SupabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [brandDeals, setBrandDeals] = useState<BrandDeal[]>([])
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])


  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Data fetching functions
  const fetchProjects = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
  }

  const fetchInvoices = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching invoices:', error)
    } else {
      setInvoices(data || [])
    }
  }

  const fetchBrandDeals = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('brand_deals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching brand deals:', error)
    } else {
      setBrandDeals(data || [])
    }
  }

  const fetchContentPosts = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('content_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching content posts:', error)
    } else {
      setContentPosts(data || [])
    }
  }

  // CRUD operations for projects
  const createProject = async (project: Omit<Project, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return
    
    const { error } = await supabase
      .from('projects')
      .insert([{ ...project, user_id: user.id }])
    
    if (error) {
      console.error('Error creating project:', error)
      throw error
    } else {
      await fetchProjects()
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating project:', error)
      throw error
    } else {
      await fetchProjects()
    }
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting project:', error)
      throw error
    } else {
      await fetchProjects()
    }
  }

  // CRUD operations for invoices
  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return
    
    const { error } = await supabase
      .from('invoices')
      .insert([{ ...invoice, user_id: user.id }])
    
    if (error) {
      console.error('Error creating invoice:', error)
      throw error
    } else {
      await fetchInvoices()
    }
  }

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const { error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating invoice:', error)
      throw error
    } else {
      await fetchInvoices()
    }
  }

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting invoice:', error)
      throw error
    } else {
      await fetchInvoices()
    }
  }

  // CRUD operations for brand deals
  const createBrandDeal = async (deal: Omit<BrandDeal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return
    
    const { error } = await supabase
      .from('brand_deals')
      .insert([{ ...deal, user_id: user.id }])
    
    if (error) {
      console.error('Error creating brand deal:', error)
      throw error
    } else {
      await fetchBrandDeals()
    }
  }

  const updateBrandDeal = async (id: string, updates: Partial<BrandDeal>) => {
    const { error } = await supabase
      .from('brand_deals')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating brand deal:', error)
      throw error
    } else {
      await fetchBrandDeals()
    }
  }

  const deleteBrandDeal = async (id: string) => {
    const { error } = await supabase
      .from('brand_deals')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting brand deal:', error)
      throw error
    } else {
      await fetchBrandDeals()
    }
  }

  // CRUD operations for content posts
  const createContentPost = async (post: Omit<ContentPost, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return
    
    const postData = { ...post, user_id: user.id };
    
    const { error } = await supabase
      .from('content_posts')
      .insert([postData])
    
    if (error) {
      console.error('Error creating content post:', error)
      throw error
    } else {
      await fetchContentPosts()
    }
  }

  const updateContentPost = async (id: string, updates: Partial<ContentPost>) => {
    const { error } = await supabase
      .from('content_posts')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating content post:', error)
      throw error
    } else {
      await fetchContentPosts()
    }
  }

  const deleteContentPost = async (id: string) => {
    const { error } = await supabase
      .from('content_posts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting content post:', error)
      throw error
    } else {
      await fetchContentPosts()
    }
  }

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchProjects()
      fetchInvoices()
      fetchBrandDeals()
      fetchContentPosts()
    } else {
      setProjects([])
      setInvoices([])
      setBrandDeals([])
      setContentPosts([])
    }
  }, [user, fetchProjects, fetchInvoices, fetchBrandDeals, fetchContentPosts])

  const value = {
    user,
    session,
    loading,
    signOut,
    projects,
    invoices,
    brandDeals,
    contentPosts,
    fetchProjects,
    fetchInvoices,
    fetchBrandDeals,
    fetchContentPosts,
    createProject,
    updateProject,
    deleteProject,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    createBrandDeal,
    updateBrandDeal,
    deleteBrandDeal,
    createContentPost,
    updateContentPost,
    deleteContentPost,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}