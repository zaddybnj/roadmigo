import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { TripCard } from '@/components/TripCard';
import { FeedFilters, FeedFilter } from '@/components/FeedFilters';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users } from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { useSocial } from '@/context/SocialContext';
import { useAuth } from '@/context/AuthContext';
import { ActiveTripBanner } from '@/components/ActiveTripBanner';
import { StartTripModal } from '@/components/StartTripModal';
import { OnboardingModal, useOnboarding } from '@/components/OnboardingModal';
import { FeedPageSkeleton } from '@/components/skeletons';
import { Link } from 'react-router-dom';

const FeedPage = () => {
  const { completedTrips, isTracking, loading: tripsLoading } = useTrip();
  const { following, loading: socialLoading } = useSocial();
  const { user } = useAuth();
  const [showStartModal, setShowStartModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const { showOnboarding, completeOnboarding, isReady } = useOnboarding();

  const isLoading = tripsLoading || socialLoading;

  // Calculate user stats from completed trips
  const userTrips = completedTrips.filter(t => t.userId === '1');
  const totalMiles = userTrips.reduce((acc, t) => acc + t.distance, 0);
  const totalTrips = userTrips.length;
  const allStates = new Set(userTrips.flatMap(t => t.states));
  const totalNights = userTrips.reduce((acc, t) => acc + t.nights, 0);

  // Filter trips based on active filter and privacy
  const filteredTrips = useMemo(() => {
    let trips = completedTrips.filter(trip => {
      // Filter by privacy
      if (trip.privacy === 'private' && trip.userId !== '1') return false;
      if (trip.privacy === 'friends' && trip.userId !== '1' && !following.includes(trip.userId)) return false;
      return true;
    });

    switch (activeFilter) {
      case 'following':
        return trips.filter(t => following.includes(t.userId) || t.userId === '1');
      case 'trending':
        return [...trips].sort((a, b) => b.likes - a.likes);
      case 'featured':
        return trips.filter(t => t.likes > 100);
      default:
        return trips;
    }
  }, [completedTrips, activeFilter, following]);

  return (
    <div className="min-h-screen pb-20">
      <Header showLogo />

      {/* Onboarding Modal */}
      <AnimatePresence>
        {isReady && showOnboarding && (
          <OnboardingModal onComplete={completeOnboarding} />
        )}
      </AnimatePresence>

      <main className="max-w-lg mx-auto">
        {/* Active Trip Banner */}
        <ActiveTripBanner />

        <div className="px-4 py-4">
          {isLoading ? (
            <FeedPageSkeleton />
          ) : (
            <>
              {/* Quick Stats Banner */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-4 mb-4 border border-primary/20"
              >
                <p className="text-sm text-muted-foreground mb-1">Your journey so far</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-gradient-sunset">{totalMiles.toLocaleString()}</span>
                  <span className="text-muted-foreground">miles traveled</span>
                </div>
                <div className="flex gap-4 mt-2 text-sm">
                  <span><span className="font-semibold text-foreground">{allStates.size}</span> states</span>
                  <span><span className="font-semibold text-foreground">{totalTrips}</span> trips</span>
                  <span><span className="font-semibold text-foreground">{totalNights}</span> nights</span>
                </div>
              </motion.div>

              {/* Friends Suggestion */}
              {following.length < 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4"
                >
                  <Link 
                    to="/friends"
                    className="flex items-center gap-3 p-3 bg-card rounded-xl card-elevated hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full gradient-sunset flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Find fellow RVers</p>
                      <p className="text-xs text-muted-foreground">Connect with travelers like you</p>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Feed Filters */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-4"
              >
                <FeedFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              </motion.div>

              {/* Feed Title */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">
                  {activeFilter === 'all' ? 'Recent Adventures' : 
                   activeFilter === 'following' ? 'From People You Follow' :
                   activeFilter === 'trending' ? 'Trending Now' : 'Featured Trips'}
                </h2>
              </div>

              {/* Trip Cards */}
              <div className="space-y-4">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TripCard trip={trip} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl p-8 text-center card-elevated"
                  >
                    <p className="text-muted-foreground">
                      {activeFilter === 'following' 
                        ? "No trips from people you follow yet. Discover more RVers!"
                        : "No trips to show"}
                    </p>
                    {activeFilter === 'following' && (
                      <Link 
                        to="/friends" 
                        className="inline-block mt-3 px-4 py-2 gradient-sunset text-primary-foreground text-sm font-medium rounded-lg"
                      >
                        Find RVers
                      </Link>
                    )}
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* FAB - Add Trip */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => setShowStartModal(true)}
        disabled={isTracking}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full gradient-sunset flex items-center justify-center glow-primary shadow-lg disabled:opacity-50"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      <StartTripModal isOpen={showStartModal} onClose={() => setShowStartModal(false)} />
    </div>
  );
};

export default FeedPage;
