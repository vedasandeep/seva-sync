import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', className, ...props }, ref) => {
    const sizeStyles: Record<string, string> = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    const initials = name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

    return (
      <div
        ref={ref}
        className={`${sizeStyles[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold overflow-hidden ${
          className || ''
        }`}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
