import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Trash2, Loader2 } from 'lucide-react';
import { useSocial, Comment } from '@/context/SocialContext';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  tripId: string;
}

export const CommentSection = ({ tripId }: CommentSectionProps) => {
  const { getCommentsForTrip, addComment, deleteComment, likeComment } = useSocial();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      const data = await getCommentsForTrip(tripId);
      setComments(data);
      setLoading(false);
    };
    loadComments();
  }, [tripId, getCommentsForTrip]);

  const displayedComments = showAll ? comments : comments.slice(0, 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    await addComment(tripId, newComment.trim().slice(0, 1000));
    setNewComment('');
    
    // Refresh comments
    const data = await getCommentsForTrip(tripId);
    setComments(data);
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleLike = async (commentId: string) => {
    await likeComment(commentId);
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
          <span className="text-sm">🚐</span>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={1000}
            placeholder="Add a comment..."
            className="w-full py-2 px-3 pr-10 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <AnimatePresence>
        {displayedComments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {comment.userAvatar && comment.userAvatar !== '/placeholder.svg' ? (
                <img src={comment.userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">👤</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      comment.isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span className={comment.isLiked ? 'text-primary' : 'text-muted-foreground'}>
                    {comment.likes}
                  </span>
                </button>
                {user && comment.userId === user.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Show More */}
      {comments.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-primary font-medium"
        >
          View all {comments.length} comments
        </button>
      )}

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};
