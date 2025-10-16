import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Eye, MoreHorizontal, Copy, EyeOff, MessageSquare, Send, DollarSign, Edit3, CheckCircle, Sparkles, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import StatusDropdown from './StatusDropdown';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const BrandDeals = () => {
  const { brandDeals, updateBrandDeal, createBrandDeal, deleteBrandDeal, createInvoiceFromBrandDeal } = useSupabase();
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
    status: 'in_discussion' as const,
    start_date: '',
    end_date: ''
  });

  const [feeInput, setFeeInput] = useState('');
  const [editFeeInput, setEditFeeInput] = useState('');

  // Currency formatting functions
  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');

    // Split by decimal point
    const parts = numericValue.split('.');

    // Format the integer part with commas
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Return formatted value (with decimal if it exists)
    return parts.length > 1 ? `${integerPart}.${parts[1].slice(0, 2)}` : integerPart;
  };

  const parseCurrencyToNumber = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    return parseFloat(numericValue) || 0;
  };

  const statusConfig = {
    in_discussion: {
      label: 'In Discussion',
      icon: MessageSquare,
      color: 'bg-[#C4B5FD] text-[#5B21B6]',
      hoverColor: 'hover:bg-[#B19AFF]',
      selectedColor: 'bg-[#B19AFF] border-[#5B21B6]'
    },
    posted: {
      label: 'Posted',
      icon: Send,
      color: 'bg-[#FBCFE8] text-[#E83F87]',
      hoverColor: 'hover:bg-[#F8BBE1]',
      selectedColor: 'bg-[#F8BBE1] border-[#E83F87]'
    },
    awaiting_payment: {
      label: 'Awaiting Payment',
      icon: DollarSign,
      color: 'bg-[#FDE68A] text-[#92400E]',
      hoverColor: 'hover:bg-[#FCD34D]',
      selectedColor: 'bg-[#FCD34D] border-[#92400E]'
    },
    revisions_needed: {
      label: 'Revisions Needed',
      icon: Edit3,
      color: 'bg-[#FDBA74] text-[#9A3412]',
      hoverColor: 'hover:bg-[#FCA55F]',
      selectedColor: 'bg-[#FCA55F] border-[#9A3412]'
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      color: 'bg-[#DBEAFE] text-[#1E40AF]',
      hoverColor: 'hover:bg-[#BFDBFE]',
      selectedColor: 'bg-[#BFDBFE] border-[#1E40AF]'
    },
    completed: {
      label: 'Completed',
      icon: Sparkles,
      color: 'bg-[#6EE7B7] text-[#065F46]',
      hoverColor: 'hover:bg-[#5BD8A6]',
      selectedColor: 'bg-[#5BD8A6] border-[#065F46]'
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      color: 'bg-[#FCA5A5] text-[#991B1B]',
      hoverColor: 'hover:bg-[#F87171]',
      selectedColor: 'bg-[#F87171] border-[#991B1B]'
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

  // Calculate quick stats
  const totalDealsValue = brandDeals.reduce((sum, deal) => sum + (deal.fee || 0), 0);

  const completedThisMonth = brandDeals.filter(deal => {
    if (deal.status !== 'completed') return false;

    const dealEndDate = new Date(deal.end_date);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return dealEndDate >= startOfMonth && dealEndDate <= endOfMonth;
  }).reduce((sum, deal) => sum + (deal.fee || 0), 0);

  const activeDealsCount = brandDeals.length;

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
        status: 'in_discussion',
        start_date: '',
        end_date: ''
      });
      setFeeInput('');
    } catch (error) {
      console.error('Error creating brand deal:', error);
    }
  };

  const handleUpdateStatus = async (dealId: string, newStatus: string) => {
    try {
      await updateBrandDeal(dealId, { status: newStatus as 'negotiation' | 'proposal_sent' | 'posted' | 'awaiting_payment' | 'revisions_needed' | 'approved' | 'completed' | 'cancelled' });

      // Auto-create invoice when deal is completed or posted and has a fee
      if ((newStatus === 'completed' || newStatus === 'posted') && dealId) {
        const deal = brandDeals.find(d => d.id === dealId);

        if (deal && deal.fee && deal.fee > 0) {
          try {
            await createInvoiceFromBrandDeal(deal);
            // Success notification will be shown by the invoice creation
          } catch (error) {
            console.error('Error auto-creating invoice:', error);
          }
        }
      }
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

  const getDaysUntilDue = (endDate: string) => {
    if (!endDate) return { days: 0, text: '', color: 'text-gray-500' };

    const today = new Date();
    const dueDate = new Date(endDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let text = '';
    let color = 'text-gray-500';

    if (diffDays < 0) {
      text = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
      color = 'text-red-800';
    } else if (diffDays === 0) {
      text = 'Due today';
      color = 'text-red-600';
    } else if (diffDays === 1) {
      text = 'Due in 1 day';
      color = 'text-red-600';
    } else if (diffDays === 2) {
      text = 'Due in 2 days';
      color = 'text-red-600';
    } else if (diffDays <= 6) {
      text = `Due in ${diffDays} days`;
      color = 'text-amber-600';
    } else {
      text = `Due in ${diffDays} days`;
      color = 'text-gray-500';
    }

    return { days: diffDays, text, color };
  };

  const handleRowClick = (deal: any) => {
    setEditingDeal({ ...deal });
    // Format the fee for display in the edit input
    const formattedFee = deal.fee ? formatCurrency(deal.fee.toString()) : '';
    setEditFeeInput(formattedFee);
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

      // Auto-create invoice when deal is completed or posted and has a fee
      if ((editingDeal.status === 'completed' || editingDeal.status === 'posted') && editingDeal.fee && editingDeal.fee > 0) {
        try {
          await createInvoiceFromBrandDeal(editingDeal);
          console.log(`Invoice automatically created for brand deal: ${editingDeal.brand_name}`);
        } catch (error) {
          console.error('Error auto-creating invoice:', error);
        }
      }

      setShowEditModal(false);
      setEditingDeal(null);
      setEditFeeInput('');
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
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 bg-white/60 backdrop-blur-sm"
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
          className="flex items-center px-5 py-3 bg-[#E83F87] text-white rounded-xl hover:bg-[#D23075] transition-all duration-200 shadow-lg text-base mr-4"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Deal
        </button>
      </div>

      {/* Quick Stats Section */}
      <div className="mb-2 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#FF6FAE]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Deals Value</p>
              <p className="text-2xl font-bold text-[#1c2d5a]">${totalDealsValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-[#FF6FAE] opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#6EE7B7]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Completed This Month</p>
              <p className="text-2xl font-bold text-[#1c2d5a]">${completedThisMonth.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-[#6EE7B7] opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#cfcffa]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active Deals</p>
              <p className="text-2xl font-bold text-[#1c2d5a]">{activeDealsCount}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-[#cfcffa] opacity-20" />
          </div>
        </div>
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
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Status</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Contact</div>
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
                <div className="font-semibold text-lg text-[#1c2d5a]">{deal.brand_name}</div>
                {deal.status !== 'completed' && deal.status !== 'posted' && deal.status !== 'cancelled' && (
                  <div
                    className={`text-xs font-medium ${getDaysUntilDue(deal.end_date).color}`}
                    title={`Start: ${formatDate(deal.start_date)} | End: ${formatDate(deal.end_date)}`}
                  >
                    {getDaysUntilDue(deal.end_date).text}
                  </div>
                )}
              </div>

              {/* Deliverables */}
              <div className="col-span-3">
                <div className="text-sm text-[#1c2d5a]">{deal.deliverables}</div>
              </div>

              {/* Fee */}
              <div className="col-span-1">
                <div className="text-lg font-semibold text-[#1c2d5a]">${deal.fee.toLocaleString()}</div>
              </div>

              {/* Status */}
              <div className="col-span-3 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <StatusDropdown
                  currentStatus={deal.status}
                  statusConfig={statusConfig}
                  onStatusChange={(newStatus) => handleUpdateStatus(deal.id, newStatus)}
                />
              </div>

              {/* Contact */}
              <div className="col-span-2 text-center">
                <div className="text-sm text-[#1c2d5a]">{deal.contact_name}</div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showHidden ? 'No hidden brand deals found' : 'No brand deals found'}
          </h3>
          {!showHidden && <p className="text-gray-600 mb-6">Start building partnerships with brands</p>}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#D23075] transition-all duration-200 shadow-lg text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4" style={{ isolation: 'isolate' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10">
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
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-base">$</span>
                    </div>
                    <input
                      type="text"
                      value={feeInput}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value);
                        setFeeInput(formatted);
                        setNewDeal({ ...newDeal, fee: parseCurrencyToNumber(formatted) });
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                      placeholder="Enter amount"
                      inputMode="numeric"
                    />
                  </div>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200",
                          !newDeal.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDeal.start_date ? (
                          format(new Date(newDeal.start_date), "PPP")
                        ) : (
                          <span>Pick start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100001]" align="start">
                      <Calendar
                        mode="single"
                        selected={newDeal.start_date ? new Date(newDeal.start_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setNewDeal({ ...newDeal, start_date: format(date, 'yyyy-MM-dd') });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200",
                          !newDeal.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDeal.end_date ? (
                          format(new Date(newDeal.end_date), "PPP")
                        ) : (
                          <span>Pick end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100001]" align="start">
                      <Calendar
                        mode="single"
                        selected={newDeal.end_date ? new Date(newDeal.end_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setNewDeal({ ...newDeal, end_date: format(date, 'yyyy-MM-dd') });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFeeInput('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-all duration-200">
                  Add Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4" style={{ isolation: 'isolate' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10">
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
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-base">$</span>
                    </div>
                    <input
                      type="text"
                      value={editFeeInput}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value);
                        setEditFeeInput(formatted);
                        setEditingDeal({ ...editingDeal, fee: parseCurrencyToNumber(formatted) });
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                      placeholder="Enter amount"
                      inputMode="numeric"
                    />
                  </div>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200",
                          !editingDeal.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingDeal.start_date ? (
                          format(new Date(editingDeal.start_date), "PPP")
                        ) : (
                          <span>Pick start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100001]" align="start">
                      <Calendar
                        mode="single"
                        selected={editingDeal.start_date ? new Date(editingDeal.start_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setEditingDeal({ ...editingDeal, start_date: format(date, 'yyyy-MM-dd') });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200",
                          !editingDeal.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingDeal.end_date ? (
                          format(new Date(editingDeal.end_date), "PPP")
                        ) : (
                          <span>Pick end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100001]" align="start">
                      <Calendar
                        mode="single"
                        selected={editingDeal.end_date ? new Date(editingDeal.end_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setEditingDeal({ ...editingDeal, end_date: format(date, 'yyyy-MM-dd') });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDeal(null);
                    setEditFeeInput('');
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