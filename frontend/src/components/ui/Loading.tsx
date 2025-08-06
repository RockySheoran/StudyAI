import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function Loading({
  size = 'md',
  color = 'text-blue-600',
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-14 w-14 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-t-transparent',
          sizeClasses[size],
          color,
          className
        )}
      />
    </div>
  );
}