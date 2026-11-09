import { motion } from 'framer-motion';
import { UserPlus, UserMinus, MapPin, Route } from 'lucide-react';
import { SocialUser } from '@/types';
import { useSocial } from '@/context/SocialContext';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface UserCardProps {
  user: SocialUser;
  index?: number;
  showStats?: boolean;
}

export const UserCard = ({ user, index = 0, showStats = true }: UserCardProps) => {
  const { isFollowing, followUser, unfollowUser } = useSocial();
  const following = isFollowing(user.id);
  const { user: me } = useAuth();
  const isCurrentUser = user.id === me?.id;

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (following) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link 
        to={isCurrentUser ? '/profile' : `/user/${user.id}`}
        className="flex items-center gap-3 p-3 bg-card rounded-xl card-elevated hover:bg-muted/50 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{user.name}</h4>
            {following && !isCurrentUser && (
              <span className="px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full">
                Following
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.username}</p>
          
          {showStats && (
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.stats.totalMiles.toLocaleString()} mi
              </span>
              <span className="flex items-center gap-1">
                <Route className="w-3 h-3" />
                {user.stats.totalTrips} trips
              </span>
            </div>
          )}
        </div>

        {!isCurrentUser && (
          <button
            onClick={handleFollowToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              following
                ? 'bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive'
                : 'gradient-sunset text-primary-foreground'
            }`}
          >
            {following ? (
              <UserMinus className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
          </button>
        )}
      </Link>
    </motion.div>
  );
};
