import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Check, Sparkles, Route, Camera, Award, Users, 
  History, Map, BarChart3, Images, Infinity as InfinityIcon, MapPinned, 
  WifiOff, Palette, Headphones, ChevronLeft, Star, Loader2, Settings
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSubscription, STRIPE_CONFIG } from '@/context/SubscriptionContext';
import { PRICING_PLANS, PREMIUM_FEATURES } from '@/types/subscription';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const iconMap: Record<string, React.ReactNode> = {
  Route: <Route size={18} />,
  Camera: <Camera size={18} />,
  Award: <Award size={18} />,
  Users: <Users size={18} />,
  History: <History size={18} />,
  Map: <Map size={18} />,
  BarChart3: <BarChart3 size={18} />,
  Images: <Images size={18} />,
  Infinity: <InfinityIcon size={18} />,
  Crown: <Crown size={18} />,
  MapPinned: <MapPinned size={18} />,
  WifiOff: <WifiOff size={18} />,
  Palette: <Palette size={18} />,
  Headphones: <Headphones size={18} />,
};

const PricingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isPremium, tier, isLoading, createCheckout, openCustomerPortal, checkSubscription, subscriptionEnd, cancelAtPeriodEnd } = useSubscription();
  const [isYearly, setIsYearly] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Handle success/cancel from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Welcome to Nomad Pro! Your subscription is now active.');
      checkSubscription();
      // Clear the query params
      navigate('/pricing', { replace: true });
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout was canceled.');
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, checkSubscription, navigate]);

  const freePlan = PRICING_PLANS.find(p => p.tier === 'free')!;
  const premiumPlan = PRICING_PLANS.find(p => p.tier === 'premium' && p.interval === (isYearly ? 'year' : 'month'))!;

  const monthlyPrice = PRICING_PLANS.find(p => p.interval === 'month' && p.tier === 'premium')!.price;
  const yearlyMonthlyPrice = (premiumPlan.price / 12).toFixed(2);
  const savings = Math.round((1 - (premiumPlan.price / 12) / monthlyPrice) * 100);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const url = await createCheckout(isYearly);
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const url = await openCustomerPortal();
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Failed to open subscription management');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setPortalLoading(false);
    }
  };

  const freeFeatures = PREMIUM_FEATURES.filter(f => f.tier === 'free');
  const premiumFeatures = PREMIUM_FEATURES.filter(f => f.tier === 'premium');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center gap-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-display text-xl font-bold">Choose Your Plan</h1>
        </div>
      </div>

      <div className="container py-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(265_85%_60%)]/20 to-[hsl(280_80%_55%)]/20 border border-[hsl(265_85%_60%)]/30 mb-4">
            <Sparkles size={16} className="text-[hsl(265_85%_60%)]" />
            <span className="text-sm font-medium">Unlock Your Full Adventure</span>
          </div>
          <h2 className="font-display text-3xl font-bold mb-3">
            Level Up Your Journey
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Track every mile, celebrate every achievement, and share your story with the RV community.
          </p>
        </motion.div>

        {/* Billing Toggle - only show if not premium */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className={cn("text-sm", !isYearly && "text-foreground font-medium", isYearly && "text-muted-foreground")}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={cn("text-sm", isYearly && "text-foreground font-medium", !isYearly && "text-muted-foreground")}>
              Yearly
            </span>
            {isYearly && (
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-success/20 text-success">
                Save {savings}%
              </span>
            )}
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "rounded-2xl p-6 border-2",
              tier === 'free' ? "border-primary bg-card" : "border-border bg-card/50"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl font-bold">{freePlan.name}</h3>
                <p className="text-muted-foreground text-sm">For casual travelers</p>
              </div>
              {tier === 'free' && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                  Current Plan
                </span>
              )}
            </div>

            <div className="mb-6">
              <span className="font-display text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3 mb-6">
              {freePlan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={18} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" className="w-full" disabled>
              {tier === 'free' ? 'Current Plan' : 'Free Tier'}
            </Button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "relative rounded-2xl p-6 border-2 overflow-hidden",
              isPremium 
                ? "border-[hsl(265_85%_60%)] bg-gradient-to-br from-card to-[hsl(265_85%_60%)]/10" 
                : "border-[hsl(265_85%_60%)] bg-gradient-to-br from-card to-[hsl(265_85%_60%)]/5"
            )}
          >
            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] text-white">
                <Star size={12} fill="currentColor" />
                {isPremium ? 'Your Plan' : 'Most Popular'}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">{premiumPlan.name}</h3>
                <p className="text-muted-foreground text-sm">For serious nomads</p>
              </div>
            </div>

            <div className="mb-6">
              {isPremium ? (
                <>
                  <span className="font-display text-4xl font-bold text-[hsl(265_85%_60%)]">Active</span>
                  {subscriptionEnd && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {cancelAtPeriodEnd ? 'Cancels' : 'Renews'} {formatDate(subscriptionEnd)}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <span className="font-display text-4xl font-bold">
                    ${isYearly ? yearlyMonthlyPrice : premiumPlan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Billed ${premiumPlan.price}/year
                    </p>
                  )}
                </>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {premiumPlan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={18} className="text-[hsl(265_85%_60%)] mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <Button 
                onClick={handleManageSubscription}
                disabled={portalLoading || isLoading}
                variant="outline"
                className="w-full gap-2 border-[hsl(265_85%_60%)] text-[hsl(265_85%_60%)] hover:bg-[hsl(265_85%_60%)]/10"
              >
                {portalLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Settings size={16} />
                )}
                Manage Subscription
              </Button>
            ) : (
              <Button 
                onClick={handleUpgrade}
                disabled={checkoutLoading || isLoading}
                className="w-full gap-2 bg-gradient-to-r from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] hover:opacity-90"
              >
                {checkoutLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                Upgrade to Pro
              </Button>
            )}
          </motion.div>
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-display text-xl font-bold mb-6 text-center">
            All Features
          </h3>

          <div className="space-y-6">
            {/* Free Features */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Included in Free
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {freeFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-primary">{iconMap[feature.icon]}</div>
                    <div>
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Features */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Crown size={14} className="text-[hsl(265_85%_60%)]" />
                Pro Features
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {premiumFeatures.map((feature) => (
                  <div 
                    key={feature.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[hsl(265_85%_60%)]/10 to-transparent border border-[hsl(265_85%_60%)]/20"
                  >
                    <div className="text-[hsl(265_85%_60%)]">{iconMap[feature.icon]}</div>
                    <div>
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ / Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p className="mb-2">Cancel anytime. No questions asked.</p>
          <p>Secure payment powered by Stripe.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
