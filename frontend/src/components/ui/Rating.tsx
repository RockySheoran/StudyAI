import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RatingProps {
  value: number;
  max?: number;
  editable?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Rating({
  value = 0,
  max = 5,
  editable = false,
  onChange = () => {},
  size = 'md',
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const handleClick = (newValue: number) => {
    if (editable) onChange(newValue);
  };

  const handleMouseEnter = (newValue: number) => {
    if (editable) setHoverValue(newValue);
  };

  const handleMouseLeave = () => {
    if (editable) setHoverValue(null);
  };

  return (
    <div className={cn('flex gap-1', className)}>
      {[...Array(max)].map((_, index) => {
        const ratingValue = index + 1;
        const isFilled = ratingValue <= (hoverValue || value);

        return (
          <button
            key={index}
            type="button"
            className={cn(
              sizeClasses[size],
              isFilled ? 'text-yellow-400' : 'text-gray-300',
              editable ? 'cursor-pointer hover:text-yellow-300' : 'cursor-default',
              'transition-colors duration-200'
            )}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
            disabled={!editable}
          >
            {isFilled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}