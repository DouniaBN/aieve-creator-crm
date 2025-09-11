import React, { useMemo } from 'react';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Handshake, Instagram, Youtube, Mail, Globe, FileText, Linkedin } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

interface DashboardProps {
  onNavigateToCalendar?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToCalendar }) => {
  const { projects, invoices, contentPosts, brandDeals } = useSupabase();

  // Memoize date calculations to prevent recreating on every render
  const dateRanges = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const todaysDate = today.toISOString().split('T')[0];
    
    return { today, startOfWeek, endOfWeek, startOfMonth, endOfMonth, todaysDate };
  }, []); // Empty dependency - only calculate once per day (could be optimized further)

  // Memoize expensive calculations that depend on data
  const calculations = useMemo(() => {
    const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, todaysDate } = dateRanges;
    
    // Active brand deals this week
    const activeBrandDealsThisWeek = (brandDeals || []).filter(deal => {
      if (!deal || deal.status === 'cancelled') return false;
      const dealStartDate = deal.start_date ? new Date(deal.start_date) : null;
      const dealEndDate = deal.end_date ? new Date(deal.end_date) : null;
      
      return dealStartDate && 
             dealStartDate <= endOfWeek && 
             (!dealEndDate || dealEndDate >= startOfWeek);
    }).length;

    // Content posts this month
    const contentPostsThisMonth = (contentPosts || []).filter(post => {
      if (!post || !post.scheduled_date) return false;
      const postDate = new Date(post.scheduled_date);
      return postDate >= startOfMonth && postDate <= endOfMonth;
    }).length;

    // Today's posts
    const todaysPosts = (contentPosts || []).filter(post => {
      if (!post || !post.scheduled_date) return false;
      const postDate = new Date(post.scheduled_date).toISOString().split('T')[0];
      return postDate === todaysDate;
    }).slice(0, 4);

    // Revenue calculations
    const totalRevenue = (invoices || [])
      .filter(inv => inv && inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    
    const pendingAmount = (invoices || [])
      .filter(inv => inv && (inv.status === 'sent' || inv.status === 'overdue'))
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    
    const pendingCount = (invoices || [])
      .filter(inv => inv && (inv.status === 'sent' || inv.status === 'overdue'))
      .length;

    // Overdue payments
    const overdue = (invoices || [])
      .filter(inv => inv && inv.status === 'overdue')
      .map(inv => ({
        client: inv.client_name || 'Unknown Client',
        amount: `$${(inv.amount || 0).toLocaleString()}`,
        days: Math.floor((new Date().getTime() - new Date(inv.due_date || new Date()).getTime()) / (1000 * 60 * 60 * 24))
      }));

    return {
      activeBrandDealsThisWeek,
      contentPostsThisMonth,
      todaysPosts,
      totalRevenue,
      pendingAmount,
      pendingCount,
      overdue
    };
  }, [brandDeals, contentPosts, invoices, dateRanges]);

  const stats = [
    {
      title: 'Active Brand Deals',
      value: calculations.activeBrandDealsThisWeek.toString(),
      change: 'this week',
      icon: Handshake,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Total Revenue',
      value: `$${calculations.totalRevenue.toLocaleString()}`,
      change: '+15% this month',
      icon: DollarSign,
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-50 to-teal-50'
    },
    {
      title: 'Pending Payments',
      value: `$${calculations.pendingAmount.toLocaleString()}`,
      change: `${calculations.pendingCount} invoices`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50'
    },
    {
      title: 'Content Posts',
      value: calculations.contentPostsThisMonth.toString(),
      change: 'this month',
      icon: FileText,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50'
    }
  ];

  // Custom X Icon component for platform mapping
  const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

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

  // Get time-based greeting (memoized)
  const greeting = useMemo(() => {
    const hour = dateRanges.today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [dateRanges.today]);


  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 -mt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{greeting}, Sarah</h1>
        <p className="text-gray-600">You have {(projects || []).filter(p => p && p.status === 'in-progress').length} projects in progress and {calculations.overdue.length} overdue payments to follow up on.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          return (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-full text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xs text-green-600 mt-2">{stat.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Posts */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today's Posts</h2>
            <button 
              onClick={onNavigateToCalendar}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-200"
            >
              View Calendar
            </button>
          </div>
          <div className="space-y-4">
            {calculations.todaysPosts.length > 0 ? (
              calculations.todaysPosts.map((post) => {
                const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons];
                const scheduledTime = post.scheduled_date ? new Date(post.scheduled_date) : null;
                
                return (
                  <div key={post.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100">
                        <PlatformIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{post.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{post.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'scheduled' 
                            ? 'bg-blue-100 text-blue-800' 
                            : post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {scheduledTime ? scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time set'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No posts scheduled for today</p>
                <p className="text-sm text-gray-500 mt-1">Check your content calendar to plan ahead!</p>
              </div>
            )}
          </div>
        </div>

        {/* Overdue Payments */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Overdue Payments</h2>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {calculations.overdue.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-200/50">
                <div>
                  <h3 className="font-medium text-gray-900">{payment.client}</h3>
                  <p className="text-sm text-red-600">{payment.days} days overdue</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{payment.amount}</p>
                  <button className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                    Send Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
          {calculations.overdue.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">All payments are up to date! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;