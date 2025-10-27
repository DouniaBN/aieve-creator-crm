import React, { useMemo, useState } from 'react';
import { Calendar, DollarSign, Clock, CheckCircle, Handshake, Instagram, Youtube, Mail, Globe, FileText, Linkedin, Plus, X, Users, AlertCircle, Clapperboard, Moon, Sun, Sunrise } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { formatCurrency } from '../utils/currency';

interface DashboardProps {
  onNavigateToCalendar?: () => void;
  onNavigateToInvoices?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToCalendar, onNavigateToInvoices }) => {
  const { projects, invoices, contentPosts, brandDeals, tasks, createTask, updateTask, deleteTask, userProfile } = useSupabase();
  const [newTaskText, setNewTaskText] = useState('');

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
        amount: formatCurrency(inv.amount || 0, userProfile?.currency || 'USD'),
        days: Math.floor((new Date().getTime() - new Date(inv.due_date || new Date()).getTime()) / (1000 * 60 * 60 * 24))
      }));

    // Overdue calculations
    const overdueInvoices = (invoices || []).filter(inv => inv && inv.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const overdueCount = overdueInvoices.length;

    return {
      activeBrandDealsThisWeek,
      contentPostsThisMonth,
      todaysPosts,
      totalRevenue,
      pendingAmount,
      pendingCount,
      overdue,
      overdueAmount,
      overdueCount
    };
  }, [brandDeals, contentPosts, invoices, dateRanges]);

  const stats = [
    {
      title: 'Active Brand Deals',
      value: calculations.activeBrandDealsThisWeek.toString(),
      change: 'this week',
      icon: Users,
      borderColor: 'border-l-pink-500',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(calculations.totalRevenue, userProfile?.currency || 'USD'),
      change: '+15% this month',
      icon: DollarSign,
      borderColor: 'border-l-emerald-300',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500'
    },
    {
      title: 'Overdue Invoices',
      value: calculations.overdueCount.toString(),
      change: 'need attention',
      icon: AlertCircle,
      borderColor: 'border-l-[#fc5353]',
      iconBg: 'bg-rose-50',
      iconColor: 'text-[#fc5353]',
      onClick: onNavigateToInvoices
    },
    {
      title: 'Content Posts',
      value: calculations.contentPostsThisMonth.toString(),
      change: 'this month',
      icon: Clapperboard,
      borderColor: 'border-l-indigo-300',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-400'
    }
  ];

  // Custom X Icon component for platform mapping
  const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  // Pinterest Icon component using Font Awesome
  const PinterestIcon = () => (
    <i className="fab fa-pinterest"></i>
  );

  // TikTok Icon component using Font Awesome
  const TikTokIcon = () => (
    <i className="fab fa-tiktok"></i>
  );

  // Facebook Icon component using Font Awesome
  const FacebookIcon = () => (
    <i className="fab fa-facebook text-blue-600"></i>
  );


  // Reddit Icon component using Font Awesome
  const RedditIcon = () => (
    <i className="fab fa-reddit text-red-600"></i>
  );

  // Threads Icon component using @ symbol
  const ThreadsIcon = () => (
    <span className="font-bold text-black">@</span>
  );

  // Platform icons mapping
  const platformIcons = {
    newsletter: Mail,
    x: XIcon,
    facebook: FacebookIcon,
    instagram: Instagram,
    pinterest: PinterestIcon,
    tiktok: TikTokIcon,
    youtube: Youtube,
    linkedin: Linkedin,
    threads: ThreadsIcon,
    reddit: RedditIcon,
    blog: FileText
  };

  // Get time-based greeting and icon (memoized)
  const greetingData = useMemo(() => {
    const hour = dateRanges.today.getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sunrise };
    if (hour < 18) return { text: 'Good afternoon', icon: Sun };
    return { text: 'Good evening', icon: Moon };
  }, [dateRanges.today]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      try {
        await createTask({ text: newTaskText.trim(), completed: false });
        setNewTaskText('');
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed: !completed });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 -mt-5" data-tour="dashboard">
        <div className="flex items-center gap-1.5 mb-2">
          <h1 className="text-2xl font-bold text-[#1c2d5a]">{greetingData.text}, Sarah</h1>
          <greetingData.icon className="w-5 h-5 text-[#1c2d5a]" />
        </div>
        <p className="text-gray-600">You have 7 projects in progress and {(tasks || []).filter(t => !t.completed).length} pending tasks to complete.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const getChangeColor = () => {
            if (stat.title === 'Overdue Invoices') return 'text-[#fc5353]';
            if (stat.change.includes('+') || stat.change.includes('15%')) return 'text-green-600';
            return 'text-gray-400';
          };

          return (
            <div
              key={index}
              className={`bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${stat.borderColor} ${
                stat.onClick ? 'cursor-pointer' : ''
              }`}
              onClick={stat.onClick}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.title}</p>
                  <p className="text-4xl font-bold text-[#1c2d5a] mb-1">{stat.value}</p>
                  <p className={`text-[10px] ${getChangeColor()}`}>{stat.change}</p>
                </div>
                <div className="rounded-lg p-1.5">
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1c2d5a]">Tasks</h2>
            <CheckCircle className="w-5 h-5 text-[#E83F87]" />
          </div>

          {/* Add new task form */}
          <form onSubmit={handleAddTask} className="mb-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 text-sm"
                maxLength={50}
              />
              <button
                type="submit"
                disabled={!newTaskText.trim()}
                className="flex items-center justify-center w-10 h-10 rounded-md bg-[#E83F87] text-white hover:bg-[#D23075] disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Tasks list */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                  checkedColor="#E83F87"
                  className="flex-shrink-0"
                />
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-[#1c2d5a]'}`}>
                  {task.text}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-[#E83F87] mx-auto mb-3" />
                <p className="text-gray-600">No tasks yet</p>
                <p className="text-sm text-gray-500 mt-1">Add a task to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Posts */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1c2d5a]">Today's Posts</h2>
            <button
              onClick={onNavigateToCalendar}
              className="text-[#1c2d5a] hover:text-[#1a2954] text-sm font-medium transition-colors duration-200"
            >
              View Calendar
            </button>
          </div>
          <div className="space-y-2">
            {calculations.todaysPosts.length > 0 ? (
              calculations.todaysPosts.map((post) => {
                const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons];
                const scheduledTime = post.scheduled_date ? new Date(post.scheduled_date) : null;

                return (
                  <div key={post.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                        <PlatformIcon className="w-4 h-4 text-[#1c2d5a]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1c2d5a]">{post.title}</h3>
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
                            : post.status === 'draft'
                            ? 'bg-gray-100 text-gray-700'
                            : post.status === 'edited'
                            ? 'bg-orange-100 text-orange-700'
                            : post.status === 'idea'
                            ? 'bg-purple-100 text-purple-700'
                            : post.status === 'filmed'
                            ? 'bg-pink-100 text-pink-700'
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
      </div>
    </div>
  );
};

export default Dashboard;