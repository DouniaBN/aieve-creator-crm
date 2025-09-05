import React, { useState, useMemo } from 'react';
import { Plus, Instagram, Youtube, Mail, Globe, FileText, Linkedin, ChevronLeft, ChevronRight, X, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { ContentPost } from '../lib/supabase';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';

// Custom X Icon component
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface ContentCalendarProps {
  onAddPost: () => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ onAddPost }) => {
  const { contentPosts, projects } = useSupabase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Platform icons mapping
  const platformIcons = {
    newsletter: Mail,
    x: XIcon,
    pinterest: Globe,
    tiktok: FileText,
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
    blog: FileText
  };

  // Platform colors for badges
  const platformColors = {
    newsletter: 'bg-blue-50 text-blue-700 border-blue-200',
    x: 'bg-gray-50 text-gray-700 border-gray-200',
    pinterest: 'bg-red-50 text-red-700 border-red-200',
    tiktok: 'bg-gray-900 text-white border-gray-800',
    instagram: 'bg-pink-50 text-pink-700 border-pink-200',
    youtube: 'bg-red-50 text-red-700 border-red-200',
    linkedin: 'bg-blue-50 text-blue-700 border-blue-200',
    blog: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  // Get project name by ID
  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : `Project #${projectId}`;
  };

  // Get posts for a specific date
  const getPostsForDate = (date: Date) => {
    return contentPosts.filter(post => {
      if (!post.scheduled_date) return false;
      try {
        const postDate = parseISO(post.scheduled_date);
        return isSameDay(postDate, date);
      } catch {
        return false;
      }
    });
  };

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
  }, [currentDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Modal functions
  const openPostModal = (post: ContentPost) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };

  // Expanded dates functions
  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Post and Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={onAddPost}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Post
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
        <CardContent className="p-6">
          {/* Month Header */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 border border-gray-100">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px border border-gray-200 rounded-lg overflow-hidden">
            {calendarDays.map((day) => {
              const postsForDay = getPostsForDate(day);
              const isCurrentMonth = format(day, 'M') === format(currentDate, 'M');
              const isToday = isSameDay(day, new Date());
              const dateKey = format(day, 'yyyy-MM-dd');
              const isExpanded = expandedDates.has(dateKey);
              const maxPostsToShow = isExpanded ? postsForDay.length : 3;
              
              return (
                <div
                  key={day.toISOString()}
                  className={`${isExpanded ? 'min-h-[200px]' : 'min-h-[140px]'} p-2 bg-white border-r border-b border-gray-100 last:border-r-0 ${
                    !isCurrentMonth ? 'bg-gray-50 opacity-60' : ''
                  } ${isToday ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-all duration-200`}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-medium mb-2 ${
                    isToday 
                      ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                      : !isCurrentMonth 
                        ? 'text-gray-400' 
                        : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </div>

                  {/* Posts for this day */}
                  <div className="space-y-1">
                    {postsForDay.slice(0, maxPostsToShow).map((post) => {
                      const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons];
                      const platformColor = platformColors[post.platform as keyof typeof platformColors];
                      
                      return (
                        <div
                          key={post.id}
                          className="text-xs p-1.5 rounded border border-gray-200 bg-white hover:shadow-sm transition-shadow cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPostModal(post);
                          }}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <PlatformIcon className="w-3 h-3 flex-shrink-0" />
                            <span className={`text-xs px-1 py-0.5 rounded ${platformColor} font-medium`}>
                              {post.platform}
                            </span>
                          </div>
                          <div className="font-medium text-gray-900 truncate leading-tight">
                            {post.title}
                          </div>
                          {post.project_id && (
                            <div className="text-purple-600 font-medium truncate mt-1">
                              {getProjectName(post.project_id)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {postsForDay.length > 3 && (
                      <div 
                        className="text-xs text-gray-500 p-1.5 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDateExpansion(dateKey);
                        }}
                      >
                        {isExpanded 
                          ? `Show less` 
                          : `+${postsForDay.length - 3} more posts`
                        }
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{contentPosts.length}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contentPosts.filter(p => p.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {contentPosts.filter(p => p.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {contentPosts.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </CardContent>
        </Card>
      </div>

      {/* Post Details Modal */}
      {showPostModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Post Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closePostModal}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Post Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Post Title</label>
                <div className="text-gray-900 font-medium">{selectedPost.title}</div>
              </div>

              {/* Platform */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Platform</label>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const PlatformIcon = platformIcons[selectedPost.platform as keyof typeof platformIcons];
                    const platformColor = platformColors[selectedPost.platform as keyof typeof platformColors];
                    return (
                      <Badge variant="outline" className={`${platformColor}`}>
                        <PlatformIcon className="w-4 h-4 mr-2" />
                        {selectedPost.platform}
                      </Badge>
                    );
                  })()}
                </div>
              </div>

              {/* Scheduled Date & Time */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Scheduled Date & Time</label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span>
                    {selectedPost.scheduled_date 
                      ? format(parseISO(selectedPost.scheduled_date), 'PPP p') 
                      : 'Not scheduled'}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPost.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    selectedPost.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {selectedPost.status}
                  </span>
                </div>
              </div>

              {/* Project */}
              {selectedPost.project_id && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Project</label>
                  <div className="flex items-center space-x-2 text-purple-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{getProjectName(selectedPost.project_id)}</span>
                  </div>
                </div>
              )}

              {/* Content Preview */}
              {selectedPost.content && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Content Preview</label>
                  <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-900 max-h-32 overflow-y-auto">
                    {selectedPost.content}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={closePostModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;