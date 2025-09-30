import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Eye, MoreHorizontal, Copy, EyeOff } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import StatusDropdown from './StatusDropdown';

const BrandDeals = () => {
  const { brandDeals, updateBrandDeal, createBrandDeal, deleteBrandDeal } = useSupabase();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hiddenDeals, setHiddenDeals] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [newDeal, setNewDeal] = useState({
    brand_name: '',
    contact_name: '',
    contact_email: '',
    deliverables: '',
    fee: 0,
    status: 'proposal_sent' as const,
    start_date: '',
    end_date: ''
  });

  const statusConfig = {
    negotiation: {
      label: 'Negotiation',
      color: 'bg-orange-100 text-orange-800',
      hoverColor: 'hover:bg-orange-200',
      selectedColor: 'bg-orange-200 border-orange-300'
    },
    proposal_sent: {
      label: 'Proposal Sent',
      color: 'bg-blue-100 text-blue-800',
      hoverColor: 'hover:bg-blue-200',
      selectedColor: 'bg-blue-200 border-blue-300'
    },
    posted: {
      label: 'Posted',
      color: 'bg-green-100 text-green-800',
      hoverColor: 'hover:bg-green-200',
      selectedColor: 'bg-green-200 border-green-300'
    },
    awaiting_payment: {
      label: 'Awaiting Payment',
      color: 'bg-yellow-100 text-yellow-800',
      hoverColor: 'hover:bg-yellow-200',
      selectedColor: 'bg-yellow-200 border-yellow-300'
    },
    revisions_needed: {
      label: 'Revisions Needed',
      color: 'bg-orange-100 text-orange-800',
      hoverColor: 'hover:bg-orange-200',
      selectedColor: 'bg-orange-200 border-orange-300'
    },
    approved: {
      label: 'Approved',
      color: 'bg-green-100 text-green-800',
      hoverColor: 'hover:bg-green-200',
      selectedColor: 'bg-green-200 border-green-300'
    },
    completed: {
      label: 'Completed',
      color: 'bg-emerald-100 text-emerald-800',
      hoverColor: 'hover:bg-emerald-200',
      selectedColor: 'bg-emerald-200 border-emerald-300'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800',
      hoverColor: 'hover:bg-red-200',
      selectedColor: 'bg-red-200 border-red-300'
    }
  };

  const filteredDeals = brandDeals.filter(deal => {
    const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
    const matchesSearch = deal.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.deliverables.toLowerCase().includes(searchTerm.toLowerCase());
    const isHidden = hiddenDeals.has(deal.id);

    // If showing hidden deals, only show hidden ones
    if (showHidden) {
      return isHidden && matchesStatus && matchesSearch;
    }

    // Otherwise, show only non-hidden deals
    return !isHidden && matchesStatus && matchesSearch;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

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
        status: 'proposal_sent',
        start_date: '',
        end_date: ''
      });
    } catch (error) {
      console.error('Error creating brand deal:', error);
    }
  };

  const handleUpdateStatus = async (dealId: string, newStatus: string) => {
    try {
      await updateBrandDeal(dealId, { status: newStatus as 'negotiation' | 'proposal_sent' | 'posted' | 'awaiting_payment' | 'revisions_needed' | 'approved' | 'completed' | 'cancelled' });
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

  const handleDuplicateDeal = async (dealId: string) => {
    try {
      const dealToDuplicate = brandDeals.find(deal => deal.id === dealId);
      if (dealToDuplicate) {
        const duplicatedDeal = {
          brand_name: `${dealToDuplicate.brand_name} (Copy)`,
          contact_name: dealToDuplicate.contact_name,
          contact_email: dealToDuplicate.contact_email,
          deliverables: dealToDuplicate.deliverables,
          fee: dealToDuplicate.fee,
          status: dealToDuplicate.status,
          start_date: dealToDuplicate.start_date,
          end_date: dealToDuplicate.end_date
        };
        await createBrandDeal(duplicatedDeal);
      }
    } catch (error) {
      console.error('Error duplicating brand deal:', error);
    }
  };

  const handleHideDeal = (dealId: string) => {
    setHiddenDeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleRowClick = (deal: any) => {
    setEditingDeal({ ...deal });
    setShowEditModal(true);
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;

    try {
      await updateBrandDeal(editingDeal.id, {
        brand_name: editingDeal.brand_name,
        contact_name: editingDeal.contact_name,
        contact_email: editingDeal.contact_email,
        deliverables: editingDeal.deliverables,
        fee: editingDeal.fee,
        status: editingDeal.status,
        start_date: editingDeal.start_date,
        end_date: editingDeal.end_date
      });
      setShowEditModal(false);
      setEditingDeal(null);
    } catch (error) {
      console.error('Error updating brand deal:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center pt-4 mb-6">
        <div className="flex items-center space-x-4">
          {showSearchBar && (
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 bg-white/60 backdrop-blur-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setShowSearchBar(!showSearchBar);
                if (!showSearchBar) {
                  setSearchTerm('');
                }
              }}
              className="p-2 text-[#1c2d5a] hover:text-[#d2d2f7] rounded-lg transition-colors duration-200"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showHidden
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-[#1c2d5a] hover:text-[#d2d2f7]'
              }`}
              title={showHidden ? 'Show active deals' : 'Show hidden deals'}
            >
              {showHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <Filter className="w-5 h-5 text-[#1c2d5a]" />
            <select
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 bg-white/60 backdrop-blur-sm"
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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#D23075] transition-all duration-200 shadow-lg text-base mr-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 mb-1">
        <div className="col-span-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</div>
        </div>
        <div className="col-span-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Deliverables</div>
        </div>
        <div className="col-span-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</div>
        </div>
        <div className="col-span-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</div>
        </div>
        <div className="col-span-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider"></div>
        </div>
      </div>

      {/* Individual Deal Cards */}
      <div className="space-y-4">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleRowClick(deal)}
          >
            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              {/* Brand */}
              <div className="col-span-2">
                <div className="font-medium text-gray-900">{deal.brand_name}</div>
                <div className="text-xs text-gray-500">{formatDate(deal.start_date)} to {formatDate(deal.end_date)}</div>
              </div>

              {/* Deliverables */}
              <div className="col-span-3">
                <div className="text-sm text-gray-900">{deal.deliverables}</div>
              </div>

              {/* Fee */}
              <div className="col-span-1">
                <div className="text-lg font-semibold text-gray-900">${deal.fee.toLocaleString()}</div>
              </div>

              {/* Status */}
              <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
                <StatusDropdown
                  currentStatus={deal.status}
                  statusConfig={statusConfig}
                  onStatusChange={(newStatus) => handleUpdateStatus(deal.id, newStatus)}
                />
              </div>

              {/* Contact */}
              <div className="col-span-2">
                <div className="text-sm text-gray-900">{deal.contact_name}</div>
                <div className="text-xs text-gray-500">{deal.contact_email}</div>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end">
                <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === deal.id ? null : deal.id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openDropdown === deal.id && (
                    <div
                      className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          handleRowClick(deal);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          handleDuplicateDeal(deal.id);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          handleHideDeal(deal.id);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        {hiddenDeals.has(deal.id) ? (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Unhide
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Hide
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          handleDeleteDeal(deal.id);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No brand deals found</h3>
          <p className="text-gray-600 mb-6">Start building partnerships with brands</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-6 py-3 bg-[#E83F87] text-white rounded-xl hover:bg-[#D23075] transition-all duration-200 shadow-lg text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
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
                    onChange={(e) => setNewDeal({ ...newDeal, status: e.target.value as 'negotiation' | 'proposal_sent' | 'posted' | 'awaiting_payment' | 'revisions_needed' | 'approved' | 'completed' | 'cancelled' })}
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

      {/* Edit Modal */}
      {showEditModal && editingDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Brand Deal</h2>
            <form onSubmit={handleUpdateDeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                  <input
                    type="text"
                    value={editingDeal.brand_name}
                    onChange={(e) => setEditingDeal({ ...editingDeal, brand_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Enter brand name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={editingDeal.contact_name}
                    onChange={(e) => setEditingDeal({ ...editingDeal, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Contact name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingDeal.contact_email}
                  onChange={(e) => setEditingDeal({ ...editingDeal, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  placeholder="contact@brand.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deliverables</label>
                <input
                  type="text"
                  value={editingDeal.deliverables}
                  onChange={(e) => setEditingDeal({ ...editingDeal, deliverables: e.target.value })}
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
                    value={editingDeal.fee}
                    onChange={(e) => setEditingDeal({ ...editingDeal, fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingDeal.status}
                    onChange={(e) => setEditingDeal({ ...editingDeal, status: e.target.value as 'negotiation' | 'proposal_sent' | 'posted' | 'awaiting_payment' | 'revisions_needed' | 'approved' | 'completed' | 'cancelled' })}
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
                    value={editingDeal.start_date}
                    onChange={(e) => setEditingDeal({ ...editingDeal, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={editingDeal.end_date}
                    onChange={(e) => setEditingDeal({ ...editingDeal, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDeal(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#D23075] transition-all duration-200">
                  Update Deal
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