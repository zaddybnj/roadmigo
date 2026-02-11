import { Trip, Badge } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Instagram, Facebook, Twitter, MapPin, Calendar, Route } from 'lucide-react';
import { useRef } from 'react';

interface ShareableCardProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'trip-complete' | 'trip-stats' | 'achievement';
  trip?: Trip;
  badge?: Badge;
}

export const ShareableCard = ({ isOpen, onClose, type, trip, badge }: ShareableCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async (platform: 'instagram' | 'facebook' | 'twitter' | 'download') => {
    const shareText = trip 
      ? `Just finished "${trip.title}" - ${trip.distance.toLocaleString()} miles across ${trip.states.length} states! 🚐✨`
      : badge 
      ? `I earned the "${badge.name}" badge! ${badge.description} 🏆`
      : '';

    const shareUrl = window.location.origin;

    if (platform === 'download') {
      // For download, we'd use html2canvas in production
      console.log('Downloading card...');
      return;
    }

    const urls: Record<string, string> = {
      instagram: `https://www.instagram.com/`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    };

    if (navigator.share && platform !== 'facebook') {
      try {
        await navigator.share({ title: 'Roadmigo', text: shareText, url: shareUrl });
      } catch (err) {
        window.open(urls[platform], '_blank');
      }
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
              className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Shareable Card */}
            <div ref={cardRef} className="rounded-3xl overflow-hidden border border-border">
              {type === 'trip-complete' && trip && (
                <TripCompleteCard trip={trip} formatDate={formatDate} />
              )}
              {type === 'trip-stats' && trip && (
                <TripStatsCard trip={trip} formatDate={formatDate} />
              )}
              {type === 'achievement' && badge && (
                <AchievementCard badge={badge} />
              )}
            </div>

            {/* Share Buttons */}
            <div className="flex gap-2 mt-4">
              <ShareButton 
                icon={<Instagram className="w-4 h-4" />} 
                label="Instagram"
                gradient="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
                onClick={() => handleShare('instagram')}
              />
              <ShareButton 
                icon={<Facebook className="w-4 h-4" />} 
                label="Facebook"
                gradient="bg-[#1877F2]"
                onClick={() => handleShare('facebook')}
              />
              <ShareButton 
                icon={<Twitter className="w-4 h-4" />} 
                label="X"
                gradient="bg-black"
                onClick={() => handleShare('twitter')}
              />
              <ShareButton 
                icon={<Download className="w-4 h-4" />} 
                label="Save"
                gradient="bg-muted"
                onClick={() => handleShare('download')}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ShareButton = ({ icon, label, gradient, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  gradient: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl ${gradient} text-white transition-transform hover:scale-105 active:scale-95`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const TripCompleteCard = ({ trip, formatDate }: { trip: Trip; formatDate: (d: string) => string }) => (
  <div className="bg-gradient-to-br from-card via-card to-muted">
    {/* Hero Image */}
    <div className="relative h-48">
      {trip.photos.length > 0 ? (
        <img src={trip.photos[0]} alt={trip.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full gradient-sunset" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      
      {/* "Just Finished" Badge */}
      <div className="absolute top-4 left-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="px-3 py-1.5 rounded-full gradient-sunset text-white text-xs font-bold uppercase tracking-wider shadow-lg"
        >
          ✨ Just Finished
        </motion.div>
      </div>

      {/* Trip Title */}
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="font-display font-bold text-2xl text-white drop-shadow-lg">{trip.title}</h3>
        <p className="text-white/80 text-sm">
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </p>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="p-5">
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatBox icon="🛣️" value={trip.distance.toLocaleString()} label="Miles" />
        <StatBox icon="🗺️" value={trip.states.length.toString()} label="States" />
        <StatBox icon="🏕️" value={trip.nights.toString()} label="Nights" />
      </div>

      {/* States Visited */}
      {trip.states.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {trip.states.map((state) => (
            <span
              key={state}
              className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs font-medium rounded-full"
            >
              {state}
            </span>
          ))}
        </div>
      )}

      {/* Branding */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
        <span className="text-lg">🚐</span>
        <span className="font-display font-semibold text-sm text-muted-foreground">RV Nomad</span>
      </div>
    </div>
  </div>
);

const TripStatsCard = ({ trip, formatDate }: { trip: Trip; formatDate: (d: string) => string }) => (
  <div className="bg-card p-6">
    {/* Header */}
    <div className="flex items-center gap-3 mb-5">
      <div className="w-12 h-12 rounded-2xl gradient-sunset flex items-center justify-center">
        <Route className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-display font-bold text-lg">{trip.title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </div>
      </div>
    </div>

    {/* Large Stats */}
    <div className="space-y-4 mb-5">
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛣️</span>
          <span className="text-muted-foreground">Distance</span>
        </div>
        <span className="font-display font-bold text-2xl text-gradient-sunset">{trip.distance.toLocaleString()} mi</span>
      </div>
      
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <span className="text-muted-foreground">States Visited</span>
        </div>
        <span className="font-display font-bold text-2xl text-secondary">{trip.states.length}</span>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏕️</span>
          <span className="text-muted-foreground">Nights Camped</span>
        </div>
        <span className="font-display font-bold text-2xl">{trip.nights}</span>
      </div>
    </div>

    {/* Route Preview */}
    {trip.states.length > 0 && (
      <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
        {trip.states.map((state, i) => (
          <span key={state} className="flex items-center gap-1">
            <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs font-medium rounded-full">
              {state}
            </span>
            {i < trip.states.length - 1 && <span className="text-muted-foreground">→</span>}
          </span>
        ))}
      </div>
    )}

    {/* Branding */}
    <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
      <span className="text-lg">🚐</span>
      <span className="font-display font-semibold text-sm text-muted-foreground">RV Nomad</span>
    </div>
  </div>
);

const AchievementCard = ({ badge }: { badge: Badge }) => {
  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-slate-400 to-slate-600',
    gold: 'from-yellow-400 to-amber-500',
  };

  return (
    <div className="bg-gradient-to-br from-card via-card to-muted">
      {/* Header Gradient */}
      <div className={`relative h-32 bg-gradient-to-br ${tierColors[badge.tier]}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-5xl">{badge.icon}</span>
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
          <div className="inline-flex px-3 py-1 rounded-full bg-muted text-xs uppercase tracking-wider text-muted-foreground mb-2">
            🏆 Achievement Unlocked
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">{badge.name}</h3>
          <p className="text-muted-foreground text-sm mb-4">{badge.description}</p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
            <span className="capitalize font-medium text-sm">{badge.tier} Badge</span>
          </div>
        </motion.div>

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
          <span className="text-lg">🚐</span>
          <span className="font-display font-semibold text-sm text-muted-foreground">RV Nomad</span>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, value, label }: { icon: string; value: string; label: string }) => (
  <div className="text-center">
    <span className="text-2xl mb-1 block">{icon}</span>
    <div className="font-display font-bold text-xl">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
