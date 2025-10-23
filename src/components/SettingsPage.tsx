import React, { useState, useEffect } from 'react';
import { User, DollarSign, Palette, Bell, Shield, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const {
    user,
    userProfile,
    notificationsEnabled,
    updateNotificationSettings,
    updateUserProfile,
    changePassword
  } = useSupabase();

  // Profile state
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    website: '',
    bio: '',
    business_address: '',
    currency: 'USD'
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Loading and message states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user profile data when available
  useEffect(() => {
    if (userProfile) {
      setProfile({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        website: userProfile.website || '',
        bio: userProfile.bio || '',
        business_address: userProfile.business_address || '',
        currency: userProfile.currency || 'USD'
      });
    }
  }, [userProfile]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'business', name: 'Business', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  const handleProfileSave = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'User not authenticated. Please log in again.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      console.log('Saving profile data:', profile);
      await updateUserProfile(profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: `Failed to update profile: ${(error as Error).message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleBusinessSave = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'User not authenticated. Please log in again.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      console.log('Saving business data:', { business_address: profile.business_address, currency: profile.currency });
      await updateUserProfile({
        business_address: profile.business_address,
        currency: profile.currency
      });
      setMessage({ type: 'success', text: 'Business settings updated successfully!' });
    } catch (error) {
      console.error('Error updating business settings:', error);
      setMessage({
        type: 'error',
        text: `Failed to update business settings: ${(error as Error).message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: (error as Error).message || 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const renderProfileTab = () => {
    console.log('Rendering Profile Tab');
    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
        <button
          onClick={() => alert('Profile button test clicked!')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          TEST BUTTON
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
            value={user?.email || ''}
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed from here</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
            value={profile.website}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            placeholder="https://your-website.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
          rows={3}
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Tell us about yourself and your content..."
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleProfileSave}
          disabled={isLoading}
          className="px-8 py-3 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
    );
  };

  const renderBusinessTab = () => {
    console.log('Rendering Business Tab');
    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Business Settings</h3>
        <button
          onClick={() => alert('Business button test clicked!')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          TEST BUTTON
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
          rows={3}
          value={profile.business_address}
          onChange={(e) => setProfile({ ...profile, business_address: e.target.value })}
          placeholder="Your business address for invoices and contracts..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
            value={profile.currency}
            onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
          >
            <option value="USD">$ USD - US Dollar</option>
            <option value="EUR">€ EUR - Euro</option>
            <option value="GBP">£ GBP - British Pound</option>
            <option value="CAD">C$ CAD - Canadian Dollar</option>
            <option value="AUD">A$ AUD - Australian Dollar</option>
            <option value="JPY">¥ JPY - Japanese Yen</option>
            <option value="CHF">CHF CHF - Swiss Franc</option>
            <option value="SEK">kr SEK - Swedish Krona</option>
            <option value="NOK">kr NOK - Norwegian Krone</option>
            <option value="DKK">kr DKK - Danish Krone</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleBusinessSave}
          disabled={isLoading}
          className="px-8 py-3 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isLoading ? 'Saving...' : 'Save Business Settings'}
        </button>
      </div>
    </div>
    );
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      await updateNotificationSettings(enabled);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* In-App Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">In-App Notifications</h3>
        {[
          { id: 'dashboard-notifications', label: 'Dashboard Notifications', description: 'Show notifications in the bell icon throughout the app' }
        ].map((notification) => (
          <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">{notification.label}</h4>
              <p className="text-sm text-gray-600">{notification.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationsEnabled}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E83F87]"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200/50"></div>

      {/* Coming Soon Sections */}
      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="opacity-50 pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E83F87]/10 text-[#E83F87]">
              Coming Soon
            </span>
          </div>
          <div className="space-y-3">
            {[
              { id: 'email-payment-reminders', label: 'Payment Reminders', description: 'Email reminders for overdue invoices' },
              { id: 'email-weekly-summary', label: 'Weekly Summary', description: 'Weekly report of your activities via email' },
              { id: 'aieve-newsletter', label: 'AIEVE Newsletter', description: 'Be the first to know about creator tips, tricks and upcoming features' }
            ].map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-500">{notification.label}</h4>
                  <p className="text-sm text-gray-400">{notification.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="opacity-50 pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E83F87]/10 text-[#E83F87]">
              Coming Soon
            </span>
          </div>
          <div className="space-y-3">
            {[
              { id: 'sms-urgent-alerts', label: 'Urgent Payment Alerts', description: 'SMS alerts for severely overdue invoices' }
            ].map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-500">{notification.label}</h4>
                  <p className="text-sm text-gray-400">{notification.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Email and SMS notification integrations will be available in a future update.
        </p>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="relative">
        {/* Coming Soon Badge */}
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Theme</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E83F87]/10 text-[#E83F87]">
            Coming Soon
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 opacity-50 pointer-events-none">
          {['Light', 'Dark', 'Auto'].map((theme) => (
            <div key={theme} className="relative">
              <input
                type="radio"
                id={theme.toLowerCase()}
                name="theme"
                className="sr-only peer"
                defaultChecked={theme === 'Light'}
                disabled
              />
              <label
                htmlFor={theme.toLowerCase()}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-xl cursor-not-allowed bg-gray-50"
              >
                <div className={`w-12 h-8 rounded mb-2 ${theme === 'Light' ? 'bg-white border-2 border-gray-200' : theme === 'Dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'}`}></div>
                <span className="text-sm font-medium text-gray-500">{theme}</span>
              </label>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Dark mode and auto theme switching will be available in a future update.
        </p>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
              placeholder="Enter new password (min 6 characters)"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            className="px-6 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E83F87]/10 text-[#E83F87]">
            Coming Soon
          </span>
        </div>
        <div className="p-4 bg-gray-50/50 rounded-xl opacity-50 pointer-events-none">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-500">SMS Authentication</h4>
              <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed" disabled>
              Enable
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Two-factor authentication will be available in a future update.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'business':
        return renderBusinessTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'security':
        return renderSecurityTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6 pb-20 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#E83F87] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-200/50 min-h-[600px] max-h-none overflow-visible">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;