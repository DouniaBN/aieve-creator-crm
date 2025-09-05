import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface StatusOption {
  label: string;
  color: string;
  icon?: React.ComponentType<{ className?: string }>;
  hoverColor?: string;
  selectedColor?: string;
}

interface StatusDropdownProps {
  currentStatus: string;
  statusConfig: Record<string, StatusOption>;
  onStatusChange: (newStatus: string) => void;
  className?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  statusConfig,
  onStatusChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position based on available space
  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 250; // Estimated dropdown height
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // If there's not enough space below but enough above, show dropdown above
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      calculatePosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const currentConfig = statusConfig[currentStatus];
  const CurrentIcon = currentConfig?.icon;

  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
          border transition-all duration-200 min-w-[120px] justify-between
          ${currentConfig?.color || 'bg-gray-100 text-gray-800'}
          ${currentConfig?.hoverColor || 'hover:bg-gray-200'}
          border-transparent hover:border-gray-300
          focus:outline-none focus:ring-2 focus:ring-purple-500/20
          relative z-10
        `}
      >
        <div className="flex items-center gap-2">
          {CurrentIcon && <CurrentIcon className="w-4 h-4" />}
          <span>{currentConfig?.label || currentStatus}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute min-w-[200px] bg-white rounded-xl shadow-2xl 
            border border-gray-200/50 backdrop-blur-sm overflow-hidden
            transform transition-all duration-200 origin-top z-50
            ${dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          style={{ 
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          <div className="py-2">
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isSelected = key === currentStatus;
              
              return (
                <button
                  key={key}
                  onClick={() => {
                    onStatusChange(key);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                    transition-all duration-200 text-left
                    ${isSelected 
                      ? `${config.selectedColor || config.color} border-l-4 border-l-current` 
                      : `hover:${config.color} ${config.hoverColor || 'hover:bg-gray-50'}`
                    }
                  `}
                >
                  {Icon && (
                    <Icon className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-70'}`} />
                  )}
                  <span className="flex-1">{config.label}</span>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-current opacity-80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;