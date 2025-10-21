import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Globe, Mail, FileText, Instagram, Youtube, Linkedin } from 'lucide-react';
import { format } from 'date-fns';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAppContext } from '../contexts/AppContext';
import { ContentPost } from '../lib/supabase';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// Custom X Icon component
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Pinterest Icon component using Font Awesome
const PinterestIcon = () => (
  <i className="fab fa-pinterest mr-1 text-red-600"></i>
);

// TikTok Icon component using Font Awesome
const TikTokIcon = () => (
  <i className="fab fa-tiktok mr-1"></i>
);

// Facebook Icon component using Font Awesome
const FacebookIcon = () => (
  <i className="fab fa-facebook mr-1 text-blue-600"></i>
);


// Reddit Icon component using Font Awesome
const RedditIcon = () => (
  <i className="fab fa-reddit mr-1 text-red-600"></i>
);

// Threads Icon component using @ symbol
const ThreadsIcon = () => (
  <span className="mr-1 font-bold text-black">@</span>
);

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  onPostAdded?: () => void;
}

const AddPostModal: React.FC<AddPostModalProps> = ({ isOpen, onClose, initialDate, onPostAdded }) => {
  const { createContentPost, fetchContentPosts, brandDeals, fetchBrandDeals } = useSupabase();
  const { showSuccessMessage } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [linkToBrandDeal, setLinkToBrandDeal] = useState(false);
  const [selectedBrandDeal, setSelectedBrandDeal] = useState<string>('');
  
  // Safely convert initialDate to Date object with validation
  const [date] = useState(() => {
    if (!initialDate) return new Date();
    const d = new Date(initialDate);
    return isNaN(d.getTime()) ? new Date() : d;
  });
  
  const [formData, setFormData] = useState({
    title: '',
    platforms: [] as string[],
    status: 'draft' as ContentPost['status'],
    scheduled_date: initialDate ? date.toISOString().split('T')[0] : '',
    scheduled_time: null as Dayjs | null,
    content: ''
  });

  const platformOptions = [
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { value: 'x', label: 'X (Twitter)', icon: XIcon, color: 'text-gray-800' },
    { value: 'tiktok', label: 'TikTok', icon: TikTokIcon, color: 'text-black' },
    { value: 'blog', label: 'Blog', icon: FileText, color: 'text-[#1c2d5a]' },
    { value: 'facebook', label: 'Facebook', icon: FacebookIcon, color: 'text-gray-700' },
    { value: 'newsletter', label: 'Newsletter', icon: Mail, color: 'text-blue-600' },
    { value: 'pinterest', label: 'Pinterest', icon: PinterestIcon, color: 'text-red-600' },
    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { value: 'threads', label: 'Threads', icon: ThreadsIcon, color: 'text-gray-800' },
    { value: 'reddit', label: 'Reddit', icon: RedditIcon, color: 'text-gray-700' }
  ];

  const statusOptions = [
    { value: 'idea', label: 'Idea', color: 'text-purple-600' },
    { value: 'draft', label: 'Draft', color: 'text-gray-600' },
    { value: 'filmed', label: 'Filmed', color: 'text-orange-600' },
    { value: 'edited', label: 'Edited', color: 'text-yellow-600' },
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-600' },
    { value: 'published', label: 'Published', color: 'text-green-600' }
  ];

  // Fetch brand deals when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBrandDeals();
    }
  }, [isOpen, fetchBrandDeals]);

  // Get all brand deals (not just active ones) - user can choose any brand deal
  const availableBrandDeals = brandDeals.filter(deal =>
    deal.status !== 'cancelled' // Only exclude cancelled deals
  );

  // Get selected brand deal data
  const selectedDeal = availableBrandDeals.find(deal => deal.id === selectedBrandDeal);

  // Auto-populate title when brand deal is selected
  useEffect(() => {
    if (linkToBrandDeal && selectedDeal) {
      setFormData(prev => ({
        ...prev,
        title: selectedDeal.brand_name
      }));
    }
  }, [selectedBrandDeal, linkToBrandDeal, selectedDeal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (formData.platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a post title');
      return;
    }

    if (!formData.scheduled_date) {
      alert('Please select a date for the post');
      return;
    }
    
    setLoading(true);

    try {
      // Create a post for each selected platform
      
      for (const platform of formData.platforms) {
        // Combine date and time if both are provided
        let scheduledDateTime = undefined;
        if (formData.scheduled_date) {
          const dateTimeString = formData.scheduled_time
            ? `${formData.scheduled_date}T${formData.scheduled_time.format('HH:mm')}:00`
            : `${formData.scheduled_date}T12:00:00`;
          scheduledDateTime = new Date(dateTimeString).toISOString();
        }

        const postData: Omit<ContentPost, 'id' | 'user_id' | 'created_at'> = {
          title: formData.title,
          platform: platform as ContentPost['platform'],
          status: formData.status,
          scheduled_date: scheduledDateTime,
          project_id: undefined,
          brand_deal_id: linkToBrandDeal && selectedBrandDeal ? selectedBrandDeal : undefined
        };
        await createContentPost(postData);
      }
      
      // Show success message and close modal
      showSuccessMessage(`Successfully created ${formData.platforms.length} post${formData.platforms.length > 1 ? 's' : ''} for ${formData.title}`);
      
      // Force refresh of content posts to update calendar
      await fetchContentPosts();
      
      // Notify parent component
      if (onPostAdded) {
        onPostAdded();
      }
      
      // Reset form and close modal
      onClose();
      setFormData({
        title: '',
        platforms: [],
        status: 'draft',
        scheduled_date: '',
        scheduled_time: null,
        content: ''
      });
      setLinkToBrandDeal(false);
      setSelectedBrandDeal('');
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Full error object:', error);
      
      // More detailed error message
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platformValue: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformValue)
        ? prev.platforms.filter(p => p !== platformValue)
        : [...prev.platforms, platformValue]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Content Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-medium text-gray-700">Post Title</label>
              <div className={`inline-flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50/50 px-2 py-1.5`}>
                <label className="text-xs font-medium text-[#1c2d5a]">Link to Brand Deal</label>
                <button
                  type="button"
                  onClick={() => {
                    setLinkToBrandDeal(!linkToBrandDeal);
                    if (!linkToBrandDeal) {
                      setSelectedBrandDeal('');
                      setFormData(prev => ({ ...prev, title: '' }));
                    }
                  }}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[#E83F87] focus:ring-offset-1 ${
                    linkToBrandDeal ? 'bg-[#E83F87]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      linkToBrandDeal ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
              placeholder="Enter post title"
              required
              disabled={linkToBrandDeal && selectedDeal}
            />

            {linkToBrandDeal && (
              <div className="space-y-3 mt-3">
                {/* Brand Deal Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Brand Deal</label>
                  <select
                    value={selectedBrandDeal}
                    onChange={(e) => setSelectedBrandDeal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
                    required={linkToBrandDeal}
                  >
                    <option value="">Choose a brand deal...</option>
                    {availableBrandDeals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.brand_name} - ${deal.fee?.toLocaleString() || 0}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Deal Info */}
                {selectedDeal && (
                  <div className="bg-white rounded-lg p-3 border border-[#E83F87]/30">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedDeal.brand_name}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Deliverables:</span>
                        <p className="text-gray-700 mt-1">{selectedDeal.deliverables}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Fee:</span>
                        <span className="text-gray-700 ml-2">${selectedDeal.fee?.toLocaleString() || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          selectedDeal.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedDeal.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {availableBrandDeals.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No active brand deals available</p>
                    <p className="text-gray-400 text-xs mt-1">Create a brand deal first to link it to content posts</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platforms (can select multiple)</label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {platformOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.platforms.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePlatformToggle(option.value)}
                      className="sr-only"
                    />
                    <Icon className={`w-5 h-5 mr-2 ${option.color}`} />
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    {isSelected && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-purple-500" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ContentPost['status'] }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200",
                    !formData.scheduled_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_date ? (
                    format(new Date(formData.scheduled_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.scheduled_date ? new Date(formData.scheduled_date) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({
                        ...prev,
                        scheduled_date: format(date, 'yyyy-MM-dd')
                      }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Select time"
                value={formData.scheduled_time}
                onChange={(newValue) => setFormData(prev => ({ ...prev, scheduled_time: newValue }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9333ea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9333ea',
                          borderWidth: 2,
                        },
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 min-h-[80px] resize-none"
              placeholder="Add any notes for this post..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostModal;