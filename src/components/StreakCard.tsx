import { Streak } from '@/types';
import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';

interface StreakCardProps {
  streak: Streak;
  index?: number;
}

export const StreakCard = ({ streak, index = 0 }: StreakCardProps) => {
  const isAtBest = streak.currentCount === streak.bestCount && streak.bestCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`relative p-4 rounded-xl border ${
        streak.isActive 
          ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30' 
          : 'bg-muted/30 border-border'
      }`}
    >
      {/* Active Indicator */}
      {streak.isActive && (
        <div className="absolute -top-1 -right-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center"
          >
            <Flame className="w-3 h-3 text-white" />
          </motion.div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Streak Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          streak.isActive ? 'gradient-streak' : 'bg-muted'
        }`}>
          <span className="text-xl">{streak.icon}</span>
        </div>

        {/* Streak Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold text-sm">{streak.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{streak.description}</p>
        </div>

        {/* Current Count */}
        <div className="text-right">
          <div className="flex items-center gap-1">
            <motion.span 
              className="font-display text-2xl font-bold text-gradient-sunset"
              key={streak.currentCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {streak.currentCount}
            </motion.span>
            {streak.isActive && (
              <Flame className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{streak.unit}</p>
        </div>
      </div>

      {/* Best Record */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Personal Best</span>
        </div>
        <span className={`text-xs font-semibold ${isAtBest ? 'text-primary' : 'text-muted-foreground'}`}>
          {streak.bestCount} {streak.unit}
          {isAtBest && ' 🎉'}
        </span>
      </div>
    </motion.div>
  );
};
