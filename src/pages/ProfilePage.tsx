import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { currentUser, visitedStates } from '@/data/mockData';
import { motion } from 'framer-motion';
import { MapPin, Route, Moon, Camera, Calendar, Users, ChevronRight, Lock, Globe, UserCheck } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="min-h-screen pb-20">
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
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-achievement flex items-center justify-center border-2 border-background">
              <span className="text-sm">32</span>
            </div>
          </div>
          <h2 className="font-display text-xl font-bold">{currentUser.name}</h2>
          <p className="text-muted-foreground text-sm">{currentUser.username}</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
            {currentUser.bio}
          </p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            Joined {new Date(currentUser.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
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

        {/* RV Wrapped Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          transition={{ delay: 0.5 }}
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
          ].map((item, index) => (
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
          transition={{ delay: 0.6 }}
          className="w-full mt-4 py-3 text-center text-destructive text-sm font-medium"
        >
          Sign Out
        </motion.button>
      </main>
    </div>
  );
};

export default ProfilePage;
