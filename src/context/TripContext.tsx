import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Json, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Milestone } from '@/types/milestone';
import { RouteData } from '@/lib/routing';
import { dbTripToTrip, parseRoute, uploadTripPhoto, DbTrip } from '@/lib/trips';

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
  /** The signed-in user's own completed trips (newest first). */
  completedTrips: Trip[];
  isTracking: boolean;
  loading: boolean;
  startTrip: (title: string, startLocation: string, startCoords?: { latitude: number; longitude: number }) => Promise<void>;
  endTrip: (description: string, privacy: Trip['privacy'], routeData?: RouteData, derivedStates?: string[]) => Promise<Trip>;
  updateMiles: (miles: number) => Promise<void>;
  /** Add photo URLs (http/https) to the active trip. */
  addPhotos: (photoUrls: string[]) => Promise<void>;
  addPhoto: (photoUrl: string) => Promise<void>;
  /** Upload image files to storage and add them to the active trip. */
  uploadPhotos: (files: File[]) => Promise<void>;
  updateNotes: (notes: string) => Promise<void>;
  addState: (state: string) => Promise<void>;
  addMilestone: (milestone: Milestone) => Promise<void>;
  removeMilestone: (milestoneId: string) => Promise<void>;
  addRouteStop: (stop: Waypoint) => Promise<void>;
  removeRouteStop: (stopId: string) => Promise<void>;
  refreshTrips: () => Promise<void>;
  routePreview: RouteData | null;
  setRoutePreview: (data: RouteData | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const daysSince = (iso: string) =>
  Math.max(1, Math.ceil((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)));

const toActiveTrip = (row: DbTrip): ActiveTrip => {
  const rd = parseRoute(row.route);
  return {
    id: row.id,
    title: row.title,
    startDate: row.start_date,
    startLocation: rd?.startLocationName || '',
    startCoords: rd?.startCoords || null,
    currentMiles: row.distance || 0,
    statesVisited: row.states || [],
    daysOnRoad: daysSince(row.start_date),
    waypoints: Array.isArray(rd?.stops) ? (rd!.stops as Waypoint[]) : [],
    photos: (row.photos || []).filter(p => !p.startsWith('blob:')),
    notes: row.notes || '',
    milestones: (row.milestones as unknown as Milestone[]) || [],
  };
};

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [completedTrips, setCompletedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [routePreview, setRoutePreview] = useState<RouteData | null>(null);

  // Always read the latest active trip inside async callbacks, so rapid
  // successive edits (e.g. adding several photos) don't overwrite each other.
  const activeTripRef = useRef<ActiveTrip | null>(null);
  useEffect(() => { activeTripRef.current = activeTrip; }, [activeTrip]);

  const isTracking = activeTrip !== null;

  /** Update the active trip row; throws (and toasts) if the save fails. */
  const saveActive = useCallback(async (tripId: string, updates: TablesUpdate<'trips'>) => {
    const { error } = await supabase.from('trips').update(updates).eq('id', tripId);
    if (error) {
      toast({ title: 'Could not save', description: 'Check your connection and try again.', variant: 'destructive' });
      throw error;
    }
  }, [toast]);

  const fetchTrips = useCallback(async () => {
    if (!user) {
      setCompletedTrips([]);
      setActiveTrip(null);
      setLoading(false);
      return;
    }

    try {
      const { data: rows, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const { data: likes } = await supabase.from('trip_likes').select('trip_id').eq('user_id', user.id);
      const likedIds = new Set((likes || []).map(l => l.trip_id));

      const active = (rows || []).find(t => t.status === 'active');
      setActiveTrip(active ? toActiveTrip(active) : null);

      setCompletedTrips(
        (rows || [])
          .filter(t => t.status === 'completed')
          .map(t => dbTripToTrip(t, profile?.display_name || 'You', profile?.avatar_url || '/placeholder.svg', likedIds.has(t.id))),
      );
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({ title: 'Error', description: 'Failed to load trips', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
    // profile name/avatar only label the user's own trips; don't refetch when stats change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, toast]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Keep "days on road" current while a trip is active
  const activeStartDate = activeTrip?.startDate;
  useEffect(() => {
    if (!activeStartDate) return;
    const interval = setInterval(() => {
      setActiveTrip(prev => (prev ? { ...prev, daysOnRoad: daysSince(activeStartDate) } : null));
    }, 60000);
    return () => clearInterval(interval);
  }, [activeStartDate]);

  const startTrip = useCallback(async (title: string, startLocation: string, startCoords?: { latitude: number; longitude: number }) => {
    if (!user) throw new Error('Must be logged in to start a trip');

    const routePayload = startCoords ? { startCoords, startLocationName: startLocation, stops: [] } : [];

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
        route: routePayload as Json,
      })
      .select()
      .single();

    if (error) throw error;
    setActiveTrip(toActiveTrip(data));
  }, [user]);

  const endTrip = useCallback(async (description: string, privacy: Trip['privacy'], routeData?: RouteData, derivedStates?: string[]) => {
    const current = activeTripRef.current;
    if (!current || !user) throw new Error('No active trip to end');

    const nights = Math.max(0, current.daysOnRoad - 1);

    let routePayload: unknown = current.waypoints.map(w => [w.lng, w.lat]);
    if (routeData) {
      routePayload = {
        coordinates: routeData.coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
        startPoint: routeData.startPoint,
        endPoint: routeData.endPoint,
        waypoints: routeData.waypoints,
      };
    }

    // States derived from the mapped route win over manually logged ones
    const finalStates = derivedStates && derivedStates.length > 0
      ? [...new Set([...derivedStates, ...current.statesVisited])]
      : current.statesVisited;

    const { data, error } = await supabase
      .from('trips')
      .update({
        description: description.slice(0, 1000),
        privacy,
        end_date: new Date().toISOString(),
        status: 'completed',
        distance: current.currentMiles,
        nights,
        states: finalStates,
        photos: current.photos,
        notes: current.notes,
        route: routePayload as Json,
      })
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;

    const completedTrip = dbTripToTrip(data, profile?.display_name || 'You', profile?.avatar_url || '/placeholder.svg', false);

    setCompletedTrips(prev => [completedTrip, ...prev]);
    setActiveTrip(null);
    setRoutePreview(null);

    // Profile totals are recomputed by a database trigger; pull the new numbers.
    await refreshProfile();

    return completedTrip;
  }, [user, profile, refreshProfile]);

  const updateMiles = useCallback(async (miles: number) => {
    const current = activeTripRef.current;
    if (!current) return;
    const safe = Math.max(0, Math.round(miles));
    await saveActive(current.id, { distance: safe });
    setActiveTrip(prev => (prev ? { ...prev, currentMiles: safe } : null));
  }, [saveActive]);

  const addPhotos = useCallback(async (photoUrls: string[]) => {
    const current = activeTripRef.current;
    const valid = photoUrls.filter(u => /^https?:\/\//i.test(u));
    if (!current || valid.length === 0) return;
    const newPhotos = [...current.photos, ...valid];
    activeTripRef.current = { ...current, photos: newPhotos };
    await saveActive(current.id, { photos: newPhotos });
    setActiveTrip(prev => (prev ? { ...prev, photos: newPhotos } : null));
  }, [saveActive]);

  const addPhoto = useCallback((photoUrl: string) => addPhotos([photoUrl]), [addPhotos]);

  const uploadPhotos = useCallback(async (files: File[]) => {
    const current = activeTripRef.current;
    if (!current || !user || files.length === 0) return;
    const urls: string[] = [];
    let failed = 0;
    for (const file of files) {
      try {
        urls.push(await uploadTripPhoto(user.id, current.id, file));
      } catch (e) {
        console.error('Photo upload failed:', e);
        failed++;
      }
    }
    if (failed) {
      toast({
        title: `${failed} photo${failed > 1 ? 's' : ''} didn't upload`,
        description: 'Images must be under 10 MB (JPG, PNG, WebP, HEIC or GIF).',
        variant: 'destructive',
      });
    }
    await addPhotos(urls);
  }, [user, addPhotos, toast]);

  const updateNotes = useCallback(async (notes: string) => {
    const current = activeTripRef.current;
    if (!current) return;
    const truncated = notes.slice(0, 2000);
    await saveActive(current.id, { notes: truncated });
    setActiveTrip(prev => (prev ? { ...prev, notes: truncated } : null));
  }, [saveActive]);

  const addState = useCallback(async (state: string) => {
    const current = activeTripRef.current;
    if (!current || current.statesVisited.includes(state)) return;
    const newStates = [...current.statesVisited, state];
    activeTripRef.current = { ...current, statesVisited: newStates };
    await saveActive(current.id, { states: newStates });
    setActiveTrip(prev => (prev ? { ...prev, statesVisited: newStates } : null));
  }, [saveActive]);

  const refreshTrips = useCallback(async () => {
    await fetchTrips();
  }, [fetchTrips]);

  const saveMilestones = useCallback(async (next: (m: Milestone[]) => Milestone[]) => {
    const current = activeTripRef.current;
    if (!current) return;
    const newMilestones = next(current.milestones);
    activeTripRef.current = { ...current, milestones: newMilestones };
    await saveActive(current.id, { milestones: newMilestones as unknown as Json });
    setActiveTrip(prev => (prev ? { ...prev, milestones: newMilestones } : null));
  }, [saveActive]);

  const addMilestone = useCallback((milestone: Milestone) => saveMilestones(m => [...m, milestone]), [saveMilestones]);
  const removeMilestone = useCallback((id: string) => saveMilestones(m => m.filter(x => x.id !== id)), [saveMilestones]);

  const saveStops = useCallback(async (next: (w: Waypoint[]) => Waypoint[]) => {
    const current = activeTripRef.current;
    if (!current) return;
    const newWaypoints = next(current.waypoints);
    // Preserve startCoords & startLocationName alongside the stops
    const routeData = current.startCoords
      ? { startCoords: current.startCoords, startLocationName: current.startLocation, stops: newWaypoints }
      : { stops: newWaypoints };
    activeTripRef.current = { ...current, waypoints: newWaypoints };
    await saveActive(current.id, { route: routeData as unknown as Json });
    setActiveTrip(prev => (prev ? { ...prev, waypoints: newWaypoints } : null));
  }, [saveActive]);

  const addRouteStop = useCallback((stop: Waypoint) => saveStops(w => [...w, stop]), [saveStops]);
  const removeRouteStop = useCallback((id: string) => saveStops(w => w.filter(x => x.id !== id)), [saveStops]);

  return (
    <TripContext.Provider value={{
      activeTrip,
      completedTrips,
      isTracking,
      loading,
      startTrip,
      endTrip,
      updateMiles,
      addPhotos,
      addPhoto,
      uploadPhotos,
      updateNotes,
      addState,
      addMilestone,
      removeMilestone,
      addRouteStop,
      removeRouteStop,
      refreshTrips,
      routePreview,
      setRoutePreview,
    }}>
      {children}
    </TripContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
