import React, { useState } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import ContentCalendar from './ContentCalendar';
import AddPostModal from './AddPostModal';

const Projects = () => {
  const { fetchContentPosts } = useSupabase();
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleAddPost = (date?: Date) => {
    setSelectedDate(date);
    setShowPostModal(true);
  };

  const handleCloseModal = () => {
    setShowPostModal(false);
    setSelectedDate(undefined);
  };

  const handlePostAdded = () => {
    console.log('=== POST ADDED CALLBACK TRIGGERED ===');
    console.log('Refreshing content posts...');
    fetchContentPosts().then(() => {
      console.log('Content posts refresh completed');
    }).catch(error => {
      console.error('Error refreshing content posts:', error);
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
            <p className="text-gray-600 mt-1">Plan and schedule your content across all platforms</p>
          </div>
        </div>
      </div>

      {/* Content Calendar */}
      <ContentCalendar onAddPost={handleAddPost} />

      {/* Add Post Modal */}
      <AddPostModal
        isOpen={showPostModal}
        onClose={handleCloseModal}
        initialDate={selectedDate}
        onPostAdded={handlePostAdded}
      />
    </div>
  );
};

export default Projects;