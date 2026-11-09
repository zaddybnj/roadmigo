import { US_STATES } from '@/lib/states';
import { useState } from 'react';
import { Gauge, MapPin, FileText, Image, Plus, Landmark, X, Navigation, Trash2 } from 'lucide-react';
import { useTrip, Waypoint } from '@/context/TripContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MILESTONE_CATEGORIES, getCategoryInfo, Milestone, MilestoneCategory } from '@/types/milestone';
import { LocationSearch } from '@/components/LocationSearch';

interface UpdateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export const UpdateTripModal = ({ isOpen, onClose }: UpdateTripModalProps) => {
  const { activeTrip, updateMiles, addState, updateNotes, addPhoto, addMilestone, removeMilestone, addRouteStop, removeRouteStop } = useTrip();
  const { toast } = useToast();
  const [milesInput, setMilesInput] = useState('');
  const [notesInput, setNotesInput] = useState(activeTrip?.notes || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('miles');
  
  // Milestone form state
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneCategory, setMilestoneCategory] = useState<MilestoneCategory>('national_park');
  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [milestoneCoords, setMilestoneCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Route stop form state
  const [stopName, setStopName] = useState('');
  const [stopCoords, setStopCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (!activeTrip) return null;

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

  const handleQuickAddMiles = async (amount: number) => {
    const newMiles = activeTrip.currentMiles + amount;
    await updateMiles(newMiles);
    toast({
      title: 'Miles added',
      description: `+${amount} miles (total: ${newMiles.toLocaleString()})`,
    });
  };

  const handleToggleState = async (stateCode: string) => {
    if (!activeTrip.statesVisited.includes(stateCode)) {
      await addState(stateCode);
      toast({
        title: 'State added',
        description: `${stateCode} added to your trip`,
      });
    }
  };

  const handleSaveNotes = async () => {
    await updateNotes(notesInput);
    toast({
      title: 'Notes saved',
      description: 'Your trip notes have been updated',
    });
  };

  const handleAddPhoto = async () => {
    if (photoUrl.trim()) {
      await addPhoto(photoUrl.trim());
      toast({
        title: 'Photo added',
        description: 'Photo has been added to your trip',
      });
      setPhotoUrl('');
    }
  };

  const handleAddMilestone = async () => {
    const trimmedName = milestoneName.trim().slice(0, 100);
    if (!trimmedName) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for this milestone',
        variant: 'destructive',
      });
      return;
    }

    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      name: trimmedName,
      category: milestoneCategory,
      notes: milestoneNotes.trim().slice(0, 200) || undefined,
      timestamp: new Date().toISOString(),
      latitude: milestoneCoords?.lat,
      longitude: milestoneCoords?.lng,
    };

    await addMilestone(newMilestone);
    toast({
      title: 'Milestone added!',
      description: `${getCategoryInfo(milestoneCategory).icon} ${milestoneName} added to your trip${milestoneCoords ? ' with map pin' : ''}`,
    });
    
    setMilestoneName('');
    setMilestoneNotes('');
    setMilestoneCoords(null);
  };

  const handleRemoveMilestone = async (id: string, name: string) => {
    await removeMilestone(id);
    toast({
      title: 'Milestone removed',
      description: `${name} removed from your trip`,
    });
  };

  const handleAddRouteStop = async () => {
    if (!stopName.trim() || !stopCoords) {
      toast({
        title: 'Location required',
        description: 'Please search and select a location for this stop',
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

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-display text-xl">Update Trip</DrawerTitle>
          <DrawerDescription>
            Log your progress for "{activeTrip.title}"
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="miles" className="flex items-center gap-1.5 text-xs">
                <Gauge className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Miles</span>
              </TabsTrigger>
              <TabsTrigger value="route" className="flex items-center gap-1.5 text-xs">
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Route</span>
              </TabsTrigger>
              <TabsTrigger value="states" className="flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">States</span>
              </TabsTrigger>
              <TabsTrigger value="milestones" className="flex items-center gap-1.5 text-xs">
                <Landmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Spots</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-1.5 text-xs">
                <Image className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="miles" className="space-y-4 mt-0">
              {/* Current odometer display */}
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Current Odometer</p>
                <p className="font-display text-3xl font-bold text-primary">
                  {activeTrip.currentMiles.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">miles</p>
              </div>

              {/* Quick add buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick Add</p>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAddMiles(amount)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Manual entry */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Set Total Miles</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={milesInput}
                    onChange={(e) => setMilesInput(e.target.value)}
                    placeholder="Enter total miles..."
                    className="flex-1"
                  />
                  <Button onClick={handleUpdateMiles} className="gradient-sunset">
                    Update
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Route Stops Tab */}
            <TabsContent value="route" className="space-y-4 mt-0">
              {/* Current stops */}
              {activeTrip.waypoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Stops logged ({activeTrip.waypoints.length})
                  </p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {activeTrip.waypoints.map((stop, index) => (
                      <div 
                        key={stop.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-foreground text-xs font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{stop.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(stop.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveRouteStop(stop.id, stop.name)}
                          className="p-1.5 hover:bg-destructive/20 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new stop */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Add a stop to your route</p>
                
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
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/20 rounded-lg text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-primary">📍 Location selected</span>
                    <button 
                      onClick={() => { setStopCoords(null); setStopName(''); }}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <Button 
                  onClick={handleAddRouteStop}
                  className="w-full gradient-sunset"
                  disabled={!stopName.trim() || !stopCoords}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stop
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Stops will appear on your trip map and can be used to calculate your route when you end the trip.
              </p>
            </TabsContent>

            <TabsContent value="states" className="space-y-4 mt-0">
              {/* Visited states */}
              {activeTrip.statesVisited.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Visited ({activeTrip.statesVisited.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeTrip.statesVisited.map((stateCode) => {
                      const state = US_STATES.find(s => s.code === stateCode);
                      return (
                        <span
                          key={stateCode}
                          className="px-3 py-1.5 bg-secondary/20 text-secondary text-sm font-medium rounded-full border border-secondary/30 flex items-center gap-1.5"
                        >
                          {stateCode}
                          <span className="text-xs text-secondary/70">✓</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add states */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Tap to add states
                </p>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                  {US_STATES.filter(s => !activeTrip.statesVisited.includes(s.code)).map((state) => (
                    <button
                      key={state.code}
                      onClick={() => handleToggleState(state.code)}
                      className="px-3 py-1.5 bg-muted text-muted-foreground text-sm font-medium rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      {state.code}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-4 mt-0">
              {/* Current milestones */}
              {activeTrip.milestones.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Added ({activeTrip.milestones.length})
                  </p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {activeTrip.milestones.map((milestone) => {
                      const catInfo = getCategoryInfo(milestone.category);
                      return (
                        <div 
                          key={milestone.id}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <span className="text-xl">{catInfo.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{milestone.name}</p>
                            <p className="text-xs text-muted-foreground">{catInfo.label}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveMilestone(milestone.id, milestone.name)}
                            className="p-1.5 hover:bg-destructive/20 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add new milestone */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Add New Location</p>
                
                {/* Category selection */}
                <div className="flex flex-wrap gap-2">
                  {MILESTONE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setMilestoneCategory(cat.value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                        milestoneCategory === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Location search with geocoding */}
                <LocationSearch
                  value={milestoneName}
                  onChange={setMilestoneName}
                  onLocationSelect={(location) => {
                    setMilestoneName(location.name);
                    setMilestoneCoords({ lat: location.latitude, lng: location.longitude });
                  }}
                  placeholder={`Search for ${getCategoryInfo(milestoneCategory).label.toLowerCase()}...`}
                />

                {/* Location indicator */}
                {milestoneCoords && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/20 rounded-lg text-sm">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span className="text-secondary">📍 Location pinned to map</span>
                    <button 
                      onClick={() => setMilestoneCoords(null)}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Optional notes */}
                <Textarea
                  value={milestoneNotes}
                  onChange={(e) => setMilestoneNotes(e.target.value)}
                  maxLength={200}
                  placeholder="Add notes (optional)..."
                  rows={2}
                  className="resize-none"
                />

                <Button 
                  onClick={handleAddMilestone}
                  className="w-full gradient-sunset"
                  disabled={!milestoneName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {getCategoryInfo(milestoneCategory).label}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-0">
              <Textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                maxLength={2000}
                placeholder="Write your travel notes, memories, favorite spots, tips for other travelers..."
                rows={8}
                className="resize-none"
              />
              <Button onClick={handleSaveNotes} className="w-full gradient-sunset">
                Save Notes
              </Button>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4 mt-0">
              <p className="text-sm text-muted-foreground">
                Add photo URLs to your trip ({activeTrip.photos.length} photos)
              </p>
              
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="flex-1"
                />
                <Button onClick={handleAddPhoto} className="gradient-sunset">
                  Add
                </Button>
              </div>

              {activeTrip.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {activeTrip.photos.slice(0, 6).map((photo, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={photo} 
                        alt={`Trip photo ${i + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  ))}
                  {activeTrip.photos.length > 6 && (
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        +{activeTrip.photos.length - 6} more
                      </span>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
