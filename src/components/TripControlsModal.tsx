import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Flag, Lock, Users, Globe, Navigation, Loader2, Plus, Trash2,
  Gauge, FileText, MapPin
} from 'lucide-react';
import { useTrip, Waypoint } from '@/context/TripContext';
import { useNavigate } from 'react-router-dom';
import { LocationSearch } from '@/components/LocationSearch';
import { fetchRoute, RouteData, RoutePoint, formatRouteMiles, formatRouteDuration } from '@/lib/routing';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MILESTONE_CATEGORIES, getCategoryInfo, Milestone, MilestoneCategory } from '@/types/milestone';

interface TripControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Privacy = 'public' | 'friends' | 'private';
type Tab = 'route' | 'locations';

interface LocationResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

const privacyOptions: { value: Privacy; icon: React.ReactNode; label: string }[] = [
  { value: 'public', icon: <Globe className="w-4 h-4" />, label: 'Public' },
  { value: 'friends', icon: <Users className="w-4 h-4" />, label: 'Friends' },
  { value: 'private', icon: <Lock className="w-4 h-4" />, label: 'Private' },
];

// Simple state detection from coordinates using bounding boxes
const US_STATE_BOUNDS: { [key: string]: { minLat: number; maxLat: number; minLng: number; maxLng: number } } = {
  'AL': { minLat: 30.22, maxLat: 35.01, minLng: -88.47, maxLng: -84.89 },
  'AZ': { minLat: 31.33, maxLat: 37.00, minLng: -114.81, maxLng: -109.04 },
  'AR': { minLat: 33.00, maxLat: 36.50, minLng: -94.62, maxLng: -89.64 },
  'CA': { minLat: 32.53, maxLat: 42.01, minLng: -124.48, maxLng: -114.13 },
  'CO': { minLat: 36.99, maxLat: 41.00, minLng: -109.05, maxLng: -102.04 },
  'CT': { minLat: 40.98, maxLat: 42.05, minLng: -73.73, maxLng: -71.79 },
  'DE': { minLat: 38.45, maxLat: 39.84, minLng: -75.79, maxLng: -75.05 },
  'FL': { minLat: 24.52, maxLat: 31.00, minLng: -87.63, maxLng: -80.03 },
  'GA': { minLat: 30.36, maxLat: 35.00, minLng: -85.61, maxLng: -80.84 },
  'ID': { minLat: 41.99, maxLat: 49.00, minLng: -117.24, maxLng: -111.04 },
  'IL': { minLat: 36.97, maxLat: 42.51, minLng: -91.51, maxLng: -87.02 },
  'IN': { minLat: 37.77, maxLat: 41.76, minLng: -88.10, maxLng: -84.78 },
  'IA': { minLat: 40.38, maxLat: 43.50, minLng: -96.64, maxLng: -90.14 },
  'KS': { minLat: 36.99, maxLat: 40.00, minLng: -102.05, maxLng: -94.59 },
  'KY': { minLat: 36.50, maxLat: 39.15, minLng: -89.57, maxLng: -81.96 },
  'LA': { minLat: 28.93, maxLat: 33.02, minLng: -94.04, maxLng: -88.82 },
  'ME': { minLat: 43.06, maxLat: 47.46, minLng: -71.08, maxLng: -66.95 },
  'MD': { minLat: 37.91, maxLat: 39.72, minLng: -79.49, maxLng: -75.05 },
  'MA': { minLat: 41.24, maxLat: 42.89, minLng: -73.50, maxLng: -69.93 },
  'MI': { minLat: 41.70, maxLat: 48.19, minLng: -90.42, maxLng: -82.42 },
  'MN': { minLat: 43.50, maxLat: 49.38, minLng: -97.24, maxLng: -89.49 },
  'MS': { minLat: 30.17, maxLat: 35.00, minLng: -91.66, maxLng: -88.10 },
  'MO': { minLat: 35.99, maxLat: 40.61, minLng: -95.77, maxLng: -89.10 },
  'MT': { minLat: 44.36, maxLat: 49.00, minLng: -116.05, maxLng: -104.04 },
  'NE': { minLat: 40.00, maxLat: 43.00, minLng: -104.05, maxLng: -95.31 },
  'NV': { minLat: 35.00, maxLat: 42.00, minLng: -120.00, maxLng: -114.04 },
  'NH': { minLat: 42.70, maxLat: 45.31, minLng: -72.56, maxLng: -70.70 },
  'NJ': { minLat: 38.93, maxLat: 41.36, minLng: -75.56, maxLng: -73.89 },
  'NM': { minLat: 31.33, maxLat: 37.00, minLng: -109.05, maxLng: -103.00 },
  'NY': { minLat: 40.50, maxLat: 45.02, minLng: -79.76, maxLng: -71.86 },
  'NC': { minLat: 33.84, maxLat: 36.59, minLng: -84.32, maxLng: -75.46 },
  'ND': { minLat: 45.93, maxLat: 49.00, minLng: -104.05, maxLng: -96.55 },
  'OH': { minLat: 38.40, maxLat: 42.33, minLng: -84.82, maxLng: -80.52 },
  'OK': { minLat: 33.62, maxLat: 37.00, minLng: -103.00, maxLng: -94.43 },
  'OR': { minLat: 41.99, maxLat: 46.29, minLng: -124.57, maxLng: -116.46 },
  'PA': { minLat: 39.72, maxLat: 42.27, minLng: -80.52, maxLng: -74.69 },
  'RI': { minLat: 41.15, maxLat: 42.02, minLng: -71.86, maxLng: -71.12 },
  'SC': { minLat: 32.03, maxLat: 35.22, minLng: -83.35, maxLng: -78.54 },
  'SD': { minLat: 42.48, maxLat: 45.95, minLng: -104.06, maxLng: -96.44 },
  'TN': { minLat: 34.98, maxLat: 36.68, minLng: -90.31, maxLng: -81.65 },
  'TX': { minLat: 25.84, maxLat: 36.50, minLng: -106.65, maxLng: -93.51 },
  'UT': { minLat: 37.00, maxLat: 42.00, minLng: -114.05, maxLng: -109.04 },
  'VT': { minLat: 42.73, maxLat: 45.02, minLng: -73.44, maxLng: -71.46 },
  'VA': { minLat: 36.54, maxLat: 39.47, minLng: -83.68, maxLng: -75.24 },
  'WA': { minLat: 45.54, maxLat: 49.00, minLng: -124.85, maxLng: -116.92 },
  'WV': { minLat: 37.20, maxLat: 40.64, minLng: -82.64, maxLng: -77.72 },
  'WI': { minLat: 42.49, maxLat: 47.08, minLng: -92.89, maxLng: -86.25 },
  'WY': { minLat: 40.99, maxLat: 45.01, minLng: -111.06, maxLng: -104.05 },
};

function getStatesFromCoordinates(coords: [number, number][]): string[] {
  const states = new Set<string>();
  
  for (const [lng, lat] of coords) {
    for (const [stateCode, bounds] of Object.entries(US_STATE_BOUNDS)) {
      if (lat >= bounds.minLat && lat <= bounds.maxLat && 
          lng >= bounds.minLng && lng <= bounds.maxLng) {
        states.add(stateCode);
      }
    }
  }
  
  return Array.from(states);
}

export const TripControlsModal = ({ isOpen, onClose }: TripControlsModalProps) => {
  const { activeTrip, endTrip, updateMiles, updateNotes, addMilestone, removeMilestone, addRouteStop, removeRouteStop } = useTrip();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<Tab>('progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Progress state
  const [milesInput, setMilesInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  
  // Stop form state
  const [stopName, setStopName] = useState('');
  const [stopCoords, setStopCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Milestone form state
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneCategory, setMilestoneCategory] = useState<MilestoneCategory>('national_park');
  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [milestoneCoords, setMilestoneCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Locations tab - toggle between stops and spots
  const [locationMode, setLocationMode] = useState<'stops' | 'spots'>('stops');
  
  // End trip state
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [startLocationText, setStartLocationText] = useState('');
  const [endLocationText, setEndLocationText] = useState('');
  const [startLocation, setStartLocation] = useState<LocationResult | null>(null);
  const [endLocation, setEndLocation] = useState<LocationResult | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [derivedStates, setDerivedStates] = useState<string[]>([]);

  // Initialize notes from active trip
  useEffect(() => {
    if (activeTrip) {
      setNotesInput(activeTrip.notes || '');
    }
  }, [activeTrip]);

  if (!activeTrip) return null;

  const handleQuickAddMiles = async (amount: number) => {
    const newMiles = activeTrip.currentMiles + amount;
    await updateMiles(newMiles);
    toast({
      title: 'Miles added',
      description: `+${amount} miles (total: ${newMiles.toLocaleString()})`,
    });
  };

  const handleUpdateMiles = async () => {
    const miles = parseInt(milesInput);
    if (!isNaN(miles) && miles >= 0) {
      await updateMiles(miles);
      toast({
        title: 'Odometer updated',
        description: `Trip distance set to ${miles.toLocaleString()} miles`,
      });
      setMilesInput('');
    }
  };

  const handleSaveNotes = async () => {
    await updateNotes(notesInput);
    toast({
      title: 'Notes saved',
      description: 'Your trip notes have been updated',
    });
  };

  const handleAddRouteStop = async () => {
    if (!stopName.trim() || !stopCoords) {
      toast({
        title: 'Location required',
        description: 'Please search and select a location',
        variant: 'destructive',
      });
      return;
    }

    const newStop: Waypoint = {
      id: crypto.randomUUID(),
      name: stopName.trim(),
      lat: stopCoords.lat,
      lng: stopCoords.lng,
      timestamp: new Date().toISOString(),
    };

    await addRouteStop(newStop);
    toast({
      title: 'Stop added!',
      description: `📍 ${stopName} added to your route`,
    });
    
    setStopName('');
    setStopCoords(null);
  };

  const handleRemoveRouteStop = async (id: string, name: string) => {
    await removeRouteStop(id);
    toast({
      title: 'Stop removed',
      description: `${name} removed from your route`,
    });
  };

  const handleAddMilestone = async () => {
    if (!milestoneName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for this spot',
        variant: 'destructive',
      });
      return;
    }

    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      name: milestoneName.trim(),
      category: milestoneCategory,
      notes: milestoneNotes.trim() || undefined,
      timestamp: new Date().toISOString(),
      latitude: milestoneCoords?.lat,
      longitude: milestoneCoords?.lng,
    };

    await addMilestone(newMilestone);
    toast({
      title: 'Spot added!',
      description: `${getCategoryInfo(milestoneCategory).icon} ${milestoneName} added`,
    });
    
    setMilestoneName('');
    setMilestoneNotes('');
    setMilestoneCoords(null);
  };

  const handleRemoveMilestone = async (id: string, name: string) => {
    await removeMilestone(id);
    toast({ title: 'Spot removed', description: `${name} removed` });
  };

  const handleFetchRoute = async () => {
    if (!startLocation || !endLocation) {
      toast({
        title: 'Missing locations',
        description: 'Please select both start and end points',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingRoute(true);
    try {
      // Use logged waypoints as intermediate stops
      const waypointPoints: RoutePoint[] = activeTrip.waypoints.map(w => ({
        latitude: w.lat,
        longitude: w.lng,
        name: w.name,
      }));

      const route = await fetchRoute(
        { latitude: startLocation.latitude, longitude: startLocation.longitude, name: startLocation.name },
        { latitude: endLocation.latitude, longitude: endLocation.longitude, name: endLocation.name },
        waypointPoints
      );

      if (route) {
        setRouteData(route);
        // Auto-derive states from route coordinates
        const states = getStatesFromCoordinates(route.coordinates);
        setDerivedStates(states);
        
        toast({
          title: 'Route calculated!',
          description: `${formatRouteMiles(route.distance)} miles through ${states.length} states`,
        });
      } else {
        toast({
          title: 'Route not found',
          description: 'Could not find a driving route',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate route',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleEndTrip = async () => {
    setIsSubmitting(true);
    
    try {
      const completedTrip = await endTrip(
        description.trim() || 'What an amazing adventure!', 
        privacy,
        routeData || undefined,
        derivedStates.length > 0 ? derivedStates : undefined
      );
      onClose();
      navigate(`/trip/${completedTrip.id}`);
    } catch (error) {
      console.error('Error ending trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete trip',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'progress' as Tab, icon: Gauge, label: 'Progress' },
    { id: 'locations' as Tab, icon: MapPin, label: 'Locations' },
    { id: 'finish' as Tab, icon: Flag, label: 'Finish' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-[calc(100%-2rem)] max-w-md max-h-[85vh] mx-4 bg-card rounded-2xl card-elevated flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="font-display font-bold text-lg">{activeTrip.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Day {activeTrip.daysOnRoad} • {activeTrip.currentMiles.toLocaleString()} miles
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border flex-shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                    activeTab === tab.id 
                      ? 'text-primary border-b-2 border-primary -mb-px' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {/* Current stats */}
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Current Odometer</p>
                    <p className="font-display text-4xl font-bold text-primary">
                      {activeTrip.currentMiles.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">miles</p>
                  </div>

                  {/* Quick add */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Quick Add Miles</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 200, 500].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="lg"
                          onClick={() => handleQuickAddMiles(amount)}
                          className="text-base"
                        >
                          +{amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Manual entry */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Set Total Miles</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={milesInput}
                        onChange={(e) => setMilesInput(e.target.value)}
                        placeholder="Enter total miles..."
                        className="text-lg h-12"
                      />
                      <Button onClick={handleUpdateMiles} size="lg" className="gradient-sunset px-6">
                        Set
                      </Button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Trip Notes</p>
                    </div>
                    <textarea
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Jot down memories, places, things to remember..."
                      rows={4}
                      className="w-full px-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base"
                    />
                    <Button variant="outline" onClick={handleSaveNotes} className="w-full">
                      Save Notes
                    </Button>
                  </div>
                </div>
              )}

              {/* Locations Tab (Combined Stops + Spots) */}
              {activeTab === 'locations' && (
                <div className="space-y-4">
                  {/* Mode Toggle */}
                  <div className="flex bg-muted rounded-xl p-1">
                    <button
                      onClick={() => setLocationMode('stops')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                        locationMode === 'stops'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Stops ({activeTrip.waypoints.length})
                      </span>
                    </button>
                    <button
                      onClick={() => setLocationMode('spots')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                        locationMode === 'spots'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        ⭐
                        Spots ({activeTrip.milestones.length})
                      </span>
                    </button>
                  </div>

                  {/* Stops Mode */}
                  {locationMode === 'stops' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Log places you've stopped. Used to calculate your final route.
                      </p>
                      
                      {/* Current stops */}
                      {activeTrip.waypoints.length > 0 && (
                        <div className="space-y-2">
                          {activeTrip.waypoints.map((stop, index) => (
                            <div 
                              key={stop.id}
                              className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-primary-foreground text-sm font-bold">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{stop.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(stop.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveRouteStop(stop.id, stop.name)}
                                className="p-2 hover:bg-destructive/20 rounded-full transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new stop */}
                      <div className="space-y-3 pt-2 border-t border-border">
                        <p className="text-sm font-medium">Add a stop</p>
                        
                        <LocationSearch
                          value={stopName}
                          onChange={setStopName}
                          onLocationSelect={(location) => {
                            setStopName(location.name);
                            setStopCoords({ lat: location.latitude, lng: location.longitude });
                          }}
                          placeholder="Search for a location..."
                        />

                        {stopCoords && (
                          <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-xl">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">Location selected</span>
                            <button 
                              onClick={() => { setStopCoords(null); setStopName(''); }}
                              className="ml-auto text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <Button 
                          onClick={handleAddRouteStop}
                          className="w-full gradient-sunset h-12 text-base"
                          disabled={!stopName.trim() || !stopCoords}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add Stop
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Spots Mode */}
                  {locationMode === 'spots' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Mark notable locations like parks, attractions, or memorable places.
                      </p>
                      
                      {/* Current spots */}
                      {activeTrip.milestones.length > 0 && (
                        <div className="space-y-2">
                          {activeTrip.milestones.map((milestone) => {
                            const catInfo = getCategoryInfo(milestone.category);
                            return (
                              <div 
                                key={milestone.id}
                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                              >
                                <span className="text-2xl">{catInfo.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{milestone.name}</p>
                                  <p className="text-xs text-muted-foreground">{catInfo.label}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveMilestone(milestone.id, milestone.name)}
                                  className="p-2 hover:bg-destructive/20 rounded-full transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add new spot */}
                      <div className="space-y-3 pt-2 border-t border-border">
                        <p className="text-sm font-medium">Add a notable spot</p>
                        
                        {/* Category */}
                        <div className="flex flex-wrap gap-2">
                          {MILESTONE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.value}
                              onClick={() => setMilestoneCategory(cat.value)}
                              className={`px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors ${
                                milestoneCategory === cat.value
                                  ? 'bg-primary/20 border-2 border-primary text-primary'
                                  : 'bg-muted border-2 border-transparent hover:border-muted-foreground/20'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Location search */}
                        <LocationSearch
                          value={milestoneName}
                          onChange={setMilestoneName}
                          onLocationSelect={(location) => {
                            setMilestoneName(location.name);
                            setMilestoneCoords({ lat: location.latitude, lng: location.longitude });
                          }}
                          placeholder="Search or type location name..."
                        />

                        {milestoneCoords && (
                          <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-xl">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">Will appear on map</span>
                            <button 
                              onClick={() => setMilestoneCoords(null)}
                              className="ml-auto text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Optional notes */}
                        <Input
                          value={milestoneNotes}
                          onChange={(e) => setMilestoneNotes(e.target.value)}
                          placeholder="Quick note (optional)..."
                          className="h-12"
                        />

                        <Button 
                          onClick={handleAddMilestone}
                          className="w-full gradient-sunset h-12 text-base"
                          disabled={!milestoneName.trim()}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add Spot
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Finish Tab */}
              {activeTab === 'finish' && (
                <div className="space-y-6">
                  {/* Trip Summary */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="font-display text-2xl font-bold text-primary">{activeTrip.currentMiles.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Miles</p>
                      </div>
                      <div>
                        <p className="font-display text-2xl font-bold">{activeTrip.daysOnRoad}</p>
                        <p className="text-xs text-muted-foreground">Days</p>
                      </div>
                      <div>
                        <p className="font-display text-2xl font-bold text-secondary">{activeTrip.waypoints.length}</p>
                        <p className="text-xs text-muted-foreground">Stops</p>
                      </div>
                    </div>
                  </div>

                  {/* Route Section */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Calculate your route</p>
                    <p className="text-xs text-muted-foreground">
                      This will determine the states you visited automatically
                    </p>
                    
                    {/* Start */}
                    <div className="relative">
                      <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                        <span className="text-primary-foreground text-xs font-bold">S</span>
                      </div>
                      <LocationSearch
                        value={startLocationText}
                        onChange={(v) => { setStartLocationText(v); setRouteData(null); }}
                        onLocationSelect={(loc) => { setStartLocation(loc); setRouteData(null); }}
                        placeholder="Where did you start?"
                        className="pl-12"
                      />
                    </div>

                    {/* Show logged stops */}
                    {activeTrip.waypoints.length > 0 && (
                      <div className="pl-12 py-2 text-sm text-muted-foreground">
                        + {activeTrip.waypoints.length} logged stop{activeTrip.waypoints.length > 1 ? 's' : ''} will be included
                      </div>
                    )}
                    
                    {/* End */}
                    <div className="relative">
                      <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center z-10">
                        <span className="text-secondary-foreground text-xs font-bold">E</span>
                      </div>
                      <LocationSearch
                        value={endLocationText}
                        onChange={(v) => { setEndLocationText(v); setRouteData(null); }}
                        onLocationSelect={(loc) => { setEndLocation(loc); setRouteData(null); }}
                        placeholder="Where did you end up?"
                        className="pl-12"
                      />
                    </div>

                    {startLocation && endLocation && !routeData && (
                      <Button
                        variant="outline"
                        onClick={handleFetchRoute}
                        disabled={isLoadingRoute}
                        className="w-full h-12"
                      >
                        {isLoadingRoute ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Navigation className="w-4 h-4 mr-2" />
                            Calculate Route
                          </>
                        )}
                      </Button>
                    )}

                    {routeData && (
                      <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-secondary" />
                          <span className="font-medium text-secondary">Route ready!</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatRouteMiles(routeData.distance)} miles</span>
                          <span>•</span>
                          <span>{formatRouteDuration(routeData.duration)}</span>
                        </div>
                        {derivedStates.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {derivedStates.map(state => (
                              <span key={state} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                                {state}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Share your story</p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us about your journey..."
                      rows={3}
                      className="w-full px-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base"
                    />
                  </div>

                  {/* Privacy */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Who can see this?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {privacyOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPrivacy(option.value)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            privacy === option.value
                              ? 'bg-primary/20 border-2 border-primary'
                              : 'bg-muted border-2 border-transparent hover:border-muted-foreground/20'
                          }`}
                        >
                          <div className={`mx-auto mb-1 ${privacy === option.value ? 'text-primary' : 'text-muted-foreground'}`}>
                            {option.icon}
                          </div>
                          <p className={`text-sm font-medium ${privacy === option.value ? 'text-primary' : 'text-foreground'}`}>
                            {option.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handleEndTrip}
                    disabled={isSubmitting}
                    className="w-full h-14 gradient-forest text-base font-display font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Flag className="w-5 h-5 mr-2" />
                        Complete Trip
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
