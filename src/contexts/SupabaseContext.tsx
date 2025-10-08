import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Project, Invoice, BrandDeal, ContentPost, Task } from '../lib/supabase'

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
  tasks: Task[]
  
  // Data operations
  fetchProjects: () => Promise<void>
  fetchInvoices: () => Promise<void>
  fetchBrandDeals: () => Promise<void>
  fetchContentPosts: () => Promise<void>
  fetchTasks: () => Promise<void>
  
  // CRUD operations
  createProject: (project: Omit<Project, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  
  createInvoice: (invoice: Omit<Invoice, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  createInvoiceFromBrandDeal: (brandDeal: BrandDeal) => Promise<void>
  generateInvoiceNumber: () => Promise<string>

  createBrandDeal: (deal: Omit<BrandDeal, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateBrandDeal: (id: string, updates: Partial<BrandDeal>) => Promise<void>
  deleteBrandDeal: (id: string) => Promise<void>
  
  createContentPost: (post: Omit<ContentPost, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateContentPost: (id: string, updates: Partial<ContentPost>) => Promise<void>
  deleteContentPost: (id: string) => Promise<void>

  createTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
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
  const [tasks, setTasks] = useState<Task[]>([])

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
  const fetchProjects = useCallback(async () => {
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
  }, [user])

  const fetchInvoices = useCallback(async () => {
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
  }, [user])

  const fetchBrandDeals = useCallback(async () => {
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
  }, [user])

  const fetchContentPosts = useCallback(async () => {
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
  }, [user])

  const fetchTasks = useCallback(async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
  }, [user])

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

  // Generate sequential invoice number
  const generateInvoiceNumber = async (): Promise<string> => {
    if (!user) return 'INV-001'

    // Get the highest existing invoice number to avoid duplicates
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error fetching latest invoice:', error)
      return `INV-${Date.now()}` // Fallback to timestamp
    }

    let nextNumber = 1
    if (data && data.length > 0 && data[0].invoice_number) {
      // Extract number from last invoice (e.g., "INV-005" -> 5)
      const lastInvoiceNumber = data[0].invoice_number
      const lastNumber = parseInt(lastInvoiceNumber.replace('INV-', '')) || 0
      nextNumber = lastNumber + 1
    }

    return `INV-${nextNumber.toString().padStart(3, '0')}`
  }

  // Create invoice from brand deal
  const createInvoiceFromBrandDeal = async (brandDeal: BrandDeal) => {
    console.log(`🏗️ Creating invoice from brand deal:`, brandDeal);

    if (!user) {
      console.log(`❌ No user found`);
      return;
    }

    if (!brandDeal.fee || brandDeal.fee <= 0) {
      console.log(`❌ Invalid fee: ${brandDeal.fee}`);
      return;
    }

    // Check if invoice already exists for this brand deal
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('id')
      .eq('user_id', user.id)
      .eq('client_name', brandDeal.brand_name)
      .eq('amount', brandDeal.fee)

    if (existingInvoices && existingInvoices.length > 0) {
      console.log(`⚠️ Invoice already exists for this brand deal`);
      return;
    }

    // Generate sequential invoice number
    const invoiceNumber = await generateInvoiceNumber()
    console.log(`📋 Generated invoice number: ${invoiceNumber}`);

    // Calculate due date (30 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const invoice: Omit<Invoice, 'id' | 'user_id' | 'created_at'> = {
      invoice_number: invoiceNumber,
      client_name: brandDeal.brand_name,
      amount: brandDeal.fee,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'draft'
      // Note: Temporarily removing optional fields to test basic functionality
      // contact_name: brandDeal.contact_name,
      // contact_email: brandDeal.contact_email,
      // deliverables: brandDeal.deliverables
    }

    console.log(`💾 Creating invoice with data:`, invoice);
    await createInvoice(invoice)
    console.log(`✅ Invoice created successfully!`);
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

  // CRUD operations for tasks
  const createTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return
    
    const { error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: user.id }])
    
    if (error) {
      console.error('Error creating task:', error)
      throw error
    } else {
      await fetchTasks()
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating task:', error)
      throw error
    } else {
      await fetchTasks()
    }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting task:', error)
      throw error
    } else {
      await fetchTasks()
    }
  }

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchProjects()
      fetchInvoices()
      fetchBrandDeals()
      fetchContentPosts()
      fetchTasks()
    } else {
      setProjects([])
      setInvoices([])
      setBrandDeals([])
      setContentPosts([])
      setTasks([])
    }
  }, [user, fetchProjects, fetchInvoices, fetchBrandDeals, fetchContentPosts, fetchTasks])

  const value = {
    user,
    session,
    loading,
    signOut,
    projects,
    invoices,
    brandDeals,
    contentPosts,
    tasks,
    fetchProjects,
    fetchInvoices,
    fetchBrandDeals,
    fetchContentPosts,
    fetchTasks,
    createProject,
    updateProject,
    deleteProject,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    createInvoiceFromBrandDeal,
    generateInvoiceNumber,
    createBrandDeal,
    updateBrandDeal,
    deleteBrandDeal,
    createContentPost,
    updateContentPost,
    deleteContentPost,
    createTask,
    updateTask,
    deleteTask,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}