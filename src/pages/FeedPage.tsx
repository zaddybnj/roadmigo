import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { TripCard } from '@/components/TripCard';
import { FeedFilters, FeedFilter } from '@/components/FeedFilters';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Loader2 } from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { useSocial } from '@/context/SocialContext';
import { ActiveTripBanner } from '@/components/ActiveTripBanner';
import { StartTripModal } from '@/components/StartTripModal';
import { OnboardingModal, useOnboarding } from '@/components/OnboardingModal';
import { FeedPageSkeleton } from '@/components/skeletons';
import { Link } from 'react-router-dom';
import { useFeed, useGamification } from '@/hooks/useTrips';

const FeedPage = () => {
  const { isTracking, loading: tripsLoading } = useTrip();
  const { following, loading: socialLoading } = useSocial();
  const [showStartModal, setShowStartModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const { showOnboarding, completeOnboarding, isReady } = useOnboarding();
  const feed = useFeed(activeFilter);
  const { stats } = useGamification();

  const isLoading = tripsLoading || socialLoading || feed.loading;

  // Load the next page when the bottom of the list scrolls into view
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { loadMore, hasMore } = feed;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  const filteredTrips = feed.trips;

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
                  <span className="font-display text-3xl font-bold text-gradient-sunset">{stats.totalMiles.toLocaleString()}</span>
                  <span className="text-muted-foreground">miles traveled</span>
                </div>
                <div className="flex gap-4 mt-2 text-sm">
                  <span><span className="font-semibold text-foreground">{stats.statesVisited.length}</span> states</span>
                  <span><span className="font-semibold text-foreground">{stats.totalTrips}</span> trips</span>
                  <span><span className="font-semibold text-foreground">{stats.nightsCamped}</span> nights</span>
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
                      transition={{ delay: Math.min(index % 20, 5) * 0.1 }}
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

              {/* Infinite scroll */}
              <div ref={sentinelRef} className="h-12 flex items-center justify-center">
                {feed.loadingMore && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                {!feed.hasMore && filteredTrips.length > 0 && (
                  <p className="text-xs text-muted-foreground">You're all caught up</p>
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
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full gradient-sunset flex items-center justify-center glow-primary shadow-lg disabled:opacity-50"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      <StartTripModal isOpen={showStartModal} onClose={() => setShowStartModal(false)} />
    </div>
  );
};

export default FeedPage;
