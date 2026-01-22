export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  stats: UserStats;
  badges: Badge[];
}

export interface UserStats {
  totalMiles: number;
  totalTrips: number;
  statesVisited: number;
  nightsCamped: number;
  photosShared: number;
}

export interface Trip {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  notes?: string;
  startDate: string;
  endDate: string;
  distance: number;
  states: string[];
  nights: number;
  photos: string[];
  route: [number, number][];
  likes: number;
  comments: number;
  privacy: 'public' | 'friends' | 'private';
  isLiked: boolean;
  status: 'active' | 'completed' | 'draft';
}

export interface ActiveTrip {
  id: string;
  title: string;
  startDate: string;
  startLocation: string;
  currentMiles: number;
  statesVisited: string[];
  daysOnRoad: number;
  waypoints: Waypoint[];
  photos: string[];
  notes: string;
}

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  location: string;
  state: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  category?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  category: string;
  badges: Badge[];
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  condition: string;
}

export interface Streak {
  id: string;
  name: string;
  description: string;
  icon: string;
  currentCount: number;
  bestCount: number;
  unit: string;
  lastUpdated: string;
  isActive: boolean;
}

export interface GamificationData {
  achievements: Achievement[];
  trophies: Trophy[];
  streaks: Streak[];
  level: number;
  xp: number;
  xpToNextLevel: number;
}

// Social types
export interface Comment {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export interface SocialUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  stats: UserStats;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export interface FeedItem {
  id: string;
  type: 'trip' | 'achievement' | 'follow';
  userId: string;
  userName: string;
  userAvatar: string;
  content: Trip | Badge | { followedUser: SocialUser };
  createdAt: string;
}
