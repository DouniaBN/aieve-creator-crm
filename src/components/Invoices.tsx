import React, { useState } from 'react';
import { Plus, Download, Edit, Trash2, AlertCircle, CheckCircle, Clock, DollarSign, Filter, Search, FileText, Trash, Send, Eye } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAppContext } from '../contexts/AppContext';
import { Invoice } from '../lib/supabase';
import StatusDropdown from './StatusDropdown';
import InvoiceGenerator from './InvoiceGenerator';
import InvoiceDrafts from './InvoiceDrafts';
import TrashSection from './TrashSection';
import { InvoiceData } from './InvoiceGenerator';
import { formatCurrency } from '../utils/currency';

const Invoices = () => {
  const { invoices, updateInvoice, deleteInvoice, createInvoice, userProfile } = useSupabase();
  const { addNotification, showSuccessMessage } = useAppContext();

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [showGenerator, setShowGenerator] = useState(false);
  const [activeSection, setActiveSection] = useState<'invoices' | 'drafts' | 'trash'>('invoices');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);

  // Wrapper function to match the expected signature
  const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
    try {
      await updateInvoice(id, { status });
      showSuccessMessage('Invoice status updated!');
    } catch (error) {
      console.error('Failed to update invoice status:', error);
    }
  };
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<number, Record<string, boolean>>>({});
  const [trashedInvoices, setTrashedInvoices] = useState<Invoice[]>([]);

  const statusConfig = {
    draft: { 
      label: 'Draft', 
      icon: Edit,
      color: 'bg-gray-100 text-gray-800',
      hoverColor: 'hover:bg-gray-200',
      selectedColor: 'bg-gray-200 border-gray-300'
    },
    sent: { 
      label: 'Sent', 
      icon: Send,
      color: 'bg-pink-100 text-pink-800',
      hoverColor: 'hover:bg-pink-200',
      selectedColor: 'bg-pink-200 border-pink-300'
    },
    paid: { 
      label: 'Paid', 
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      hoverColor: 'hover:bg-green-200',
      selectedColor: 'bg-green-200 border-green-300'
    },
    overdue: { 
      label: 'Overdue', 
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800',
      hoverColor: 'hover:bg-red-200',
      selectedColor: 'bg-red-200 border-red-300'
    },
  };


  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalOutstanding = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  const setLoading = (invoiceId: number, action: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${invoiceId}-${action}`]: isLoading
    }));
  };

  const isLoading = (invoiceId, action) => {
    return loadingStates[`${invoiceId}-${action}`] || false;
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    // Convert Invoice to InvoiceData format for the generator
    const amount = invoice.amount || invoice.total || 0;
    const convertedInvoice = {
      id: invoice.id.toString(),
      invoiceNumber: invoice.invoice_number,
      issueDate: invoice.issue_date || new Date().toISOString().split('T')[0],
      dueDate: invoice.due_date,
      currency: invoice.currency || 'USD',

      // Creator Info
      creatorName: userProfile?.preferred_name || '',
      creatorBusinessName: invoice.creator_business_name || userProfile?.business_name || '',
      creatorEmail: userProfile?.email || '',
      creatorPhone: invoice.creator_phone || userProfile?.phone || '',
      creatorAddress: invoice.creator_address || userProfile?.address || '',
      creatorTaxId: invoice.creator_tax_id || userProfile?.tax_id || '',
      creatorWebsite: invoice.creator_website || userProfile?.website || '',
      creatorInstagram: invoice.creator_social_handle || userProfile?.instagram_handle || '',
      creatorYoutube: userProfile?.youtube_handle || '',

      // Client Info
      clientName: invoice.contact_name || '',
      clientCompany: invoice.client_company || invoice.client_name || '',
      clientEmail: invoice.contact_email || '',
      clientAddress: invoice.client_address || '',
      clientPhone: invoice.client_phone || '',
      clientContact: invoice.client_contact_person || '',
      poNumber: invoice.po_number || '',

      // Line Items
      lineItems: invoice.line_items || [{
        id: '1',
        service: '',
        description: invoice.deliverables || invoice.project || '',
        quantity: 1,
        rate: amount,
        amount: amount
      }],
      subtotal: invoice.subtotal || amount,
      taxRate: invoice.tax_rate || 0,
      taxName: invoice.tax_name || '',
      taxAmount: invoice.tax_amount || 0,
      discountRate: invoice.discount_rate || 0,
      discountAmount: invoice.discount_amount || 0,
      total: amount,

      // Payment & Terms
      paymentTerms: invoice.payment_terms || 'net30',
      paymentMethods: invoice.payment_methods || ['bank'],
      paymentInstructions: invoice.payment_instructions || '',
      notes: invoice.notes || '',

      // Customization
      customization: invoice.customization_settings || {
        showBusinessName: true,
        showPhone: true,
        showAddress: true,
        showTaxId: false,
        showWebsite: true,
        showInstagram: true,
        showYoutube: true,
        showClientAddress: false,
        showClientPhone: false,
        showContactPerson: true,
        showTax: false,
        showDiscount: false,
        showSubtotal: true,
        showPaymentMethods: true,
        showPaymentInstructions: true,
        showPaymentTerms: true,
        showNotes: true,
      },

      status: invoice.status || 'draft'
    };

    setPreviewInvoice(convertedInvoice);
    setShowPreview(true);
  };

  const generatePDF = async (invoice: Invoice) => {
    setLoading(invoice.id, 'download', true);

    try {
      // Convert invoice to the format expected by InvoiceGenerator
      const amount = invoice.amount || invoice.total || 0;
      const convertedInvoice = {
        id: invoice.id.toString(),
        invoiceNumber: invoice.invoice_number,
        issueDate: invoice.issue_date || new Date().toISOString().split('T')[0],
        dueDate: invoice.due_date,
        currency: invoice.currency || 'USD',

        // Creator Info
        creatorName: userProfile?.preferred_name || '',
        creatorBusinessName: invoice.creator_business_name || userProfile?.business_name || '',
        creatorEmail: userProfile?.email || '',
        creatorPhone: invoice.creator_phone || userProfile?.phone || '',
        creatorAddress: invoice.creator_address || userProfile?.address || '',
        creatorTaxId: invoice.creator_tax_id || userProfile?.tax_id || '',
        creatorWebsite: invoice.creator_website || userProfile?.website || '',
        creatorInstagram: invoice.creator_social_handle || userProfile?.instagram_handle || '',
        creatorYoutube: userProfile?.youtube_handle || '',

        // Client Info
        clientName: invoice.contact_name || '',
        clientCompany: invoice.client_company || invoice.client_name || '',
        clientEmail: invoice.contact_email || '',
        clientAddress: invoice.client_address || '',
        clientPhone: invoice.client_phone || '',
        clientContact: invoice.client_contact_person || '',
        poNumber: invoice.po_number || '',

        // Line Items
        lineItems: invoice.line_items || [{
          id: '1',
          service: '',
          description: invoice.deliverables || invoice.project || '',
          quantity: 1,
          rate: amount,
          amount: amount
        }],
        subtotal: invoice.subtotal || amount,
        taxRate: invoice.tax_rate || 0,
        taxName: invoice.tax_name || '',
        taxAmount: invoice.tax_amount || 0,
        discountRate: invoice.discount_rate || 0,
        discountAmount: invoice.discount_amount || 0,
        total: amount,

        // Payment & Terms
        paymentTerms: invoice.payment_terms || 'net30',
        paymentMethods: invoice.payment_methods || ['bank'],
        paymentInstructions: invoice.payment_instructions || '',
        notes: invoice.notes || '',

        // Customization
        customization: invoice.customization_settings || {
          showBusinessName: true,
          showPhone: true,
          showAddress: true,
          showTaxId: false,
          showWebsite: true,
          showInstagram: true,
          showYoutube: true,
          showClientAddress: false,
          showClientPhone: false,
          showContactPerson: true,
          showTax: false,
          showDiscount: false,
          showSubtotal: true,
          showPaymentMethods: true,
          showPaymentInstructions: true,
          showPaymentTerms: true,
          showNotes: true,
        },

        status: invoice.status || 'draft'
      };

      // Set the invoice for preview and enable auto-print mode
      setPreviewInvoice(convertedInvoice);
      setAutoPrint(true);
      setShowPreview(true);

      showSuccessMessage('Opening invoice for exporting...');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(invoice.id, 'download', false);
    }
  };


  const handleEditInvoice = (invoice: Invoice) => {
    // Check if this is already a full InvoiceData object (from drafts)
    let editData: InvoiceData;
    
    if (invoice.lineItems && Array.isArray(invoice.lineItems)) {
      // This is already a full InvoiceData object from drafts
      editData = invoice as InvoiceData;
    } else {
      // This is a simple invoice from AppContext, convert to generator format
      const amount = invoice.amount || invoice.total || 0;
      editData = {
        id: invoice.id.toString(),
        invoiceNumber: invoice.invoice_number,
        issueDate: invoice.issue_date || new Date().toISOString().split('T')[0],
        dueDate: invoice.due_date,
        currency: invoice.currency || 'USD',

        // Creator Info (load from database or defaults)
        creatorName: userProfile?.preferred_name || '',
        creatorBusinessName: invoice.creator_business_name || userProfile?.business_name || '',
        creatorEmail: userProfile?.email || '',
        creatorPhone: invoice.creator_phone || userProfile?.phone || '',
        creatorAddress: invoice.creator_address || userProfile?.address || '',
        creatorTaxId: invoice.creator_tax_id || userProfile?.tax_id || '',
        creatorWebsite: invoice.creator_website || userProfile?.website || '',
        creatorInstagram: invoice.creator_social_handle || userProfile?.instagram_handle || '',
        creatorYoutube: userProfile?.youtube_handle || '',

        // Client Info
        clientName: invoice.contact_name || '',
        clientCompany: invoice.client_company || invoice.client_name || '',
        clientEmail: invoice.contact_email || '',
        clientAddress: invoice.client_address || '',
        clientPhone: invoice.client_phone || '',
        clientContact: invoice.client_contact_person || '',
        poNumber: invoice.po_number || '',
        
        // Line Items (load from database or create default)
        lineItems: invoice.line_items || [{
          id: '1',
          service: '',
          description: invoice.deliverables || invoice.project || '',
          quantity: 1,
          rate: amount,
          amount: amount
        }],
        subtotal: invoice.subtotal || amount,
        taxRate: invoice.tax_rate || 0,
        taxName: invoice.tax_name || '',
        taxAmount: invoice.tax_amount || 0,
        discountRate: invoice.discount_rate || 0,
        discountAmount: invoice.discount_amount || 0,
        total: amount,

        // Payment & Terms
        paymentTerms: invoice.payment_terms || 'net30',
        paymentMethods: invoice.payment_methods || ['bank'],
        paymentInstructions: invoice.payment_instructions || '',
        notes: invoice.notes || '',

        // Customization
        customization: invoice.customization_settings || {
          showBusinessName: true,
          showPhone: true,
          showAddress: true,
          showTaxId: false,
          showWebsite: true,
          showInstagram: true,
          showYoutube: true,
          showClientAddress: false,
          showClientPhone: false,
          showContactPerson: true,
          showTax: false,
          showDiscount: false,
          showSubtotal: true,
          showPaymentMethods: true,
          showPaymentInstructions: true,
          showPaymentTerms: true,
          showNotes: true,
        },

        status: invoice.status || 'draft'
      };
    }
    
    setEditingInvoice(editData);
    setShowGenerator(true);
    setShowDrafts(false);
    setShowTrash(false);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to move invoice ${invoice.invoice_number} to trash?`)) {
      setLoading(invoice.id, 'delete', true);
      try {
        // Add to trash with deletion timestamp
        setTrashedInvoices(prev => [...prev, { ...invoice, deletedAt: new Date().toISOString() }]);

        // Remove from main invoices list in database
        await deleteInvoice(invoice.id);

        // Add notification for invoice deletion
        showSuccessMessage(`Invoice ${invoice.invoice_number} moved to trash`);
        addNotification({
          type: 'invoice_deleted',
          title: 'Invoice Deleted',
          message: `Invoice ${invoice.invoice_number} has been moved to trash`,
          relatedId: invoice.id,
          relatedType: 'invoice'
        });
      } catch (error) {
        console.error('Error deleting invoice:', error);
        showSuccessMessage('Error moving invoice to trash');
      } finally {
        setLoading(invoice.id, 'delete', false);
      }
    }
  };

  const handleRestoreInvoice = async (invoice: Invoice) => {
    try {
      // Remove deletedAt field and restore to database
      const { deletedAt: _deletedAt, ...invoiceToRestore } = invoice as Invoice & { deletedAt?: string };
      void _deletedAt; // Explicitly mark as intentionally unused

      // Remove the id, user_id, and created_at to match the createInvoice interface
      const { id: _id, user_id: _user_id, created_at: _created_at, ...invoiceData } = invoiceToRestore;
      void _id; void _user_id; void _created_at; // Explicitly mark as intentionally unused

      // Create the invoice back in the database
      await createInvoice(invoiceData);

      // Remove from trash
      setTrashedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));

      // Add notification for invoice restoration
      showSuccessMessage(`Invoice ${invoice.invoice_number} restored`);
      addNotification({
        type: 'invoice_restored',
        title: 'Invoice Restored',
        message: `Invoice ${invoice.invoice_number} has been restored from trash`,
        relatedId: invoice.id,
        relatedType: 'invoice'
      });
    } catch (error) {
      console.error('Error restoring invoice:', error);
      showSuccessMessage('Error restoring invoice');
    }
  };

  const handlePermanentDelete = (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to permanently delete invoice ${invoice.invoice_number}? This cannot be undone.`)) {
      setTrashedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      showSuccessMessage(`Invoice ${invoice.invoice_number} permanently deleted`);
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently delete all trashed invoices? This cannot be undone.')) {
      setTrashedInvoices([]);
      showSuccessMessage('Trash emptied successfully');
    }
  };


  const handleCloseGenerator = () => {
    setShowGenerator(false);
    setEditingInvoice(null);
  };

  return (
    <div className="space-y-4">
      {/* Overview Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-[#1c2d5a]">Overview</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveSection('invoices')}
              className={`flex items-center px-3 py-1.5 text-sm border transition-all duration-200 rounded-lg ${
                activeSection === 'invoices' ? 'bg-white text-gray-700 border-[#E83F87]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              Invoices
            </button>
            <button
              onClick={() => setActiveSection('drafts')}
              className={`flex items-center px-3 py-1.5 text-sm border border-gray-200 rounded-lg transition-all duration-200 ${
                activeSection === 'drafts' ? 'bg-[#E83F87] text-white border-[#E83F87]' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Drafts
            </button>
            <button
              onClick={() => setActiveSection('trash')}
              className={`flex items-center px-3 py-1.5 text-sm border border-gray-200 rounded-lg transition-all duration-200 ${
                activeSection === 'trash' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Trash className="w-3.5 h-3.5 mr-1.5" />
              Trash
            </button>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-emerald-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Paid</p>
              <p className="text-4xl font-bold text-[#1c2d5a] mb-1">{formatCurrency(totalPaid, userProfile?.currency || 'USD')}</p>
              <p className="text-[10px] text-green-600">completed payments</p>
            </div>
            <div className="rounded-lg p-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-orange-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Outstanding</p>
              <p className="text-4xl font-bold text-[#1c2d5a] mb-1">{formatCurrency(totalOutstanding, userProfile?.currency || 'USD')}</p>
              <p className="text-[10px] text-orange-600">pending payment</p>
            </div>
            <div className="rounded-lg p-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-[#fc5353]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Overdue Invoices</p>
              <p className="text-4xl font-bold text-[#1c2d5a] mb-1">{overdueCount}</p>
              <p className="text-[10px] text-[#fc5353]">need attention</p>
            </div>
            <div className="rounded-lg p-1.5">
              <AlertCircle className="w-4 h-4 text-[#fc5353]" />
            </div>
          </div>
        </div>
        </div>
      </div>


      {/* Search Bar and Filters */}
      {showSearchBar && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <button
            onClick={() => {
              setShowSearchBar(false);
              setSearchTerm('');
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setShowSearchBar(true);
                if (!showSearchBar) {
                  setSearchTerm('');
                }
              }}
              className="p-2 text-gray-400 hover:text-[#E83F87] rounded-lg transition-colors duration-200"
            >
              <Search className="w-5 h-5" />
            </button>
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center px-5 py-3 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-all duration-200 shadow-lg text-base"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Invoice
          </button>
        </div>

      {/* Drafts Section */}
      {activeSection === 'drafts' && (
        <InvoiceDrafts onEditInvoice={handleEditInvoice} />
      )}

      {/* Trash Section */}
      {activeSection === 'trash' && (
        <TrashSection
          trashedInvoices={trashedInvoices}
          onRestore={handleRestoreInvoice}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
        />
      )}

      {/* Invoices Table */}
      {activeSection === 'invoices' && (
        <div>
          <h1 className="text-xl font-bold text-[#1c2d5a] mb-4">Invoices</h1>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50" style={{ overflowY: 'visible' }}>
          <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredInvoices.map((invoice) => {
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-base font-medium text-gray-900">{invoice.invoice_number}</div>
                        <div className="text-xs text-gray-500">{invoice.project}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-base text-gray-900">
                        {invoice.client_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-base font-semibold text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency || 'USD')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-base text-gray-900">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="pr-0 pl-4 py-3 whitespace-nowrap">
                        <StatusDropdown
                          currentStatus={invoice.status}
                          statusConfig={statusConfig}
                          onStatusChange={(newStatus) => updateInvoiceStatus(invoice.id, newStatus)}
                        />
                      </td>
                      <td className="pl-0 pr-0 py-3 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex justify-end space-x-1 -ml-8">
                          <div className="relative group">
                            <button
                              onClick={() => handlePreviewInvoice(invoice)}
                              className="p-2 text-gray-400 hover:text-[#E83F87] hover:bg-pink-50 rounded-lg transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              Preview
                            </div>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => generatePDF(invoice)}
                              className="p-2 text-gray-400 hover:text-[#E83F87] hover:bg-pink-50 rounded-lg transition-colors duration-200"
                              disabled={isLoading(invoice.id, 'download')}
                            >
                              {isLoading(invoice.id, 'download') ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              Download
                            </div>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-2 text-gray-400 hover:text-[#E83F87] hover:bg-pink-50 rounded-lg transition-colors duration-200"
                              disabled={isLoading(invoice.id, 'edit')}
                            >
                              {isLoading(invoice.id, 'edit') ? (
                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Edit className="w-4 h-4" />
                              )}
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              Edit
                            </div>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => handleDeleteInvoice(invoice)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              disabled={isLoading(invoice.id, 'delete')}
                            >
                              {isLoading(invoice.id, 'delete') ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                            <div className="absolute bottom-full right-0 transform translate-x-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              Delete
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {activeSection === 'invoices' && filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600 mb-6">Create your first invoice to start tracking payments</p>
          <button
            onClick={() => setShowGenerator(true)}
            className="inline-flex items-center px-4 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-all duration-200 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </button>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showPreview && previewInvoice && (
        <InvoiceGenerator
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setAutoPrint(false);
          }}
          editingInvoice={previewInvoice}
          previewMode={true}
          autoPrint={autoPrint}
        />
      )}

      {/* Invoice Generator */}
      {showGenerator && (
        <InvoiceGenerator
          isOpen={showGenerator}
          onClose={handleCloseGenerator}
          editingInvoice={editingInvoice}
        />
      )}
    </div>
  );
};

export default Invoices;