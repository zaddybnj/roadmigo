import { Header } from '@/components/Header';
import { USMap } from '@/components/USMap';
import { visitedStates } from '@/data/mockData';
import { motion } from 'framer-motion';
import { MapPin, Flag, Target } from 'lucide-react';

const MapPage = () => {
  const unvisitedCount = 50 - visitedStates.length;

  return (
    <div className="min-h-screen pb-20">
      <Header title="Your Journey Map" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Map Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl overflow-hidden card-elevated mb-6"
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-semibold">States Visited</h2>
            <p className="text-sm text-muted-foreground">
              {visitedStates.length} of 50 states explored
            </p>
          </div>
          <div className="p-2">
            <USMap visitedStates={visitedStates} />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{visitedStates.length}</p>
            <p className="text-xs text-muted-foreground">Visited</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-muted/50 border border-border rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{unvisitedCount}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <Flag className="w-5 h-5 text-primary" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{Math.round((visitedStates.length / 50) * 100)}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </motion.div>
        </div>

        {/* Recent States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-4 card-elevated"
        >
          <h3 className="font-display font-semibold mb-3">Recently Visited</h3>
          <div className="flex flex-wrap gap-2">
            {visitedStates.slice(-10).reverse().map((state) => (
              <span
                key={state}
                className="px-3 py-1.5 bg-secondary/20 text-secondary text-sm font-medium rounded-full"
              >
                {state}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Bucket List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl p-4 card-elevated mt-4"
        >
          <h3 className="font-display font-semibold mb-3">Next on your list?</h3>
          <div className="flex flex-wrap gap-2">
            {['NY', 'PA', 'NJ', 'CT', 'RI', 'NH', 'VT', 'ME'].filter(s => !visitedStates.includes(s)).slice(0, 5).map((state) => (
              <span
                key={state}
                className="px-3 py-1.5 bg-muted text-muted-foreground text-sm font-medium rounded-full border border-dashed border-border"
              >
                {state}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MapPage;
