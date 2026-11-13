import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Star, X, Loader2 } from 'lucide-react';

export default function ReviewModal({ material, onClose, onReviewAdded }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast('Please select a star rating.', 'error');
    setLoading(true);

    const { error } = await supabase.from('reviews').upsert({
      material_id: material.id,
      user_id: user.id,
      rating,
      comment
    }, { onConflict: 'material_id, user_id' });

    if (error) {
      toast(error.message, 'error');
    } else {
      // Award 10 XP for leaving a review
      await supabase.rpc('award_xp', { target_user_id: user.id, amount: 10 });
      toast('Review submitted! +10 XP', 'success');
      onReviewAdded();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 backdrop-enter">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="glass rounded-3xl p-8 max-w-md w-full relative z-10 modal-enter border-teal/20">
        <button onClick={onClose} className="absolute top-5 right-5 text-muted hover:text-white"><X size={20} /></button>
        
        <h3 className="font-display text-2xl font-bold mb-2">Rate this material</h3>
        <p className="text-sm text-muted mb-6 truncate">{material.title}</p>

        <form onSubmit={submitReview} className="flex flex-col gap-5">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star 
                  size={36} 
                  className={`${(hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} transition-colors`} 
                />
              </button>
            ))}
          </div>

          <textarea
            className="input resize-none"
            rows={3}
            placeholder="What did you think of this material? (Optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Review (+10 XP)'}
          </button>
        </form>
      </div>
    </div>
  );
}