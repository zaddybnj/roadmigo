import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { TrophyCard } from '@/components/TrophyCard';
import { StreakCard } from '@/components/StreakCard';
import { ShareableAchievement } from '@/components/ShareableAchievement';
import { currentUser, visitedStates, trophies, streaks, gamificationData, achievements } from '@/data/mockData';
import { Trophy } from '@/types';
import { motion } from 'framer-motion';
import { MapPin, Route, Moon, Camera, Calendar, Users, ChevronRight, Lock, Globe, UserCheck, Trophy as TrophyIcon, Award, Flame, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [shareTrophy, setShareTrophy] = useState<Trophy | null>(null);
  
  const unlockedBadges = achievements.reduce(
    (acc, cat) => acc + cat.badges.filter((b) => b.unlockedAt).length,
    0
  );
  const unlockedTrophies = trophies.filter((t) => t.unlockedAt).length;

  const getLevelTitle = (level: number): string => {
    if (level < 5) return 'Newcomer';
    if (level < 10) return 'Explorer';
    if (level < 20) return 'Road Warrior';
    if (level < 30) return 'Nomad';
    if (level < 50) return 'Legend';
    return 'Road Master';
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Profile" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🚐</span>
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full gradient-sunset flex items-center justify-center border-3 border-background glow-primary">
              <span className="text-sm font-bold">{gamificationData.level}</span>
            </div>
          </div>
          <h2 className="font-display text-xl font-bold">{currentUser.name}</h2>
          <p className="text-muted-foreground text-sm">{currentUser.username}</p>
          
          {/* Level Title */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-primary">{getLevelTitle(gamificationData.level)}</span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
            {currentUser.bio}
          </p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            Joined {new Date(currentUser.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Achievement Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <Link to="/achievements" className="bg-card rounded-xl p-3 text-center card-elevated hover:bg-muted/50 transition-colors">
            <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{unlockedBadges}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </Link>
          <Link to="/achievements" className="bg-card rounded-xl p-3 text-center card-elevated hover:bg-muted/50 transition-colors">
            <TrophyIcon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{unlockedTrophies}</p>
            <p className="text-[10px] text-muted-foreground">Trophies</p>
          </Link>
          <Link to="/achievements" className="bg-card rounded-xl p-3 text-center card-elevated hover:bg-muted/50 transition-colors">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="font-display text-xl font-bold">{streaks.filter((s) => s.isActive).length}</p>
            <p className="text-[10px] text-muted-foreground">Streaks</p>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            label="Miles Traveled"
            value={currentUser.stats.totalMiles}
            icon={MapPin}
            variant="primary"
            index={0}
          />
          <StatCard
            label="Total Trips"
            value={currentUser.stats.totalTrips}
            icon={Route}
            index={1}
          />
          <StatCard
            label="States Visited"
            value={visitedStates.length}
            suffix="/ 50"
            icon={Globe}
            variant="secondary"
            index={2}
          />
          <StatCard
            label="Nights Camped"
            value={currentUser.stats.nightsCamped}
            icon={Moon}
            index={3}
          />
        </div>

        {/* Trophy Case */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-yellow-500" />
              <h3 className="font-display font-semibold">Trophy Case</h3>
            </div>
            <Link to="/achievements" className="flex items-center gap-1 text-xs text-primary">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {trophies.filter((t) => t.unlockedAt).slice(0, 3).map((trophy, index) => (
              <TrophyCard 
                key={trophy.id} 
                trophy={trophy} 
                index={index}
                onShare={(t) => setShareTrophy(t)}
              />
            ))}
          </div>
        </motion.div>

        {/* Active Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-semibold">Active Streaks</h3>
            </div>
          </div>
          <div className="space-y-3">
            {streaks.filter((s) => s.isActive).slice(0, 2).map((streak, index) => (
              <StreakCard key={streak.id} streak={streak} index={index} />
            ))}
          </div>
        </motion.div>

        {/* RV Wrapped Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl p-4 border border-primary/20 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">2024 RV Wrapped</h3>
              <p className="text-sm text-muted-foreground">Your year in review is ready!</p>
            </div>
            <button className="px-4 py-2 rounded-lg gradient-sunset text-primary-foreground text-sm font-medium">
              View
            </button>
          </div>
        </motion.div>

        {/* Settings Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl card-elevated overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-display font-semibold">Settings</h3>
          </div>
          
          {[
            { icon: Users, label: 'Friends', value: '156' },
            { icon: Lock, label: 'Privacy', value: 'Friends Only' },
            { icon: Camera, label: 'Photos', value: currentUser.stats.photosShared.toString() },
            { icon: UserCheck, label: 'Following', value: '89' },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{item.label}</p>
              </div>
              <span className="text-sm text-muted-foreground">{item.value}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full mt-4 py-3 text-center text-destructive text-sm font-medium"
        >
          Sign Out
        </motion.button>
      </main>

      {/* Shareable Trophy Modal */}
      <ShareableAchievement
        trophy={shareTrophy || undefined}
        isOpen={!!shareTrophy}
        onClose={() => setShareTrophy(null)}
      />
    </div>
  );
};

export default ProfilePage;
