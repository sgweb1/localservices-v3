import React, { useEffect } from 'react';
import { Star, User, Quote, ChevronRight } from 'lucide-react';
import { useRecentReviews } from '../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import '@/lib/echo';

type RecentReview = {
  id: string | number;
  customer_name: string;
  date: string;
  rating: number;
  comment: string;
};

/**
 * Ostatnie recenzje
 */
export const RecentReviews: React.FC = () => {
  const { data, isLoading } = useRecentReviews(4);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Realtime: odśwież po nowej recenzji
  useEffect(() => {
    if (!user?.id || !window.Echo) return;
    const channel = window.Echo.private(`user.${user.id}`);
    const handler = (payload: any) => {
      try {
        if (payload?.metadata?.event === 'review.created') {
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'reviews'] });
        }
      } catch (_) {}
    };
    channel.listen('NotificationToast', handler);
    return () => { try { channel.stopListening('NotificationToast'); } catch (_) {} };
  }, [user?.id, queryClient]);

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-200/70 bg-white/80 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  // Dane ze zhaká
  const reviews = (data?.data as RecentReview[]) || [];

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/70 bg-white/80 shadow-sm">
      <div className="p-6 border-b border-slate-200/70 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">
          Ostatnie recenzje
        </h3>
        <Link
          to="/provider/reviews"
          className="text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-md transition-all"
        >
          Wszystkie <ChevronRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {!reviews || reviews.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <p>Brak recenzji</p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div
              key={review.id}
              className="p-5 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center shadow-sm">
                    <User size={18} className="text-cyan-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {review.customer_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {review.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-slate-300"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Quote size={16} className="text-cyan-400 flex-shrink-0 mt-1" />
                <p className="text-sm text-slate-700 italic">
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
