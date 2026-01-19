import { Header } from '@/components/Header';
import { BadgeCard } from '@/components/BadgeCard';
import { achievements } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

const AchievementsPage = () => {
  const totalBadges = achievements.reduce((acc, cat) => acc + cat.badges.length, 0);
  const unlockedBadges = achievements.reduce(
    (acc, cat) => acc + cat.badges.filter((b) => b.unlockedAt).length,
    0
  );

  return (
    <div className="min-h-screen pb-20">
      <Header title="Achievements" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Achievement Summary */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-500/30 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-achievement flex items-center justify-center glow-achievement">
              <Trophy className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="font-display text-3xl font-bold">
                <span className="text-gradient-sunset">{unlockedBadges}</span>
                <span className="text-muted-foreground text-lg font-normal"> / {totalBadges}</span>
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-muted-foreground">Road Warrior Level</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Badge Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 card-elevated mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Next Milestone</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Explorer Elite</p>
              <p className="text-xs text-muted-foreground mb-2">Travel 25,000 miles</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '98%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full gradient-sunset rounded-full"
                />
              </div>
              <p className="text-xs text-primary mt-1 font-medium">433 miles to go!</p>
            </div>
          </div>
        </motion.div>

        {/* Achievement Categories */}
        {achievements.map((category, catIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + catIndex * 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">{category.category}</h3>
              <span className="text-xs text-muted-foreground">
                {category.badges.filter((b) => b.unlockedAt).length}/{category.badges.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {category.badges.map((badge, index) => (
                <BadgeCard key={badge.id} badge={badge} index={index} />
              ))}
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
};

export default AchievementsPage;
