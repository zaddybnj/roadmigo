import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { Milestone } from '@/types/milestone';
import type { RouteInfo, Trip } from '@/context/TripContext';

export type DbTrip = Tables<'trips'>;

export interface ProfileCard {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

/** Shape of the trips.route JSONB column (several historical formats). */
export interface StoredRoute {
  coordinates?: [number, number][];
  distance?: number;
  duration?: number;
  startPoint?: RouteInfo['startPoint'];
  endPoint?: RouteInfo['endPoint'];
  waypoints?: RouteInfo['waypoints'];
  stops?: unknown[];
  startCoords?: { latitude: number; longitude: number };
  startLocationName?: string;
}

export const parseRoute = (route: DbTrip['route']): StoredRoute | null =>
  route && typeof route === 'object' && !Array.isArray(route) ? (route as unknown as StoredRoute) : null;

export const dbTripToTrip = (
  dbTrip: DbTrip,
  userName: string,
  userAvatar: string,
  isLiked = false,
): Trip => {
  let routeInfo: RouteInfo | null = null;
  let legacyRoute: [number, number][] = [];

  const routeData = parseRoute(dbTrip.route);
  if (routeData?.coordinates) {
    routeInfo = {
      coordinates: routeData.coordinates,
      distance: routeData.distance || 0,
      duration: routeData.duration || 0,
      startPoint: routeData.startPoint || { latitude: 0, longitude: 0 },
      endPoint: routeData.endPoint || { latitude: 0, longitude: 0 },
      waypoints: routeData.waypoints,
    };
  } else if (Array.isArray(dbTrip.route)) {
    legacyRoute = dbTrip.route as unknown as [number, number][];
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
    photos: (dbTrip.photos || []).filter(p => !p.startsWith('blob:')),
    route: routeInfo?.coordinates || legacyRoute,
    routeInfo,
    likes: dbTrip.likes_count || 0,
    comments: dbTrip.comments_count || 0,
    privacy: (dbTrip.privacy as Trip['privacy']) || 'public',
    isLiked,
    status: (dbTrip.status as Trip['status']) || 'completed',
    milestones: (dbTrip.milestones as unknown as Milestone[]) || [],
  };
};

/** Name + avatar for any user ids (works even when their full profile is private). */
export const fetchProfileCards = async (userIds: string[]): Promise<Map<string, ProfileCard>> => {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.rpc('get_profile_cards', { p_user_ids: ids });
  if (error) {
    console.error('Error fetching profile cards:', error);
    return new Map();
  }
  return new Map((data || []).map(p => [p.user_id, p]));
};

/** Convert DB rows to app trips, attaching author names/avatars and "liked by me". */
export const hydrateTrips = async (rows: DbTrip[], likedIds: Set<string>): Promise<Trip[]> => {
  const cards = await fetchProfileCards(rows.map(r => r.user_id));
  return rows.map(r => {
    const card = cards.get(r.user_id);
    return dbTripToTrip(r, card?.display_name || 'Roadmigo traveler', card?.avatar_url || '/placeholder.svg', likedIds.has(r.id));
  });
};

export const FEED_PAGE_SIZE = 20;

export type FeedSort = 'recent' | 'trending';

/**
 * One page of completed trips visible to the current user (RLS enforces privacy).
 * Pass `userIds` to limit to specific people (e.g. "following").
 */
export const fetchFeedPage = async (opts: {
  page: number;
  sort: FeedSort;
  userIds?: string[];
  minLikes?: number;
}): Promise<DbTrip[]> => {
  const from = opts.page * FEED_PAGE_SIZE;
  let query = supabase.from('trips').select('*').eq('status', 'completed');
  if (opts.userIds) query = query.in('user_id', opts.userIds);
  if (opts.minLikes) query = query.gte('likes_count', opts.minLikes);
  query = opts.sort === 'trending'
    ? query.order('likes_count', { ascending: false }).order('created_at', { ascending: false })
    : query.order('created_at', { ascending: false });
  const { data, error } = await query.range(from, from + FEED_PAGE_SIZE - 1);
  if (error) throw error;
  return data || [];
};

export const fetchTripRow = async (id: string): Promise<DbTrip | null> => {
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
};

export const fetchUserTripRows = async (userId: string): Promise<DbTrip[]> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
};

/** Upload an image to the trip-photos bucket and return its public URL. */
export const uploadTripPhoto = async (userId: string, tripId: string, file: File): Promise<string> => {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${userId}/${tripId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('trip-photos').upload(path, file, {
    contentType: file.type || undefined,
    cacheControl: '31536000',
  });
  if (error) throw error;
  return supabase.storage.from('trip-photos').getPublicUrl(path).data.publicUrl;
};
