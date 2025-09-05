import React, { useState } from 'react';
import { Plus, Calendar, Users, TrendingUp, MessageCircle, FileText, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';

const SocialMedia = () => {
  const [showModal, setShowModal] = useState(false);

  const stats = [
    {
      title: 'Total Followers',
      value: '259.0K',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Avg Engagement',
      value: '4.7%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Posts This Month',
      value: '50',
      icon: MessageCircle,
      color: 'text-purple-600'
    },
    {
      title: 'Scheduled',
      value: '1',
      icon: FileText,
      color: 'text-orange-600'
    }
  ];

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      followers: '125.0K',
      engagement: '4.2%',
      posts: 18,
      status: 'Connected',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: MessageCircle,
      followers: '89.0K',
      engagement: '6.8%',
      posts: 24,
      status: 'Connected',
      gradient: 'from-gray-800 to-black',
      bgGradient: 'from-gray-50 to-gray-100'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      followers: '45.0K',
      engagement: '3.1%',
      posts: 8,
      status: 'Connected',
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      followers: '32.0K',
      engagement: '2.4%',
      posts: 12,
      status: 'Disconnected',
      gradient: 'from-blue-400 to-blue-500',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      followers: '15.0K',
      engagement: '1.8%',
      posts: 6,
      status: 'Disconnected',
      gradient: 'from-blue-600 to-blue-700',
      bgGradient: 'from-blue-50 to-blue-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
          <p className="text-gray-600 mt-1">Manage your content across all social platforms.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-full text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color === 'text-blue-600' ? 'bg-blue-100' : stat.color === 'text-green-600' ? 'bg-green-100' : stat.color === 'text-purple-600' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Overview */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isConnected = platform.status === 'Connected';
            
            return (
              <div
                key={platform.id}
                className={`rounded-2xl p-6 text-white relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isConnected 
                    ? `bg-gradient-to-br ${platform.gradient}` 
                    : 'bg-gradient-to-br from-gray-400 to-gray-500 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">{platform.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isConnected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/30 text-white'
                  }`}>
                    {platform.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Followers</span>
                    <span className="font-semibold">{platform.followers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Engagement</span>
                    <span className="font-semibold">{platform.engagement}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Posts</span>
                    <span className="font-semibold">{platform.posts}</span>
                  </div>
                </div>
                
                {!isConnected && (
                  <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200 text-sm font-medium">
                    Connect Account
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* New Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  rows="4"
                  placeholder="What's on your mind?"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Platforms</label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.filter(p => p.status === 'Connected').map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <label key={platform.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMedia;