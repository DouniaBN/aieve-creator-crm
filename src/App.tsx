import React, { useState } from 'react';
import { Layout, LayoutDashboard, Calendar, FileText, Settings, User } from 'lucide-react';
import { SupabaseProvider, useSupabase } from './contexts/SupabaseContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import NotificationPanel from './components/NotificationPanel';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import BrandDeals from './components/BrandDeals';
import Invoices from './components/Invoices';
import SettingsPage from './components/SettingsPage';
import SuccessMessage from './components/SuccessMessage';

function AppContent() {
  const { user, loading, signOut } = useSupabase();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { successMessage, showSuccessMessage } = useAppContext();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 animate-pulse">
            SC
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', name: 'Calendar', icon: Calendar },
    { id: 'brand-deals', name: 'Brand Deals', icon: Layout },
    { id: 'invoices', name: 'Invoices', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigateToCalendar={() => setActiveTab('projects')} />;
      case 'projects':
        return <Projects />;
      case 'brand-deals':
        return <BrandDeals />;
      case 'invoices':
        return <Invoices />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigateToCalendar={() => setActiveTab('projects')} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-lg shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200/50">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AIEVE
            </h1>
            <p className="text-sm text-gray-600 mt-1">Creator CRM</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.filter(item => item.id !== 'settings').map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                          : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-sm'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings - Above User Profile */}
          <div className="p-4">
            <button
              onClick={signOut}
              className="w-full flex items-center px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-xl transition-all duration-200 text-sm mb-3"
            >
              <User className="w-4 h-4 mr-3" />
              Logout
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-sm'
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
              <User className="w-10 h-10 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Sarah Chen</p>
                <p className="text-xs text-gray-500">sarah@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <div className="lg:hidden sticky top-0 z-30 p-4" style={{ backgroundColor: '#FAFAFA' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <Layout className="w-6 h-6" />
          </button>
        </div>
        
        <div className="hidden lg:block sticky top-0 z-30 p-4" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="flex justify-end">
            <NotificationPanel />
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
      
      <SuccessMessage 
        message={successMessage} 
        onClose={() => showSuccessMessage('')} 
      />
    </div>
  );
}

function App() {
  return (
    <SupabaseProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SupabaseProvider>
  );
}

export default App;