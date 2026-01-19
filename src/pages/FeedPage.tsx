import { Header } from '@/components/Header';
import { TripCard } from '@/components/TripCard';
import { trips } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const FeedPage = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header showLogo />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Quick Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-4 mb-6 border border-primary/20"
        >
          <p className="text-sm text-muted-foreground mb-1">Your journey so far</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-gradient-sunset">24,567</span>
            <span className="text-muted-foreground">miles traveled</span>
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            <span><span className="font-semibold text-foreground">32</span> states</span>
            <span><span className="font-semibold text-foreground">47</span> trips</span>
            <span><span className="font-semibold text-foreground">312</span> nights</span>
          </div>
        </motion.div>

        {/* Feed Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Recent Adventures</h2>
          <button className="text-sm text-primary font-medium">Filter</button>
        </div>

        {/* Trip Cards */}
        <div className="space-y-4">
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <TripCard trip={trip} />
            </motion.div>
          ))}
        </div>
      </main>

      {/* FAB - Add Trip */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full gradient-sunset flex items-center justify-center glow-primary shadow-lg"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>
    </div>
  );
};

export default FeedPage;
