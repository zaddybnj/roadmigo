import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Calendar, Moon, Heart, 
  MessageCircle, FileText, Mountain, Lock, Users, Globe, Landmark
} from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { useSocial } from '@/context/SocialContext';
import { USMap } from '@/components/USMap';
import { CommentSection } from '@/components/CommentSection';
import { PhotoGallery } from '@/components/PhotoGallery';
import { ShareMenu } from '@/components/ShareMenu';
import { getCategoryInfo } from '@/types/milestone';
import { useState } from 'react';

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { completedTrips } = useTrip();
  const { isTripLiked, likeTrip, unlikeTrip } = useSocial();
  const [showComments, setShowComments] = useState(false);

  const trip = completedTrips.find(t => t.id === id);
  const isLiked = id ? isTripLiked(id) : false;

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

  const handleLikeToggle = () => {
    if (id) {
      if (isLiked) {
        unlikeTrip(id);
      } else {
        likeTrip(id);
      }
    }
  };

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const formatDateRange = () => {
    return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  const getPrivacyIcon = () => {
    switch (trip.privacy) {
      case 'public': return <Globe className="w-3.5 h-3.5" />;
      case 'friends': return <Users className="w-3.5 h-3.5" />;
      case 'private': return <Lock className="w-3.5 h-3.5" />;
    }
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

        {/* Privacy Badge */}
        <div className="absolute top-4 right-4 safe-top px-2.5 py-1 rounded-full bg-background/50 backdrop-blur flex items-center gap-1 text-xs text-foreground">
          {getPrivacyIcon()}
          <span className="capitalize">{trip.privacy}</span>
        </div>

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
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link 
            to={trip.userId === '1' ? '/profile' : `/user/${trip.userId}`}
            className="flex items-center gap-3 p-3 bg-card rounded-xl card-elevated hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{trip.userName}</p>
              <p className="text-xs text-muted-foreground">{formatDateRange()}</p>
            </div>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
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
            <USMap visitedStates={trip.states} milestones={trip.milestones} />
          </div>
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground text-center">
              Visited {trip.states.length} state{trip.states.length !== 1 ? 's' : ''}: {trip.states.join(', ')}
            </p>
          </div>
        </motion.div>

        {/* Photos Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 card-elevated"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📷</span>
              <h3 className="font-display font-semibold">Photos</h3>
              <span className="text-sm text-muted-foreground">({trip.photos.length})</span>
            </div>
          </div>
          <PhotoGallery photos={trip.photos} />
        </motion.div>

        {/* Milestones */}
        {trip.milestones && trip.milestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-card rounded-xl p-4 card-elevated"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-secondary" />
                <h3 className="font-display font-semibold">Notable Locations</h3>
              </div>
              <span className="text-sm text-muted-foreground">{trip.milestones.length} spots</span>
            </div>
            
            <div className="space-y-2">
              {trip.milestones.map((milestone) => {
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
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{milestone.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
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
            onClick={handleLikeToggle}
            className="flex items-center gap-2 text-sm"
          >
            <motion.div whileTap={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            </motion.div>
            <span className={isLiked ? 'text-primary font-medium' : 'text-muted-foreground'}>
              {trip.likes + (isLiked ? 1 : 0)}
            </span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 text-sm ${showComments ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <MessageCircle className={`w-6 h-6 ${showComments ? 'fill-primary/20' : ''}`} />
            <span>{trip.comments}</span>
          </button>

          <ShareMenu trip={trip} />
        </motion.div>

        {/* Comments Section */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl p-4 card-elevated"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Comments</h3>
            </div>
            <CommentSection tripId={trip.id} />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default TripDetailPage;
