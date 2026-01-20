import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Calendar, Moon, Heart, 
  MessageCircle, Share2, FileText, Camera, Mountain
} from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { USMap } from '@/components/USMap';
import { useState } from 'react';

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { completedTrips } = useTrip();
  const [isLiked, setIsLiked] = useState(false);

  const trip = completedTrips.find(t => t.id === id);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Trip not found</p>
          <button
            onClick={() => navigate('/trips')}
            className="px-6 py-3 gradient-sunset text-primary-foreground font-medium rounded-xl"
          >
            View All Trips
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const formatDateRange = () => {
    return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        {trip.photos.length > 0 ? (
          <img 
            src={trip.photos[0]} 
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-forest" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 safe-top w-10 h-10 rounded-full bg-background/50 backdrop-blur flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            {trip.states.slice(0, 4).map((state) => (
              <span
                key={state}
                className="px-2 py-0.5 bg-secondary/30 text-secondary text-xs font-medium rounded-full backdrop-blur-sm"
              >
                {state}
              </span>
            ))}
            {trip.states.length > 4 && (
              <span className="text-xs text-muted-foreground">+{trip.states.length - 4} more</span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold">{trip.title}</h1>
        </div>
      </div>

      <main className="px-4 -mt-2 space-y-4">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 card-elevated"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <p className="font-display text-xl font-bold">{trip.distance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">miles</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <p className="font-display text-xl font-bold">{trip.nights + 1}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="font-display text-xl font-bold">{trip.nights}</p>
              <p className="text-xs text-muted-foreground">nights</p>
            </div>
          </div>
        </motion.div>

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Calendar className="w-4 h-4" />
          <span>{formatDateRange()}</span>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 card-elevated"
        >
          <p className="text-foreground leading-relaxed">{trip.description}</p>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl overflow-hidden card-elevated"
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Mountain className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Route Map</h3>
            </div>
          </div>
          <div className="p-2">
            <USMap visitedStates={trip.states} />
          </div>
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground text-center">
              Visited {trip.states.length} state{trip.states.length !== 1 ? 's' : ''}: {trip.states.join(', ')}
            </p>
          </div>
        </motion.div>

        {/* Photos Gallery */}
        {trip.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-4 card-elevated"
          >
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Photos</h3>
              <span className="text-sm text-muted-foreground">({trip.photos.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trip.photos.map((photo, i) => (
                <div 
                  key={i} 
                  className={`rounded-lg overflow-hidden bg-muted ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}
                >
                  <img src={photo} alt={`Trip photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Notes */}
        {trip.notes && (
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
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{trip.notes}</p>
          </motion.div>
        )}

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-4 border-t border-border"
        >
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex items-center gap-2 text-sm"
          >
            <motion.div whileTap={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            </motion.div>
            <span className={isLiked ? 'text-primary font-medium' : 'text-muted-foreground'}>
              {trip.likes + (isLiked ? 1 : 0)}
            </span>
          </button>

          <button className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="w-6 h-6" />
            <span>{trip.comments}</span>
          </button>

          <button className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="w-6 h-6" />
            <span>Share</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default TripDetailPage;
