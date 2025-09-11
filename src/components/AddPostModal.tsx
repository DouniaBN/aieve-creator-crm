import React, { useState } from 'react';
import { X, Calendar, Globe, Mail, FileText, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAppContext } from '../contexts/AppContext';
import { ContentPost } from '../lib/supabase';

// Custom X Icon component
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  onPostAdded?: () => void;
}

const AddPostModal: React.FC<AddPostModalProps> = ({ isOpen, onClose, initialDate, onPostAdded }) => {
  const { createContentPost, fetchContentPosts } = useSupabase();
  const { showSuccessMessage } = useAppContext();
  const [loading, setLoading] = useState(false);
  
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
    scheduled_time: '',
    content: ''
  });

  const platformOptions = [
    { value: 'newsletter', label: 'Newsletter', icon: Mail, color: 'text-blue-600' },
    { value: 'x', label: 'X (Twitter)', icon: XIcon, color: 'text-gray-800' },
    { value: 'pinterest', label: 'Pinterest', icon: Globe, color: 'text-red-600' },
    { value: 'tiktok', label: 'TikTok', icon: FileText, color: 'text-black' },
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { value: 'blog', label: 'Blog', icon: FileText, color: 'text-purple-600' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'text-gray-600' },
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-600' },
    { value: 'published', label: 'Published', color: 'text-green-600' }
  ];

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
    
    setLoading(true);

    try {
      // Create a post for each selected platform
      
      for (const platform of formData.platforms) {
        // Combine date and time if both are provided
        let scheduledDateTime = undefined;
        if (formData.scheduled_date) {
          const dateTimeString = formData.scheduled_time 
            ? `${formData.scheduled_date}T${formData.scheduled_time}:00`
            : `${formData.scheduled_date}T12:00:00`;
          scheduledDateTime = new Date(dateTimeString).toISOString();
        }

        const postData: Omit<ContentPost, 'id' | 'user_id' | 'created_at'> = {
          title: formData.title,
          platform: platform as ContentPost['platform'],
          status: formData.status,
          scheduled_date: scheduledDateTime,
          project_id: undefined
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
        scheduled_time: '',
        content: ''
      });
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platforms (Select multiple)</label>
            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
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
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={formData.scheduled_time}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
              placeholder="Select time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 min-h-[80px] resize-none"
              placeholder="Add any notes or content for this post..."
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
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
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