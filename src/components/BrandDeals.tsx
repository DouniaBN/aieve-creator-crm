import React, { useState } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Eye, Handshake, CheckCircle, Upload, X } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import StatusDropdown from './StatusDropdown';

const BrandDeals = () => {
  const { brandDeals, updateBrandDeal, createBrandDeal, deleteBrandDeal } = useSupabase();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newDeal, setNewDeal] = useState({
    brand_name: '',
    contact_name: '',
    contact_email: '',
    deliverables: '',
    fee: 0,
    status: 'negotiation' as const,
    start_date: '',
    end_date: ''
  });

  const statusConfig = {
    negotiation: { 
      label: 'Negotiation', 
      icon: Handshake,
      color: 'bg-orange-100 text-orange-800',
      hoverColor: 'hover:bg-orange-200',
      selectedColor: 'bg-orange-200 border-orange-300'
    },
    confirmed: { 
      label: 'Confirmed', 
      icon: CheckCircle,
      color: 'bg-blue-100 text-blue-800',
      hoverColor: 'hover:bg-blue-200',
      selectedColor: 'bg-blue-200 border-blue-300'
    },
    completed: { 
      label: 'Completed', 
      icon: Upload,
      color: 'bg-green-100 text-green-800',
      hoverColor: 'hover:bg-green-200',
      selectedColor: 'bg-green-200 border-green-300'
    },
    cancelled: { 
      label: 'Cancelled', 
      icon: X,
      color: 'bg-red-100 text-red-800',
      hoverColor: 'hover:bg-red-200',
      selectedColor: 'bg-red-200 border-red-300'
    }
  };

  const filteredDeals = brandDeals.filter(deal => {
    const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
    const matchesSearch = deal.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.deliverables.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBrandDeal(newDeal);
      setShowModal(false);
      setNewDeal({
        brand_name: '',
        contact_name: '',
        contact_email: '',
        deliverables: '',
        fee: 0,
        status: 'negotiation',
        start_date: '',
        end_date: ''
      });
    } catch (error) {
      console.error('Error creating brand deal:', error);
    }
  };

  const handleUpdateStatus = async (dealId: string, newStatus: string) => {
    try {
      await updateBrandDeal(dealId, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating brand deal status:', error);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this brand deal?')) {
      try {
        await deleteBrandDeal(dealId);
      } catch (error) {
        console.error('Error deleting brand deal:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Brand Deals</h1>
            <p className="text-gray-600 mt-1">Track and manage your brand partnerships</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </button>
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
                placeholder="Search deals..."
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

      {/* Deals Table */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliverables</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {filteredDeals.map((deal) => {
                return (
                <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{deal.brand_name}</div>
                    <div className="text-sm text-gray-500">{deal.start_date} - {deal.end_date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.deliverables}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${deal.fee.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusDropdown
                      currentStatus={deal.status}
                      statusConfig={statusConfig}
                      onStatusChange={(newStatus) => handleUpdateStatus(deal.id, newStatus)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{deal.contact_name}</div>
                    <div className="text-gray-500">{deal.contact_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" onClick={() => handleDeleteDeal(deal.id)}>
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

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No brand deals found</h3>
          <p className="text-gray-600 mb-6">Start building partnerships with brands</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Brand Deal</h2>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                  <input
                    type="text"
                    value={newDeal.brand_name}
                    onChange={(e) => setNewDeal({ ...newDeal, brand_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Enter brand name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={newDeal.contact_name}
                    onChange={(e) => setNewDeal({ ...newDeal, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Contact name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newDeal.contact_email}
                  onChange={(e) => setNewDeal({ ...newDeal, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  placeholder="contact@brand.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deliverables</label>
                <input
                  type="text"
                  value={newDeal.deliverables}
                  onChange={(e) => setNewDeal({ ...newDeal, deliverables: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  placeholder="e.g., 2 Instagram Posts, 1 Story"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fee</label>
                  <input
                    type="number"
                    value={newDeal.fee}
                    onChange={(e) => setNewDeal({ ...newDeal, fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    value={newDeal.status}
                    onChange={(e) => setNewDeal({ ...newDeal, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newDeal.start_date}
                    onChange={(e) => setNewDeal({ ...newDeal, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newDeal.end_date}
                    onChange={(e) => setNewDeal({ ...newDeal, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                  Add Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandDeals;