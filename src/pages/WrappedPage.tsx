import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { currentUser, visitedStates, trips, trophies, achievements } from '@/data/mockData';
import { ShareMenu } from '@/components/ShareMenu';
import { ChevronLeft, ChevronRight, X, Share2, Sparkles, MapPin, Moon, Route, Trophy, Star, Flame, Mountain, Compass } from 'lucide-react';

// Fun titles based on travel patterns
const getTravelTitle = (miles: number, states: number, nights: number): { title: string; subtitle: string; icon: string } => {
  if (miles > 20000 && states > 25) {
    return { title: "Road Legend", subtitle: "You've conquered the highways", icon: "🏆" };
  }
  if (nights > 200) {
    return { title: "Nomad Supreme", subtitle: "Home is wherever you park it", icon: "🏕️" };
  }
  if (states > 30) {
    return { title: "State Collector", subtitle: "Building your map one state at a time", icon: "🗺️" };
  }
  if (miles > 15000) {
    return { title: "Highway Hero", subtitle: "The open road is your calling", icon: "🛣️" };
  }
  if (miles > 10000) {
    return { title: "Road Warrior", subtitle: "Chasing horizons across America", icon: "⚔️" };
  }
  if (states > 15) {
    return { title: "Desert Drifter", subtitle: "Dancing with the tumbleweeds", icon: "🌵" };
  }
  if (nights > 100) {
    return { title: "Mountain Nomad", subtitle: "Peak experiences await", icon: "🏔️" };
  }
  return { title: "Adventure Seeker", subtitle: "Every mile tells a story", icon: "🚐" };
};

// Get top achievement
const getTopAchievement = () => {
  const allBadges = achievements.flatMap(cat => cat.badges);
  const unlocked = allBadges.filter(b => b.unlockedAt);
  // Prioritize by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sorted = unlocked.sort((a, b) => 
    (rarityOrder[a.rarity] || 3) - (rarityOrder[b.rarity] || 3)
  );
  return sorted[0];
};

// Get favorite destination based on trips
const getFavoriteDestination = () => {
  const stateCounts: Record<string, number> = {};
  trips.forEach(trip => {
    trip.states.forEach(state => {
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    });
  });
  
  const stateNames: Record<string, string> = {
    CA: 'California', OR: 'Oregon', WA: 'Washington', AZ: 'Arizona',
    UT: 'Utah', CO: 'Colorado', NV: 'Nevada', TX: 'Texas',
    MT: 'Montana', WY: 'Wyoming', ID: 'Idaho', NM: 'New Mexico',
    VT: 'Vermont', NH: 'New Hampshire', ME: 'Maine', MA: 'Massachusetts',
    FL: 'Florida', NY: 'New York', NC: 'North Carolina', TN: 'Tennessee'
  };
  
  const topState = Object.entries(stateCounts).sort(([,a], [,b]) => b - a)[0];
  return topState ? { state: topState[0], name: stateNames[topState[0]] || topState[0], count: topState[1] } : null;
};

const WrappedPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [shareSlide, setShareSlide] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const stats = currentUser.stats;
  const travelTitle = getTravelTitle(stats.totalMiles, visitedStates.length, stats.nightsCamped);
  const topAchievement = getTopAchievement();
  const favoriteDestination = getFavoriteDestination();
  const unlockedTrophies = trophies.filter(t => t.unlockedAt).length;

  const slides = [
    { id: 'intro', type: 'intro' },
    { id: 'miles', type: 'miles' },
    { id: 'states', type: 'states' },
    { id: 'nights', type: 'nights' },
    { id: 'destination', type: 'destination' },
    { id: 'achievement', type: 'achievement' },
    { id: 'title', type: 'title' },
    { id: 'summary', type: 'summary' },
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentSlide, isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleShare = (slideIndex: number) => {
    setShareSlide(slideIndex);
    setShowShare(true);
  };

  const getShareContent = () => {
    const slide = slides[shareSlide || 0];
    switch (slide?.type) {
      case 'miles':
        return { title: `${stats.totalMiles.toLocaleString()} Miles`, description: "That's how far I traveled this year! 🚐" };
      case 'states':
        return { title: `${visitedStates.length} States`, description: "States I explored this year! 🗺️" };
      case 'nights':
        return { title: `${stats.nightsCamped} Nights`, description: "Nights under the stars this year! ⭐" };
      case 'title':
        return { title: travelTitle.title, description: travelTitle.subtitle };
      default:
        return { title: "My 2024 RV Wrapped", description: "Check out my year in review!" };
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const renderSlide = (type: string) => {
    switch (type) {
      case 'intro':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-8xl mb-8"
            >
              🚐
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-display text-4xl font-bold mb-4 text-gradient-sunset"
            >
              Your 2024
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="font-display text-5xl font-bold mb-6"
            >
              RV Wrapped
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-muted-foreground text-lg"
            >
              Let's relive your adventures
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-32 flex items-center gap-2 text-muted-foreground"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Tap to continue</span>
            </motion.div>
          </div>
        );

      case 'miles':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-primary/20 via-background to-secondary/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full gradient-sunset flex items-center justify-center mb-8 glow-primary"
            >
              <Route className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-4"
            >
              This year you traveled
            </motion.p>
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="font-display text-7xl font-bold text-gradient-sunset mb-2"
            >
              {stats.totalMiles.toLocaleString()}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-medium"
            >
              miles
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-muted-foreground mt-8 text-sm"
            >
              That's {Math.round(stats.totalMiles / 24901 * 100)}% around the Earth! 🌍
            </motion.p>
          </div>
        );

      case 'states':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-secondary/20 via-background to-primary/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-8"
              style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' }}
            >
              <MapPin className="w-12 h-12 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-4"
            >
              You explored
            </motion.p>
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="font-display text-7xl font-bold mb-2"
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {visitedStates.length}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-medium"
            >
              states
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 flex flex-wrap justify-center gap-2 max-w-xs"
            >
              {visitedStates.slice(0, 12).map((state, i) => (
                <motion.span
                  key={state}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.3 + i * 0.05 }}
                  className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium"
                >
                  {state}
                </motion.span>
              ))}
              {visitedStates.length > 12 && (
                <span className="px-2 py-1 text-muted-foreground text-xs">+{visitedStates.length - 12} more</span>
              )}
            </motion.div>
          </div>
        );

      case 'nights':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-indigo-500/20 via-background to-purple-500/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-8"
              style={{ boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' }}
            >
              <Moon className="w-12 h-12 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-4"
            >
              You spent
            </motion.p>
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="font-display text-7xl font-bold mb-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {stats.nightsCamped}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-medium"
            >
              nights on the road
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-muted-foreground mt-8 text-sm"
            >
              That's {Math.round(stats.nightsCamped / 365 * 100)}% of the year under the stars! ⭐
            </motion.p>
          </div>
        );

      case 'destination':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-rose-500/20 via-background to-orange-500/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mb-8"
              style={{ boxShadow: '0 0 40px rgba(244, 63, 94, 0.4)' }}
            >
              <Compass className="w-12 h-12 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-4"
            >
              Your favorite destination was
            </motion.p>
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="font-display text-5xl font-bold mb-2"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {favoriteDestination?.name || 'California'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-muted-foreground mt-6 text-sm"
            >
              You visited {favoriteDestination?.count || 3} times this year! 🎯
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-8 text-6xl"
            >
              ❤️
            </motion.div>
          </div>
        );

      case 'achievement':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-yellow-500/20 via-background to-amber-500/20">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mb-8"
              style={{ boxShadow: '0 0 40px rgba(234, 179, 8, 0.4)' }}
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-4"
            >
              Your top achievement
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="text-7xl mb-4"
            >
              {topAchievement?.icon || '🏆'}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="font-display text-3xl font-bold mb-2"
              style={{ background: 'linear-gradient(135deg, #eab308, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {topAchievement?.name || 'Road Legend'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-muted-foreground text-sm max-w-xs"
            >
              {topAchievement?.description || 'An extraordinary achievement'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-6 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium"
            >
              {unlockedTrophies} trophies earned
            </motion.div>
          </div>
        );

      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-primary/30 via-background to-secondary/30">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg mb-6"
            >
              This year, you earned the title of
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="text-8xl mb-6"
            >
              {travelTitle.icon}
            </motion.div>
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.8 }}
              className="font-display text-5xl font-bold mb-4 text-gradient-sunset"
            >
              {travelTitle.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-lg text-muted-foreground"
            >
              {travelTitle.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-8 flex items-center gap-2"
            >
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </motion.div>
          </div>
        );

      case 'summary':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl font-bold mb-8 text-gradient-sunset"
            >
              Your 2024 Journey
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8"
            >
              <div className="bg-card rounded-xl p-4 card-elevated">
                <Route className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl font-bold">{stats.totalMiles.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">miles</p>
              </div>
              <div className="bg-card rounded-xl p-4 card-elevated">
                <MapPin className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="font-display text-2xl font-bold">{visitedStates.length}</p>
                <p className="text-xs text-muted-foreground">states</p>
              </div>
              <div className="bg-card rounded-xl p-4 card-elevated">
                <Moon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <p className="font-display text-2xl font-bold">{stats.nightsCamped}</p>
                <p className="text-xs text-muted-foreground">nights</p>
              </div>
              <div className="bg-card rounded-xl p-4 card-elevated">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="font-display text-2xl font-bold">{unlockedTrophies}</p>
                <p className="text-xs text-muted-foreground">trophies</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl p-4 border border-primary/30 mb-6 w-full max-w-xs"
            >
              <p className="text-sm text-muted-foreground mb-1">Your Title</p>
              <p className="font-display text-xl font-bold flex items-center justify-center gap-2">
                <span>{travelTitle.icon}</span>
                <span>{travelTitle.title}</span>
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={() => handleShare(currentSlide)}
              className="flex items-center gap-2 px-6 py-3 rounded-full gradient-sunset text-primary-foreground font-medium"
            >
              <Share2 className="w-5 h-5" />
              Share Your Wrapped
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-muted-foreground text-sm mt-6"
            >
              Here's to more adventures in 2025! 🚐✨
            </motion.p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2 safe-top">
        {slides.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 rounded-full bg-muted overflow-hidden"
          >
            <motion.div
              className="h-full gradient-sunset"
              initial={{ width: '0%' }}
              animate={{
                width: index < currentSlide ? '100%' : index === currentSlide ? '100%' : '0%',
              }}
              transition={{ duration: index === currentSlide && isAutoPlaying ? 5 : 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-12 right-4 z-50 w-10 h-10 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Share button */}
      <button
        onClick={() => handleShare(currentSlide)}
        className="absolute top-12 right-16 z-50 w-10 h-10 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {/* Slides */}
      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={currentSlide}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.3 }}
          className="absolute inset-0"
        >
          {renderSlide(slides[currentSlide].type)}
        </motion.div>
      </AnimatePresence>

      {/* Navigation areas */}
      <div className="absolute inset-0 flex z-40">
        <div className="w-1/3 h-full" onClick={prevSlide} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full" onClick={nextSlide} />
      </div>

      {/* Navigation arrows (visible on larger screens) */}
      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 gap-4 z-50">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="w-12 h-12 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-30"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="w-12 h-12 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-30"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Share Menu */}
      <ShareMenu
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={getShareContent().title}
        description={getShareContent().description}
      />
    </div>
  );
};

export default WrappedPage;
