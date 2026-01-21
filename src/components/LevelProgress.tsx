import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export const LevelProgress = ({ level, xp, xpToNextLevel }: LevelProgressProps) => {
  const progress = (xp / xpToNextLevel) * 100;

  const getLevelTitle = (level: number): string => {
    if (level < 5) return 'Newcomer';
    if (level < 10) return 'Explorer';
    if (level < 20) return 'Road Warrior';
    if (level < 30) return 'Nomad';
    if (level < 50) return 'Legend';
    return 'Road Master';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl p-5 border border-primary/30"
    >
      <div className="flex items-center gap-4">
        {/* Level Badge */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <div className="w-16 h-16 rounded-2xl gradient-sunset flex items-center justify-center glow-primary">
            <span className="font-display text-2xl font-bold text-primary-foreground">{level}</span>
          </div>
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-3.5 h-3.5 text-yellow-900 fill-yellow-900" />
          </motion.div>
        </motion.div>

        {/* Level Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-lg">{getLevelTitle(level)}</h3>
            <span className="text-xs text-muted-foreground">Lvl {level}</span>
          </div>
          
          {/* XP Progress */}
          <div className="mb-1">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full gradient-sunset relative"
              >
                <div className="absolute inset-0 shimmer" />
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              <span className="text-primary font-semibold">{xp.toLocaleString()}</span> / {xpToNextLevel.toLocaleString()} XP
            </span>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="w-3 h-3" />
              <span className="font-medium">{(xpToNextLevel - xp).toLocaleString()} to go</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
