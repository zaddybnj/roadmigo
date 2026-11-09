import { describe, it, expect } from 'vitest';
import {
  computeGamification,
  levelForXp,
  levelInfo,
  xpToReachLevel,
  GamificationTrip,
} from './gamification';

const trip = (over: Partial<GamificationTrip> & { date: string }): GamificationTrip => ({
  startDate: `${over.date}T12:00:00`,
  endDate: `${over.date}T18:00:00`,
  distance: 0,
  states: [],
  nights: 0,
  photos: [],
  likes: 0,
  privacy: 'public',
  milestones: [],
  ...over,
});

const badge = (g: ReturnType<typeof computeGamification>, id: string) =>
  g.achievements.flatMap(a => a.badges).find(b => b.id === id)!;

describe('levels (must match level_for_xp in SQL)', () => {
  it('uses 250 * L * (L-1) thresholds', () => {
    expect(xpToReachLevel(1)).toBe(0);
    expect(xpToReachLevel(2)).toBe(500);
    expect(xpToReachLevel(3)).toBe(1500);
    expect([0, 499, 500, 1499, 1500, 2999, 3000].map(levelForXp)).toEqual([1, 1, 2, 2, 3, 3, 4]);
  });

  it('reports progress within the current level', () => {
    expect(levelInfo(2000)).toEqual({ level: 3, xp: 2000, xpIntoLevel: 500, xpForLevel: 1500 });
  });
});

describe('computeGamification', () => {
  it('gives a brand-new user nothing unlocked', () => {
    const g = computeGamification([]);
    expect(g.unlockedBadgeCount).toBe(0);
    expect(g.unlockedTrophyCount).toBe(0);
    expect(g.activeStreakCount).toBe(0);
    expect(g.level.level).toBe(1);
    expect(g.nextMilestone).toBeNull();
  });

  it('unlocks distance badges on the date the threshold was crossed', () => {
    const g = computeGamification([
      trip({ date: '2026-03-01', distance: 600 }),
      trip({ date: '2026-04-01', distance: 600 }),
    ]);
    expect(badge(g, 'd1').unlockedAt).toBe('2026-03-01');
    expect(badge(g, 'd2').unlockedAt).toBe('2026-04-01');
    expect(badge(g, 'd3').unlockedAt).toBeUndefined();
    expect(badge(g, 'd3').progress).toBe(1200);
  });

  it('counts distinct states and Four Corners', () => {
    const g = computeGamification([
      trip({ date: '2026-01-01', states: ['AZ', 'UT'] }),
      trip({ date: '2026-02-01', states: ['AZ', 'CO', 'NM'] }),
    ]);
    expect(g.stats.statesVisited).toEqual(['AZ', 'CO', 'NM', 'UT']);
    expect(badge(g, 'sp3').unlockedAt).toBe('2026-02-01');
  });

  it('does not count private trips as shared', () => {
    const g = computeGamification([trip({ date: '2026-01-01', privacy: 'private' })]);
    expect(badge(g, 'so1').unlockedAt).toBeUndefined();
  });

  it('counts each national park once', () => {
    const park = (name: string) => ({ id: name, name, category: 'national_park' as const, timestamp: '' });
    const g = computeGamification([
      trip({ date: '2026-01-01', milestones: [park('Zion'), park('zion ')] }),
    ]);
    expect(badge(g, 'np1').unlockedAt).toBe('2026-01-01');
    expect(badge(g, 'np2').progress).toBe(1);
  });

  it('awards Grand Slam for all four parks in one year', () => {
    const park = (name: string) => ({ id: name, name, category: 'national_park' as const, timestamp: '' });
    const g = computeGamification([
      trip({ date: '2025-06-01', milestones: [park('Grand Canyon National Park'), park('Yosemite')] }),
      trip({ date: '2026-06-01', milestones: [park('Yellowstone'), park('Glacier')] }),
    ]);
    expect(g.trophies.find(t => t.id === 't4')!.unlockedAt).toBeUndefined();

    const g2 = computeGamification([
      trip({ date: '2026-05-01', milestones: [park('Grand Canyon'), park('Yosemite')] }),
      trip({ date: '2026-07-01', milestones: [park('Yellowstone'), park('Glacier NP')] }),
    ]);
    expect(g2.trophies.find(t => t.id === 't4')!.unlockedAt).toBe('2026-07-01');
  });

  it('tracks monthly streaks and only calls them active if recent', () => {
    const trips = ['2026-08-10', '2026-09-10', '2026-10-10'].map(date => trip({ date }));
    const active = computeGamification(trips, new Date('2026-11-09T12:00:00'));
    const monthly = active.streaks.find(s => s.id === 'st1')!;
    expect(monthly).toMatchObject({ currentCount: 3, bestCount: 3, isActive: true });

    const lapsed = computeGamification(trips, new Date('2027-02-01T12:00:00'));
    expect(lapsed.streaks.find(s => s.id === 'st1')).toMatchObject({ currentCount: 0, bestCount: 3, isActive: false });
  });

  it('matches the server XP formula', () => {
    const g = computeGamification([
      trip({ date: '2026-01-01', distance: 1200, nights: 3, states: ['CA', 'OR'], photos: ['a', 'b'] }),
    ]);
    // 1200 + 100*1 + 50*3 + 250*2 + 10*2
    expect(g.level.xp).toBe(1970);
    expect(g.level.level).toBe(3);
  });
});
