import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Download, Calculator, User, Building, FileText, DollarSign, Eye, Printer, Mail, Link, ArrowLeft, Calendar, Building2, Calendar as CalendarIcon, CreditCard, Banknote } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { useSupabase } from '../contexts/SupabaseContext';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface LineItem {
  id: string;
  service: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceCustomization {
  // Creator Details
  showBusinessName: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showTaxId: boolean;
  showWebsite: boolean;
  showInstagram: boolean;
  showYoutube: boolean;

  // Client Details
  showClientAddress: boolean;
  showClientPhone: boolean;
  showContactPerson: boolean;

  // Financial Options
  showTax: boolean;
  showDiscount: boolean;
  showSubtotal: boolean;

  // Payment & Terms
  showPaymentMethods: boolean;
  showPaymentInstructions: boolean;
  showPaymentTerms: boolean;
  showNotes: boolean;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  
  // Creator Info
  creatorName: string;
  creatorBusinessName: string;
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
  clientPhone: string;
  clientContact: string;
  poNumber: string;
  
  // Invoice Details
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxName?: string;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  
  // Payment & Terms
  paymentTerms: string;
  paymentMethods: string[];
  paymentInstructions: string;
  notes: string;

  // Customization Options
  customization: InvoiceCustomization;

  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  editingInvoice?: InvoiceData | null;
  previewMode?: boolean;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ isOpen, onClose, editingInvoice, previewMode = false }) => {
  const { showSuccessMessage, addNotification } = useAppContext();
  const { generateInvoiceNumber, createInvoice, updateInvoice, invoices } = useSupabase();
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>(previewMode ? 'preview' : 'edit');
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

  // Default customization settings
  const defaultCustomization: InvoiceCustomization = {
    // Creator Details
    showBusinessName: true,
    showPhone: true,
    showAddress: true,
    showTaxId: false,
    showWebsite: true,
    showInstagram: true,
    showYoutube: true,

    // Client Details
    showClientAddress: false,
    showClientPhone: false,
    showContactPerson: true,

    // Financial Options
    showTax: false,
    showDiscount: false,
    showSubtotal: true,

    // Payment & Terms
    showPaymentMethods: true,
    showPaymentInstructions: true,
    showPaymentTerms: true,
    showNotes: true,
  };

  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: 'INV-001',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',

    // Creator Info (pre-filled with default data)
    creatorName: 'Sarah Chen',
    creatorBusinessName: 'Sarah Creates Studio',
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
    clientPhone: '',
    clientContact: '',
    poNumber: '',

    // Invoice Details
    lineItems: [{
      id: '1',
      service: '',
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
    paymentInstructions: '',
    notes: '',

    // Customization Options
    customization: defaultCustomization,

    status: 'draft'
  });

  // Load editing invoice data
  useEffect(() => {
    if (editingInvoice) {
      setInvoiceData({
        ...editingInvoice,
        // Ensure customization exists with fallback to defaults
        customization: editingInvoice.customization || defaultCustomization
      });
      // Show tax and discount sections if they have values
      if (editingInvoice.taxRate > 0) setShowTax(true);
      if (editingInvoice.discountRate > 0) setShowDiscount(true);
    }
  }, [editingInvoice]);

  // Generate sequential invoice number for new invoices
  useEffect(() => {
    const generateNewInvoiceNumber = async () => {
      if (isOpen && !editingInvoice) {
        try {
          const newNumber = await generateInvoiceNumber();
          setInvoiceData(prev => ({ ...prev, invoiceNumber: newNumber }));
        } catch (error) {
          console.error('Error generating invoice number:', error);
        }
      }
    };

    generateNewInvoiceNumber();
  }, [isOpen, editingInvoice, generateInvoiceNumber]);

  // Handle keyboard shortcuts for preview modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (viewMode === 'preview' && event.key === 'Escape') {
        setViewMode('edit');
      }
    };

    if (viewMode === 'preview') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewMode]);

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
      service: '',
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

  const saveOrUpdateInvoice = async (status: 'draft' | 'sent') => {
    const dbInvoice = {
      invoice_number: invoiceData.invoiceNumber,
      issue_date: invoiceData.issueDate,
      due_date: invoiceData.dueDate,
      currency: invoiceData.currency,

      // Client Info
      client_name: invoiceData.clientCompany || invoiceData.clientName || 'Client',
      client_company: invoiceData.clientCompany,
      client_address: invoiceData.clientAddress,
      client_phone: invoiceData.clientPhone,
      client_contact_person: invoiceData.clientContact,
      contact_name: invoiceData.clientName,
      contact_email: invoiceData.clientEmail,
      po_number: invoiceData.poNumber,

      // Creator Info
      creator_business_name: invoiceData.creatorBusinessName,
      creator_phone: invoiceData.creatorPhone,
      creator_address: invoiceData.creatorAddress,
      creator_tax_id: invoiceData.creatorTaxId,
      creator_website: invoiceData.creatorWebsite,
      creator_social_handle: invoiceData.creatorInstagram,

      // Financial Details
      line_items: invoiceData.lineItems,
      subtotal: invoiceData.subtotal,
      tax_rate: invoiceData.taxRate,
      tax_name: invoiceData.taxName,
      tax_amount: invoiceData.taxAmount,
      discount_rate: invoiceData.discountRate,
      discount_amount: invoiceData.discountAmount,
      amount: invoiceData.total,

      // Payment & Terms
      payment_terms: invoiceData.paymentTerms,
      payment_methods: invoiceData.paymentMethods,
      payment_instructions: invoiceData.paymentInstructions,
      notes: invoiceData.notes,

      // Settings
      customization_settings: invoiceData.customization,

      status
    };

    // Check if invoice already exists in database by invoice number
    const existingInvoice = invoices.find(inv => inv.invoice_number === invoiceData.invoiceNumber);

    if (existingInvoice) {
      // Update existing invoice
      await updateInvoice(existingInvoice.id, dbInvoice);
    } else {
      // Create new invoice
      await createInvoice(dbInvoice);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveOrUpdateInvoice('draft');

      // Also save to localStorage for backwards compatibility
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
    } catch (error) {
      console.error('Error saving draft:', error);
      showSuccessMessage('Error saving draft. Please try again.');
    }
  };

  const handleGenerate = async () => {
    try {
      await saveOrUpdateInvoice('sent');

      setInvoiceData(prev => ({ ...prev, status: 'sent' }));

      // Add notification for invoice creation
      addNotification({
        type: 'invoice_created',
        title: 'Invoice Created',
        message: `Invoice ${invoiceData.invoiceNumber} has been created for ${invoiceData.clientCompany || invoiceData.clientName || 'client'}`,
        relatedId: parseInt(invoiceData.id || '0'),
        relatedType: 'invoice'
      });

      showSuccessMessage('Invoice generated successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      showSuccessMessage('Error creating invoice. Please try again.');
    }
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

  // Calculate dynamic spacing based on visible creator info fields
  const getCreatorInfoFieldCount = () => {
    let count = 2; // Always has name/business name + email

    if ((invoiceData.customization?.showAddress ?? defaultCustomization.showAddress) && invoiceData.creatorAddress) count++;
    if ((invoiceData.customization?.showPhone ?? defaultCustomization.showPhone) && invoiceData.creatorPhone) count++;
    if ((invoiceData.customization?.showWebsite ?? defaultCustomization.showWebsite) && invoiceData.creatorWebsite) count++;
    if ((invoiceData.customization?.showInstagram ?? defaultCustomization.showInstagram) && invoiceData.creatorInstagram) count++;

    return count;
  };

  // Dynamic spacing for header section based on creator info density
  const getDynamicSpacing = () => {
    const fieldCount = getCreatorInfoFieldCount();
    if (fieldCount <= 2) return 'mb-4'; // Minimal spacing for just name + email
    if (fieldCount <= 3) return 'mb-5'; // Less spacing for fewer fields
    if (fieldCount <= 4) return 'mb-6'; // Medium spacing
    if (fieldCount <= 5) return 'mb-7'; // More spacing
    return 'mb-8'; // Full spacing for many fields
  };

  // Calculate dynamic spacing for subsequent sections
  const getSectionSpacing = () => {
    const fieldCount = getCreatorInfoFieldCount();
    // More aggressive spacing reduction for subsequent sections
    if (fieldCount <= 2) return 'mb-4'; // Very compact layout
    if (fieldCount <= 3) return 'mb-5'; // Compact layout
    if (fieldCount <= 4) return 'mb-6'; // Balanced layout
    return 'mb-8'; // Standard spacing for full layouts
  };

  if (!isOpen) return null;

  // Invoice Preview Component
  const InvoicePreview = () => (
    <div className="bg-white rounded-xl shadow-lg invoice-preview">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * { visibility: hidden; }
            .invoice-preview, .invoice-preview * { visibility: visible; }
            .invoice-preview { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `
      }} />

      {/* Invoice Content */}
      <div className="invoice-preview max-w-4xl mx-auto p-8 print:p-0">
        {/* Invoice Header */}
        <div className={`flex justify-between items-start ${getDynamicSpacing()}`}>
          <div>
            {(invoiceData.customization?.showBusinessName ?? defaultCustomization.showBusinessName) && invoiceData.creatorBusinessName ? (
              <>
                <h1 className="text-3xl font-bold text-black mb-2">{invoiceData.creatorBusinessName}</h1>
                <div className="text-black space-y-1">
                  <p className="text-sm text-black">Contact: {invoiceData.creatorName}</p>
                  {(invoiceData.customization?.showAddress ?? defaultCustomization.showAddress) && <p className="whitespace-pre-line">{invoiceData.creatorAddress}</p>}
                  <p>{invoiceData.creatorEmail}</p>
                  {(invoiceData.customization?.showPhone ?? defaultCustomization.showPhone) && <p>{invoiceData.creatorPhone}</p>}
                  {(invoiceData.customization?.showWebsite ?? defaultCustomization.showWebsite) && invoiceData.creatorWebsite && <p>{invoiceData.creatorWebsite}</p>}
                  <div className="flex space-x-4 mt-2">
                    {(invoiceData.customization?.showInstagram ?? defaultCustomization.showInstagram) && invoiceData.creatorInstagram && <span className="text-black">{invoiceData.creatorInstagram}</span>}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-black mb-2">{invoiceData.creatorName}</h1>
                <div className="text-black space-y-1">
                  {(invoiceData.customization?.showAddress ?? defaultCustomization.showAddress) && <p className="whitespace-pre-line">{invoiceData.creatorAddress}</p>}
                  <p>{invoiceData.creatorEmail}</p>
                  {(invoiceData.customization?.showPhone ?? defaultCustomization.showPhone) && <p>{invoiceData.creatorPhone}</p>}
                  {(invoiceData.customization?.showWebsite ?? defaultCustomization.showWebsite) && invoiceData.creatorWebsite && <p>{invoiceData.creatorWebsite}</p>}
                  <div className="flex space-x-4 mt-2">
                    {(invoiceData.customization?.showInstagram ?? defaultCustomization.showInstagram) && invoiceData.creatorInstagram && <span className="text-black">{invoiceData.creatorInstagram}</span>}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-[#1c2d5a] mb-4">INVOICE</h2>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice #:&nbsp;</span>
                  <span className="font-semibold">{invoiceData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:&nbsp;</span>
                  <span className="font-semibold">{new Date(invoiceData.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:&nbsp;</span>
                  <span className="font-semibold">{new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                </div>
                {(invoiceData.customization?.showTaxId ?? defaultCustomization.showTaxId) && invoiceData.creatorTaxId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ID:&nbsp;</span>
                    <span className="font-semibold">{invoiceData.creatorTaxId}</span>
                  </div>
                )}
                {invoiceData.poNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">PO Number:&nbsp;</span>
                    <span className="font-semibold">{invoiceData.poNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className={getSectionSpacing()}>
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="space-y-1">
                {invoiceData.clientCompany && <p className="font-semibold text-gray-900">{invoiceData.clientCompany}</p>}
                {(invoiceData.customization?.showContactPerson ?? defaultCustomization.showContactPerson) && invoiceData.clientContact && <p className="text-gray-700">{invoiceData.clientContact}</p>}
                {invoiceData.clientEmail && <p className="text-gray-600">{invoiceData.clientEmail}</p>}
                {(invoiceData.customization?.showClientAddress ?? defaultCustomization.showClientAddress) && invoiceData.clientAddress && <p className="text-gray-600 whitespace-pre-line">{invoiceData.clientAddress}</p>}
                {(invoiceData.customization?.showClientPhone ?? defaultCustomization.showClientPhone) && invoiceData.clientPhone && <p className="text-gray-600">{invoiceData.clientPhone}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className={getSectionSpacing()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Provided:</h3>
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.service && (
                        <div className="font-semibold text-gray-900 mb-1">{item.service}</div>
                      )}
                      {item.description && (
                        <div className="text-gray-600">{item.description}</div>
                      )}
                    </td>
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
                  <span className="text-3xl font-bold text-black">{selectedCurrency?.symbol}{invoiceData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        {(invoiceData.customization?.showPaymentMethods ?? defaultCustomization.showPaymentMethods) && invoiceData.paymentMethods.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Accepted Payment Methods:</h3>
            <div className="flex flex-wrap gap-3">
              {invoiceData.paymentMethods.map(method => (
                <span key={method} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                  {method === 'bank' ? 'Bank Transfer' : method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        {(invoiceData.customization?.showPaymentInstructions ?? defaultCustomization.showPaymentInstructions) && invoiceData.paymentInstructions && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Instructions:</h3>
            <p className="text-gray-700 whitespace-pre-line">{invoiceData.paymentInstructions}</p>
          </div>
        )}

        {/* Notes */}
        {(invoiceData.customization?.showNotes ?? defaultCustomization.showNotes) && invoiceData.notes && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes:</h3>
            <p className="text-gray-700 whitespace-pre-line">{invoiceData.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6">
          {/* Thank You Section First */}
          <div className="text-center mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Thank You</h4>
            <p className="text-sm text-gray-600">
              Thank you for choosing to work with me!
            </p>
          </div>

          {/* Divider */}
          {(invoiceData.customization?.showPaymentTerms ?? defaultCustomization.showPaymentTerms) && (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-center">
                <p className="text-[10px] text-gray-500">
                  Payment is due within {invoiceData.paymentTerms.replace('net', '').replace('immediate', '0')} days of invoice date.
                  Late payments may incur additional fees.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Return preview mode if selected
  if (viewMode === 'preview') {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setViewMode('edit');
          }
        }}
      >
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
          {/* Preview Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToEdit}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Edit
                </button>
                <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 text-sm"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Preview Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-80px)] bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
              <InvoicePreview />
            </div>
          </div>
        </div>
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
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address (Optional)</label>
                    <textarea
                      value={invoiceData.clientAddress}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
                      placeholder="123 Client Street, City, State, ZIP"
                      rows={2}
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                </div>
              </div>

              {/* Creator Details Card */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center mb-4">
                  <Building className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Creator Details</h3>
                </div>
                <div className="space-y-4">
                  {/* Creator Details Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Select which details show on invoice</h4>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors w-fit min-w-[180px]">
                        <input
                          type="checkbox"
                          checked={invoiceData.customization?.showBusinessName ?? defaultCustomization.showBusinessName}
                          onChange={(e) => setInvoiceData(prev => ({
                            ...prev,
                            customization: { ...(prev.customization || defaultCustomization), showBusinessName: e.target.checked }
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                        />
                        <span className="text-sm font-medium whitespace-nowrap">Business Name</span>
                      </label>
                      <label className="flex items-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors w-fit min-w-[180px]">
                        <input
                          type="checkbox"
                          checked={invoiceData.customization?.showPhone ?? defaultCustomization.showPhone}
                          onChange={(e) => setInvoiceData(prev => ({
                            ...prev,
                            customization: { ...(prev.customization || defaultCustomization), showPhone: e.target.checked }
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                        />
                        <span className="text-sm font-medium whitespace-nowrap">Phone Number</span>
                      </label>
                      <label className="flex items-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors w-fit min-w-[180px]">
                        <input
                          type="checkbox"
                          checked={invoiceData.customization?.showWebsite ?? defaultCustomization.showWebsite}
                          onChange={(e) => setInvoiceData(prev => ({
                            ...prev,
                            customization: { ...(prev.customization || defaultCustomization), showWebsite: e.target.checked }
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                        />
                        <span className="text-sm font-medium whitespace-nowrap">Website</span>
                      </label>
                      <label className="flex items-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors w-fit min-w-[180px]">
                        <input
                          type="checkbox"
                          checked={invoiceData.customization?.showAddress ?? defaultCustomization.showAddress}
                          onChange={(e) => setInvoiceData(prev => ({
                            ...prev,
                            customization: { ...(prev.customization || defaultCustomization), showAddress: e.target.checked }
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                        />
                        <span className="text-sm font-medium whitespace-nowrap">Address</span>
                      </label>
                      <label className="flex items-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors w-fit min-w-[180px]">
                        <input
                          type="checkbox"
                          checked={invoiceData.customization?.showTaxId ?? defaultCustomization.showTaxId}
                          onChange={(e) => setInvoiceData(prev => ({
                            ...prev,
                            customization: { ...(prev.customization || defaultCustomization), showTaxId: e.target.checked }
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                        />
                        <span className="text-sm font-medium whitespace-nowrap">Tax ID</span>
                      </label>
                      <label className="flex items-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors w-fit min-w-[180px]">
                        <input
                          type="checkbox"
                          checked={invoiceData.customization?.showInstagram ?? defaultCustomization.showInstagram}
                          onChange={(e) => setInvoiceData(prev => ({
                            ...prev,
                            customization: { ...(prev.customization || defaultCustomization), showInstagram: e.target.checked }
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                        />
                        <span className="text-sm font-medium whitespace-nowrap">Social Media Handle</span>
                      </label>
                    </div>

                    {/* Conditional input fields */}
                    <div className="mt-4 space-y-3">
                      {(invoiceData.customization?.showBusinessName ?? defaultCustomization.showBusinessName) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label>
                          <input
                            type="text"
                            value={invoiceData.creatorBusinessName}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, creatorBusinessName: e.target.value }))}
                            placeholder="Your Business Name"
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      )}

                      {(invoiceData.customization?.showPhone ?? defaultCustomization.showPhone) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={invoiceData.creatorPhone}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, creatorPhone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      )}

                      {(invoiceData.customization?.showWebsite ?? defaultCustomization.showWebsite) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                          <input
                            type="url"
                            value={invoiceData.creatorWebsite}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, creatorWebsite: e.target.value }))}
                            placeholder="https://www.yourwebsite.com"
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      )}

                      {(invoiceData.customization?.showAddress ?? defaultCustomization.showAddress) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                          <textarea
                            value={invoiceData.creatorAddress}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, creatorAddress: e.target.value }))}
                            placeholder="123 Main Street&#10;City, State 12345&#10;Country"
                            rows={3}
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-vertical"
                          />
                        </div>
                      )}

                      {(invoiceData.customization?.showTaxId ?? defaultCustomization.showTaxId) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tax ID</label>
                          <input
                            type="text"
                            value={invoiceData.creatorTaxId}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, creatorTaxId: e.target.value }))}
                            placeholder="12-3456789"
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      )}

                      {(invoiceData.customization?.showInstagram ?? defaultCustomization.showInstagram) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Social Media Handle</label>
                          <input
                            type="text"
                            value={invoiceData.creatorInstagram}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, creatorInstagram: e.target.value }))}
                            placeholder="@yourusername"
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right 2 Columns - Line Items, Payment Terms, Total */}
            <div className="col-span-2 space-y-6">

              {/* Services & Line Items Card */}
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-pink-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Services & Line Items</h3>
                  </div>
                  <button
                    onClick={addLineItem}
                    className="flex items-center px-3 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors duration-200 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {invoiceData.lineItems.map((item) => (
                    <div key={item.id} className="space-y-3">
                      <div className="space-y-3">
                        {/* Service Name */}
                        <div>
                          <input
                            type="text"
                            value={item.service}
                            onChange={(e) => updateLineItem(item.id, 'service', e.target.value)}
                            placeholder="Service (e.g., Social Media Content Creation)"
                            className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                          />
                        </div>

                        {/* Description and Details Row */}
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
                  <div className="mt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tax Name</label>
                        <input
                          type="text"
                          value={invoiceData.taxName || ''}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, taxName: e.target.value }))}
                          placeholder="VAT, GST, Sales Tax..."
                          className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                        <input
                          type="number"
                          value={invoiceData.taxRate === 0 ? '' : invoiceData.taxRate}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                          onFocus={(e) => e.target.select()}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="20"
                          className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Discount Fields */}
                {showDiscount && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount Rate (%)</label>
                    <input
                      type="number"
                      value={invoiceData.discountRate === 0 ? '' : invoiceData.discountRate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 0 }))}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="10"
                      className="w-32 text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
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
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'bank', label: 'Bank Transfer', icon: Banknote },
                          { key: 'paypal', label: 'PayPal', icon: CreditCard }
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
                            <method.icon className="w-4 h-4 mr-2 text-purple-600" />
                            <span className="text-sm font-medium">{method.label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Custom Payment Method */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={customPaymentMethod}
                            onChange={(e) => setCustomPaymentMethod(e.target.value)}
                            placeholder="Add custom payment method (e.g., Zelle, Venmo, Stripe, etc.)"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customPaymentMethod.trim() && !invoiceData.paymentMethods.includes(customPaymentMethod.trim())) {
                                setInvoiceData(prev => ({
                                  ...prev,
                                  paymentMethods: [...prev.paymentMethods, customPaymentMethod.trim()]
                                }));
                                setCustomPaymentMethod('');
                              }
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
                          >
                            Add
                          </button>
                        </div>

                        {/* Display custom payment methods */}
                        {invoiceData.paymentMethods.filter(method => !['bank', 'paypal'].includes(method)).length > 0 && (
                          <div className="space-y-1">
                            {invoiceData.paymentMethods.filter(method => !['bank', 'paypal'].includes(method)).map(method => (
                              <div key={method} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
                                  <span className="text-sm font-medium">{method}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInvoiceData(prev => ({
                                      ...prev,
                                      paymentMethods: prev.paymentMethods.filter(m => m !== method)
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Payment Instructions</label>
                    <textarea
                      value={invoiceData.paymentInstructions}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, paymentInstructions: e.target.value }))}
                      rows={3}
                      placeholder="Bank details, PayPal email, Stripe link, or other payment instructions..."
                      className="w-full text-sm py-2 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      placeholder="Additional notes or comments..."
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
                      <span className="text-3xl font-bold text-black">
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