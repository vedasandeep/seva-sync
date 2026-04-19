import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      default: 'bg-gray-200 text-gray-800',
      primary: 'bg-blue-200 text-blue-800',
      success: 'bg-green-200 text-green-800',
      danger: 'bg-red-200 text-red-800',
      warning: 'bg-yellow-200 text-yellow-800',
      info: 'bg-cyan-200 text-cyan-800',
    };

    return (
      <span
        ref={ref}
        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${variantStyles[variant]} ${className || ''}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
