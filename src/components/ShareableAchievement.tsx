import { Badge, Trophy } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';
import { currentUser } from '@/data/mockData';

interface ShareableAchievementProps {
  badge?: Badge;
  trophy?: Trophy;
  isOpen: boolean;
  onClose: () => void;
}

const tierColors = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-slate-400 to-slate-600',
  gold: 'from-yellow-400 to-amber-500',
};

export const ShareableAchievement = ({ badge, trophy, isOpen, onClose }: ShareableAchievementProps) => {
  const item = badge || trophy;
  if (!item) return null;

  const isTrophy = !!trophy;
  const tier = badge?.tier;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I earned the "${item.name}" ${isTrophy ? 'trophy' : 'badge'}!`,
          text: `${item.description} 🏆 Join me on RV Nomad!`,
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Shareable Card */}
            <div className="bg-gradient-to-br from-card via-card to-muted rounded-3xl overflow-hidden border border-border">
              {/* Header with gradient */}
              <div className={`relative h-32 ${
                isTrophy 
                  ? trophy.rarity === 'legendary' ? 'gradient-legendary' 
                    : trophy.rarity === 'epic' ? 'gradient-epic' 
                    : 'gradient-rare'
                  : tier ? `bg-gradient-to-br ${tierColors[tier]}` : 'gradient-sunset'
              }`}>
                {/* Decorative circles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-5xl">{isTrophy ? trophy.icon : badge?.icon}</span>
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    {isTrophy ? `${trophy.rarity} Trophy` : `${tier} Badge`}
                  </p>
                  <h3 className="font-display text-2xl font-bold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{item.description}</p>

                  {/* User Info */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm">🚐</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.username}</p>
                    </div>
                  </div>

                  {/* RV Nomad branding */}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span className="text-sm">🏕️</span>
                    <span>RV Nomad</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl gradient-sunset text-primary-foreground font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button 
                className="py-3 px-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
