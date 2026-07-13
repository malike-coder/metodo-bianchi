import React from 'react';

type PaddingSize = 'sm' | 'md' | 'lg';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: PaddingSize;
}

const paddingClasses: Record<PaddingSize, string> = {
  sm: 'p-4 sm:p-6',
  md: 'p-5 sm:p-8',
  lg: 'p-5 sm:p-8 lg:p-12',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  padding = 'lg',
}) => {
  return (
    <div
      className={[
        'bg-white/60 dark:bg-[#221F1B]/70',
        'backdrop-blur-xl',
        'border border-white/50',
        'rounded-[12px]',
        'shadow-[0_10px_40px_rgba(41,37,36,0.02)]',
        'transition-all duration-300',
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

export default GlassCard;
