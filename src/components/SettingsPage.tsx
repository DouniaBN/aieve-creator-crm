import React, { useState, useEffect } from 'react';
import { User, DollarSign, Palette, Bell, Shield, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAppContext } from '../contexts/AppContext';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { userProfile, updateUserProfile, notificationsEnabled, updateNotificationSettings, changePassword } = useSupabase();
  const { showSuccessMessage } = useAppContext();

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  // Initialize profile state from userProfile data
  const [profile, setProfile] = useState({
    preferred_name: userProfile?.preferred_name || '',
    name: userProfile?.full_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    website: userProfile?.website || '',
    bio: userProfile?.bio || '',
    address: userProfile?.business_address || '',
    currency: userProfile?.currency || 'USD'
  });

  // Track if we're in the middle of saving to prevent form reset
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'business', name: 'Business', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'support', name: 'Support', icon: HelpCircle }
  ];

  // Update local state when userProfile changes (but not during saves)
  useEffect(() => {
    if (userProfile && !isSaving) {
      setProfile({
        preferred_name: userProfile.preferred_name || '',
        name: userProfile.full_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        website: userProfile.website || '',
        bio: userProfile.bio || '',
        address: userProfile.business_address || '',
        currency: userProfile.currency || 'USD'
      });
    }
  }, [userProfile, isSaving]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateUserProfile({
        preferred_name: profile.preferred_name,
        full_name: profile.name,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        bio: profile.bio,
        business_address: profile.address,
        currency: profile.currency
      });
      showSuccessMessage('Settings saved successfully! Invoice data has been automatically updated.');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSuccessMessage(`Error saving settings: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Basic validation
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Both password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword('', passwordForm.newPassword);
      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError((error as Error).message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
            value={profile.preferred_name}
            onChange={(e) => setProfile({ ...profile, preferred_name: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">This will appear in your dashboard greeting</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
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
          />
        </div>
      </div>

      {/* Update Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-[#E83F87] text-white rounded-lg hover:bg-[#d63577] transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );

  const renderBusinessTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
          rows="3"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
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

      {/* Update Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-[#E83F87] text-white rounded-lg hover:bg-[#d63577] transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Updating...' : 'Update Business Settings'}
        </button>
      </div>
    </div>
  );

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
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          {/* Success Message */}
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800">{passwordSuccess}</p>
            </div>
          )}

          {/* Error Message */}
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{passwordError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.currentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
                placeholder="Enter current password"
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, currentPassword: !showPasswords.currentPassword })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={passwordLoading}
              >
                {showPasswords.currentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
                placeholder="Enter new password"
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, newPassword: !showPasswords.newPassword })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={passwordLoading}
              >
                {showPasswords.newPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
                placeholder="Confirm new password"
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirmPassword: !showPasswords.confirmPassword })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={passwordLoading}
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
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

  const renderSupportTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <p className="text-gray-600 mb-6">
          Our support team is here to help you get the most out of AIEVE.
          Whether you have questions about features, need technical assistance,
          or want to provide feedback, we'd love to hear from you!
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#E83F87] rounded-lg">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Email Support</h4>
            <p className="text-sm text-gray-600">Get direct help from our team</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
          <div className="flex items-center gap-3 w-fit">
            <code className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-800">
              team@aieve.co.uk
            </code>
            <button
              onClick={() => window.open('mailto:team@aieve.co.uk?subject=AIEVE Support Request', '_blank')}
              className="px-4 py-2 bg-[#E83F87] text-white rounded-lg hover:bg-[#d63577] transition-colors duration-200 font-medium text-sm"
            >
              Email Support
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>We typically respond within 24-48 hours</span>
        </div>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
        <h4 className="font-medium text-pink-900 mb-2">Quick Tips</h4>
        <ul className="text-sm text-pink-800 space-y-1">
          <li>• Include your account email when contacting support</li>
          <li>• Describe the issue with as much detail as possible</li>
          <li>• Mention which browser and device you're using</li>
        </ul>
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
      case 'support':
        return renderSupportTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-[#E83F87] text-[#E83F87]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-200/50">
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;