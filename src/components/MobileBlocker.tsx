import React, { useState, useEffect, ReactNode } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import logoImage from '../assets/no-bg-logo.png';

interface MobileBlockerProps {
  children: ReactNode;
}

const MobileBlocker: React.FC<MobileBlockerProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1280);
    };

    // Check on mount
    checkScreenSize();

    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // If on mobile, show the desktop-only block
  if (isMobile) {
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