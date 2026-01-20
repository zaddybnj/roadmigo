import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ActiveTrip, Trip, Waypoint } from '@/types';
import { trips as mockTrips } from '@/data/mockData';

interface TripContextType {
  activeTrip: ActiveTrip | null;
  completedTrips: Trip[];
  isTracking: boolean;
  startTrip: (title: string, startLocation: string) => void;
  endTrip: (description: string, privacy: Trip['privacy']) => Trip;
  updateMiles: (miles: number) => void;
  addWaypoint: (waypoint: Omit<Waypoint, 'id' | 'timestamp'>) => void;
  addPhoto: (photoUrl: string) => void;
  updateNotes: (notes: string) => void;
  addState: (state: string) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(() => {
    const saved = localStorage.getItem('activeTrip');
    return saved ? JSON.parse(saved) : null;
  });

  const [completedTrips, setCompletedTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('completedTrips');
    return saved ? JSON.parse(saved) : mockTrips;
  });

  const isTracking = activeTrip !== null;

  // Persist to localStorage
  useEffect(() => {
    if (activeTrip) {
      localStorage.setItem('activeTrip', JSON.stringify(activeTrip));
    } else {
      localStorage.removeItem('activeTrip');
    }
  }, [activeTrip]);

  useEffect(() => {
    localStorage.setItem('completedTrips', JSON.stringify(completedTrips));
  }, [completedTrips]);

  // Auto-update days on road
  useEffect(() => {
    if (activeTrip) {
      const interval = setInterval(() => {
        const startDate = new Date(activeTrip.startDate);
        const now = new Date();
        const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        setActiveTrip(prev => prev ? { ...prev, daysOnRoad: days } : null);
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [activeTrip?.startDate]);

  const startTrip = useCallback((title: string, startLocation: string) => {
    const newTrip: ActiveTrip = {
      id: `trip-${Date.now()}`,
      title,
      startDate: new Date().toISOString(),
      startLocation,
      currentMiles: 0,
      statesVisited: [],
      daysOnRoad: 1,
      waypoints: [],
      photos: [],
      notes: '',
    };
    setActiveTrip(newTrip);
  }, []);

  const endTrip = useCallback((description: string, privacy: Trip['privacy']) => {
    if (!activeTrip) throw new Error('No active trip to end');

    const completedTrip: Trip = {
      id: activeTrip.id,
      userId: '1',
      userName: 'Alex Rivera',
      userAvatar: '/placeholder.svg',
      title: activeTrip.title,
      description,
      notes: activeTrip.notes,
      startDate: activeTrip.startDate,
      endDate: new Date().toISOString(),
      distance: activeTrip.currentMiles,
      states: activeTrip.statesVisited,
      nights: Math.max(0, activeTrip.daysOnRoad - 1),
      photos: activeTrip.photos,
      route: activeTrip.waypoints.map(w => [w.lng, w.lat] as [number, number]),
      likes: 0,
      comments: 0,
      privacy,
      isLiked: false,
      status: 'completed',
    };

    setCompletedTrips(prev => [completedTrip, ...prev]);
    setActiveTrip(null);
    return completedTrip;
  }, [activeTrip]);

  const updateMiles = useCallback((miles: number) => {
    setActiveTrip(prev => prev ? { ...prev, currentMiles: miles } : null);
  }, []);

  const addWaypoint = useCallback((waypoint: Omit<Waypoint, 'id' | 'timestamp'>) => {
    const newWaypoint: Waypoint = {
      ...waypoint,
      id: `wp-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setActiveTrip(prev => prev ? {
      ...prev,
      waypoints: [...prev.waypoints, newWaypoint],
    } : null);
  }, []);

  const addPhoto = useCallback((photoUrl: string) => {
    setActiveTrip(prev => prev ? {
      ...prev,
      photos: [...prev.photos, photoUrl],
    } : null);
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setActiveTrip(prev => prev ? { ...prev, notes } : null);
  }, []);

  const addState = useCallback((state: string) => {
    setActiveTrip(prev => {
      if (!prev || prev.statesVisited.includes(state)) return prev;
      return { ...prev, statesVisited: [...prev.statesVisited, state] };
    });
  }, []);

  return (
    <TripContext.Provider value={{
      activeTrip,
      completedTrips,
      isTracking,
      startTrip,
      endTrip,
      updateMiles,
      addWaypoint,
      addPhoto,
      updateNotes,
      addState,
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
