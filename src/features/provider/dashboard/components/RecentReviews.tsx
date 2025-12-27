import React from 'react';
import { Star, User, Quote, ChevronRight } from 'lucide-react';
import { useRecentReviews } from '../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Ostatnie recenzje
 */
export const RecentReviews: React.FC = () => {
  const { data, isLoading } = useRecentReviews(4);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // Dane ze zhaká
  const reviews = data?.data || [];

  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Ostatnie recenzje
        </h3>
        <Link
          to="/provider/reviews"
          className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
        >
          Wszystkie <ChevronRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {reviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>Brak recenzji</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <User size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {review.customer_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {review.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-gray-300 dark:text-gray-600"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Quote size={16} className="text-primary-400 flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
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
