import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Route, Moon, Calendar, UserPlus, UserMinus, Lock, Users, Loader2 } from 'lucide-react';
import { useSocial, SocialUser } from '@/context/SocialContext';
import { useTrip } from '@/context/TripContext';
import { TripCard } from '@/components/TripCard';
import { StatCard } from '@/components/StatCard';
import { useState, useEffect } from 'react';

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUserById, isFollowing, followUser, unfollowUser } = useSocial();
  const { completedTrips } = useTrip();
  const [user, setUser] = useState<SocialUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isUserFollowing = id ? isFollowing(id) : false;

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      setLoading(true);
      const userData = await getUserById(id);
      setUser(userData || null);
      setLoading(false);
    };
    loadUser();
  }, [id, getUserById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 gradient-sunset text-primary-foreground font-medium rounded-xl"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Get user's public trips
  const userTrips = completedTrips.filter(t => 
    t.userId === user.userId && 
    (t.privacy === 'public' || (t.privacy === 'friends' && isUserFollowing))
  );

  const handleFollowToggle = async () => {
    if (!user) return;
    if (isUserFollowing) {
      await unfollowUser(user.userId);
    } else {
      await followUser(user.userId);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-background pt-12 pb-8 px-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 safe-top w-10 h-10 rounded-full bg-background/50 backdrop-blur flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="max-w-lg mx-auto text-center">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 overflow-hidden"
          >
            {user.avatar && user.avatar !== '/placeholder.svg' ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </motion.div>

          <h1 className="font-display text-xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground text-sm">{user.username}</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
            {user.bio}
          </p>

          {/* Follow Stats */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="font-display font-bold">{user.followersCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-display font-bold">{user.followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Follow Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleFollowToggle}
            className={`mt-4 px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all ${
              isUserFollowing
                ? 'bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive'
                : 'gradient-sunset text-primary-foreground'
            }`}
          >
            {isUserFollowing ? (
              <>
                <UserMinus className="w-4 h-4" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Follow
              </>
            )}
          </motion.button>
        </div>
      </div>

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            label="Miles Traveled"
            value={user.stats.totalMiles}
            icon={MapPin}
            variant="primary"
            index={0}
          />
          <StatCard
            label="Total Trips"
            value={user.stats.totalTrips}
            icon={Route}
            index={1}
          />
          <StatCard
            label="States Visited"
            value={user.stats.statesVisited}
            suffix="/ 50"
            icon={Users}
            variant="secondary"
            index={2}
          />
          <StatCard
            label="Nights Camped"
            value={user.stats.nightsCamped}
            icon={Moon}
            index={3}
          />
        </div>

        {/* User's Trips */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Trips</h2>
            <span className="text-sm text-muted-foreground">{userTrips.length} trips</span>
          </div>

          {userTrips.length > 0 ? (
            <div className="space-y-4">
              {userTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center card-elevated">
              <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isUserFollowing 
                  ? "This user hasn't shared any trips yet"
                  : "Follow this user to see their friends-only trips"
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
