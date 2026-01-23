import { useState } from 'react';
import { Gauge, MapPin, FileText, Image, Plus, Landmark, X } from 'lucide-react';
import { useTrip } from '@/context/TripContext';
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

interface UpdateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

export const UpdateTripModal = ({ isOpen, onClose }: UpdateTripModalProps) => {
  const { activeTrip, updateMiles, addState, updateNotes, addPhoto, addMilestone, removeMilestone } = useTrip();
  const { toast } = useToast();
  const [milesInput, setMilesInput] = useState('');
  const [notesInput, setNotesInput] = useState(activeTrip?.notes || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('miles');
  
  // Milestone form state
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneCategory, setMilestoneCategory] = useState<MilestoneCategory>('national_park');
  const [milestoneNotes, setMilestoneNotes] = useState('');

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
    if (!milestoneName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for this milestone',
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
    };

    await addMilestone(newMilestone);
    toast({
      title: 'Milestone added!',
      description: `${getCategoryInfo(milestoneCategory).icon} ${milestoneName} added to your trip`,
    });
    
    setMilestoneName('');
    setMilestoneNotes('');
  };

  const handleRemoveMilestone = async (id: string, name: string) => {
    await removeMilestone(id);
    toast({
      title: 'Milestone removed',
      description: `${name} removed from your trip`,
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
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="miles" className="flex items-center gap-1.5 text-xs">
                <Gauge className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Miles</span>
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

                {/* Name input */}
                <Input
                  value={milestoneName}
                  onChange={(e) => setMilestoneName(e.target.value)}
                  placeholder={`Enter ${getCategoryInfo(milestoneCategory).label.toLowerCase()} name...`}
                  className="w-full"
                />

                {/* Optional notes */}
                <Textarea
                  value={milestoneNotes}
                  onChange={(e) => setMilestoneNotes(e.target.value)}
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
