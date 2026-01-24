import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { TrophyCard } from '@/components/TrophyCard';
import { StreakCard } from '@/components/StreakCard';
import { ShareableAchievement } from '@/components/ShareableAchievement';
import { PremiumBadge } from '@/components/PremiumBadge';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { currentUser, visitedStates, trophies, streaks, gamificationData, achievements } from '@/data/mockData';
import { useSocial } from '@/context/SocialContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { Trophy } from '@/types';
import { motion } from 'framer-motion';
import { MapPin, Route, Moon, Camera, Calendar, Users, ChevronRight, Lock, Globe, Trophy as TrophyIcon, Award, Flame, Star, Settings, Crown, LogOut, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
const ProfilePage = () => {
  const { following, followers } = useSocial();
  const { isPremium } = useSubscription();
  const { profile, signOut, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [shareTrophy, setShareTrophy] = useState<Trophy | null>(null);
  const [privacySetting, setPrivacySetting] = useState<'public' | 'friends' | 'private'>('friends');
  const [signingOut, setSigningOut] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(profile?.bio || '');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const unlockedBadges = achievements.reduce(
    (acc, cat) => acc + cat.badges.filter((b) => b.unlockedAt).length,
    0
  );
  const unlockedTrophies = trophies.filter((t) => t.unlockedAt).length;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/auth');
  };

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    const { error } = await updateProfile({ bio: editedBio });
    setIsSavingBio(false);
    if (error) {
      toast.error('Failed to update bio');
    } else {
      toast.success('Bio updated!');
      setIsEditingBio(false);
    }
  };

  const handleCancelEditBio = () => {
    setEditedBio(profile?.bio || '');
    setIsEditingBio(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: publicUrl });
      if (updateError) throw updateError;

      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  // Use profile data if available, otherwise fall back to mock data
  const displayName = profile?.display_name || currentUser.name;
  const username = profile?.username ? `@${profile.username}` : currentUser.username;
  const bio = profile?.bio || currentUser.bio;
  const level = profile?.level || gamificationData.level;
  const totalMiles = profile?.total_miles || currentUser.stats.totalMiles;
  const totalTrips = profile?.total_trips || currentUser.stats.totalTrips;
  const nightsCamped = profile?.nights_camped || currentUser.stats.nightsCamped;
  const photosShared = profile?.photos_shared || currentUser.stats.photosShared;
  const statesCount = profile?.states_visited?.length || visitedStates.length;
  const joinedDate = user?.created_at || currentUser.joinedDate;

  const getLevelTitle = (level: number): string => {
    if (level < 5) return 'Newcomer';
    if (level < 10) return 'Explorer';
    if (level < 20) return 'Road Warrior';
    if (level < 30) return 'Nomad';
    if (level < 50) return 'Legend';
    return 'Road Master';
  };

  const getPrivacyIcon = (setting: string) => {
    switch (setting) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'friends': return <Users className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
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
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 group overflow-hidden"
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🚐</span>
              )}
              {/* Edit overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </button>
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full gradient-sunset flex items-center justify-center border-3 border-background glow-primary">
              <span className="text-sm font-bold">{gamificationData.level}</span>
            </div>
            {/* Premium Crown */}
            {isPremium && (
              <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full gradient-premium flex items-center justify-center border-2 border-background glow-premium">
                <Crown className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="font-display text-xl font-bold">{displayName}</h2>
            {isPremium && <PremiumBadge size="sm" />}
          </div>
          <p className="text-muted-foreground text-sm">{username}</p>
          
          {/* Level Title */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-primary">{getLevelTitle(level)}</span>
          </div>

          {/* Follow Stats */}
          <div className="flex items-center justify-center gap-6 mt-3">
            <Link to="/friends" className="text-center hover:opacity-80 transition-opacity">
              <p className="font-display font-bold">{followers.length}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </Link>
            <Link to="/friends" className="text-center hover:opacity-80 transition-opacity">
              <p className="font-display font-bold">{following.length}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </Link>
          </div>
          
          {isEditingBio ? (
            <div className="mt-3 max-w-[280px] mx-auto">
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Tell us about your RV adventures..."
                className="text-sm min-h-[80px] resize-none"
                maxLength={200}
              />
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={handleCancelEditBio}
                  disabled={isSavingBio}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveBio}
                  disabled={isSavingBio}
                  className="p-2 rounded-lg gradient-sunset text-primary-foreground transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{editedBio.length}/200</p>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditedBio(profile?.bio || '');
                setIsEditingBio(true);
              }}
              className="group text-sm text-muted-foreground mt-3 max-w-[280px] mx-auto flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <span>{bio || 'Add a bio...'}</span>
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            Joined {new Date(joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
            value={totalMiles}
            icon={MapPin}
            variant="primary"
            index={0}
          />
          <StatCard
            label="Total Trips"
            value={totalTrips}
            icon={Route}
            index={1}
          />
          <StatCard
            label="States Visited"
            value={statesCount}
            suffix="/ 50"
            icon={Globe}
            variant="secondary"
            index={2}
          />
          <StatCard
            label="Nights Camped"
            value={nightsCamped}
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
            <Link 
              to="/wrapped"
              className="px-4 py-2 rounded-lg gradient-sunset text-primary-foreground text-sm font-medium"
            >
              View
            </Link>
          </div>
        </motion.div>

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-6"
        >
          {isPremium ? (
            <div className="bg-gradient-to-br from-[hsl(265_85%_60%)]/20 to-[hsl(280_80%_55%)]/10 rounded-xl p-4 border border-[hsl(265_85%_60%)]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-premium flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">Nomad Pro</p>
                    <p className="text-xs text-muted-foreground">Active subscription</p>
                  </div>
                </div>
                <Link 
                  to="/pricing"
                  className="text-sm text-[hsl(265_85%_60%)] font-medium"
                >
                  Manage
                </Link>
              </div>
            </div>
          ) : (
            <UpgradePrompt 
              variant="banner" 
              title="Go Pro"
              description="Unlock analytics, unlimited trips & more"
            />
          )}
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

          {/* Subscription Link */}
          <Link
            to="/pricing"
            className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPremium ? 'gradient-premium' : 'bg-muted'}`}>
              <Crown className={`w-5 h-5 ${isPremium ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">Subscription</p>
              <p className="text-xs text-muted-foreground">{isPremium ? 'Nomad Pro' : 'Free Plan'}</p>
            </div>
            {!isPremium && (
              <span className="px-2 py-1 text-xs font-medium rounded-full gradient-premium text-white">
                Upgrade
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          
          <Link
            to="/friends"
            className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">Friends</p>
            </div>
            <span className="text-sm text-muted-foreground">{following.length + followers.length}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          {/* Privacy Setting */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Default Trip Privacy</p>
                <p className="text-xs text-muted-foreground">Who can see your new trips</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['public', 'friends', 'private'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setPrivacySetting(option)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    privacySetting === option
                      ? 'gradient-sunset text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {getPrivacyIcon(option)}
                  <span className="capitalize">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Camera className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">Photos</p>
            </div>
            <span className="text-sm text-muted-foreground">{photosShared}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">App Settings</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-destructive text-sm font-medium hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {signingOut ? 'Signing out...' : 'Sign Out'}
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
