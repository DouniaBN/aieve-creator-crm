import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Download, Calculator, User, Building, FileText, DollarSign, Eye, Printer, Mail, Link, ArrowLeft, Calendar, Building2, Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  
  // Creator Info
  creatorName: string;
  creatorEmail: string;
  creatorPhone: string;
  creatorAddress: string;
  creatorTaxId: string;
  creatorWebsite: string;
  creatorInstagram: string;
  creatorYoutube: string;
  
  // Client Info
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress: string;
  clientContact: string;
  poNumber: string;
  
  // Invoice Details
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  
  // Payment & Terms
  paymentTerms: string;
  paymentMethods: string[];
  notes: string;
  
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  editingInvoice?: InvoiceData | null;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ isOpen, onClose, editingInvoice }) => {
  const { showSuccessMessage, addNotification } = useAppContext();
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showTax, setShowTax] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' }
  ];

  const taxRates = {
    'US': 8.5,
    'UK': 20,
    'EU': 21,
    'CA': 13,
    'AU': 10,
    'JP': 10,
    'CH': 7.7,
    'SE': 25,
    'NO': 25,
    'DK': 25
  };

  const contentCreatorServices = [
    'Instagram Post',
    'Instagram Story',
    'Instagram Reel',
    'YouTube Video',
    'TikTok Video',
    'Blog Post',
    'Product Photography',
    'Brand Photography',
    'Video Editing',
    'Content Strategy',
    'Social Media Management',
    'Influencer Campaign',
    'Brand Partnership',
    'Usage Rights License',
    'Revision Fee',
    'Rush Fee',
    'Travel Expenses',
    'Equipment Rental'
  ];

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',
    
    // Creator Info (pre-filled with default data)
    creatorName: 'Sarah Chen',
    creatorEmail: 'sarah@example.com',
    creatorPhone: '+1 (555) 123-4567',
    creatorAddress: '123 Creator St, Los Angeles, CA 90210',
    creatorTaxId: '12-3456789',
    creatorWebsite: 'sarahcreates.com',
    creatorInstagram: '@sarahcreates',
    creatorYoutube: '@SarahCreatesContent',
    
    // Client Info
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientAddress: '',
    clientContact: '',
    poNumber: '',
    
    // Invoice Details
    lineItems: [{
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }],
    subtotal: 0,
    taxRate: 8.5,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 0,
    
    // Payment & Terms
    paymentTerms: 'net30',
    paymentMethods: ['bank'],
    notes: '',
    
    status: 'draft'
  });

  // Load editing invoice data
  useEffect(() => {
    if (editingInvoice) {
      setInvoiceData(editingInvoice);
      // Show tax and discount sections if they have values
      if (editingInvoice.taxRate > 0) setShowTax(true);
      if (editingInvoice.discountRate > 0) setShowDiscount(true);
    }
  }, [editingInvoice]);

  // Calculate totals whenever line items or rates change
  useEffect(() => {
    const subtotal = invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = subtotal * (invoiceData.discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (invoiceData.taxRate / 100);
    const total = taxableAmount + taxAmount;

    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total
    }));
  }, [invoiceData.lineItems, invoiceData.taxRate, invoiceData.discountRate]);

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const removeLineItem = (id: string) => {
    if (invoiceData.lineItems.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter(item => item.id !== id)
      }));
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage for now (in real app, would save to database)
    const drafts = JSON.parse(localStorage.getItem('invoiceDrafts') || '[]');
    const draftData = { ...invoiceData, id: invoiceData.id || Date.now().toString() };
    
    const existingIndex = drafts.findIndex((d: InvoiceData) => d.id === draftData.id);
    if (existingIndex >= 0) {
      drafts[existingIndex] = draftData;
    } else {
      drafts.push(draftData);
    }
    
    localStorage.setItem('invoiceDrafts', JSON.stringify(drafts));
    showSuccessMessage('Invoice saved as draft!');
  };

  const handleGenerate = () => {
    // Generate and send invoice
    handleSaveDraft();
    setInvoiceData(prev => ({ ...prev, status: 'sent' }));
    
    // Add notification for invoice creation
    addNotification({
      type: 'invoice_created',
      title: 'Invoice Created',
      message: `Invoice ${invoiceData.invoiceNumber} has been created for ${invoiceData.clientCompany || 'client'}`,
      relatedId: parseInt(invoiceData.id || '0'),
      relatedType: 'invoice'
    });
    
    showSuccessMessage('Invoice generated successfully!');
    onClose();
  };

  const handlePreview = () => {
    setViewMode('preview');
  };

  const handleBackToEdit = () => {
    setViewMode('edit');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF
    showSuccessMessage('PDF download started!');
  };

  const handleSendEmail = () => {
    // In a real app, this would open email client or send via API
    const subject = `Invoice ${invoiceData.invoiceNumber} from ${invoiceData.creatorName}`;
    const body = `Please find attached invoice ${invoiceData.invoiceNumber} for ${selectedCurrency?.symbol}${invoiceData.total.toFixed(2)}.`;
    window.open(`mailto:${invoiceData.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleCopyLink = () => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(`https://invoice.app/view/${invoiceData.invoiceNumber}`);
    showSuccessMessage('Invoice link copied to clipboard!');
  };

  const selectedCurrency = currencies.find(c => c.code === invoiceData.currency);

  if (!isOpen) return null;

  // Invoice Preview Component
  const InvoicePreview = () => (
    <div className="bg-white min-h-screen print:min-h-0">
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-preview, .invoice-preview * { visibility: visible; }
          .invoice-preview { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header Actions - Hidden in Print */}
      <div className="no-print sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <button
          onClick={handleBackToEdit}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit
        </button>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200"
          >
            <Link className="w-4 h-4 mr-2" />
            Copy Link
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-preview max-w-4xl mx-auto p-8 print:p-0">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{invoiceData.creatorName}</h1>
            <div className="text-gray-600 space-y-1">
              <p>{invoiceData.creatorEmail}</p>
              <p>{invoiceData.creatorPhone}</p>
              <p className="whitespace-pre-line">{invoiceData.creatorAddress}</p>
              {invoiceData.creatorWebsite && <p>{invoiceData.creatorWebsite}</p>}
              <div className="flex space-x-4 mt-2">
                {invoiceData.creatorInstagram && <span className="text-[#1c2d5a]">{invoiceData.creatorInstagram}</span>}
                {invoiceData.creatorYoutube && <span className="text-red-600">{invoiceData.creatorYoutube}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">INVOICE</h2>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice #:</span>
                  <span className="font-semibold">{invoiceData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-semibold">{new Date(invoiceData.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-semibold text-red-600">{new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                </div>
                {invoiceData.poNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">PO Number:</span>
                    <span className="font-semibold">{invoiceData.poNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="space-y-1">
                {invoiceData.clientCompany && <p className="font-semibold text-gray-900">{invoiceData.clientCompany}</p>}
                {invoiceData.clientContact && <p className="text-gray-700">{invoiceData.clientContact}</p>}
                {invoiceData.clientEmail && <p className="text-gray-600">{invoiceData.clientEmail}</p>}
                {invoiceData.clientAddress && <p className="text-gray-600 whitespace-pre-line">{invoiceData.clientAddress}</p>}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Details:</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-semibold">{selectedCurrency?.code} ({selectedCurrency?.symbol})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Terms:</span>
                  <span className="font-semibold capitalize">{invoiceData.paymentTerms.replace('net', 'Net ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ID:</span>
                  <span className="font-semibold">{invoiceData.creatorTaxId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Provided:</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Qty</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Rate</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceData.lineItems.map((item) => (
                  <tr key={item.id} className="bg-white">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{selectedCurrency?.symbol}{item.rate.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{selectedCurrency?.symbol}{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 p-6 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">{selectedCurrency?.symbol}{invoiceData.subtotal.toFixed(2)}</span>
              </div>
              {invoiceData.discountRate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discount ({invoiceData.discountRate}%):</span>
                  <span className="font-semibold text-red-600">-{selectedCurrency?.symbol}{invoiceData.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {invoiceData.taxRate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax ({invoiceData.taxRate}%):</span>
                  <span className="font-semibold text-gray-900">{selectedCurrency?.symbol}{invoiceData.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-[#1c2d5a]">{selectedCurrency?.symbol}{invoiceData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        {invoiceData.paymentMethods.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accepted Payment Methods:</h3>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex flex-wrap gap-3">
                {invoiceData.paymentMethods.map(method => (
                  <span key={method} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                    {method} Transfer
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {invoiceData.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes:</h3>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="text-gray-700 whitespace-pre-line">{invoiceData.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Payment Terms:</h4>
              <p className="text-sm text-gray-600">
                Payment is due within {invoiceData.paymentTerms.replace('net', '').replace('immediate', '0')} days of invoice date.
                Late payments may incur additional fees.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Thank You!</h4>
              <p className="text-sm text-gray-600">
                Thank you for choosing to work with me. I look forward to our continued partnership.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Signature: _________________________</p>
                <p className="text-xs text-gray-500 mt-2">Date: _________________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Return preview mode if selected
  if (viewMode === 'preview') {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <InvoicePreview />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
              <p className="text-gray-600 mt-1">For {invoiceData.clientCompany || 'Brand Deal'} brand deal</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 3-Column Grid Layout */}
          <div className="grid grid-cols-3 gap-6">

            {/* Left Column - Invoice Details & Client Info */}
            <div className="space-y-6">

              {/* Invoice Details Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Invoice Details</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Issue Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 text-sm py-2 px-3 h-auto",
                              !invoiceData.issueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {invoiceData.issueDate ? (
                              format(new Date(invoiceData.issueDate), "MMM d, yyyy")
                            ) : (
                              <span>Issue date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={invoiceData.issueDate ? new Date(invoiceData.issueDate) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setInvoiceData(prev => ({ ...prev, issueDate: format(date, 'yyyy-MM-dd') }));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 text-sm py-2 px-3 h-auto",
                              !invoiceData.dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {invoiceData.dueDate ? (
                              format(new Date(invoiceData.dueDate), "MMM d, yyyy")
                            ) : (
                              <span>Due date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setInvoiceData(prev => ({ ...prev, dueDate: format(date, 'yyyy-MM-dd') }));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={invoiceData.currency}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Info Card */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Client Info</h3>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Auto-filled</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={invoiceData.clientCompany}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, clientCompany: e.target.value }))}
                      placeholder="Company Name"
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={invoiceData.clientContact}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, clientContact: e.target.value }))}
                      placeholder="Contact Person"
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      placeholder="contact@company.com"
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 2 Columns - Line Items, Payment Terms, Total */}
            <div className="col-span-2 space-y-6">

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Services & Line Items</h3>
                  <button
                    onClick={addLineItem}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {invoiceData.lineItems.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-3 items-start">
                        <div className="col-span-6">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder="Description of service"
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            min="1"
                            step="1"
                            placeholder="1"
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              {selectedCurrency?.symbol}
                            </span>
                            <input
                              type="number"
                              value={item.rate === 0 ? '' : item.rate}
                              onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              onFocus={(e) => e.target.select()}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full text-sm py-2 pl-8 pr-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {invoiceData.lineItems.length > 1 && (
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Tax/Discount Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowTax(!showTax);
                      if (showTax) {
                        setInvoiceData(prev => ({ ...prev, taxRate: 0 }));
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showTax ? '- Remove Tax' : '+ Add Tax'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDiscount(!showDiscount);
                      if (showDiscount) {
                        setInvoiceData(prev => ({ ...prev, discountRate: 0 }));
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showDiscount ? '- Remove Discount' : '+ Add Discount'}
                  </button>
                </div>

                {/* Tax Fields */}
                {showTax && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={invoiceData.taxRate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-32 text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Discount Fields */}
                {showDiscount && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount Rate (%)</label>
                    <input
                      type="number"
                      value={invoiceData.discountRate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-32 text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Payment Terms Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center mb-4">
                  <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Payment Terms</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
                    <select
                      value={invoiceData.paymentTerms}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="immediate">Due Immediately</option>
                      <option value="net15">Net 15 Days</option>
                      <option value="net30">Net 30 Days</option>
                      <option value="net60">Net 60 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Payment Methods</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'bank', label: '🏦 Bank Transfer' },
                        { key: 'paypal', label: '💰 PayPal' },
                        { key: 'stripe', label: '💳 Stripe' },
                        { key: 'crypto', label: '₿ Crypto' }
                      ].map(method => (
                        <label key={method.key} className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-white cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={invoiceData.paymentMethods.includes(method.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInvoiceData(prev => ({
                                  ...prev,
                                  paymentMethods: [...prev.paymentMethods, method.key]
                                }));
                              } else {
                                setInvoiceData(prev => ({
                                  ...prev,
                                  paymentMethods: prev.paymentMethods.filter(m => m !== method.key)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                          />
                          <span className="text-sm font-medium">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <textarea
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      placeholder="Payment instructions, terms..."
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Total Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {selectedCurrency?.symbol}{invoiceData.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {invoiceData.discountRate > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount ({invoiceData.discountRate}%)</span>
                      <span className="font-medium text-red-600">
                        -{selectedCurrency?.symbol}{invoiceData.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {invoiceData.taxRate > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax ({invoiceData.taxRate}%)</span>
                      <span className="font-medium text-gray-900">
                        {selectedCurrency?.symbol}{invoiceData.taxAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-blue-900">
                        {selectedCurrency?.symbol}{invoiceData.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Save Draft
              </button>
              <button
                onClick={handlePreview}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
              >
                Preview Invoice
              </button>
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-gradient-to-r from-[#E83F87] to-[#d63577] text-white rounded-xl hover:from-[#d63577] hover:to-[#c12a64] transition-all duration-200 shadow-lg"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;