import React, { createContext, useContext, useState, useCallback } from 'react';
import { Subscription, SubscriptionTier, PREMIUM_FEATURES } from '@/types/subscription';

interface SubscriptionContextType {
  subscription: Subscription | null;
  tier: SubscriptionTier;
  isPremium: boolean;
  isFeatureAvailable: (featureId: string) => boolean;
  tripsRemaining: number;
  photosRemaining: number;
  upgradeToPremium: () => void;
  cancelSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Free tier limits
const FREE_TRIP_LIMIT = 10;
const FREE_PHOTO_LIMIT = 5;

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    const saved = localStorage.getItem('subscription');
    return saved ? JSON.parse(saved) : null;
  });

  const tier: SubscriptionTier = subscription?.status === 'active' ? subscription.tier : 'free';
  const isPremium = tier === 'premium';

  const isFeatureAvailable = useCallback((featureId: string) => {
    const feature = PREMIUM_FEATURES.find(f => f.id === featureId);
    if (!feature) return true; // Unknown features are available
    if (feature.tier === 'free') return true;
    return isPremium;
  }, [isPremium]);

  // Mock usage tracking (in real app, this would come from backend)
  const [usedTrips] = useState(3);
  const [usedPhotos] = useState(2);

  const tripsRemaining = isPremium ? Infinity : Math.max(0, FREE_TRIP_LIMIT - usedTrips);
  const photosRemaining = isPremium ? Infinity : Math.max(0, FREE_PHOTO_LIMIT - usedPhotos);

  const upgradeToPremium = useCallback(() => {
    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      userId: '1',
      tier: 'premium',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
    };
    setSubscription(newSubscription);
    localStorage.setItem('subscription', JSON.stringify(newSubscription));
  }, []);

  const cancelSubscription = useCallback(() => {
    if (subscription) {
      const updated = { ...subscription, cancelAtPeriodEnd: true };
      setSubscription(updated);
      localStorage.setItem('subscription', JSON.stringify(updated));
    }
  }, [subscription]);

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      tier,
      isPremium,
      isFeatureAvailable,
      tripsRemaining,
      photosRemaining,
      upgradeToPremium,
      cancelSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
