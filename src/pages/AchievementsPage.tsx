import { Header } from '@/components/Header';
import { BadgeCard } from '@/components/BadgeCard';
import { TrophyCard } from '@/components/TrophyCard';
import { StreakCard } from '@/components/StreakCard';
import { LevelProgress } from '@/components/LevelProgress';
import { ShareableAchievement } from '@/components/ShareableAchievement';
import { useGamification } from '@/hooks/useTrips';
import { Badge, Trophy } from '@/types';
import { motion } from 'framer-motion';
import { Trophy as TrophyIcon, Flame, Award, Target, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const AchievementsPage = () => {
  const [shareItem, setShareItem] = useState<{ badge?: Badge; trophy?: Trophy } | null>(null);
  
  const {
    achievements,
    trophies,
    streaks,
    level,
    unlockedBadgeCount: unlockedBadges,
    unlockedTrophyCount: unlockedTrophies,
    activeStreakCount: activeStreaks,
    nextMilestone,
  } = useGamification();
  const unlockedTrophyList = trophies.filter((t) => t.unlockedAt);
  const activeStreakList = streaks.filter((s) => s.isActive);

  return (
    <div className="min-h-screen pb-24">
      <Header title="Achievements" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Level Progress */}
        <LevelProgress 
          level={level.level} 
          xp={level.xpIntoLevel} 
          xpToNextLevel={level.xpForLevel}
        />

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          <div className="bg-card rounded-xl p-3 text-center card-elevated">
            <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{unlockedBadges}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center card-elevated">
            <TrophyIcon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{unlockedTrophies}</p>
            <p className="text-[10px] text-muted-foreground">Trophies</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center card-elevated">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{activeStreaks}</p>
            <p className="text-[10px] text-muted-foreground">Streaks</p>
          </div>
        </motion.div>

        {/* Active Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-semibold">Active Streaks</h3>
            </div>
            <span className="text-xs text-muted-foreground">Keep them going!</span>
          </div>
          <div className="space-y-3">
            {activeStreakList.length > 0 ? (
              activeStreakList.slice(0, 2).map((streak, index) => (
                <StreakCard key={streak.id} streak={streak} index={index} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground bg-card rounded-xl p-4 card-elevated">
                Finish a trip this month to start a streak.
              </p>
            )}
          </div>
        </motion.div>

        {/* Next Milestone */}
        {nextMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-4 card-elevated mt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Next Milestone</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center glow-achievement">
                <span className="text-2xl">{nextMilestone.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{nextMilestone.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{nextMilestone.description}</p>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(nextMilestone.progress! / nextMilestone.maxProgress!) * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full gradient-sunset relative rounded-full"
                  >
                    <div className="absolute inset-0 shimmer" />
                  </motion.div>
                </div>
                <p className="text-xs text-primary mt-1.5 font-semibold">
                  {(nextMilestone.maxProgress! - nextMilestone.progress!).toLocaleString()} {nextMilestone.id.startsWith('d') ? 'miles' : 'more'} to go!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Trophy Case Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-yellow-500" />
              <h3 className="font-display font-semibold">Trophy Case</h3>
            </div>
            <Link to="/profile" className="flex items-center gap-1 text-xs text-primary">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {unlockedTrophyList.length === 0 && (
              <p className="text-sm text-muted-foreground bg-card rounded-xl p-4 card-elevated">
                No trophies yet. Your first one is waiting out on the road.
              </p>
            )}
            {unlockedTrophyList.slice(0, 2).map((trophy, index) => (
              <TrophyCard 
                key={trophy.id} 
                trophy={trophy} 
                index={index}
                onShare={(t) => setShareItem({ trophy: t })}
              />
            ))}
          </div>
        </motion.div>

        {/* Badge Categories */}
        {achievements.map((category, catIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + catIndex * 0.1 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">{category.category}</h3>
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                {category.badges.filter((b) => b.unlockedAt).length}/{category.badges.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {category.badges.map((badge, index) => (
                <div 
                  key={badge.id} 
                  onClick={() => badge.unlockedAt && setShareItem({ badge })}
                  className={badge.unlockedAt ? 'cursor-pointer' : ''}
                >
                  <BadgeCard badge={badge} index={index} />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </main>

      {/* Shareable Achievement Modal */}
      <ShareableAchievement
        badge={shareItem?.badge}
        trophy={shareItem?.trophy}
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
      />
    </div>
  );
};

export default AchievementsPage;
