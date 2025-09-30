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
    fetchContentPosts().catch(error => {
      console.error('Error refreshing content posts:', error);
    });
  };

  return (
    <div className="space-y-6">

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