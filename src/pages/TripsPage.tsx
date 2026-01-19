import { Header } from '@/components/Header';
import { trips } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Moon, ChevronRight } from 'lucide-react';

const TripsPage = () => {
  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Filter only user's trips (id: 1)
  const myTrips = trips.filter(t => t.userId === '1');

  return (
    <div className="min-h-screen pb-20">
      <Header title="My Trips" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Trip Summary */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 card-elevated mb-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-primary">47</p>
              <p className="text-xs text-muted-foreground">Total Trips</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">2024</p>
              <p className="text-xs text-muted-foreground">This Year: 12</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-secondary">24.5k</p>
              <p className="text-xs text-muted-foreground">Total Miles</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['All', '2024', '2023', '2022'].map((filter, i) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                i === 0
                  ? 'gradient-sunset text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Trip List */}
        <div className="space-y-3">
          {[...myTrips, ...trips].slice(0, 6).map((trip, index) => (
            <motion.div
              key={`${trip.id}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-4 card-elevated flex items-center gap-4"
            >
              {/* Trip Icon */}
              <div className="w-12 h-12 rounded-lg gradient-forest flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🚐</span>
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
          ))}
        </div>

        {/* Start New Trip Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full mt-6 py-4 rounded-xl gradient-sunset text-primary-foreground font-display font-semibold glow-primary"
        >
          Start New Trip
        </motion.button>
      </main>
    </div>
  );
};

export default TripsPage;
