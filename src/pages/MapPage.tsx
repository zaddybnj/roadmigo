import { Header } from '@/components/Header';
import { USMap } from '@/components/USMap';
import { useTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, Flag, Target, Route, Compass } from 'lucide-react';
import { useMemo } from 'react';
import { Milestone } from '@/types/milestone';
import { Waypoint } from '@/context/TripContext';

const MapPage = () => {
  const { completedTrips, activeTrip, loading } = useTrip();
  const { profile } = useAuth();

  // Get visited states from profile (source of truth) or fallback to trip data
  const visitedStates = useMemo(() => {
    if (profile?.states_visited?.length) return profile.states_visited;
    const allStates = new Set<string>();
    completedTrips.forEach(t => t.states.forEach(s => allStates.add(s)));
    if (activeTrip) activeTrip.statesVisited.forEach(s => allStates.add(s));
    return Array.from(allStates);
  }, [profile?.states_visited, completedTrips, activeTrip]);

  // Collect all milestones from completed trips
  const allMilestones = useMemo<Milestone[]>(() => {
    return completedTrips.flatMap(t => t.milestones || []);
  }, [completedTrips]);

  // Collect trip endpoint/waypoint pins for completed trips
  const tripPins = useMemo<Waypoint[]>(() => {
    const pins: Waypoint[] = [];
    completedTrips.forEach(trip => {
      if (trip.routeInfo) {
        const ri = trip.routeInfo;
        if (ri.startPoint?.latitude && ri.startPoint?.longitude) {
          pins.push({
            id: `${trip.id}-start`,
            lat: ri.startPoint.latitude,
            lng: ri.startPoint.longitude,
            name: ri.startPoint.name || trip.title + ' (Start)',
            timestamp: trip.startDate,
          });
        }
        if (ri.endPoint?.latitude && ri.endPoint?.longitude) {
          pins.push({
            id: `${trip.id}-end`,
            lat: ri.endPoint.latitude,
            lng: ri.endPoint.longitude,
            name: ri.endPoint.name || trip.title + ' (End)',
            timestamp: trip.endDate || trip.startDate,
          });
        }
        ri.waypoints?.forEach((wp, i) => {
          if (wp.latitude && wp.longitude) {
            pins.push({
              id: `${trip.id}-wp-${i}`,
              lat: wp.latitude,
              lng: wp.longitude,
              name: wp.name || `${trip.title} Stop ${i + 1}`,
              timestamp: trip.startDate,
            });
          }
        });
      } else if (trip.route?.length) {
        // Legacy route format - use first/last coords
        const first = trip.route[0];
        const last = trip.route[trip.route.length - 1];
        if (first) {
          pins.push({
            id: `${trip.id}-start`,
            lat: first[1],
            lng: first[0],
            name: trip.title + ' (Start)',
            timestamp: trip.startDate,
          });
        }
        if (last && trip.route.length > 1) {
          pins.push({
            id: `${trip.id}-end`,
            lat: last[1],
            lng: last[0],
            name: trip.title + ' (End)',
            timestamp: trip.endDate || trip.startDate,
          });
        }
      }
    });
    return pins;
  }, [completedTrips]);

  const unvisitedCount = 50 - visitedStates.length;

  return (
    <div className="min-h-screen pb-20">
      <Header title="Your Journey Map" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Map Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl overflow-hidden card-elevated mb-6"
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-semibold">States Visited</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${visitedStates.length} of 50 states explored`}
            </p>
          </div>
          <div className="p-2">
            <USMap
              visitedStates={visitedStates}
              milestones={allMilestones}
              activeStops={tripPins}
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{visitedStates.length}</p>
            <p className="text-xs text-muted-foreground">Visited</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-muted/50 border border-border rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{unvisitedCount}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <Flag className="w-5 h-5 text-primary" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{Math.round((visitedStates.length / 50) * 100)}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </motion.div>
        </div>

        {/* Trip & Milestone summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-xl p-4 card-elevated flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Route className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-foreground">{tripPins.length}</p>
              <p className="text-xs text-muted-foreground">Trip Pins</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl p-4 card-elevated flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-foreground">{allMilestones.length}</p>
              <p className="text-xs text-muted-foreground">Notable Spots</p>
            </div>
          </motion.div>
        </div>

        {/* Recent States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card rounded-xl p-4 card-elevated"
        >
          <h3 className="font-display font-semibold mb-3">States Explored</h3>
          {visitedStates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {visitedStates.slice(-10).reverse().map((state) => (
                <span
                  key={state}
                  className="px-3 py-1.5 bg-secondary/20 text-secondary text-sm font-medium rounded-full"
                >
                  {state}
                </span>
              ))}
              {visitedStates.length > 10 && (
                <span className="px-3 py-1.5 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                  +{visitedStates.length - 10} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Start a trip to track your states!</p>
          )}
        </motion.div>

        {/* Notable Spots List */}
        {allMilestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl p-4 card-elevated mt-4"
          >
            <h3 className="font-display font-semibold mb-3">Notable Spots</h3>
            <div className="flex flex-wrap gap-2">
              {allMilestones.slice(0, 8).map((m) => (
                <span
                  key={m.id}
                  className="px-3 py-1.5 bg-accent/10 text-accent-foreground text-sm font-medium rounded-full border border-accent/20"
                >
                  {m.name}
                </span>
              ))}
              {allMilestones.length > 8 && (
                <span className="px-3 py-1.5 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                  +{allMilestones.length - 8} more
                </span>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default MapPage;
