import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Sparkles, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  variant?: 'banner' | 'card' | 'modal' | 'inline';
  title?: string;
  description?: string;
  feature?: string;
  onDismiss?: () => void;
  className?: string;
}

export const UpgradePrompt = ({
  variant = 'card',
  title = 'Unlock the Full Adventure',
  description = 'Get unlimited trips, advanced analytics, exclusive badges, and more with Nomad Pro.',
  feature,
  onDismiss,
  className,
}: UpgradePromptProps) => {
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-xl p-4",
          "bg-gradient-to-r from-[hsl(265_85%_60%)] via-[hsl(280_80%_55%)] to-[hsl(300_70%_50%)]",
          className
        )}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 right-8 w-20 h-20 rounded-full bg-white/20 blur-xl" />
          <div className="absolute bottom-2 left-8 w-16 h-16 rounded-full bg-white/20 blur-xl" />
        </div>
        
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-semibold text-white">{title}</p>
              <p className="text-white/80 text-sm">{description}</p>
            </div>
          </div>
          
          <Link to="/pricing">
            <Button size="sm" className="bg-white text-[hsl(265_85%_60%)] hover:bg-white/90 gap-1.5">
              Upgrade
              <ChevronRight size={16} />
            </Button>
          </Link>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 text-white/60 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <Link to="/pricing" className={cn("block", className)}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[hsl(265_85%_60%)]/20 to-[hsl(280_80%_55%)]/20 border border-[hsl(265_85%_60%)]/30"
        >
          <Sparkles size={16} className="text-[hsl(265_85%_60%)]" />
          <span className="text-sm font-medium">
            {feature ? `Unlock ${feature}` : 'Upgrade to Pro'}
          </span>
          <ChevronRight size={14} className="ml-auto text-muted-foreground" />
        </motion.div>
      </Link>
    );
  }

  // Card variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-gradient-to-br from-card via-card to-[hsl(265_85%_60%)]/10",
        "border border-[hsl(265_85%_60%)]/20",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[hsl(265_85%_60%)]/20 to-transparent rounded-bl-full" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg bg-gradient-to-r from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] bg-clip-text text-transparent">
            Nomad Pro
          </span>
        </div>
        
        <h3 className="font-display font-semibold text-xl mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        <Link to="/pricing">
          <Button className="w-full gap-2 bg-gradient-to-r from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] hover:opacity-90">
            <Sparkles size={16} />
            Upgrade Now
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
