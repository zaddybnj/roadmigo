import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Comment, SocialUser } from '@/types';
import { currentUser } from '@/data/mockData';

interface SocialContextType {
  following: string[];
  followers: string[];
  users: SocialUser[];
  comments: Comment[];
  likedTrips: string[];
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  addComment: (tripId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  likeComment: (commentId: string) => void;
  likeTrip: (tripId: string) => void;
  unlikeTrip: (tripId: string) => void;
  isTripLiked: (tripId: string) => boolean;
  getCommentsForTrip: (tripId: string) => Comment[];
  getUserById: (userId: string) => SocialUser | undefined;
  getFriends: () => SocialUser[];
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

// Mock users for the social layer
const mockUsers: SocialUser[] = [
  {
    id: '2',
    name: 'Sarah Mitchell',
    username: '@sarahrv',
    avatar: '/placeholder.svg',
    bio: 'Weekend warrior exploring the Southwest 🌵',
    stats: { totalMiles: 15234, totalTrips: 32, statesVisited: 18, nightsCamped: 156, photosShared: 89 },
    isFollowing: true,
    followersCount: 245,
    followingCount: 112,
  },
  {
    id: '3',
    name: 'Mike Chen',
    username: '@mikeontheroad',
    avatar: '/placeholder.svg',
    bio: 'Retired and loving every mile of it! 🚐✨',
    stats: { totalMiles: 45678, totalTrips: 89, statesVisited: 42, nightsCamped: 567, photosShared: 234 },
    isFollowing: true,
    followersCount: 892,
    followingCount: 156,
  },
  {
    id: '4',
    name: 'Emily Parker',
    username: '@emilyexplores',
    avatar: '/placeholder.svg',
    bio: 'National Park enthusiast. 23/63 parks visited!',
    stats: { totalMiles: 28456, totalTrips: 45, statesVisited: 28, nightsCamped: 234, photosShared: 178 },
    isFollowing: false,
    followersCount: 567,
    followingCount: 234,
  },
  {
    id: '5',
    name: 'David Thompson',
    username: '@davidtrails',
    avatar: '/placeholder.svg',
    bio: 'Chasing mountain views and campfire nights 🏔️🔥',
    stats: { totalMiles: 19876, totalTrips: 38, statesVisited: 22, nightsCamped: 189, photosShared: 145 },
    isFollowing: false,
    followersCount: 334,
    followingCount: 189,
  },
  {
    id: '6',
    name: 'Lisa Rodriguez',
    username: '@lisarvlife',
    avatar: '/placeholder.svg',
    bio: 'Full-time RVer with two dogs and zero regrets 🐕🐕',
    stats: { totalMiles: 56789, totalTrips: 112, statesVisited: 48, nightsCamped: 890, photosShared: 456 },
    isFollowing: true,
    followersCount: 1234,
    followingCount: 345,
  },
];

const mockComments: Comment[] = [
  {
    id: 'c1',
    tripId: '1',
    userId: '2',
    userName: 'Sarah Mitchell',
    userAvatar: '/placeholder.svg',
    content: 'This looks absolutely stunning! PCH is on my bucket list 😍',
    createdAt: '2024-09-15T10:30:00Z',
    likes: 12,
    isLiked: false,
  },
  {
    id: 'c2',
    tripId: '1',
    userId: '3',
    userName: 'Mike Chen',
    userAvatar: '/placeholder.svg',
    content: 'Where did you camp along the way? Looking for recommendations!',
    createdAt: '2024-09-15T14:45:00Z',
    likes: 8,
    isLiked: true,
  },
  {
    id: 'c3',
    tripId: '2',
    userId: '1',
    userName: 'Alex Rivera',
    userAvatar: '/placeholder.svg',
    content: 'Monument Valley sunsets are unreal. Great shots!',
    createdAt: '2024-10-13T09:20:00Z',
    likes: 15,
    isLiked: false,
  },
  {
    id: 'c4',
    tripId: '3',
    userId: '6',
    userName: 'Lisa Rodriguez',
    userAvatar: '/placeholder.svg',
    content: 'New England fall is magical! We were there last year 🍂',
    createdAt: '2024-10-21T16:00:00Z',
    likes: 22,
    isLiked: true,
  },
];

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [following, setFollowing] = useState<string[]>(() => {
    const saved = localStorage.getItem('following');
    return saved ? JSON.parse(saved) : ['2', '3', '6'];
  });

  const [followers, setFollowers] = useState<string[]>(() => {
    const saved = localStorage.getItem('followers');
    return saved ? JSON.parse(saved) : ['2', '3', '4', '6'];
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('comments');
    return saved ? JSON.parse(saved) : mockComments;
  });

  const [likedTrips, setLikedTrips] = useState<string[]>(() => {
    const saved = localStorage.getItem('likedTrips');
    return saved ? JSON.parse(saved) : ['2'];
  });

  const [users] = useState<SocialUser[]>(mockUsers);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('following', JSON.stringify(following));
  }, [following]);

  useEffect(() => {
    localStorage.setItem('followers', JSON.stringify(followers));
  }, [followers]);

  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('likedTrips', JSON.stringify(likedTrips));
  }, [likedTrips]);

  const followUser = useCallback((userId: string) => {
    setFollowing(prev => prev.includes(userId) ? prev : [...prev, userId]);
  }, []);

  const unfollowUser = useCallback((userId: string) => {
    setFollowing(prev => prev.filter(id => id !== userId));
  }, []);

  const isFollowing = useCallback((userId: string) => {
    return following.includes(userId);
  }, [following]);

  const addComment = useCallback((tripId: string, content: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      tripId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };
    setComments(prev => [...prev, newComment]);
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  const likeComment = useCallback((commentId: string) => {
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  }, []);

  const likeTrip = useCallback((tripId: string) => {
    setLikedTrips(prev => prev.includes(tripId) ? prev : [...prev, tripId]);
  }, []);

  const unlikeTrip = useCallback((tripId: string) => {
    setLikedTrips(prev => prev.filter(id => id !== tripId));
  }, []);

  const isTripLiked = useCallback((tripId: string) => {
    return likedTrips.includes(tripId);
  }, [likedTrips]);

  const getCommentsForTrip = useCallback((tripId: string) => {
    return comments.filter(c => c.tripId === tripId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments]);

  const getUserById = useCallback((userId: string) => {
    if (userId === currentUser.id) {
      return {
        ...currentUser,
        isFollowing: false,
        followersCount: followers.length,
        followingCount: following.length,
      };
    }
    return users.find(u => u.id === userId);
  }, [users, followers.length, following.length]);

  const getFriends = useCallback(() => {
    return users.filter(u => following.includes(u.id));
  }, [users, following]);

  return (
    <SocialContext.Provider value={{
      following,
      followers,
      users,
      comments,
      likedTrips,
      followUser,
      unfollowUser,
      isFollowing,
      addComment,
      deleteComment,
      likeComment,
      likeTrip,
      unlikeTrip,
      isTripLiked,
      getCommentsForTrip,
      getUserById,
      getFriends,
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
