import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Send, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import { InvoiceData } from './InvoiceGenerator';

interface InvoiceDraftsProps {
  onEditInvoice: (invoice: InvoiceData) => void;
}

const InvoiceDrafts: React.FC<InvoiceDraftsProps> = ({ onEditInvoice }) => {
  const [drafts, setDrafts] = useState<InvoiceData[]>([]);

  const currencies = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'CHF': 'CHF',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr'
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const savedDrafts = JSON.parse(localStorage.getItem('invoiceDrafts') || '[]');
    setDrafts(savedDrafts);
  };

  const deleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem('invoiceDrafts', JSON.stringify(updatedDrafts));
  };

  const sendInvoice = (invoice: InvoiceData) => {
    const updatedInvoice = { ...invoice, status: 'sent' as const };
    const updatedDrafts = drafts.map(draft => 
      draft.id === invoice.id ? updatedInvoice : draft
    );
    setDrafts(updatedDrafts);
    localStorage.setItem('invoiceDrafts', JSON.stringify(updatedDrafts));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (drafts.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-200/50">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoice Drafts</h3>
          <p className="text-gray-600">Create your first invoice to see drafts here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Invoice Drafts</h2>
            <p className="text-gray-600 mt-1">Manage your saved invoice drafts</p>
          </div>
          <div className="text-sm text-gray-500">
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
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
            {drafts.map((draft) => {
              const currencySymbol = currencies[draft.currency as keyof typeof currencies] || '$';
              
              return (
                <tr key={draft.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{draft.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          Created {new Date(draft.issueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">{draft.clientCompany || 'No Company'}</div>
                        <div className="text-sm text-gray-500">{draft.clientContact || 'No Contact'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-semibold text-gray-900">
                        {currencySymbol}{draft.total.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(draft.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(draft.status)}`}>
                      {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEditInvoice(draft)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                        title="Edit Draft"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {draft.status === 'draft' && (
                        <button
                          onClick={() => sendInvoice(draft)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Send Invoice"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Draft"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
};

export default InvoiceDrafts;