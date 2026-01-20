import { motion } from 'framer-motion';
import { Navigation, Clock, MapPin, Gauge, ChevronRight } from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { Link } from 'react-router-dom';

export const ActiveTripBanner = () => {
  const { activeTrip, isTracking } = useTrip();

  if (!isTracking || !activeTrip) return null;

  const formatDuration = (days: number) => {
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  return (
    <Link to="/trip/active">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-4"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl p-4 border border-primary/30">
          {/* Animated border effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          
          <div className="relative flex items-center gap-4">
            {/* Pulsing icon */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-primary/30 rounded-xl"
              />
              <div className="relative w-12 h-12 rounded-xl gradient-sunset flex items-center justify-center">
                <Navigation className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-primary/30 text-primary text-xs font-semibold rounded-full">
                  LIVE
                </span>
                <h3 className="font-display font-bold text-sm truncate">{activeTrip.title}</h3>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(activeTrip.daysOnRoad)}
                </span>
                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  {activeTrip.currentMiles.toLocaleString()} mi
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {activeTrip.statesVisited.length} states
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
