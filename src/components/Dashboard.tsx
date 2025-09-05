import React from 'react';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, Lightbulb, Handshake, Upload } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import StatusDropdown from './StatusDropdown';

const Dashboard = () => {
  const { projects, invoices, brandDeals, updateProject } = useSupabase();

  const statusConfig = {
    idea: { 
      label: 'Idea', 
      icon: Lightbulb,
      color: 'bg-gray-100 text-gray-800',
      hoverColor: 'hover:bg-gray-200',
      selectedColor: 'bg-gray-200 border-gray-300'
    },
    negotiation: { 
      label: 'Negotiation', 
      icon: Handshake,
      color: 'bg-orange-100 text-orange-800',
      hoverColor: 'hover:bg-orange-200',
      selectedColor: 'bg-orange-200 border-orange-300'
    },
    'in-progress': { 
      label: 'In Progress', 
      icon: Clock,
      color: 'bg-blue-100 text-blue-800',
      hoverColor: 'hover:bg-blue-200',
      selectedColor: 'bg-blue-200 border-blue-300'
    },
    submitted: { 
      label: 'Submitted', 
      icon: Upload,
      color: 'bg-purple-100 text-purple-800',
      hoverColor: 'hover:bg-purple-200',
      selectedColor: 'bg-purple-200 border-purple-300'
    },
    paid: { 
      label: 'Paid', 
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      hoverColor: 'hover:bg-green-200',
      selectedColor: 'bg-green-200 border-green-300'
    }
  };

  const stats = [
    {
      title: 'Active Projects',
      value: projects.length.toString(),
      change: '+2 this week',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Total Revenue',
      value: `$${invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}`,
      change: '+15% this month',
      icon: DollarSign,
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-50 to-teal-50'
    },
    {
      title: 'Pending Payments',
      value: `$${invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}`,
      change: `${invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length} invoices`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round((projects.filter(p => p.status === 'paid').length / Math.max(projects.length, 1)) * 100)}%`,
      change: '+3% improvement',
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50'
    }
  ];

  // Get recent projects (first 4)
  const recentProjects = projects.slice(0, 4);

  const overdue = invoices
    .filter(inv => inv.status === 'overdue')
    .map(inv => ({
      client: inv.client_name,
      amount: `$${inv.amount.toLocaleString()}`,
      days: Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))
    }));

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      await updateProject(projectId, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your creator business</p>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Good morning, Sarah! 👋</h1>
        <p className="text-gray-600">You have {projects.filter(p => p.status === 'in-progress').length} projects in progress and {overdue.length} overdue payments to follow up on.</p>
      </div>

      {/* Stats Grid */}
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
                  <p className="text-xs text-green-600 mt-2">{stat.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-200">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.project_name}</h3>
                    <p className="text-sm text-gray-600">{project.brand_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-1">
                    <StatusDropdown
                      currentStatus={project.status}
                      statusConfig={statusConfig}
                      onStatusChange={(newStatus) => handleUpdateStatus(project.id, newStatus)}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{project.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Payments */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Overdue Payments</h2>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {overdue.map((payment, index) => (
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
          {overdue.length === 0 && (
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