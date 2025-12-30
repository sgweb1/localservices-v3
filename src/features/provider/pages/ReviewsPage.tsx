import React, { useMemo, useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { Star, TrendingUp, MessageCircle, Filter, ThumbsUp, Award } from 'lucide-react';
import { PageTitle, Text, Caption, StatValue, EmptyText } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiPost } from '@/utils/apiHelpers';

/**
 * Reviews Page - dopracowana wersja z lepszym designem
 * 
 * Średnia rating, statystyki, trendy, filtry, lista opinii z możliwością odpowiedzi.
 */
export const ReviewsPage: React.FC = () => {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [page, setPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});

  const { data, isLoading, error, refetch, isRefetching } = useReviews(filterRating, page, showUnanswered);
  const items = data?.data ?? [];
  const avgRating = data?.averageRating ?? 0;
  const totalReviews = data?.totalReviews ?? 0;
  const distribution = data?.distribution ?? {};

  const ratingBreakdown = useMemo(() => ({
    5: distribution['5'] ?? 0,
    4: distribution['4'] ?? 0,
    3: distribution['3'] ?? 0,
    2: distribution['2'] ?? 0,
    1: distribution['1'] ?? 0,
  }), [distribution]);

  const filteredItems = items; // filtrowanie realizuje API (rating param)
  const currentPage = data?.meta?.current_page ?? 1;
  const lastPage = data?.meta?.last_page ?? 1;
  const total = data?.meta?.total ?? totalReviews;
  const perPage = data?.meta?.per_page ?? 20;

  console.log('Pagination debug:', { currentPage, lastPage, total, perPage, itemsLength: items.length });

  const handleFilterChange = (stars: number | null) => {
    console.log('Filter change:', { current: filterRating, new: stars });
    setFilterRating(stars);
    setPage(1); // Reset do strony 1 przy zmianie filtra
  };

  const toggleHelpful = (id: number) => {
    setHelpful((prev) => {
      if (prev[id]) return prev; // tylko front, bez backendu
      return { ...prev, [id]: true };
    });
  };

  const handleReplyChange = (id: number, value: string) => {
    setReplyTexts((prev) => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = async (id: number) => {
    const payload = replyTexts[id]?.trim();
    if (!payload) {
      toast.error('Wpisz odpowiedź');
      return;
    }

    try {
      const res = await apiPost(`/api/v1/provider/reviews/${id}/response`, {
        response: payload,
      });

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('Już odpowiedziałeś na tę opinię');
        } else {
          const msg = `Błąd API (${res.status})`;
          toast.error(msg);
        }
        return;
      }

      toast.success('Odpowiedź zapisana');
      setReplyingTo(null);
      setReplyTexts((prev) => ({ ...prev, [id]: '' }));
      await refetch();
    } catch (e) {
      toast.error('Błąd sieci');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 border border-amber-100 dark:border-amber-900/30 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⭐</span>
            <PageTitle className="text-gray-900 dark:text-gray-100">Opinie klientów</PageTitle>
          </div>
          <Text muted size="sm">Monitoruj swoją reputację, odpowiadaj na feedback i buduj zaufanie</Text>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Średnia ocena */}
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <Text muted size="sm">Średnia ocena</Text>
          </div>
          <div className="flex items-baseline gap-2">
            <StatValue className="text-3xl font-bold text-amber-600">{avgRating.toFixed(1)}</StatValue>
            <Text muted size="sm">/ 5.0</Text>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(avgRating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Łączna liczba */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <Text muted size="sm">Łączna liczba</Text>
          </div>
          <StatValue className="text-3xl font-bold text-blue-600">{totalReviews}</StatValue>
          <Caption muted className="mt-2">opinii od klientów</Caption>
        </Card>

        {/* Trend */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <Text muted size="sm">Trend (30 dni)</Text>
          </div>
          <div className="flex items-baseline gap-2">
            <StatValue className="text-3xl font-bold text-emerald-600">+0.3</StatValue>
            <Text muted size="sm">punktu</Text>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              ↗ Rośnie
            </div>
          </div>
        </Card>

        {/* Wskaźnik jakości */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <Text muted size="sm">Jakość</Text>
          </div>
          <StatValue className="text-3xl font-bold text-purple-600">{Math.round(avgRating * 20)}%</StatValue>
          <Caption muted className="mt-2">zadowolenia klientów</Caption>
        </Card>
      </div>

      {/* Rating Breakdown */}
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">📊 Rozkład ocen</Text>
              <Text muted size="sm">Szczegółowa analiza wszystkich opinii</Text>
            </div>
          </div>
          
          {/* Filtry szybkie */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterRating === null && !showUnanswered ? 'primary' : 'info'}
              size="sm"
              onClick={() => { setFilterRating(null); setShowUnanswered(false); setPage(1); }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Wszystkie ({totalReviews})
            </Button>
            <Button
              variant={showUnanswered ? 'warning' : 'info'}
              size="sm"
              onClick={() => { setShowUnanswered(!showUnanswered); setFilterRating(null); setPage(1); }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Bez odpowiedzi
            </Button>
            {[5, 4, 3, 2, 1].map(stars => {
              const count = ratingBreakdown[stars as keyof typeof ratingBreakdown] || 0;
              if (count === 0) return null;
              return (
                <Button
                  key={stars}
                  variant={filterRating === stars ? 'primary' : 'info'}
                  size="sm"
                  onClick={() => handleFilterChange(stars)}
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: stars }, (_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                    ))}
                    <span className="ml-1">({count})</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

          <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = ratingBreakdown[stars as keyof typeof ratingBreakdown] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <button
                key={stars}
                onClick={() => handleFilterChange(stars)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                  filterRating === stars
                    ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 ring-2 ring-cyan-200'
                    : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1 w-20">
                  {Array.from({ length: stars }, (_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 min-w-[100px] justify-end">
                  <Text size="sm" className="font-semibold text-gray-900 dark:text-gray-100">{count}</Text>
                  <Text muted size="sm" className="text-xs">({percentage.toFixed(0)}%)</Text>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Filtry i nagłówek listy */}
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">💬 Lista opinii</Text>
          <Text muted size="sm">
            {filterRating ? `Wyświetlam opinie z ${filterRating} gwiazdkami` : `Wszystkie opinie (${filteredItems.length})`}
          </Text>
        </div>
        {filterRating && (
          <Button variant="ghost" size="sm" onClick={() => setFilterRating(null)} className="text-cyan-600">
            ✕ Wyczyść filtr
          </Button>
        )}
      </div>

      {/* Lista opinii */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading && (
            <div className="px-6 py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-cyan-500 mb-4" />
              <EmptyText>Ładowanie opinii...</EmptyText>
            </div>
          )}
          {error && !isLoading && (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl mb-4">❌</div>
              <EmptyText className="text-red-600 font-semibold">Błąd ładowania opinii</EmptyText>
              <Text muted size="sm" className="mt-2">Spróbuj odświeżyć stronę</Text>
            </div>
          )}
          {!isLoading && filteredItems.map((r, idx) => (
            <div
              key={r.id}
              className="px-6 py-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar z gradientem */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {r.customerName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Text className="font-semibold text-gray-900 dark:text-gray-100">{r.customerName}</Text>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 transition-all ${
                                i < r.rating ? 'text-amber-500 fill-amber-500 scale-110' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                          {r.rating}/5
                        </span>
                      </div>
                    </div>
                    <Caption muted className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{r.date}</Caption>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-3 space-y-3">
                    <Text size="sm" className="text-gray-700 dark:text-gray-300 leading-relaxed">{r.comment}</Text>
                    {r.response && (
                      <div className="border border-cyan-100 dark:border-cyan-900/50 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1 text-cyan-700 dark:text-cyan-300 text-sm font-semibold">
                          <MessageCircle className="w-4 h-4" />
                          Twoja odpowiedź
                          <Caption muted className="ml-2">{new Date(r.response.updated_at).toLocaleString()}</Caption>
                        </div>
                        <Text size="sm" className="text-gray-800 dark:text-gray-200">{r.response.response}</Text>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {!r.response && replyingTo === r.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Napisz odpowiedź..."
                          className="flex-1 px-4 py-2 border-2 border-cyan-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                          autoFocus
                          value={replyTexts[r.id] || ''}
                          onChange={(e) => handleReplyChange(r.id, e.target.value)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleReplySubmit(r.id)}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500"
                        >
                          Wyślij
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                          Anuluj
                        </Button>
                      </div>
                    ) : (
                      <>
                        {!r.response && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReplyingTo(r.id)}
                            className="font-semibold"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Odpowiedz
                          </Button>
                        )}
                        <button
                          onClick={() => toggleHelpful(r.id)}
                          disabled={helpful[r.id]}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                            helpful[r.id]
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{helpful[r.id] ? 'Dodano' : 'Pomocne'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && filteredItems.length === 0 && !error && (
            <div className="px-6 py-16 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <Text className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2">
                {filterRating ? `Brak opinii z ${filterRating} gwiazdkami` : 'Brak opinii'}
              </Text>
              <Text size="sm" muted className="max-w-md mx-auto">
                {filterRating
                  ? 'Zmień filtr, aby zobaczyć inne opinie'
                  : 'Poproś klientów o feedback po zrealizowanych usługach. Pozytywne opinie budują zaufanie i zwiększają konwersje!'}
              </Text>
              {filterRating && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterRating(null)}
                  className="mt-4 font-semibold"
                >
                  Pokaż wszystkie opinie
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {!isLoading && filteredItems.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isRefetching}
                className="font-semibold"
              >
                ← Poprzednia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage || isRefetching}
                className="font-semibold"
              >
                Następna →
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Text muted size="sm" className="text-xs">
                Strona {currentPage} z {lastPage} • {perPage} na stronie
              </Text>
              <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                {total} {total === 1 ? 'opinia' : total < 5 ? 'opinie' : 'opinii'}
              </span>
            </div>
          </div>

          {/* Page numbers */}
          {lastPage > 1 && lastPage <= 10 && (
            <div className="flex items-center justify-center gap-1 mt-3">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={isRefetching}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    pageNum === currentPage
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tips Section */}
      {!isLoading && totalReviews > 0 && (
        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200 dark:border-cyan-800">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <Text className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Wskazówki dotyczące opinii</Text>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">✓</span>
                  <Text size="sm" muted>Odpowiadaj na wszystkie opinie w ciągu 24h - zwiększa to Trust Score</Text>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">✓</span>
                  <Text size="sm" muted>Dziękuj za pozytywny feedback i profesjonalnie reaguj na krytykę</Text>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">✓</span>
                  <Text size="sm" muted>Wykorzystuj opinie do poprawy jakości swoich usług</Text>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReviewsPage;
