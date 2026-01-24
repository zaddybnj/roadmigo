import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Lock, Users, Globe, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useTrip, Trip } from '@/context/TripContext';
import { useNavigate } from 'react-router-dom';
import { LocationSearch } from '@/components/LocationSearch';
import { fetchRoute, RouteData, formatRouteMiles, formatRouteDuration } from '@/lib/routing';
import { useToast } from '@/hooks/use-toast';

interface EndTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Privacy = 'public' | 'friends' | 'private';

interface LocationResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

const privacyOptions: { value: Privacy; icon: React.ReactNode; label: string; desc: string }[] = [
  { value: 'public', icon: <Globe className="w-5 h-5" />, label: 'Public', desc: 'Everyone can see' },
  { value: 'friends', icon: <Users className="w-5 h-5" />, label: 'Friends', desc: 'Only friends' },
  { value: 'private', icon: <Lock className="w-5 h-5" />, label: 'Private', desc: 'Only you' },
];

export const EndTripModal = ({ isOpen, onClose }: EndTripModalProps) => {
  const { activeTrip, endTrip } = useTrip();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Route inputs
  const [startLocationText, setStartLocationText] = useState('');
  const [endLocationText, setEndLocationText] = useState('');
  const [startLocation, setStartLocation] = useState<LocationResult | null>(null);
  const [endLocation, setEndLocation] = useState<LocationResult | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  if (!activeTrip) return null;

  const handleFetchRoute = async () => {
    if (!startLocation || !endLocation) {
      toast({
        title: 'Missing locations',
        description: 'Please select both start and end points',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingRoute(true);
    try {
      const route = await fetchRoute(
        { latitude: startLocation.latitude, longitude: startLocation.longitude, name: startLocation.name },
        { latitude: endLocation.latitude, longitude: endLocation.longitude, name: endLocation.name }
      );

      if (route) {
        setRouteData(route);
        toast({
          title: 'Route calculated!',
          description: `${formatRouteMiles(route.distance)} miles via highways`,
        });
      } else {
        toast({
          title: 'Route not found',
          description: 'Could not find a driving route between these points',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate route',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const completedTrip = await endTrip(
        description.trim() || 'What an amazing adventure!', 
        privacy,
        routeData || undefined
      );
      setDescription('');
      setRouteData(null);
      onClose();
      navigate(`/trip/${completedTrip.id}`);
    } catch (error) {
      console.error('Error ending trip:', error);
    } finally {
      setIsSubmitting(false);
    }
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
              {/* Route Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Route (optional)
                </label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Add start and end points to show your route on the map
                </p>
                
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">S</span>
                    </div>
                    <LocationSearch
                      value={startLocationText}
                      onChange={setStartLocationText}
                      onLocationSelect={(loc) => setStartLocation(loc)}
                      placeholder="Where did you start?"
                      className="pl-12"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-secondary-foreground text-xs font-bold">E</span>
                    </div>
                    <LocationSearch
                      value={endLocationText}
                      onChange={setEndLocationText}
                      onLocationSelect={(loc) => setEndLocation(loc)}
                      placeholder="Where did you end up?"
                      className="pl-12"
                    />
                  </div>
                </div>

                {startLocation && endLocation && !routeData && (
                  <motion.button
                    type="button"
                    onClick={handleFetchRoute}
                    disabled={isLoadingRoute}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {isLoadingRoute ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating route...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        Calculate Route
                      </>
                    )}
                  </motion.button>
                )}

                {routeData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary/10 border border-secondary/20 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium text-secondary">Route calculated!</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatRouteMiles(routeData.distance)} miles</span>
                      <span>•</span>
                      <span>{formatRouteDuration(routeData.duration)} drive</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRouteData(null)}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2"
                    >
                      Clear route
                    </button>
                  </motion.div>
                )}
              </div>

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
