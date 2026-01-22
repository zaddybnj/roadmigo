import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type DbProfile = Tables<'profiles'>;
type DbComment = Tables<'comments'>;

export interface SocialUser {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  stats: {
    totalMiles: number;
    totalTrips: number;
    statesVisited: number;
    nightsCamped: number;
    photosShared: number;
  };
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export interface Comment {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface SocialContextType {
  following: string[];
  followers: string[];
  users: SocialUser[];
  loading: boolean;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  addComment: (tripId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  likeTrip: (tripId: string) => Promise<void>;
  unlikeTrip: (tripId: string) => Promise<void>;
  isTripLiked: (tripId: string) => boolean;
  getCommentsForTrip: (tripId: string) => Promise<Comment[]>;
  getUserById: (userId: string) => Promise<SocialUser | undefined>;
  getFriends: () => SocialUser[];
  refreshSocialData: () => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

// Convert DB profile to SocialUser
const profileToSocialUser = (
  profile: DbProfile,
  isFollowing: boolean,
  followersCount: number,
  followingCount: number
): SocialUser => ({
  id: profile.id,
  userId: profile.user_id,
  name: profile.display_name,
  username: `@${profile.username}`,
  avatar: profile.avatar_url || '/placeholder.svg',
  bio: profile.bio || '',
  stats: {
    totalMiles: profile.total_miles || 0,
    totalTrips: profile.total_trips || 0,
    statesVisited: (profile.states_visited || []).length,
    nightsCamped: profile.nights_camped || 0,
    photosShared: profile.photos_shared || 0,
  },
  isFollowing,
  followersCount,
  followingCount,
});

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [likedTrips, setLikedTrips] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch social data from database
  const fetchSocialData = useCallback(async () => {
    if (!user) {
      setFollowing([]);
      setFollowers([]);
      setUsers([]);
      setLikedTrips(new Set());
      setLikedComments(new Set());
      setLoading(false);
      return;
    }

    try {
      // Fetch following
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = (followingData || []).map(f => f.following_id);
      setFollowing(followingIds);

      // Fetch followers
      const { data: followersData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      const followerIds = (followersData || []).map(f => f.follower_id);
      setFollowers(followerIds);

      // Fetch liked trips
      const { data: tripLikes } = await supabase
        .from('trip_likes')
        .select('trip_id')
        .eq('user_id', user.id);

      setLikedTrips(new Set((tripLikes || []).map(l => l.trip_id)));

      // Fetch liked comments
      const { data: commentLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id);

      setLikedComments(new Set((commentLikes || []).map(l => l.comment_id)));

      // Fetch all public profiles (for discover/feed)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .limit(50);

      // Get follower/following counts for each profile
      const socialUsers = await Promise.all((profiles || []).map(async (p) => {
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', p.user_id);

        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', p.user_id);

        return profileToSocialUser(
          p,
          followingIds.includes(p.user_id),
          followersCount || 0,
          followingCount || 0
        );
      }));

      setUsers(socialUsers);
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSocialData();
  }, [fetchSocialData]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId,
      });

    if (error) {
      if (error.code !== '23505') { // Ignore duplicate key errors
        toast({
          title: 'Error',
          description: 'Failed to follow user',
          variant: 'destructive',
        });
      }
      return;
    }

    setFollowing(prev => [...prev, targetUserId]);
    setUsers(prev => prev.map(u => 
      u.userId === targetUserId 
        ? { ...u, isFollowing: true, followersCount: u.followersCount + 1 }
        : u
    ));
  }, [user, toast]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to unfollow user',
        variant: 'destructive',
      });
      return;
    }

    setFollowing(prev => prev.filter(id => id !== targetUserId));
    setUsers(prev => prev.map(u => 
      u.userId === targetUserId 
        ? { ...u, isFollowing: false, followersCount: Math.max(0, u.followersCount - 1) }
        : u
    ));
  }, [user, toast]);

  const isFollowingUser = useCallback((userId: string) => {
    return following.includes(userId);
  }, [following]);

  const addComment = useCallback(async (tripId: string, content: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        content,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const likeComment = useCallback(async (commentId: string) => {
    if (!user) return;

    const isLiked = likedComments.has(commentId);

    if (isLiked) {
      await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      setLikedComments(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    } else {
      await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id,
        });

      setLikedComments(prev => new Set([...prev, commentId]));
    }
  }, [user, likedComments]);

  const likeTrip = useCallback(async (tripId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('trip_likes')
      .insert({
        trip_id: tripId,
        user_id: user.id,
      });

    if (error && error.code !== '23505') {
      toast({
        title: 'Error',
        description: 'Failed to like trip',
        variant: 'destructive',
      });
      return;
    }

    setLikedTrips(prev => new Set([...prev, tripId]));
  }, [user, toast]);

  const unlikeTrip = useCallback(async (tripId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('trip_likes')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to unlike trip',
        variant: 'destructive',
      });
      return;
    }

    setLikedTrips(prev => {
      const next = new Set(prev);
      next.delete(tripId);
      return next;
    });
  }, [user, toast]);

  const isTripLiked = useCallback((tripId: string) => {
    return likedTrips.has(tripId);
  }, [likedTrips]);

  const getCommentsForTrip = useCallback(async (tripId: string): Promise<Comment[]> => {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    // Fetch profiles for comment authors
    const userIds = [...new Set((comments || []).map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    return (comments || []).map(c => {
      const profileData = profileMap.get(c.user_id);
      return {
        id: c.id,
        tripId: c.trip_id,
        userId: c.user_id,
        userName: profileData?.display_name || 'Unknown User',
        userAvatar: profileData?.avatar_url || '/placeholder.svg',
        content: c.content,
        createdAt: c.created_at,
        likes: c.likes_count || 0,
        isLiked: likedComments.has(c.id),
      };
    });
  }, [likedComments]);

  const getUserById = useCallback(async (userId: string): Promise<SocialUser | undefined> => {
    // Check if it's the current user
    if (user && userId === user.id && profile) {
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      return profileToSocialUser(profile, false, followersCount || 0, followingCount || 0);
    }

    // Check cached users first
    const cachedUser = users.find(u => u.userId === userId);
    if (cachedUser) return cachedUser;

    // Fetch from database
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profileData) return undefined;

    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    return profileToSocialUser(
      profileData,
      following.includes(userId),
      followersCount || 0,
      followingCount || 0
    );
  }, [user, profile, users, following]);

  const getFriends = useCallback(() => {
    return users.filter(u => following.includes(u.userId));
  }, [users, following]);

  const refreshSocialData = useCallback(async () => {
    await fetchSocialData();
  }, [fetchSocialData]);

  return (
    <SocialContext.Provider value={{
      following,
      followers,
      users,
      loading,
      followUser,
      unfollowUser,
      isFollowing: isFollowingUser,
      addComment,
      deleteComment,
      likeComment,
      likeTrip,
      unlikeTrip,
      isTripLiked,
      getCommentsForTrip,
      getUserById,
      getFriends,
      refreshSocialData,
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
