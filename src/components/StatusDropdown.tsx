import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [absolutePosition, setAbsolutePosition] = useState({ top: 0, left: 0, width: 0 });
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
    const gap = 8; // Gap between trigger and dropdown

    let top: number;
    let position: 'bottom' | 'top';

    // If there's not enough space below but enough above, show dropdown above
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      position = 'top';
      top = triggerRect.top - gap;
    } else {
      position = 'bottom';
      top = triggerRect.bottom + gap;
    }

    setDropdownPosition(position);
    setAbsolutePosition({
      top,
      left: triggerRect.left,
      width: Math.max(triggerRect.width, 200) // Ensure minimum width
    });
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

  // Helper function to extract color classes from config
  const getColorFromConfig = (config: StatusOption, type: 'background' | 'text') => {
    if (!config?.color) return type === 'background' ? 'bg-gray-200' : 'text-gray-600';

    const colorClasses = config.color.split(' ');
    if (type === 'background') {
      const bgClass = colorClasses.find(cls => cls.startsWith('bg-'));
      return bgClass || 'bg-gray-200';
    } else {
      const textClass = colorClasses.find(cls => cls.startsWith('text-'));
      return textClass || 'text-gray-600';
    }
  };

  // Helper function to get lighter version of background color for icon
  const getLighterBgColor = (bgColor: string) => {
    const colorMap: Record<string, string> = {
      'bg-[#C4B5FD]': 'bg-[#E5E7EB]', // purple -> light gray for icon bg
      'bg-[#FBCFE8]': 'bg-[#FCE7F3]', // pink -> lighter pink
      'bg-[#FDE68A]': 'bg-[#FEF3C7]', // yellow -> lighter yellow
      'bg-[#FDBA74]': 'bg-[#FED7AA]', // orange -> lighter orange
      'bg-[#DBEAFE]': 'bg-[#EFF6FF]', // blue -> lighter blue
      'bg-[#6EE7B7]': 'bg-[#D1FAE5]', // green -> lighter green
      'bg-[#FCA5A5]': 'bg-[#FEE2E2]', // red -> lighter red
      'bg-gray-100': 'bg-gray-200',
      'bg-pink-100': 'bg-pink-200',
      'bg-green-100': 'bg-green-200',
      'bg-red-100': 'bg-red-200'
    };
    return colorMap[bgColor] || 'bg-gray-200';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold
          transition-all duration-300 min-w-[140px] justify-between shadow-sm
          border-2 border-transparent
          ${currentConfig?.color || 'bg-gray-100 text-gray-800'}
          ${currentConfig?.hoverColor || 'hover:bg-gray-200'}
          hover:shadow-md hover:scale-[1.02]
          focus:outline-none focus:ring-4 focus:ring-white/50
          relative z-[1000]
        `}
      >
        <div className="flex items-center gap-2">
          {CurrentIcon && <CurrentIcon className="w-4 h-4" />}
          <span className="font-medium">{currentConfig?.label || currentStatus}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Portal-rendered Dropdown Menu */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={`
            fixed bg-white rounded-xl shadow-xl border border-gray-200
            overflow-hidden z-[99999]
            transform transition-all duration-200
            ${dropdownPosition === 'top' ? 'origin-bottom' : 'origin-top'}
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          style={{
            top: dropdownPosition === 'top' ? absolutePosition.top - 250 : absolutePosition.top,
            left: absolutePosition.left,
            minWidth: `${absolutePosition.width}px`,
            maxHeight: '250px',
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onStatusChange(key);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
                    transition-all duration-200 text-left
                    border-l-4 border-transparent
                    ${isSelected
                      ? config.color
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    ${config.hoverColor || 'hover:bg-gray-50'}
                  `}
                >
                  <div className={`p-2 rounded-lg ${getLighterBgColor(getColorFromConfig(config, 'background'))}`}>
                    {Icon && (
                      <Icon className={`w-4 h-4 ${getColorFromConfig(config, 'text')} ${isSelected ? 'opacity-100' : 'opacity-80'}`} />
                    )}
                  </div>
                  <span className="flex-1 font-semibold">{config.label}</span>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-white/60 shadow-sm animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default StatusDropdown;