import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled, children, className, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg border-none cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2';

    const variantStyles: Record<string, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
      success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400',
    };

    const sizeStyles: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const finalClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className || ''}`.trim();

    return (
      <button ref={ref} disabled={disabled || loading} className={finalClassName} {...props}>
        {loading && <span className="animate-spin">⏳</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
