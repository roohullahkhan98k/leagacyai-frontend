import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  description?: string;
  fullWidth?: boolean;
}

const PageContainer = ({
  children,
  title,
  description,
  className,
  fullWidth = false,
  ...props
}: PageContainerProps) => {
  return (
    <div className={cn('py-8', fullWidth ? 'w-full' : 'container-narrow')} {...props}>
      {(title || description) && (
        <div className="mb-8">
          {title && <h1 className="mb-2">{title}</h1>}
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
      <div className={cn('', className)}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;