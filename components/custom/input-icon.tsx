'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputIconProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconClassName?: string;
}

export default function InputIcon({
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  label,
  icon: Icon,
  iconPosition = 'left',
  iconClassName,
}: InputIconProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className={cn(
            "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5",
            iconClassName
          )} />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            paddingLeft: Icon && iconPosition === 'left' ? '2.5rem' : '1.5rem',
            paddingRight: Icon && iconPosition === 'right' ? '2.5rem' : '1.5rem'
          }}
          className={cn(
            "w-full py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F4781B] focus:border-transparent shadow-sm",
            className
          )}
        />
        {Icon && iconPosition === 'right' && (
          <Icon className={cn(
            "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5",
            iconClassName
          )} />
        )}
      </div>
    </div>
  );
}


