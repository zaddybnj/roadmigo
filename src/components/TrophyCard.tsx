import { Trophy } from '@/types';
import { motion } from 'framer-motion';
import { Lock, Share2 } from 'lucide-react';

interface TrophyCardProps {
  trophy: Trophy;
  index?: number;
  onShare?: (trophy: Trophy) => void;
}

const rarityStyles = {
  rare: {
    bg: 'bg-blue-500/20 border-blue-500/30',
    gradient: 'gradient-rare',
    glow: 'glow-rare',
    label: 'Rare',
    labelBg: 'bg-blue-500/30 text-blue-300',
  },
  epic: {
    bg: 'bg-purple-500/20 border-purple-500/30',
    gradient: 'gradient-epic',
    glow: 'glow-epic',
    label: 'Epic',
    labelBg: 'bg-purple-500/30 text-purple-300',
  },
  legendary: {
    bg: 'bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-pink-500/20 border-yellow-500/30',
    gradient: 'gradient-legendary',
    glow: 'glow-legendary',
    label: 'Legendary',
    labelBg: 'bg-gradient-to-r from-yellow-500/40 to-purple-500/40 text-yellow-200',
  },
};

export const TrophyCard = ({ trophy, index = 0, onShare }: TrophyCardProps) => {
  const isUnlocked = !!trophy.unlockedAt;
  const styles = rarityStyles[trophy.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-5 rounded-2xl border overflow-hidden ${
        isUnlocked ? styles.bg : 'bg-muted/30 border-border'
      }`}
    >
      {/* Shimmer effect for legendary */}
      {isUnlocked && trophy.rarity === 'legendary' && (
        <div className="absolute inset-0 shimmer pointer-events-none" />
      )}

      {/* Rarity Label */}
      <div className="absolute top-3 right-3">
        <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
          isUnlocked ? styles.labelBg : 'bg-muted text-muted-foreground'
        }`}>
          {styles.label}
        </span>
      </div>

      <div className="flex items-start gap-4">
        {/* Trophy Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
            isUnlocked ? `${styles.gradient} ${styles.glow}` : 'bg-muted'
          } ${isUnlocked && trophy.rarity === 'legendary' ? 'animate-float' : ''}`}
        >
          {isUnlocked ? (
            <span className="text-3xl">{trophy.icon}</span>
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Trophy Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-display font-bold text-base mb-1 ${
            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {trophy.name}
          </h4>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {trophy.description}
          </p>
          
          {/* Condition */}
          <p className={`text-xs ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
            {isUnlocked ? '✓ ' : ''}{trophy.condition}
          </p>

          {/* Unlock Date & Share */}
          {isUnlocked && trophy.unlockedAt && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                Unlocked {new Date(trophy.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <button 
                onClick={() => onShare?.(trophy)}
                className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
