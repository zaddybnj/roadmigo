import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Link, Camera } from 'lucide-react';

interface PhotoUploaderProps {
  onPhotosAdd: (photos: string[]) => void;
  maxPhotos?: number;
  currentCount?: number;
}

export const PhotoUploader = ({ onPhotosAdd, maxPhotos = 20, currentCount = 0 }: PhotoUploaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = maxPhotos - currentCount;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUrls: string[] = [];
    const filesToProcess = Math.min(files.length, remainingSlots - urls.length);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      }
    }

    setUrls(prev => [...prev, ...newUrls]);
  };

  const handleUrlAdd = () => {
    if (urlInput.trim() && urls.length < remainingSlots) {
      // Basic URL validation
      try {
        new URL(urlInput);
        setUrls(prev => [...prev, urlInput.trim()]);
        setUrlInput('');
      } catch {
        // Invalid URL
      }
    }
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (urls.length > 0) {
      onPhotosAdd(urls);
      setUrls([]);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={remainingSlots <= 0}
        className="flex items-center gap-2 px-4 py-3 rounded-xl gradient-sunset text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Camera className="w-5 h-5" />
        Add Photos
        {remainingSlots > 0 && (
          <span className="text-xs opacity-80">({remainingSlots} left)</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl">Add Photos</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Upload Options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-muted/50 border-2 border-dashed border-border hover:border-primary hover:bg-muted transition-colors"
                >
                  <Upload className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium">Upload Files</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-muted/50 border-2 border-dashed border-border hover:border-secondary hover:bg-muted transition-colors"
                >
                  <Camera className="w-8 h-8 text-secondary" />
                  <span className="text-sm font-medium">Take Photo</span>
                  <span className="text-xs text-muted-foreground">Use camera</span>
                </button>
              </div>

              {/* URL Input */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">Or paste image URL</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlAdd()}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={handleUrlAdd}
                    disabled={!urlInput.trim() || urls.length >= remainingSlots}
                    className="px-4 py-3 bg-secondary text-secondary-foreground font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Preview Grid */}
              {urls.length > 0 && (
                <div className="flex-1 overflow-y-auto mb-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    {urls.length} photo{urls.length !== 1 ? 's' : ''} ready to add
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {urls.map((url, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveUrl(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={urls.length === 0}
                className="w-full py-4 rounded-xl gradient-sunset text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center justify-center gap-2">
                  <Image className="w-5 h-5" />
                  Add {urls.length || ''} Photo{urls.length !== 1 ? 's' : ''} to Trip
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
