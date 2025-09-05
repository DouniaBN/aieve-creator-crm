import React, { createContext, useContext, useState, ReactNode } from 'react';

// Notification Types
export interface Notification {
  id: string;
  type: 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'invoice_overdue' | 'invoice_deleted' | 'invoice_restored' | 'project_updated' | 'brand_deal_updated';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: number;
  relatedType?: 'invoice' | 'project' | 'brand_deal';
}

// Types
export interface Project {
  id: number;
  name: string;
  brand: string;
  dueDate: string;
  status: 'idea' | 'negotiation' | 'in-progress' | 'submitted' | 'paid';
  fee: number;
  description: string;
}

export interface BrandDeal {
  id: number;
  brand: string;
  deliverables: string;
  fee: number;
  status: 'negotiation' | 'confirmed' | 'completed' | 'cancelled';
  contactPerson: string;
  email: string;
  startDate: string;
  endDate: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  client: string;
  amount: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  sentDate?: string;
  paidDate?: string;
  project: string;
}

interface AppContextType {
  projects: Project[];
  brandDeals: BrandDeal[];
  invoices: Invoice[];
  updateProjectStatus: (projectId: number, newStatus: Project['status']) => void;
  updateBrandDealStatus: (dealId: number, newStatus: BrandDeal['status']) => void;
  updateInvoiceStatus: (invoiceId: number, newStatus: Invoice['status']) => void;
  showSuccessMessage: (message: string) => void;
  successMessage: string | null;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'invoice_created',
      title: 'Invoice Created',
      message: 'Invoice INV-001 has been created for Shopify',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      relatedId: 1,
      relatedType: 'invoice'
    },
    {
      id: '2',
      type: 'invoice_overdue',
      title: 'Invoice Overdue',
      message: 'Invoice INV-002 from FitFam is now overdue',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      relatedId: 2,
      relatedType: 'invoice'
    },
    {
      id: '3',
      type: 'invoice_paid',
      title: 'Payment Received',
      message: 'Invoice INV-003 from Beauty Brand Co has been paid',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      relatedId: 3,
      relatedType: 'invoice'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'Summer Collection Reel',
      brand: 'Fashion Nova',
      dueDate: '2025-02-15',
      status: 'in-progress',
      fee: 2500,
      description: 'Create Instagram Reel showcasing summer collection'
    },
    {
      id: 2,
      name: 'Skincare Tutorial',
      brand: 'Glow Beauty',
      dueDate: '2025-02-20',
      status: 'negotiation',
      fee: 1800,
      description: 'YouTube tutorial featuring new skincare line'
    },
    {
      id: 3,
      name: 'Fitness Challenge',
      brand: 'FitLife',
      dueDate: '2025-02-10',
      status: 'submitted',
      fee: 3200,
      description: '30-day fitness challenge content series'
    },
    {
      id: 4,
      name: 'Recipe Blog Post',
      brand: 'Healthy Eats',
      dueDate: '2025-02-25',
      status: 'idea',
      fee: 800,
      description: 'Blog post with 5 healthy meal prep recipes'
    },
    {
      id: 5,
      name: 'Tech Review Video',
      brand: 'TechGear',
      dueDate: '2025-02-08',
      status: 'paid',
      fee: 4500,
      description: 'Unboxing and review of latest smartphone'
    }
  ]);

  const [brandDeals, setBrandDeals] = useState<BrandDeal[]>([
    {
      id: 1,
      brand: 'FitFam',
      deliverables: '3 Videos',
      fee: 1000,
      status: 'confirmed',
      contactPerson: 'Mike Johnson',
      email: 'mike@fitfam.com',
      startDate: '2025-02-15',
      endDate: '2025-03-15'
    },
    {
      id: 2,
      brand: 'EcoWear',
      deliverables: '1 Sponsored Post',
      fee: 500,
      status: 'negotiation',
      contactPerson: 'Sarah Davis',
      email: 'sarah@ecowear.com',
      startDate: '2025-02-20',
      endDate: '2025-02-25'
    },
    {
      id: 3,
      brand: 'Happy Foods',
      deliverables: '1 Recipe Video',
      fee: 1200,
      status: 'completed',
      contactPerson: 'David Chen',
      email: 'david@happyfoods.com',
      startDate: '2025-01-15',
      endDate: '2025-02-01'
    },
    {
      id: 4,
      brand: 'TechStyle',
      deliverables: '2 Instagram Posts',
      fee: 800,
      status: 'negotiation',
      contactPerson: 'Emma Wilson',
      email: 'emma@techstyle.com',
      startDate: '2025-02-25',
      endDate: '2025-03-05'
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      invoiceNumber: 'INV-001',
      client: 'Shopify',
      amount: 2000,
      dueDate: '2025-02-17',
      status: 'sent',
      sentDate: '2025-02-01',
      project: 'E-commerce Tutorial Series'
    },
    {
      id: 2,
      invoiceNumber: 'INV-002',
      client: 'FitFam',
      amount: 1000,
      dueDate: '2025-02-01',
      status: 'overdue',
      sentDate: '2025-01-15',
      project: 'Fitness Challenge Content'
    },
    {
      id: 3,
      invoiceNumber: 'INV-003',
      client: 'Beauty Brand Co',
      amount: 1500,
      dueDate: '2025-02-20',
      status: 'paid',
      sentDate: '2025-02-03',
      paidDate: '2025-02-18',
      project: 'Skincare Review Video'
    },
    {
      id: 4,
      invoiceNumber: 'INV-004',
      client: 'TechGear',
      amount: 3500,
      dueDate: '2025-02-25',
      status: 'draft',
      project: 'Product Unboxing Series'
    }
  ]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateProjectStatus = (projectId: number, newStatus: Project['status']) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: newStatus }
        : project
    ));

    // Add notification for project status update
    const project = projects.find(p => p.id === projectId);
    if (project) {
      addNotification({
        type: 'project_updated',
        title: 'Project Updated',
        message: `${project.name} status changed to ${newStatus}`,
        relatedId: projectId,
        relatedType: 'project'
      });
    }

    // If project is marked as paid, update related invoice
    if (newStatus === 'paid') {
      if (project) {
        setInvoices(prev => prev.map(invoice => 
          invoice.client === project.brand
            ? { ...invoice, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
            : invoice
        ));
      }
    }

    showSuccessMessage('Project status updated!');
  };

  const updateBrandDealStatus = (dealId: number, newStatus: BrandDeal['status']) => {
    setBrandDeals(prev => prev.map(deal => 
      deal.id === dealId 
        ? { ...deal, status: newStatus }
        : deal
    ));

    // Add notification for brand deal status update
    const deal = brandDeals.find(d => d.id === dealId);
    if (deal) {
      addNotification({
        type: 'brand_deal_updated',
        title: 'Brand Deal Updated',
        message: `${deal.brand} deal status changed to ${newStatus}`,
        relatedId: dealId,
        relatedType: 'brand_deal'
      });
    }

    showSuccessMessage('Brand deal status updated!');
  };

  const updateInvoiceStatus = (invoiceId: number, newStatus: Invoice['status']) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { 
            ...invoice, 
            status: newStatus,
            paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : invoice.paidDate
          }
        : invoice
    ));

    // Add notification for invoice status update
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      let notificationType: Notification['type'] = 'invoice_sent';
      let title = 'Invoice Updated';
      let message = `Invoice ${invoice.invoiceNumber} status changed to ${newStatus}`;

      if (newStatus === 'paid') {
        notificationType = 'invoice_paid';
        title = 'Payment Received';
        message = `Payment received for invoice ${invoice.invoiceNumber} from ${invoice.client}`;
      } else if (newStatus === 'overdue') {
        notificationType = 'invoice_overdue';
        title = 'Invoice Overdue';
        message = `Invoice ${invoice.invoiceNumber} from ${invoice.client} is now overdue`;
      } else if (newStatus === 'sent') {
        notificationType = 'invoice_sent';
        title = 'Invoice Sent';
        message = `Invoice ${invoice.invoiceNumber} has been sent to ${invoice.client}`;
      }

      addNotification({
        type: notificationType,
        title,
        message,
        relatedId: invoiceId,
        relatedType: 'invoice'
      });
    }

    // If invoice is marked as paid, update related project
    if (newStatus === 'paid') {
      if (invoice) {
        setProjects(prev => prev.map(project => 
          project.brand === invoice.client
            ? { ...project, status: 'paid' as const }
            : project
        ));
      }
    }

    showSuccessMessage('Invoice status updated!');
  };

  const value = {
    projects,
    brandDeals,
    invoices,
    updateProjectStatus,
    updateBrandDealStatus,
    updateInvoiceStatus,
    showSuccessMessage,
    successMessage,
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    unreadCount
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};