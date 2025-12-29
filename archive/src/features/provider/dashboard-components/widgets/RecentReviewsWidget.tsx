import React from 'react';
import { Star } from 'lucide-react';

/**
 * Recent Reviews Widget - zgodny z localservices
 * 
 * Pokazuje ostatnie opinie od klientów z ratingiem.
 */
export const RecentReviewsWidget: React.FC = () => {
  // Mock data - zamienić na API
  const reviews = [
    { id: 1, customer: 'Anna Nowak', rating: 5, comment: 'Bardzo profesjonalna obsługa!', date: '2024-01-15' },
    { id: 2, customer: 'Jan Kowalski', rating: 4, comment: 'Dobra robota, polecam.', date: '2024-01-14' },
    { id: 3, customer: 'Maria Wiśniewska', rating: 5, comment: 'Rewelacja! Na pewno wrócę.', date: '2024-01-13' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
        <h3 className="text-lg font-bold text-gray-900">Ostatnie opinie</h3>
      </div>

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="p-4 border border-gray-100 rounded-xl bg-white/70">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900">{review.customer}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-700">{review.comment}</p>
            <p className="text-xs text-gray-500 mt-2">{review.date}</p>
          </div>
        ))}
        
        {reviews.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">Brak opinii</p>
          </div>
        )}
      </div>
    </div>
  );
};
