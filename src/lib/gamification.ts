import type { Achievement, Badge, Streak, Trophy } from '@/types';
import type { Milestone } from '@/types/milestone';

/** The trip fields gamification needs (a subset of TripContext's Trip). */
export interface GamificationTrip {
  startDate: string;
  endDate: string | null;
  distance: number;
  states: string[];
  nights: number;
  photos: string[];
  likes: number;
  privacy: 'public' | 'friends' | 'private';
  milestones?: Milestone[];
}

export interface TravelStats {
  totalMiles: number;
  totalTrips: number;
  statesVisited: string[];
  nightsCamped: number;
  photosShared: number;
}

export interface LevelInfo {
  level: number;
  xp: number;
  /** XP earned since reaching the current level */
  xpIntoLevel: number;
  /** XP needed to go from the current level to the next */
  xpForLevel: number;
}

export interface Gamification {
  stats: TravelStats;
  achievements: Achievement[];
  trophies: Trophy[];
  streaks: Streak[];
  level: LevelInfo;
  unlockedBadgeCount: number;
  totalBadgeCount: number;
  unlockedTrophyCount: number;
  activeStreakCount: number;
  /** Locked badge closest to being unlocked */
  nextMilestone: Badge | null;
}

// ---------------------------------------------------------------------------
// XP / level — must match public.level_for_xp + recompute_profile_stats in
// supabase/migrations/20261109200000_server_stats_and_privacy.sql
// ---------------------------------------------------------------------------
export const xpForStats = (s: TravelStats): number =>
  s.totalMiles + 100 * s.totalTrips + 50 * s.nightsCamped + 250 * s.statesVisited.length + 10 * s.photosShared;

/** Total XP needed to reach `level` (level 1 = 0). */
export const xpToReachLevel = (level: number): number => 250 * level * (level - 1);

export const levelForXp = (xp: number): number =>
  Math.max(1, Math.floor((1 + Math.sqrt(1 + Math.max(xp, 0) / 62.5)) / 2));

export const levelInfo = (xp: number): LevelInfo => {
  const level = levelForXp(xp);
  const start = xpToReachLevel(level);
  return { level, xp, xpIntoLevel: xp - start, xpForLevel: xpToReachLevel(level + 1) - start };
};

export const levelTitle = (level: number): string => {
  if (level < 5) return 'Newcomer';
  if (level < 10) return 'Explorer';
  if (level < 20) return 'Road Warrior';
  if (level < 30) return 'Nomad';
  if (level < 50) return 'Legend';
  return 'Road Master';
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const tripDate = (t: GamificationTrip): Date => new Date(t.endDate || t.startDate);
/** YYYY-MM-DD in the user's local time zone */
const isoDay = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const monthIndex = (d: Date): number => d.getFullYear() * 12 + d.getMonth();
const normalize = (s: string) => s.trim().toLowerCase();

export const computeStats = (trips: GamificationTrip[]): TravelStats => ({
  totalMiles: trips.reduce((sum, t) => sum + Math.max(0, t.distance || 0), 0),
  totalTrips: trips.length,
  statesVisited: [...new Set(trips.flatMap(t => t.states || []))].sort(),
  nightsCamped: trips.reduce((sum, t) => sum + Math.max(0, t.nights || 0), 0),
  photosShared: trips.reduce((sum, t) => sum + (t.photos?.length || 0), 0),
});

const nationalParks = (t: GamificationTrip): string[] =>
  (t.milestones || []).filter(m => m.category === 'national_park').map(m => normalize(m.name));

interface Threshold {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: Badge['tier'];
  rarity: Badge['rarity'];
  target: number;
}

/**
 * Walk trips in date order, tracking a running value; each badge unlocks on
 * the date of the trip that pushed the value past its target.
 */
const thresholdBadges = (
  sorted: GamificationTrip[],
  defs: Threshold[],
  running: () => { step: (t: GamificationTrip) => void; value: () => number },
): Badge[] => {
  const counter = running();
  const unlocked = new Map<string, string>();
  for (const trip of sorted) {
    counter.step(trip);
    for (const d of defs) {
      if (!unlocked.has(d.id) && counter.value() >= d.target) unlocked.set(d.id, isoDay(tripDate(trip)));
    }
  }
  const finalValue = counter.value();
  return defs.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    icon: d.icon,
    tier: d.tier,
    rarity: d.rarity,
    unlockedAt: unlocked.get(d.id),
    progress: Math.min(finalValue, d.target),
    maxProgress: d.target,
  }));
};

const sumOf = (field: (t: GamificationTrip) => number) => () => {
  let total = 0;
  return { step: (t: GamificationTrip) => { total += Math.max(0, field(t)); }, value: () => total };
};

const distinctOf = (items: (t: GamificationTrip) => string[]) => () => {
  const seen = new Set<string>();
  return { step: (t: GamificationTrip) => items(t).forEach(i => seen.add(i)), value: () => seen.size };
};

const firstTripMatching = (sorted: GamificationTrip[], pred: (t: GamificationTrip) => boolean) =>
  sorted.find(pred);

// ---------------------------------------------------------------------------
// Achievements (badges)
// ---------------------------------------------------------------------------
const FOUR_CORNERS = ['AZ', 'CO', 'NM', 'UT'];

export const computeAchievements = (sorted: GamificationTrip[]): Achievement[] => {
  const distance = thresholdBadges(sorted, [
    { id: 'd1', name: 'First Mile', description: 'Complete your first mile', icon: '🚐', tier: 'bronze', rarity: 'common', target: 1 },
    { id: 'd2', name: 'Road Warrior', description: 'Travel 1,000 miles', icon: '🛣️', tier: 'bronze', rarity: 'common', target: 1000 },
    { id: 'd3', name: 'Cross Country', description: 'Travel 5,000 miles', icon: '🌎', tier: 'silver', rarity: 'rare', target: 5000 },
    { id: 'd4', name: 'Explorer Elite', description: 'Travel 25,000 miles', icon: '🏆', tier: 'gold', rarity: 'epic', target: 25000 },
    { id: 'd5', name: 'Legend of the Road', description: 'Travel 100,000 miles', icon: '🌟', tier: 'gold', rarity: 'legendary', target: 100000 },
  ], sumOf(t => t.distance));

  const states = thresholdBadges(sorted, [
    { id: 's1', name: 'First State', description: 'Visit your first state', icon: '📍', tier: 'bronze', rarity: 'common', target: 1 },
    { id: 's2', name: 'Regional Explorer', description: 'Visit 10 states', icon: '🗺️', tier: 'bronze', rarity: 'common', target: 10 },
    { id: 's3', name: 'Coast to Coast', description: 'Visit 25 states', icon: '🌟', tier: 'silver', rarity: 'rare', target: 25 },
    { id: 's4', name: 'All 50 Club', description: 'Visit all 50 states', icon: '👑', tier: 'gold', rarity: 'legendary', target: 50 },
  ], distinctOf(t => t.states || []));

  const camping = thresholdBadges(sorted, [
    { id: 'c1', name: 'First Night', description: 'Spend your first night', icon: '🏕️', tier: 'bronze', rarity: 'common', target: 1 },
    { id: 'c2', name: 'Seasoned Camper', description: '50 nights camped', icon: '⛺', tier: 'bronze', rarity: 'common', target: 50 },
    { id: 'c3', name: 'Nomad Life', description: '100 nights camped', icon: '🌙', tier: 'silver', rarity: 'rare', target: 100 },
    { id: 'c4', name: 'Home is the Road', description: '365 nights camped', icon: '🌌', tier: 'gold', rarity: 'epic', target: 365 },
  ], sumOf(t => t.nights));

  const shared = sorted.filter(t => t.privacy !== 'private');
  const social = [
    ...thresholdBadges(shared, [
      { id: 'so1', name: 'First Share', description: 'Share your first trip', icon: '📸', tier: 'bronze', rarity: 'common', target: 1 },
      { id: 'so2', name: 'Storyteller', description: 'Share 25 trips', icon: '📖', tier: 'silver', rarity: 'rare', target: 25 },
    ], sumOf(() => 1)),
    ...thresholdBadges(sorted, [
      { id: 'so3', name: 'Community Star', description: 'Get 500 total likes', icon: '⭐', tier: 'gold', rarity: 'epic', target: 500 },
    ], sumOf(t => t.likes)),
  ];

  const parks = thresholdBadges(sorted, [
    { id: 'np1', name: 'Park Explorer', description: 'Visit your first National Park', icon: '🏞️', tier: 'bronze', rarity: 'common', target: 1 },
    { id: 'np2', name: 'Nature Lover', description: 'Visit 10 National Parks', icon: '🦌', tier: 'silver', rarity: 'rare', target: 10 },
    { id: 'np3', name: 'Park Collector', description: 'Visit 30 National Parks', icon: '🏔️', tier: 'gold', rarity: 'epic', target: 30 },
    { id: 'np4', name: 'Ultimate Explorer', description: 'Visit all 63 National Parks', icon: '🎖️', tier: 'gold', rarity: 'legendary', target: 63 },
  ], distinctOf(nationalParks));

  const sunrise = firstTripMatching(sorted, t => new Date(t.startDate).getHours() < 6 && new Date(t.startDate).getHours() >= 4);
  const nightOwl = firstTripMatching(sorted, t => new Date(t.startDate).getHours() < 4);
  const corners = thresholdBadges(sorted, [
    { id: 'sp3', name: 'Four Corners', description: 'Visit Arizona, Colorado, New Mexico and Utah', icon: '🧭', tier: 'silver', rarity: 'rare', target: 4 },
  ], distinctOf(t => (t.states || []).filter(s => FOUR_CORNERS.includes(s))))[0];
  const farReaches = firstTripMatching(sorted, t => (t.states || []).some(s => s === 'AK' || s === 'HI'));

  const special: Badge[] = [
    { id: 'sp1', name: 'Sunrise Chaser', description: 'Start a trip between 4 and 6am', icon: '🌅', tier: 'bronze', rarity: 'common', unlockedAt: sunrise ? isoDay(tripDate(sunrise)) : undefined },
    { id: 'sp2', name: 'Night Owl', description: 'Start a trip after midnight', icon: '🦉', tier: 'bronze', rarity: 'common', unlockedAt: nightOwl ? isoDay(tripDate(nightOwl)) : undefined },
    corners,
    { id: 'sp4', name: 'Far Reaches', description: 'Take a trip to Alaska or Hawaii', icon: '🌋', tier: 'silver', rarity: 'rare', unlockedAt: farReaches ? isoDay(tripDate(farReaches)) : undefined },
  ];

  return [
    { id: '1', category: 'Distance', badges: distance },
    { id: '2', category: 'States', badges: states },
    { id: '3', category: 'Camping', badges: camping },
    { id: '4', category: 'Social', badges: social },
    { id: '5', category: 'National Parks', badges: parks },
    { id: '6', category: 'Special', badges: special },
  ];
};

// ---------------------------------------------------------------------------
// Trophies
// ---------------------------------------------------------------------------
const GRAND_SLAM = ['grand canyon', 'yellowstone', 'yosemite', 'glacier'];

/** Length of the longest run of consecutive integers in `values`, and the run ending at the max value. */
const runs = (values: number[]): { best: number; latest: number; latestEnd: number | null } => {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  let best = 0, current = 0, prev: number | null = null;
  for (const v of sorted) {
    current = prev !== null && v === prev + 1 ? current + 1 : 1;
    best = Math.max(best, current);
    prev = v;
  }
  return { best, latest: current, latestEnd: prev };
};

export const computeTrophies = (sorted: GamificationTrip[]): Trophy[] => {
  // Road Legend: 20,000 miles in one calendar year
  const milesByYear = new Map<number, { miles: number; date?: string }>();
  for (const t of sorted) {
    const y = tripDate(t).getFullYear();
    const entry = milesByYear.get(y) || { miles: 0 };
    entry.miles += Math.max(0, t.distance);
    if (!entry.date && entry.miles >= 20000) entry.date = isoDay(tripDate(t));
    milesByYear.set(y, entry);
  }
  const roadLegend = [...milesByYear.values()].find(e => e.date)?.date;

  // Community Champion: 100+ likes on a single trip
  const champion = firstTripMatching(sorted, t => t.likes >= 100);

  // Perfect Streak: a trip every month for 12 months
  let perfectStreak: string | undefined;
  {
    const months = new Set<number>();
    for (const t of sorted) {
      const m = monthIndex(tripDate(t));
      months.add(m);
      let run = 0;
      while (months.has(m - run)) run++;
      if (run >= 12) { perfectStreak = isoDay(tripDate(t)); break; }
    }
  }

  // Grand Slam: Grand Canyon, Yellowstone, Yosemite and Glacier in one year
  let grandSlam: string | undefined;
  {
    const seenByYear = new Map<number, Set<string>>();
    for (const t of sorted) {
      const y = tripDate(t).getFullYear();
      const seen = seenByYear.get(y) || new Set<string>();
      nationalParks(t).forEach(p => GRAND_SLAM.forEach(g => p.includes(g) && seen.add(g)));
      seenByYear.set(y, seen);
      if (seen.size === GRAND_SLAM.length) { grandSlam = isoDay(tripDate(t)); break; }
    }
  }

  // Sunset Collector: 50+ photos
  let photoCount = 0;
  const collector = firstTripMatching(sorted, t => (photoCount += t.photos?.length || 0) >= 50);

  return [
    { id: 't1', name: 'Road Legend', description: 'An extraordinary year on the road', icon: '🏆', rarity: 'legendary', unlockedAt: roadLegend, condition: 'Travel over 20,000 miles in a single year' },
    { id: 't2', name: 'Community Champion', description: 'A beloved member of the Roadmigo community', icon: '💎', rarity: 'epic', unlockedAt: champion ? isoDay(tripDate(champion)) : undefined, condition: 'Receive 100+ likes on a single trip' },
    { id: 't3', name: 'Perfect Streak', description: 'Incredible travel consistency', icon: '🔥', rarity: 'epic', unlockedAt: perfectStreak, condition: 'Take a trip every month for a full year' },
    { id: 't4', name: 'Grand Slam', description: 'Visited the iconic national parks', icon: '👑', rarity: 'legendary', unlockedAt: grandSlam, condition: 'Log Grand Canyon, Yellowstone, Yosemite and Glacier as milestones in one year' },
    { id: 't5', name: 'Sunset Collector', description: 'Captured the beauty of America', icon: '🌄', rarity: 'rare', unlockedAt: collector ? isoDay(tripDate(collector)) : undefined, condition: 'Share 50+ photos across your trips' },
  ];
};

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------
const weekIndex = (d: Date): number => {
  // Weeks since epoch, starting Monday
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return Math.floor((day + 3) / 7);
};

export const computeStreaks = (sorted: GamificationTrip[], now: Date = new Date()): Streak[] => {
  const last = sorted.length ? isoDay(tripDate(sorted[sorted.length - 1])) : '';

  const monthly = runs(sorted.map(t => monthIndex(tripDate(t))));
  const monthlyActive = monthly.latestEnd !== null && monthIndex(now) - monthly.latestEnd <= 1;

  const weekly = runs(sorted.map(t => weekIndex(tripDate(t))));
  const weeklyActive = weekly.latestEnd !== null && weekIndex(now) - weekly.latestEnd <= 1;

  const milesByYear = new Map<number, number>();
  sorted.forEach(t => {
    const y = tripDate(t).getFullYear();
    milesByYear.set(y, (milesByYear.get(y) || 0) + Math.max(0, t.distance));
  });
  const bigYears = [...milesByYear.entries()].filter(([, m]) => m >= 10000).map(([y]) => y);
  const annual = runs(bigYears);
  const annualActive = annual.latestEnd !== null && now.getFullYear() - annual.latestEnd <= 1;

  return [
    { id: 'st1', name: 'Monthly Traveler', description: 'Consecutive months with a trip', icon: '📆', currentCount: monthlyActive ? monthly.latest : 0, bestCount: monthly.best, unit: 'months', lastUpdated: last, isActive: monthlyActive },
    { id: 'st2', name: 'Weekly Explorer', description: 'Consecutive weeks with a trip', icon: '🚐', currentCount: weeklyActive ? weekly.latest : 0, bestCount: weekly.best, unit: 'weeks', lastUpdated: last, isActive: weeklyActive },
    { id: 'st4', name: 'Annual Miles', description: 'Consecutive years with 10k+ miles', icon: '🛣️', currentCount: annualActive ? annual.latest : 0, bestCount: annual.best, unit: 'years', lastUpdated: last, isActive: annualActive },
  ];
};

// ---------------------------------------------------------------------------
// Everything at once
// ---------------------------------------------------------------------------
export const computeGamification = (trips: GamificationTrip[], now: Date = new Date()): Gamification => {
  const sorted = [...trips].sort((a, b) => tripDate(a).getTime() - tripDate(b).getTime());
  const stats = computeStats(sorted);
  const achievements = computeAchievements(sorted);
  const trophies = computeTrophies(sorted);
  const streaks = computeStreaks(sorted, now);
  const badges = achievements.flatMap(a => a.badges);

  const nextMilestone = badges
    .filter(b => !b.unlockedAt && b.maxProgress && b.progress !== undefined && b.progress > 0)
    .sort((a, b) => b.progress! / b.maxProgress! - a.progress! / a.maxProgress!)[0] || null;

  return {
    stats,
    achievements,
    trophies,
    streaks,
    level: levelInfo(xpForStats(stats)),
    unlockedBadgeCount: badges.filter(b => b.unlockedAt).length,
    totalBadgeCount: badges.length,
    unlockedTrophyCount: trophies.filter(t => t.unlockedAt).length,
    activeStreakCount: streaks.filter(s => s.isActive).length,
    nextMilestone,
  };
};

/** Badges sorted rarest-first, for "top achievement" displays. */
export const rarestUnlocked = (achievements: Achievement[]): Badge | null => {
  const order = { legendary: 0, epic: 1, rare: 2, common: 3 } as const;
  return achievements
    .flatMap(a => a.badges)
    .filter(b => b.unlockedAt)
    .sort((a, b) => order[a.rarity || 'common'] - order[b.rarity || 'common'])[0] || null;
};
