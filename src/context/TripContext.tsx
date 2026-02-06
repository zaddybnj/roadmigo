import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Milestone } from '@/types/milestone';
import { RouteData } from '@/lib/routing';

type DbTrip = Tables<'trips'>;

export interface ActiveTrip {
  id: string;
  title: string;
  startDate: string;
  startLocation: string;
  startCoords: { latitude: number; longitude: number } | null;
  currentMiles: number;
  statesVisited: string[];
  daysOnRoad: number;
  waypoints: Waypoint[];
  photos: string[];
  notes: string;
  milestones: Milestone[];
}

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  timestamp: string;
}

export interface RouteInfo {
  coordinates: [number, number][]; // [lng, lat] pairs
  distance: number; // meters
  duration: number; // seconds
  startPoint: { latitude: number; longitude: number; name?: string };
  endPoint: { latitude: number; longitude: number; name?: string };
  waypoints?: { latitude: number; longitude: number; name?: string }[]; // intermediate stops
}

export interface Trip {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string | null;
  notes: string | null;
  startDate: string;
  endDate: string | null;
  distance: number;
  states: string[];
  nights: number;
  photos: string[];
  route: [number, number][];
  routeInfo: RouteInfo | null;
  likes: number;
  comments: number;
  privacy: 'public' | 'friends' | 'private';
  isLiked: boolean;
  status: 'active' | 'completed';
  milestones: Milestone[];
}

interface TripContextType {
  activeTrip: ActiveTrip | null;
  completedTrips: Trip[];
  isTracking: boolean;
  loading: boolean;
  startTrip: (title: string, startLocation: string) => Promise<void>;
  endTrip: (description: string, privacy: Trip['privacy'], routeData?: RouteData, derivedStates?: string[]) => Promise<Trip>;
  updateMiles: (miles: number) => Promise<void>;
  addPhoto: (photoUrl: string) => Promise<void>;
  updateNotes: (notes: string) => Promise<void>;
  addState: (state: string) => Promise<void>;
  addMilestone: (milestone: Milestone) => Promise<void>;
  removeMilestone: (milestoneId: string) => Promise<void>;
  addRouteStop: (stop: Waypoint) => Promise<void>;
  removeRouteStop: (stopId: string) => Promise<void>;
  refreshTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

// Helper to convert DB trip to app Trip format
const dbTripToTrip = (dbTrip: DbTrip, userName: string, userAvatar: string, isLiked: boolean = false): Trip => {
  // Parse route info from the route JSONB field if it's in new format
  let routeInfo: RouteInfo | null = null;
  let legacyRoute: [number, number][] = [];
  
  if (dbTrip.route && typeof dbTrip.route === 'object' && !Array.isArray(dbTrip.route)) {
    // New format with full route data
    const routeData = dbTrip.route as any;
    if (routeData.coordinates) {
      routeInfo = {
        coordinates: routeData.coordinates,
        distance: routeData.distance || 0,
        duration: routeData.duration || 0,
        startPoint: routeData.startPoint || { latitude: 0, longitude: 0 },
        endPoint: routeData.endPoint || { latitude: 0, longitude: 0 },
        waypoints: routeData.waypoints,
      };
    }
  } else if (Array.isArray(dbTrip.route)) {
    // Legacy format - just coordinate pairs
    legacyRoute = dbTrip.route as [number, number][];
  }

  return {
    id: dbTrip.id,
    userId: dbTrip.user_id,
    userName,
    userAvatar,
    title: dbTrip.title,
    description: dbTrip.description,
    notes: dbTrip.notes,
    startDate: dbTrip.start_date,
    endDate: dbTrip.end_date,
    distance: dbTrip.distance || 0,
    states: dbTrip.states || [],
    nights: dbTrip.nights || 0,
    photos: dbTrip.photos || [],
    route: routeInfo?.coordinates || legacyRoute,
    routeInfo,
    likes: dbTrip.likes_count || 0,
    comments: dbTrip.comments_count || 0,
    privacy: (dbTrip.privacy as Trip['privacy']) || 'public',
    isLiked,
    status: (dbTrip.status as Trip['status']) || 'completed',
    milestones: ((dbTrip as any).milestones as Milestone[]) || [],
  };
};

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [completedTrips, setCompletedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedTripIds, setLikedTripIds] = useState<Set<string>>(new Set());

  const isTracking = activeTrip !== null;

  // Fetch trips from database
  const fetchTrips = useCallback(async () => {
    if (!user) {
      setCompletedTrips([]);
      setActiveTrip(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch all visible trips
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for all trip users
      const userIds = [...new Set((trips || []).map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      // Fetch user's liked trips
      const { data: likes } = await supabase
        .from('trip_likes')
        .select('trip_id')
        .eq('user_id', user.id);

      const likedIds = new Set((likes || []).map(l => l.trip_id));
      setLikedTripIds(likedIds);

      // Check for active trip
      const activeDbTrip = trips?.find(t => t.status === 'active' && t.user_id === user.id);
      
      if (activeDbTrip) {
        // Parse waypoints from route JSONB if they exist
        let activeWaypoints: Waypoint[] = [];
        if (activeDbTrip.route && typeof activeDbTrip.route === 'object' && !Array.isArray(activeDbTrip.route)) {
          const routeData = activeDbTrip.route as any;
          if (routeData.stops && Array.isArray(routeData.stops)) {
            activeWaypoints = routeData.stops;
          }
        }

        setActiveTrip({
          id: activeDbTrip.id,
          title: activeDbTrip.title,
          startDate: activeDbTrip.start_date,
          startLocation: '', // Not stored in DB currently
          currentMiles: activeDbTrip.distance || 0,
          statesVisited: activeDbTrip.states || [],
          daysOnRoad: Math.max(1, Math.ceil(
            (new Date().getTime() - new Date(activeDbTrip.start_date).getTime()) / (1000 * 60 * 60 * 24)
          )),
          waypoints: activeWaypoints,
          photos: activeDbTrip.photos || [],
          notes: activeDbTrip.notes || '',
          milestones: ((activeDbTrip as any).milestones as Milestone[]) || [],
        });
      } else {
        setActiveTrip(null);
      }

      // Map completed trips
      const completed = (trips || [])
        .filter(t => t.status === 'completed')
        .map(t => {
          const profileData = profileMap.get(t.user_id);
          return dbTripToTrip(
            t,
            profileData?.display_name || 'Unknown User',
            profileData?.avatar_url || '/placeholder.svg',
            likedIds.has(t.id)
          );
        });

      setCompletedTrips(completed);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trips',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Initial fetch
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Auto-update days on road for active trip
  useEffect(() => {
    if (activeTrip) {
      const interval = setInterval(() => {
        const startDate = new Date(activeTrip.startDate);
        const now = new Date();
        const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        setActiveTrip(prev => prev ? { ...prev, daysOnRoad: days } : null);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [activeTrip?.startDate]);

  const startTrip = useCallback(async (title: string, startLocation: string) => {
    if (!user) throw new Error('Must be logged in to start a trip');

    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        title,
        start_date: new Date().toISOString(),
        status: 'active',
        privacy: 'public',
        distance: 0,
        nights: 0,
        states: [],
        photos: [],
        route: [],
      })
      .select()
      .single();

    if (error) throw error;

    setActiveTrip({
      id: data.id,
      title,
      startDate: data.start_date,
      startLocation,
      currentMiles: 0,
      statesVisited: [],
      daysOnRoad: 1,
      waypoints: [],
      photos: [],
      notes: '',
      milestones: [],
    });
  }, [user]);

  const endTrip = useCallback(async (description: string, privacy: Trip['privacy'], routeData?: RouteData, derivedStates?: string[]) => {
    if (!activeTrip || !user || !profile) throw new Error('No active trip to end');

    const endDate = new Date().toISOString();
    const nights = Math.max(0, activeTrip.daysOnRoad - 1);

    // Build route data - either new format with full info or legacy waypoint format
    let routePayload: any = activeTrip.waypoints.map(w => [w.lng, w.lat]);
    
    if (routeData) {
      // Store full route info in the new format
      routePayload = {
        coordinates: routeData.coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
        startPoint: routeData.startPoint,
        endPoint: routeData.endPoint,
        waypoints: routeData.waypoints,
      };
    }

    // Use derived states from route if provided, otherwise use manually logged states
    const finalStates = derivedStates && derivedStates.length > 0 
      ? derivedStates 
      : activeTrip.statesVisited;

    const { data, error } = await supabase
      .from('trips')
      .update({
        description,
        privacy,
        end_date: endDate,
        status: 'completed',
        distance: activeTrip.currentMiles,
        nights,
        states: finalStates,
        photos: activeTrip.photos,
        notes: activeTrip.notes,
        route: routePayload,
      })
      .eq('id', activeTrip.id)
      .select()
      .single();

    if (error) throw error;

    const completedTrip = dbTripToTrip(
      data,
      profile.display_name,
      profile.avatar_url || '/placeholder.svg',
      false
    );

    setCompletedTrips(prev => [completedTrip, ...prev]);
    setActiveTrip(null);

    // Update profile stats
    await supabase
      .from('profiles')
      .update({
        total_trips: (profile.total_trips || 0) + 1,
        total_miles: (profile.total_miles || 0) + activeTrip.currentMiles,
        nights_camped: (profile.nights_camped || 0) + nights,
        states_visited: [...new Set([...(profile.states_visited || []), ...activeTrip.statesVisited])],
      })
      .eq('user_id', user.id);

    return completedTrip;
  }, [activeTrip, user, profile]);

  const updateMiles = useCallback(async (miles: number) => {
    if (!activeTrip) return;

    await supabase
      .from('trips')
      .update({ distance: miles })
      .eq('id', activeTrip.id);

    setActiveTrip(prev => prev ? { ...prev, currentMiles: miles } : null);
  }, [activeTrip]);

  const addPhoto = useCallback(async (photoUrl: string) => {
    if (!activeTrip) return;

    const newPhotos = [...activeTrip.photos, photoUrl];

    await supabase
      .from('trips')
      .update({ photos: newPhotos })
      .eq('id', activeTrip.id);

    setActiveTrip(prev => prev ? { ...prev, photos: newPhotos } : null);
  }, [activeTrip]);

  const updateNotes = useCallback(async (notes: string) => {
    if (!activeTrip) return;

    await supabase
      .from('trips')
      .update({ notes })
      .eq('id', activeTrip.id);

    setActiveTrip(prev => prev ? { ...prev, notes } : null);
  }, [activeTrip]);

  const addState = useCallback(async (state: string) => {
    if (!activeTrip || activeTrip.statesVisited.includes(state)) return;

    const newStates = [...activeTrip.statesVisited, state];

    await supabase
      .from('trips')
      .update({ states: newStates })
      .eq('id', activeTrip.id);

    setActiveTrip(prev => prev ? { ...prev, statesVisited: newStates } : null);
  }, [activeTrip]);

  const refreshTrips = useCallback(async () => {
    await fetchTrips();
  }, [fetchTrips]);

  const addMilestone = useCallback(async (milestone: Milestone) => {
    if (!activeTrip) return;

    const newMilestones = [...activeTrip.milestones, milestone];

    await supabase
      .from('trips')
      .update({ milestones: newMilestones } as any)
      .eq('id', activeTrip.id);

    setActiveTrip(prev => prev ? { ...prev, milestones: newMilestones } : null);
  }, [activeTrip]);

  const removeMilestone = useCallback(async (milestoneId: string) => {
    if (!activeTrip) return;

    const newMilestones = activeTrip.milestones.filter(m => m.id !== milestoneId);

    await supabase
      .from('trips')
      .update({ milestones: newMilestones } as any)
      .eq('id', activeTrip.id);

    setActiveTrip(prev => prev ? { ...prev, milestones: newMilestones } : null);
  }, [activeTrip]);

  const addRouteStop = useCallback(async (stop: Waypoint) => {
    if (!activeTrip) return;

    const newWaypoints = [...activeTrip.waypoints, stop];
    
    // Store waypoints in the route JSONB column as { stops: [...] }
    const routePayload = { stops: newWaypoints };

    await supabase
      .from('trips')
      .update({ route: routePayload } as any)
      .eq('id', activeTrip.id);

    setActiveTrip(prev => prev ? { ...prev, waypoints: newWaypoints } : null);
  }, [activeTrip]);

  const removeRouteStop = useCallback(async (stopId: string) => {
    if (!activeTrip) return;

    const newWaypoints = activeTrip.waypoints.filter(w => w.id !== stopId);
    
    const routePayload = { stops: newWaypoints };

    await supabase
      .from('trips')
      .update({ route: routePayload } as any)
      .eq('id', activeTrip.id);

    setActiveTrip(prev => prev ? { ...prev, waypoints: newWaypoints } : null);
  }, [activeTrip]);

  return (
    <TripContext.Provider value={{
      activeTrip,
      completedTrips,
      isTracking,
      loading,
      startTrip,
      endTrip,
      updateMiles,
      addPhoto,
      updateNotes,
      addState,
      addMilestone,
      removeMilestone,
      addRouteStop,
      removeRouteStop,
      refreshTrips,
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
