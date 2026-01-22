import { motion } from 'framer-motion';
import { Users, Globe, Sparkles, TrendingUp } from 'lucide-react';

export type FeedFilter = 'all' | 'following' | 'trending' | 'featured';

interface FeedFiltersProps {
  activeFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
}

const filters: { value: FeedFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Globe className="w-4 h-4" /> },
  { value: 'following', label: 'Following', icon: <Users className="w-4 h-4" /> },
  { value: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'featured', label: 'Featured', icon: <Sparkles className="w-4 h-4" /> },
];

export const FeedFilters = ({ activeFilter, onFilterChange }: FeedFiltersProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeFilter === filter.value
              ? 'text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {activeFilter === filter.value && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 gradient-sunset rounded-full"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {filter.icon}
            {filter.label}
          </span>
        </button>
      ))}
    </div>
  );
};
