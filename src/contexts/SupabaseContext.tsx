import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Project, Invoice, BrandDeal, ContentPost, Task, Notification, UserSettings, UserProfile } from '../lib/supabase'
import { posthog } from '../lib/posthog'

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
  notifications: Notification[]
  unreadCount: number
  userSettings: UserSettings | null
  userProfile: UserProfile | null
  notificationsEnabled: boolean
  
  // Data operations
  fetchProjects: () => Promise<void>
  fetchInvoices: () => Promise<void>
  fetchBrandDeals: () => Promise<void>
  fetchContentPosts: () => Promise<void>
  fetchTasks: () => Promise<void>
  fetchNotifications: () => Promise<void>
  fetchUserSettings: () => Promise<void>
  fetchUserProfile: () => Promise<void>
  
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

  // Notification operations
  createNotification: (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  clearAllNotifications: () => Promise<void>
  createTestNotification: () => Promise<void>
  updateNotificationSettings: (enabled: boolean) => Promise<void>

  // Profile operations
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length
  const notificationsEnabled = userSettings?.notifications_enabled ?? true

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
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // PostHog integration
      if (event === 'SIGNED_IN' && session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        })
      } else if (event === 'SIGNED_OUT') {
        posthog.reset()
      }
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

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
    } else {
      setNotifications(data || [])
    }
  }, [user])

  const fetchUserSettings = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert([{ user_id: user.id, notifications_enabled: true }])
          .select()
          .single()

        if (insertError) {
          console.error('Error creating user settings:', insertError)
        } else {
          setUserSettings(newSettings)
        }
      } else {
        console.error('Error fetching user settings:', error)
      }
    } else {
      setUserSettings(data)
    }
  }, [user])

  const fetchUserProfile = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, create default profile using upsert to prevent duplicates
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .upsert([{
            user_id: user.id,
            full_name: user.user_metadata?.full_name || (user.email && user.email.includes('@') ? user.email.split('@')[0] : '') || '',
            currency: 'USD'
          }], { onConflict: 'user_id' })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        } else {
          setUserProfile(newProfile)
        }
      } else {
        console.error('Error fetching user profile:', error)
      }
    } else {
      setUserProfile(data)
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

    // Auto-populate creator fields from user profile if not provided
    const enrichedInvoice = { ...invoice };

    if (userProfile) {
      // Only set fields if they weren't already provided in the invoice
      if (!enrichedInvoice.creator_business_name && userProfile.full_name) {
        enrichedInvoice.creator_business_name = userProfile.full_name;
      }
      if (!enrichedInvoice.creator_phone && userProfile.phone) {
        enrichedInvoice.creator_phone = userProfile.phone;
      }
      if (!enrichedInvoice.creator_address && userProfile.business_address) {
        enrichedInvoice.creator_address = userProfile.business_address;
      }
      if (!enrichedInvoice.creator_website && userProfile.website) {
        enrichedInvoice.creator_website = userProfile.website;
      }
      if (!enrichedInvoice.currency && userProfile.currency) {
        enrichedInvoice.currency = userProfile.currency;
      }
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...enrichedInvoice, user_id: user.id }])
      .select()

    if (error) {
      console.error('Error creating invoice:', error)
      throw error
    } else {
      await fetchInvoices()

      // Create notification for invoice creation
      if (data && data.length > 0 && data[0]?.id) {
        await createNotification({
          type: 'invoice_created',
          title: 'Invoice Created',
          message: `Invoice ${invoice.invoice_number} for ${invoice.client_name} has been created.`,
          read: false,
          related_id: parseInt(data[0].id),
          related_type: 'invoice'
        })
      }
    }
  }

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    // Get current invoice data first
    const { data: currentInvoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating invoice:', error)
      throw error
    } else {
      await fetchInvoices()

      // Create notifications based on status changes
      if (currentInvoice && updates.status && updates.status !== currentInvoice.status) {
        let notificationType: 'invoice_sent' | 'invoice_paid' | 'invoice_overdue'
        let title: string
        let message: string

        switch (updates.status) {
          case 'sent':
            notificationType = 'invoice_sent'
            title = 'Invoice Sent'
            message = `Invoice ${currentInvoice.invoice_number} has been sent to ${currentInvoice.client_name}.`
            break
          case 'paid':
            notificationType = 'invoice_paid'
            title = 'Invoice Paid'
            message = `Invoice ${currentInvoice.invoice_number} has been paid by ${currentInvoice.client_name}.`
            break
          case 'overdue':
            notificationType = 'invoice_overdue'
            title = 'Invoice Overdue'
            message = `Invoice ${currentInvoice.invoice_number} is now overdue.`
            break
          default:
            return
        }

        await createNotification({
          type: notificationType,
          title,
          message,
          read: false,
          related_id: parseInt(id),
          related_type: 'invoice'
        })
      }
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

    // Get all existing invoice numbers to find the highest sequential one
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching latest invoice:', error)
      return 'INV-001' // Fallback to first invoice
    }

    const existingNumbers = new Set<string>()
    let highestSequentialNumber = 0

    if (data && data.length > 0) {
      for (const invoice of data) {
        if (invoice.invoice_number) {
          const invoiceNumber = invoice.invoice_number
          existingNumbers.add(invoiceNumber)

          // Only process properly formatted sequential numbers (INV-001 to INV-999)
          const match = invoiceNumber.match(/^INV-?(\d{1,3})$/)
          if (match) {
            const number = parseInt(match[1])
            if (number > highestSequentialNumber) {
              highestSequentialNumber = number
            }
          }
          // Ignore timestamp-based invoice numbers
        }
      }
    }

    // Generate next sequential number that doesn't exist
    let nextNumber = Math.max(1, highestSequentialNumber + 1)
    let candidateNumber = `INV-${nextNumber.toString().padStart(3, '0')}`

    // Ensure the generated number is truly unique
    while (existingNumbers.has(candidateNumber)) {
      nextNumber++
      candidateNumber = `INV-${nextNumber.toString().padStart(3, '0')}`
    }

    return candidateNumber
  }

  // Create invoice from brand deal
  const createInvoiceFromBrandDeal = async (brandDeal: BrandDeal) => {
    if (!user || !brandDeal.fee || brandDeal.fee <= 0) return

    // Check if invoice already exists for this brand deal
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('id')
      .eq('user_id', user.id)
      .eq('client_name', brandDeal.brand_name)
      .eq('amount', brandDeal.fee)

    if (existingInvoices && existingInvoices.length > 0) {
      return; // Invoice already exists, skip creation
    }

    // Generate sequential invoice number
    const invoiceNumber = await generateInvoiceNumber()

    // Use brand deal end date as invoice due date, or 30 days from now as fallback
    const dueDate = brandDeal.end_date || (() => {
      const fallbackDate = new Date()
      fallbackDate.setDate(fallbackDate.getDate() + 30)
      return fallbackDate.toISOString().split('T')[0]
    })()

    const invoice: Omit<Invoice, 'id' | 'user_id' | 'created_at'> = {
      invoice_number: invoiceNumber,
      client_name: brandDeal.brand_name,
      amount: brandDeal.fee,
      due_date: dueDate,
      status: 'draft',
      contact_name: brandDeal.contact_name,
      contact_email: brandDeal.contact_email
    }

    await createInvoice(invoice)
  }

  // CRUD operations for brand deals
  const createBrandDeal = async (deal: Omit<BrandDeal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('brand_deals')
      .insert([{ ...deal, user_id: user.id }])
      .select()

    if (error) {
      console.error('Error creating brand deal:', error)
      throw error
    } else {
      await fetchBrandDeals()

      // Create notification for brand deal creation
      if (data && data.length > 0 && data[0]?.id) {
        await createNotification({
          type: 'brand_deal_updated',
          title: 'Brand Deal Created',
          message: `New brand deal with ${deal.brand_name} has been created.`,
          read: false,
          related_id: parseInt(data[0].id),
          related_type: 'brand_deal'
        })
      }
    }
  }

  const updateBrandDeal = async (id: string, updates: Partial<BrandDeal>) => {
    // Get current brand deal data first
    const { data: currentDeal } = await supabase
      .from('brand_deals')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('brand_deals')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating brand deal:', error)
      throw error
    } else {
      await fetchBrandDeals()

      // Create notification for significant status changes
      if (currentDeal && updates.status && updates.status !== currentDeal.status) {
        let message: string

        switch (updates.status) {
          case 'confirmed':
            message = `Brand deal with ${currentDeal.brand_name} has been confirmed.`
            break
          case 'completed':
            message = `Brand deal with ${currentDeal.brand_name} has been completed.`
            break
          case 'cancelled':
            message = `Brand deal with ${currentDeal.brand_name} has been cancelled.`
            break
          default:
            message = `Brand deal with ${currentDeal.brand_name} has been updated.`
        }

        await createNotification({
          type: 'brand_deal_updated',
          title: 'Brand Deal Updated',
          message,
          read: false,
          related_id: parseInt(id),
          related_type: 'brand_deal'
        })
      }
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

    const { data, error } = await supabase
      .from('content_posts')
      .insert([postData])
      .select()

    if (error) {
      console.error('Error creating content post:', error)
      throw error
    } else {
      await fetchContentPosts()

      // Create notification for content post creation
      if (data && data.length > 0 && data[0]?.id) {
        const notificationType = post.status === 'scheduled' ? 'content_scheduled' : 'content_updated'
        const message = post.status === 'scheduled'
          ? `"${post.title}" has been scheduled for ${post.platform}.`
          : `"${post.title}" content post has been created for ${post.platform}.`

        await createNotification({
          type: notificationType,
          title: post.status === 'scheduled' ? 'Content Scheduled' : 'Content Created',
          message,
          read: false,
          related_id: parseInt(data[0].id),
          related_type: 'content_post'
        })
      }
    }
  }

  const updateContentPost = async (id: string, updates: Partial<ContentPost>) => {
    // Get current content post data first
    const { data: currentPost } = await supabase
      .from('content_posts')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('content_posts')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating content post:', error)
      throw error
    } else {
      await fetchContentPosts()

      // Create notifications for status changes
      if (currentPost && updates.status && updates.status !== currentPost.status) {
        let notificationType: 'content_scheduled' | 'content_published' | 'content_updated'
        let title: string
        let message: string

        switch (updates.status) {
          case 'scheduled':
            notificationType = 'content_scheduled'
            title = 'Content Scheduled'
            message = `"${currentPost.title}" has been scheduled for ${currentPost.platform}.`
            break
          case 'published':
            notificationType = 'content_published'
            title = 'Content Published'
            message = `"${currentPost.title}" has been published on ${currentPost.platform}.`
            break
          default:
            notificationType = 'content_updated'
            title = 'Content Updated'
            message = `"${currentPost.title}" content post has been updated.`
        }

        await createNotification({
          type: notificationType,
          title,
          message,
          read: false,
          related_id: parseInt(id),
          related_type: 'content_post'
        })
      }
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

  // Notification CRUD operations
  const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    // Only create notifications if they are enabled
    if (!notificationsEnabled) return

    const { error } = await supabase
      .from('notifications')
      .insert([{ ...notification, user_id: user.id }])

    if (error) {
      console.error('Error creating notification:', error)
      throw error
    } else {
      await fetchNotifications()
    }
  }

  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      throw error
    } else {
      await fetchNotifications()
    }
  }

  const markAllNotificationsAsRead = async () => {
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    } else {
      await fetchNotifications()
    }
  }

  const clearAllNotifications = async () => {
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing all notifications:', error)
      throw error
    } else {
      await fetchNotifications()
    }
  }

  // Test function to create a sample notification
  const createTestNotification = async () => {
    await createNotification({
      type: 'invoice_created',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      read: false
    })
  }

  // Update notification settings
  const updateNotificationSettings = async (enabled: boolean) => {
    if (!user) return

    const { error } = await supabase
      .from('user_settings')
      .update({ notifications_enabled: enabled })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating notification settings:', error)
      throw error
    } else {
      await fetchUserSettings()
    }
  }

  // Update all existing invoices with new profile data
  const syncProfileToInvoices = async (profileUpdates: Partial<UserProfile>) => {
    if (!user) return;

    // Map profile fields to invoice fields
    const invoiceUpdates: Partial<Invoice> = {};

    if (profileUpdates.full_name !== undefined) {
      invoiceUpdates.creator_business_name = profileUpdates.full_name;
    }
    if (profileUpdates.phone !== undefined) {
      invoiceUpdates.creator_phone = profileUpdates.phone;
    }
    if (profileUpdates.business_address !== undefined) {
      invoiceUpdates.creator_address = profileUpdates.business_address;
    }
    if (profileUpdates.website !== undefined) {
      invoiceUpdates.creator_website = profileUpdates.website;
    }
    if (profileUpdates.currency !== undefined) {
      invoiceUpdates.currency = profileUpdates.currency;
    }

    // Only update invoices if there are relevant changes
    if (Object.keys(invoiceUpdates).length > 0) {

      const { error } = await supabase
        .from('invoices')
        .update(invoiceUpdates)
        .eq('user_id', user.id)
        .select('id, creator_business_name, creator_phone, creator_address, creator_website, currency');

      if (error) {
        console.error('Error syncing profile to invoices:', error);
      } else {
        // Refresh invoices to reflect changes
        await fetchInvoices();
      }
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return


    // Filter out any undefined values and fields that don't exist in database
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key, value]) => {
        const isUndefined = value === undefined;
        const isExcludedField = ['onboarding_complete', 'creator_type'].includes(key);
        return !isUndefined && !isExcludedField;
      })
    );


    // First try to update with only existing fields
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(cleanUpdates)
      .eq('user_id', user.id)
      .select('*')  // Return the updated row

    if (updateError) {
      console.error('Update error:', updateError);

      // If update fails, try to upsert (insert or update)
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert([{ user_id: user.id, ...cleanUpdates }])
        .select('*')

      if (upsertError) {
        console.error('Error upserting user profile:', upsertError)
        throw upsertError
      }
    }

    try {
      await fetchUserProfile();
    } catch (profileError) {
      console.warn('Could not fetch updated profile, but update was successful:', profileError);
      // Update local userProfile state with the clean updates
      if (userProfile) {
        setUserProfile({ ...userProfile, ...cleanUpdates });
      }
    }

    // Sync relevant profile changes to all existing invoices
    await syncProfileToInvoices(cleanUpdates);

  }

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return

    // Supabase Auth automatically verifies the current session before allowing password updates
    // No need to re-authenticate as the user is already signed in
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      // Handle specific error cases
      if (error.message.includes('same as the old password')) {
        throw new Error('New password must be different from your current password')
      }
      if (error.message.includes('password')) {
        throw new Error('Password update failed. Please ensure you meet the requirements.')
      }
      console.error('Error updating password:', error)
      throw new Error(error.message || 'Failed to update password')
    }
  }

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      // Fetch all data in parallel when user is available
      Promise.all([
        fetchProjects(),
        fetchInvoices(),
        fetchBrandDeals(),
        fetchContentPosts(),
        fetchTasks(),
        fetchNotifications(),
        fetchUserSettings(),
        fetchUserProfile()
      ]).catch(error => {
        console.error('Error fetching user data:', error)
      })
    } else {
      // Clear all data when user is null
      setProjects([])
      setInvoices([])
      setBrandDeals([])
      setContentPosts([])
      setTasks([])
      setNotifications([])
      setUserSettings(null)
      setUserProfile(null)
    }
  }, [user]) // Only depend on user, not the fetch functions

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
    notifications,
    unreadCount,
    userSettings,
    userProfile,
    notificationsEnabled,
    fetchProjects,
    fetchInvoices,
    fetchBrandDeals,
    fetchContentPosts,
    fetchTasks,
    fetchNotifications,
    fetchUserSettings,
    fetchUserProfile,
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
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    createTestNotification,
    updateNotificationSettings,
    updateUserProfile,
    changePassword,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}