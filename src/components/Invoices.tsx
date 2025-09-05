import React, { useState } from 'react';
import { Plus, Download, Send, Edit, Trash2, AlertCircle, CheckCircle, Clock, DollarSign, Filter, Search, FileText, RotateCcw, Trash } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import StatusDropdown from './StatusDropdown';
import InvoiceGenerator from './InvoiceGenerator';
import InvoiceDrafts from './InvoiceDrafts';
import TrashSection from './TrashSection';
import { InvoiceData } from './InvoiceGenerator';

const Invoices = () => {
  const { invoices, updateInvoiceStatus, addNotification } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingStates, setLoadingStates] = useState({});
  const [trashedInvoices, setTrashedInvoices] = useState([]);

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
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const setLoading = (invoiceId, action, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${invoiceId}-${action}`]: isLoading
    }));
  };

  const isLoading = (invoiceId, action) => {
    return loadingStates[`${invoiceId}-${action}`] || false;
  };

  const generatePDF = async (invoice) => {
    setLoading(invoice.id, 'download', true);
    
    try {
      // Create a new window with the invoice content
      const printWindow = window.open('', '_blank');
      const invoiceHTML = generateInvoiceHTML(invoice);
      
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
      showSuccessMessage('Invoice PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(invoice.id, 'download', false);
    }
  };

  const generateInvoiceHTML = (invoice) => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #8B5CF6, #EC4899); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
          .invoice-title { font-size: 36px; font-weight: bold; color: #1F2937; }
          .invoice-details { background: #F9FAFB; padding: 20px; border-radius: 12px; }
          .bill-to { margin: 40px 0; }
          .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #1F2937; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
          .items-table th { background: #F9FAFB; font-weight: 600; }
          .totals { margin-left: auto; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-final { font-size: 20px; font-weight: bold; border-top: 2px solid #8B5CF6; padding-top: 12px; color: #8B5CF6; }
          .footer { margin-top: 50px; padding-top: 30px; border-top: 1px solid #E5E7EB; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <h1 style="margin: 15px 0 5px 0;">Sarah Chen</h1>
            <p style="margin: 0; color: #6B7280;">sarah@example.com</p>
            <p style="margin: 0; color: #6B7280;">+1 (555) 123-4567</p>
            <p style="margin: 5px 0 0 0; color: #6B7280;">123 Creator St, Los Angeles, CA 90210</p>
          </div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-details">
              <div style="margin-bottom: 8px;"><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
              <div style="margin-bottom: 8px;"><strong>Date:</strong> ${currentDate}</div>
              <div style="margin-bottom: 8px;"><strong>Due:</strong> ${invoice.dueDate}</div>
            </div>
          </div>
        </div>
        
        <div class="bill-to">
          <div class="section-title">Bill To:</div>
          <div style="background: #F9FAFB; padding: 20px; border-radius: 12px;">
            <div style="font-weight: 600; margin-bottom: 5px;">${invoice.client}</div>
            <div style="color: #6B7280;">${invoice.project}</div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.project}</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">$${invoice.amount.toLocaleString()}</td>
              <td style="text-align: right; font-weight: 600;">$${invoice.amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${invoice.amount.toLocaleString()}</span>
          </div>
          <div class="total-row total-final">
            <span>Total:</span>
            <span>$${invoice.amount.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="footer">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div class="section-title">Payment Terms:</div>
              <p style="color: #6B7280; margin: 0;">Payment is due within 30 days of invoice date.</p>
            </div>
            <div>
              <div class="section-title">Thank You!</div>
              <p style="color: #6B7280; margin: 0;">Thank you for choosing to work with me.</p>
            </div>
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; font-size: 12px; color: #9CA3AF;">Signature: _________________________</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleEditInvoice = (invoice) => {
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
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.sentDate || new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate,
        currency: 'USD',
        
        // Creator Info (pre-filled)
        creatorName: 'Sarah Chen',
        creatorEmail: 'sarah@example.com',
        creatorPhone: '+1 (555) 123-4567',
        creatorAddress: '123 Creator St, Los Angeles, CA 90210',
        creatorTaxId: '12-3456789',
        creatorWebsite: 'sarahcreates.com',
        creatorInstagram: '@sarahcreates',
        creatorYoutube: '@SarahCreatesContent',
        
        // Client Info
        clientName: invoice.client || '',
        clientCompany: invoice.client || '',
        clientEmail: '',
        clientAddress: '',
        clientContact: '',
        poNumber: '',
        
        // Line Items
        lineItems: [{
          id: '1',
          description: invoice.project || 'Service',
          quantity: 1,
          rate: amount,
          amount: amount
        }],
        subtotal: amount,
        taxRate: 0,
        taxAmount: 0,
        discountRate: 0,
        discountAmount: 0,
        total: amount,
        
        // Payment & Terms
        paymentTerms: 'net30',
        paymentMethods: ['bank'],
        notes: '',
        
        status: invoice.status || 'draft'
      };
    }
    
    setEditingInvoice(editData);
    setShowGenerator(true);
    setShowDrafts(false);
    setShowTrash(false);
  };

  const handleDeleteInvoice = (invoice) => {
    if (window.confirm(`Are you sure you want to move invoice ${invoice.invoiceNumber} to trash?`)) {
      setTrashedInvoices(prev => [...prev, { ...invoice, deletedAt: new Date().toISOString() }]);
      // In a real app, you would remove from main invoices list
      
      // Add notification for invoice deletion
      showSuccessMessage(`Invoice ${invoice.invoiceNumber} moved to trash`);
      addNotification({
        type: 'invoice_deleted',
        title: 'Invoice Deleted',
        message: `Invoice ${invoice.invoiceNumber} has been moved to trash`,
        relatedId: invoice.id,
        relatedType: 'invoice'
      });
    }
  };

  const handleRestoreInvoice = (invoice) => {
    setTrashedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
    // In a real app, you would add back to main invoices list
    
    // Add notification for invoice restoration
    showSuccessMessage(`Invoice ${invoice.invoiceNumber} restored`);
    addNotification({
      type: 'invoice_restored',
      title: 'Invoice Restored',
      message: `Invoice ${invoice.invoiceNumber} has been restored from trash`,
      relatedId: invoice.id,
      relatedType: 'invoice'
    });
  };

  const handlePermanentDelete = (invoice) => {
    if (window.confirm(`Are you sure you want to permanently delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) {
      setTrashedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      showSuccessMessage(`Invoice ${invoice.invoiceNumber} permanently deleted`);
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently delete all trashed invoices? This cannot be undone.')) {
      setTrashedInvoices([]);
      showSuccessMessage('Trash emptied successfully');
    }
  };

  const sendReminder = (invoice) => {
    alert(`Reminder sent to ${invoice.client} for invoice ${invoice.invoiceNumber}`);
  };

  const handleCloseGenerator = () => {
    setShowGenerator(false);
    setEditingInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Create and manage your invoices and payments</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className={`flex items-center px-4 py-2 border border-gray-200 rounded-xl transition-all duration-200 ${
                showDrafts ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              {showDrafts ? 'Hide' : 'View'} Drafts
            </button>
            <button
              onClick={() => setShowTrash(!showTrash)}
              className={`flex items-center px-4 py-2 border border-gray-200 rounded-xl transition-all duration-200 ${
                showTrash ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Trash className="w-4 h-4 mr-2" />
              Trash ({trashedInvoices.length})
            </button>
            <button
              onClick={() => setShowGenerator(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">${totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue Count</p>
              <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drafts Section */}
      {showDrafts && (
        <InvoiceDrafts onEditInvoice={handleEditInvoice} />
      )}

      {/* Trash Section */}
      {showTrash && (
        <TrashSection 
          trashedInvoices={trashedInvoices}
          onRestore={handleRestoreInvoice}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
        />
      )}

      {/* Invoices Table */}
      {!showDrafts && !showTrash && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredInvoices.map((invoice) => {
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">{invoice.project}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDropdown
                          currentStatus={invoice.status}
                          statusConfig={statusConfig}
                          onStatusChange={(newStatus) => updateInvoiceStatus(invoice.id, newStatus)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => generatePDF(invoice)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Download PDF"
                            disabled={isLoading(invoice.id, 'download')}
                          >
                            {isLoading(invoice.id, 'download') ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                            title="Edit Invoice"
                            disabled={isLoading(invoice.id, 'edit')}
                          >
                            {isLoading(invoice.id, 'edit') ? (
                              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Edit className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Move to Trash"
                            disabled={isLoading(invoice.id, 'delete')}
                          >
                            {isLoading(invoice.id, 'delete') ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!showDrafts && !showTrash && filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600 mb-6">Create your first invoice to start tracking payments</p>
          <button
            onClick={() => setShowGenerator(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </button>
        </div>
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