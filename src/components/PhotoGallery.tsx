import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Share2, Download, Trash2 } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  onDelete?: (index: number) => void;
  editable?: boolean;
}

export const PhotoGallery = ({ photos, onDelete, editable = false }: PhotoGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleShare = async () => {
    if (selectedIndex !== null && navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this trip photo!',
          text: 'From my RV adventure 🚐',
          url: photos[selectedIndex],
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (photos.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center text-muted-foreground">
        <span className="text-4xl mb-2">📷</span>
        <p className="text-sm">No photos yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid Gallery */}
      <div className={`grid gap-2 ${
        photos.length === 1 ? 'grid-cols-1' : 
        photos.length === 2 ? 'grid-cols-2' : 
        photos.length === 3 ? 'grid-cols-2' :
        'grid-cols-3'
      }`}>
        {photos.slice(0, 6).map((photo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden rounded-xl cursor-pointer group ${
              photos.length === 3 && index === 0 ? 'col-span-2 row-span-2' : ''
            } ${photos.length === 1 ? 'aspect-video' : 'aspect-square'}`}
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={photo}
              alt={`Trip photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">View</span>
            </div>

            {/* Delete button for editable mode */}
            {editable && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            )}

            {/* More photos indicator */}
            {index === 5 && photos.length > 6 && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                <span className="text-white font-display font-bold text-2xl">+{photos.length - 6}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation */}
            {selectedIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 z-10 w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            {selectedIndex < photos.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 z-10 w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl max-h-[80vh] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[selectedIndex]}
                alt={`Photo ${selectedIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />

              {/* Bottom bar */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  {selectedIndex + 1} of {photos.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <a
                    href={photos[selectedIndex]}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-4 h-4" />
                    Save
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Thumbnail strip */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-muted/50 backdrop-blur">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden transition-all ${
                    index === selectedIndex ? 'ring-2 ring-primary scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
