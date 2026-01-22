import { Trip } from '@/types';
import { Heart, MessageCircle, Share2, MapPin, Lock, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSocial } from '@/context/SocialContext';

interface TripCardProps {
  trip: Trip;
}

export const TripCard = ({ trip }: TripCardProps) => {
  const { isTripLiked, likeTrip, unlikeTrip, getCommentsForTrip } = useSocial();
  const isLiked = isTripLiked(trip.id);
  const comments = getCommentsForTrip(trip.id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      unlikeTrip(trip.id);
    } else {
      likeTrip(trip.id);
    }
  };

  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getPrivacyIcon = () => {
    switch (trip.privacy) {
      case 'public': return <Globe className="w-3 h-3" />;
      case 'friends': return <Users className="w-3 h-3" />;
      case 'private': return <Lock className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg overflow-hidden card-elevated"
    >
      {/* Trip Preview Image - Clickable */}
      <Link to={`/trip/${trip.id}`}>
        <div className="relative h-48 overflow-hidden">
          {trip.photos.length > 0 ? (
            <img 
              src={trip.photos[0]} 
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-forest" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          
          {/* Privacy Badge */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-background/50 backdrop-blur flex items-center gap-1 text-[10px] text-foreground">
            {getPrivacyIcon()}
            <span className="capitalize">{trip.privacy}</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              {trip.states.map((state) => (
                <span
                  key={state}
                  className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full backdrop-blur-sm"
                >
                  {state}
                </span>
              ))}
            </div>
            <h3 className="font-display font-bold text-lg text-foreground">{trip.title}</h3>
          </div>
        </div>
      </Link>

      {/* Trip Info */}
      <div className="p-4">
        {/* User Info */}
        <Link 
          to={trip.userId === '1' ? '/profile' : `/user/${trip.userId}`}
          className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div>
            <p className="text-sm font-medium">{trip.userName}</p>
            <p className="text-xs text-muted-foreground">{formatDate(trip.startDate, trip.endDate)}</p>
          </div>
        </Link>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{trip.description}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{trip.distance.toLocaleString()}</span>
            <span>miles</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-lg">🏕️</span>
            <span className="font-medium text-foreground">{trip.nights}</span>
            <span>nights</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-sm"
          >
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'
                }`}
              />
            </motion.div>
            <span className={isLiked ? 'text-primary font-medium' : 'text-muted-foreground'}>
              {trip.likes + (isLiked ? 1 : 0)}
            </span>
          </button>

          <Link to={`/trip/${trip.id}`} className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="w-5 h-5" />
            <span>{comments.length || trip.comments}</span>
          </Link>

          <button className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
