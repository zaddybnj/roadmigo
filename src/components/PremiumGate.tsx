import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PremiumGateProps {
  featureId: string;
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  variant?: 'overlay' | 'replace' | 'blur';
  className?: string;
}

export const PremiumGate = ({
  featureId,
  featureName,
  children,
  fallback,
  showUpgradePrompt = true,
  variant = 'overlay',
  className,
}: PremiumGateProps) => {
  const { isFeatureAvailable } = useSubscription();

  if (isFeatureAvailable(featureId)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (variant === 'replace') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex flex-col items-center justify-center p-6 rounded-xl",
          "bg-gradient-to-br from-muted to-card border border-border",
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] flex items-center justify-center mb-4">
          <Crown className="w-6 h-6 text-primary-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-1">{featureName}</h3>
        <p className="text-muted-foreground text-sm text-center mb-4">
          Unlock this feature with Nomad Pro
        </p>
        {showUpgradePrompt && (
          <Link to="/pricing">
            <Button className="gradient-premium gap-2">
              <Sparkles size={16} />
              Upgrade to Pro
            </Button>
          </Link>
        )}
      </motion.div>
    );
  }

  if (variant === 'blur') {
    return (
      <div className={cn("relative", className)}>
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
          <Lock className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-3">Pro Feature</p>
          {showUpgradePrompt && (
            <Link to="/pricing">
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)]">
                <Crown size={14} />
                Unlock
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Overlay variant
  return (
    <div className={cn("relative", className)}>
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Link to="/pricing">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 border-[hsl(265_85%_60%)] text-[hsl(265_85%_60%)] hover:bg-[hsl(265_85%_60%)]/10"
          >
            <Lock size={14} />
            Unlock {featureName}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};
