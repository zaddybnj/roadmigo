import { useState } from 'react';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Moon, ChevronRight } from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { ActiveTripBanner } from '@/components/ActiveTripBanner';
import { StartTripModal } from '@/components/StartTripModal';
import { Link } from 'react-router-dom';

const TripsPage = () => {
  const { completedTrips, isTracking } = useTrip();
  const [showStartModal, setShowStartModal] = useState(false);
  const [filter, setFilter] = useState('All');

  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Filter only user's trips (id: 1) and by year
  const myTrips = completedTrips.filter(t => t.userId === '1');
  const filteredTrips = filter === 'All' 
    ? myTrips 
    : myTrips.filter(t => new Date(t.startDate).getFullYear().toString() === filter);

  const totalMiles = myTrips.reduce((acc, t) => acc + t.distance, 0);
  const totalTrips = myTrips.length;

  const years = ['All', ...Array.from(new Set(myTrips.map(t => 
    new Date(t.startDate).getFullYear().toString()
  ))).sort((a, b) => Number(b) - Number(a))];

  return (
    <div className="min-h-screen pb-20">
      <Header title="My Trips" />

      <main className="max-w-lg mx-auto">
        {/* Active Trip Banner */}
        <ActiveTripBanner />

        <div className="px-4">
          {/* Trip Summary */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 card-elevated mb-6"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-display text-2xl font-bold text-primary">{totalTrips}</p>
                <p className="text-xs text-muted-foreground">Total Trips</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">2024</p>
                <p className="text-xs text-muted-foreground">This Year: {myTrips.filter(t => new Date(t.startDate).getFullYear() === 2024).length}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-secondary">{(totalMiles / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground">Total Miles</p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {years.map((year, i) => (
              <button
                key={year}
                onClick={() => setFilter(year)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === year
                    ? 'gradient-sunset text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Trip List */}
          <div className="space-y-3">
            {filteredTrips.map((trip, index) => (
              <Link to={`/trip/${trip.id}`} key={`${trip.id}-${index}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-4 card-elevated flex items-center gap-4 mb-3"
                >
                  {/* Trip Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {trip.photos.length > 0 ? (
                      <img src={trip.photos[0]} alt={trip.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-forest flex items-center justify-center">
                        <span className="text-xl">🚐</span>
                      </div>
                    )}
                  </div>

                  {/* Trip Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm truncate">{trip.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(trip.startDate, trip.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        {trip.distance.toLocaleString()} mi
                      </span>
                      <span className="flex items-center gap-1">
                        <Moon className="w-3 h-3" />
                        {trip.nights} nights
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </motion.div>
              </Link>
            ))}
          </div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No trips found for this period</p>
            </div>
          )}

          {/* Start New Trip Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => setShowStartModal(true)}
            disabled={isTracking}
            className="w-full mt-6 py-4 rounded-xl gradient-sunset text-primary-foreground font-display font-semibold glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTracking ? 'Trip in Progress...' : 'Start New Trip'}
          </motion.button>
        </div>
      </main>

      <StartTripModal isOpen={showStartModal} onClose={() => setShowStartModal(false)} />
    </div>
  );
};

export default TripsPage;
