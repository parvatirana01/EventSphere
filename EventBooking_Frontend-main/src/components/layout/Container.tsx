import React from 'react';
import { cn } from '../../lib/utils';
interface ContainerProps {
    className?: string;
    children: React.ReactNode;
  }
  
  const Container: React.FC<ContainerProps> = ({ className, children }) => (
    <div className={cn("max-w-4xl mx-auto px-4 sm:px-6 w-full", className)}>
      {children}
    </div>
  );
  
  export default Container;