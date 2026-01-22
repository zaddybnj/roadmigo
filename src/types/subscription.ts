export type SubscriptionTier = 'free' | 'premium';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'free' | 'premium';
  category: 'analytics' | 'trips' | 'social' | 'planning' | 'maps';
}

export interface PricingPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  highlighted?: boolean;
}

// Feature definitions
export const PREMIUM_FEATURES: PremiumFeature[] = [
  // Free features
  { id: 'basic-tracking', name: 'Basic Trip Tracking', description: 'Track your trips with essential stats', icon: 'Route', tier: 'free', category: 'trips' },
  { id: 'photos-5', name: 'Up to 5 Photos per Trip', description: 'Upload photos to document your journey', icon: 'Camera', tier: 'free', category: 'trips' },
  { id: 'basic-badges', name: 'Core Achievement Badges', description: 'Earn badges for your travels', icon: 'Award', tier: 'free', category: 'social' },
  { id: 'social-feed', name: 'Social Feed', description: 'Follow friends and see their trips', icon: 'Users', tier: 'free', category: 'social' },
  { id: 'trip-history-10', name: 'Last 10 Trips', description: 'Access your recent trip history', icon: 'History', tier: 'free', category: 'trips' },
  { id: 'basic-map', name: 'States Visited Map', description: 'See which states you\'ve explored', icon: 'Map', tier: 'free', category: 'maps' },
  
  // Premium features
  { id: 'advanced-analytics', name: 'Advanced Analytics', description: 'Deep insights into your travel patterns', icon: 'BarChart3', tier: 'premium', category: 'analytics' },
  { id: 'unlimited-photos', name: 'Unlimited Photos', description: 'No limits on trip documentation', icon: 'Images', tier: 'premium', category: 'trips' },
  { id: 'unlimited-history', name: 'Unlimited Trip History', description: 'Access all your trips forever', icon: 'Infinity', tier: 'premium', category: 'trips' },
  { id: 'exclusive-badges', name: 'Exclusive Badges', description: 'Rare and legendary achievements', icon: 'Crown', tier: 'premium', category: 'social' },
  { id: 'trip-planning', name: 'Trip Planning Tools', description: 'Plan routes, stops, and campgrounds', icon: 'MapPinned', tier: 'premium', category: 'planning' },
  { id: 'offline-maps', name: 'Offline Maps', description: 'Download maps for offline use', icon: 'WifiOff', tier: 'premium', category: 'maps' },
  { id: 'custom-exports', name: 'Custom Export Cards', description: 'Create branded shareable cards', icon: 'Palette', tier: 'premium', category: 'social' },
  { id: 'priority-support', name: 'Priority Support', description: '24/7 priority customer support', icon: 'Headphones', tier: 'premium', category: 'social' },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Explorer',
    tier: 'free',
    price: 0,
    interval: 'month',
    features: [
      'Basic trip tracking',
      'Up to 5 photos per trip',
      'Last 10 trips history',
      'Core achievement badges',
      'Social feed & following',
      'States visited map',
    ],
  },
  {
    id: 'premium-monthly',
    name: 'Nomad Pro',
    tier: 'premium',
    price: 9.99,
    interval: 'month',
    highlighted: true,
    features: [
      'Everything in Explorer, plus:',
      'Advanced analytics dashboard',
      'Unlimited photos per trip',
      'Unlimited trip history',
      'Exclusive & legendary badges',
      'Trip planning tools',
      'Offline maps',
      'Custom export cards',
      'Priority support',
    ],
  },
  {
    id: 'premium-yearly',
    name: 'Nomad Pro',
    tier: 'premium',
    price: 79.99,
    interval: 'year',
    features: [
      'Everything in Explorer, plus:',
      'Advanced analytics dashboard',
      'Unlimited photos per trip',
      'Unlimited trip history',
      'Exclusive & legendary badges',
      'Trip planning tools',
      'Offline maps',
      'Custom export cards',
      'Priority support',
      '2 months free!',
    ],
  },
];
