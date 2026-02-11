import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Instagram, Facebook, Twitter, Download, Map, Award, Flag } from 'lucide-react';
import { Trip, Badge } from '@/types';
import { ShareableCard } from './ShareableCard';

interface ShareMenuProps {
  trip?: Trip;
  badge?: Badge;
  trigger?: React.ReactNode;
  // Controlled mode props
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
}

type ShareCardType = 'trip-complete' | 'trip-stats' | 'achievement' | null;

export const ShareMenu = ({ 
  trip, 
  badge, 
  trigger, 
  isOpen: controlledOpen, 
  onClose, 
  title: customTitle, 
  description: customDescription 
}: ShareMenuProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<ShareCardType>(null);
  
  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled 
    ? (open: boolean) => { if (!open && onClose) onClose(); }
    : setInternalOpen;

  const shareOptions = trip ? [
    { 
      id: 'trip-complete' as const, 
      icon: <Flag className="w-5 h-5" />, 
      label: 'Trip Complete Card',
      description: 'Share your finished adventure',
      gradient: 'gradient-sunset'
    },
    { 
      id: 'trip-stats' as const, 
      icon: <Map className="w-5 h-5" />, 
      label: 'Stats & Map Card',
      description: 'Show off your miles and states',
      gradient: 'gradient-forest'
    },
  ] : badge ? [
    { 
      id: 'achievement' as const, 
      icon: <Award className="w-5 h-5" />, 
      label: 'Achievement Card',
      description: 'Celebrate your milestone',
      gradient: 'gradient-achievement'
    },
  ] : [];

  const handleQuickShare = async (platform: 'instagram' | 'facebook' | 'twitter') => {
    const shareText = customTitle && customDescription
      ? `${customTitle} - ${customDescription} 🚐✨`
      : trip 
      ? `Just finished "${trip.title}" - ${trip.distance.toLocaleString()} miles across ${trip.states.length} states! 🚐✨`
      : badge 
      ? `I earned the "${badge.name}" badge! ${badge.description} 🏆`
      : 'Check out my RV adventures!';

    const shareUrl = window.location.origin;

    const urls: Record<string, string> = {
      instagram: `https://www.instagram.com/`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    };

    if (navigator.share && platform !== 'facebook') {
      try {
        await navigator.share({ title: 'Roadmigo', text: shareText, url: shareUrl });
        setIsOpen(false);
      } catch (err) {
        window.open(urls[platform], '_blank');
      }
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  return (
    <>
      {/* Trigger - only show in uncontrolled mode */}
      {!isControlled && (
        <div onClick={() => setIsOpen(true)}>
          {trigger || (
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          )}
        </div>
      )}

      {/* Share Menu Modal */}
      <AnimatePresence>
        {isOpen && !activeCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 bg-card rounded-t-3xl p-6 z-50 card-elevated"
            >
              {/* Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1 bg-muted rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl">Share Your Adventure</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Card Options */}
              {shareOptions.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-muted-foreground">Create a shareable card</p>
                  {shareOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveCard(option.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl ${option.gradient} flex items-center justify-center text-white`}>
                        {option.icon}
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Quick Share */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Quick share</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleQuickShare('instagram')}
                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    <Instagram className="w-6 h-6" />
                    <span className="text-xs font-medium">Instagram</span>
                  </button>
                  <button
                    onClick={() => handleQuickShare('facebook')}
                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#1877F2] text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    <Facebook className="w-6 h-6" />
                    <span className="text-xs font-medium">Facebook</span>
                  </button>
                  <button
                    onClick={() => handleQuickShare('twitter')}
                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-black text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    <Twitter className="w-6 h-6" />
                    <span className="text-xs font-medium">X</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shareable Card Preview */}
      {activeCard && (
        <ShareableCard
          isOpen={!!activeCard}
          onClose={() => {
            setActiveCard(null);
            setIsOpen(false);
          }}
          type={activeCard}
          trip={trip}
          badge={badge}
        />
      )}
    </>
  );
};
