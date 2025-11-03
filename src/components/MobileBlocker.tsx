import React, { useState, useEffect, ReactNode } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import logoImage from '../assets/no-bg-logo.png';
import { isEmailConfirmationRoute, getConfirmationType } from '../utils/confirmationUtils';
import EmailConfirmationSuccess from './EmailConfirmationSuccess';

interface MobileBlockerProps {
  children: ReactNode;
}

const MobileBlocker: React.FC<MobileBlockerProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isConfirmationRoute, setIsConfirmationRoute] = useState(false);
  const [confirmationType, setConfirmationType] = useState<string | null>(null);
  const [confirmationCompleted, setConfirmationCompleted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1280);
    };

    const checkConfirmationRoute = () => {
      const currentUrl = window.location.href;
      const hash = window.location.hash;
      const search = window.location.search;

      const isConfirming = isEmailConfirmationRoute();

      // Store debug info for visual display
      setDebugInfo({
        currentUrl,
        hash,
        search,
        isConfirming,
        timestamp: new Date().toISOString()
      });

      setIsConfirmationRoute(isConfirming);
      if (isConfirming) {
        setConfirmationType(getConfirmationType());
      }
    };

    // Check on mount
    checkScreenSize();
    checkConfirmationRoute();

    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);

    // Listen for hash changes (for confirmation tokens)
    window.addEventListener('hashchange', checkConfirmationRoute);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('hashchange', checkConfirmationRoute);
    };
  }, []);

  // Handle confirmation completion detection
  useEffect(() => {
    if (isConfirmationRoute && isMobile) {
      // Give Supabase time to process the confirmation
      const confirmationTimer = setTimeout(() => {
        setConfirmationCompleted(true);
      }, 3000); // 3 seconds should be enough for processing

      // Also listen for hash changes (Supabase often clears hash after processing)
      const checkHashClear = () => {
        if (!window.location.hash || window.location.hash === '#') {
          setConfirmationCompleted(true);
        }
      };

      // Check periodically if hash was cleared
      const hashCheckInterval = setInterval(checkHashClear, 500);

      return () => {
        clearTimeout(confirmationTimer);
        clearInterval(hashCheckInterval);
      };
    }
  }, [isConfirmationRoute, isMobile]);

  // If mobile + confirmation route: show app first (for processing), then success screen
  if (isMobile && isConfirmationRoute) {
    if (confirmationCompleted) {
      return <EmailConfirmationSuccess type={confirmationType || undefined} />;
    } else {
      // Let the app load normally so Supabase can process the confirmation
      return <>{children}</>;
    }
  }

  // If on mobile and NOT a confirmation route, show the desktop-only block
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 overflow-y-auto p-4 pt-8">
        {/* Debug Info Overlay */}
        {debugInfo && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs">
            <strong>DEBUG INFO:</strong>
            <br />URL: {debugInfo.currentUrl}
            <br />Hash: {debugInfo.hash || 'none'}
            <br />Search: {debugInfo.search || 'none'}
            <br />Is Confirmation: {debugInfo.isConfirming ? 'YES' : 'NO'}
            <br />Time: {debugInfo.timestamp}
          </div>
        )}

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

          {/* Icons */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-full">
              <Smartphone className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-2xl text-gray-300">→</div>
            <div className="p-3 bg-pink-100 rounded-full">
              <Monitor className="w-6 h-6 text-[#ec4899]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Desktop Only (For Now!)
          </h1>

          {/* Message */}
          <div className="text-gray-600 space-y-3 mb-6">
            <p>
              AIEVE works best on desktop while we're in beta. Mobile app coming soon! 📱
            </p>
            <p>
              Please visit <span className="font-semibold text-[#ec4899]">app.aieve.co.uk</span> on your laptop or desktop computer.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-[#ec4899] to-[#be185d] text-white rounded-xl p-4">
            <p className="font-medium">🚀 Get the full experience</p>
            <p className="text-sm opacity-90 mt-1">Switch to your desktop for the complete AIEVE experience</p>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-400 mt-4">
            Minimum screen width: 1280px required
          </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileBlocker;