import React, { useState, useEffect } from 'react';
import { Layout, LayoutDashboard, Calendar, FileText, Settings, LogOut, DollarSign } from 'lucide-react';
import { initPostHog, posthog } from './lib/posthog';
import { SupabaseProvider, useSupabase } from './contexts/SupabaseContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { PostHogProvider } from './components/PostHogProvider';
import MobileBlocker from './components/MobileBlocker';
import NotificationPanel from './components/NotificationPanel';
import Auth from './components/Auth';
import OnboardingModal from './components/OnboardingModal';
import ShepherdTour from './components/ShepherdTour';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import BrandDeals from './components/BrandDeals';
import Invoices from './components/Invoices';
import SettingsPage from './components/SettingsPage';
import SuccessMessage from './components/SuccessMessage';
import logoImage from './assets/no-bg-logo.png';

function AppContent() {
  const { user, loading, signOut, userProfile } = useSupabase();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showShepherdTour, setShowShepherdTour] = useState(false);
  const [showFullOnboarding, setShowFullOnboarding] = useState(false);
  const { successMessage, showSuccessMessage } = useAppContext();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <img 
              src={logoImage} 
              alt="AIEVE Logo" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onAuthSuccess={(_isNewUser: boolean) => {
      // For testing: show onboarding modal for both new users AND existing users
      setShowOnboardingModal(true);
    }} />;
  }

  // Show full onboarding flow if user chose to continue from modal
  if (showFullOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          setShowFullOnboarding(false);
          showSuccessMessage(`Welcome aboard, ${userProfile?.preferred_name || 'there'}! 🎉`);
        }}
      />
    );
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
    { id: 'projects', name: 'Calendar', icon: Calendar, tourId: 'calendar' },
    { id: 'brand-deals', name: 'Brand Deals', icon: DollarSign, tourId: 'brand-deals' },
    { id: 'invoices', name: 'Invoices', icon: FileText, tourId: 'invoices' },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          onNavigateToCalendar={() => setActiveTab('projects')} 
          onNavigateToInvoices={() => setActiveTab('invoices')}
        />;
      case 'projects':
        return <Projects />;
      case 'brand-deals':
        return <BrandDeals />;
      case 'invoices':
        return <Invoices />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard 
          onNavigateToCalendar={() => setActiveTab('projects')} 
          onNavigateToInvoices={() => setActiveTab('invoices')}
        />;
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
          <div className="p-6 pb-4">
            <img 
              src={logoImage} 
              alt="AIEVE Logo" 
              className="h-10 w-auto"
            />
          </div>
          
          {/* Divider */}
          <div className="border-b border-gray-200/50 mx-6"></div>

          {/* Navigation */}
          <nav className="flex-1 p-6 pt-6">
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
                          ? 'bg-[#E83F87] text-white shadow-lg shadow-pink-300/25'
                          : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-sm'
                      }`}
                      data-tour={item.tourId || undefined}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings and Logout */}
          <div className="p-4">
            <div className="flex justify-between">
              <div className="relative group">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-[#E83F87] text-white shadow-lg shadow-pink-300/25'
                      : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-sm'
                  }`}
                  data-tour="settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Settings
                </div>
              </div>
              <div className="relative group">
                <button
                  onClick={signOut}
                  className="flex items-center justify-center p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100/50 hover:shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Log out
                </div>
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

        {activeTab !== 'projects' && activeTab !== 'brand-deals' && activeTab !== 'invoices' && activeTab !== 'settings' && (
          <div className="hidden lg:block sticky top-0 z-30 px-4 py-2" style={{ backgroundColor: '#FAFAFA' }}>
            <div className="flex justify-end">
              <NotificationPanel />
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-4">
          {renderContent()}
        </main>
      </div>
      
      <SuccessMessage
        message={successMessage}
        onClose={() => showSuccessMessage('')}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSkipDemo={() => {
          setShowOnboardingModal(false);
          showSuccessMessage('Welcome to AIEVE! 🎉');
        }}
        onContinue={() => {
          setShowOnboardingModal(false);
          setShowShepherdTour(true);
        }}
      />

      {/* Shepherd Tour */}
      <ShepherdTour
        isActive={showShepherdTour}
        onComplete={() => {
          setShowShepherdTour(false);
          showSuccessMessage('Welcome to AIEVE! Ready to get organized? 🎉');
        }}
        onSkip={() => {
          setShowShepherdTour(false);
          showSuccessMessage('Welcome to AIEVE! 🎉');
        }}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

function App() {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <MobileBlocker>
      <SupabaseProvider>
        <AppProvider>
          <PostHogProvider>
            <AppContent />
          </PostHogProvider>
        </AppProvider>
      </SupabaseProvider>
    </MobileBlocker>
  );
}

export default App;