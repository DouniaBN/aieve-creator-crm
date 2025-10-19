import React from 'react';
import { Edit, Trash2, Send, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAppContext } from '../contexts/AppContext';
import { Invoice } from '../lib/supabase';

interface InvoiceDraftsProps {
  onEditInvoice: (invoice: Invoice) => void;
}

const InvoiceDrafts: React.FC<InvoiceDraftsProps> = ({ onEditInvoice }) => {
  const { invoices, updateInvoice, deleteInvoice } = useSupabase();
  const { showSuccessMessage } = useAppContext();

  // Filter invoices to show only drafts
  const drafts = invoices.filter(invoice => invoice.status === 'draft');

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

  const deleteDraft = async (id: string) => {
    try {
      await deleteInvoice(id);
      showSuccessMessage('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      showSuccessMessage('Error deleting draft');
    }
  };

  const sendInvoice = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: 'sent' });
      showSuccessMessage('Invoice sent successfully');
    } catch (error) {
      console.error('Error sending invoice:', error);
      showSuccessMessage('Error sending invoice');
    }
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
                        <div className="font-medium text-gray-900">{draft.invoice_number}</div>
                        <div className="text-sm text-gray-500">
                          Created {new Date(draft.issue_date || draft.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">{draft.client_name || 'No Client'}</div>
                        <div className="text-sm text-gray-500">{draft.project || 'No Project'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-semibold text-gray-900">
                        {currencySymbol}{draft.amount.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(draft.due_date).toLocaleDateString()}
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
                        className="p-2 text-gray-400 hover:text-[#1c2d5a] hover:bg-purple-50 rounded-lg transition-colors duration-200"
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