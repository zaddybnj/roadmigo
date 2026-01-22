import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, BarChart3, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { PremiumGate } from '@/components/PremiumGate';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { useSubscription } from '@/context/SubscriptionContext';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();

  return (
    <div className="min-h-screen pb-24">
      <Header title="Analytics" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {isPremium ? (
          <AnalyticsDashboard />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Preview of analytics (blurred) */}
            <PremiumGate
              featureId="advanced-analytics"
              featureName="Advanced Analytics"
              variant="blur"
            >
              <AnalyticsDashboard />
            </PremiumGate>

            {/* Upgrade Card */}
            <UpgradePrompt
              title="Unlock Your Travel Insights"
              description="See patterns in your travels, track your efficiency, and discover your favorite regions with Advanced Analytics."
            />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;
