import React, { useState } from 'react';
import { User, DollarSign, Palette, Bell, Shield, Save } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    website: 'sarahcreates.com',
    bio: 'Content creator specializing in lifestyle, beauty, and wellness',
    address: '123 Creator St, Los Angeles, CA 90210',
    currency: 'USD'
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'business', name: 'Business', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* In-App Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">In-App Notifications</h3>
        {[
          { id: 'dashboard-notifications', label: 'Dashboard Notifications', description: 'Show notifications in the bell icon on dashboard' }
        ].map((notification) => (
          <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">{notification.label}</h4>
              <p className="text-sm text-gray-600">{notification.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E83F87]/20 focus:border-[#E83F87] transition-colors duration-200"
              placeholder="Confirm new password"
            />
          </div>
          <button className="px-4 py-2 bg-[#E83F87] text-white rounded-xl hover:bg-[#d63577] transition-colors duration-200">
            Update Password
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

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
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-200/50">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;