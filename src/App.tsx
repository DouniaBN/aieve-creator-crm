import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, LayoutDashboard, Calendar, FileText, Settings, LogOut, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { SupabaseProvider, useSupabase } from './contexts/SupabaseContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import MobileBlocker from './components/MobileBlocker';
import NotificationPanel from './components/NotificationPanel';
import Login from './components/Login';
import Signup from './components/Signup';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showShepherdTour, setShowShepherdTour] = useState(false);
  const [showFullOnboarding, setShowFullOnboarding] = useState(false);
  const [, setWasJustSignedUp] = useState(false);
  const { successMessage, showSuccessMessage } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();


  // Handle auth state changes for new users
  useEffect(() => {
    // Check if user just became authenticated and needs onboarding
    if (user && !loading && userProfile !== null) {
      const wasOnAuthPage = sessionStorage.getItem('was_on_auth_page') === 'true';

      // Use database field as source of truth for onboarding completion
      const hasCompletedOnboarding = userProfile?.onboarding_complete === true;

      // Only show onboarding for users who just signed up AND haven't completed onboarding
      if (wasOnAuthPage && !hasCompletedOnboarding) {
        sessionStorage.removeItem('was_on_auth_page');
        setShowOnboardingModal(true);
        setWasJustSignedUp(true);
      }
    }
  }, [user, loading, userProfile]);

  // Track when user is on auth pages
  useEffect(() => {
    if (['/login', '/signup'].includes(location.pathname)) {
      sessionStorage.setItem('was_on_auth_page', 'true');
    }
  }, [location.pathname]);

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


  // Redirect to login if not authenticated and trying to access protected routes
  if (!user && !['/login', '/signup'].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  // Additional safety check - if we somehow have a loading=false but no user on protected routes
  if (!loading && !user && !['/login', '/signup'].includes(location.pathname)) {
    console.warn('Authentication bypass detected, redirecting to login')
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if authenticated and trying to access auth routes
  if (user && ['/login', '/signup', '/'].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show full onboarding flow (preferred name + UGC questions) immediately after signup
  if (showFullOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          setShowFullOnboarding(false);
          setShowOnboardingModal(true);
        }}
      />
    );
  }

  const navigation = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
    { path: '/calendar', name: 'Calendar', icon: Calendar, tourId: 'calendar' },
    { path: '/brand-deals', name: 'Brand Deals', icon: DollarSign, tourId: 'brand-deals' },
    { path: '/invoices', name: 'Invoices', icon: FileText, tourId: 'invoices' },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];

  const handleAuthSuccess = (isNewUser: boolean = true) => {
    if (isNewUser) {
      // Mark as having been on auth page for email confirmation flow
      sessionStorage.setItem('was_on_auth_page', 'true');
      setShowFullOnboarding(true);
    }
    navigate('/dashboard');
  };

  // Handle auth routes
  if (['/login', '/signup'].includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/signup" element={<Signup onAuthSuccess={handleAuthSuccess} />} />
      </Routes>
    );
  }

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
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white/80 backdrop-blur-lg shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo and Collapse Toggle */}
          <div className="p-6 pb-4 flex items-center justify-between">
            {!sidebarCollapsed && (
              <img
                src={logoImage}
                alt="AIEVE Logo"
                className="h-10 w-auto"
              />
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-200/50 mx-6"></div>

          {/* Navigation */}
          <nav className="flex-1 p-6 pt-6">
            <ul className="space-y-2">
              {navigation.filter(item => item.path !== '/settings').map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <div className="relative group">
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`w-full flex items-center ${
                          sidebarCollapsed ? 'justify-center px-4 py-3' : 'px-4 py-3'
                        } rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-[#E83F87] text-white shadow-lg shadow-pink-300/25'
                            : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-sm'
                        }`}
                        data-tour={item.tourId || undefined}
                      >
                        <Icon className={`w-5 h-5 ${sidebarCollapsed ? 'flex-shrink-0' : 'mr-3 flex-shrink-0'}`} />
                        {!sidebarCollapsed && item.name}
                      </Link>

                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings and Logout */}
          <div className="p-4">
            <div className={`flex ${sidebarCollapsed ? 'flex-col space-y-2' : 'justify-between'}`}>
              <div className="relative group">
                <Link
                  to="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                    location.pathname === '/settings'
                      ? 'bg-[#E83F87] text-white shadow-lg shadow-pink-300/25'
                      : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-sm'
                  }`}
                  data-tour="settings"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
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
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Log out
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} h-screen flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="lg:hidden sticky top-0 z-30 p-4 flex-shrink-0" style={{ backgroundColor: '#FAFAFA' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <Layout className="w-6 h-6" />
          </button>
        </div>

        {!['/calendar', '/brand-deals', '/invoices', '/settings'].includes(location.pathname) && (
          <div className="hidden lg:block sticky top-0 z-30 px-4 py-2 flex-shrink-0" style={{ backgroundColor: '#FAFAFA' }}>
            <div className="flex justify-end">
              <NotificationPanel />
            </div>
          </div>
        )}

        {/* Page Content - Scrollable */}
        <main className="p-4 sm:p-6 lg:p-4 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={
              <Dashboard
                onNavigateToCalendar={() => navigate('/calendar')}
                onNavigateToInvoices={() => navigate('/invoices')}
              />
            } />
            <Route path="/calendar" element={<Projects />} />
            <Route path="/brand-deals" element={<BrandDeals />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
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
          showSuccessMessage(`Welcome aboard, ${userProfile?.preferred_name || 'there'}! 🎉`);
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
          showSuccessMessage(`Welcome to AIEVE, ${userProfile?.preferred_name || 'there'}! Ready to get organized? 🎉`);
        }}
        onSkip={() => {
          setShowShepherdTour(false);
          showSuccessMessage(`Welcome to AIEVE, ${userProfile?.preferred_name || 'there'}! 🎉`);
        }}
        setActiveTab={(tab: string) => {
          const pathMap: { [key: string]: string } = {
            'dashboard': '/dashboard',
            'projects': '/calendar',
            'brand-deals': '/brand-deals',
            'invoices': '/invoices',
            'settings': '/settings'
          };
          navigate(pathMap[tab] || '/dashboard');
        }}
      />
    </div>
  );
}

function App() {
  return (
    <MobileBlocker>
      <SupabaseProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </SupabaseProvider>
    </MobileBlocker>
  );
}

export default App;