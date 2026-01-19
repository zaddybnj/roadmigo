import { User, Trip, Achievement } from '@/types';
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
  },
];

export const achievements: Achievement[] = [
  {
    id: '1',
    category: 'Distance',
    badges: [
      { id: 'd1', name: 'First Mile', description: 'Complete your first mile', icon: '🚐', tier: 'bronze', unlockedAt: '2022-03-16' },
      { id: 'd2', name: 'Road Warrior', description: 'Travel 1,000 miles', icon: '🛣️', tier: 'bronze', unlockedAt: '2022-05-20' },
      { id: 'd3', name: 'Cross Country', description: 'Travel 5,000 miles', icon: '🌎', tier: 'silver', unlockedAt: '2023-02-14' },
      { id: 'd4', name: 'Explorer Elite', description: 'Travel 25,000 miles', icon: '🏆', tier: 'gold', progress: 24567, maxProgress: 25000 },
    ],
  },
  {
    id: '2',
    category: 'States',
    badges: [
      { id: 's1', name: 'First State', description: 'Visit your first state', icon: '📍', tier: 'bronze', unlockedAt: '2022-03-16' },
      { id: 's2', name: 'Regional Explorer', description: 'Visit 10 states', icon: '🗺️', tier: 'bronze', unlockedAt: '2022-08-30' },
      { id: 's3', name: 'Coast to Coast', description: 'Visit 25 states', icon: '🌟', tier: 'silver', unlockedAt: '2023-11-05' },
      { id: 's4', name: 'All 50 Club', description: 'Visit all 50 states', icon: '👑', tier: 'gold', progress: 32, maxProgress: 50 },
    ],
  },
  {
    id: '3',
    category: 'Camping',
    badges: [
      { id: 'c1', name: 'First Night', description: 'Spend your first night', icon: '🏕️', tier: 'bronze', unlockedAt: '2022-03-16' },
      { id: 'c2', name: 'Seasoned Camper', description: '50 nights camped', icon: '⛺', tier: 'bronze', unlockedAt: '2022-07-12' },
      { id: 'c3', name: 'Nomad Life', description: '100 nights camped', icon: '🌙', tier: 'silver', unlockedAt: '2022-12-01' },
      { id: 'c4', name: 'Home is the Road', description: '365 nights camped', icon: '🌌', tier: 'gold', progress: 312, maxProgress: 365 },
    ],
  },
  {
    id: '4',
    category: 'Social',
    badges: [
      { id: 'so1', name: 'First Share', description: 'Share your first trip', icon: '📸', tier: 'bronze', unlockedAt: '2022-03-20' },
      { id: 'so2', name: 'Storyteller', description: 'Share 25 trips', icon: '📖', tier: 'silver', unlockedAt: '2023-06-15' },
      { id: 'so3', name: 'Community Star', description: 'Get 500 total likes', icon: '⭐', tier: 'gold', progress: 423, maxProgress: 500 },
    ],
  },
];

export const visitedStates = [
  'WA', 'OR', 'CA', 'NV', 'AZ', 'UT', 'CO', 'NM', 'TX', 'OK',
  'KS', 'NE', 'SD', 'ND', 'MT', 'ID', 'WY', 'MN', 'IA', 'MO',
  'AR', 'LA', 'MS', 'AL', 'TN', 'KY', 'IN', 'OH', 'MI', 'WI',
  'IL', 'FL'
];
