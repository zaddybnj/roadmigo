import { Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  variant?: 'inline' | 'corner' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const PremiumBadge = ({ 
  variant = 'pill', 
  size = 'md', 
  animated = true,
  className 
}: PremiumBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 16,
  };

  if (variant === 'corner') {
    return (
      <motion.div
        initial={animated ? { scale: 0, rotate: -20 } : false}
        animate={{ scale: 1, rotate: 0 }}
        className={cn(
          "absolute -top-1 -right-1 bg-gradient-to-br from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] rounded-full p-1 shadow-lg",
          className
        )}
      >
        <Crown size={iconSizes[size]} className="text-primary-foreground" />
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[hsl(265_85%_60%)]", className)}>
        <Crown size={iconSizes[size]} />
        <span className="font-semibold">PRO</span>
      </span>
    );
  }

  return (
    <motion.span
      initial={animated ? { opacity: 0, y: -10 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-1.5 font-display font-semibold",
        "bg-gradient-to-r from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)]",
        "text-primary-foreground rounded-full shadow-lg",
        sizeClasses[size],
        className
      )}
    >
      <Sparkles size={iconSizes[size]} />
      PRO
    </motion.span>
  );
};
