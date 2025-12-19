import React from 'react';
import { useReviews } from '../hooks/useReviews';
import { Star } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const { data, isLoading, error } = useReviews();
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Opinie</h1>
        {data && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-xl font-bold text-gray-900">{data.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">({data.totalReviews} opinii)</span>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="px-4 py-6 text-center text-gray-500">Ładowanie...</div>
          )}
          {error && !isLoading && (
            <div className="px-4 py-6 text-center text-error">Błąd ładowania listy</div>
          )}
          {!isLoading && items.map(r => (
            <div key={r.id} className="px-4 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{r.customerName}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
                </div>
                <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">{r.date}</span>
              </div>
            </div>
          ))}
          {!isLoading && items.length===0 && (
            <div className="px-4 py-6 text-center text-gray-500">Brak opinii</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
