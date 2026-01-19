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
}

export interface Achievement {
  id: string;
  category: string;
  badges: Badge[];
}
