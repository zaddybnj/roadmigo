import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, Trophy, Users, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'rv-onboarding-complete';

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <MapPin className="w-16 h-16" />,
    title: "Track Your Journeys",
    description: "Log your RV adventures, track miles driven, and mark states visited. Watch your travel map fill up as you explore!",
    color: "from-primary/20 to-secondary/20",
  },
  {
    icon: <Camera className="w-16 h-16" />,
    title: "Capture Memories",
    description: "Add photos and milestones to remember every special moment. Pin scenic viewpoints, campgrounds, and hidden gems.",
    color: "from-secondary/20 to-accent/20",
  },
  {
    icon: <Trophy className="w-16 h-16" />,
    title: "Earn Achievements",
    description: "Unlock badges and trophies as you explore. Level up from Weekend Warrior to Ultimate Nomad!",
    color: "from-accent/20 to-primary/20",
  },
  {
    icon: <Users className="w-16 h-16" />,
    title: "Connect with RVers",
    description: "Follow fellow travelers, share your adventures, and discover new destinations from the community.",
    color: "from-primary/20 to-accent/20",
  },
];

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-lg flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <div className="flex gap-1.5">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleSkip}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon with gradient background */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center mb-6 sm:mb-8 text-primary`}
            >
              {slides[currentSlide].icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-display font-bold mb-3 sm:mb-4"
            >
              {slides[currentSlide].title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-base sm:text-lg max-w-sm leading-relaxed"
            >
              {slides[currentSlide].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation - fixed to bottom with safe area */}
      <div className="flex-shrink-0 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-3">
        <Button
          size="lg"
          onClick={nextSlide}
          className="w-full max-w-[280px] min-h-[48px]"
        >
          {currentSlide === slides.length - 1 ? (
            "Get Started"
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-4">
          {currentSlide > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Hook to check if onboarding is needed
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    setShowOnboarding(!completed);
    setIsReady(true);
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding, isReady };
};
