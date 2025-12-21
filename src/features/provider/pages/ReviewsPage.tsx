import React from 'react';
import { useReviews } from '../dashboard/hooks/useReviews';
import { Star, TrendingUp } from 'lucide-react';
import { PageTitle, Text, Caption, StatValue, EmptyText } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';

/**
 * Reviews Page - zgodny z localservices
 * 
 * Średnia rating, łączna liczba, lista opinii z avatarami.
 */
export const ReviewsPage: React.FC = () => {
  const { data, isLoading, error } = useReviews();
  const items = data?.data ?? [];
  const avgRating = data?.averageRating ?? 0;
  const totalReviews = data?.totalReviews ?? 0;

  return (
    <div className="space-y-6">
      {/* Header ze statystykami */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle gradient>Opinie klientów</PageTitle>
            <Text muted size="sm" className="mt-2">Monitoruj swoją reputację i odpowiadaj na feedback</Text>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
              <StatValue gradient className="text-4xl">{avgRating.toFixed(1)}</StatValue>
            </div>
            <Caption muted>{totalReviews} opinii</Caption>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="mt-6 grid grid-cols-5 gap-2">
          {[5,4,3,2,1].map(stars => (
            <div key={stars} className="text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                {Array.from({ length: stars }, (_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <Caption muted>0</Caption>
            </div>
          ))}
        </div>
      </Card>

      {/* Lista opinii */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="px-6 py-12 text-center"><EmptyText>Ładowanie...</EmptyText></div>
          )}
          {error && !isLoading && (
            <div className="px-6 py-12 text-center"><EmptyText className="text-red-600">Błąd ładowania opinii</EmptyText></div>
          )}
          {!isLoading && items.map(r => (
            <div key={r.id} className="px-6 py-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold">
                  {r.customerName.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{r.customerName}</p>
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
                    </div>
                    <span className="text-xs text-gray-500">{r.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                  
                  {/* Odpowiedz button */}
                  <button className="mt-3 text-sm text-cyan-600 hover:text-cyan-800 font-medium">
                    Odpowiedz
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && items.length===0 && (
            <div className="px-6 py-12 text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Brak opinii</p>
              <p className="text-sm text-gray-400 mt-1">Poproś klientów o feedback po zrealizowanych usługach</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReviewsPage;
