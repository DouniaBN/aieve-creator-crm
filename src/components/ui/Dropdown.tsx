import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  ({
    options,
    value,
    placeholder = 'Select option...',
    onSelect,
    disabled = false,
    className,
    triggerClassName,
    contentClassName,
    variant = 'default',
    size = 'default',
    align = 'start',
    side = 'bottom',
    ...props
  }, ref) => {
    const selectedOption = options.find(option => option.value === value);

    const handleSelect = (optionValue: string) => {
      const option = options.find(opt => opt.value === optionValue);
      if (option?.onClick) {
        option.onClick();
      }
      if (onSelect) {
        onSelect(optionValue);
      }
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref}
            variant={variant}
            size={size}
            disabled={disabled}
            className={cn(
              'justify-between min-w-[120px] bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-pink-500/25',
              triggerClassName,
              className
            )}
            {...props}
          >
            <span className="flex items-center gap-2">
              {selectedOption?.icon && (
                <selectedOption.icon className="h-4 w-4" />
              )}
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          side={side}
          className={cn(
            'min-w-[200px] rounded-xl border border-gray-200/50 bg-white/95 backdrop-blur-sm p-2 shadow-2xl',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            contentClassName
          )}
          sideOffset={4}
        >
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === value;
            
            return (
              <DropdownMenuItem
                key={option.value}
                disabled={option.disabled}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                  'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:text-pink-700',
                  'focus:bg-gradient-to-r focus:from-pink-50 focus:to-purple-50 focus:text-pink-700',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  isSelected && 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 font-medium',
                  option.className
                )}
                onSelect={() => handleSelect(option.value)}
              >
                {Icon && (
                  <Icon className={cn(
                    'h-4 w-4 flex-shrink-0',
                    isSelected ? 'text-pink-600' : 'text-gray-500'
                  )} />
                )}
                <span className="flex-1 text-sm">{option.label}</span>
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-pink-500 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export { Dropdown };