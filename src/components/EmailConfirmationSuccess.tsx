import React from 'react';
import { CheckCircle, Monitor } from 'lucide-react';
import logoImage from '../assets/no-bg-logo.png';

interface EmailConfirmationSuccessProps {
  type?: string;
}

const EmailConfirmationSuccess: React.FC<EmailConfirmationSuccessProps> = ({ type = 'signup' }) => {
  const getSuccessMessage = () => {
    switch (type) {
      case 'recovery':
        return 'Password reset confirmed! You can now set your new password.';
      case 'email_change':
        return 'Email change confirmed! Your new email address is now active.';
      case 'invite':
        return 'Invitation accepted! Welcome to AIEVE.';
      default:
        return 'Email confirmed! Your account is now verified.';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'recovery':
        return 'Password Reset Confirmed';
      case 'email_change':
        return 'Email Updated';
      case 'invite':
        return 'Welcome to AIEVE';
      default:
        return 'Email Confirmed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-y-auto p-4 pt-8">
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          {/* Logo */}
          <div className="mb-6">
            <img
              src={logoImage}
              alt="AIEVE Logo"
              className="h-16 w-auto mx-auto"
            />
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {getTitle()}
          </h1>

          {/* Success Message */}
          <div className="text-gray-600 space-y-3 mb-6">
            <p>{getSuccessMessage()}</p>
          </div>

          {/* Desktop Redirect Message */}
          <div className="bg-gradient-to-r from-[#ec4899] to-[#be185d] text-white rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Monitor className="w-6 h-6 mr-2" />
              <span className="font-medium">Continue on Desktop</span>
            </div>
            <p className="text-sm opacity-90">
              Please visit <span className="font-semibold">app.aieve.co.uk</span> on your desktop computer to access the full AIEVE experience.
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-500 space-y-2">
            <p>🎉 You're all set! Your account is ready to use.</p>
            <p>💻 AIEVE works best on desktop during our beta phase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationSuccess;