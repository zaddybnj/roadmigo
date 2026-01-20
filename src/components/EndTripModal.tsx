import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Lock, Users, Globe } from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { Trip } from '@/types';
import { useNavigate } from 'react-router-dom';

interface EndTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const privacyOptions: { value: Trip['privacy']; icon: React.ReactNode; label: string; desc: string }[] = [
  { value: 'public', icon: <Globe className="w-5 h-5" />, label: 'Public', desc: 'Everyone can see' },
  { value: 'friends', icon: <Users className="w-5 h-5" />, label: 'Friends', desc: 'Only friends' },
  { value: 'private', icon: <Lock className="w-5 h-5" />, label: 'Private', desc: 'Only you' },
];

export const EndTripModal = ({ isOpen, onClose }: EndTripModalProps) => {
  const { activeTrip, endTrip } = useTrip();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<Trip['privacy']>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeTrip) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const completedTrip = endTrip(description.trim() || 'What an amazing adventure!', privacy);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setDescription('');
      onClose();
      navigate(`/trip/${completedTrip.id}`);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl p-6 z-50 card-elevated max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-forest flex items-center justify-center">
                  <Flag className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">End Trip</h2>
                  <p className="text-sm text-muted-foreground">Complete your adventure</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Trip Summary */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <h3 className="font-display font-semibold mb-3">{activeTrip.title}</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-display text-xl font-bold text-primary">{activeTrip.currentMiles.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Miles</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-foreground">{activeTrip.daysOnRoad}</p>
                  <p className="text-xs text-muted-foreground">Days</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-secondary">{activeTrip.statesVisited.length}</p>
                  <p className="text-xs text-muted-foreground">States</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Share your story
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your journey..."
                  rows={3}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Who can see this trip?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {privacyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPrivacy(option.value)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        privacy === option.value
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-muted border-2 border-transparent hover:border-muted-foreground/20'
                      }`}
                    >
                      <div className={`mx-auto mb-1 ${privacy === option.value ? 'text-primary' : 'text-muted-foreground'}`}>
                        {option.icon}
                      </div>
                      <p className={`text-xs font-medium ${privacy === option.value ? 'text-primary' : 'text-foreground'}`}>
                        {option.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl gradient-forest text-secondary-foreground font-display font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Flag className="w-5 h-5" />
                    Complete Trip
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
