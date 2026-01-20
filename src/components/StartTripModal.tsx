import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Sparkles } from 'lucide-react';
import { useTrip } from '@/context/TripContext';

interface StartTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartTripModal = ({ isOpen, onClose }: StartTripModalProps) => {
  const { startTrip } = useTrip();
  const [title, setTitle] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    startTrip(title.trim(), startLocation.trim() || 'Unknown Location');
    
    setTimeout(() => {
      setIsSubmitting(false);
      setTitle('');
      setStartLocation('');
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl p-6 z-50 card-elevated"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-sunset flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">Start New Trip</h2>
                  <p className="text-sm text-muted-foreground">Begin your adventure</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trip Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Trip Name *
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Pacific Coast Adventure"
                    className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* Start Location */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Starting Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="e.g., San Diego, CA"
                    className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Tips */}
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                <p className="text-sm text-secondary font-medium mb-1">💡 Pro tip</p>
                <p className="text-xs text-muted-foreground">
                  You can add photos, update mileage, and log states visited during your trip.
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl gradient-sunset text-primary-foreground font-display font-semibold glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                    Starting...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    Start Adventure
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
