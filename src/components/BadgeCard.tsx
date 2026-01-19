import { Badge } from '@/types';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
  badge: Badge;
  index?: number;
}

const tierColors = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-slate-400 to-slate-600',
  gold: 'from-yellow-400 to-amber-500',
};

const tierBg = {
  bronze: 'bg-amber-900/20 border-amber-700/30',
  silver: 'bg-slate-600/20 border-slate-500/30',
  gold: 'bg-yellow-500/20 border-yellow-500/30',
};

export const BadgeCard = ({ badge, index = 0 }: BadgeCardProps) => {
  const isUnlocked = !!badge.unlockedAt;
  const hasProgress = badge.progress !== undefined && badge.maxProgress !== undefined;
  const progressPercent = hasProgress ? (badge.progress! / badge.maxProgress!) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`relative p-4 rounded-xl border ${
        isUnlocked
          ? tierBg[badge.tier]
          : 'bg-muted/30 border-border'
      }`}
    >
      {/* Badge Icon */}
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
            isUnlocked
              ? `bg-gradient-to-br ${tierColors[badge.tier]} glow-achievement`
              : 'bg-muted'
          }`}
        >
          {isUnlocked ? (
            <span className="text-2xl">{badge.icon}</span>
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <h4
          className={`font-display font-semibold text-sm mb-1 ${
            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {badge.name}
        </h4>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {badge.description}
        </p>

        {/* Progress Bar */}
        {hasProgress && !isUnlocked && (
          <div className="w-full mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">
                {badge.progress?.toLocaleString()} / {badge.maxProgress?.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full gradient-sunset rounded-full"
              />
            </div>
          </div>
        )}

        {/* Unlock Date */}
        {isUnlocked && badge.unlockedAt && (
          <p className="text-xs text-primary mt-2 font-medium">
            Unlocked {new Date(badge.unlockedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </motion.div>
  );
};
