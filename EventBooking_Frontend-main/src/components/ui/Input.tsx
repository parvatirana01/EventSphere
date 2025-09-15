import React from 'react';
import { cn } from '../../lib/utils';


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    leftIcon: LeftIcon, 
    rightIcon: RightIcon,
    id,
    ...props 
  }, ref) => {
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    
    const baseClasses = "w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0";
    
    
    const stateClasses = error 
      ? "border-error focus:ring-error focus:border-error" 
      : "border-neutral-300 focus:ring-accent-500 focus:border-accent-500";
    
    
    const iconClasses = cn(
      LeftIcon && "pl-12",
      RightIcon && "pr-12"
    );

    return (
      <div className="w-full">
        {}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            {label}
          </label>
        )}
        
        {}
        <div className="relative">
          {}
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              <LeftIcon className="h-5 w-5" />
            </div>
          )}
          
          {}
          <input
            id={inputId}
            className={cn(
              baseClasses,
              stateClasses,
              iconClasses,
              className
            )}
            ref={ref}
            {...props}
          />
          
          {}
          {RightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              <RightIcon className="h-5 w-5" />
            </div>
          )}
        </div>
        
        {}
        {error && (
          <p className="mt-1 text-sm text-error flex items-center">
            <svg 
              className="h-4 w-4 mr-1" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 