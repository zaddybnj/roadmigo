import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, MapPin, Gauge, FileText, 
  ChevronLeft, Settings, Mountain, Landmark
} from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { useNavigate } from 'react-router-dom';
import { TripControlsModal } from '@/components/TripControlsModal';
import { USMap } from '@/components/USMap';
import { PhotoGallery } from '@/components/PhotoGallery';
import { PhotoUploader } from '@/components/PhotoUploader';
import { getCategoryInfo } from '@/types/milestone';

const ActiveTripPage = () => {
  const { activeTrip, isTracking, addPhoto } = useTrip();
  const navigate = useNavigate();
  const [showControlsModal, setShowControlsModal] = useState(false);

  if (!isTracking || !activeTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No active trip</p>
          <button
            onClick={() => navigate('/trips')}
            className="px-6 py-3 gradient-sunset text-primary-foreground font-medium rounded-xl"
          >
            Start a Trip
          </button>
        </div>
      </div>
    );
  }

  const formatDuration = (days: number) => {
    if (days === 1) return 'Day 1';
    return `Day ${days}`;
  };

  const startDate = new Date(activeTrip.startDate);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-transparent">
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-card/50 backdrop-blur flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-3 h-3 rounded-full bg-primary"
                />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Trip in Progress
                </span>
              </div>
            </div>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-2xl font-bold mb-1"
          >
            {activeTrip.title}
          </motion.h1>
          <p className="text-sm text-muted-foreground">
            Started {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {activeTrip.startLocation && ` from ${activeTrip.startLocation}`}
          </p>
        </div>
      </div>

      <main className="px-4 space-y-4">
        {/* Live Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-card rounded-xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Distance</span>
            </div>
            <p className="font-display text-2xl font-bold">{activeTrip.currentMiles.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">miles traveled</p>
          </div>

          <div className="bg-card rounded-xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-xs text-muted-foreground">Duration</span>
            </div>
            <p className="font-display text-2xl font-bold">{formatDuration(activeTrip.daysOnRoad)}</p>
            <p className="text-xs text-muted-foreground">{activeTrip.daysOnRoad - 1} nights on road</p>
          </div>
        </motion.div>

        {/* States Visited */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 card-elevated"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <h3 className="font-display font-semibold">States Visited</h3>
            </div>
            <span className="text-sm text-muted-foreground">{activeTrip.statesVisited.length} states</span>
          </div>
          
          {activeTrip.statesVisited.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeTrip.statesVisited.map((state) => (
                <span
                  key={state}
                  className="px-3 py-1.5 bg-secondary/20 text-secondary text-sm font-medium rounded-full"
                >
                  {state}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No states logged yet. Tap "Update Trip" to add states!</p>
          )}
        </motion.div>

        {/* Map Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl overflow-hidden card-elevated"
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Mountain className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Journey Map</h3>
            </div>
          </div>
          <div className="p-2">
            <USMap 
              visitedStates={activeTrip.statesVisited} 
              milestones={activeTrip.milestones}
              activeStops={activeTrip.waypoints}
              routePreview={activeTrip.routePreview}
            />
          </div>
        </motion.div>

        {/* Milestones */}
        {activeTrip.milestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="bg-card rounded-xl p-4 card-elevated"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-secondary" />
                <h3 className="font-display font-semibold">Notable Locations</h3>
              </div>
              <span className="text-sm text-muted-foreground">{activeTrip.milestones.length} spots</span>
            </div>
            
            <div className="space-y-2">
              {activeTrip.milestones.map((milestone) => {
                const catInfo = getCategoryInfo(milestone.category);
                const hasPinned = milestone.latitude && milestone.longitude;
                return (
                  <div 
                    key={milestone.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-xl">{catInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{milestone.name}</p>
                        {hasPinned && (
                          <MapPin className="w-3 h-3 text-secondary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{catInfo.label}</p>
                      {milestone.notes && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{milestone.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 card-elevated"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📷</span>
              <h3 className="font-display font-semibold">Trip Photos</h3>
              <span className="text-sm text-muted-foreground">({activeTrip.photos.length})</span>
            </div>
            <PhotoUploader 
              onPhotosAdd={(photos) => photos.forEach(p => addPhoto(p))}
              currentCount={activeTrip.photos.length}
            />
          </div>
          <PhotoGallery photos={activeTrip.photos} />
        </motion.div>

        {/* Notes */}
        {activeTrip.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-xl p-4 card-elevated"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Trip Notes</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{activeTrip.notes}</p>
          </motion.div>
        )}
      </main>

      {/* Bottom Action Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowControlsModal(true)}
            className="w-full py-4 rounded-xl gradient-sunset text-primary-foreground font-display font-semibold glow-primary flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Trip Controls
          </motion.button>
        </div>
      </div>

      {/* Modal */}
      <TripControlsModal 
        isOpen={showControlsModal} 
        onClose={() => setShowControlsModal(false)} 
      />
    </div>
  );
};

export default ActiveTripPage;
