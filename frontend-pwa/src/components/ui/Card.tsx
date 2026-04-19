import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, className, children, ...props }, ref) => {
    const hoverStyle = hoverable ? 'hover:shadow-lg cursor-pointer transition-shadow' : '';

    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md p-6 ${hoverStyle} ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
