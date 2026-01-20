import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gauge, MapPin, FileText, Image } from 'lucide-react';
import { useTrip } from '@/context/TripContext';

interface UpdateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

type TabType = 'miles' | 'states' | 'notes' | 'photos';

export const UpdateTripModal = ({ isOpen, onClose }: UpdateTripModalProps) => {
  const { activeTrip, updateMiles, addState, updateNotes, addPhoto } = useTrip();
  const [activeTab, setActiveTab] = useState<TabType>('miles');
  const [milesInput, setMilesInput] = useState('');
  const [notesInput, setNotesInput] = useState(activeTrip?.notes || '');
  const [photoUrl, setPhotoUrl] = useState('');

  if (!activeTrip) return null;

  const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: 'miles', icon: <Gauge className="w-4 h-4" />, label: 'Miles' },
    { id: 'states', icon: <MapPin className="w-4 h-4" />, label: 'States' },
    { id: 'notes', icon: <FileText className="w-4 h-4" />, label: 'Notes' },
    { id: 'photos', icon: <Image className="w-4 h-4" />, label: 'Photos' },
  ];

  const handleUpdateMiles = () => {
    const miles = parseInt(milesInput);
    if (!isNaN(miles) && miles >= 0) {
      updateMiles(miles);
      setMilesInput('');
    }
  };

  const handleAddState = (state: string) => {
    addState(state);
  };

  const handleSaveNotes = () => {
    updateNotes(notesInput);
  };

  const handleAddPhoto = () => {
    if (photoUrl.trim()) {
      addPhoto(photoUrl.trim());
      setPhotoUrl('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 bg-card rounded-t-3xl p-6 z-50 card-elevated max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-muted rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">Update Trip</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'gradient-sunset text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'miles' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Current odometer: <span className="font-semibold text-foreground">{activeTrip.currentMiles.toLocaleString()} miles</span>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={milesInput}
                      onChange={(e) => setMilesInput(e.target.value)}
                      placeholder="Enter total miles"
                      className="flex-1 px-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleUpdateMiles}
                      className="px-6 py-3 gradient-sunset text-primary-foreground font-medium rounded-xl"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'states' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tap states you've visited on this trip
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {US_STATES.map((state) => {
                      const isVisited = activeTrip.statesVisited.includes(state);
                      return (
                        <button
                          key={state}
                          onClick={() => handleAddState(state)}
                          disabled={isVisited}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isVisited
                              ? 'bg-secondary/20 text-secondary border border-secondary/30'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                          }`}
                        >
                          {state}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Write your travel notes, memories, tips..."
                    rows={6}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="w-full py-3 gradient-sunset text-primary-foreground font-medium rounded-xl"
                  >
                    Save Notes
                  </button>
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Add photo URLs to your trip ({activeTrip.photos.length} photos added)
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Paste image URL..."
                      className="flex-1 px-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleAddPhoto}
                      className="px-6 py-3 gradient-sunset text-primary-foreground font-medium rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  
                  {activeTrip.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {activeTrip.photos.map((photo, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={photo} alt={`Trip photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
