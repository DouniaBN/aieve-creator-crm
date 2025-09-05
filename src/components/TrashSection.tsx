import React from 'react';
import { RotateCcw, Trash, AlertTriangle, Calendar, DollarSign, FileText } from 'lucide-react';

interface TrashedInvoice {
  id: number;
  invoiceNumber: string;
  client: string;
  amount: number;
  dueDate: string;
  status: string;
  project: string;
  deletedAt: string;
}

interface TrashSectionProps {
  trashedInvoices: TrashedInvoice[];
  onRestore: (invoice: TrashedInvoice) => void;
  onPermanentDelete: (invoice: TrashedInvoice) => void;
  onEmptyTrash: () => void;
}

const TrashSection: React.FC<TrashSectionProps> = ({
  trashedInvoices,
  onRestore,
  onPermanentDelete,
  onEmptyTrash
}) => {
  if (trashedInvoices.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-200/50">
        <div className="text-center">
          <Trash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Trash is Empty</h3>
          <p className="text-gray-600">Deleted invoices will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Trash</h2>
            <p className="text-gray-600 mt-1">Manage deleted invoices</p>
          </div>
          {trashedInvoices.length > 0 && (
            <button
              onClick={onEmptyTrash}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
            >
              <Trash className="w-4 h-4 mr-2" />
              Empty Trash
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {trashedInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors duration-200 opacity-75">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{invoice.project}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-semibold text-gray-900">${invoice.amount.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(invoice.deletedAt).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onRestore(invoice)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Restore Invoice"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPermanentDelete(invoice)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Forever"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Warning Message */}
      <div className="p-6 border-t border-gray-200/50">
        <div className="flex items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
          <div className="text-sm text-yellow-800">
            <strong>Warning:</strong> Items in trash will be automatically deleted after 30 days. 
            Use "Restore\" to move them back to your invoice list.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrashSection;