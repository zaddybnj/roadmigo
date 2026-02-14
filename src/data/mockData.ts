import { User, Trip, Achievement, Trophy, Streak, GamificationData } from '@/types';
import tripPacificCoast from '@/assets/trip-pacific-coast.jpg';
import tripGrandCanyon from '@/assets/trip-grand-canyon.jpg';
import tripNewEngland from '@/assets/trip-new-england.jpg';

export const currentUser: User = {
  id: '1',
  name: 'Alex Rivera',
  username: '@alexrv',
  avatar: '/placeholder.svg',
  bio: 'Full-time RVer since 2022. Chasing sunsets and mountain views 🏔️',
  joinedDate: '2022-03-15',
  stats: {
    totalMiles: 24567,
    totalTrips: 47,
    statesVisited: 32,
    nightsCamped: 312,
    photosShared: 156,
  },
  badges: [],
};

export const trips: Trip[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Alex Rivera',
    userAvatar: '/placeholder.svg',
    title: 'Pacific Coast Highway Adventure',
    description: 'The most scenic drive of my life. From San Diego to Seattle, every mile was breathtaking.',
    startDate: '2024-09-01',
    endDate: '2024-09-14',
    distance: 1650,
    states: ['CA', 'OR', 'WA'],
    nights: 13,
    photos: [tripPacificCoast],
    route: [[-117.16, 32.71], [-118.24, 34.05], [-122.42, 37.77], [-122.68, 45.52], [-122.33, 47.61]],
    likes: 234,
    comments: 45,
    privacy: 'public',
    isLiked: false,
    status: 'completed',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sarah Mitchell',
    userAvatar: '/placeholder.svg',
    title: 'Grand Canyon to Monument Valley',
    description: 'Red rocks, star-filled nights, and unforgettable sunsets in the desert Southwest.',
    startDate: '2024-10-05',
    endDate: '2024-10-12',
    distance: 420,
    states: ['AZ', 'UT'],
    nights: 7,
    photos: [tripGrandCanyon],
    route: [[-112.14, 36.06], [-110.09, 36.99]],
    likes: 189,
    comments: 32,
    privacy: 'public',
    isLiked: true,
    status: 'completed',
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Chen',
    userAvatar: '/placeholder.svg',
    title: 'New England Fall Colors',
    description: 'Chasing the autumn leaves through Vermont, New Hampshire, and Maine. Pure magic!',
    startDate: '2024-10-10',
    endDate: '2024-10-20',
    distance: 890,
    states: ['VT', 'NH', 'ME', 'MA'],
    nights: 10,
    photos: [tripNewEngland],
    route: [[-72.57, 44.26], [-71.54, 43.19], [-68.77, 44.80]],
    likes: 312,
    comments: 67,
    privacy: 'public',
    isLiked: false,
    status: 'completed',
  },
];

export const achievements: Achievement[] = [
  {
    id: '1',
    category: 'Distance',
    badges: [
      { id: 'd1', name: 'First Mile', description: 'Complete your first mile', icon: '🚐', tier: 'bronze', unlockedAt: '2022-03-16', rarity: 'common' },
      { id: 'd2', name: 'Road Warrior', description: 'Travel 1,000 miles', icon: '🛣️', tier: 'bronze', unlockedAt: '2022-05-20', rarity: 'common' },
      { id: 'd3', name: 'Cross Country', description: 'Travel 5,000 miles', icon: '🌎', tier: 'silver', unlockedAt: '2023-02-14', rarity: 'rare' },
      { id: 'd4', name: 'Explorer Elite', description: 'Travel 25,000 miles', icon: '🏆', tier: 'gold', progress: 24567, maxProgress: 25000, rarity: 'epic' },
      { id: 'd5', name: 'Legend of the Road', description: 'Travel 100,000 miles', icon: '🌟', tier: 'gold', progress: 24567, maxProgress: 100000, rarity: 'legendary' },
    ],
  },
  {
    id: '2',
    category: 'States',
    badges: [
      { id: 's1', name: 'First State', description: 'Visit your first state', icon: '📍', tier: 'bronze', unlockedAt: '2022-03-16', rarity: 'common' },
      { id: 's2', name: 'Regional Explorer', description: 'Visit 10 states', icon: '🗺️', tier: 'bronze', unlockedAt: '2022-08-30', rarity: 'common' },
      { id: 's3', name: 'Coast to Coast', description: 'Visit 25 states', icon: '🌟', tier: 'silver', unlockedAt: '2023-11-05', rarity: 'rare' },
      { id: 's4', name: 'All 50 Club', description: 'Visit all 50 states', icon: '👑', tier: 'gold', progress: 32, maxProgress: 50, rarity: 'legendary' },
    ],
  },
  {
    id: '3',
    category: 'Camping',
    badges: [
      { id: 'c1', name: 'First Night', description: 'Spend your first night', icon: '🏕️', tier: 'bronze', unlockedAt: '2022-03-16', rarity: 'common' },
      { id: 'c2', name: 'Seasoned Camper', description: '50 nights camped', icon: '⛺', tier: 'bronze', unlockedAt: '2022-07-12', rarity: 'common' },
      { id: 'c3', name: 'Nomad Life', description: '100 nights camped', icon: '🌙', tier: 'silver', unlockedAt: '2022-12-01', rarity: 'rare' },
      { id: 'c4', name: 'Home is the Road', description: '365 nights camped', icon: '🌌', tier: 'gold', progress: 312, maxProgress: 365, rarity: 'epic' },
    ],
  },
  {
    id: '4',
    category: 'Social',
    badges: [
      { id: 'so1', name: 'First Share', description: 'Share your first trip', icon: '📸', tier: 'bronze', unlockedAt: '2022-03-20', rarity: 'common' },
      { id: 'so2', name: 'Storyteller', description: 'Share 25 trips', icon: '📖', tier: 'silver', unlockedAt: '2023-06-15', rarity: 'rare' },
      { id: 'so3', name: 'Community Star', description: 'Get 500 total likes', icon: '⭐', tier: 'gold', progress: 423, maxProgress: 500, rarity: 'epic' },
    ],
  },
  {
    id: '5',
    category: 'National Parks',
    badges: [
      { id: 'np1', name: 'Park Explorer', description: 'Visit your first National Park', icon: '🏞️', tier: 'bronze', unlockedAt: '2022-04-10', rarity: 'common' },
      { id: 'np2', name: 'Nature Lover', description: 'Visit 10 National Parks', icon: '🦌', tier: 'silver', unlockedAt: '2023-08-15', rarity: 'rare' },
      { id: 'np3', name: 'Park Collector', description: 'Visit 30 National Parks', icon: '🏔️', tier: 'gold', progress: 18, maxProgress: 30, rarity: 'epic' },
      { id: 'np4', name: 'Ultimate Explorer', description: 'Visit all 63 National Parks', icon: '🎖️', tier: 'gold', progress: 18, maxProgress: 63, rarity: 'legendary' },
    ],
  },
  {
    id: '6',
    category: 'Special',
    badges: [
      { id: 'sp1', name: 'Sunrise Chaser', description: 'Log a trip before 6am', icon: '🌅', tier: 'bronze', unlockedAt: '2022-06-15', rarity: 'common' },
      { id: 'sp2', name: 'Night Owl', description: 'Log a trip after midnight', icon: '🦉', tier: 'bronze', unlockedAt: '2023-01-01', rarity: 'common' },
      { id: 'sp3', name: 'Four Corners', description: 'Visit all four corner states', icon: '🧭', tier: 'silver', progress: 3, maxProgress: 4, rarity: 'rare' },
      { id: 'sp4', name: 'Border Runner', description: 'Cross international border', icon: '🛂', tier: 'silver', rarity: 'rare' },
    ],
  },
];

export const trophies: Trophy[] = [
  {
    id: 't1',
    name: 'Road Legend',
    description: 'Achieved an extraordinary milestone that only 1% of RVers reach',
    icon: '🏆',
    rarity: 'legendary',
    unlockedAt: '2024-01-15',
    condition: 'Travel over 20,000 miles in a single year',
  },
  {
    id: 't2',
    name: 'Community Champion',
    description: 'A beloved member of the Roadmigo community',
    icon: '💎',
    rarity: 'epic',
    unlockedAt: '2023-12-01',
    condition: 'Receive 100+ likes on a single trip',
  },
  {
    id: 't3',
    name: 'Perfect Streak',
    description: 'Maintained an incredible travel consistency',
    icon: '🔥',
    rarity: 'epic',
    unlockedAt: '2024-06-01',
    condition: 'Travel every month for a full year',
  },
  {
    id: 't4',
    name: 'Grand Slam',
    description: 'Visited all major iconic destinations',
    icon: '👑',
    rarity: 'legendary',
    condition: 'Visit Grand Canyon, Yellowstone, Yosemite, and Glacier in one year',
  },
  {
    id: 't5',
    name: 'Sunset Collector',
    description: 'Captured the beauty of America',
    icon: '🌄',
    rarity: 'rare',
    unlockedAt: '2023-09-20',
    condition: 'Share 50+ photos across your trips',
  },
];

export const streaks: Streak[] = [
  {
    id: 'st1',
    name: 'Monthly Traveler',
    description: 'Trips logged per consecutive month',
    icon: '📆',
    currentCount: 14,
    bestCount: 14,
    unit: 'months',
    lastUpdated: '2024-10-15',
    isActive: true,
  },
  {
    id: 'st2',
    name: 'Weekly Explorer',
    description: 'Miles driven per consecutive week',
    icon: '🚐',
    currentCount: 8,
    bestCount: 12,
    unit: 'weeks',
    lastUpdated: '2024-10-20',
    isActive: true,
  },
  {
    id: 'st3',
    name: 'Photo Streak',
    description: 'Days with photos shared',
    icon: '📸',
    currentCount: 5,
    bestCount: 21,
    unit: 'days',
    lastUpdated: '2024-10-18',
    isActive: true,
  },
  {
    id: 'st4',
    name: 'Annual Miles',
    description: 'Consecutive years with 10k+ miles',
    icon: '🛣️',
    currentCount: 3,
    bestCount: 3,
    unit: 'years',
    lastUpdated: '2024-01-01',
    isActive: true,
  },
];

export const gamificationData: GamificationData = {
  achievements,
  trophies,
  streaks,
  level: 27,
  xp: 8450,
  xpToNextLevel: 10000,
};

export const visitedStates = [
  'WA', 'OR', 'CA', 'NV', 'AZ', 'UT', 'CO', 'NM', 'TX', 'OK',
  'KS', 'NE', 'SD', 'ND', 'MT', 'ID', 'WY', 'MN', 'IA', 'MO',
  'AR', 'LA', 'MS', 'AL', 'TN', 'KY', 'IN', 'OH', 'MI', 'WI',
  'IL', 'FL'
];
