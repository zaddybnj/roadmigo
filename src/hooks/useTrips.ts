import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocial } from '@/context/SocialContext';
import { useTrip, Trip } from '@/context/TripContext';
import {
  fetchFeedPage,
  fetchTripRow,
  fetchUserTripRows,
  hydrateTrips,
  FEED_PAGE_SIZE,
  FeedSort,
} from '@/lib/trips';
import { computeGamification } from '@/lib/gamification';

export type FeedMode = 'all' | 'following' | 'trending' | 'featured';

/** Paged feed of trips visible to the current user. */
export const useFeed = (mode: FeedMode) => {
  const { user } = useAuth();
  const { following, isTripLiked } = useSocial();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  const followingKey = following.join(',');
  const query = useMemo(() => {
    const sort: FeedSort = mode === 'trending' || mode === 'featured' ? 'trending' : 'recent';
    return {
      sort,
      userIds: mode === 'following' && user ? [user.id, ...following] : undefined,
      minLikes: mode === 'featured' ? 100 : undefined,
    };
    // following is compared by value via followingKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user?.id, followingKey]);

  const load = useCallback(async (pageToLoad: number) => {
    const id = ++requestId.current;
    try {
      const rows = await fetchFeedPage({ page: pageToLoad, ...query });
      const liked = new Set(rows.filter(r => isTripLiked(r.id)).map(r => r.id));
      const hydrated = await hydrateTrips(rows, liked);
      if (id !== requestId.current) return; // a newer request (e.g. filter change) won
      setTrips(prev => (pageToLoad === 0 ? hydrated : [...prev, ...hydrated.filter(t => !prev.some(p => p.id === t.id))]));
      setHasMore(rows.length === FEED_PAGE_SIZE);
      setPage(pageToLoad);
    } catch (e) {
      console.error('Error loading feed:', e);
      if (id === requestId.current) setHasMore(false);
    }
    // isTripLiked only marks the initial heart state; TripCard reads live state itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    load(0).finally(() => setLoading(false));
  }, [user, load]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await load(page + 1);
    setLoadingMore(false);
  }, [load, page, hasMore, loadingMore]);

  const refresh = useCallback(() => load(0), [load]);

  return { trips, loading, loadingMore, hasMore, loadMore, refresh };
};

/** A single trip by id: from the user's own trips if possible, otherwise fetched. */
export const useTripById = (id: string | undefined) => {
  const { completedTrips, loading: myLoading } = useTrip();
  const { isTripLiked } = useSocial();
  const own = id ? completedTrips.find(t => t.id === id) : undefined;
  const [fetched, setFetched] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(!own);

  useEffect(() => {
    if (!id || own || myLoading) {
      setLoading(myLoading && !own);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchTripRow(id)
      .then(async row => {
        if (!row || row.status !== 'completed') return null;
        const [trip] = await hydrateTrips([row], new Set(isTripLiked(row.id) ? [row.id] : []));
        return trip;
      })
      .catch(e => { console.error('Error loading trip:', e); return null; })
      .then(trip => { if (!cancelled) { setFetched(trip); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, own, myLoading]);

  return { trip: own || fetched, loading };
};

/** Another user's completed trips that the current user is allowed to see. */
export const useUserTrips = (userId: string | undefined) => {
  const { isTripLiked } = useSocial();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    fetchUserTripRows(userId)
      .then(rows => hydrateTrips(rows, new Set(rows.filter(r => isTripLiked(r.id)).map(r => r.id))))
      .catch(e => { console.error('Error loading user trips:', e); return [] as Trip[]; })
      .then(t => { if (!cancelled) { setTrips(t); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { trips, loading };
};

/** Badges, trophies, streaks and level for the signed-in user, from their real trips. */
export const useGamification = () => {
  const { completedTrips } = useTrip();
  return useMemo(() => computeGamification(completedTrips), [completedTrips]);
};
