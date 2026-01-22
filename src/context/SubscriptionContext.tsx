import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { PREMIUM_FEATURES } from '@/types/subscription';

export type SubscriptionTier = 'free' | 'premium';

// Stripe product/price IDs
export const STRIPE_CONFIG = {
  monthly: {
    priceId: 'price_1SsVR6BkAgGQMRImSPzaceSg',
    productId: 'prod_TqBo48mQA0WZPL',
  },
  yearly: {
    priceId: 'price_1SsVSfBkAgGQMRImNfFwM01n',
    productId: 'prod_TqBq9XxJZDGa8T',
  },
} as const;

interface SubscriptionData {
  subscribed: boolean;
  product_id: string | null;
  price_id: string | null;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
}

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPremium: boolean;
  isLoading: boolean;
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isFeatureAvailable: (featureId: string) => boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (isYearly: boolean) => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    product_id: null,
    price_id: null,
    subscription_end: null,
    cancel_at_period_end: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setSubscriptionData({
        subscribed: false,
        product_id: null,
        price_id: null,
        subscription_end: null,
        cancel_at_period_end: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setSubscriptionData(data);
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  // Check subscription on mount and when session changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh subscription status periodically (every minute)
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  const createCheckout = useCallback(async (isYearly: boolean): Promise<string | null> => {
    if (!session?.access_token) {
      console.error('No session for checkout');
      return null;
    }

    try {
      const priceId = isYearly ? STRIPE_CONFIG.yearly.priceId : STRIPE_CONFIG.monthly.priceId;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        return null;
      }

      return data.url;
    } catch (err) {
      console.error('Error creating checkout:', err);
      return null;
    }
  }, [session?.access_token]);

  const openCustomerPortal = useCallback(async (): Promise<string | null> => {
    if (!session?.access_token) {
      console.error('No session for portal');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening portal:', error);
        return null;
      }

      return data.url;
    } catch (err) {
      console.error('Error opening portal:', err);
      return null;
    }
  }, [session?.access_token]);

  const tier: SubscriptionTier = subscriptionData.subscribed ? 'premium' : 'free';
  const isPremium = tier === 'premium';

  const isFeatureAvailable = useCallback((featureId: string) => {
    const feature = PREMIUM_FEATURES.find(f => f.id === featureId);
    if (!feature) return true; // Unknown features are available
    if (feature.tier === 'free') return true;
    return isPremium;
  }, [isPremium]);

  return (
    <SubscriptionContext.Provider value={{
      tier,
      isPremium,
      isLoading,
      subscriptionEnd: subscriptionData.subscription_end,
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
      isFeatureAvailable,
      checkSubscription,
      createCheckout,
      openCustomerPortal,
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
