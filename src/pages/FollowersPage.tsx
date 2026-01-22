import { useState } from 'react';
import { Header } from '@/components/Header';
import { UserCard } from '@/components/UserCard';
import { useSocial } from '@/context/SocialContext';
import { motion } from 'framer-motion';
import { Users, UserCheck, Search } from 'lucide-react';

type TabType = 'followers' | 'following' | 'discover';

const FollowersPage = () => {
  const { users, following, followers, isFollowing } = useSocial();
  const [activeTab, setActiveTab] = useState<TabType>('following');
  const [searchQuery, setSearchQuery] = useState('');

  const followingUsers = users.filter(u => following.includes(u.id));
  const followerUsers = users.filter(u => followers.includes(u.id));
  const discoverUsers = users.filter(u => !following.includes(u.id));

  const getFilteredUsers = () => {
    let userList = activeTab === 'following' 
      ? followingUsers 
      : activeTab === 'followers' 
        ? followerUsers 
        : discoverUsers;

    if (searchQuery) {
      userList = userList.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return userList;
  };

  const filteredUsers = getFilteredUsers();

  const tabs: { value: TabType; label: string; count: number; icon: React.ReactNode }[] = [
    { value: 'following', label: 'Following', count: following.length, icon: <UserCheck className="w-4 h-4" /> },
    { value: 'followers', label: 'Followers', count: followers.length, icon: <Users className="w-4 h-4" /> },
    { value: 'discover', label: 'Discover', count: discoverUsers.length, icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pb-24">
      <Header title="Friends" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? 'gradient-sunset text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.value ? 'bg-white/20' : 'bg-background'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RVers..."
            className="w-full py-2.5 pl-10 pr-4 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* User List */}
        <div className="space-y-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <UserCard key={user.id} user={user} index={index} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl p-8 text-center card-elevated"
            >
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'No users found matching your search'
                  : activeTab === 'following'
                    ? "You're not following anyone yet"
                    : activeTab === 'followers'
                      ? "You don't have any followers yet"
                      : "No new RVers to discover"
                }
              </p>
            </motion.div>
          )}
        </div>

        {/* Discover Prompt */}
        {activeTab === 'following' && followingUsers.length < 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl border border-primary/20"
          >
            <h3 className="font-display font-semibold mb-1">Find more RVers!</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Connect with fellow travelers to see their adventures in your feed.
            </p>
            <button
              onClick={() => setActiveTab('discover')}
              className="px-4 py-2 gradient-sunset text-primary-foreground text-sm font-medium rounded-lg"
            >
              Discover RVers
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default FollowersPage;
